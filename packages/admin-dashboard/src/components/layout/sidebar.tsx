'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  Building2,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navItems } from '@/config/nav';
import { layoutConfig } from '@/config/layout';

interface SidebarProps {
  /** 是否收起状态 */
  collapsed?: boolean;
  /** 收起状态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
}

const teams = [
  { name: 'Acme Inc', logo: Building2 },
  { name: 'Monster Corp', logo: Building2 },
  { name: 'Stark Industries', logo: Building2 },
];

/**
 * 侧边栏导航组件
 */
export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60'
      )}
      style={{
        width: isCollapsed
          ? layoutConfig.sidebar.collapsedWidth
          : layoutConfig.sidebar.width,
      }}
    >
      {/* 团队切换器 */}
      <div className="flex h-14 items-center border-b px-3">
        {isCollapsed ? (
          <Button variant="ghost" size="icon" className="mx-auto">
            <Building2 className="h-5 w-5" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between px-2 h-10"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                    <selectedTeam.logo className="h-4 w-4" />
                  </div>
                  <span className="font-semibold truncate">
                    {selectedTeam.name}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>切换团队</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setSelectedTeam(team)}
                  className={cn(
                    selectedTeam.name === team.name && 'bg-accent'
                  )}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground mr-2">
                    <team.logo className="h-4 w-4" />
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 折叠按钮 */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className={cn('w-full', isCollapsed && 'px-2')}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              isCollapsed && 'rotate-180'
            )}
          />
          {!isCollapsed && (
            <span className="ml-2">收起侧边栏</span>
          )}
        </Button>
      </div>

    </aside>
  );
}
