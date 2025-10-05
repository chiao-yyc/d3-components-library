import { useState, useCallback, useRef, useEffect } from 'react'
import { TooltipPosition, TooltipData, TooltipHook } from './types'

export interface UseTooltipOptions {
  hideDelay?: number
  showDelay?: number
  disabled?: boolean
}

export function useTooltip(options: UseTooltipOptions = {}): TooltipHook {
  const { hideDelay = 0, showDelay = 0, disabled = false } = options
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    position: TooltipPosition
    data: TooltipData | null
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    data: null
  })
  
  const hideTimeoutRef = useRef<number | undefined>()
  const showTimeoutRef = useRef<number | undefined>()
  
  // 清理定時器
  const clearTimeouts = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = undefined
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = undefined
    }
  }, [])
  
  // 顯示 tooltip
  const showTooltip = useCallback((position: TooltipPosition, data: TooltipData) => {
    if (disabled) return
    
    clearTimeouts()
    
    if (showDelay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setTooltip({
          visible: true,
          position,
          data
        })
      }, showDelay) as unknown as number
    } else {
      setTooltip({
        visible: true,
        position,
        data
      })
    }
  }, [disabled, showDelay, clearTimeouts])
  
  // 隱藏 tooltip
  const hideTooltip = useCallback(() => {
    clearTimeouts()
    
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setTooltip(prev => ({
          ...prev,
          visible: false
        }))
      }, hideDelay) as unknown as number
    } else {
      setTooltip(prev => ({
        ...prev,
        visible: false
      }))
    }
  }, [hideDelay, clearTimeouts])
  
  // 更新 tooltip
  const updateTooltip = useCallback((position: TooltipPosition, data?: TooltipData) => {
    if (disabled) return
    
    setTooltip(prev => ({
      visible: prev.visible,
      position,
      data: data || prev.data
    }))
  }, [disabled])
  
  // 清理效果
  useEffect(() => {
    return clearTimeouts
  }, [clearTimeouts])
  
  return {
    tooltip,
    showTooltip,
    hideTooltip,
    updateTooltip
  }
}

/**
 * 從 DOM 事件中獲取位置
 */
export function getPositionFromEvent(event: MouseEvent | React.MouseEvent): TooltipPosition {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

/**
 * 從 SVG 元素中獲取位置
 */
export function getPositionFromElement(element: SVGElement | HTMLElement): TooltipPosition {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top
  }
}

/**
 * 計算相對於容器的位置
 */
export function getRelativePosition(
  event: MouseEvent | React.MouseEvent,
  container: HTMLElement | SVGElement
): TooltipPosition {
  const containerRect = container.getBoundingClientRect()
  return {
    x: event.clientX - containerRect.left,
    y: event.clientY - containerRect.top
  }
}

/**
 * 便利的 Hook：用於 D3 元素事件處理
 */
export function useD3Tooltip(options: UseTooltipOptions = {}) {
  const { tooltip, showTooltip, hideTooltip, updateTooltip } = useTooltip(options)
  
  // 創建 D3 事件處理器
  const createD3Handlers = useCallback((getData: (d: any) => TooltipData) => {
    return {
      onMouseEnter: function(event: any, d: any) {
        const position = getPositionFromEvent(event)
        const data = getData(d)
        showTooltip(position, data)
      },
      onMouseMove: function(event: any, _d: any) {
        const position = getPositionFromEvent(event)
        updateTooltip(position)
      },
      onMouseLeave: function() {
        hideTooltip()
      }
    }
  }, [showTooltip, hideTooltip, updateTooltip])
  
  return {
    tooltip,
    showTooltip,
    hideTooltip,
    updateTooltip,
    createD3Handlers
  }
}