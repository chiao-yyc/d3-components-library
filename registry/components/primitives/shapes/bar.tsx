import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

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
  onBarClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  onBarMouseEnter?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
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
      const barWidth = xScale.bandwidth ? xScale.bandwidth() : 
        Math.abs(xScale(data[1]?.x) - xScale(data[0]?.x)) * 0.8

      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `bar-shape ${className}`)
            .attr('x', (d: BarShapeData) => {
              const x = xScale(d.x)
              return xScale.bandwidth ? x : x - barWidth / 2
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
                  const x = xScale(d.x)
                  return xScale.bandwidth ? x : x - barWidth / 2
                })
                .attr('y', (d: BarShapeData) => yScale(d.y))
                .attr('width', barWidth)
                .attr('height', (d: BarShapeData) => yScale(0) - yScale(d.y))
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('x', (d: BarShapeData) => {
                  const x = xScale(d.x)
                  return xScale.bandwidth ? x : x - barWidth / 2
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
      const barHeight = yScale.bandwidth ? yScale.bandwidth() :
        Math.abs(yScale(data[1]?.y) - yScale(data[0]?.y)) * 0.8

      bars
        .join(
          enter => enter
            .append('rect')
            .attr('class', `bar-shape ${className}`)
            .attr('x', xScale(0))
            .attr('y', (d: BarShapeData) => {
              const y = yScale(d.y)
              return yScale.bandwidth ? y : y - barHeight / 2
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
                  const y = yScale(d.y)
                  return yScale.bandwidth ? y : y - barHeight / 2
                })
                .attr('width', (d: BarShapeData) => xScale(d.x) - xScale(0))
                .attr('height', barHeight)
                .attr('fill', colorFn)
                .attr('opacity', opacity)
              :
              update
                .attr('x', xScale(0))
                .attr('y', (d: BarShapeData) => {
                  const y = yScale(d.y)
                  return yScale.bandwidth ? y : y - barHeight / 2
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

    if (onBarClick || onBarMouseEnter || onBarMouseLeave) {
      selection.selectAll('.bar-shape')
        .on('click', function(event, d) {
          if (onBarClick) {
            const index = data.indexOf(d)
            onBarClick(d, index, event)
          }
        })
        .on('mouseenter', function(event, d) {
          if (onBarMouseEnter) {
            const index = data.indexOf(d)
            onBarMouseEnter(d, index, event)
          }
        })
        .on('mouseleave', function(event, d) {
          if (onBarMouseLeave) {
            const index = data.indexOf(d)
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
    onBarClick,
    onBarMouseEnter,
    onBarMouseLeave
  ])

  return (
    <g ref={barsRef} className={`bars bars-${orientation} ${className}`} />
  )
}