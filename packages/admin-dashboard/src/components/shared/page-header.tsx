import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 右侧操作区域 */
  actions?: React.ReactNode;
  /** 额外的 className */
  className?: string;
}

/**
 * 页面标题栏组件
 * 用于页面顶部展示标题和操作按钮
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
