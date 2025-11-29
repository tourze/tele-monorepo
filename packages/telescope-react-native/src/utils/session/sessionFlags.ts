/**
 * 会话级别的标志位管理
 *
 * 用于跟踪应用会话中的一次性事件，防止重复触发。
 * 这些标志位存储在内存中，应用重启后会自动重置。
 */

class SessionFlags {
  private flags: Map<string, boolean> = new Map();

  /**
   * 检查标志位是否已设置
   */
  has(key: string): boolean {
    return this.flags.get(key) === true;
  }

  /**
   * 设置标志位
   */
  set(key: string): void {
    this.flags.set(key, true);
  }

  /**
   * 清除标志位
   */
  clear(key: string): void {
    this.flags.delete(key);
  }

  /**
   * 清除所有标志位
   */
  clearAll(): void {
    this.flags.clear();
  }
}

// 导出单例实例
export const sessionFlags = new SessionFlags();

// 预定义的标志位键
export const SESSION_FLAG_KEYS = {
  // 是否已弹出过试用登录提醒
  TRIAL_LOGIN_PROMPTED: 'trial_login_prompted',
} as const;
