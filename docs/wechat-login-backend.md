# 微信扫码登录后端 API 参考实现

## 接口文档

### 1. 获取微信二维码

**请求**
```
GET /api/login/wechat
```

**响应**
```json
{
  "qrCode": "https://open.weixin.qq.com/connect/qrconnect?appid=xxx&...",
  "orderId": "wechat_order_xxxxx"
}
```

### 2. 查询登录状态

**请求**
```
GET /api/login/wechat/query?orderId=wechat_order_xxxxx
```

**响应**
```json
{
  "status": "ok",
  "type": "wechat",
  "currentAuthority": "user"
}
```

### 3. 微信回调通知

**请求**
```
GET /api/login/wechat/callback?code=xxx&state=xxx
```

---

## 微信开放平台配置

### 1. 注册开发者账号

- 访问 https://open.weixin.qq.com/
- **注意**：需要企业/组织主体，个人无法注册
- 完成认证（需要缴纳 300 元认证费）

### 2. 创建网站应用

- 进入控制台 → 移动应用/网站应用
- 创建"网站应用"
- 填写应用信息，提交审核
- 审核通过后获得 `AppID` 和 `AppSecret`

### 3. 配置授权回调地址

- 在应用详情中设置"授权回调页"
- 格式：`https://your-domain.com/api/login/wechat/callback`

### 4. 申请权限

- 网站应用默认支持网页授权
- 获取用户信息需要 `scope: snsapi_login`

---

## Node.js 参考实现

### 安装依赖

```bash
npm install axios
```

### 配置

```typescript
// config/wechat.ts
export const wechatConfig = {
  appId: '你的 AppID', // 网站应用的 AppID
  appSecret: '你的 AppSecret',
  redirectUri: 'https://your-domain.com/api/login/wechat/callback',
};
```

### 控制器实现

```typescript
// controllers/wechatController.ts
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import axios from 'axios';
import { wechatConfig } from '../config/wechat';

// 存储订单状态的 Map（生产环境建议用 Redis）
const wechatOrderMap = new Map<string, {
  status: 'pending' | 'success';
  userId?: string;
  userInfo?: any;
  expireAt: number;
}>();

/**
 * 生成微信二维码
 * 参考文档：https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */
export async function getWechatQrCode(req: Request, res: Response) {
  try {
    const orderId = `wechat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 生成微信授权 URL
    // 微信使用 state 参数传递自定义参数
    const redirectUri = encodeURIComponent(
      `${wechatConfig.redirectUri}?state=${orderId}`
    );
    
    const qrCodeUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${wechatConfig.appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${orderId}#wechat_redirect`;

    // 存储订单状态
    wechatOrderMap.set(orderId, {
      status: 'pending',
      expireAt: Date.now() + 5 * 60 * 1000, // 5 分钟有效期（微信二维码默认 5 分钟过期）
    });

    res.json({
      qrCode: qrCodeUrl,
      orderId,
    });
  } catch (error) {
    console.error('获取微信二维码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取二维码失败',
    });
  }
}

/**
 * 查询微信登录状态
 */
export async function checkWechatLoginStatus(req: Request, res: Response) {
  const { orderId } = req.query as { orderId: string };

  if (!orderId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 orderId 参数',
    });
  }

  const order = wechatOrderMap.get(orderId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在',
    });
  }

  if (order.expireAt < Date.now()) {
    wechatOrderMap.delete(orderId);
    return res.status(400).json({
      status: 'error',
      message: '二维码已过期',
    });
  }

  if (order.status === 'success') {
    // 生成 JWT token
    const token = sign(
      { userId: order.userId, platform: 'wechat', userInfo: order.userInfo },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    wechatOrderMap.delete(orderId);

    return res.json({
      status: 'ok',
      type: 'wechat',
      currentAuthority: 'user',
      token,
    });
  }

  return res.json({
    status: 'waiting',
  });
}

/**
 * 微信回调通知
 * 用户扫码授权后，微信会重定向到这个地址
 */
