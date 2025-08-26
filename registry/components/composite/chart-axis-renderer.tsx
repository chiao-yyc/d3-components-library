import React from 'react'
import { XAxis, YAxis, DualAxis } from '../primitives'

// 軸線配置接口
export interface AxisConfig {
  label?: string
  domain?: [number, number]
  tickCount?: number
  tickFormat?: (value: any) => string
  gridlines?: boolean
}

// 軸線渲染器屬性
export interface ChartAxisRendererProps {
  xScale: any
  leftYScale: any
  rightYScale: any
  leftAxis?: AxisConfig
  rightAxis?: AxisConfig
  xAxis?: AxisConfig
  hasLeftSeries: boolean
  hasRightSeries: boolean
}

/**
 * 統一的軸線渲染器組件
 */
export const ChartAxisRenderer: React.FC<ChartAxisRendererProps> = ({
  xScale, 
  leftYScale, 
  rightYScale, 
  leftAxis = {}, 
  rightAxis = {}, 
  xAxis = {}, 
  hasLeftSeries, 
  hasRightSeries
}) => {
  console.log('🎯 ChartAxisRenderer rendering with scales:', {
    xScale: !!xScale,
    leftYScale: !!leftYScale,
    rightYScale: !!rightYScale
  })
  return (
    <>
      {/* X 軸 */}
      {xScale && (
        <XAxis
          scale={xScale}
          label={xAxis.label}
          tickFormat={xAxis.tickFormat}
          gridlines={xAxis.gridlines}
          className="combo-chart-x-axis"
        />
      )}
      
      {/* Y 軸 */}
      {hasLeftSeries && hasRightSeries && leftYScale && rightYScale ? (
        <DualAxis
          leftAxis={{
            scale: leftYScale,
            label: leftAxis.label,
            tickCount: leftAxis.tickCount,
            tickFormat: leftAxis.tickFormat,
            gridlines: leftAxis.gridlines,
            className: "combo-chart-left-axis"
          }}
          rightAxis={{
            scale: rightYScale,
            label: rightAxis.label,
            tickCount: rightAxis.tickCount,
            tickFormat: rightAxis.tickFormat,
            gridlines: rightAxis.gridlines,
            className: "combo-chart-right-axis"
          }}
        />
      ) : hasLeftSeries && leftYScale ? (
        <YAxis
          scale={leftYScale}
          label={leftAxis.label}
          tickCount={leftAxis.tickCount}
          tickFormat={leftAxis.tickFormat}
          gridlines={leftAxis.gridlines}
          className="combo-chart-left-axis"
        />
      ) : hasRightSeries && rightYScale ? (
        <YAxis
          position="right"
          scale={rightYScale}
          label={rightAxis.label}
          tickCount={rightAxis.tickCount}
          tickFormat={rightAxis.tickFormat}
          gridlines={rightAxis.gridlines}
          className="combo-chart-right-axis"
        />
      ) : null}
    </>
  )
}