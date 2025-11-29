import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { PageHeader, StatCard, OverviewChart, RecentSales } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * 仪表盘页面
 * 展示系统概览和关键数据指标
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="仪表盘"
        description="欢迎回来！以下是您的业务概览。"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="reports">报表</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 统计卡片区域 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="总收入"
              value="¥45,231.89"
              change={{ value: 20.1, trend: 'up' }}
              description="相比上月"
              icon={DollarSign}
            />
            <StatCard
              title="订阅用户"
              value="+2,350"
              change={{ value: 180.1, trend: 'up' }}
              description="相比上月"
              icon={Users}
            />
            <StatCard
              title="销售额"
              value="+12,234"
              change={{ value: 19, trend: 'up' }}
              description="相比上月"
              icon={CreditCard}
            />
            <StatCard
              title="活跃用户"
              value="+573"
              change={{ value: 201, trend: 'up' }}
              description="相比上小时"
              icon={Activity}
            />
          </div>

          {/* 图表区域 */}
          <div className="grid gap-6 lg:grid-cols-7">
            <OverviewChart type="bar" className="lg:col-span-4" />
            <RecentSales className="lg:col-span-3" />
          </div>

          {/* 访问量趋势 */}
          <OverviewChart type="area" />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <OverviewChart type="area" />
            <OverviewChart type="bar" />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">报表功能开发中...</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">通知中心开发中...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
