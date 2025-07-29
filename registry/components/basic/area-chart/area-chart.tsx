import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { AreaChartProps, ProcessedAreaDataPoint, AreaSeriesData } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
]

export function AreaChart({
  data,
  xKey,
  yKey,
  categoryKey,
  xAccessor,
  yAccessor,
  categoryAccessor,
  mapping,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  curve = 'monotone',
  stackMode = 'none',
  fillOpacity = 0.7,
  strokeWidth = 2,
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  gradient = true,
  showXAxis = true,
  showYAxis = true,
  xAxisFormat,
  yAxisFormat,
  showGrid = true,
  showDots = false,
  dotRadius = 3,
  showLegend = true,
  legendPosition = 'top',
  interactive = true,
  animate = true,
  animationDuration = 750,
  showTooltip = true,
  tooltipFormat,
  onDataClick,
  onDataHover,
  className,
  style,
  ...props
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedAreaDataPoint; series?: string } | null>(null)
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)

  // 計算圖表區域尺寸
  const chartWidth = useMemo(() => {
    return showLegend && (legendPosition === 'left' || legendPosition === 'right')
      ? width * 0.8
      : width - margin.left - margin.right
  }, [width, margin, showLegend, legendPosition])

  const chartHeight = useMemo(() => {
    return showLegend && (legendPosition === 'top' || legendPosition === 'bottom')
      ? height * 0.8
      : height - margin.top - margin.bottom
  }, [height, margin, showLegend, legendPosition])

  // 資料處理
  const processedData = useMemo(() => {
    if (!data?.length) return []

    const processed = data.map((d, index) => {
      let x: Date | number | string, y: number, category: string | undefined

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x]
        y = typeof mapping.y === 'function' ? mapping.y(d) : Number(d[mapping.y]) || 0
        category = mapping.category 
          ? (typeof mapping.category === 'function' ? mapping.category(d) : d[mapping.category])
          : undefined
      } else if (xAccessor && yAccessor) {
        x = xAccessor(d)
        y = yAccessor(d)
        category = categoryAccessor?.(d)
      } else if (xKey && yKey) {
        x = d[xKey]
        y = Number(d[yKey]) || 0
        category = categoryKey ? d[categoryKey] : undefined
      } else {
        // 自動偵測：假設第一個欄位是 x，第二個是 y，第三個是 category
        const keys = Object.keys(d)
        x = d[keys[0]]
        y = Number(d[keys[1]]) || 0
        category = keys[2] ? d[keys[2]] : undefined
      }

      // 處理日期類型
      if (typeof x === 'string' && !isNaN(Date.parse(x))) {
        x = new Date(x)
      }

      return {
        x,
        y,
        category: category || 'default',
        originalData: d,
        index
      } as ProcessedAreaDataPoint
    }).filter(d => !isNaN(d.y)) // 過濾無效資料

    return processed.sort((a, b) => {
      // 按 x 軸排序
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime()
      }
      if (typeof a.x === 'number' && typeof b.x === 'number') {
        return a.x - b.x
      }
      return String(a.x).localeCompare(String(b.x))
    })
  }, [data, xKey, yKey, categoryKey, xAccessor, yAccessor, categoryAccessor, mapping])

  // 系列資料處理
  const seriesData = useMemo((): AreaSeriesData[] => {
    if (!processedData.length) return []

    // 按 category 分組
    const groupedData = d3.group(processedData, d => d.category || 'default')
    
    const series: AreaSeriesData[] = Array.from(groupedData, ([key, values]) => ({
      key,
      values: values.sort((a, b) => {
        if (a.x instanceof Date && b.x instanceof Date) {
          return a.x.getTime() - b.x.getTime()
        }
        if (typeof a.x === 'number' && typeof b.x === 'number') {
          return a.x - b.x
        }
        return String(a.x).localeCompare(String(b.x))
      })
    }))

    return series
  }, [processedData])

  // 堆疊資料處理
  const stackedData = useMemo(() => {
    if (stackMode === 'none' || seriesData.length <= 1) {
      return seriesData.map(series => ({
        ...series,
        values: series.values.map(d => ({ ...d, y0: 0, y1: d.y }))
      }))
    }

    // 建立所有 x 值的聯集
    const allXValues = Array.from(new Set(
      seriesData.flatMap(series => series.values.map(d => String(d.x)))
    )).sort()

    // 為每個系列建立完整的資料點
    const completeSeriesData = seriesData.map(series => {
      const valueMap = new Map(series.values.map(d => [String(d.x), d]))
      return {
        ...series,
        values: allXValues.map(xStr => {
          const existing = valueMap.get(xStr)
          if (existing) return existing
          
          // 建立缺失的資料點
          const firstValue = series.values[0]
          return {
            ...firstValue,
            x: firstValue.x instanceof Date ? new Date(xStr) : 
               typeof firstValue.x === 'number' ? Number(xStr) : xStr,
            y: 0
          }
        })
      }
    })

    // 計算堆疊
    const result = completeSeriesData.map((series, seriesIndex) => ({
      ...series,
      values: series.values.map((d, valueIndex) => {
        let y0 = 0
        let y1 = d.y

        if (stackMode === 'stack') {
          // 累積堆疊
          for (let i = 0; i < seriesIndex; i++) {
            y0 += completeSeriesData[i].values[valueIndex].y
          }
          y1 = y0 + d.y
        } else if (stackMode === 'percent') {
          // 百分比堆疊
          const totalAtX = completeSeriesData.reduce((sum, s) => 
            sum + s.values[valueIndex].y, 0)
          
          if (totalAtX > 0) {
            for (let i = 0; i < seriesIndex; i++) {
              y0 += (completeSeriesData[i].values[valueIndex].y / totalAtX) * 100
            }
            y1 = y0 + (d.y / totalAtX) * 100
          }
        }

        return { ...d, y0, y1 }
      })
    }))

    return result
  }, [seriesData, stackMode])

  // 比例尺
  const scales = useMemo(() => {
    if (!stackedData.length) return null

    const allValues = stackedData.flatMap(series => series.values)
    
    // X 軸比例尺
    let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScaleBand<string>

    const firstX = allValues[0]?.x
    if (firstX instanceof Date) {
      const xExtent = d3.extent(allValues, d => d.x as Date) as [Date, Date]
      xScale = d3.scaleTime()
        .domain(xExtent)
        .range([0, chartWidth])
    } else if (typeof firstX === 'number') {
      const xExtent = d3.extent(allValues, d => d.x as number) as [number, number]
      xScale = d3.scaleLinear()
        .domain(xExtent)
        .range([0, chartWidth])
    } else {
      const xValues = Array.from(new Set(allValues.map(d => String(d.x))))
      xScale = d3.scaleBand()
        .domain(xValues)
        .range([0, chartWidth])
        .padding(0.1)
    }

    // Y 軸比例尺
    const yExtent = stackMode === 'percent' 
      ? [0, 100]
      : [0, d3.max(allValues, d => Math.max(d.y1 || d.y, d.y0 || 0)) || 0]
    
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([chartHeight, 0])
      .nice()

    return { xScale, yScale }
  }, [stackedData, chartWidth, chartHeight, stackMode])

  // 顏色映射
  const colorScale = useMemo(() => {
    if (colorScheme !== 'custom') {
      const schemes = {
        category10: d3.schemeCategory10,
        set3: d3.schemeSet3,
        pastel: d3.schemePastel1,
        dark: d3.schemeDark2
      }
      return d3.scaleOrdinal(schemes[colorScheme])
    }
    
    return d3.scaleOrdinal(colors)
  }, [colors, colorScheme])

  // 圖例資料
  const legendData = useMemo(() => {
    return seriesData.map((series, index) => ({
      key: series.key,
      color: colorScale(series.key),
      index
    }))
  }, [seriesData, colorScale])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !scales || !stackedData.length) return

    const svg = d3.select(svgRef.current)
    const { xScale, yScale } = scales

    // 清除之前的內容
    svg.selectAll('*').remove()

    // 建立主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 建立漸變定義
    if (gradient) {
      const defs = svg.append('defs')
      
      stackedData.forEach((series, index) => {
        const gradientId = `area-gradient-${index}`
        const gradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0).attr('y1', chartHeight)
          .attr('x2', 0).attr('y2', 0)

        const color = colorScale(series.key)
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.1)

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', fillOpacity)
      })
    }

    // 建立曲線生成器
    const curveMap = {
      linear: d3.curveLinear,
      monotone: d3.curveMonotoneX,
      cardinal: d3.curveCardinal,
      basis: d3.curveBasis,
      step: d3.curveStep
    }

    // 區域生成器
    const area = d3.area<any>()
      .x(d => {
        if (typeof xScale.bandwidth === 'function') {
          const bandwidth = xScale.bandwidth()
          return (xScale(String(d.x)) || 0) + bandwidth / 2
        }
        return xScale(d.x as any)
      })
      .y0(d => yScale(d.y0 || 0))
      .y1(d => yScale(d.y1 || d.y))
      .curve(curveMap[curve])

    // 線條生成器
    const line = d3.line<any>()
      .x(d => {
        if (typeof xScale.bandwidth === 'function') {
          const bandwidth = xScale.bandwidth()
          return (xScale(String(d.x)) || 0) + bandwidth / 2
        }
        return xScale(d.x as any)
      })
      .y(d => yScale(d.y1 || d.y))
      .curve(curveMap[curve])

    // 網格線
    if (showGrid) {
      // Y 軸網格線
      g.selectAll('.grid-line-y')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)

      // X 軸網格線
      if (typeof xScale.ticks === 'function') {
        g.selectAll('.grid-line-x')
          .data(xScale.ticks())
          .enter()
          .append('line')
          .attr('class', 'grid-line-x')
          .attr('x1', d => xScale(d as any))
          .attr('x2', d => xScale(d as any))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5)
      }
    }

    // 繪製區域
    const areas = g.selectAll('.area-path')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'area-path')

    const areaPaths = areas.append('path')
      .attr('fill', (d, i) => gradient ? `url(#area-gradient-${i})` : colorScale(d.key))
      .attr('fill-opacity', gradient ? 1 : fillOpacity)
      .attr('stroke', 'none')

    // 繪製邊界線
    const linePaths = areas.append('path')
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.key))
      .attr('stroke-width', strokeWidth)
      .attr('opacity', 0.8)

    // 動畫效果
    if (animate) {
      areaPaths
        .attr('d', d => {
          const zeroArea = d3.area<any>()
            .x(area.x()!)
            .y0(yScale(0))
            .y1(yScale(0))
            .curve(curveMap[curve])
          return zeroArea(d.values)
        })
        .transition()
        .duration(animationDuration)
        .attr('d', d => area(d.values))

      linePaths
        .attr('d', d => {
          const zeroLine = d3.line<any>()
            .x(line.x()!)
            .y(yScale(0))
            .curve(curveMap[curve])
          return zeroLine(d.values)
        })
        .transition()
        .duration(animationDuration)
        .attr('d', d => line(d.values))
    } else {
      areaPaths.attr('d', d => area(d.values))
      linePaths.attr('d', d => line(d.values))
    }

    // 資料點
    if (showDots) {
      stackedData.forEach((series, seriesIndex) => {
        const dots = g.selectAll(`.dots-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append('circle')
          .attr('class', `dots-${seriesIndex}`)
          .attr('cx', d => {
            if (typeof xScale.bandwidth === 'function') {
              const bandwidth = xScale.bandwidth()
              return (xScale(String(d.x)) || 0) + bandwidth / 2
            }
            return xScale(d.x as any)
          })
          .attr('cy', d => yScale(d.y1 || d.y))
          .attr('r', dotRadius)
          .attr('fill', colorScale(series.key))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)

        if (animate) {
          dots.attr('r', 0)
            .transition()
            .duration(animationDuration)
            .delay((d, i) => i * 50)
            .attr('r', dotRadius)
        }
      })
    }

    // 互動事件
    if (interactive) {
      // 建立透明的互動區域
      const interactionArea = g.append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair')

      interactionArea
        .on('mousemove', function(event) {
          const [mouseX] = d3.pointer(event)
          
          // 找到最接近的資料點
          let closestPoint = null
          let closestSeries = null
          let minDistance = Infinity

          stackedData.forEach(series => {
            series.values.forEach(d => {
              let x: number
              if (typeof xScale.bandwidth === 'function') {
                const bandwidth = xScale.bandwidth()
                x = (xScale(String(d.x)) || 0) + bandwidth / 2
              } else {
                x = xScale(d.x as any)
              }
              
              const distance = Math.abs(x - mouseX)
              if (distance < minDistance) {
                minDistance = distance
                closestPoint = d
                closestSeries = series.key
              }
            })
          })

          if (closestPoint && showTooltip) {
            setTooltip({
              x: mouseX,
              y: yScale(closestPoint.y1 || closestPoint.y),
              data: closestPoint,
              series: closestSeries
            })
          }

          onDataHover?.(closestPoint, closestSeries)
        })
        .on('mouseleave', function() {
          setTooltip(null)
          onDataHover?.(null)
        })
        .on('click', function(event) {
          const [mouseX] = d3.pointer(event)
          
          // 找到點擊的資料點
          let clickedPoint = null
          let clickedSeries = null
          let minDistance = Infinity

          stackedData.forEach(series => {
            series.values.forEach(d => {
              let x: number
              if (typeof xScale.bandwidth === 'function') {
                const bandwidth = xScale.bandwidth()
                x = (xScale(String(d.x)) || 0) + bandwidth / 2
              } else {
                x = xScale(d.x as any)
              }
              
              const distance = Math.abs(x - mouseX)
              if (distance < minDistance) {
                minDistance = distance
                clickedPoint = d
                clickedSeries = series.key
              }
            })
          })

          if (clickedPoint) {
            onDataClick?.(clickedPoint, clickedSeries)
          }
        })
    }

    // X 軸
    if (showXAxis) {
      const xAxis = typeof xScale.bandwidth === 'function'
        ? d3.axisBottom(xScale)
        : d3.axisBottom(xScale as any)

      if (xAxisFormat && typeof xScale.ticks === 'function') {
        xAxis.tickFormat(xAxisFormat as any)
      }

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)
    }

    // Y 軸
    if (showYAxis) {
      const yAxis = d3.axisLeft(yScale)
      
      if (yAxisFormat) {
        yAxis.tickFormat(yAxisFormat)
      } else if (stackMode === 'percent') {
        yAxis.tickFormat(d => `${d}%`)
      }

      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
    }

  }, [
    scales, stackedData, margin, chartWidth, chartHeight, curve, fillOpacity, strokeWidth, 
    colorScale, gradient, showGrid, showDots, dotRadius, animate, animationDuration, 
    interactive, showXAxis, showYAxis, xAxisFormat, yAxisFormat, stackMode, 
    showTooltip, onDataClick, onDataHover
  ])

  if (!data?.length) {
    return (
      <div className={cn('area-chart-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('area-chart-container relative', className)}
      style={style}
      {...props}
    >
      {/* 圖例 */}
      {showLegend && legendData.length > 1 && (
        <div className={cn(
          'legend mb-4',
          legendPosition === 'top' && 'order-first',
          legendPosition === 'bottom' && 'order-last mt-4 mb-0',
          legendPosition === 'left' && 'order-first mr-4 flex-shrink-0',
          legendPosition === 'right' && 'order-last ml-4 flex-shrink-0'
        )}>
          <div className={cn(
            'flex gap-4',
            (legendPosition === 'top' || legendPosition === 'bottom') && 'flex-wrap justify-center',
            (legendPosition === 'left' || legendPosition === 'right') && 'flex-col'
          )}>
            {legendData.map((item) => (
              <div
                key={item.key}
                className={cn(
                  'flex items-center gap-2 text-sm cursor-pointer transition-opacity',
                  hoveredSeries && hoveredSeries !== item.key && 'opacity-50'
                )}
                onMouseEnter={() => setHoveredSeries(item.key)}
                onMouseLeave={() => setHoveredSeries(null)}
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="area-chart-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x + margin.left,
              top: tooltip.y + margin.top - 40
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.data, tooltip.series) : (
              <div>
                {tooltip.series && <div>系列: {tooltip.series}</div>}
                <div>X: {String(tooltip.data.x)}</div>
                <div>Y: {tooltip.data.y}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}