'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * 错误边界组件
 * 捕获子组件的渲染错误并显示友好的错误界面
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">出错了</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {this.state.error?.message || '页面加载时发生错误，请尝试刷新页面'}
            </p>
          </div>
          <Button onClick={this.handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 错误显示组件（用于 error.tsx）
 */
interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorDisplay({ error, reset }: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">出错了</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || '页面加载时发生错误，请尝试刷新页面'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            错误代码: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        重试
      </Button>
    </div>
  );
}
