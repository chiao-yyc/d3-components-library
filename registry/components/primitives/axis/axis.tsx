import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useChartCanvas } from '../canvas'

export interface AxisProps {
  scale: any
  orientation: 'top' | 'bottom' | 'left' | 'right'
  tickCount?: number
  tickSize?: number
  tickSizeInner?: number
  tickSizeOuter?: number
  tickPadding?: number
  tickFormat?: (domainValue: any, index: number) => string
  tickValues?: any[]
  ticks?: any[]
  label?: string
  labelOffset?: number
  className?: string
  gridlines?: boolean
  gridlinesClassName?: string
  transform?: string
}

export const Axis: React.FC<AxisProps> = ({
  scale,
  orientation,
  tickCount,
  tickSize,
  tickSizeInner,
  tickSizeOuter,
  tickPadding,
  tickFormat,
  tickValues,
  ticks,
  label,
  labelOffset = 0,
  className = '',
  gridlines = false,
  gridlinesClassName = 'grid',
  transform
}) => {
  const axisRef = useRef<SVGGElement>(null)
  const { contentArea } = useChartCanvas()

  useEffect(() => {
    if (!axisRef.current || !scale) return

    let axisGenerator: any

    switch (orientation) {
      case 'top':
        axisGenerator = d3.axisTop(scale)
        break
      case 'bottom':
        axisGenerator = d3.axisBottom(scale)
        break
      case 'left':
        axisGenerator = d3.axisLeft(scale)
        break
      case 'right':
        axisGenerator = d3.axisRight(scale)
        break
    }

    if (tickCount !== undefined) axisGenerator.ticks(tickCount)
    if (tickSize !== undefined) axisGenerator.tickSize(tickSize)
    if (tickSizeInner !== undefined) axisGenerator.tickSizeInner(tickSizeInner)
    if (tickSizeOuter !== undefined) axisGenerator.tickSizeOuter(tickSizeOuter)
    if (tickPadding !== undefined) axisGenerator.tickPadding(tickPadding)
    if (tickFormat) axisGenerator.tickFormat(tickFormat)
    if (tickValues) axisGenerator.tickValues(tickValues)
    if (ticks) axisGenerator.ticks(...ticks)

    const selection = d3.select(axisRef.current)
    selection.call(axisGenerator as any)

    if (label) {
      const labelElement = selection.select('.axis-label')
      if (labelElement.empty()) {
        let labelX, labelY, labelRotation = 0
        
        switch (orientation) {
          case 'bottom':
            labelX = contentArea.width / 2
            labelY = 35 + labelOffset
            break
          case 'top':
            labelX = contentArea.width / 2
            labelY = -15 - labelOffset
            break
          case 'left':
            labelX = -25 - labelOffset
            labelY = contentArea.height / 2
            labelRotation = -90
            break
          case 'right':
            labelX = 25 + labelOffset
            labelY = contentArea.height / 2
            labelRotation = 90
            break
        }

        selection
          .append('text')
          .attr('class', 'axis-label')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('transform', labelRotation ? `rotate(${labelRotation}, ${labelX}, ${labelY})` : '')
          .text(label)
      }
    }

    if (gridlines) {
      const gridSelection = selection.select('.grid-lines')
      if (gridSelection.empty()) {
        const gridGroup = selection.append('g').attr('class', `grid-lines ${gridlinesClassName}`)
        
        if (orientation === 'bottom' || orientation === 'top') {
          gridGroup
            .selectAll('line')
            .data(scale.ticks ? scale.ticks() : scale.domain())
            .join('line')
            .attr('x1', (d: any) => scale(d))
            .attr('x2', (d: any) => scale(d))
            .attr('y1', 0)
            .attr('y2', orientation === 'bottom' ? -contentArea.height : contentArea.height)
        } else {
          gridGroup
            .selectAll('line')
            .data(scale.ticks ? scale.ticks() : scale.domain())
            .join('line')
            .attr('x1', 0)
            .attr('x2', orientation === 'left' ? contentArea.width : -contentArea.width)
            .attr('y1', (d: any) => scale(d))
            .attr('y2', (d: any) => scale(d))
        }
      }
    }

  }, [
    scale,
    orientation,
    tickCount,
    tickSize,
    tickSizeInner,
    tickSizeOuter,
    tickPadding,
    tickFormat,
    tickValues,
    ticks,
    label,
    labelOffset,
    gridlines,
    gridlinesClassName,
    contentArea
  ])

  return (
    <g
      ref={axisRef}
      className={`axis axis-${orientation} ${className}`}
      transform={transform}
    />
  )
}