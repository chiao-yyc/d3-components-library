import React, { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ChartContainerProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
  stats?: Array<{
    label: string
    value: string | number
    color?: string
  }>
  loading?: boolean
  error?: string
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  actions,
  stats,
  loading = false,
  error
}: ChartContainerProps) {
  if (error) {
    return (
      <div className={cn('bg-white rounded-lg border border-red-200 p-8', className)}>
        <div className="text-center text-red-600">
          <div className="text-lg font-medium mb-2">圖表錯誤</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {/* 標題區域 */}
      {(title || description || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      {stats && stats.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: stat.color || '#3b82f6' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 圖表內容 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
              <span className="text-sm">加載中...</span>
            </div>
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// 便利的統計組件
export function ChartStats({
  stats,
  className
}: {
  stats: Array<{
    label: string
    value: string | number
    color?: string
    trend?: 'up' | 'down' | 'stable'
  }>
  className?: string
}) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    } else if (trend === 'stable') {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div 
              className="text-2xl font-bold"
              style={{ color: stat.color || '#3b82f6' }}
            >
              {stat.value}
            </div>
            {stat.trend && (
              <div className="ml-2">
                {getTrendIcon(stat.trend)}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}