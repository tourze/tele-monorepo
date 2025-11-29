'use client';

import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { PageHeader, ContentCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  categoryOptions,
  defaultFormData,
  type FormData,
} from '@/data/mock/form';

/**
 * 表单页面
 * 展示各种表单控件的使用方式
 */
export default function FormPage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟提交延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Form submitted:', formData);
    alert('表单提交成功！（模拟）');
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData(defaultFormData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="表单页面"
        description="创建或编辑数据项，展示各种表单控件的使用"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 基本信息 */}
          <div className="lg:col-span-2">
            <ContentCard title="基本信息" description="填写项目的基本信息">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">名称 *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="请输入名称"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="请输入详细描述..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            </ContentCard>
          </div>

          {/* 设置 */}
          <div className="space-y-6">
            <ContentCard title="设置" description="配置项目相关选项">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enabled">启用状态</Label>
                    <p className="text-sm text-muted-foreground">
                      启用后将立即生效
                    </p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
              </div>
            </ContentCard>

            {/* 操作按钮 */}
            <ContentCard>
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重置
                </Button>
              </div>
            </ContentCard>
          </div>
        </div>
      </form>
    </div>
  );
}
