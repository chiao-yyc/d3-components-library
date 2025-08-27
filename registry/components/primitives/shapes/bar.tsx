import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { calculateBarPosition, AlignmentStrategy } from '../utils'

export interface BarShapeData {
  x: any
  y: any
  width?: number
  height?: number
  value?: number
  label?: string
  color?: string
  [key: string]: any
}

export interface BarProps {
  data: BarShapeData[]
  xScale: any
  yScale: any
  color?: string | ((d: BarShapeData, i: number) => string)
  opacity?: number
  orientation?: 'vertical' | 'horizontal'
  className?: string
  animate?: boolean
  animationDuration?: number
  alignment?: AlignmentStrategy
  barWidthRatio?: number
  
  // 標準事件命名
  onDataClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  onDataHover?: (d: BarShapeData | null, i: number, event: React.MouseEvent) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onBarClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseEnter?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseLeave?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
}

export const Bar: React.FC<BarProps> = ({
  data,
  xScale,
  yScale,
  color = '#3b82f6',
  opacity = 1,
  orientation = 'vertical',
  className = '',
  animate = true,
  animationDuration = 300,
  alignment = 'center',
  barWidthRatio = 0.8,
  onDataClick,
  onDataHover,
  onBarClick,
  onBarMouseEnter,
  onBarMouseLeave
}) => {
  const barsRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!barsRef.current || !data || !xScale || !yScale) return

    const selection = d3.select(barsRef.current)
    
    const bars = selection
      .selectAll('.bar-shape')
      .data(data, (d: any, i: number) => d.id || i)

    const colorFn = typeof color === 'function' ? color : () => color

    if (orientation === 'vertical') {
      const barWidth = xScale.bandwidth 
        ? xScale.bandwidth() * barWidthRatio
        : Math.abs(xScale(data[1]?.x) - xScale(data[0]?.x)) * barWidthRatio

      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `bar-shape ${className}`)
            .attr('x', (d: BarShapeData) => {
              const { x } = calculateBarPosition(d.x, xScale, alignment, barWidth)
              return x
            })
            .attr('y', yScale(0))
            .attr('width', barWidth)
            .attr('height', 0)
            .attr('fill', colorFn)
            .attr('opacity', opacity)
            .call(enter => animate ? 
              enter
                .transition()
                .duration(animationDuration)
                .attr('y', (d: BarShapeData) => yScale(d.y))
                .attr('height', (d: BarShapeData) => yScale(0) - yScale(d.y))
              : 
              enter
                .attr('y', (d: BarShapeData) => yScale(d.y))
                .attr('height', (d: BarShapeData) => yScale(0) - yScale(d.y))
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('x', (d: BarShapeData) => {
                  const { x } = calculateBarPosition(d.x, xScale, alignment, barWidth)
                  return x
                })
                .attr('y', (d: BarShapeData) => yScale(d.y))
                .attr('width', barWidth)
                .attr('height', (d: BarShapeData) => yScale(0) - yScale(d.y))
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('x', (d: BarShapeData) => {
                  const { x } = calculateBarPosition(d.x, xScale, alignment, barWidth)
                  return x
                })
                .attr('y', (d: BarShapeData) => yScale(d.y))
                .attr('width', barWidth)
                .attr('height', (d: BarShapeData) => yScale(0) - yScale(d.y))
                .attr('fill', colorFn)
                .attr('opacity', opacity)
            ),
          exit => exit
            .call(exit => animate ?
              exit
                .transition()
                .duration(animationDuration)
                .attr('height', 0)
                .attr('y', yScale(0))
                .remove()
              :
              exit.remove()
            )
        )
    } else {
      const barHeight = yScale.bandwidth 
        ? yScale.bandwidth() * barWidthRatio
        : Math.abs(yScale(data[1]?.y) - yScale(data[0]?.y)) * barWidthRatio

      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `bar-shape ${className}`)
            .attr('x', xScale(0))
            .attr('y', (d: BarShapeData) => {
              const { x: y } = calculateBarPosition(d.y, yScale, alignment, barHeight)
              return y
            })
            .attr('width', 0)
            .attr('height', barHeight)
            .attr('fill', colorFn)
            .attr('opacity', opacity)
            .call(enter => animate ?
              enter
                .transition()
                .duration(animationDuration)
                .attr('width', (d: BarShapeData) => xScale(d.x) - xScale(0))
              :
              enter
                .attr('width', (d: BarShapeData) => xScale(d.x) - xScale(0))
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('x', xScale(0))
                .attr('y', (d: BarShapeData) => {
                  const { x: y } = calculateBarPosition(d.y, yScale, alignment, barHeight)
                  return y
                })
                .attr('width', (d: BarShapeData) => xScale(d.x) - xScale(0))
                .attr('height', barHeight)
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('x', xScale(0))
                .attr('y', (d: BarShapeData) => {
                  const { x: y } = calculateBarPosition(d.y, yScale, alignment, barHeight)
                  return y
                })
                .attr('width', (d: BarShapeData) => xScale(d.x) - xScale(0))
                .attr('height', barHeight)
                .attr('fill', colorFn)
                .attr('opacity', opacity)
            ),
          exit => exit
            .call(exit => animate ?
              exit
                .transition()
                .duration(animationDuration)
                .attr('width', 0)
                .remove()
              :
              exit.remove()
            )
        )
    }

    if (onDataClick || onBarClick || onDataHover || onBarMouseEnter || onBarMouseLeave) {
      selection.selectAll('.bar-shape')
        .on('click', function(event, d) {
          const index = data.indexOf(d)
          // 優先使用標準事件處理器
          if (onDataClick) {
            onDataClick(d, index, event)
          } else if (onBarClick) {
            onBarClick(d, index, event)
          }
        })
        .on('mouseenter', function(event, d) {
          const index = data.indexOf(d)
          // 優先使用標準事件處理器
          if (onDataHover) {
            onDataHover(d, index, event)
          } else if (onBarMouseEnter) {
            onBarMouseEnter(d, index, event)
          }
        })
        .on('mouseleave', function(event, d) {
          const index = data.indexOf(d)
          // 優先使用標準事件處理器
          if (onDataHover) {
            onDataHover(null, index, event)
          } else if (onBarMouseLeave) {
            onBarMouseLeave(d, index, event)
          }
        })
    }

  }, [
    data,
    xScale,
    yScale,
    color,
    opacity,
    orientation,
    className,
    animate,
    animationDuration,
    alignment,
    barWidthRatio,
    onDataClick,
    onDataHover,
    onBarClick,
    onBarMouseEnter,
    onBarMouseLeave
  ])

  return (
    <g ref={barsRef} className={`bars bars-${orientation} ${className}`} />
  )
}