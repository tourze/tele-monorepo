import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const recentSalesData = [
  {
    name: '张三',
    email: 'zhangsan@email.com',
    amount: '+¥1,999.00',
    avatar: '',
  },
  {
    name: '李四',
    email: 'lisi@email.com',
    amount: '+¥39.00',
    avatar: '',
  },
  {
    name: '王五',
    email: 'wangwu@email.com',
    amount: '+¥299.00',
    avatar: '',
  },
  {
    name: '赵六',
    email: 'zhaoliu@email.com',
    amount: '+¥99.00',
    avatar: '',
  },
  {
    name: '孙七',
    email: 'sunqi@email.com',
    amount: '+¥2,499.00',
    avatar: '',
  },
];

interface RecentSalesProps {
  className?: string;
}

/**
 * 最近销售/交易列表组件
 */
export function RecentSales({ className }: RecentSalesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>最近销售</CardTitle>
        <CardDescription>本月共完成 265 笔交易</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentSalesData.map((sale, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={sale.avatar} alt={sale.name} />
                <AvatarFallback>{sale.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {sale.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {sale.email}
                </p>
              </div>
              <div className="ml-4 font-medium text-green-600 whitespace-nowrap text-sm">
                {sale.amount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
