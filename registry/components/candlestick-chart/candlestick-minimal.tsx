import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface CandlestickData {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface MinimalCandlestickProps {
  data: CandlestickData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  className?: string
  /** 顏色模式：tw = 台股（紅漲綠跌），us = 美股（綠漲紅跌） */
  colorMode?: 'tw' | 'us' | 'custom'
  onCandleClick?: (data: CandlestickData) => void
}

/**
 * 極簡版 K線圖組件
 * 專注於穩定性和易用性，適合快速原型和基本需求
 */
export function MinimalCandlestick({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  className,
  colorMode = 'tw',
  onCandleClick
}: MinimalCandlestickProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data?.length) return

    // 清理之前的內容
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 處理並驗證數據
    const validData = data.map(d => {
      const date = d.date instanceof Date ? d.date : new Date(d.date)
      const open = Number(d.open)
      const high = Number(d.high)
      const low = Number(d.low)
      const close = Number(d.close)
      
      // 基本數據驗證
      if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        return null
      }
      
      if (high < Math.max(open, close) || low > Math.min(open, close)) {
        return null
      }

      return {
        ...d,
        date,
        open,
        high,
        low,
        close,
        direction: close >= open ? 'up' : 'down'
      }
    }).filter(Boolean) as Array<CandlestickData & { direction: 'up' | 'down' }>

    if (!validData.length) return

    // 計算尺寸
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // 創建比例尺
    const xScale = d3.scaleTime()
      .domain(d3.extent(validData, d => d.date) as [Date, Date])
      .range([0, chartWidth])

    const allPrices = validData.flatMap(d => [d.low, d.high])
    const yScale = d3.scaleLinear()
      .domain(d3.extent(allPrices) as [number, number])
      .nice()
      .range([chartHeight, 0])

    // 顏色配置
    const colors = colorMode === 'tw' 
      ? { up: '#ef4444', down: '#22c55e' }  // 台股：紅漲綠跌
      : colorMode === 'us'
      ? { up: '#22c55e', down: '#ef4444' }  // 美股：綠漲紅跌
      : { up: '#10b981', down: '#f59e0b' }  // 自定義：藍綠漲橙跌

    // 創建主要繪圖區域
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 計算蠟燭寬度
    const candleWidth = Math.max(2, Math.min(15, chartWidth / validData.length * 0.8))

    // 繪製每根蠟燭
    validData.forEach(d => {
      const x = xScale(d.date)
      const color = colors[d.direction]

      // 影線（最高到最低的直線）
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', yScale(d.high))
        .attr('y2', yScale(d.low))
        .attr('stroke', color)
        .attr('stroke-width', 1)

      // 實體（開盤到收盤的矩形）
      const bodyTop = Math.max(d.open, d.close)
      const bodyBottom = Math.min(d.open, d.close)
      const bodyHeight = Math.max(1, yScale(bodyBottom) - yScale(bodyTop))

      const rect = g.append('rect')
        .attr('x', x - candleWidth / 2)
        .attr('y', yScale(bodyTop))
        .attr('width', candleWidth)
        .attr('height', bodyHeight)
        .attr('fill', color)
        .attr('stroke', color)
        .attr('stroke-width', 0.5)
        .style('cursor', onCandleClick ? 'pointer' : 'default')

      // 點擊事件
      if (onCandleClick) {
        rect.on('click', () => onCandleClick(d))
      }
    })

    // 繪製坐標軸
    // X軸
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')

    // Y軸
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')

    // 軸線樣式
    svg.selectAll('.domain')
      .style('stroke', '#ccc')
    
    svg.selectAll('.tick line')
      .style('stroke', '#eee')

  }, [data, width, height, margin, colorMode, onCandleClick])

  if (!data?.length) {
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