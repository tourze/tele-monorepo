'use client';

import { useState, useEffect } from 'react';
import { layoutConfig } from '@/config/layout';

/**
 * 检测当前是否为移动端设备
 * @returns 是否为移动端
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < layoutConfig.breakpoints.mobile);
    };

    // 初始检测
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * 检测当前是否为平板设备
 * @returns 是否为平板
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(
        width >= layoutConfig.breakpoints.mobile &&
          width < layoutConfig.breakpoints.desktop
      );
    };

    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  return isTablet;
}

/**
 * 获取当前设备类型
 * @returns 设备类型: 'mobile' | 'tablet' | 'desktop'
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < layoutConfig.breakpoints.mobile) {
        setDeviceType('mobile');
      } else if (width < layoutConfig.breakpoints.desktop) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
}
