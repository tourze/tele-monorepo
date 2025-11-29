import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  /** 卡片标题 */
  title: string;
  /** 数值 */
  value: string | number;
  /** 变化信息 */
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  /** 图标 */
  icon?: LucideIcon;
  /** 描述文字 */
  description?: string;
  /** 额外的 className */
  className?: string;
}

/**
 * 统计卡片组件
 * 用于展示关键数据指标
 */
export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  const TrendIcon = change?.trend === 'up'
    ? TrendingUp
    : change?.trend === 'down'
    ? TrendingDown
    : Minus;

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 text-xs font-medium',
                change.trend === 'up' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                change.trend === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                change.trend === 'neutral' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {change.value > 0 ? '+' : ''}{change.value}%
            </Badge>
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
        {!change && description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
