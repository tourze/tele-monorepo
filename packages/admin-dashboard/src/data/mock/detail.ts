/**
 * 详情页模拟数据
 */

export interface DetailData {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 详情页示例数据
 */
export const detailData: DetailData = {
  id: 'DOC-001',
  title: '2024年度产品规划文档',
  content: `
## 概述

本文档概述了2024年度的产品发展规划，包括主要目标、关键里程碑和资源分配。

## 主要目标

1. **用户增长**: 实现用户数量翻倍增长
2. **产品优化**: 完成核心功能的重构和优化
3. **国际化**: 支持多语言版本，拓展海外市场
4. **AI集成**: 在产品中集成智能化功能

## 关键里程碑

- Q1: 完成基础架构升级
- Q2: 发布新版本核心功能
- Q3: 启动国际化项目
- Q4: AI功能上线

## 资源需求

团队需要增加前端工程师2名，后端工程师3名，设计师1名。
  `.trim(),
  status: 'published',
  author: {
    name: '产品经理',
    email: 'pm@example.com',
  },
  metadata: {
    版本: 'v1.2',
    分类: '产品规划',
    优先级: '高',
    审核状态: '已通过',
    浏览次数: '1,234',
  },
  createdAt: '2024-01-10 09:30:00',
  updatedAt: '2024-11-28 16:45:00',
};

/**
 * 状态标签映射
 */
export const detailStatusLabels: Record<DetailData['status'], string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

/**
 * 状态颜色映射
 */
export const detailStatusColors: Record<DetailData['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-orange-100 text-orange-800',
};
