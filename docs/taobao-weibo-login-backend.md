# 淘宝、微博扫码登录后端 API 参考实现

---

## 一、淘宝登录

### 接口文档

#### 1. 获取淘宝二维码

**请求**
```
GET /api/login/taobao
```

**响应**
```json
{
  "qrCode": "https://qr.taobao.com/xxxxx",
  "orderId": "taobao_order_xxxxx"
}
```

#### 2. 查询登录状态

**请求**
```
GET /api/login/taobao/query?orderId=taobao_order_xxxxx
```

**响应**
```json
{
  "status": "ok",
  "type": "taobao",
  "currentAuthority": "user"
}
```

---

### 淘宝开放平台配置

1. **注册开发者账号**
   - 访问 https://open.taobao.com/
   - 完成企业认证

2. **创建应用**
   - 进入控制台 → 创建应用
   - 选择"网站应用"
   - 审核通过后获得 AppKey 和 AppSecret

3. **配置授权回调地址**
   - 设置授权回调页面地址

---

### Node.js 参考实现

#### 安装依赖

```bash
npm install top-sdk-json
```

#### 控制器实现

```typescript
// controllers/taobaoController.ts
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import crypto from 'crypto';

// 存储订单状态的 Map（生产环境建议用 Redis）
const taobaoOrderMap = new Map<string, {
  status: 'pending' | 'success';
  userId?: string;
  expireAt: number;
}>();

const TAOBAO_APP_KEY = '你的 AppKey';
const TAOBAO_APP_SECRET = '你的 AppSecret';

/**
 * 生成淘宝二维码
 * 参考文档：https://open.taobao.com/doc.htm?docId=102635
 */
export async function getTaobaoQrCode(req: Request, res: Response) {
  try {
    const orderId = `taobao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 调用淘宝 API 生成二维码
    // 这里使用的是淘宝 OAuth2.0 授权流程
    const params = {
      app_key: TAOBAO_APP_KEY,
      response_type: 'code',
      redirect_uri: `${process.env.SERVER_URL}/api/login/taobao/callback`,
      state: orderId,
      view: 'qrcode', // 指定返回二维码
    };

    // 生成授权 URL
    const authorizeUrl = 'https://oauth.taobao.com/authorize?' + 
      new URLSearchParams(params).toString();

    // 调用淘宝 API 获取二维码图片 URL
    // 实际项目中需要调用 taobao.user.qrcode.get 接口
    const qrCodeUrl = await fetchQrCodeFromTaobao(orderId);

    // 存储订单状态
    taobaoOrderMap.set(orderId, {
      status: 'pending',
      expireAt: Date.now() + 5 * 60 * 1000, // 5 分钟有效期
    });

    res.json({
      qrCode: qrCodeUrl,
      orderId,
    });
  } catch (error) {
    console.error('获取淘宝二维码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取二维码失败',
    });
  }
}

/**
 * 查询淘宝登录状态
 */
export async function checkTaobaoLoginStatus(req: Request, res: Response) {
  const { orderId } = req.query as { orderId: string };

  if (!orderId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 orderId 参数',
    });
  }

  const order = taobaoOrderMap.get(orderId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在',
    });
  }

  if (order.expireAt < Date.now()) {
    taobaoOrderMap.delete(orderId);
    return res.status(400).json({
      status: 'error',
      message: '二维码已过期',
    });
  }

  if (order.status === 'success') {
    const token = sign({ userId: order.userId, platform: 'taobao' }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    taobaoOrderMap.delete(orderId);

    return res.json({
      status: 'ok',
      type: 'taobao',
      currentAuthority: 'user',
      token,
    });
  }

  return res.json({
    status: 'waiting',
  });
}

/**
 * 淘宝回调通知
 */
