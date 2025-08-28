import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '../../../utils/cn'
import { ChartTooltipProps, TooltipPosition, TooltipContent } from './types'

export function ChartTooltip({
  visible,
  position,
  content,
  data,
  formatter,
  className,
  style,
  theme = 'dark',
  offset = { x: 10, y: 10 },
  placement = 'auto',
  container,
  boundary,
  animate = true,
  animationDuration = 200,
  interactive = false,
  hideDelay = 0,
  showDelay = 0,
  showArrow = true,
  arrowSize = 6,
  maxWidth = 300,
  multiline = true,
  html = false,
  ...props
}: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position || { x: 0, y: 0 })
  const [actualPlacement, setActualPlacement] = useState<string>('top')
  const hideTimeoutRef = useRef<number | undefined>()
  const showTimeoutRef = useRef<number | undefined>()

  // 計算調整後的位置
  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current || !visible || !position) return

    const tooltip = tooltipRef.current
    const rect = tooltip.getBoundingClientRect()
    const containerEl = container || document.body
    const boundaryEl = boundary || document.documentElement
    
    const containerRect = containerEl.getBoundingClientRect()
    const boundaryRect = boundaryEl.getBoundingClientRect()
    
    let adjustedX = position.x + offset.x
    let adjustedY = position.y + offset.y
    let actualPlacement = placement

    // 自動調整位置
    if (placement === 'auto') {
      const spaceTop = position.y - boundaryRect.top
      const spaceBottom = boundaryRect.bottom - position.y
      const spaceLeft = position.x - boundaryRect.left
      const spaceRight = boundaryRect.right - position.x

      // 選擇空間最大的方向
      if (spaceBottom >= rect.height + offset.y) {
        actualPlacement = 'bottom'
        adjustedY = position.y + offset.y
      } else if (spaceTop >= rect.height + offset.y) {
        actualPlacement = 'top'
        adjustedY = position.y - rect.height - offset.y
      } else if (spaceRight >= rect.width + offset.x) {
        actualPlacement = 'right'
        adjustedX = position.x + offset.x
        adjustedY = position.y - rect.height / 2
      } else {
        actualPlacement = 'left'
        adjustedX = position.x - rect.width - offset.x
        adjustedY = position.y - rect.height / 2
      }
    } else {
      // 手動設定位置
      switch (placement) {
        case 'top':
          adjustedY = position.y - rect.height - offset.y
          adjustedX = position.x - rect.width / 2
          break
        case 'bottom':
          adjustedY = position.y + offset.y
          adjustedX = position.x - rect.width / 2
          break
        case 'left':
          adjustedX = position.x - rect.width - offset.x
          adjustedY = position.y - rect.height / 2
          break
        case 'right':
          adjustedX = position.x + offset.x
          adjustedY = position.y - rect.height / 2
          break
      }
    }

    // 邊界檢查和調整
    if (adjustedX < boundaryRect.left) {
      adjustedX = boundaryRect.left + 5
    } else if (adjustedX + rect.width > boundaryRect.right) {
      adjustedX = boundaryRect.right - rect.width - 5
    }

    if (adjustedY < boundaryRect.top) {
      adjustedY = boundaryRect.top + 5
    } else if (adjustedY + rect.height > boundaryRect.bottom) {
      adjustedY = boundaryRect.bottom - rect.height - 5
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY })
    setActualPlacement(actualPlacement)
  }, [position, offset, placement, container, boundary, visible])

  // 當位置改變時重新計算
  useEffect(() => {
    if (visible) {
      // 延遲計算以確保 DOM 已更新
      const timer = setTimeout(calculatePosition, 0)
      return () => clearTimeout(timer)
    }
  }, [visible, position, calculatePosition])

  // 處理延遲顯示/隐藏
  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
    }
  }, [])

  // 渲染內容
  const renderContent = () => {
    if (content) {
      if (React.isValidElement(content)) {
        return content
      }
      if (typeof content === 'object' && 'items' in content) {
        return renderTooltipContent(content as TooltipContent)
      }
    }

    if (data && formatter) {
      const formattedContent = formatter(data)
      if (React.isValidElement(formattedContent)) {
        return formattedContent
      }
      if (typeof formattedContent === 'object' && 'items' in formattedContent) {
        return renderTooltipContent(formattedContent as TooltipContent)
      }
    }

    if (data) {
      return renderDefaultContent()
    }

    return null
  }

  // 渲染預設內容
  const renderDefaultContent = () => {
    if (!data) return null

    return (
      <div className="space-y-1">
        {data.series && (
          <div className="font-medium text-sm">{data.series}</div>
        )}
        <div className="text-xs">
          {Object.entries(data.data || data).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between gap-2">
              <span className="text-gray-300">{key}:</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染結構化內容
  const renderTooltipContent = (tooltipContent: TooltipContent) => {
    return (
      <div className="space-y-1">
        {tooltipContent.title && (
          <div className="font-medium text-sm border-b border-gray-600 pb-1">
            {tooltipContent.title}
          </div>
        )}
        <div className="space-y-1">
          {tooltipContent.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                {item.color && (
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-gray-300">{item.label}:</span>
              </div>
              <span className="font-medium">
                {item.format ? item.format(item.value) : String(item.value)}
              </span>
            </div>
          ))}
        </div>
        {tooltipContent.footer && (
          <div className="text-xs text-gray-400 border-t border-gray-600 pt-1">
            {tooltipContent.footer}
          </div>
        )}
      </div>
    )
  }

  // 箭頭樣式
  const arrowStyle = showArrow ? {
    '--arrow-size': `${arrowSize}px`,
  } as React.CSSProperties : {}

  if (!visible) return null

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 pointer-events-none',
        'px-3 py-2 rounded-md shadow-lg',
        'text-sm leading-relaxed',
        {
          'bg-gray-900 text-white border border-gray-700': theme === 'dark',
          'bg-white text-gray-900 border border-gray-200 shadow-md': theme === 'light',
        },
        {
          'pointer-events-auto': interactive,
        },
        {
          'transition-all duration-200 ease-out': animate,
        },
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        maxWidth,
        ...arrowStyle,
        ...style,
      }}
      {...props}
    >
      {/* 暫時移除箭頭以確認問題 */}
      
      {/* 內容 */}
      <div className={cn(multiline ? 'whitespace-pre-wrap' : 'whitespace-nowrap')}>
        {renderContent()}
      </div>
    </div>
  )
}