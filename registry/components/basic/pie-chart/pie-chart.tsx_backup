import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { PieChartProps, ProcessedPieDataPoint, LegendItem } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
]

export function PieChart({
  data,
  labelKey,
  valueKey,
  colorKey,
  labelAccessor,
  valueAccessor,
  colorAccessor,
  mapping,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  innerRadius = 0,
  outerRadius,
  cornerRadius = 0,
  padAngle = 0,
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  showLabels = true,
  showPercentages = true,
  labelThreshold = 5, // 5%
  labelFormat,
  showLegend = true,
  legendPosition = 'right',
  legendFormat,
  interactive = true,
  animate = true,
  animationDuration = 750,
  showCenterText = true,
  centerTextFormat,
  animationType = 'sweep',
  hoverEffect = 'lift',
  showTooltip = true,
  tooltipFormat,
  onSliceClick,
  onSliceHover,
  className,
  style,
  ...props
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedPieDataPoint } | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const [hiddenSlices, setHiddenSlices] = useState<Set<number>>(new Set())

  // 計算圖表區域尺寸
  const chartWidth = useMemo(() => {
    return showLegend && (legendPosition === 'left' || legendPosition === 'right')
      ? width * 0.7
      : width - margin.left - margin.right
  }, [width, margin, showLegend, legendPosition])

  const chartHeight = useMemo(() => {
    return showLegend && (legendPosition === 'top' || legendPosition === 'bottom')
      ? height * 0.8
      : height - margin.top - margin.bottom
  }, [height, margin, showLegend, legendPosition])

  // 計算半徑
  const calculatedOuterRadius = outerRadius || Math.min(chartWidth, chartHeight) / 2 - 10
  const calculatedInnerRadius = Math.min(innerRadius, calculatedOuterRadius * 0.8)

  // 圖例切換處理
  const toggleSliceVisibility = (index: number) => {
    setHiddenSlices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // 資料處理
  const processedData = useMemo(() => {
    if (!data?.length) return []

    const processed = data.map((d, index) => {
      let label: string, value: number, color: string | undefined

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label])
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0
        color = mapping.color 
          ? (typeof mapping.color === 'function' ? mapping.color(d) : String(d[mapping.color]))
          : undefined
      } else if (labelAccessor && valueAccessor) {
        label = labelAccessor(d)
        value = valueAccessor(d)
        color = colorAccessor?.(d)
      } else if (labelKey && valueKey) {
        label = String(d[labelKey])
        value = Number(d[valueKey]) || 0
        color = colorKey ? d[colorKey] : undefined
      } else {
        // 自動偵測：假設第一個欄位是 label，第二個是 value
        const keys = Object.keys(d)
        label = String(d[keys[0]])
        value = Number(d[keys[1]]) || 0
        color = keys[2] ? d[keys[2]] : undefined
      }

      return {
        label,
        value,
        color,
        originalData: d,
        percentage: 0, // 會在下面計算
        startAngle: 0,
        endAngle: 0,
        index
      } as ProcessedPieDataPoint
    }).filter(d => d.value > 0) // 過濾負值和零值

    // 計算百分比
    const total = processed.reduce((sum, d) => sum + d.value, 0)
    processed.forEach(d => {
      d.percentage = (d.value / total) * 100
    })

    return processed.sort((a, b) => b.value - a.value) // 按值排序
  }, [data, labelKey, valueKey, colorKey, labelAccessor, valueAccessor, colorAccessor, mapping])

  // 過濾可見資料
  const visibleData = useMemo(() => {
    return processedData.filter((d, index) => !hiddenSlices.has(index))
  }, [processedData, hiddenSlices])

  // 顏色映射
  const colorScale = useMemo(() => {
    // 檢查是否有 color 資料
    const hasColorData = processedData.some(d => d.color !== undefined)
    if (!hasColorData) return null
    
    if (colorScheme !== 'custom') {
      const schemes = {
        category10: d3.schemeCategory10,
        set3: d3.schemeSet3,
        pastel: d3.schemePastel1,
        dark: d3.schemeDark2
      }
      const colorValues = [...new Set(processedData.map(d => d.color).filter(c => c !== undefined))]
      return d3.scaleOrdinal(schemes[colorScheme]).domain(colorValues)
    }
    
    const colorValues = [...new Set(processedData.map(d => d.color).filter(c => c !== undefined))]
    return d3.scaleOrdinal(colors).domain(colorValues)
  }, [colors, colorScheme, processedData])

  // 圖例資料
  const legendData = useMemo((): LegendItem[] => {
    return processedData.map((d, index) => ({
      label: d.label,
      color: d.color && colorScale ? colorScale(d.color) : colors[index % colors.length],
      value: d.value,
      percentage: d.percentage,
      index
    }))
  }, [processedData, colorScale, colors])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !visibleData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 建立主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${chartWidth / 2 + margin.left}, ${chartHeight / 2 + margin.top})`)

    // 建立圓餅圖生成器
    const pie = d3.pie<ProcessedPieDataPoint>()
      .value(d => d.value)
      .sort(null)
      .padAngle(padAngle)

    // 建立弧形生成器
    const arc = d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
      .innerRadius(calculatedInnerRadius)
      .outerRadius(calculatedOuterRadius)
      .cornerRadius(cornerRadius)

    // 外弧形生成器（用於標籤）
    const outerArc = d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
      .innerRadius(calculatedOuterRadius + 10)
      .outerRadius(calculatedOuterRadius + 10)

    // 生成弧形資料
    const arcs = pie(visibleData)

    // 更新 visibleData 的角度資訊
    arcs.forEach((arcData, index) => {
      const dataPoint = visibleData[index]
      dataPoint.startAngle = arcData.startAngle
      dataPoint.endAngle = arcData.endAngle
    })

    // 繪製圓餅圖切片
    const slices = g.selectAll('.pie-slice')
      .data(arcs)
      .enter()
      .append('g')
      .attr('class', 'pie-slice')

    const paths = slices.append('path')
      .attr('fill', (d, i) => {
        if (d.data.color && colorScale) {
          return colorScale(d.data.color)
        }
        return colors[i % colors.length]
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 動畫效果
    if (animate) {
      // 先從內圈開始顯示
      paths
        .attr('d', d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
          .innerRadius(calculatedInnerRadius)
          .outerRadius(calculatedInnerRadius + 1)
          .cornerRadius(cornerRadius)
        )
        .transition()
        .duration(animationDuration / 2)
        .attr('d', d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
          .innerRadius(calculatedInnerRadius)
          .outerRadius(calculatedOuterRadius)
          .cornerRadius(cornerRadius)
        )
        .transition()
        .duration(animationDuration / 2)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate(
            { startAngle: d.startAngle, endAngle: d.startAngle },
            { startAngle: d.startAngle, endAngle: d.endAngle }
          )
          return function(t) {
            return arc({
              ...d,
              startAngle: interpolate(t).startAngle,
              endAngle: interpolate(t).endAngle
            })!
          }
        })
        .on('end', function(d, i) {
          // 動畫完成後添加脈衝效果
          if (i === arcs.length - 1) {
            d3.select(this.parentNode)
              .transition()
              .duration(200)
              .style('transform', 'scale(1.02)')
              .transition()
              .duration(200)
              .style('transform', 'scale(1)')
          }
        })
    } else {
      paths.attr('d', arc)
    }

    // 互動事件
    if (interactive) {
      slices
        .on('mouseenter', function(event, d) {
          const slice = d3.select(this)
          const path = slice.select('path')
          
          // 不同的懸停效果
          switch (hoverEffect) {
            case 'lift':
              path.transition()
                .duration(200)
                .attr('transform', function() {
                  const centroid = arc.centroid(d)
                  return `translate(${centroid[0] * 0.1}, ${centroid[1] * 0.1})`
                })
              break
            case 'scale':
              slice.transition()
                .duration(200)
                .style('transform', 'scale(1.05)')
              break
            case 'glow':
              path.transition()
                .duration(200)
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))')
                .style('stroke-width', 3)
              break
            default:
              path.style('opacity', 0.8)
          }

          setHoveredSlice(d.index)
          
          if (showTooltip) {
            setTooltip({
              x: 0,
              y: 0,
              data: d.data
            })
          }
          
          onSliceHover?.(d.data)
        })
        .on('mouseleave', function() {
          const slice = d3.select(this)
          const path = slice.select('path')
          
          // 重置懸停效果
          switch (hoverEffect) {
            case 'lift':
              path.transition()
                .duration(200)
                .attr('transform', 'translate(0,0)')
              break
            case 'scale':
              slice.transition()
                .duration(200)
                .style('transform', 'scale(1)')
              break
            case 'glow':
              path.transition()
                .duration(200)
                .style('filter', 'none')
                .style('stroke-width', 2)
              break
            default:
              path.style('opacity', 1)
          }

          setHoveredSlice(null)
          setTooltip(null)
          onSliceHover?.(null)
        })
        .on('click', function(event, d) {
          onSliceClick?.(d.data)
        })
    }

    // 甜甜圈中心文字
    if (calculatedInnerRadius > 0 && visibleData.length > 0 && showCenterText) {
      const centerGroup = g.append('g')
        .attr('class', 'center-text')
        .attr('text-anchor', 'middle')

      // 計算總計和格式
      const total = visibleData.reduce((sum, d) => sum + d.value, 0)
      const centerText = centerTextFormat 
        ? centerTextFormat(total, visibleData)
        : { total: total.toLocaleString(), label: '總計' }
      
      centerGroup.append('text')
        .attr('class', 'center-total')
        .attr('y', -8)
        .style('font-size', `${Math.min(calculatedInnerRadius / 3, 24)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text(centerText.total)

      centerGroup.append('text')
        .attr('class', 'center-label')
        .attr('y', 12)
        .style('font-size', `${Math.min(calculatedInnerRadius / 5, 14)}px`)
        .style('fill', '#6b7280')
        .text(centerText.label)
    }

    // 標籤
    if (showLabels) {
      const labels = g.selectAll('.pie-label')
        .data(arcs.filter(d => d.data.percentage >= labelThreshold))
        .enter()
        .append('g')
        .attr('class', 'pie-label')

      // 標籤文字
      labels.append('text')
        .attr('transform', d => {
          const pos = outerArc.centroid(d)
          pos[0] = calculatedOuterRadius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
          return `translate(${pos})`
        })
        .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
        .style('font-size', '12px')
        .style('fill', '#374151')
        .text(d => {
          if (labelFormat) return labelFormat(d.data)
          return showPercentages 
            ? `${d.data.label} (${d.data.percentage.toFixed(1)}%)`
            : d.data.label
        })

      // 連接線
      labels.append('polyline')
        .attr('fill', 'none')
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('points', d => {
          const pos = outerArc.centroid(d)
          pos[0] = calculatedOuterRadius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1)
          return [arc.centroid(d), outerArc.centroid(d), pos].map(p => p.join(',')).join(' ')
        })
    }

  }, [
    visibleData, chartWidth, chartHeight, margin, calculatedInnerRadius, calculatedOuterRadius, 
    cornerRadius, padAngle, colorScale, animate, animationDuration, interactive, showLabels, 
    showPercentages, labelThreshold, labelFormat, showTooltip, onSliceClick, onSliceHover, showCenterText, centerTextFormat
  ])

  // 輔助函數：計算角度中點
  function midAngle(d: d3.PieArcDatum<ProcessedPieDataPoint>) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2
  }

  if (!data?.length) {
    return (
      <div className={cn('pie-chart-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('pie-chart-container relative flex', className)}
      style={style}
      {...props}
    >
      {/* 圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={chartWidth + margin.left + margin.right}
          height={chartHeight + margin.top + margin.bottom}
          className="pie-chart-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              top: 10,
              right: 10
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.data) : (
              <div>
                <div>{tooltip.data.label}</div>
                <div>值: {tooltip.data.value.toLocaleString()}</div>
                <div>比例: {tooltip.data.percentage.toFixed(1)}%</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 圖例 */}
      {showLegend && (
        <div className={cn(
          'legend',
          legendPosition === 'top' && 'order-first mb-4',
          legendPosition === 'bottom' && 'order-last mt-4',
          legendPosition === 'left' && 'order-first mr-4 flex-shrink-0',
          legendPosition === 'right' && 'order-last ml-4 flex-shrink-0'
        )}>
          <div className={cn(
            'flex gap-2',
            (legendPosition === 'top' || legendPosition === 'bottom') && 'flex-wrap justify-center',
            (legendPosition === 'left' || legendPosition === 'right') && 'flex-col'
          )}>
            {legendData.map((item) => (
              <div
                key={item.index}
                className={cn(
                  'flex items-center gap-2 text-sm cursor-pointer transition-all duration-200',
                  hoveredSlice !== null && hoveredSlice !== item.index && 'opacity-50',
                  hiddenSlices.has(item.index) && 'opacity-30 line-through'
                )}
                onClick={() => toggleSliceVisibility(item.index)}
                onMouseEnter={() => setHoveredSlice(item.index)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-sm flex-shrink-0 transition-opacity",
                    hiddenSlices.has(item.index) && 'opacity-50'
                  )}
                  style={{ backgroundColor: item.color }}
                />
                <span className={cn(
                  "transition-colors",
                  hiddenSlices.has(item.index) ? 'text-gray-400' : 'text-gray-700'
                )}>
                  {legendFormat ? legendFormat(processedData[item.index]) : (
                    `${item.label} (${item.percentage.toFixed(1)}%)`
                  )}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  {hiddenSlices.has(item.index) ? '隱藏' : '顯示'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 輔助函數
function midAngle(d: d3.PieArcDatum<any>) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2
}