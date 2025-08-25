import React, { useEffect, useRef, useState, useCallback, ReactNode } from 'react'

export interface ResponsiveChartContainerProps {
  children: (dimensions: { width: number; height: number }) => ReactNode
  aspect?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  debounceMs?: number
  className?: string
  style?: React.CSSProperties
}

export const ResponsiveChartContainer: React.FC<ResponsiveChartContainerProps> = ({
  children,
  aspect = 4/3,  // 預設使用 4:3 比例，更適合大多數圖表
  minWidth = 200,
  maxWidth = Infinity,
  minHeight = 150,
  maxHeight = Infinity,
  debounceMs = 100,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()
  const prevDimensionsRef = useRef({ width: 0, height: 0 })

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(containerRef.current)
    
    // 計算可用的內容區域，扣除 padding 和 border
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0
    
    const availableWidth = containerRect.width - paddingLeft - paddingRight - borderLeft - borderRight
    const availableHeight = containerRect.height - paddingTop - paddingBottom - borderTop - borderBottom
    
    let width = Math.max(minWidth, Math.min(maxWidth, availableWidth))
    let height: number

    if (aspect) {
      height = width / aspect
    } else {
      height = Math.max(minHeight, Math.min(maxHeight, availableHeight || width * 0.6))
    }

    height = Math.max(minHeight, Math.min(maxHeight, height))

    const prevDimensions = prevDimensionsRef.current
    if (prevDimensions.width !== width || prevDimensions.height !== height) {
      prevDimensionsRef.current = { width, height }
      setDimensions({ width, height })
    }
  }, [aspect, minWidth, maxWidth, minHeight, maxHeight])

  const debouncedUpdateDimensions = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(updateDimensions, debounceMs)
  }, [updateDimensions, debounceMs])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(debouncedUpdateDimensions)
    resizeObserver.observe(containerRef.current)

    updateDimensions()

    return () => {
      resizeObserver.disconnect()
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [debouncedUpdateDimensions, updateDimensions])

  useEffect(() => {
    const handleResize = debouncedUpdateDimensions
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [debouncedUpdateDimensions])

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container ${className}`}
      style={{
        width: '100%',
        height: aspect ? 'auto' : '100%',
        minWidth: minWidth,
        minHeight: minHeight,
        ...style
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && children(dimensions)}
    </div>
  )
}

export interface ResponsiveChartProps {
  children: ReactNode
  aspect?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  debounceMs?: number
  className?: string
  style?: React.CSSProperties
}

export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  children,
  ...containerProps
}) => {
  return (
    <ResponsiveChartContainer {...containerProps}>
      {() => children}
    </ResponsiveChartContainer>
  )
}