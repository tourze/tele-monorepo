'use client';

import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { layoutConfig } from '@/config/layout';

interface HeaderProps {
  /** 是否显示移动端菜单按钮 */
  showMobileMenu?: boolean;
  /** 移动端菜单按钮点击事件 */
  onMobileMenuClick?: () => void;
}

/**
 * 顶部导航栏组件
 */
export function Header({ showMobileMenu = false, onMobileMenuClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ height: layoutConfig.header.height }}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* 左侧: Logo 和移动端菜单按钮 */}
        <div className="flex items-center gap-4">
          {showMobileMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">打开菜单</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">后台管理</span>
          </div>
        </div>

        {/* 右侧: 通知和用户菜单 */}
        <div className="flex items-center gap-2">
          {/* 通知按钮 */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">通知</span>
          </Button>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="用户头像" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">管理员</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>个人设置</DropdownMenuItem>
              <DropdownMenuItem>退出登录</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
