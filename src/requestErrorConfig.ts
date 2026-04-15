import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message } from 'antd';

// 与后端约定的响应数据格式（yudao 框架格式）
interface ResponseStructure {
  code?: number;
  data?: any;
  msg?: string;
}

/**
 * 检查响应是否成功
 * yudao 框架：code = 0 表示成功
 */
const isSuccess = (data: ResponseStructure): boolean => {
  return data?.code === 0;
};

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { code, data, msg } = res as unknown as ResponseStructure;
      if (!isSuccess(res as unknown as ResponseStructure)) {
        const error: any = new Error(msg);
        error.name = 'BizError';
        error.info = { errorCode: code, errorMessage: msg, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: any = error.info;
        if (errorInfo) {
          const { errorCode, errorMessage } = errorInfo;

          // code = 401 表示账号未登录，重定向到登录页面
          if (errorCode === 401) {
            // 清除本地存储的登录信息
            localStorage.removeItem('token');
            localStorage.removeItem('tenantId');

            message.error(errorMessage || '账号未登录');

            // 重定向到登录页面
            history.push('/user/login');
            return;
          }

          message.error(errorMessage);
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const status = error.response.status;

        // HTTP 状态码 401 也重定向到登录页面
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('tenantId');
          message.error('账号未登录');
          history.push('/user/login');
          return;
        }

        message.error(`Response status:${status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('token');

      // 如果有 token，添加到请求头
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加租户标识（yudao 框架需要，必须始终传递，否则后端会拒绝请求）
      const tenantId = localStorage.getItem('tenantId') || '1'; // 默认租户 ID 为 1
      config.headers = config.headers || {};
      config.headers['tenant-id'] = tenantId;

      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      // yudao 框架：code = 401 表示未登录，重定向到登录页面
      if (data && data.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        message.error(data.msg || '账号未登录');
        history.push('/user/login');
      }

      return response;
    },
  ],
};
