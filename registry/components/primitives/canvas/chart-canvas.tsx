import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ChartCanvasContextValue {
  svgRef: React.RefObject<SVGSVGElement>
  dimensions: ChartDimensions
  contentArea: {
    width: number
    height: number
  }
  scales: Map<string, d3.ScaleLinear<number, number> | d3.ScaleBand<string> | d3.ScaleTime<number, number>>
  registerScale: (name: string, scale: any) => void
  getScale: (name: string) => any
}

const ChartCanvasContext = createContext<ChartCanvasContextValue | null>(null)

export const useChartCanvas = () => {
  const context = useContext(ChartCanvasContext)
  if (!context) {
    throw new Error('useChartCanvas must be used within a ChartCanvas')
  }
  return context
}

export interface ChartCanvasProps {
  width?: number
  height?: number
  margin?: Partial<ChartDimensions['margin']>
  children: React.ReactNode
  className?: string
  preserveAspectRatio?: string
  viewBox?: string
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  width = 800,
  height = 400,
  margin = {},
  children,
  className = '',
  preserveAspectRatio = 'xMidYMid meet',
  viewBox
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [scales] = useState(new Map())
  
  const defaultMargin = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 40,
    ...margin
  }

  const dimensions: ChartDimensions = {
    width,
    height,
    margin: defaultMargin
  }

  const contentArea = {
    width: width - defaultMargin.left - defaultMargin.right,
    height: height - defaultMargin.top - defaultMargin.bottom
  }

  const registerScale = (name: string, scale: any) => {
    scales.set(name, scale)
  }

  const getScale = (name: string) => {
    return scales.get(name)
  }

  const contextValue: ChartCanvasContextValue = {
    svgRef,
    dimensions,
    contentArea,
    scales,
    registerScale,
    getScale
  }

  const finalViewBox = viewBox || `0 0 ${width} ${height}`

  return (
    <ChartCanvasContext.Provider value={contextValue}>
      <div className={`chart-canvas-container ${className}`}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={finalViewBox}
          preserveAspectRatio={preserveAspectRatio}
          className="chart-canvas-svg"
        >
          <defs>
            <clipPath id={`chart-clip-${Math.random().toString(36).substr(2, 9)}`}>
              <rect
                x={defaultMargin.left}
                y={defaultMargin.top}
                width={contentArea.width}
                height={contentArea.height}
              />
            </clipPath>
          </defs>
          
          <g
            className="chart-content"
            transform={`translate(${defaultMargin.left}, ${defaultMargin.top})`}
          >
            {children}
          </g>
        </svg>
      </div>
    </ChartCanvasContext.Provider>
  )
}