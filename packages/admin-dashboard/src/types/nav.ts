import { LucideIcon } from 'lucide-react';

/**
 * 导航项类型定义
 */
export interface NavItem {
  /** 导航项唯一标识 */
  id: string;
  /** 显示标题 */
  title: string;
  /** 路由路径 */
  href: string;
  /** 图标组件 */
  icon?: LucideIcon;
  /** 子导航项（支持多级嵌套） */
  children?: NavItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否在新标签页打开 */
  external?: boolean;
}

/**
 * 导航分组类型
 */
export interface NavGroup {
  /** 分组标题 */
  title?: string;
  /** 分组内的导航项 */
  items: NavItem[];
}
