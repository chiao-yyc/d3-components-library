import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { calculateAlignedPosition, AlignmentStrategy } from '../utils'

export interface LineShapeData {
  x: any
  y: any
  [key: string]: any
}

export interface LineProps {
  data: LineShapeData[]
  xScale: any
  yScale: any
  color?: string
  strokeWidth?: number
  opacity?: number
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  showPoints?: boolean
  pointRadius?: number
  pointColor?: string
  pointAlignment?: AlignmentStrategy
  onDataClick?: (d: LineShapeData | null, i?: number, event?: React.MouseEvent) => void
  onDataHover?: (d: LineShapeData | null, i?: number, event?: React.MouseEvent) => void
  
  /** @deprecated 請使用 onDataClick 替代 */
  onLineClick?: (event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataClick 替代 */
  onPointClick?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onPointMouseEnter?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onPointMouseLeave?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
}

export const Line: React.FC<LineProps> = ({
  data,
  xScale,
  yScale,
  color = '#3b82f6',
  strokeWidth = 2,
  opacity = 1,
  curve = d3.curveLinear,
  className = '',
  animate = true,
  animationDuration = 300,
  showPoints = false,
  pointRadius = 3,
  pointColor,
  pointAlignment = 'center',
  onDataClick,
  onDataHover,
  onLineClick,
  onPointClick,
  onPointMouseEnter,
  onPointMouseLeave
}) => {
  const lineRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!lineRef.current || !data || !xScale || !yScale) return

    const selection = d3.select(lineRef.current)

    const lineGenerator = d3.line<LineShapeData>()
      .x(d => calculateAlignedPosition(d.x, xScale, pointAlignment))
      .y(d => yScale(d.y))
      .curve(curve)

    const validData = data.filter(d => d.x != null && d.y != null)

    const linePath = selection
      .selectAll('.line-path')
      .data([validData])

    linePath
      .join(
        enter => {
          const path = enter
            .append('path')
            .attr('class', `line-path ${className}`)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('opacity', opacity)
            .attr('d', lineGenerator)

          if (animate) {
            // 🔧 修復方案：使用 opacity 動畫替代 stroke-dasharray 動畫
            path
              .attr('opacity', 0)
              .transition()
              .duration(animationDuration / 2)
              .attr('opacity', opacity)
          }

          return path
        },
        update => {
          if (animate) {
            update
              .transition()
              .duration(animationDuration)
              .attr('d', lineGenerator)
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('opacity', opacity)
          } else {
            update
              .attr('d', lineGenerator)
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('opacity', opacity)
          }
          return update
        },
        exit => exit
          .call(exit => animate ?
            exit
              .transition()
              .duration(animationDuration)
              .attr('opacity', 0)
              .remove()
            :
            exit.remove()
          )
      )

    if (onDataClick || onLineClick) {
      selection.selectAll('.line-path')
        .style('cursor', 'pointer')
        .on('click', function(event) {
          if (onDataClick) {
            onDataClick(null, undefined, event)
          } else if (onLineClick) {
            onLineClick(event)
          }
        })
    }

    if (showPoints) {
      const points = selection
        .selectAll('.line-point')
        .data(validData, (d: any, i: number) => d.id || i)

      points
        .join(
          enter => enter
            .append('circle')
            .attr('class', `line-point ${className}`)
            .attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
            .attr('cy', d => yScale(d.y))
            .attr('r', 0)
            .attr('fill', pointColor || color)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('opacity', opacity)
            .call(enter => animate ?
              enter
                .transition()
                .duration(animationDuration)
                .attr('r', pointRadius)
              :
              enter.attr('r', pointRadius)
            ),
          update => update
            .call(update => animate ?
              update
                .transition()
                .duration(animationDuration)
                .attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
                .attr('cy', d => yScale(d.y))
                .attr('r', pointRadius)
                .attr('fill', pointColor || color)
                .attr('stroke', color)
                .attr('opacity', opacity)
              :
              update
                .attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
                .attr('cy', d => yScale(d.y))
                .attr('r', pointRadius)
                .attr('fill', pointColor || color)
                .attr('stroke', color)
                .attr('opacity', opacity)
            ),
          exit => exit
            .call(exit => animate ?
              exit
                .transition()
                .duration(animationDuration)
                .attr('r', 0)
                .remove()
              :
              exit.remove()
            )
        )

      if (onDataClick || onPointClick || onDataHover || onPointMouseEnter || onPointMouseLeave) {
        selection.selectAll('.line-point')
          .style('cursor', 'pointer')
          .on('click', function(event, d) {
            const index = validData.indexOf(d)
            if (onDataClick) {
              onDataClick(d, index, event)
            } else if (onPointClick) {
              onPointClick(d, index, event)
            }
          })
          .on('mouseenter', function(event, d) {
            const index = validData.indexOf(d)
            if (onDataHover) {
              onDataHover(d, index, event)
            } else if (onPointMouseEnter) {
              onPointMouseEnter(d, index, event)
            }
          })
          .on('mouseleave', function(event, d) {
            const index = validData.indexOf(d)
            if (onDataHover) {
              onDataHover(null, index, event)
            } else if (onPointMouseLeave) {
              onPointMouseLeave(d, index, event)
            }
          })
      }
    }

  }, [
    data,
    xScale,
    yScale,
    color,
    strokeWidth,
    opacity,
    curve,
    className,
    animate,
    animationDuration,
    showPoints,
    pointRadius,
    pointColor,
    pointAlignment,
    onDataClick,
    onDataHover,
    onLineClick,
    onPointClick,
    onPointMouseEnter,
    onPointMouseLeave
  ])

  return (
    <g ref={lineRef} className={`line ${className}`} />
  )
}