export async function taobaoCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send('参数错误');
    }

    // 使用授权码换取访问令牌
    const tokenResult = await exchangeToken(code);

    // 使用访问令牌获取用户信息
    const userInfo = await getTaobaoUserInfo(tokenResult.access_token);

    // 更新订单状态
    const orderId = state as string;
    taobaoOrderMap.set(orderId, {
      status: 'success',
      userId: userInfo.user_id,
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.send('授权成功，请关闭页面');
  } catch (error) {
    console.error('淘宝回调处理失败:', error);
    res.status(500).send('授权失败');
  }
}

// 辅助函数：从淘宝获取二维码
async function fetchQrCodeFromTaobao(orderId: string): Promise<string> {
  // 实际项目中需要调用淘宝 API
  // 这里返回授权 URL，用户扫码后会跳转到回调地址
  return `https://oauth.taobao.com/authorize?app_key=${TAOBAO_APP_KEY}&response_type=code&state=${orderId}`;
}

// 辅助函数：换取访问令牌
async function exchangeToken(code: string) {
  const response = await fetch('https://oauth.taobao.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: TAOBAO_APP_KEY,
      client_secret: TAOBAO_APP_SECRET,
      redirect_uri: `${process.env.SERVER_URL}/api/login/taobao/callback`,
    }),
  });
  return response.json();
}

// 辅助函数：获取用户信息
async function getTaobaoUserInfo(accessToken: string) {
  const response = await fetch('https://eco.taobao.com/router/rest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      method: 'taobao.user.info.get',
      access_token: accessToken,
      app_key: TAOBAO_APP_KEY,
      sign_method: 'md5',
      timestamp: new Date().toISOString().replace(/[-:]/g, '').slice(0, -3),
      v: '2.0',
    }),
  });
  return response.json();
}
```

---

## 二、微博登录

### 接口文档

#### 1. 获取微博二维码

**请求**
```
GET /api/login/weibo
```

**响应**
```json
{
  "qrCode": "https://qr.weibo.com/xxxxx",
  "orderId": "weibo_order_xxxxx"
}
```

#### 2. 查询登录状态

**请求**
```
GET /api/login/weibo/query?orderId=weibo_order_xxxxx
```

**响应**
```json
{
  "status": "ok",
  "type": "weibo",
  "currentAuthority": "user"
}
```

---

### 微博开放平台配置

1. **注册开发者账号**
   - 访问 https://open.weibo.com/
   - 完成企业认证

2. **创建应用**
   - 进入控制台 → 移动应用/网站应用
   - 填写应用信息
   - 审核通过后获得 AppKey 和 AppSecret

3. **配置授权回调地址**
   - 设置授权回调页面地址

---

### Node.js 参考实现

```typescript
// controllers/weiboController.ts
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';

// 存储订单状态的 Map
const weiboOrderMap = new Map<string, {
  status: 'pending' | 'success';
  userId?: string;
  expireAt: number;
}>();

const WEIBO_APP_KEY = '你的 AppKey';
const WEIBO_APP_SECRET = '你的 AppSecret';

/**
 * 生成微博二维码
 * 参考文档：https://open.weibo.com/wiki/Connect/connect
 */
