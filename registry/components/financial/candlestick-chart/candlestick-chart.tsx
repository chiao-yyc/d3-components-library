import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { useOHLCProcessor } from '../../core/ohlc-processor'
import { useColorScheme } from '../../core/color-scheme'
import { useTooltip, getPositionFromEvent } from '../../ui/chart-tooltip'
import { ChartTooltip } from '../../ui/chart-tooltip'
import { 
  CandlestickChartProps, 
  CandlestickItem, 
  VolumeItem, 
  CandlestickScales,
  CandlestickTooltipData
} from './types'

// 預設配置
const DEFAULT_COLORS = {
  tw: { up: '#ef4444', down: '#22c55e', doji: '#6b7280' }, // 台股：紅漲綠跌
  us: { up: '#22c55e', down: '#ef4444', doji: '#6b7280' }, // 美股：綠漲紅跌
  custom: { up: '#10b981', down: '#f59e0b', doji: '#6b7280' }
}

export function CandlestickChart({
  data,
  mapping,
  width = 800,
  height = 500,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  upColor,
  downColor,
  dojiColor,
  candleWidth = 0.8,
  wickWidth = 1,
  colorMode = 'tw',
  showVolume = true,
  volumeHeightRatio = 0.25,
  showGrid = true,
  showCrosshair = false,
  enableZoom = true,
  enablePan = true,
  animate = true,
  animationDuration = 800,
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onCandleClick,
  onCandleHover,
  onDateRangeChange,
  className,
  style,
  ...props
}: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null)

  // 處理 OHLC 數據
  const { 
    data: processedData, 
    statistics, 
    errors, 
    warnings,
    resolvedMapping 
  } = useOHLCProcessor(data, {
    mapping,
    autoDetect: true,
    sortByDate: true,
    removeInvalid: true
  })

  // 顏色配置
  const colors = useMemo(() => {
    const modeColors = DEFAULT_COLORS[colorMode] || DEFAULT_COLORS.custom
    return {
      up: upColor || modeColors.up,
      down: downColor || modeColors.down,
      doji: dojiColor || modeColors.doji
    }
  }, [upColor, downColor, dojiColor, colorMode])

  // 計算圖表尺寸
  const chartHeight = showVolume 
    ? height * (1 - volumeHeightRatio) - margin.top - margin.bottom
    : height - margin.top - margin.bottom
  const volumeHeight = showVolume 
    ? height * volumeHeightRatio - 10 // 10px gap
    : 0
  const chartWidth = width - margin.left - margin.right

  // 創建比例尺
  const scales = useMemo((): CandlestickScales | null => {
    if (!processedData.length) return null

    // 時間比例尺
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, chartWidth])

    // 價格比例尺
    const priceExtent = d3.extent(processedData, d => [d.low, d.high].flat())
    const yScale = d3.scaleLinear()
      .domain(priceExtent as [number, number])
      .nice()
      .range([chartHeight, 0])

    // 成交量比例尺
    let volumeScale: d3.ScaleLinear<number, number> | undefined
    if (showVolume) {
      const volumeExtent = d3.extent(processedData, d => d.volume || 0) as [number, number]
      volumeScale = d3.scaleLinear()
        .domain([0, volumeExtent[1]])
        .range([volumeHeight, 0])
    }

    return { xScale, yScale, volumeScale }
  }, [processedData, chartWidth, chartHeight, volumeHeight, showVolume])

  // 計算蠟燭數據
  const candlesticks = useMemo((): CandlestickItem[] => {
    if (!scales || !processedData.length) return []

    const { xScale, yScale } = scales
    const bandWidth = chartWidth / processedData.length
    const candleActualWidth = bandWidth * candleWidth

    return processedData.map((d, i) => {
      const x = xScale(d.date) - candleActualWidth / 2
      const bodyTop = yScale(Math.max(d.open, d.close))
      const bodyBottom = yScale(Math.min(d.open, d.close))
      const bodyHeight = Math.max(1, bodyBottom - bodyTop) // 最小高度 1px
      const wickTop = yScale(d.high)
      const wickBottom = yScale(d.low)

      let color = colors.doji
      if (d.direction === 'up') color = colors.up
      else if (d.direction === 'down') color = colors.down

      return {
        data: d,
        geometry: {
          x,
          bodyTop,
          bodyBottom,
          bodyHeight,
          wickTop,
          wickBottom,
          width: candleActualWidth
        },
        color,
        index: i
      }
    })
  }, [scales, processedData, chartWidth, candleWidth, colors])

  // 計算成交量數據
  const volumes = useMemo((): VolumeItem[] => {
    if (!scales?.volumeScale || !showVolume || !processedData.length) return []

    const { xScale, volumeScale } = scales
    const bandWidth = chartWidth / processedData.length
    const volumeBarWidth = bandWidth * 0.6

    return processedData.map((d, i) => {
      if (!d.volume) return null

      const x = xScale(d.date) - volumeBarWidth / 2
      const barHeight = volumeHeight - volumeScale(d.volume)
      const y = volumeScale(d.volume)

      // 成交量柱的顏色跟隨對應蠟燭
      const candlestick = candlesticks[i]
      const color = candlestick ? candlestick.color : colors.doji

      return {
        data: d,
        geometry: {
          x,
          y,
          width: volumeBarWidth,
          height: barHeight
        },
        color,
        index: i
      }
    }).filter(Boolean) as VolumeItem[]
  }, [scales, showVolume, processedData, chartWidth, volumeHeight, candlesticks, colors])

  // Tooltip 功能
  const { tooltip, showTooltip: showTooltipFn, hideTooltip } = useTooltip({
    hideDelay: 100
  })

  // 格式化 tooltip 內容
  const formatTooltipContent = (candlestick: CandlestickItem): React.ReactNode => {
    const { data: d } = candlestick
    
    if (tooltipFormat) {
      return tooltipFormat(d)
    }

    const formatNumber = (num: number) => num.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
    
    const formatPercent = (num: number) => {
      const sign = num >= 0 ? '+' : ''
      return `${sign}${num.toFixed(2)}%`
    }

    return (
      <div className="space-y-1">
        <div className="font-semibold">{d.date.toLocaleDateString()}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>開盤: {formatNumber(d.open)}</div>
          <div>收盤: {formatNumber(d.close)}</div>
          <div>最高: {formatNumber(d.high)}</div>
          <div>最低: {formatNumber(d.low)}</div>
        </div>
        <div className="text-sm border-t pt-1">
          <div>漲跌: {formatNumber(d.change)} ({formatPercent(d.changePercent)})</div>
          {d.volume && <div>成交量: {d.volume.toLocaleString()}</div>}
        </div>
      </div>
    )
  }

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !scales || !candlesticks.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 主要繪圖區域
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const { xScale, yScale, volumeScale } = scales

    // 繪製格線
    if (showGrid) {
      // 水平格線
      g.append('g')
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
      g.append('g')
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

    // 繪製蠟燭圖
    const candleGroups = g.selectAll('.candlestick')
      .data(candlesticks)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .style('cursor', interactive ? 'pointer' : 'default')

    // 影線
    candleGroups.append('line')
      .attr('class', 'wick')
      .attr('x1', d => d.geometry.x + d.geometry.width / 2)
      .attr('x2', d => d.geometry.x + d.geometry.width / 2)
      .attr('y1', d => d.geometry.wickTop)
      .attr('y2', d => d.geometry.wickBottom)
      .attr('stroke', d => d.color)
      .attr('stroke-width', wickWidth)

    // 實體
    const bodies = candleGroups.append('rect')
      .attr('class', 'body')
      .attr('x', d => d.geometry.x)
      .attr('y', d => d.geometry.bodyTop)
      .attr('width', d => d.geometry.width)
      .attr('height', d => d.geometry.bodyHeight)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 0.5)

    // 動畫效果
    if (animate) {
      bodies
        .style('opacity', 0)
        .attr('transform', 'scaleY(0)')
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * 20)
        .ease(d3.easeQuadOut)
        .style('opacity', 1)
        .attr('transform', 'scaleY(1)')
    }

    // 成交量圖表
    if (showVolume && volumeScale && volumes.length) {
      const volumeG = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom - volumeHeight})`)

      volumeG.selectAll('.volume-bar')
        .data(volumes)
        .enter()
        .append('rect')
        .attr('class', 'volume-bar')
        .attr('x', d => d.geometry.x)
        .attr('y', d => d.geometry.y)
        .attr('width', d => d.geometry.width)
        .attr('height', d => d.geometry.height)
        .attr('fill', d => d.color)
        .attr('opacity', 0.6)

      // 成交量 Y 軸
      volumeG.append('g')
        .attr('class', 'volume-axis')
        .call(d3.axisLeft(volumeScale).ticks(3))
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#6b7280')
    }

    // 互動事件
    if (interactive) {
      candleGroups
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          
          if (showTooltip) {
            const position = getPositionFromEvent(event)
            showTooltipFn(position, { data: d.data, series: 'Candlestick' })
          }
          
          onCandleHover?.(d.data)
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 1)
          hideTooltip()
          onCandleHover?.(null)
        })
        .on('click', function(event, d) {
          onCandleClick?.(d.data)
        })
    }

    // 繪製坐標軸
    // X軸（時間）
    const timeTickCount = Math.min(8, Math.floor(chartWidth / 100))
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(timeTickCount).tickFormat(d3.timeFormat('%m/%d')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Y軸（價格）
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 軸線樣式
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    
    g.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [
    candlesticks, volumes, scales, chartWidth, chartHeight, volumeHeight, 
    showGrid, showVolume, animate, animationDuration, interactive, wickWidth,
    margin, height, showTooltip, showTooltipFn, hideTooltip, onCandleClick, onCandleHover
  ])

  // 錯誤狀態
  if (errors.length > 0) {
    return (
      <div className={cn('candlestick-chart-container', className)} style={style} {...props}>
        <div className="error-state p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-semibold">數據處理錯誤</h3>
          <ul className="text-red-600 text-sm mt-2">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // 空數據狀態
  if (!processedData.length) {
    return (
      <div className={cn('candlestick-chart-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無 K線 資料可顯示</p>
          {warnings.length > 0 && (
            <ul className="text-yellow-600 text-sm mt-2">
              {warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('candlestick-chart-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="candlestick-chart-svg overflow-visible"
      />

      {/* 統計資訊顯示 */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow text-xs">
        <div>數據點: {statistics.count}</div>
        <div>期間: {statistics.dateRange.start.toLocaleDateString()} - {statistics.dateRange.end.toLocaleDateString()}</div>
        <div>價格範圍: {statistics.priceRange.min.toFixed(2)} - {statistics.priceRange.max.toFixed(2)}</div>
        {statistics.totalVolume && (
          <div>總成交量: {statistics.totalVolume.toLocaleString()}</div>
        )}
      </div>

      {/* Tooltip */}
      <ChartTooltip
        visible={tooltip.visible && tooltip.data != null}
        x={tooltip.position.x}
        y={tooltip.position.y}
        content={
          tooltip.data && candlesticks.length > 0 
            ? formatTooltipContent(candlesticks.find(c => c.data === tooltip.data.data) || candlesticks[0])
            : null
        }
        theme="dark"
        className="max-w-xs"
      />

      {/* 警告訊息 */}
      {warnings.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
          {warnings.map((warning, i) => (
            <div key={i} className="text-yellow-800">⚠ {warning}</div>
          ))}
        </div>
      )}
    </div>
  )
}