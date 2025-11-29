'use client';

import { usePathname } from 'next/navigation';

/**
 * 检测当前路由是否激活
 * @param href - 目标路径
 * @param exact - 是否精确匹配（默认 false，支持子路由匹配）
 * @returns 是否激活
 */
export function useIsActiveRoute(href: string, exact = false): boolean {
  const pathname = usePathname();

  if (exact) {
    return pathname === href;
  }

  // 支持子路由匹配：/dashboard 匹配 /dashboard 和 /dashboard/xxx
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 获取当前活跃路由的基础路径
 * 用于确定导航分组的展开状态
 * @returns 当前路径的第一级路由
 */
export function useActiveRootPath(): string {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : '/';
}