export async function getWeiboQrCode(req: Request, res: Response) {
  try {
    const orderId = `weibo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 生成授权 URL
    const params = {
      client_id: WEIBO_APP_KEY,
      redirect_uri: `${process.env.SERVER_URL}/api/login/weibo/callback`,
      response_type: 'code',
      state: orderId,
      display: 'qrcode', // 指定返回二维码
    };

    const authorizeUrl = 'https://api.weibo.com/oauth2/authorize?' + 
      new URLSearchParams(params).toString();

    // 存储订单状态
    weiboOrderMap.set(orderId, {
      status: 'pending',
      expireAt: Date.now() + 5 * 60 * 1000, // 5 分钟有效期
    });

    res.json({
      qrCode: authorizeUrl, // 前端可以使用 QRCode 库渲染二维码
      orderId,
    });
  } catch (error) {
    console.error('获取微博二维码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取二维码失败',
    });
  }
}

/**
 * 查询微博登录状态
 */
export async function checkWeiboLoginStatus(req: Request, res: Response) {
  const { orderId } = req.query as { orderId: string };

  if (!orderId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 orderId 参数',
    });
  }

  const order = weiboOrderMap.get(orderId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在',
    });
  }

  if (order.expireAt < Date.now()) {
    weiboOrderMap.delete(orderId);
    return res.status(400).json({
      status: 'error',
      message: '二维码已过期',
    });
  }

  if (order.status === 'success') {
    const token = sign({ userId: order.userId, platform: 'weibo' }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    weiboOrderMap.delete(orderId);

    return res.json({
      status: 'ok',
      type: 'weibo',
      currentAuthority: 'user',
      token,
    });
  }

  return res.json({
    status: 'waiting',
  });
}

/**
 * 微博回调通知
 */
export async function weiboCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send('参数错误');
    }

    // 使用授权码换取访问令牌
    const tokenResult = await exchangeWeiboToken(code);

    // 使用访问令牌获取用户信息
    const userInfo = await getWeiboUserInfo(tokenResult.access_token);

    // 更新订单状态
    const orderId = state as string;
    weiboOrderMap.set(orderId, {
      status: 'success',
      userId: userInfo.idstr, // 微博用户 ID
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.send('授权成功，请关闭页面');
  } catch (error) {
    console.error('微博回调处理失败:', error);
    res.status(500).send('授权失败');
  }
}

// 辅助函数：换取访问令牌
async function exchangeWeiboToken(code: string) {
  const response = await fetch('https://api.weibo.com/oauth2/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: WEIBO_APP_KEY,
      client_secret: WEIBO_APP_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.SERVER_URL}/api/login/weibo/callback`,
    }),
  });
  return response.json();
}

// 辅助函数：获取用户信息
async function getWeiboUserInfo(accessToken: string) {
  const response = await fetch('https://api.weibo.com/2/users/show.json', {
    headers: {
      'Authorization': `OAuth2 ${accessToken}`,
    },
  });
  return response.json();
}
```

---

## 三、路由配置

```typescript
// routes/socialLogin.ts
import { Router } from 'express';
import {
  getTaobaoQrCode,
  checkTaobaoLoginStatus,
  taobaoCallback,
} from '../controllers/taobaoController';
import {
  getWeiboQrCode,
  checkWeiboLoginStatus,
  weiboCallback,
} from '../controllers/weiboController';

const router = Router();

// 淘宝登录
router.get('/login/taobao', getTaobaoQrCode);
router.get('/login/taobao/query', checkTaobaoLoginStatus);
router.get('/login/taobao/callback', taobaoCallback);

// 微博登录
router.get('/login/weibo', getWeiboQrCode);
router.get('/login/weibo/query', checkWeiboLoginStatus);
router.get('/login/weibo/callback', weiboCallback);

export default router;
```

---

## 四、注意事项

### 淘宝登录

1. **授权方式**
   - 淘宝使用 OAuth2.0 授权
   - 二维码授权需要申请权限

2. **安全注意**
   - 必须验证回调的 state 参数防止 CSRF
   - AppSecret 不能暴露在前端

3. **沙箱环境**
   - 淘宝提供沙箱环境用于开发测试
   - https://open.taobao.com/doc.htm?docId=102632

### 微博登录

1. **授权方式**
   - 微博使用 OAuth2.0 授权
   - `display=qrcode` 参数生成二维码

2. **安全注意**
   - 必须验证 state 参数
   - access_token 需要妥善保存

3. **权限申请**
   - 获取用户信息需要申请 `email` 等权限
   - 应用需要完成审核

4. **沙箱环境**
   - 微博提供沙箱账号用于测试
   - https://open.weibo.com/wiki/Sandbox

---

## 五、前端调用示例

```typescript
// 点击图标触发
const handleTaobaoLogin = () => {
  window.dispatchEvent(new CustomEvent('taobao-login'));
};

const handleWeiboLogin = () => {
  window.dispatchEvent(new CustomEvent('weibo-login'));
};
```
