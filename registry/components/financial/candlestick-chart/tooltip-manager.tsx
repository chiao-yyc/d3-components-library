import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { clamp } from '../../../utils/interaction-helpers'

export interface TooltipData {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
  volume?: number
  change?: number
  changePercent?: number
}

export interface TooltipManagerProps {
  data: TooltipData | null
  mousePosition: { x: number; y: number } | null
  containerRef: React.RefObject<HTMLElement>
  visible?: boolean
  className?: string
  style?: React.CSSProperties
  formatter?: {
    date?: (date: string | Date) => string
    price?: (price: number) => string
    volume?: (volume: number) => string
    percent?: (percent: number) => string
  }
  colorMode?: 'taiwan' | 'us'
  offset?: { x: number; y: number }
  boundary?: { padding: number }
}

const DefaultFormatter = {
  date: (date: string | Date) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    })
  },
  price: (price: number) => price.toFixed(2),
  volume: (volume: number) => {
    if (volume >= 1e8) return `${(volume / 1e8).toFixed(1)}億`
    if (volume >= 1e4) return `${(volume / 1e4).toFixed(1)}萬`
    return volume.toLocaleString()
  },
  percent: (percent: number) => `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`
}

export const TooltipManager: React.FC<TooltipManagerProps> = ({
  data,
  mousePosition,
  containerRef,
  visible = true,
  className = '',
  style = {},
  formatter = DefaultFormatter,
  colorMode = 'taiwan',
  offset = { x: 15, y: -10 },
  boundary = { padding: 10 }
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [shouldRender, setShouldRender] = useState(false)

  const formatters = { ...DefaultFormatter, ...formatter }

  // 計算工具提示位置
  const calculatePosition = useCallback(() => {
    if (!mousePosition || !containerRef.current || !tooltipRef.current) return

    const container = containerRef.current
    const tooltip = tooltipRef.current
    const containerRect = container.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    // 基礎位置：滑鼠位置 + 偏移量
    let x = mousePosition.x + offset.x
    let y = mousePosition.y + offset.y

    // 邊界檢測與調整
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    const tooltipWidth = tooltipRect.width || 200 // 預設寬度
    const tooltipHeight = tooltipRect.height || 150 // 預設高度

    // 右邊界檢測
    if (x + tooltipWidth > containerWidth - boundary.padding) {
      x = mousePosition.x - tooltipWidth - Math.abs(offset.x)
    }

    // 下邊界檢測
    if (y + tooltipHeight > containerHeight - boundary.padding) {
      y = mousePosition.y - tooltipHeight - Math.abs(offset.y)
    }

    // 左邊界檢測
    x = clamp(x, boundary.padding, containerWidth - tooltipWidth - boundary.padding)
    
    // 上邊界檢測
    y = clamp(y, boundary.padding, containerHeight - tooltipHeight - boundary.padding)

    setPosition({ x, y })
  }, [mousePosition, containerRef, offset, boundary])

  // 監聽位置變化
  useEffect(() => {
    if (visible && data && mousePosition) {
      setShouldRender(true)
      // 延遲計算位置，確保 DOM 已渲染
      requestAnimationFrame(() => {
        calculatePosition()
      })
    } else {
      setShouldRender(false)
    }
  }, [visible, data, mousePosition, calculatePosition])

  // 視窗大小改變時重新計算位置
  useEffect(() => {
    const handleResize = () => {
      if (shouldRender) {
        calculatePosition()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [shouldRender, calculatePosition])

  if (!shouldRender || !data) return null

  // 計算漲跌顏色
  const getPriceColor = (open: number, close: number) => {
    if (colorMode === 'taiwan') {
      return close > open ? '#ef4444' : close < open ? '#22c55e' : '#64748b'
    } else {
      return close > open ? '#22c55e' : close < open ? '#ef4444' : '#64748b'
    }
  }

  const priceColor = getPriceColor(data.open, data.close)
  const change = data.change ?? (data.close - data.open)
  const changePercent = data.changePercent ?? ((data.close - data.open) / data.open * 100)

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`candlestick-tooltip ${className}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        lineHeight: '1.4',
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'none',
        transform: 'translateZ(0)', // 硬體加速
        ...style
      }}
    >
      {/* 日期 */}
      <div className="tooltip-date" style={{ 
        marginBottom: '8px', 
        fontWeight: '500',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '6px'
      }}>
        {formatters.date(data.date)}
      </div>

      {/* OHLC 數據 */}
      <div className="tooltip-ohlc" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>開盤:</span>
          <span>{formatters.price(data.open)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>最高:</span>
          <span style={{ color: '#ef4444' }}>{formatters.price(data.high)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>最低:</span>
          <span style={{ color: '#22c55e' }}>{formatters.price(data.low)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>收盤:</span>
          <span style={{ color: priceColor, fontWeight: '600' }}>
            {formatters.price(data.close)}
          </span>
        </div>
      </div>

      {/* 漲跌幅 */}
      <div className="tooltip-change" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: data.volume ? '8px' : '0'
      }}>
        <span>漲跌:</span>
        <span style={{ color: priceColor }}>
          {change > 0 ? '+' : ''}{formatters.price(change)} ({formatters.percent(changePercent)})
        </span>
      </div>

      {/* 成交量 */}
      {data.volume && (
        <div className="tooltip-volume" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '6px'
        }}>
          <span>成交量:</span>
          <span>{formatters.volume(data.volume)}</span>
        </div>
      )}
    </div>
  )

  // 使用 Portal 渲染到 body，避免被容器裁切
  return createPortal(
    tooltipContent,
    document.body
  )
}

export default TooltipManager