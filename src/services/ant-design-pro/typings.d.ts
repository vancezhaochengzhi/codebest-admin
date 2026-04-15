// @ts-ignore
/* eslint-disable */

declare namespace API {
  // yudao 框架统一响应格式
  type CommonResult<T = any> = {
    code: number; // 0 表示成功
    data?: T;
    msg?: string;
  };

  // 对应后端 AuthPermissionInfoRespVO
  type PermissionInfo = {
    user?: PermissionUserVO;
    roles?: string[];
    permissions?: string[];
    menus?: PermissionMenuVO[];
  };

  type PermissionUserVO = {
    id?: number;
    nickname?: string;
    avatar?: string;
    deptId?: number;
    username?: string;
    email?: string;
  };

  type PermissionMenuVO = {
    id?: number;
    parentId?: number;
    name?: string;
    path?: string;
    component?: string;
    componentName?: string;
    icon?: string;
    visible?: boolean;
    keepAlive?: boolean;
    alwaysShow?: boolean;
    children?: PermissionMenuVO[];
  };

  // 前端使用的当前用户信息（从 PermissionInfo 转换而来）
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    access?: string;
    roles?: string[];
    permissions?: string[];
  };

  // 对应后端 AuthLoginRespVO
  type LoginResult = {
    userId?: number;
    accessToken?: string;
    refreshToken?: string;
    expiresTime?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  // 对应后端 AuthLoginReqVO
  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    captchaVerification?: string;
    // 社交登录绑定字段
    socialType?: number;
    socialCode?: string;
    socialState?: string;
  };

  // 对应后端 AuthSmsLoginReqVO
  type SmsLoginParams = {
    mobile?: string;
    code?: string;
  };

  // 对应后端 AuthSmsSendReqVO
  type SmsSendParams = {
    mobile?: string;
    scene?: number;
    captchaVerification?: string;
  };

  type CaptchaResult = {
    captchaType?: string;
    token?: string;
    secretKey?: string;
    jigsawBase64?: string; // 滑块背景图片
    originalBase64?: string; // 滑块原图
    word?: string; // 如果是文字验证码，这里是文字
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
