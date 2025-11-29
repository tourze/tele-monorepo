import { ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, ContentCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  detailData,
  detailStatusLabels,
  detailStatusColors,
} from '@/data/mock/detail';

/**
 * 详情页面
 * 展示单条数据的详细信息
 */
export default function DetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">返回</span>
          </Link>
        </Button>
        <PageHeader
          title={detailData.title}
          description={`文档编号: ${detailData.id}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                分享
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 主要内容 */}
        <div className="lg:col-span-2">
          <ContentCard>
            <div className="prose prose-sm max-w-none">
              <div className="mb-4 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={detailStatusColors[detailData.status]}
                >
                  {detailStatusLabels[detailData.status]}
                </Badge>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {detailData.content}
              </div>
            </div>
          </ContentCard>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 作者信息 */}
          <ContentCard title="作者信息">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {detailData.author.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{detailData.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {detailData.author.email}
                </p>
              </div>
            </div>
          </ContentCard>

          {/* 元数据 */}
          <ContentCard title="详细信息">
            <div className="space-y-3">
              {Object.entries(detailData.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">创建时间</span>
                <span className="font-medium">{detailData.createdAt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">更新时间</span>
                <span className="font-medium">{detailData.updatedAt}</span>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
