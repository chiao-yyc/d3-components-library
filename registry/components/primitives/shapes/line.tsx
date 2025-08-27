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
  onLineClick?: (event: React.MouseEvent) => void
  onPointClick?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
  onPointMouseEnter?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
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

    if (onLineClick) {
      selection.selectAll('.line-path')
        .style('cursor', 'pointer')
        .on('click', function(event) {
          onLineClick(event)
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

      if (onPointClick || onPointMouseEnter || onPointMouseLeave) {
        selection.selectAll('.line-point')
          .style('cursor', 'pointer')
          .on('click', function(event, d) {
            if (onPointClick) {
              const index = validData.indexOf(d)
              onPointClick(d, index, event)
            }
          })
          .on('mouseenter', function(event, d) {
            if (onPointMouseEnter) {
              const index = validData.indexOf(d)
              onPointMouseEnter(d, index, event)
            }
          })
          .on('mouseleave', function(event, d) {
            if (onPointMouseLeave) {
              const index = validData.indexOf(d)
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
    onLineClick,
    onPointClick,
    onPointMouseEnter,
    onPointMouseLeave
  ])

  return (
    <g ref={lineRef} className={`line ${className}`} />
  )
}