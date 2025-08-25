import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { ResponsiveChartContainer } from '../../primitives/canvas/responsive-chart-container'

// 預設配置
const DEFAULT_COLORS = {
  tw: { up: '#ef4444', down: '#22c55e', doji: '#6b7280' }, // 台股：紅漲綠跌
  us: { up: '#22c55e', down: '#ef4444', doji: '#6b7280' }, // 美股：綠漲紅跌
  custom: { up: '#10b981', down: '#f59e0b', doji: '#6b7280' }
}

export function CandlestickChart({
  data = [],
  colorMode = 'tw',
  candleWidth = 0.8,
  wickWidth = 1,
  showVolume = true,
  volumeHeightRatio = 0.25,
  showGrid = true,
  animate = true,
  interactive = true,
  showTooltip = true,
  onDataClick,
  onDataHover,
  onCandleClick,
  onCandleHover,
  className,
  style,
  ...props
}: any) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [processedData, setProcessedData] = useState<any[]>([])

  // 處理數據
  useEffect(() => {
    if (!data?.length) return

    const processed = data.map((d: any, index: number) => {
      const date = new Date(d.date)
      const open = Number(d.open)
      const high = Number(d.high)
      const low = Number(d.low)
      const close = Number(d.close)
      const volume = d.volume ? Number(d.volume) : 0
      
      const change = close - open
      const changePercent = open !== 0 ? (change / open) * 100 : 0
      let direction: 'up' | 'down' | 'doji' = 'doji'
      
      if (change > 0) direction = 'up'
      else if (change < 0) direction = 'down'

      return {
        date, open, high, low, close, volume,
        change, changePercent, direction, index
      }
    })

    setProcessedData(processed)
  }, [data])

  // 用於存儲當前容器尺寸
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  
  // 使用 callback 來處理尺寸更新
  const updateContainerSize = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null
    return (width: number, height: number) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setContainerSize(prev => {
          if (prev.width !== width || prev.height !== height) {
            return { width, height }
          }
          return prev
        })
      }, 0)
    }
  }, [])

  // 渲染邏輯 - 使用 useEffect 在組件頂層
  useEffect(() => {
    if (!svgRef.current || !processedData.length || !containerSize.width || !containerSize.height) return

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const totalWidth = containerSize.width - margin.left - margin.right
    const totalHeight = containerSize.height - margin.top - margin.bottom
    
    // 計算K線圖和成交量圖的高度分配
    const volumeHeight = showVolume ? Math.floor(totalHeight * volumeHeightRatio) : 0
    const chartHeight = totalHeight - volumeHeight - (showVolume ? 10 : 0) // 10px間隙
    const chartWidth = totalWidth

    // 顏色配置
    const colors = DEFAULT_COLORS[colorMode] || DEFAULT_COLORS.custom

    // 創建比例尺
    const timeExtent = d3.extent(processedData, d => d.date) as [Date, Date]
    const timePadding = (timeExtent[1].getTime() - timeExtent[0].getTime()) * 0.05
    const xScale = d3.scaleTime()
      .domain([
        new Date(timeExtent[0].getTime() - timePadding),
        new Date(timeExtent[1].getTime() + timePadding)
      ])
      .range([0, chartWidth])

    const allPrices = processedData.flatMap(d => [d.high, d.low])
    const priceExtent = d3.extent(allPrices) as [number, number]
    const yScale = d3.scaleLinear()
      .domain(priceExtent)
      .nice()
      .range([chartHeight, 0])

    // 成交量比例尺
    let volumeScale = null
    if (showVolume) {
      const volumes = processedData.map(d => d.volume || 0).filter(v => v > 0)
      if (volumes.length > 0) {
        const maxVolume = Math.max(...volumes)
        volumeScale = d3.scaleLinear()
          .domain([0, maxVolume])
          .range([volumeHeight, 0])
      }
    }

    // 清除並重新繪製
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // K線圖區域
    const candleG = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 格線
    if (showGrid) {
      // 水平格線
      candleG.append('g')
        .attr('class', 'grid-horizontal')
        .selectAll('line')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5)

      // 垂直格線
      const timeTickCount = Math.min(10, Math.floor(chartWidth / 80))
      candleG.append('g')
        .attr('class', 'grid-vertical')
        .selectAll('line')
        .data(xScale.ticks(timeTickCount))
        .enter()
        .append('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5)
    }

    // 計算蠟燭寬度
    const timeRange = xScale.domain()
    const timeDiff = timeRange[1].getTime() - timeRange[0].getTime()
    const avgTimeBetweenPoints = timeDiff / Math.max(1, processedData.length - 1)
    const pixelPerMs = chartWidth / timeDiff
    const availableWidth = avgTimeBetweenPoints * pixelPerMs
    const candleActualWidth = Math.min(availableWidth * (candleWidth || 0.8), chartWidth / processedData.length * 0.8)

    // 繪製蠟燭圖
    const candleGroups = candleG.selectAll('.candlestick')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'candlestick')

    // 影線
    candleGroups.append('line')
      .attr('class', 'wick')
      .attr('x1', d => xScale(d.date))
      .attr('x2', d => xScale(d.date))
      .attr('y1', d => yScale(d.high))
      .attr('y2', d => yScale(d.low))
      .attr('stroke', d => {
        if (d.direction === 'up') return colors.up
        else if (d.direction === 'down') return colors.down
        return colors.doji
      })
      .attr('stroke-width', wickWidth)

    // 實體
    candleGroups.append('rect')
      .attr('class', 'body')
      .attr('x', d => xScale(d.date) - candleActualWidth/2)
      .attr('y', d => yScale(Math.max(d.open, d.close)))
      .attr('width', candleActualWidth)
      .attr('height', d => Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
      .attr('fill', d => {
        if (d.direction === 'up') {
          return colorMode === 'tw' ? '#ffffff' : colors.up
        } else if (d.direction === 'down') {
          return colors.down
        }
        return colors.doji
      })
      .attr('stroke', d => {
        if (d.direction === 'up') return colors.up
        else if (d.direction === 'down') return colors.down
        return colors.doji
      })
      .attr('stroke-width', 1)

    // 繪製坐標軸
    // X軸 (在K線圖底部)
    candleG.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%m/%d'))
        .ticks(Math.min(10, Math.floor(chartWidth / 80)))
      )
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Y軸 (價格)
    candleG.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 成交量圖表
    if (showVolume && volumeScale) {
      const volumeG = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top + chartHeight + 10})`)

      // 成交量柱狀圖
      const volumeBarWidth = Math.min(availableWidth * 0.6, chartWidth / processedData.length * 0.6)
      
      volumeG.selectAll('.volume-bar')
        .data(processedData.filter(d => d.volume && d.volume > 0))
        .enter()
        .append('rect')
        .attr('class', 'volume-bar')
        .attr('x', d => xScale(d.date) - volumeBarWidth/2)
        .attr('y', d => volumeScale(d.volume))
        .attr('width', volumeBarWidth)
        .attr('height', d => volumeHeight - volumeScale(d.volume))
        .attr('fill', d => {
          if (d.direction === 'up') return colors.up
          else if (d.direction === 'down') return colors.down
          return colors.doji
        })
        .attr('opacity', 0.6)

      // 成交量Y軸
      volumeG.append('g')
        .attr('class', 'volume-y-axis')
        .call(d3.axisLeft(volumeScale)
          .ticks(3)
          .tickFormat(d => {
            const val = Number(d)
            if (val >= 1000000) return `${(val/1000000).toFixed(1)}M`
            if (val >= 1000) return `${(val/1000).toFixed(0)}K`
            return val.toString()
          })
        )
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#6b7280')
    }

    // 清理坐標軸樣式
    svg.selectAll('.domain')
      .style('stroke', '#e5e7eb')
    svg.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [containerSize.width, containerSize.height, processedData, colorMode, candleWidth, wickWidth, showVolume, volumeHeightRatio, showGrid])

  // 渲染函數 - 使用 callback 來更新尺寸，避免在 render 中直接調用 setState
  const renderChart = (containerWidth: number, containerHeight: number) => {
    // 使用 setTimeout 來在下一個事件循環中更新狀態
    updateContainerSize(containerWidth, containerHeight)

    return (
      <svg
        ref={svgRef}
        width={containerWidth}
        height={containerHeight}
        className={cn('candlestick-chart-svg overflow-visible', className)}
        style={style}
      />
    )
  }

  return (
    <ResponsiveChartContainer
      minHeight={300}
      maxHeight={400}
      aspect={3.5}
    >
      {({ width, height }) => renderChart(width, height)}
    </ResponsiveChartContainer>
  )
}