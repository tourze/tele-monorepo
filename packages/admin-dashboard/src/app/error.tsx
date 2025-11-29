'use client';

import { ErrorDisplay } from '@/components/shared';

/**
 * 全局错误处理页面
 * Next.js App Router 会在页面出错时自动显示此组件
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} />;
}
