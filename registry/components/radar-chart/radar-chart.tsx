import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { RadarChartProps, ProcessedRadarDataPoint, RadarSeries, RadarAxis, RadarValue } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

// 角度轉換函數
function angleToRadians(angle: number): number {
  return (angle * Math.PI) / 180
}

// 極座標轉直角座標
function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number): { x: number; y: number } {
  const radians = angleToRadians(angle)
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians)
  }
}

export function RadarChart({
  data,
  axes,
  labelKey,
  labelAccessor,
  valueAccessor,
  mapping,
  width = 500,
  height = 500,
  margin = { top: 60, right: 60, bottom: 60, left: 60 },
  radius,
  levels = 5,
  startAngle = -90,
  clockwise = true,
  showGrid = true,
  showGridLabels = true,
  showAxes = true,
  showAxisLabels = true,
  showDots = true,
  showArea = true,
  minValue = 0,
  maxValue,
  autoScale = true,
  scaleType = 'linear',
  gridLevels = 5,
  gridStroke = '#e5e7eb',
  gridStrokeWidth = 1,
  gridOpacity = 0.7,
  axisStroke = '#9ca3af',
  axisStrokeWidth = 1,
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  strokeWidth = 2,
  areaOpacity = 0.25,
  dotRadius = 4,
  dotStroke = '#fff',
  dotStrokeWidth = 2,
  showLabels = true,
  showValues = false,
  axisLabelOffset = 20,
  gridLabelOffset = 10,
  valueFormat,
  fontSize = 12,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 1000,
  animationDelay = 100,
  animationEasing = 'easeOutCubic',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onSeriesClick,
  onSeriesHover,
  onDotClick,
  onDotHover,
  showLegend = true,
  legendPosition = 'bottom',
  className,
  style,
  ...props
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: RadarValue; series: ProcessedRadarDataPoint } | null>(null)
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null)

  // 計算尺寸
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  const chartRadius = radius || Math.min(chartWidth, chartHeight) / 2 - 20
  const centerX = chartWidth / 2
  const centerY = chartHeight / 2

  // 處理資料
  const processedData = useMemo((): ProcessedRadarDataPoint[] => {
    if (!data?.length || !axes?.length) return []

    // 計算數值範圍
    let actualMaxValue = maxValue
    if (autoScale || actualMaxValue === undefined) {
      const allValues = data.flatMap(d => 
        axes.map(axis => {
          if (mapping) {
            const accessor = mapping.values[axis]
            return typeof accessor === 'function' ? accessor(d) : Number(d[accessor]) || 0
          } else if (valueAccessor) {
            return valueAccessor(d, axis)
          } else {
            return Number(d[axis]) || 0
          }
        })
      )
      actualMaxValue = Math.max(...allValues)
    }

    const processed = data.map((d, index) => {
      let label: string

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label])
      } else if (labelAccessor) {
        label = labelAccessor(d)
      } else if (labelKey) {
        label = String(d[labelKey])
      } else {
        label = `Series ${index + 1}`
      }

      const values: RadarValue[] = axes.map(axis => {
        let value: number

        if (mapping) {
          const accessor = mapping.values[axis]
          value = typeof accessor === 'function' ? accessor(d) : Number(d[accessor]) || 0
        } else if (valueAccessor) {
          value = valueAccessor(d, axis)
        } else {
          value = Number(d[axis]) || 0
        }

        const normalizedValue = (value - minValue) / (actualMaxValue! - minValue)

        return {
          axis,
          value: normalizedValue,
          normalizedValue,
          originalValue: value
        }
      })

      return {
        label,
        values,
        color: '',
        originalData: d,
        index
      }
    })

    return processed
  }, [data, axes, labelKey, labelAccessor, valueAccessor, mapping, minValue, maxValue, autoScale])

  // 顏色比例尺
  const colorScale = useMemo(() => {
    if (colorScheme !== 'custom') {
      const schemes = {
        blues: d3.interpolateBlues,
        greens: d3.interpolateGreens,
        oranges: d3.interpolateOranges,
        reds: d3.interpolateReds,
        purples: d3.interpolatePurples
      }
      return d3.scaleSequential(schemes[colorScheme])
        .domain([0, processedData.length - 1])
    }
    
    return d3.scaleOrdinal(colors)
      .domain(processedData.map((d, i) => i.toString()))
  }, [colors, colorScheme, processedData])

  // 軸配置
  const radarAxes = useMemo((): RadarAxis[] => {
    if (!axes.length) return []

    return axes.map((axis, index) => {
      const angle = startAngle + (360 / axes.length) * index * (clockwise ? 1 : -1)
      const position = polarToCartesian(centerX, centerY, chartRadius + axisLabelOffset, angle)
      
      return {
        name: axis,
        min: minValue,
        max: maxValue || 1,
        scale: scaleType === 'log' 
          ? d3.scaleLog().domain([minValue || 0.1, maxValue || 1]).range([0, chartRadius])
          : d3.scaleLinear().domain([minValue, maxValue || 1]).range([0, chartRadius]),
        angle,
        x: position.x,
        y: position.y
      }
    })
  }, [axes, centerX, centerY, chartRadius, axisLabelOffset, startAngle, clockwise, minValue, maxValue, scaleType])

  // 雷達數據系列
  const radarSeries = useMemo((): RadarSeries[] => {
    if (!processedData.length || !radarAxes.length) return []

    return processedData.map((d, seriesIndex) => {
      const color = typeof colorScale === 'function' ? colorScale(seriesIndex) : colorScale(seriesIndex.toString())
      
      const points = d.values.map((value, axisIndex) => {
        const axis = radarAxes[axisIndex]
        const r = value.normalizedValue * chartRadius
        const position = polarToCartesian(centerX, centerY, r, axis.angle)
        
        return {
          x: position.x,
          y: position.y,
          value
        }
      })

      // 生成路徑
      const pathData = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ') + ' Z'

      return {
        label: d.label,
        values: d.values,
        color,
        path: pathData,
        points,
        area: showArea ? pathData : undefined,
        index: seriesIndex
      }
    })
  }, [processedData, radarAxes, centerX, centerY, chartRadius, colorScale, showArea])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !radarSeries.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 繪製網格
    if (showGrid) {
      const gridGroup = g.append('g').attr('class', 'grid-group')

      // 同心圓
      for (let level = 1; level <= gridLevels; level++) {
        const r = (chartRadius / gridLevels) * level
        
        gridGroup.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', r)
          .attr('fill', 'none')
          .attr('stroke', gridStroke)
          .attr('stroke-width', gridStrokeWidth)
          .attr('opacity', gridOpacity)

        // 網格標籤
        if (showGridLabels && level < gridLevels) {
          const labelValue = (maxValue || 1) * (level / gridLevels)
          gridGroup.append('text')
            .attr('x', centerX + gridLabelOffset)
            .attr('y', centerY - r)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .style('font-size', `${fontSize - 2}px`)
            .style('font-family', fontFamily)
            .style('fill', '#6b7280')
            .text(valueFormat ? valueFormat(labelValue) : labelValue.toFixed(1))
        }
      }

      // 軸線
      if (showAxes) {
        radarAxes.forEach(axis => {
          const endPosition = polarToCartesian(centerX, centerY, chartRadius, axis.angle)
          
          gridGroup.append('line')
            .attr('x1', centerX)
            .attr('y1', centerY)
            .attr('x2', endPosition.x)
            .attr('y2', endPosition.y)
            .attr('stroke', axisStroke)
            .attr('stroke-width', axisStrokeWidth)
            .attr('opacity', gridOpacity)
        })
      }
    }

    // 繪製數據區域
    if (showArea) {
      const areaGroup = g.append('g').attr('class', 'area-group')
      
      radarSeries.forEach(series => {
        areaGroup.append('path')
          .attr('class', `area-${series.index}`)
          .attr('d', series.area)
          .attr('fill', series.color)
          .attr('fill-opacity', areaOpacity)
          .attr('stroke', 'none')
      })
    }

    // 繪製數據線條
    const lineGroup = g.append('g').attr('class', 'line-group')
    
    const seriesLines = radarSeries.map(series => {
      return lineGroup.append('path')
        .attr('class', `line-${series.index}`)
        .attr('d', series.path)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', strokeWidth)
        .style('cursor', interactive ? 'pointer' : 'default')
    })

    // 繪製數據點
    if (showDots) {
      const dotsGroup = g.append('g').attr('class', 'dots-group')
      
      radarSeries.forEach(series => {
        series.points.forEach((point, pointIndex) => {
          dotsGroup.append('circle')
            .attr('class', `dot-${series.index}-${pointIndex}`)
            .attr('cx', point.x)
            .attr('cy', point.y)
            .attr('r', dotRadius)
            .attr('fill', series.color)
            .attr('stroke', dotStroke)
            .attr('stroke-width', dotStrokeWidth)
            .style('cursor', interactive ? 'pointer' : 'default')
            .datum({ series, point, pointIndex })
        })
      })
    }

    // 軸標籤
    if (showAxisLabels) {
      const labelsGroup = g.append('g').attr('class', 'labels-group')
      
      radarAxes.forEach(axis => {
        labelsGroup.append('text')
          .attr('x', axis.x)
          .attr('y', axis.y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', `${fontSize}px`)
          .style('font-family', fontFamily)
          .style('font-weight', 'bold')
          .style('fill', '#374151')
          .text(axis.name)
      })
    }

    // 動畫效果
    if (animate) {
      seriesLines.forEach((line, index) => {
        const totalLength = line.node()?.getTotalLength() || 0
        
        line
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(animationDuration)
          .delay(index * animationDelay)
          .ease(d3.easeQuadOut)
          .attr('stroke-dashoffset', 0)
      })

      if (showArea) {
        g.selectAll('.area-group path')
          .style('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay(animationDelay * radarSeries.length)
          .ease(d3.easeQuadOut)
          .style('opacity', areaOpacity)
      }

      if (showDots) {
        g.selectAll('.dots-group circle')
          .attr('r', 0)
          .transition()
          .duration(animationDuration / 2)
          .delay((d: any, i: number) => animationDelay * radarSeries.length + i * 50)
          .ease(d3.easeBackOut.overshoot(1.5))
          .attr('r', dotRadius)
      }
    }

    // 互動事件
    if (interactive) {
      // 線條互動
      seriesLines.forEach((line, index) => {
        line
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', strokeWidth + 2)

            setHoveredSeries(index)
            onSeriesHover?.(processedData[index])
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', strokeWidth)

            setHoveredSeries(null)
            onSeriesHover?.(null)
          })
          .on('click', function() {
            onSeriesClick?.(processedData[index])
          })
      })

      // 點互動
      if (showDots) {
        g.selectAll('.dots-group circle')
          .on('mouseenter', function(event, d: any) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', dotRadius + 2)

            if (showTooltip) {
              setTooltip({
                x: event.pageX,
                y: event.pageY,
                value: d.point.value,
                series: processedData[d.series.index]
              })
            }

            onDotHover?.(d.point.value, processedData[d.series.index])
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', dotRadius)

            setTooltip(null)
            onDotHover?.(null as any, null as any)
          })
          .on('click', function(event, d: any) {
            onDotClick?.(d.point.value, processedData[d.series.index])
          })
      }
    }

  }, [
    radarSeries, radarAxes, centerX, centerY, chartRadius, margin, showGrid, showGridLabels,
    showAxes, showAxisLabels, showDots, showArea, gridLevels, gridStroke, gridStrokeWidth,
    gridOpacity, axisStroke, axisStrokeWidth, strokeWidth, areaOpacity, dotRadius, dotStroke,
    dotStrokeWidth, axisLabelOffset, gridLabelOffset, valueFormat, fontSize, fontFamily,
    animate, animationDuration, animationDelay, interactive, maxValue, processedData
  ])

  if (!data?.length || !axes?.length) {
    return (
      <div className={cn('radar-chart-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('radar-chart-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="radar-chart-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              maxWidth: '200px'
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.value, tooltip.series) : (
              <div>
                <div className="font-semibold">{tooltip.series.label}</div>
                <div className="text-gray-300">{tooltip.value.axis}</div>
                <div>數值: {valueFormat ? valueFormat(tooltip.value.originalValue) : tooltip.value.originalValue.toFixed(2)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 圖例 */}
      {showLegend && processedData.length > 1 && (
        <div className={`legend flex gap-4 justify-center mt-4 ${
          legendPosition === 'top' ? 'order-first mb-4 mt-0' : 
          legendPosition === 'left' ? 'absolute left-0 top-1/2 transform -translate-y-1/2 flex-col' :
          legendPosition === 'right' ? 'absolute right-0 top-1/2 transform -translate-y-1/2 flex-col' : ''
        }`}>
          {radarSeries.map((series, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-sm text-gray-700">{series.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}