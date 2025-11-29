import { LayoutConfig } from '@/types';

/**
 * 布局配置实例
 */
export const layoutConfig: LayoutConfig = {
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
