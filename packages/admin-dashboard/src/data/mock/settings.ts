/**
 * 设置页模拟数据
 */

export interface SettingsData {
  profile: {
    name: string;
    email: string;
    bio: string;
    avatar?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showEmail: boolean;
    showActivity: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

/**
 * 默认设置数据
 */
export const defaultSettings: SettingsData = {
  profile: {
    name: '管理员',
    email: 'admin@example.com',
    bio: '系统管理员，负责日常运维和用户管理工作。',
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    weeklyReport: true,
  },
  privacy: {
    publicProfile: true,
    showEmail: false,
    showActivity: true,
  },
  preferences: {
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
  },
};

/**
 * 语言选项
 */
export const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'ja-JP', label: '日本語' },
];

/**
 * 时区选项
 */
export const timezoneOptions = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
  { value: 'America/New_York', label: '美东时间 (UTC-5)' },
  { value: 'America/Los_Angeles', label: '美西时间 (UTC-8)' },
  { value: 'Europe/London', label: '格林尼治时间 (UTC+0)' },
];

/**
 * 日期格式选项
 */
export const dateFormatOptions = [
  { value: 'YYYY-MM-DD', label: '2024-11-29' },
  { value: 'DD/MM/YYYY', label: '29/11/2024' },
  { value: 'MM/DD/YYYY', label: '11/29/2024' },
  { value: 'YYYY年MM月DD日', label: '2024年11月29日' },
];
