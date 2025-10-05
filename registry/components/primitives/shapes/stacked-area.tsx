import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface StackedAreaData {
  x: any
  [key: string]: any
}

export interface StackedAreaSeries {
  key: string
  color: string
  name?: string
  opacity?: number
  gradient?: {
    id: string
    stops: { offset: string; color: string; opacity?: number }[]
  }
}

export interface StackedAreaProps {
  data: StackedAreaData[]
  series: StackedAreaSeries[]
  xScale: any
  yScale: any
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  stackOrder?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse'
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  onDataClick?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  onDataHover?: (series: StackedAreaSeries | null, event: React.MouseEvent) => void
  
  /** @deprecated 請使用 onDataClick 替代 */
  onAreaClick?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onAreaMouseEnter?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onAreaMouseLeave?: (series: StackedAreaSeries, event: React.MouseEvent) => void
}

export const StackedArea: React.FC<StackedAreaProps> = ({
  data,
  series,
  xScale,
  yScale,
  curve = d3.curveMonotoneX,
  className = '',
  animate = true,
  animationDuration = 300,
  stackOrder = 'none',
  stackOffset = 'none',
  onDataClick,
  onDataHover,
  onAreaClick,
  onAreaMouseEnter,
  onAreaMouseLeave
}) => {
  const stackedAreaRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!stackedAreaRef.current || !data || !series || !xScale || !yScale) return

    const selection = d3.select(stackedAreaRef.current)

    // 準備堆疊數據
    const keys = series.map(s => s.key)
    
    // 確保數據包含所有系列的數值，缺失值設為 0
    const processedData = data.map(d => {
      const processed = { ...d }
      keys.forEach(key => {
        processed[key] = Number(processed[key]) || 0
      })
      return processed
    })

    // 創建 D3 堆疊生成器
    const stack = d3.stack<StackedAreaData>()
      .keys(keys)
      .order(getStackOrder(stackOrder))
      .offset(getStackOffset(stackOffset))

    const stackedData = stack(processedData)


    // 區域生成器
    const areaGenerator = d3.area<d3.SeriesPoint<StackedAreaData>>()
      .x((d, i) => {
        if (xScale.bandwidth) {
          // 對於 band scale，我們需要創建連續的位置來形成平滑曲線
          const totalBands = processedData.length
          const bandWidth = xScale.bandwidth()
          const step = xScale.step ? xScale.step() : (xScale.range()[1] - xScale.range()[0]) / totalBands
          return xScale.range()[0] + (i * step) + (bandWidth / 2)
        } else {
          // 對於連續 scale，直接使用 scale 函數
          return xScale(d.data.x)
        }
      })
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(curve)

    // 處理漸變
    series.forEach(seriesItem => {
      if (seriesItem.gradient) {
        let defs = selection.select('defs')
        if (defs.empty()) {
          defs = selection.append('defs')
        }

        const gradientDef = defs
          .selectAll(`#${seriesItem.gradient.id}`)
          .data([seriesItem.gradient])

        gradientDef
          .join('linearGradient')
          .attr('id', seriesItem.gradient.id)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0)
          .attr('y1', yScale.range()[0])
          .attr('x2', 0)
          .attr('y2', yScale.range()[1])
          .selectAll('stop')
          .data(seriesItem.gradient.stops)
          .join('stop')
          .attr('offset', d => d.offset)
          .attr('stop-color', d => d.color)
          .attr('stop-opacity', d => d.opacity || 1)
      }
    })

    // 繪製堆疊區域
    stackedData.forEach((layerData, _index) => {
      const seriesItem = series.find(s => s.key === layerData.key)
      if (!seriesItem) return

      const layerSelection = selection
        .selectAll(`.stacked-area-layer-${layerData.key}`)
        .data([layerData])

      layerSelection
        .join(
          enter => {
            const layer = enter
              .append('g')
              .attr('class', `stacked-area-layer stacked-area-layer-${layerData.key} ${className}`)
              .attr('data-key', layerData.key)

            const path = layer
              .append('path')
              .attr('class', 'stacked-area-path')
              .attr('fill', seriesItem.gradient ? `url(#${seriesItem.gradient.id})` : seriesItem.color)
              .attr('opacity', seriesItem.opacity || 0.7)
              .attr('d', areaGenerator(layerData))

            if (animate) {
              path
                .attr('opacity', 0)
                .transition()
                .duration(animationDuration)
                .attr('opacity', seriesItem.opacity || 0.7)
            }

            // 添加事件處理
            if (onDataClick || onAreaClick || onDataHover || onAreaMouseEnter || onAreaMouseLeave) {
              path
                .style('cursor', 'pointer')
                .on('click', function(event) {
                  if (onDataClick) {
                    onDataClick(seriesItem, event)
                  } else if (onAreaClick) {
                    onAreaClick(seriesItem, event)
                  }
                })
                .on('mouseenter', function(event) {
                  if (onDataHover) {
                    onDataHover(seriesItem, event)
                  } else if (onAreaMouseEnter) {
                    onAreaMouseEnter(seriesItem, event)
                  }
                })
                .on('mouseleave', function(event) {
                  if (onDataHover) {
                    onDataHover(null, event)
                  } else if (onAreaMouseLeave) {
                    onAreaMouseLeave(seriesItem, event)
                  }
                })
            }

            return layer
          },
          update => {
            const path = update.select('.stacked-area-path')

            if (animate) {
              path
                .transition()
                .duration(animationDuration)
                .attr('d', areaGenerator(layerData))
                .attr('fill', seriesItem.gradient ? `url(#${seriesItem.gradient.id})` : seriesItem.color)
                .attr('opacity', seriesItem.opacity || 0.7)
            } else {
              path
                .attr('d', areaGenerator(layerData))
                .attr('fill', seriesItem.gradient ? `url(#${seriesItem.gradient.id})` : seriesItem.color)
                .attr('opacity', seriesItem.opacity || 0.7)
            }

            return update
          },
          exit => exit
            .call(exit => animate ?
              exit
                .select('.stacked-area-path')
                .transition()
                .duration(animationDuration)
                .attr('opacity', 0)
                .remove()
              :
              exit.remove()
            )
        )
    })

  }, [
    data,
    series,
    xScale,
    yScale,
    curve,
    className,
    animate,
    animationDuration,
    stackOrder,
    stackOffset,
    onDataClick,
    onDataHover,
    onAreaClick,
    onAreaMouseEnter,
    onAreaMouseLeave
  ])

  return (
    <g ref={stackedAreaRef} className={`stacked-area ${className}`} />
  )
}

// 堆疊順序映射
function getStackOrder(order: string): any {
  switch (order) {
    case 'ascending': return d3.stackOrderAscending
    case 'descending': return d3.stackOrderDescending
    case 'insideOut': return d3.stackOrderInsideOut
    case 'reverse': return d3.stackOrderReverse
    case 'none':
    default: return d3.stackOrderNone
  }
}

// 堆疊偏移映射
function getStackOffset(offset: string): any {
  switch (offset) {
    case 'expand': return d3.stackOffsetExpand
    case 'diverging': return d3.stackOffsetDiverging
    case 'silhouette': return d3.stackOffsetSilhouette
    case 'wiggle': return d3.stackOffsetWiggle
    case 'none':
    default: return d3.stackOffsetNone
  }
}