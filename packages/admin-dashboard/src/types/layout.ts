/**
 * 布局配置类型定义
 */
export interface LayoutConfig {
  /** 侧边栏配置 */
  sidebar: {
    /** 展开宽度 (px) */
    width: number;
    /** 收起宽度 (px) */
    collapsedWidth: number;
    /** 默认是否收起 */
    defaultCollapsed: boolean;
  };
  /** 顶部栏配置 */
  header: {
    /** 高度 (px) */
    height: number;
    /** 是否固定在顶部 */
    fixed: boolean;
  };
  /** 响应式断点 */
  breakpoints: {
    /** 移动端断点 (<768px) */
    mobile: number;
    /** 平板断点 (768-1023px) */
    tablet: number;
    /** 桌面端断点 (≥1024px) */
    desktop: number;
  };
}

/**
 * 默认布局配置
 */
export const defaultLayoutConfig: LayoutConfig = {
  sidebar: {
    width: 240,
    collapsedWidth: 64,
    defaultCollapsed: false,
  },
  header: {
    height: 56,
    fixed: true,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1024,
  },
};
