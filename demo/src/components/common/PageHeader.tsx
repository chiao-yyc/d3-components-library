import React, { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
  actions?: ReactNode
  breadcrumb?: Array<{
    label: string
    href?: string
  }>
  badge?: {
    text: string
    variant: 'default' | 'success' | 'warning' | 'error'
  }
}

export function PageHeader({
  title,
  description,
  className,
  actions,
  breadcrumb,
  badge
}: PageHeaderProps) {
  const getBadgeColor = (variant: string) => {
    const variants = {
      default: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }
    return variants[variant as keyof typeof variants] || variants.default
  }

  return (
    <div className={cn('pb-8', className)}>
      {/* 麵包屑導航 */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={index === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : ''}>{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* 主要標題區域 */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {badge && (
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getBadgeColor(badge.variant)
              )}>
                {badge.text}
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-600 max-w-3xl">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex-shrink-0 ml-6">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// 便利的動作按鈕組件
export function HeaderActions({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {children}
    </div>
  )
}

// 標準按鈕樣式
export function ActionButton({
  children,
  onClick,
  variant = 'default',
  size = 'medium',
  disabled = false,
  className
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}) {
  const getVariantClasses = (variant: string) => {
    const variants = {
      default: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700'
    }
    return variants[variant as keyof typeof variants] || variants.default
  }

  const getSizeClasses = (size: string) => {
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base'
    }
    return sizes[size as keyof typeof sizes] || sizes.medium
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center border font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
    >
      {children}
    </button>
  )
}