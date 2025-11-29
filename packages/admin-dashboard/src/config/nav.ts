import {
  LayoutDashboard,
  List,
  FileEdit,
  FileText,
  Settings,
} from 'lucide-react';
import { NavItem } from '@/types';

/**
 * 导航配置 - 5个示例页面
 */
export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'list',
    title: '数据列表',
    href: '/list',
    icon: List,
  },
  {
    id: 'form',
    title: '表单页面',
    href: '/form',
    icon: FileEdit,
  },
  {
    id: 'detail',
    title: '详情页面',
    href: '/detail',
    icon: FileText,
  },
  {
    id: 'settings',
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
];
