import React, { useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimpleCandlestickData {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface SimpleCandlestickProps {
  data: SimpleCandlestickData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colorMode?: 'tw' | 'us' | 'custom'
  upColor?: string
  downColor?: string
  showVolume?: boolean
  className?: string
  onCandleClick?: (data: SimpleCandlestickData) => void
}

export function SimpleCandlestick({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  colorMode = 'tw',
  upColor,
  downColor,
  showVolume = false,
  className,
  onCandleClick
}: SimpleCandlestickProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // 處理數據
  const processedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      date: d.date instanceof Date ? d.date : new Date(d.date),
      direction: d.close >= d.open ? 'up' : 'down'
    })).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [data])

  // 顏色配置
  const colors = useMemo(() => {
    if (colorMode === 'us') {
      return {
        up: upColor || '#22c55e',
        down: downColor || '#ef4444'
      }
    } else if (colorMode === 'tw') {
      return {
        up: upColor || '#ef4444',
        down: downColor || '#22c55e'
      }
    }
    return {
      up: upColor || '#10b981',
      down: downColor || '#f59e0b'
    }
  }, [colorMode, upColor, downColor])

  useEffect(() => {
    if (!svgRef.current || !processedData.length) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 計算尺寸
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // 創建比例尺
    const dateExtent = d3.extent(processedData, d => d.date) as [Date, Date]
    const xScale = d3.scaleTime()
      .domain(dateExtent)
      .range([0, chartWidth])

    const allPrices = processedData.flatMap(d => [d.low, d.high])
    const yExtent = d3.extent(allPrices) as [number, number]
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([chartHeight, 0])

    // 主要繪圖區域
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 計算蠟燭寬度
    const candleWidth = Math.max(3, Math.min(20, chartWidth / processedData.length * 0.7))

    // 繪製蠟燭
    const candles = g.selectAll('.candlestick')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .style('cursor', onCandleClick ? 'pointer' : 'default')

    // 影線（上下影線）
    candles.append('line')
      .attr('class', 'wick')
      .attr('x1', d => xScale(d.date))
      .attr('x2', d => xScale(d.date))
      .attr('y1', d => yScale(d.high))
      .attr('y2', d => yScale(d.low))
      .attr('stroke', d => colors[d.direction])
      .attr('stroke-width', 1)

    // 實體（開收盤價之間的矩形）
    candles.append('rect')
      .attr('class', 'body')
      .attr('x', d => xScale(d.date) - candleWidth / 2)
      .attr('y', d => yScale(Math.max(d.open, d.close)))
      .attr('width', candleWidth)
      .attr('height', d => Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
      .attr('fill', d => colors[d.direction])
      .attr('stroke', d => colors[d.direction])
      .attr('stroke-width', 0.5)

    // 點擊事件
    if (onCandleClick) {
      candles.on('click', function(event, d) {
        onCandleClick(d)
      })
    }

    // 繪製坐標軸
    // X軸
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')))

    // Y軸
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))

    // 樣式調整
    svg.selectAll('.domain')
      .style('stroke', '#ccc')
    
    svg.selectAll('.tick line')
      .style('stroke', '#eee')
      
    svg.selectAll('.tick text')
      .style('font-size', '12px')
      .style('fill', '#666')

  }, [processedData, width, height, margin, colors, onCandleClick])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無 K線 資料可顯示
      </div>
    )
  }

  return (
    <div className={cn('candlestick-container', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="candlestick-svg"
      />
    </div>
  )
}