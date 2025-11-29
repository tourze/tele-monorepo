import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  /** 卡片标题 */
  title?: string;
  /** 卡片描述 */
  description?: string;
  /** 卡片内容 */
  children: React.ReactNode;
  /** 右上角操作区域 */
  headerActions?: React.ReactNode;
  /** 是否显示内边距 */
  noPadding?: boolean;
  /** 额外的 className */
  className?: string;
}

/**
 * 内容卡片容器组件
 * 用于包装页面内容区块
 */
export function ContentCard({
  title,
  description,
  children,
  headerActions,
  noPadding = false,
  className,
}: ContentCardProps) {
  const hasHeader = title || description || headerActions;

  return (
    <Card className={cn('overflow-hidden', className)}>
      {hasHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        noPadding && 'p-0',
        !hasHeader && 'pt-6'
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
