// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送短信验证码 POST /admin-api/system/auth/send-sms-code */
export async function sendSmsCode(
  data: API.SmsSendParams,
  options?: { [key: string]: any },
) {
  return request<API.CommonResult<boolean>>('/admin-api/system/auth/send-sms-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 获取图形验证码 POST /admin-api/system/captcha/get */
export async function getCaptcha(
  data: {
    captchaType?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.CommonResult<API.CaptchaResult>>('/admin-api/system/captcha/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 校验图形验证码 POST /admin-api/system/captcha/check */
export async function checkCaptcha(
  data: {
    captchaType?: string;
    pointJson?: string;
    token?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.CommonResult<API.CaptchaResult>>('/admin-api/system/captcha/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}
