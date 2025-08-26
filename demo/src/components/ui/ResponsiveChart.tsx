/**
 * ResponsiveChart - 響應式圖表包裝器
 * 自動偵測父容器尺寸並調整圖表大小
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export interface ResponsiveChartProps {
  children: (dimensions: { width: number; height: number }) => React.ReactNode
  aspectRatio?: number // 預設 4:3
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  debounceMs?: number // resize 防抖動延遲
}

export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  children,
  aspectRatio = 4 / 3, // 4:3 比例
  minWidth = 300,
  minHeight = 200,
  maxWidth = 1200,
  maxHeight = 800,
  className = '',
  debounceMs = 150
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    
    if (containerWidth === 0) return

    // 計算適合的寬高
    let width = Math.max(minWidth, Math.min(maxWidth, containerWidth))
    let height = Math.round(width / aspectRatio)

    // 檢查高度限制
    if (height < minHeight) {
      height = minHeight
      width = Math.round(height * aspectRatio)
    } else if (height > maxHeight) {
      height = maxHeight
      width = Math.round(height * aspectRatio)
    }

    // 確保寬度不超過容器寬度
    if (width > containerWidth) {
      width = containerWidth
      height = Math.round(width / aspectRatio)
    }

    setDimensions({ width, height })
  }, [aspectRatio, minWidth, minHeight, maxWidth, maxHeight])

  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      calculateDimensions()
    }, debounceMs)
  }, [calculateDimensions, debounceMs])

  useEffect(() => {
    // 初始計算
    calculateDimensions()

    // 設置 ResizeObserver (具備 fallback)
    let resizeObserver: ResizeObserver | null = null
    
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      try {
        resizeObserver = new ResizeObserver(() => {
          debouncedResize()
        })
        resizeObserver.observe(containerRef.current)
      } catch (e) {
        console.warn('ResizeObserver not supported, falling back to window resize')
      }
    }

    // 窗口 resize 事件作為 fallback
    window.addEventListener('resize', debouncedResize)

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', debouncedResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [calculateDimensions, debouncedResize])

  return (
    <div
      ref={containerRef}
      className={`responsive-chart-container w-full ${className}`}
      style={{ minHeight: minHeight }}
    >
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <motion.div
          key={`${dimensions.width}-${dimensions.height}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex justify-center items-center"
        >
          {children(dimensions)}
        </motion.div>
      ) : (
        <div 
          className="flex justify-center items-center bg-gray-50 rounded-lg animate-pulse"
          style={{ height: Math.round(minWidth / aspectRatio) }}
        >
          <div className="text-gray-400 text-sm">
            調整圖表大小中...
          </div>
        </div>
      )}
    </div>
  )
}

// Hook 版本，用於更靈活的使用場景
export const useResponsiveChart = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    aspectRatio?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    debounceMs?: number
  } = {}
) => {
  const {
    aspectRatio = 4 / 3,
    minWidth = 300,
    minHeight = 200,
    maxWidth = 1200,
    maxHeight = 800,
    debounceMs = 150
  } = options

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    
    if (containerWidth === 0) return

    let width = Math.max(minWidth, Math.min(maxWidth, containerWidth))
    let height = Math.round(width / aspectRatio)

    if (height < minHeight) {
      height = minHeight
      width = Math.round(height * aspectRatio)
    } else if (height > maxHeight) {
      height = maxHeight
      width = Math.round(height * aspectRatio)
    }

    if (width > containerWidth) {
      width = containerWidth
      height = Math.round(width / aspectRatio)
    }

    setDimensions({ width, height })
  }, [containerRef, aspectRatio, minWidth, minHeight, maxWidth, maxHeight])

  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      calculateDimensions()
    }, debounceMs)
  }, [calculateDimensions, debounceMs])

  useEffect(() => {
    calculateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      debouncedResize()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', debouncedResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', debouncedResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [calculateDimensions, debouncedResize])

  return dimensions
}

export default ResponsiveChart