export async function wechatCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send('参数错误');
    }

    // 使用授权码换取访问令牌
    const tokenResult = await exchangeWechatToken(code);

    if (tokenResult.errcode) {
      throw new Error(tokenResult.errmsg || '换取 access_token 失败');
    }

    // 使用访问令牌获取用户信息
    const userInfo = await getWechatUserInfo(
      tokenResult.access_token,
      tokenResult.openid
    );

    if (userInfo.errcode) {
      throw new Error(userInfo.errmsg || '获取用户信息失败');
    }

    // 更新订单状态
    const orderId = state as string;
    wechatOrderMap.set(orderId, {
      status: 'success',
      userId: userInfo.openid,
      userInfo: {
        openid: userInfo.openid,
        nickname: userInfo.nickname,
        sex: userInfo.sex,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country,
        headimgurl: userInfo.headimgurl, // 用户头像
      },
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // 返回成功页面，提示用户可以关闭
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>授权成功</title>
        <style>
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background: #07c160;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .container { text-align: center; }
          .success { font-size: 48px; margin-bottom: 20px; }
          .message { font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <div class="message">授权成功，请返回</div>
        </div>
        <script>
          // 通知父窗口（如果是嵌入的二维码）
          if (window.opener) {
            window.opener.postMessage('wechat-auth-success', '*');
            setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('微信回调处理失败:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>授权失败</title>
        <style>
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background: #fa5151;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .container { text-align: center; }
          .error { font-size: 48px; margin-bottom: 20px; }
          .message { font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">✗</div>
          <div class="message">授权失败：${error.message}</div>
        </div>
      </body>
      </html>
    `);
  }
}

// 辅助函数：换取访问令牌
async function exchangeWechatToken(code: string) {
  const response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
    params: {
      appid: wechatConfig.appId,
      secret: wechatConfig.appSecret,
      code,
      grant_type: 'authorization_code',
    },
  });
  return response.data;
}

// 辅助函数：获取用户信息
async function getWechatUserInfo(accessToken: string, openid: string) {
  const response = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
    params: {
      access_token: accessToken,
      openid,
      lang: 'zh_CN',
    },
  });
  return response.data;
}
```

---

## 路由配置

```typescript
// routes/wechat.ts
import { Router } from 'express';
import {
  getWechatQrCode,
  checkWechatLoginStatus,
  wechatCallback,
} from '../controllers/wechatController';

const router = Router();

// 微信登录
router.get('/login/wechat', getWechatQrCode);
router.get('/login/wechat/query', checkWechatLoginStatus);
router.get('/login/wechat/callback', wechatCallback);

export default router;
```

---

## 前端集成说明

### 方式一：弹出窗口（推荐）

前端点击微信图标后，可以直接打开微信授权 URL：

```typescript
const handleWechatLogin = () => {
  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    wechatAuthUrl,
    'wechat-login',
    `width=${width},height=${height},left=${left},top=${top}`
  );
};
```

### 方式二：二维码嵌入（当前实现）

当前前端实现使用二维码嵌入方式，用户需要：
1. 点击微信图标
2. 弹出模态框显示二维码
3. 用微信扫描二维码
4. 前端轮询检查登录状态

**注意**：微信官方推荐使用方式一（网页授权跳转），因为：
- 二维码嵌入方式需要用户主动打开微信扫描
- 跳转方式可以直接在微信内完成授权

---

## 注意事项

### 1. 账号要求

- 微信开放平台账号必须是企业/组织主体
- 个人账号无法创建网站应用
- 认证费用：300 元/年

### 2. 域名要求

- 授权回调地址必须使用 HTTPS
- 域名必须备案
- 域名必须与应用填写的一致

### 3. 安全注意

- 必须验证 state 参数防止 CSRF
- AppSecret 不能暴露在前端
- access_token 有效期为 2 小时，需要缓存

### 4. 二维码有效期

- 微信二维码默认 5 分钟过期
- 过期后需要重新生成

### 5. 测试环境

- 微信没有官方沙箱环境
- 可以使用测试账号进行开发
- 正式环境需要应用审核通过

---

## 完整示例流程

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  前端   │     │  后端   │     │  微信   │     │  用户   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 1. 点击微信图标 │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │ 2. 请求二维码  │               │               │
     │<──────────────│               │               │
     │   (orderId)   │               │               │
     │               │               │               │
     │ 3. 显示二维码  │               │               │
     │──────────────────────────────>│               │
     │               │               │               │
     │               │               │ 4. 扫码授权    │
     │               │               │<──────────────│
     │               │               │               │
     │               │ 5. 回调通知   │               │
     │               │<──────────────│               │
     │               │               │               │
     │ 6. 轮询状态   │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │ 7. 返回成功   │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ 8. 登录完成   │               │               │
     │───────────────────────────────────────────────│
```
