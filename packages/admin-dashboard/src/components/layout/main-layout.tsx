'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/utils';
import { layoutConfig } from '@/config/layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局容器组件
 * 包含 Header、Sidebar、MobileNav 和主内容区域
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    layoutConfig.sidebar.defaultCollapsed
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <Header
        showMobileMenu
        onMobileMenuClick={() => setMobileNavOpen(true)}
      />

      {/* 移动端抽屉导航 */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="flex">
        {/* 侧边栏 - 仅在桌面端显示 */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* 主内容区域 - 铺满宽度 */}
        <main
          className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            'lg:ml-0'
          )}
          style={{
            minHeight: `calc(100vh - ${layoutConfig.header.height}px)`,
          }}
        >
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
