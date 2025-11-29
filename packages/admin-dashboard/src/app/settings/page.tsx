'use client';

import { useState } from 'react';
import { Save, User, Bell, Shield, Globe } from 'lucide-react';
import { PageHeader, ContentCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  defaultSettings,
  languageOptions,
  timezoneOptions,
  dateFormatOptions,
  type SettingsData,
} from '@/data/mock/settings';

/**
 * 设置页面
 * 展示选项卡式的设置界面
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Settings saved:', settings);
    alert('设置保存成功！（模拟）');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="系统设置"
        description="管理您的账户设置和偏好配置"
        actions={
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            隐私设置
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            偏好设置
          </TabsTrigger>
        </TabsList>

        {/* 个人资料 */}
        <TabsContent value="profile">
          <ContentCard title="个人资料" description="更新您的个人信息">
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, bio: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </ContentCard>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <ContentCard title="通知设置" description="配置您希望接收的通知类型">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-muted-foreground">
                    接收重要更新的邮件通知
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>推送通知</Label>
                  <p className="text-sm text-muted-foreground">
                    在浏览器中接收推送通知
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>短信通知</Label>
                  <p className="text-sm text-muted-foreground">
                    接收紧急通知的短信
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>周报</Label>
                  <p className="text-sm text-muted-foreground">
                    每周接收系统使用情况报告
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        weeklyReport: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </ContentCard>
        </TabsContent>

        {/* 隐私设置 */}
        <TabsContent value="privacy">
          <ContentCard title="隐私设置" description="管理您的隐私和数据可见性">
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>公开资料</Label>
                  <p className="text-sm text-muted-foreground">
                    允许其他用户查看您的资料
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, publicProfile: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>显示邮箱</Label>
                  <p className="text-sm text-muted-foreground">
                    在资料中显示您的邮箱地址
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showEmail}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>显示活动</Label>
                  <p className="text-sm text-muted-foreground">
                    允许其他用户查看您的活动记录
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showActivity}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showActivity: checked },
                    }))
                  }
                />
              </div>
            </div>
          </ContentCard>
        </TabsContent>

        {/* 偏好设置 */}
        <TabsContent value="preferences">
          <ContentCard title="偏好设置" description="配置语言、时区等偏好">
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>语言</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>时区</Label>
                <Select
                  value={settings.preferences.timezone}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>日期格式</Label>
                <Select
                  value={settings.preferences.dateFormat}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, dateFormat: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ContentCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
