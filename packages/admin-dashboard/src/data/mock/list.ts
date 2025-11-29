/**
 * 列表项状态
 */
export type ListItemStatus = 'active' | 'inactive' | 'pending';

/**
 * 列表项数据
 */
export interface ListItem {
  id: string;
  name: string;
  email: string;
  status: ListItemStatus;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 列表页模拟数据
 */
export const listItems: ListItem[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    role: '管理员',
    createdAt: '2024-01-15',
    updatedAt: '2024-11-28',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    status: 'active',
    role: '编辑',
    createdAt: '2024-02-20',
    updatedAt: '2024-11-27',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    status: 'inactive',
    role: '用户',
    createdAt: '2024-03-10',
    updatedAt: '2024-10-15',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    status: 'pending',
    role: '用户',
    createdAt: '2024-04-05',
    updatedAt: '2024-11-29',
  },
  {
    id: '5',
    name: '孙七',
    email: 'sunqi@example.com',
    status: 'active',
    role: '编辑',
    createdAt: '2024-05-12',
    updatedAt: '2024-11-25',
  },
  {
    id: '6',
    name: '周八',
    email: 'zhouba@example.com',
    status: 'active',
    role: '用户',
    createdAt: '2024-06-18',
    updatedAt: '2024-11-20',
  },
  {
    id: '7',
    name: '吴九',
    email: 'wujiu@example.com',
    status: 'inactive',
    role: '用户',
    createdAt: '2024-07-22',
    updatedAt: '2024-09-30',
  },
  {
    id: '8',
    name: '郑十',
    email: 'zhengshi@example.com',
    status: 'active',
    role: '管理员',
    createdAt: '2024-08-08',
    updatedAt: '2024-11-28',
  },
];

/**
 * 分页信息
 */
export const listPagination: Pagination = {
  page: 1,
  pageSize: 10,
  total: 8,
  totalPages: 1,
};

/**
 * 状态标签映射
 */
export const statusLabels: Record<ListItemStatus, string> = {
  active: '活跃',
  inactive: '停用',
  pending: '待审核',
};

/**
 * 状态颜色映射
 */
export const statusColors: Record<ListItemStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};
