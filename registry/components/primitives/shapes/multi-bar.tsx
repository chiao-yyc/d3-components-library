import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { AlignmentStrategy } from '../utils'

export interface MultiBarData {
  x: any
  y: any
  groupOffset?: number
  [key: string]: any
}

export interface MultiBarProps {
  data: MultiBarData[]
  xScale: any
  yScale: any
  color?: string | ((d: MultiBarData, i: number) => string)
  opacity?: number
  orientation?: 'vertical' | 'horizontal'
  className?: string
  animate?: boolean
  animationDuration?: number
  barWidth?: number
  groupOffset?: number
  alignment?: AlignmentStrategy
  onDataClick?: (d: MultiBarData, i: number, event: React.MouseEvent) => void
  onDataHover?: (d: MultiBarData | null, i: number, event: React.MouseEvent) => void
  
  /** @deprecated 請使用 onDataClick 替代 */
  onBarClick?: (d: MultiBarData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseEnter?: (d: MultiBarData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseLeave?: (d: MultiBarData, i: number, event: React.MouseEvent) => void
}

export const MultiBar: React.FC<MultiBarProps> = ({
  data,
  xScale,
  yScale,
  color = '#3b82f6',
  opacity = 1,
  orientation = 'vertical',
  className = '',
  animate = true,
  animationDuration = 300,
  barWidth,
  groupOffset = 0,
  alignment: _alignment = 'center',
  onDataClick,
  onDataHover,
  onBarClick,
  onBarMouseEnter,
  onBarMouseLeave
}) => {
  const barRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!barRef.current || !data || !xScale || !yScale) return

    const selection = d3.select(barRef.current)

    // 計算 bar 寬度
    const calculatedBarWidth = barWidth || (xScale.bandwidth ? xScale.bandwidth() : 20)

    // 顏色函數
    const colorFn = typeof color === 'function' 
      ? (d: MultiBarData, i: number) => color(d, i)
      : () => color

    const bars = selection
      .selectAll('.multi-bar-shape')
      .data(data, (d: any, i: number) => d.id || i)

    if (orientation === 'vertical') {
      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `multi-bar-shape ${className}`)
            .attr('x', (d: MultiBarData) => {
              const x = xScale(d.x)
              const baseX = xScale.bandwidth ? x : x - calculatedBarWidth / 2
              return baseX + groupOffset
            })
            .attr('y', yScale(0))
            .attr('width', calculatedBarWidth)
            .attr('height', 0)
            .attr('fill', colorFn)
            .attr('opacity', opacity)
            .call(enter => animate ? 
              enter
                .transition()
                .duration(animationDuration)
                .attr('y', (d: MultiBarData) => yScale(Math.max(0, d.y)))
                .attr('height', (d: MultiBarData) => Math.abs(yScale(0) - yScale(d.y)))
              : 
              enter
                .attr('y', (d: MultiBarData) => yScale(Math.max(0, d.y)))
                .attr('height', (d: MultiBarData) => Math.abs(yScale(0) - yScale(d.y)))
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('x', (d: MultiBarData) => {
                  const x = xScale(d.x)
                  const baseX = xScale.bandwidth ? x : x - calculatedBarWidth / 2
                  return baseX + groupOffset
                })
                .attr('y', (d: MultiBarData) => yScale(Math.max(0, d.y)))
                .attr('width', calculatedBarWidth)
                .attr('height', (d: MultiBarData) => Math.abs(yScale(0) - yScale(d.y)))
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('x', (d: MultiBarData) => {
                  const x = xScale(d.x)
                  const baseX = xScale.bandwidth ? x : x - calculatedBarWidth / 2
                  return baseX + groupOffset
                })
                .attr('y', (d: MultiBarData) => yScale(Math.max(0, d.y)))
                .attr('width', calculatedBarWidth)
                .attr('height', (d: MultiBarData) => Math.abs(yScale(0) - yScale(d.y)))
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
      // 橫向 bar 圖的邏輯
      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `multi-bar-shape ${className}`)
            .attr('x', xScale(0))
            .attr('y', (d: MultiBarData) => {
              const y = yScale(d.x)
              const baseY = yScale.bandwidth ? y : y - calculatedBarWidth / 2
              return baseY + groupOffset
            })
            .attr('width', 0)
            .attr('height', calculatedBarWidth)
            .attr('fill', colorFn)
            .attr('opacity', opacity)
            .call(enter => animate ? 
              enter
                .transition()
                .duration(animationDuration)
                .attr('width', (d: MultiBarData) => Math.abs(xScale(d.y) - xScale(0)))
              : 
              enter
                .attr('width', (d: MultiBarData) => Math.abs(xScale(d.y) - xScale(0)))
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('y', (d: MultiBarData) => {
                  const y = yScale(d.x)
                  const baseY = yScale.bandwidth ? y : y - calculatedBarWidth / 2
                  return baseY + groupOffset
                })
                .attr('width', (d: MultiBarData) => Math.abs(xScale(d.y) - xScale(0)))
                .attr('height', calculatedBarWidth)
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('y', (d: MultiBarData) => {
                  const y = yScale(d.x)
                  const baseY = yScale.bandwidth ? y : y - calculatedBarWidth / 2
                  return baseY + groupOffset
                })
                .attr('width', (d: MultiBarData) => Math.abs(xScale(d.y) - xScale(0)))
                .attr('height', calculatedBarWidth)
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

    // 事件處理
    if (onDataClick || onBarClick || onDataHover || onBarMouseEnter || onBarMouseLeave) {
      selection.selectAll('.multi-bar-shape')
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
          const index = data.indexOf(d)
          if (onDataClick) {
            onDataClick(d, index, event)
          } else if (onBarClick) {
            onBarClick(d, index, event)
          }
        })
        .on('mouseenter', function(event, d) {
          const index = data.indexOf(d)
          if (onDataHover) {
            onDataHover(d, index, event)
          } else if (onBarMouseEnter) {
            onBarMouseEnter(d, index, event)
          }
        })
        .on('mouseleave', function(event, d) {
          const index = data.indexOf(d)
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
    barWidth,
    groupOffset,
    onDataClick,
    onDataHover,
    onBarClick,
    onBarMouseEnter,
    onBarMouseLeave
  ])

  return (
    <g ref={barRef} className={`multi-bar ${className}`} />
  )
}