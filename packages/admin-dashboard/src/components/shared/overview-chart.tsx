'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const areaChartData = [
  { month: '1月', desktop: 186, mobile: 80 },
  { month: '2月', desktop: 305, mobile: 200 },
  { month: '3月', desktop: 237, mobile: 120 },
  { month: '4月', desktop: 73, mobile: 190 },
  { month: '5月', desktop: 209, mobile: 130 },
  { month: '6月', desktop: 214, mobile: 140 },
  { month: '7月', desktop: 280, mobile: 160 },
  { month: '8月', desktop: 320, mobile: 200 },
  { month: '9月', desktop: 290, mobile: 180 },
  { month: '10月', desktop: 350, mobile: 220 },
  { month: '11月', desktop: 400, mobile: 250 },
  { month: '12月', desktop: 450, mobile: 280 },
];

const barChartData = [
  { name: '1月', total: 4500 },
  { name: '2月', total: 3800 },
  { name: '3月', total: 5200 },
  { name: '4月', total: 4100 },
  { name: '5月', total: 4800 },
  { name: '6月', total: 6100 },
  { name: '7月', total: 5500 },
  { name: '8月', total: 4900 },
  { name: '9月', total: 5800 },
  { name: '10月', total: 6800 },
  { name: '11月', total: 7200 },
  { name: '12月', total: 8500 },
];

const areaChartConfig = {
  desktop: {
    label: '桌面端',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: '移动端',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const barChartConfig = {
  total: {
    label: '收入',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface OverviewChartProps {
  type?: 'area' | 'bar';
  className?: string;
}

/**
 * 概览图表组件
 * 支持面积图和柱状图两种类型
 */
export function OverviewChart({ type = 'area', className }: OverviewChartProps) {
  if (type === 'bar') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>收入概览</CardTitle>
          <CardDescription>2024年月度收入统计</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={barChartData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>访问量趋势</CardTitle>
        <CardDescription>2024年访问量按设备类型统计</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={areaChartConfig} className="h-[300px] w-full">
          <AreaChart data={areaChartData} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
