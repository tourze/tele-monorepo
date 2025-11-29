import { PageSkeleton } from '@/components/shared';

/**
 * 全局加载状态
 * Next.js App Router 会在页面加载时自动显示此组件
 */
export default function Loading() {
  return <PageSkeleton />;
}
