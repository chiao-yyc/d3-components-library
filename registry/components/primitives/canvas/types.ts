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
  scales: Map<string, any>
  registerScale: (name: string, scale: any) => void
  getScale: (name: string) => any
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