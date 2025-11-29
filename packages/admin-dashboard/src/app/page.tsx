import { redirect } from 'next/navigation';

/**
 * 首页 - 重定向到仪表盘
 */
export default function Home() {
  redirect('/dashboard');
}
