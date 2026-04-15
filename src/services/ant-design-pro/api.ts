// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户权限信息 GET /admin-api/system/auth/get-permission-info */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CommonResult<API.PermissionInfo>>('/admin-api/system/auth/get-permission-info', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /admin-api/system/auth/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<API.CommonResult<boolean>>('/admin-api/system/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 账号密码登录 POST /admin-api/system/auth/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.CommonResult<API.LoginResult>>('/admin-api/system/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 短信验证码登录 POST /admin-api/system/auth/sms-login */
export async function smsLogin(body: API.SmsLoginParams, options?: { [key: string]: any }) {
  return request<API.CommonResult<API.LoginResult>>('/admin-api/system/auth/sms-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/**
 * 社交登录类型枚举（对应后端 SocialTypeEnum）
 * 32 = 微信开放平台（PC 扫码）
 * 40 = 支付宝小程序
 * 50 = 新浪微博
 */
export const SocialType = {
  WECHAT_OPEN: 32,
  ALIPAY: 40,
  WEIBO: 50,
} as const;

/** 获取社交登录授权 URL GET /admin-api/system/auth/social-auth-redirect */
export async function socialAuthRedirect(
  params: { type: number; redirectUri: string },
  options?: { [key: string]: any },
) {
  return request<API.CommonResult<string>>('/admin-api/system/auth/social-auth-redirect', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 社交快捷登录 POST /admin-api/system/auth/social-login */
export async function socialLogin(
  data: { type: number; code: string; state: string },
  options?: { [key: string]: any },
) {
  return request<API.CommonResult<API.LoginResult>>('/admin-api/system/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    ...(options || {}),
  });
}
