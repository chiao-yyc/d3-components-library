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

export interface ContentArea {
  width: number
  height: number
}

export interface ChartCanvasContextValue {
  svgRef: React.RefObject<SVGSVGElement>
  dimensions: ChartDimensions
  contentArea: ContentArea
  scales: Map<string, unknown>
  registerScale: (name: string, scale: unknown) => void
  getScale: (name: string) => unknown
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