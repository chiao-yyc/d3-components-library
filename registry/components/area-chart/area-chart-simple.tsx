import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimpleAreaChartData {
  x: string | number | Date
  y: number
  series?: string
}

export interface SimpleAreaChartProps {
  data: SimpleAreaChartData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  stackMode?: 'none' | 'stack' | 'percent'
  curve?: 'linear' | 'monotone' | 'step'
  showLine?: boolean
  lineWidth?: number
  areaOpacity?: number
  showGrid?: boolean
  className?: string
  onAreaClick?: (data: SimpleAreaChartData) => void
}

export function SimpleAreaChart({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  stackMode = 'none',
  curve = 'monotone',
  showLine = true,
  lineWidth = 2,
  areaOpacity = 0.6,
  showGrid = true,
  className,
  onAreaClick
}: SimpleAreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip] = useState<{ x: number; y: number; data: SimpleAreaChartData } | null>(null)

  // 處理數據
  const processedData = useMemo(() => {
    if (!data?.length) return { seriesData: [], stackedData: [] }

    // 按系列分組數據
    const seriesMap = new Map<string, SimpleAreaChartData[]>()
    
    data.forEach(d => {
      const seriesKey = d.series || 'default'
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, [])
      }
      seriesMap.get(seriesKey)!.push({
        ...d,
        x: d.x instanceof Date ? d.x : (typeof d.x === 'string' ? new Date(d.x) : d.x),
        y: Number(d.y) || 0
      })
    })

    // 對每個系列按 x 值排序
    const seriesData = Array.from(seriesMap.entries()).map(([key, values]) => ({
      key,
      values: values.sort((a, b) => {
        if (a.x instanceof Date && b.x instanceof Date) {
          return a.x.getTime() - b.x.getTime()
        }
        return Number(a.x) - Number(b.x)
      })
    }))

    // 如果需要堆疊，創建堆疊數據
    let stackedData: any[] = []
    if (stackMode !== 'none' && seriesData.length > 1) {
      // 獲取所有唯一的 X 值
      const allXValues = [...new Set(data.map(d => String(d.x)))].sort()
      
      // 為每個 X 值創建完整的數據記錄
      const fullData = allXValues.map(xVal => {
        const record: any = { x: xVal }
        seriesData.forEach(series => {
          const item = series.values.find(v => String(v.x) === xVal)
          record[series.key] = item ? item.y : 0
        })
        return record
      })

      // 創建堆疊生成器
      const stack = d3.stack()
        .keys(seriesData.map(s => s.key))
        .order(d3.stackOrderNone)
        .offset(stackMode === 'percent' ? d3.stackOffsetExpand : d3.stackOffsetNone)

      stackedData = stack(fullData)
    }

    return { seriesData, stackedData }
  }, [data, stackMode])

  // 計算比例尺
  const scales = useMemo(() => {
    if (!data?.length) return null

    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // X 軸比例尺
    const xValues = data.map(d => d.x)
    const isDateScale = xValues[0] instanceof Date
    
    let xScale: any
    if (isDateScale) {
      const extent = d3.extent(xValues as Date[]) as [Date, Date]
      xScale = d3.scaleTime()
        .domain(extent)
        .range([0, chartWidth])
    } else {
      const extent = d3.extent(xValues as number[]) as [number, number]
      xScale = d3.scaleLinear()
        .domain(extent)
        .range([0, chartWidth])
    }

    // Y 軸比例尺
    let yScale: any
    if (stackMode === 'percent') {
      yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([chartHeight, 0])
    } else if (stackMode === 'stack' && processedData.stackedData.length > 0) {
      const maxY = d3.max(processedData.stackedData.flat().flat(), (d: any) => d[1]) || 0
      yScale = d3.scaleLinear()
        .domain([0, maxY])
        .nice()
        .range([chartHeight, 0])
    } else {
      const yValues = data.map(d => d.y)
      yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues) || 0])
        .nice()
        .range([chartHeight, 0])
    }

    return { xScale, yScale, chartWidth, chartHeight, isDateScale }
  }, [data, processedData.stackedData, width, height, margin, stackMode])

  useEffect(() => {
    if (!svgRef.current || !scales || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { xScale, yScale, chartWidth, chartHeight, isDateScale } = scales

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 繪製網格
    if (showGrid) {
      // Y軸網格線
      g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.5)
    }

    // 曲線生成器
    const curveType = curve === 'monotone' ? d3.curveMonotoneX :
                     curve === 'step' ? d3.curveStepAfter :
                     d3.curveLinear

    // 如果是堆疊模式
    if (stackMode !== 'none' && processedData.stackedData.length > 0) {
      const area = d3.area<any>()
        .x(d => xScale(isDateScale ? new Date(d.data.x) : Number(d.data.x)))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(curveType)

      const line = d3.line<any>()
        .x(d => xScale(isDateScale ? new Date(d.data.x) : Number(d.data.x)))
        .y(d => yScale(d[1]))
        .curve(curveType)

      // 繪製每個系列的堆疊區域
      processedData.stackedData.forEach((series, seriesIndex) => {
        const color = colors[seriesIndex % colors.length]

        // 面積
        g.append('path')
          .datum(series)
          .attr('d', area)
          .style('fill', color)
          .style('opacity', areaOpacity)
          .style('cursor', onAreaClick ? 'pointer' : 'default')
          .on('click', function() {
            // 找到對應的原始數據
            const firstPoint = series[0]
            if (firstPoint && firstPoint.data) {
              const originalData = data.find(d => 
                String(d.x) === firstPoint.data.x && d.series === processedData.seriesData[seriesIndex]?.key
              )
              if (originalData) {
                onAreaClick?.(originalData)
              }
            }
          })

        // 邊線
        if (showLine) {
          g.append('path')
            .datum(series)
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke', color)
            .style('stroke-width', lineWidth)
        }
      })
    } else {
      // 非堆疊模式
      const area = d3.area<SimpleAreaChartData>()
        .x(d => xScale(d.x))
        .y0(chartHeight)
        .y1(d => yScale(d.y))
        .curve(curveType)

      const line = d3.line<SimpleAreaChartData>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(curveType)

      // 繪製每個系列
      processedData.seriesData.forEach((series, seriesIndex) => {
        const color = colors[seriesIndex % colors.length]

        // 面積
        g.append('path')
          .datum(series.values)
          .attr('d', area)
          .style('fill', color)
          .style('opacity', areaOpacity)
          .style('cursor', onAreaClick ? 'pointer' : 'default')
          .on('click', function() {
            if (series.values.length > 0) {
              onAreaClick?.(series.values[0])
            }
          })

        // 邊線
        if (showLine) {
          g.append('path')
            .datum(series.values)
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke', color)
            .style('stroke-width', lineWidth)
        }
      })
    }

    // 繪製坐標軸
    // X軸
    const xAxis = isDateScale ? 
      d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')) :
      d3.axisBottom(xScale)
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Y軸
    const yAxisFormat = stackMode === 'percent' ? d3.format('.0%') : d3.format('.2s')
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat(yAxisFormat))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 軸線樣式
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    
    g.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [data, processedData, scales, stackMode, curve, showLine, lineWidth, areaOpacity, showGrid, colors, onAreaClick, margin])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無面積圖資料可顯示
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      
      {/* 提示框 */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div>X: {tooltip.data.x instanceof Date ? tooltip.data.x.toLocaleDateString() : tooltip.data.x}</div>
          <div>Y: {tooltip.data.y}</div>
          {tooltip.data.series && <div>系列: {tooltip.data.series}</div>}
        </div>
      )}
    </div>
  )
}