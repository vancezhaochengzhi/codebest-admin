import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  UserOutlined,
  WechatOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Captcha } from 'aj-captcha-react';
import { Alert, App, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import {
  login,
  SocialType,
  smsLogin,
  socialAuthRedirect,
  socialLogin,
} from '@/services/ant-design-pro/api';
import {
  checkCaptcha,
  getCaptcha,
  sendSmsCode,
} from '@/services/ant-design-pro/login';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

/** 社交登录图标：点击后跳转到第三方 OAuth 授权页 */
const ActionIcons = () => {
  const { styles } = useStyles();

  const handleSocialLogin = async (type: number) => {
    try {
      // 回调地址为当前登录页，带上 socialType 以便回调时识别
      const redirectUri = `${window.location.origin}/user/login?socialType=${type}`;
      const res = await socialAuthRedirect({ type, redirectUri });
      if (res.code === 0 && res.data) {
        // 跳转到第三方授权页
        window.location.href = res.data;
      }
    } catch (error) {
      console.error('获取社交登录授权地址失败:', error);
    }
  };

  return (
    <>
      <WechatOutlined
        key="WechatOutlined"
        className={styles.action}
        onClick={() => handleSocialLogin(SocialType.WECHAT_OPEN)}
      />
      <AlipayCircleOutlined
        key="AlipayCircleOutlined"
        className={styles.action}
        onClick={() => handleSocialLogin(SocialType.ALIPAY)}
      />
      <WeiboCircleOutlined
        key="WeiboCircleOutlined"
        className={styles.action}
        onClick={() => handleSocialLogin(SocialType.WEIBO)}
      />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<
    API.CommonResult<API.LoginResult>
  >({ code: 0, data: undefined });
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const captchaRef = useRef<any>(null);
  const [loginValues, setLoginValues] = useState<API.LoginParams | null>(null);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
      return userInfo;
    }
    return undefined;
  };

  // 社交登录回调处理：第三方平台授权后重定向回来带有 code/state/socialType 参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const socialTypeStr = urlParams.get('socialType');
    if (code && state && socialTypeStr) {
      // 清除 URL 中的社交登录参数，避免重复触发
      window.history.replaceState({}, '', '/user/login');
      // 调用社交登录接口
      (async () => {
        try {
          const res = await socialLogin({
            type: Number(socialTypeStr),
            code,
            state,
          });
          if (res.code === 0 && res.data) {
            if (res.data.accessToken) {
              localStorage.setItem('token', res.data.accessToken);
            }
            message.success(
              intl.formatMessage({
                id: 'pages.login.success',
                defaultMessage: '登录成功！',
              }),
            );
            const userInfo = await fetchUserInfo();
            if (userInfo) {
              window.location.href = '/';
            }
          } else {
            message.error(res.msg || '社交登录失败');
          }
        } catch (error) {
          message.error('社交登录失败，请重试');
        }
      })();
    }
  }, []);

  const handleSubmit = async (values: API.LoginParams) => {
    if (type === 'mobile') {
      // 短信登录不需要图形验证码，直接调用短信登录接口
      await handleSmsLogin(values as any);
      return;
    }
    // 账号密码登录：保存登录数据，触发图形验证码
    setLoginValues(values);
    captchaRef.current?.verify();
  };

  // 短信验证码登录
  const handleSmsLogin = async (values: {
    mobile: string;
    captcha: string;
  }) => {
    try {
      const msg = await smsLogin({
        mobile: values.mobile,
        code: values.captcha,
      });
      if (msg.code === 0 && msg.data) {
        if (msg.data.accessToken) {
          localStorage.setItem('token', msg.data.accessToken);
        }
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get('redirect') || '/';
        return;
      }
      setUserLoginState(msg);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        }),
      );
    }
  };

  // 验证码验证成功后的回调
  const handleCaptchaSuccess = async (data: any) => {
    if (!loginValues) return;

    // data 包含 captchaVerification 等验证信息
    const captchaVerification = data?.captchaVerification || data?.repKey;

    if (!captchaVerification) {
      message.error('验证码数据格式错误');
      return;
    }

    try {
      // 使用验证后的 captchaVerification 进行登录
      const msg = await login({ ...loginValues, captchaVerification });
      // yudao 框架：code = 0 表示成功
      if (msg.code === 0 && msg.data) {
        // 保存 token 到 localStorage
        if (msg.data.accessToken) {
          localStorage.setItem('token', msg.data.accessToken);
        }
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get('redirect') || '/';
        return;
      }
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { code, msg, data } = userLoginState;
  // 登录失败时显示错误信息
  const loginError = code !== undefined && code !== 0 && msg ? msg : undefined;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Code Best"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <ActionIcons key="icons" />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
              {
                key: 'mobile',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '手机号登录',
                }),
              },
            ]}
          />

          {loginError && type === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名: admin or user',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {loginError && type === 'mobile' && (
            <LoginMessage content="验证码错误" />
          )}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await sendSmsCode({
                    mobile: phone,
                    scene: 1, // 1=管理后台登录
                  });
                  if (result.code === 0) {
                    message.success('验证码发送成功');
                  }
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="忘记密码"
              />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />

      {/* 图形验证码滑块组件 - 隐藏，通过 ref 调用 */}
      <Captcha
        ref={captchaRef}
        onSuccess={handleCaptchaSuccess}
        onFail={() => {
          message.error('验证码验证失败');
        }}
        path={`${process.env.REACT_APP_API_URL || ''}/admin-api/system`}
        type="auto"
      />
    </div>
  );
};

export default Login;
