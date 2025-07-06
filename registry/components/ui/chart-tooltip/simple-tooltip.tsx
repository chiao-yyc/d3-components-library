import React from 'react'
import { cn } from '../../../utils/cn'

interface SimpleTooltipProps {
  visible: boolean
  x: number
  y: number
  content: React.ReactNode
  className?: string
  theme?: 'light' | 'dark'
  offset?: { x: number; y: number }
}

export function SimpleTooltip({
  visible,
  x,
  y,
  content,
  className,
  theme = 'dark',
  offset = { x: 10, y: -10 }
}: SimpleTooltipProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap',
        {
          'bg-gray-800 text-white': theme === 'dark',
          'bg-white text-gray-900 border border-gray-200': theme === 'light',
        },
        className
      )}
      style={{
        left: x + offset.x,
        top: y + offset.y,
      }}
    >
      {content}
    </div>
  )
}

// 便利的格式化函數
export function formatTooltipContent(label: string, value: any): React.ReactNode {
  return (
    <div>
      {label}: {typeof value === 'number' ? value.toLocaleString() : String(value)}
    </div>
  )
}