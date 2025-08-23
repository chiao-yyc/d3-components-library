import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

// === 錯誤邊界組件 ===
export class ChartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // 呼叫外部錯誤處理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <DefaultErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        onRetry={this.handleRetry}
      />
    }

    return this.props.children
  }
}

// === 預設錯誤回退組件 ===
interface DefaultErrorFallbackProps {
  error: Error | null
  errorInfo: any
  onRetry: () => void
}

export function DefaultErrorFallback({ error, errorInfo, onRetry }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            圖表載入失敗
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>圖表組件發生錯誤，請稍後重試。</p>
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={onRetry}
          className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          重新載入
        </button>
      </div>

      {isDevelopment && error && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
            開發者資訊 (點擊展開)
          </summary>
          <div className="bg-red-100 p-3 rounded text-xs text-red-900 font-mono overflow-auto">
            <div className="mb-2">
              <strong>錯誤訊息:</strong>
              <div>{error.message}</div>
            </div>
            {error.stack && (
              <div className="mb-2">
                <strong>堆疊追蹤:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
            {errorInfo && errorInfo.componentStack && (
              <div>
                <strong>組件堆疊:</strong>
                <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

// === 載入狀態組件 ===
export function LoadingState({ message = "載入中..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  )
}

// === 空狀態組件 ===
export function EmptyState({ 
  title = "無資料", 
  description = "沒有可顯示的資料",
  action
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// === 圖表包裝器組件 (整合錯誤邊界和載入狀態) ===
interface ChartWrapperProps {
  children: ReactNode
  loading?: boolean
  isEmpty?: boolean
  error?: Error | null
  loadingMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  onRetry?: () => void
  onError?: (error: Error, errorInfo: any) => void
}

export function ChartWrapper({
  children,
  loading = false,
  isEmpty = false,
  error,
  loadingMessage,
  emptyTitle,
  emptyDescription,
  onRetry,
  onError
}: ChartWrapperProps) {
  if (loading) {
    return <LoadingState message={loadingMessage} />
  }

  if (error) {
    return (
      <DefaultErrorFallback
        error={error}
        errorInfo={null}
        onRetry={onRetry || (() => window.location.reload())}
      />
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新載入
          </button>
        )}
      />
    )
  }

  return (
    <ChartErrorBoundary onError={onError}>
      {children}
    </ChartErrorBoundary>
  )
}