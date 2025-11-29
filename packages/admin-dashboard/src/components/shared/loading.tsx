import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /** 加载提示文字 */
  text?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否全屏 */
  fullScreen?: boolean;
  /** 额外的 className */
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * 加载状态组件
 */
export function Loading({
  text = '加载中...',
  size = 'md',
  fullScreen = false,
  className,
}: LoadingProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeMap[size])} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );

  return content;
}

/**
 * 页面加载骨架屏
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 标题区域 */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      {/* 内容区域 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
