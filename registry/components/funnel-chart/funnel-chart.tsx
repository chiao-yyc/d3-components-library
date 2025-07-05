import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { FunnelChartProps, ProcessedFunnelDataPoint, FunnelSegment } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'
]

export function FunnelChart({
  data,
  labelKey,
  valueKey,
  labelAccessor,
  valueAccessor,
  mapping,
  width = 400,
  height = 500,
  margin = { top: 20, right: 60, bottom: 20, left: 60 },
  direction = 'top',
  shape = 'trapezoid',
  gap = 4,
  cornerRadius = 0,
  proportionalMode = 'traditional',
  shrinkageType = 'percentage',
  shrinkageAmount = 0.1,
  minWidth = 50,
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  showLabels = true,
  showValues = true,
  showPercentages = true,
  showConversionRates = true,
  labelPosition = 'side',
  valueFormat,
  percentageFormat,
  conversionRateFormat,
  fontSize = 12,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 800,
  animationDelay = 100,
  animationEasing = 'easeOutCubic',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onSegmentClick,
  onSegmentHover,
  className,
  style,
  ...props
}: FunnelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedFunnelDataPoint } | null>(null)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)

  // 計算尺寸
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // 資料處理
  const processedData = useMemo((): ProcessedFunnelDataPoint[] => {
    if (!data?.length) return []

    const processed = data.map((d, index) => {
      let label: string, value: number

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label])
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0
      } else if (labelAccessor && valueAccessor) {
        label = labelAccessor(d)
        value = valueAccessor(d)
      } else if (labelKey && valueKey) {
        label = String(d[labelKey])
        value = Number(d[valueKey]) || 0
      } else {
        // 自動偵測：假設第一個欄位是 label，第二個是 value
        const keys = Object.keys(d)
        label = String(d[keys[0]])
        value = Number(d[keys[1]]) || 0
      }

      return {
        label,
        value,
        percentage: 0, // 會在下面計算
        originalData: d,
        index
      } as ProcessedFunnelDataPoint
    }).filter(d => d.value > 0) // 過濾無效資料

    // 計算百分比和轉換率
    const maxValue = Math.max(...processed.map(d => d.value))
    processed.forEach((d, i) => {
      d.percentage = (d.value / maxValue) * 100
      d.conversionRate = i === 0 ? 100 : (d.value / processed[i - 1].value) * 100
    })

    return processed
  }, [data, labelKey, valueKey, labelAccessor, valueAccessor, mapping])

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

  // 座標轉換函數
  const transformCoordinates = (x: number, y: number, width: number, height: number) => {
    switch (direction) {
      case 'top': // 向下（預設）
        return { x, y, width, height }
      case 'bottom': // 向上 - Y軸翻轉
        return { x, y: chartHeight - y - height, width, height }
      case 'left': // 向右 - 交換 X,Y 軸
        return { x: y, y: chartWidth - x - width, width: height, height: width }
      case 'right': // 向左 - 交換 X,Y 軸並翻轉
        return { x: chartHeight - y - height, y: x, width: height, height: width }
      default:
        return { x, y, width, height }
    }
  }

  // 漏斗段落資料
  const segments = useMemo((): FunnelSegment[] => {
    if (!processedData.length) return []

    let currentY = 0
    
    // 預計算所有段落的寬度（用於一致收縮模式）
    const segmentWidths: number[] = []
    
    if (proportionalMode === 'consistent') {
      // 一致收縮模式：計算每層的上底和下底寬度
      const startWidth = chartWidth * 0.9
      
      for (let i = 0; i < processedData.length; i++) {
        let topWidth: number
        let bottomWidth: number
        
        if (i === 0) {
          topWidth = startWidth
        } else {
          // 連接上一層的下底寬度
          topWidth = segmentWidths[(i - 1) * 2 + 1] // 上一層的下底寬度
        }
        
        // 計算收縮量
        let shrinkage: number
        if (shrinkageType === 'fixed') {
          shrinkage = shrinkageAmount
        } else if (shrinkageType === 'percentage') {
          shrinkage = topWidth * shrinkageAmount
        } else {
          // data-driven: 根據下一層數據比例計算收縮
          if (i < processedData.length - 1) {
            const currentValue = processedData[i].value
            const nextValue = processedData[i + 1].value
            const shrinkageRatio = 1 - (nextValue / currentValue)
            shrinkage = topWidth * Math.max(0.05, Math.min(0.3, shrinkageRatio)) // 限制在5-30%之間
          } else {
            shrinkage = topWidth * 0.2 // 最後一層默認收縮20%
          }
        }
        
        bottomWidth = Math.max(minWidth, topWidth - shrinkage)
        
        // 儲存當前層的上底和下底寬度
        segmentWidths[i * 2] = topWidth // 上底寬度
        segmentWidths[i * 2 + 1] = bottomWidth // 下底寬度
      }
    }
    
    return processedData.map((d, i) => {
      let currentHeight: number
      let segmentWidth: number
      
      if (proportionalMode === 'traditional') {
        // 傳統模式：寬度按比例，高度相等
        currentHeight = (chartHeight - gap * (processedData.length - 1)) / processedData.length
        segmentWidth = (d.percentage / 100) * chartWidth
      } else if (proportionalMode === 'height') {
        // 高度比例模式：高度按比例，寬度自然遞減（保持漏斗形狀）
        const totalHeight = chartHeight - gap * (processedData.length - 1)
        const totalValue = processedData.reduce((sum, d) => sum + d.value, 0)
        currentHeight = (d.value / totalValue) * totalHeight
        
        // 寬度按排序位置遞減，保持漏斗形狀
        const maxWidth = chartWidth * 0.9
        const minWidth = chartWidth * 0.3
        const widthRange = maxWidth - minWidth
        segmentWidth = maxWidth - (i / (processedData.length - 1)) * widthRange
      } else if (proportionalMode === 'consistent') {
        // 一致收縮模式：高度相等，寬度按一致收縮規則
        currentHeight = (chartHeight - gap * (processedData.length - 1)) / processedData.length
        segmentWidth = segmentWidths[i * 2] // 取上底寬度
      } else {
        // 面積比例模式：計算真正的面積比例
        const totalHeight = chartHeight - gap * (processedData.length - 1)
        const totalValue = processedData.reduce((sum, d) => sum + d.value, 0)
        
        // 目標面積比例
        const targetAreaRatio = d.value / totalValue
        const totalArea = chartWidth * totalHeight * 0.7 // 預留一些空間
        const targetArea = targetAreaRatio * totalArea
        
        // 計算寬度（按位置遞減）
        const maxWidth = chartWidth * 0.9
        const minWidth = chartWidth * 0.3
        const widthRange = maxWidth - minWidth
        const topWidth = maxWidth - (i / (processedData.length - 1)) * widthRange
        const bottomWidth = i < processedData.length - 1 
          ? maxWidth - ((i + 1) / (processedData.length - 1)) * widthRange
          : topWidth * 0.8
        
        // 根據梯形面積公式反推高度: Area = (topWidth + bottomWidth) * height / 2
        const avgWidth = (topWidth + bottomWidth) / 2
        currentHeight = targetArea / avgWidth
        segmentWidth = topWidth
      }
      
      const baseX = (chartWidth - segmentWidth) / 2
      const baseY = currentY
      
      // 套用方向轉換
      const transformed = transformCoordinates(baseX, baseY, segmentWidth, currentHeight)
      const x = transformed.x
      const y = transformed.y
      const finalWidth = transformed.width
      const finalHeight = transformed.height
      
      currentY += currentHeight + gap

      let path = ''

      if (shape === 'trapezoid') {
        // 梯形形狀 - 根據比例模式計算下一段的寬度
        let nextWidth: number
        
        if (proportionalMode === 'traditional') {
          nextWidth = i < processedData.length - 1 
            ? (processedData[i + 1].percentage / 100) * chartWidth 
            : segmentWidth * 0.8
        } else if (proportionalMode === 'consistent') {
          nextWidth = segmentWidths[i * 2 + 1]
        } else if (proportionalMode === 'height') {
          const maxWidth = chartWidth * 0.9
          const minWidth = chartWidth * 0.3
          const widthRange = maxWidth - minWidth
          nextWidth = i < processedData.length - 1 
            ? maxWidth - ((i + 1) / (processedData.length - 1)) * widthRange
            : segmentWidth * 0.8
        } else {
          const maxWidth = chartWidth * 0.9
          const minWidth = chartWidth * 0.3
          const widthRange = maxWidth - minWidth
          nextWidth = i < processedData.length - 1 
            ? maxWidth - ((i + 1) / (processedData.length - 1)) * widthRange
            : segmentWidth * 0.8
        }
        
        // 生成梯形路徑 - 根據方向調整
        if (direction === 'top') {
          // 向下：上寬下窄
          const x1 = x
          const x2 = x + finalWidth
          const x3 = x + (finalWidth - nextWidth) / 2 + nextWidth
          const x4 = x + (finalWidth - nextWidth) / 2
          const y1 = y
          const y2 = y + finalHeight
          
          if (cornerRadius > 0) {
            path = `M ${x1 + cornerRadius} ${y1}
                    L ${x2 - cornerRadius} ${y1}
                    Q ${x2} ${y1} ${x2} ${y1 + cornerRadius}
                    L ${x3} ${y2 - cornerRadius}
                    Q ${x3} ${y2} ${x3 - cornerRadius} ${y2}
                    L ${x4 + cornerRadius} ${y2}
                    Q ${x4} ${y2} ${x4} ${y2 - cornerRadius}
                    L ${x1} ${y1 + cornerRadius}
                    Q ${x1} ${y1} ${x1 + cornerRadius} ${y1} Z`
          } else {
            path = `M ${x1} ${y1} L ${x2} ${y1} L ${x3} ${y2} L ${x4} ${y2} Z`
          }
        } else if (direction === 'bottom') {
          // 向上：下寬上窄
          const x1 = x + (finalWidth - nextWidth) / 2
          const x2 = x + (finalWidth - nextWidth) / 2 + nextWidth
          const x3 = x + finalWidth
          const x4 = x
          const y1 = y
          const y2 = y + finalHeight
          
          if (cornerRadius > 0) {
            path = `M ${x1 + cornerRadius} ${y1}
                    L ${x2 - cornerRadius} ${y1}
                    Q ${x2} ${y1} ${x2} ${y1 + cornerRadius}
                    L ${x3} ${y2 - cornerRadius}
                    Q ${x3} ${y2} ${x3 - cornerRadius} ${y2}
                    L ${x4 + cornerRadius} ${y2}
                    Q ${x4} ${y2} ${x4} ${y2 - cornerRadius}
                    L ${x1} ${y1 + cornerRadius}
                    Q ${x1} ${y1} ${x1 + cornerRadius} ${y1} Z`
          } else {
            path = `M ${x1} ${y1} L ${x2} ${y1} L ${x3} ${y2} L ${x4} ${y2} Z`
          }
        } else {
          // 橫向漏斗使用簡化的矩形，暫時不處理梯形
          if (cornerRadius > 0) {
            path = `M ${x + cornerRadius} ${y}
                    L ${x + finalWidth - cornerRadius} ${y}
                    Q ${x + finalWidth} ${y} ${x + finalWidth} ${y + cornerRadius}
                    L ${x + finalWidth} ${y + finalHeight - cornerRadius}
                    Q ${x + finalWidth} ${y + finalHeight} ${x + finalWidth - cornerRadius} ${y + finalHeight}
                    L ${x + cornerRadius} ${y + finalHeight}
                    Q ${x} ${y + finalHeight} ${x} ${y + finalHeight - cornerRadius}
                    L ${x} ${y + cornerRadius}
                    Q ${x} ${y} ${x + cornerRadius} ${y} Z`
          } else {
            path = `M ${x} ${y} L ${x + finalWidth} ${y} L ${x + finalWidth} ${y + finalHeight} L ${x} ${y + finalHeight} Z`
          }
        }
      } else if (shape === 'rectangle') {
        // 矩形形狀
        if (cornerRadius > 0) {
          path = `M ${x + cornerRadius} ${y}
                  L ${x + finalWidth - cornerRadius} ${y}
                  Q ${x + finalWidth} ${y} ${x + finalWidth} ${y + cornerRadius}
                  L ${x + finalWidth} ${y + finalHeight - cornerRadius}
                  Q ${x + finalWidth} ${y + finalHeight} ${x + finalWidth - cornerRadius} ${y + finalHeight}
                  L ${x + cornerRadius} ${y + finalHeight}
                  Q ${x} ${y + finalHeight} ${x} ${y + finalHeight - cornerRadius}
                  L ${x} ${y + cornerRadius}
                  Q ${x} ${y} ${x + cornerRadius} ${y} Z`
        } else {
          path = `M ${x} ${y} L ${x + finalWidth} ${y} L ${x + finalWidth} ${y + finalHeight} L ${x} ${y + finalHeight} Z`
        }
      } else if (shape === 'curved') {
        // 曲線形狀 - 根據比例模式計算下一段的寬度
        let nextWidth: number
        
        if (proportionalMode === 'traditional') {
          nextWidth = i < processedData.length - 1 
            ? (processedData[i + 1].percentage / 100) * chartWidth 
            : segmentWidth * 0.8
        } else if (proportionalMode === 'consistent') {
          nextWidth = segmentWidths[i * 2 + 1] // 當前層的下底寬度
        } else {
          // height 和 area 模式都使用遞減寬度
          const maxWidth = chartWidth * 0.9
          const minWidth = chartWidth * 0.3
          const widthRange = maxWidth - minWidth
          nextWidth = i < processedData.length - 1 
            ? maxWidth - ((i + 1) / (processedData.length - 1)) * widthRange
            : segmentWidth * 0.8
        }
        
        const x1 = (chartWidth - segmentWidth) / 2
        const x2 = (chartWidth + segmentWidth) / 2
        const x3 = (chartWidth + nextWidth) / 2
        const x4 = (chartWidth - nextWidth) / 2
        const y1 = y
        const y2 = y + currentHeight
        const midY = y + currentHeight / 2

        path = `M ${x1} ${y1}
                L ${x2} ${y1}
                Q ${x2 + 10} ${midY} ${x3} ${y2}
                L ${x4} ${y2}
                Q ${x1 - 10} ${midY} ${x1} ${y1} Z`
      }

      return {
        label: d.label,
        value: d.value,
        percentage: d.percentage,
        conversionRate: d.conversionRate || 100,
        color: typeof colorScale === 'function' ? colorScale(i) : colorScale(i.toString()),
        x,
        y,
        width: finalWidth,
        height: finalHeight,
        path,
        index: i
      }
    })
  }, [processedData, chartWidth, chartHeight, gap, shape, cornerRadius, colorScale, proportionalMode, shrinkageType, shrinkageAmount, minWidth, direction])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !segments.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 繪製漏斗段落
    const segmentGroups = g.selectAll('.funnel-segment')
      .data(segments)
      .enter()
      .append('g')
      .attr('class', 'funnel-segment')

    const paths = segmentGroups.append('path')
      .attr('d', d => d.path)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 動畫效果
    if (animate) {
      paths
        .style('opacity', 0)
        .attr('transform', 'scale(0.8)')
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * animationDelay)
        .ease(d3.easeQuadOut)
        .style('opacity', 1)
        .attr('transform', 'scale(1)')
    }

    // 互動事件
    if (interactive) {
      segmentGroups
        .on('mouseenter', function(event, d) {
          d3.select(this).select('path')
            .transition()
            .duration(200)
            .style('opacity', 0.8)
            .attr('transform', 'scale(1.02)')

          setHoveredSegment(d.index)
          
          if (showTooltip) {
            setTooltip({
              x: 0,
              y: 0,
              data: processedData[d.index]
            })
          }
          
          onSegmentHover?.(processedData[d.index])
        })
        .on('mouseleave', function() {
          d3.select(this).select('path')
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('transform', 'scale(1)')

          setHoveredSegment(null)
          setTooltip(null)
          onSegmentHover?.(null)
        })
        .on('click', function(event, d) {
          onSegmentClick?.(processedData[d.index])
        })
    }

    // 標籤
    if (showLabels || showValues || showPercentages || showConversionRates) {
      segments.forEach((segment, i) => {
        const labelGroup = g.append('g')
          .attr('class', 'segment-labels')

        let textX = 0
        let textY = segment.y + segment.height / 2
        let anchor = 'middle'

        // 根據方向調整標籤位置
        if (labelPosition === 'side') {
          if (direction === 'top' || direction === 'bottom') {
            // 垂直漏斗：標籤在右側
            textX = chartWidth + 10
            textY = segment.y + segment.height / 2
            anchor = 'start'
          } else {
            // 橫向漏斗：標籤在右側，垂直均勻分布
            textX = chartWidth + 10
            textY = 50 + (i * 80) // 固定間距分布，從頂部開始
            anchor = 'start'
          }
        } else if (labelPosition === 'outside') {
          if (direction === 'top') {
            textX = segment.x + segment.width / 2
            textY = segment.y - 10
            anchor = 'middle'
          } else if (direction === 'bottom') {
            textX = segment.x + segment.width / 2
            textY = segment.y + segment.height + 20
            anchor = 'middle'
          } else if (direction === 'left') {
            textX = segment.x - 10
            textY = segment.y + segment.height / 2
            anchor = 'end'
          } else {
            textX = segment.x + segment.width + 10
            textY = segment.y + segment.height / 2
            anchor = 'start'
          }
        } else if (labelPosition === 'inside') {
          textX = segment.x + segment.width / 2
          textY = segment.y + segment.height / 2
          anchor = 'middle'
        }

        let yOffset = 0
        let xOffset = 0
        const isHorizontal = direction === 'left' || direction === 'right'

        // 標籤文字
        if (showLabels) {
          labelGroup.append('text')
            .attr('x', textX + xOffset)
            .attr('y', textY + yOffset)
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', 'central')
            .style('font-size', `${fontSize}px`)
            .style('font-family', fontFamily)
            .style('font-weight', 'bold')
            .style('fill', labelPosition === 'inside' ? '#fff' : '#374151')
            .text(segment.label)
          
          if (isHorizontal && labelPosition === 'side') {
            xOffset += 80 // 橫向排列
          } else {
            yOffset += fontSize + 2 // 垂直排列
          }
        }

        // 數值
        if (showValues) {
          labelGroup.append('text')
            .attr('x', textX + xOffset)
            .attr('y', textY + yOffset)
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', 'central')
            .style('font-size', `${fontSize - 1}px`)
            .style('font-family', fontFamily)
            .style('fill', labelPosition === 'inside' ? '#fff' : '#6b7280')
            .text(valueFormat ? valueFormat(segment.value) : segment.value.toLocaleString())
          
          if (isHorizontal && labelPosition === 'side') {
            xOffset += 80
          } else {
            yOffset += fontSize + 1
          }
        }

        // 百分比
        if (showPercentages) {
          labelGroup.append('text')
            .attr('x', textX + xOffset)
            .attr('y', textY + yOffset)
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', 'central')
            .style('font-size', `${fontSize - 1}px`)
            .style('font-family', fontFamily)
            .style('fill', labelPosition === 'inside' ? '#fff' : '#6b7280')
            .text(percentageFormat ? percentageFormat(segment.percentage) : `${segment.percentage.toFixed(1)}%`)
          
          if (isHorizontal && labelPosition === 'side') {
            xOffset += 80
          } else {
            yOffset += fontSize + 1
          }
        }

        // 轉換率
        if (showConversionRates && i > 0) {
          labelGroup.append('text')
            .attr('x', textX + xOffset)
            .attr('y', textY + yOffset)
            .attr('text-anchor', anchor)
            .attr('dominant-baseline', 'central')
            .style('font-size', `${fontSize - 2}px`)
            .style('font-family', fontFamily)
            .style('fill', labelPosition === 'inside' ? '#fff' : '#9ca3af')
            .text(conversionRateFormat ? conversionRateFormat(segment.conversionRate) : `${segment.conversionRate.toFixed(1)}%`)
        }
      })
    }

  }, [
    segments, chartWidth, chartHeight, margin, animate, animationDuration,
    animationDelay, animationEasing, interactive, showLabels, showValues,
    showPercentages, showConversionRates, labelPosition, valueFormat,
    percentageFormat, conversionRateFormat, fontSize, fontFamily
  ])

  if (!data?.length) {
    return (
      <div className={cn('funnel-chart-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('funnel-chart-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="funnel-chart-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg pointer-events-none"
            style={{
              top: 10,
              right: 10,
              maxWidth: '200px'
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.data) : (
              <div>
                <div className="font-semibold">{tooltip.data.label}</div>
                <div>數值: {tooltip.data.value.toLocaleString()}</div>
                <div>佔比: {tooltip.data.percentage.toFixed(1)}%</div>
                {tooltip.data.conversionRate && (
                  <div>轉換率: {tooltip.data.conversionRate.toFixed(1)}%</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}