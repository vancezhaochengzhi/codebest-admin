# 支付宝扫码登录后端 API 参考实现

## 接口文档

### 1. 获取支付宝二维码

**请求**
```
GET /api/login/alipay
```

**响应**
```json
{
  "qrCode": "https://qr.alipay.com/xxxxx",
  "orderId": "alipay_order_xxxxx"
}
```

---

### 2. 查询登录状态

**请求**
```
GET /api/login/alipay/query?orderId=alipay_order_xxxxx
```

**响应**
```json
{
  "status": "ok",
  "type": "alipay",
  "currentAuthority": "user"
}
```

---

### 3. 支付宝回调通知（异步）

**请求**
```
POST /api/login/alipay/callback
Content-Type: application/x-www-form-urlencoded
```

---

## Node.js 参考实现（使用 alipay-sdk）

### 安装依赖

```bash
npm install alipay-sdk jsonwebtoken
```

### 配置

```typescript
// config/alipay.ts
export const alipayConfig = {
  appId: '你的应用 APPID',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
你的私钥
-----END RSA PRIVATE KEY-----`,
  alipayPublicKey: `-----BEGIN PUBLIC KEY-----
支付宝公钥
-----END PUBLIC KEY-----`,
  gateway: 'https://openapi.alipay.com/gateway.do',
  // 本地开发可用 sandbox
  // gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
};
```

### 控制器实现

```typescript
// controllers/alipayController.ts
import AlipaySdk from 'alipay-sdk';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { alipayConfig } from '../config/alipay';

// 存储订单状态的 Map（生产环境建议用 Redis）
const loginOrderMap = new Map<string, {
  status: 'pending' | 'success';
  userId?: string;
  expireAt: number;
}>();

const alipaySdk = new AlipaySdk({
  appId: alipayConfig.appId,
  privateKey: alipayConfig.privateKey,
  alipayPublicKey: alipayConfig.alipayPublicKey,
  gateway: alipayConfig.gateway,
});

/**
 * 生成支付宝二维码
 */
