import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { GaugeChartProps, ProcessedGaugeDataPoint, GaugeZone, TickData } from './types'

const DEFAULT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e']

export function GaugeChart({
  data,
  value,
  min = 0,
  max = 100,
  valueKey,
  labelKey,
  valueAccessor,
  labelAccessor,
  mapping,
  width = 300,
  height = 200,
  margin = { top: 30, right: 30, bottom: 50, left: 30 },
  innerRadius,
  outerRadius,
  startAngle = -90,
  endAngle = 90,
  cornerRadius = 0,
  backgroundColor = '#e5e7eb',
  foregroundColor = '#3b82f6',
  colors = DEFAULT_COLORS,
  zones,
  needleColor = '#374151',
  needleWidth = 3,
  centerCircleRadius = 8,
  centerCircleColor = '#374151',
  showValue = true,
  showLabel = true,
  showTicks = true,
  showMinMax = true,
  tickCount = 5,
  valueFormat,
  labelFormat,
  tickFormat,
  fontSize = 14,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 1000,
  animationEasing = 'easeElasticOut',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onValueChange,
  className,
  style,
  ...props
}: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label?: string } | null>(null)
  const [hoveredZone, setHoveredZone] = useState<number | null>(null)

  // 計算尺寸
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  
  // 為刻度和標籤預留空間
  const labelSpace = showTicks || showMinMax ? 40 : 20
  const availableRadius = Math.min(chartWidth / 2, chartHeight) - labelSpace
  
  // 計算半徑
  const calculatedOuterRadius = outerRadius || Math.max(50, availableRadius)
  const calculatedInnerRadius = innerRadius || calculatedOuterRadius * 0.7
  
  // 調整中心點位置，確保儀表盤完全在視圖內
  const centerX = chartWidth / 2
  const centerY = Math.max(calculatedOuterRadius + 20, chartHeight - calculatedOuterRadius - 20)

  // 角度轉換 (度 -> 弧度)
  const startAngleRad = (startAngle - 90) * Math.PI / 180
  const endAngleRad = (endAngle - 90) * Math.PI / 180

  // 資料處理
  const processedData = useMemo((): ProcessedGaugeDataPoint => {
    let processedValue = value !== undefined ? value : 0
    let processedLabel: string | undefined

    if (data && data.length > 0) {
      const d = data[0] // 取第一筆資料
      
      if (mapping) {
        processedValue = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0
        processedLabel = mapping.label 
          ? (typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label]))
          : undefined
      } else if (valueAccessor) {
        processedValue = valueAccessor(d)
        processedLabel = labelAccessor?.(d)
      } else if (valueKey) {
        processedValue = Number(d[valueKey]) || 0
        processedLabel = labelKey ? String(d[labelKey]) : undefined
      }
    }

    // 確保值在範圍內
    processedValue = Math.max(min, Math.min(max, processedValue))

    return {
      value: processedValue,
      label: processedLabel,
      originalData: data?.[0] || { value: processedValue }
    }
  }, [data, value, min, max, valueKey, labelKey, valueAccessor, labelAccessor, mapping])

  // 角度比例尺
  const angleScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([min, max])
      .range([startAngleRad, endAngleRad])
  }, [min, max, startAngleRad, endAngleRad])

  // 顏色比例尺
  const colorScale = useMemo(() => {
    if (zones) {
      return null // 使用區域顏色
    }
    return d3.scaleLinear<string>()
      .domain(d3.range(colors.length).map(i => min + (max - min) * i / (colors.length - 1)))
      .range(colors)
  }, [colors, zones, min, max])

  // 刻度資料
  const tickData = useMemo((): TickData[] => {
    if (!showTicks) return []
    
    const ticks = d3.range(tickCount).map(i => {
      const tickValue = min + (max - min) * i / (tickCount - 1)
      return {
        value: tickValue,
        angle: angleScale(tickValue),
        label: tickFormat ? tickFormat(tickValue) : tickValue.toString()
      }
    })
    
    return ticks
  }, [min, max, tickCount, showTicks, angleScale, tickFormat])

  // 弧形生成器
  const arcGenerator = useMemo(() => {
    return d3.arc()
      .innerRadius(calculatedInnerRadius)
      .outerRadius(calculatedOuterRadius)
      .cornerRadius(cornerRadius)
  }, [calculatedInnerRadius, calculatedOuterRadius, cornerRadius])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${centerX + margin.left}, ${centerY + margin.top})`)

    // 背景弧形
    const backgroundArc = arcGenerator({
      startAngle: startAngleRad,
      endAngle: endAngleRad
    })

    if (backgroundArc) {
      g.append('path')
        .attr('d', backgroundArc)
        .attr('fill', backgroundColor)
        .attr('stroke', 'none')
    }

    // 區域或漸變弧形
    if (zones) {
      // 繪製區域
      zones.forEach((zone, i) => {
        const zoneStartAngle = angleScale(Math.max(zone.min, min))
        const zoneEndAngle = angleScale(Math.min(zone.max, max))
        
        const zoneArc = arcGenerator({
          startAngle: zoneStartAngle,
          endAngle: zoneEndAngle
        })

        if (zoneArc) {
          const zonePath = g.append('path')
            .attr('d', zoneArc)
            .attr('fill', zone.color)
            .attr('stroke', 'none')
            .style('cursor', interactive ? 'pointer' : 'default')

          if (interactive) {
            zonePath
              .on('mouseenter', function(event) {
                d3.select(this).attr('opacity', 0.8)
                setHoveredZone(i)
                
                if (showTooltip) {
                  setTooltip({
                    x: 0,
                    y: 0,
                    value: zone.min,
                    label: zone.label || `${zone.min}-${zone.max}`
                  })
                }
              })
              .on('mouseleave', function() {
                d3.select(this).attr('opacity', 1)
                setHoveredZone(null)
                setTooltip(null)
              })
          }
        }
      })
    } else {
      // 單一顏色或漸變弧形
      const valueAngle = angleScale(processedData.value)
      const valueArc = arcGenerator({
        startAngle: startAngleRad,
        endAngle: valueAngle
      })

      if (valueArc) {
        const valuePath = g.append('path')
          .attr('d', valueArc)
          .attr('fill', colorScale ? colorScale(processedData.value) : foregroundColor)
          .attr('stroke', 'none')

        // 動畫效果
        if (animate) {
          const initialArc = arcGenerator({
            startAngle: startAngleRad,
            endAngle: startAngleRad
          })

          if (initialArc) {
            valuePath
              .attr('d', initialArc)
              .transition()
              .duration(animationDuration)
              .ease(d3[animationEasing as keyof typeof d3] as any)
              .attrTween('d', function() {
                const interpolate = d3.interpolate(startAngleRad, valueAngle)
                return function(t: number) {
                  const currentAngle = interpolate(t)
                  return arcGenerator({
                    startAngle: startAngleRad,
                    endAngle: currentAngle
                  })!
                }
              })
          }
        }
      }
    }

    // 指針
    const needleAngle = angleScale(processedData.value)
    const needleLength = calculatedOuterRadius + 10
    const needleX = Math.cos(needleAngle) * needleLength
    const needleY = Math.sin(needleAngle) * needleLength

    const needle = g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', needleX)
      .attr('y2', needleY)
      .attr('stroke', needleColor)
      .attr('stroke-width', needleWidth)
      .attr('stroke-linecap', 'round')

    // 指針動畫
    if (animate) {
      needle
        .attr('x2', Math.cos(startAngleRad) * needleLength)
        .attr('y2', Math.sin(startAngleRad) * needleLength)
        .transition()
        .duration(animationDuration)
        .ease(d3[animationEasing as keyof typeof d3] as any)
        .attr('x2', needleX)
        .attr('y2', needleY)
    }

    // 中心圓點
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', centerCircleRadius)
      .attr('fill', centerCircleColor)

    // 刻度
    if (showTicks && tickData.length > 0) {
      const ticks = g.selectAll('.tick')
        .data(tickData)
        .enter()
        .append('g')
        .attr('class', 'tick')

      // 刻度線
      ticks.append('line')
        .attr('x1', d => Math.cos(d.angle) * (calculatedOuterRadius + 5))
        .attr('y1', d => Math.sin(d.angle) * (calculatedOuterRadius + 5))
        .attr('x2', d => Math.cos(d.angle) * (calculatedOuterRadius + 15))
        .attr('y2', d => Math.sin(d.angle) * (calculatedOuterRadius + 15))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 1)

      // 刻度標籤
      ticks.append('text')
        .attr('x', d => Math.cos(d.angle) * (calculatedOuterRadius + 25))
        .attr('y', d => Math.sin(d.angle) * (calculatedOuterRadius + 25))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(d => d.label)
    }

    // 最小/最大值標籤
    if (showMinMax) {
      const minAngle = startAngleRad
      const maxAngle = endAngleRad
      const labelRadius = calculatedOuterRadius + 35

      // 最小值
      g.append('text')
        .attr('x', Math.cos(minAngle) * labelRadius)
        .attr('y', Math.sin(minAngle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(tickFormat ? tickFormat(min) : min.toString())

      // 最大值
      g.append('text')
        .attr('x', Math.cos(maxAngle) * labelRadius)
        .attr('y', Math.sin(maxAngle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(tickFormat ? tickFormat(max) : max.toString())
    }

  }, [
    processedData, chartWidth, chartHeight, centerX, centerY, margin,
    calculatedInnerRadius, calculatedOuterRadius, cornerRadius,
    startAngleRad, endAngleRad, angleScale, colorScale, backgroundColor,
    foregroundColor, zones, needleColor, needleWidth, centerCircleRadius,
    centerCircleColor, animate, animationDuration, animationEasing,
    showTicks, tickData, showMinMax, min, max, tickFormat, fontSize, fontFamily
  ])

  return (
    <div 
      ref={containerRef}
      className={cn('gauge-chart-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="gauge-chart-svg"
        />
        
        {/* 數值顯示 */}
        {showValue && (
          <div 
            className="absolute transform -translate-x-1/2"
            style={{
              left: centerX + margin.left,
              top: centerY + margin.top - calculatedInnerRadius / 4,
            }}
          >
            <div className="text-center">
              <div 
                className="font-bold text-gray-900"
                style={{ fontSize: `${fontSize + 4}px`, fontFamily }}
              >
                {valueFormat ? valueFormat(processedData.value) : processedData.value}
              </div>
              {showLabel && processedData.label && (
                <div 
                  className="text-gray-600 mt-1"
                  style={{ fontSize: `${fontSize - 2}px`, fontFamily }}
                >
                  {labelFormat ? labelFormat(processedData.label) : processedData.label}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              top: 10,
              right: 10
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.value, tooltip.label) : (
              <div>
                {tooltip.label && <div>{tooltip.label}</div>}
                <div>值: {tooltip.value}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}