import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { calculateAlignedPosition, AlignmentStrategy } from '../utils'

export interface AreaShapeData {
  x: any
  y: any
  y0?: any
  [key: string]: any
}

export interface AreaProps {
  data: AreaShapeData[]
  xScale: any
  yScale: any
  color?: string
  opacity?: number
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  baseline?: number | ((d: AreaShapeData) => number)
  alignment?: AlignmentStrategy
  gradient?: {
    id: string
    stops: { offset: string; color: string; opacity?: number }[]
  }
  onDataClick?: (event: React.MouseEvent) => void
  
  /** @deprecated 請使用 onDataClick 替代 */
  onAreaClick?: (event: React.MouseEvent) => void
}

export const Area: React.FC<AreaProps> = ({
  data,
  xScale,
  yScale,
  color = '#3b82f6',
  opacity = 0.6,
  curve = d3.curveLinear,
  className = '',
  animate = true,
  animationDuration = 300,
  baseline = 0,
  alignment = 'center',
  gradient,
  onDataClick,
  onAreaClick
}) => {
  const areaRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!areaRef.current || !data || !xScale || !yScale) return

    const selection = d3.select(areaRef.current)

    const areaGenerator = d3.area<AreaShapeData>()
      .x(d => calculateAlignedPosition(d.x, xScale, alignment))
      .y1(d => yScale(d.y))
      .y0(d => {
        if (typeof baseline === 'function') {
          const baselineValue = baseline(d)
          return baselineValue != null ? yScale(baselineValue) : yScale(0)
        }
        return d.y0 !== undefined ? yScale(d.y0) : yScale(baseline)
      })
      .curve(curve)

    const validData = data.filter(d => {
      if (d.x == null || d.y == null) return false
      
      // 如果使用動態 baseline，也需要驗證 baseline 值
      if (typeof baseline === 'function') {
        const baselineValue = baseline(d)
        return baselineValue != null && !isNaN(baselineValue) && !isNaN(d.y)
      }
      
      return !isNaN(d.y)
    })

    if (gradient) {
      let defs = selection.select('defs')
      if (defs.empty()) {
        defs = selection.append('defs')
      }

      const gradientDef = defs
        .selectAll(`#${gradient.id}`)
        .data([gradient])

      gradientDef
        .join('linearGradient')
        .attr('id', gradient.id)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', yScale.range()[0])
        .attr('x2', 0)
        .attr('y2', yScale.range()[1])
        .selectAll('stop')
        .data(gradient.stops)
        .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity || 1)
    }

    const areaPath = selection
      .selectAll('.area-path')
      .data([validData])

    areaPath
      .join(
        enter => {
          const path = enter
            .append('path')
            .attr('class', `area-path ${className}`)
            .attr('fill', gradient ? `url(#${gradient.id})` : color)
            .attr('opacity', opacity)
            .attr('d', areaGenerator)

          if (animate) {
            path
              .attr('opacity', 0)
              .transition()
              .duration(animationDuration)
              .attr('opacity', opacity)
          }

          return path
        },
        update => {
          if (animate) {
            update
              .transition()
              .duration(animationDuration)
              .attr('d', areaGenerator)
              .attr('fill', gradient ? `url(#${gradient.id})` : color)
              .attr('opacity', opacity)
          } else {
            update
              .attr('d', areaGenerator)
              .attr('fill', gradient ? `url(#${gradient.id})` : color)
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

    if (onDataClick || onAreaClick) {
      selection.selectAll('.area-path')
        .style('cursor', 'pointer')
        .on('click', function(event) {
          if (onDataClick) {
            onDataClick(event)
          } else if (onAreaClick) {
            onAreaClick(event)
          }
        })
    }

  }, [
    data,
    xScale,
    yScale,
    color,
    opacity,
    curve,
    className,
    animate,
    animationDuration,
    baseline,
    alignment,
    gradient,
    onDataClick,
    onAreaClick
  ])

  return (
    <g ref={areaRef} className={`area ${className}`} />
  )
}