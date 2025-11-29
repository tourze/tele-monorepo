/**
 * 表单页模拟数据
 */

/**
 * 分类选项
 */
export const categoryOptions = [
  { value: 'technology', label: '技术' },
  { value: 'design', label: '设计' },
  { value: 'marketing', label: '市场' },
  { value: 'sales', label: '销售' },
  { value: 'support', label: '客服' },
];

/**
 * 标签选项
 */
export const tagOptions = [
  { value: 'urgent', label: '紧急' },
  { value: 'important', label: '重要' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '低优先级' },
];

/**
 * 表单默认值
 */
export interface FormData {
  name: string;
  email: string;
  description: string;
  category: string;
  enabled: boolean;
  tags: string[];
}

export const defaultFormData: FormData = {
  name: '',
  email: '',
  description: '',
  category: '',
  enabled: true,
  tags: [],
};

/**
 * 示例填充数据
 */
export const sampleFormData: FormData = {
  name: '示例项目',
  email: 'project@example.com',
  description: '这是一个示例项目的描述信息，用于演示表单页面的功能。',
  category: 'technology',
  enabled: true,
  tags: ['important', 'normal'],
};