export async function getAlipayQrCode(req: Request, res: Response) {
  try {
    // 生成订单 ID
    const orderId = `alipay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 调用支付宝 API 生成二维码
    const result = await alipaySdk.exec('alipay.user.qrcode.create', {
      method: 'alipay.user.qrcode.create',
      bizContent: {
        out_biz_no: orderId,
        code_validity_period: '7d', // 二维码有效期 7 天
        // 回调地址，支付宝会在用户扫码后回调
        callback_url: `${process.env.SERVER_URL}/api/login/alipay/callback`,
        // 扩展参数，可用于传递 userId 等信息
        ext_info: JSON.stringify({ orderId }),
      },
    });

    if (result.code !== '10000') {
      throw new Error(result.sub_msg || '生成二维码失败');
    }

    // 存储订单状态
    loginOrderMap.set(orderId, {
      status: 'pending',
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      qrCode: result.qrcode, // 二维码内容
      orderId,
    });
  } catch (error) {
    console.error('获取支付宝二维码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取二维码失败',
    });
  }
}

/**
 * 查询登录状态
 */
export async function checkLoginStatus(req: Request, res: Response) {
  const { orderId } = req.query as { orderId: string };

  if (!orderId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 orderId 参数',
    });
  }

  const order = loginOrderMap.get(orderId);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在',
    });
  }

  if (order.expireAt < Date.now()) {
    loginOrderMap.delete(orderId);
    return res.status(400).json({
      status: 'error',
      message: '二维码已过期',
    });
  }

  if (order.status === 'success') {
    // 登录成功，生成 token
    const token = sign({ userId: order.userId }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    loginOrderMap.delete(orderId);

    return res.json({
      status: 'ok',
      type: 'alipay',
      currentAuthority: 'user',
      token,
    });
  }

  // 仍在等待扫码
  return res.json({
    status: 'waiting',
  });
}

/**
 * 支付宝回调通知
 * 支付宝会在用户扫码授权后调用此接口
 */
export async function alipayCallback(req: Request, res: Response) {
  try {
    const params = req.body;
    
    // 验证签名
    const isValid = alipaySdk.checkNotifySign(params);
    if (!isValid) {
      return res.status(400).send('验签失败');
    }

    const { out_biz_no, user_id } = params;

    // 更新订单状态
    loginOrderMap.set(out_biz_no, {
      status: 'success',
      userId: user_id,
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // 这里可以将用户信息与你的系统关联
    // 例如：根据支付宝 userId 查找或创建本地用户

    // 返回 success 给支付宝
    res.send('success');
  } catch (error) {
    console.error('支付宝回调处理失败:', error);
    res.status(500).send('error');
  }
}
```

### 路由配置

```typescript
// routes/alipay.ts
import { Router } from 'express';
import { getAlipayQrCode, checkLoginStatus, alipayCallback } from '../controllers/alipayController';

const router = Router();

router.get('/login/alipay', getAlipayQrCode);
router.get('/login/alipay/query', checkLoginStatus);
router.post('/login/alipay/callback', alipayCallback);

export default router;
```

---

## Java (Spring Boot) 参考实现

### 依赖

```xml
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.39.0.ALL</version>
</dependency>
```

### 配置类

```java
@Configuration
@ConfigurationProperties(prefix = "alipay")
public class AlipayConfig {
    private String appId;
    private String privateKey;
    private String alipayPublicKey;
    private String gateway = "https://openapi.alipay.com/gateway.do";
    
    // getters and setters
    
    public AlipayClient getAlipayClient() {
        return new DefaultAlipayClient(gateway, appId, privateKey, "json", "UTF-8", alipayPublicKey, "RSA2");
    }
}
```

### 控制器

```java
@RestController
@RequestMapping("/api/login")
public class AlipayLoginController {

    @Autowired
    private AlipayConfig alipayConfig;

    // 使用 ConcurrentHashMap 存储订单状态（生产环境建议用 Redis）
    private final ConcurrentHashMap<String, LoginOrder> orderMap = new ConcurrentHashMap<>();

    @Data
    static class LoginOrder {
        private String status = "pending";
        private String userId;
        private long expireAt;
    }

    @GetMapping("/alipay")
    public ResponseEntity<?> getQrCode() {
        try {
            String orderId = "alipay_" + System.currentTimeMillis() + "_" + 
                            new Random().nextInt(1000000);

            AlipayClient client = alipayConfig.getAlipayClient();
            AlipayUserQrcodeCreateRequest request = new AlipayUserQrcodeCreateRequest();
            
            JSONObject bizContent = new JSONObject();
            bizContent.put("out_biz_no", orderId);
            bizContent.put("code_validity_period", "7d");
            bizContent.put("callback_url", "https://your-server.com/api/login/alipay/callback");
            bizContent.put("ext_info", "{\"orderId\":\"" + orderId + "\"}");
            
            request.setBizContent(bizContent.toString());
            AlipayUserQrcodeCreateResponse response = client.execute(request);

            if (!"10000".equals(response.getCode())) {
                return ResponseEntity.status(500)
                    .body(Map.of("status", "error", "message", response.getSubMsg()));
            }

            LoginOrder order = new LoginOrder();
            order.setExpireAt(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000);
            orderMap.put(orderId, order);

            Map<String, String> result = new HashMap<>();
            result.put("qrCode", response.getQrcode());
            result.put("orderId", orderId);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("status", "error", "message", "获取二维码失败"));
        }
    }

    @GetMapping("/alipay/query")
    public ResponseEntity<?> checkStatus(@RequestParam String orderId) {
        LoginOrder order = orderMap.get(orderId);

        if (order == null) {
            return ResponseEntity.status(404)
                .body(Map.of("status", "error", "message", "订单不存在"));
        }

        if (order.getExpireAt() < System.currentTimeMillis()) {
            orderMap.remove(orderId);
            return ResponseEntity.status(400)
                .body(Map.of("status", "error", "message", "二维码已过期"));
        }

        if ("success".equals(order.getStatus())) {
            // 生成 JWT token
            String token = Jwts.builder()
                .setSubject(order.getUserId())
                .setExpiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000))
                .signWith(SignatureAlgorithm.HS256, "your-secret-key")
                .compact();

            orderMap.remove(orderId);

            Map<String, String> result = new HashMap<>();
            result.put("status", "ok");
            result.put("type", "alipay");
            result.put("currentAuthority", "user");
            result.put("token", token);

            return ResponseEntity.ok(result);
        }

        return ResponseEntity.ok(Map.of("status", "waiting"));
    }

    @PostMapping("/alipay/callback")
    public String callback(HttpServletRequest request) {
        try {
            // 获取支付宝回调参数
            Map<String, String> params = new HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();
            for (Map.Entry<String, String[]> entry : requestParams.entrySet()) {
                params.put(entry.getKey(), entry.getValue()[0]);
            }

            // 验签
            boolean valid = AlipaySignature.rsaCheckV1(
                params, 
                alipayConfig.getAlipayPublicKey(), 
                "UTF-8", 
                "RSA2"
            );

            if (!valid) {
                return "error";
            }

            String outBizNo = params.get("out_biz_no");
            String userId = params.get("user_id");

            // 更新订单状态
            LoginOrder order = orderMap.get(outBizNo);
            if (order != null) {
                order.setStatus("success");
                order.setUserId(userId);
            }

            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }
}
```

---

## 支付宝开放平台配置步骤

1. **注册开发者账号**
   - 访问 https://open.alipay.com/
   - 完成企业认证

2. **创建应用**
   - 进入控制台 → 网页/移动应用
   - 填写应用信息，上传图标
   - 审核通过后获得 APPID

3. **配置密钥**
   - 下载密钥生成工具
   - 生成应用私钥和公钥
   - 上传公钥到支付宝开放平台
   - 保存支付宝公钥

4. **添加能力**
   - 在应用详情中添加"支付宝登录"能力

5. **配置回调地址**
   - 设置授权回调页面地址
   - 开发环境可配置 sandbox 环境

---

## 注意事项

1. **安全性**
   - 必须验证支付宝回调的签名
   - token 生成使用安全的密钥
   - 生产环境使用 Redis 存储订单状态

2. **二维码有效期**
   - 默认 7 天，可根据需求调整
   - 前端轮询间隔建议 2-3 秒

3. **用户体验**
   - 二维码加载失败时提供重试按钮
   - 轮询超时后提示用户重新扫码

4. **沙箱环境**
   - 开发阶段使用沙箱环境测试
   - 沙箱账号：https://open.alipay.com/develop/sandbox/app
