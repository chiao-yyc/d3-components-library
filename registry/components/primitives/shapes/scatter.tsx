import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { calculateAlignedPosition, AlignmentStrategy } from '../utils'

export interface ScatterShapeData {
  x: any
  y: any
  size?: number
  color?: string
  group?: string
  [key: string]: any
}

export interface ScatterProps {
  data: ScatterShapeData[]
  xScale: any
  yScale: any
  radius?: number
  sizeScale?: any
  colorScale?: any
  className?: string
  animate?: boolean
  animationDuration?: number
  opacity?: number
  strokeWidth?: number
  strokeColor?: string
  pointAlignment?: AlignmentStrategy
  onDataClick?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
  onDataHover?: (dataPoint: ScatterShapeData | null, event: React.MouseEvent) => void
  
  /** @deprecated 請使用 onDataClick 替代 */
  onPointClick?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onPointMouseEnter?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onPointMouseLeave?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
}

export const Scatter: React.FC<ScatterProps> = ({
  data,
  xScale,
  yScale,
  radius = 4,
  sizeScale,
  colorScale,
  className = '',
  animate = true,
  animationDuration = 300,
  opacity = 0.7,
  strokeWidth = 1,
  strokeColor = 'white',
  pointAlignment = 'center',
  onDataClick,
  onDataHover,
  onPointClick,
  onPointMouseEnter,
  onPointMouseLeave
}) => {
  const scatterRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!scatterRef.current || !data || !xScale || !yScale) return

    const selection = d3.select(scatterRef.current)

    // 綁定數據並創建圓點
    const circles = selection
      .selectAll<SVGCircleElement, ScatterShapeData>('.scatter-point')
      .data(data, (d, i) => `${d.x}-${d.y}-${i}`)

    circles
      .join(
        enter => {
          const enterCircles = enter
            .append('circle')
            .attr('class', `scatter-point ${className}`)
            .attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
            .attr('cy', d => yScale(d.y))
            .attr('r', d => {
              if (sizeScale && d.size !== undefined) {
                return sizeScale(d.size)
              }
              return radius
            })
            .attr('fill', d => {
              if (colorScale && d.color !== undefined) {
                return colorScale(d.color)
              }
              if (colorScale && d.group !== undefined) {
                return colorScale(d.group)
              }
              return '#3b82f6' // 默認藍色
            })
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth)
            .attr('opacity', animate ? 0 : opacity)

          if (animate) {
            enterCircles
              .transition()
              .delay((d, i) => i * 10)
              .duration(animationDuration)
              .attr('opacity', opacity)
          }

          // 添加事件處理
          if (onDataClick || onPointClick || onDataHover || onPointMouseEnter || onPointMouseLeave) {
            enterCircles
              .style('cursor', 'pointer')
              .on('click', function(event, d) {
                if (onDataClick) {
                  onDataClick(d, event)
                } else if (onPointClick) {
                  onPointClick(d, event)
                }
              })
              .on('mouseenter', function(event, d) {
                if (onDataHover) {
                  onDataHover(d, event)
                } else if (onPointMouseEnter) {
                  onPointMouseEnter(d, event)
                }
                // 鼠標懸停效果
                d3.select(this)
                  .transition()
                  .duration(150)
                  .attr('r', function() {
                    const currentR = Number(d3.select(this).attr('r'))
                    return currentR * 1.2
                  })
                  .attr('opacity', 1)
              })
              .on('mouseleave', function(event, d) {
                if (onDataHover) {
                  onDataHover(null, event)
                } else if (onPointMouseLeave) {
                  onPointMouseLeave(d, event)
                }
                // 恢復原始大小
                d3.select(this)
                  .transition()
                  .duration(150)
                  .attr('r', () => {
                    if (sizeScale && d.size !== undefined) {
                      return sizeScale(d.size)
                    }
                    return radius
                  })
                  .attr('opacity', opacity)
              })
          }

          return enterCircles
        },
        update => {
          const updateCircles = update
            .attr('cx', d => calculateAlignedPosition(d.x, xScale, pointAlignment))
            .attr('cy', d => yScale(d.y))
            .attr('fill', d => {
              if (colorScale && d.color !== undefined) {
                return colorScale(d.color)
              }
              if (colorScale && d.group !== undefined) {
                return colorScale(d.group)
              }
              return '#3b82f6'
            })

          if (animate) {
            updateCircles
              .transition()
              .duration(animationDuration)
              .attr('r', d => {
                if (sizeScale && d.size !== undefined) {
                  return sizeScale(d.size)
                }
                return radius
              })
              .attr('opacity', opacity)
          } else {
            updateCircles
              .attr('r', d => {
                if (sizeScale && d.size !== undefined) {
                  return sizeScale(d.size)
                }
                return radius
              })
              .attr('opacity', opacity)
          }

          return updateCircles
        },
        exit => exit
          .call(exit => animate ?
            exit
              .transition()
              .duration(animationDuration)
              .attr('opacity', 0)
              .attr('r', 0)
              .remove()
            :
            exit.remove()
          )
      )

  }, [
    data,
    xScale,
    yScale,
    radius,
    sizeScale,
    colorScale,
    className,
    animate,
    animationDuration,
    opacity,
    strokeWidth,
    strokeColor,
    pointAlignment,
    onDataClick,
    onDataHover,
    onPointClick,
    onPointMouseEnter,
    onPointMouseLeave
  ])

  return (
    <g ref={scatterRef} className={`scatter ${className}`} />
  )
}