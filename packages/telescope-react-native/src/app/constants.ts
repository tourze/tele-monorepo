export const API_POST_LOGIN = '/api/v5/login/'; // 需要加密
export const API_POST_RESET_PASSWORD = '/api/v5/forget_password/';
export const API_POST_BIND_ACCOUNT = '/api/v5/user/sure/';
export const API_POST_TRIAL_LOGIN = '/api/v5/trial/'; // 需要加密，会提示 网络优化中,请稍候
export const API_GET_PAY = '/api/v5/pay/';
export const API_GET_CAPTCHA = '/api/v5/captcha_send/';

// 查看邀请情况
export const API_INVITE_ACTIVE = '/api/v5/invite/active/';
export const API_CARD_RECORD_INFO = '/api/v5/card/record/';
export const API_CARD_ACTIVE = '/api/v5/card/active/'; // 需要加密

// 下面2个是新的,版本号升级到2.0.0后使用
export var sKey = 'liOD1j7M9Lsvs2tXhrxgHZOiJn5dY60S'; //key，可自行修改
export var ivParameter = 'RmocrQkgcKgRd36S'; //偏移量,可自行修改

export const CrispLink = 'https://go.crisp.chat/chat/embed/?website_id=c35ca3c8-cab7-4b1c-8960-d2ff200974c6&user_nickname=${user.id}_${platform.os}';
export const TelegramKefuLink = 'https://t.me/TelescopeVPN';
