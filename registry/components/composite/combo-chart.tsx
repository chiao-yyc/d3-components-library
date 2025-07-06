import React, { useMemo } from 'react'
import * as d3 from 'd3'
import {
  ChartCanvas,
  LayerManager,
  useScaleManager,
  XAxis,
  YAxis,
  DualAxis,
  Bar,
  Line,
  type BarShapeData,
  type LineShapeData
} from '../primitives'

export interface ComboChartData {
  bars: BarShapeData[]
  lines: LineShapeData[]
}

export interface ComboChartProps {
  data: ComboChartData
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  barColor?: string
  lineColor?: string
  
  xKey?: string
  barYKey?: string
  lineYKey?: string
  
  showDualAxis?: boolean
  barAxisLabel?: string
  lineAxisLabel?: string
  xAxisLabel?: string
  
  animate?: boolean
  className?: string
}

export const ComboChart: React.FC<ComboChartProps> = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 50, bottom: 40, left: 50 },
  barColor = '#3b82f6',
  lineColor = '#ef4444',
  xKey = 'x',
  barYKey = 'y',
  lineYKey = 'y',
  showDualAxis = true,
  barAxisLabel = 'Bar Values',
  lineAxisLabel = 'Line Values', 
  xAxisLabel = 'Categories',
  animate = true,
  className = ''
}) => {
  const contentArea = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  }

  const { xDomain, barYDomain, lineYDomain } = useMemo(() => {
    const allXValues = [
      ...data.bars.map(d => d[xKey]),
      ...data.lines.map(d => d[xKey])
    ]
    
    const xDomain = Array.from(new Set(allXValues))
    
    const barYDomain = d3.extent(data.bars, d => d[barYKey]) as [number, number]
    const lineYDomain = d3.extent(data.lines, d => d[lineYKey]) as [number, number]
    
    return { xDomain, barYDomain, lineYDomain }
  }, [data, xKey, barYKey, lineYKey])

  return (
    <div className={`combo-chart ${className}`}>
      <ChartCanvas
        width={width}
        height={height}
        margin={margin}
        className="combo-chart-canvas"
      >
        <LayerManager>
          <ScalesAndAxes
            xDomain={xDomain}
            barYDomain={barYDomain}
            lineYDomain={lineYDomain}
            contentArea={contentArea}
            showDualAxis={showDualAxis}
            barAxisLabel={barAxisLabel}
            lineAxisLabel={lineAxisLabel}
            xAxisLabel={xAxisLabel}
          />
          <ChartLayers
            data={data}
            xKey={xKey}
            barYKey={barYKey}
            lineYKey={lineYKey}
            barColor={barColor}
            lineColor={lineColor}
            animate={animate}
          />
        </LayerManager>
      </ChartCanvas>
    </div>
  )
}

interface ScalesAndAxesProps {
  xDomain: any[]
  barYDomain: [number, number]
  lineYDomain: [number, number]
  contentArea: { width: number; height: number }
  showDualAxis: boolean
  barAxisLabel: string
  lineAxisLabel: string
  xAxisLabel: string
}

const ScalesAndAxes: React.FC<ScalesAndAxesProps> = ({
  xDomain,
  barYDomain,
  lineYDomain,
  contentArea,
  showDualAxis,
  barAxisLabel,
  lineAxisLabel,
  xAxisLabel
}) => {
  const { registerScale } = useScaleManager()

  const xScale = useMemo(() => {
    const scale = d3.scaleBand()
      .domain(xDomain)
      .range([0, contentArea.width])
      .padding(0.1)
    
    registerScale('x', {
      type: 'band',
      domain: xDomain,
      range: [0, contentArea.width],
      padding: 0.1
    }, 'x')
    
    return scale
  }, [xDomain, contentArea.width, registerScale])

  const barYScale = useMemo(() => {
    const scale = d3.scaleLinear()
      .domain(barYDomain)
      .range([contentArea.height, 0])
      .nice()
    
    registerScale('barY', {
      type: 'linear',
      domain: barYDomain,
      range: [contentArea.height, 0],
      nice: true
    }, 'y')
    
    return scale
  }, [barYDomain, contentArea.height, registerScale])

  const lineYScale = useMemo(() => {
    const scale = d3.scaleLinear()
      .domain(lineYDomain)
      .range([contentArea.height, 0])
      .nice()
    
    registerScale('lineY', {
      type: 'linear',
      domain: lineYDomain,
      range: [contentArea.height, 0],
      nice: true
    }, showDualAxis ? 'y2' : 'y')
    
    return scale
  }, [lineYDomain, contentArea.height, showDualAxis, registerScale])

  return (
    <>
      <XAxis
        scale={xScale}
        label={xAxisLabel}
        className="combo-x-axis"
      />
      
      {showDualAxis ? (
        <DualAxis
          leftAxis={{
            scale: barYScale,
            label: barAxisLabel,
            className: "combo-bar-axis"
          }}
          rightAxis={{
            scale: lineYScale,
            label: lineAxisLabel,
            className: "combo-line-axis"
          }}
        />
      ) : (
        <YAxis
          scale={barYScale}
          label={barAxisLabel}
          className="combo-y-axis"
        />
      )}
    </>
  )
}

interface ChartLayersProps {
  data: ComboChartData
  xKey: string
  barYKey: string
  lineYKey: string
  barColor: string
  lineColor: string
  animate: boolean
}

const ChartLayers: React.FC<ChartLayersProps> = ({
  data,
  xKey,
  barYKey,
  lineYKey,
  barColor,
  lineColor,
  animate
}) => {
  const { getScale } = useScaleManager()
  
  const xScale = getScale('x')
  const barYScale = getScale('barY')
  const lineYScale = getScale('lineY')

  if (!xScale || !barYScale || !lineYScale) {
    return null
  }

  return (
    <>
      {/* Bar Layer */}
      <Bar
        data={data.bars}
        xScale={xScale}
        yScale={barYScale}
        color={barColor}
        animate={animate}
        className="combo-bars"
      />
      
      {/* Line Layer */}
      <Line
        data={data.lines}
        xScale={xScale}
        yScale={lineYScale}
        color={lineColor}
        strokeWidth={3}
        showPoints={true}
        pointRadius={4}
        animate={animate}
        className="combo-line"
      />
    </>
  )
}