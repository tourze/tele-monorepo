import { Users, Activity, TrendingUp, Server } from 'lucide-react';

/**
 * 统计卡片数据
 */
export interface StatCardData {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: typeof Users;
}

/**
 * 仪表盘模拟数据
 */
export const dashboardStats: StatCardData[] = [
  {
    title: '总用户数',
    value: '12,345',
    change: { value: 12.5, trend: 'up' },
    icon: Users,
  },
  {
    title: '活跃用户',
    value: '5,678',
    change: { value: 8.2, trend: 'up' },
    icon: Activity,
  },
  {
    title: '今日访问',
    value: '1,234',
    change: { value: -3.1, trend: 'down' },
    icon: TrendingUp,
  },
  {
    title: '系统负载',
    value: '23%',
    change: { value: 0, trend: 'neutral' },
    icon: Server,
  },
];

/**
 * 最近活动数据
 */
export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    user: '张三',
    action: '创建了',
    target: '新订单 #1234',
    time: '2 分钟前',
  },
  {
    id: '2',
    user: '李四',
    action: '更新了',
    target: '用户资料',
    time: '15 分钟前',
  },
  {
    id: '3',
    user: '王五',
    action: '删除了',
    target: '过期数据',
    time: '1 小时前',
  },
  {
    id: '4',
    user: '赵六',
    action: '导出了',
    target: '月度报表',
    time: '2 小时前',
  },
  {
    id: '5',
    user: '系统',
    action: '完成了',
    target: '自动备份',
    time: '3 小时前',
  },
];
