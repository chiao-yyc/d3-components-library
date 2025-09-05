export interface ChartLayer {
  id: string
  type: string
  zIndex: number
  visible: boolean
  interactive: boolean
  clipPath?: string
  transform?: string
  className?: string
  data?: unknown[]
  component: React.ReactNode
}

export interface LayerManagerContextValue {
  layers: ChartLayer[]
  addLayer: (layer: Omit<ChartLayer, 'id'>) => string
  removeLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<ChartLayer>) => void
  getLayer: (layerId: string) => ChartLayer | undefined
  setLayerVisibility: (layerId: string, visible: boolean) => void
  setLayerZIndex: (layerId: string, zIndex: number) => void
  getLayersByType: (type: string) => ChartLayer[]
  sortedLayers: ChartLayer[]
}

export interface LayerManagerProps {
  children: React.ReactNode
}

export interface UseChartLayerOptions {
  type: string
  zIndex?: number
  visible?: boolean
  interactive?: boolean
  clipPath?: string
  transform?: string
  className?: string
  data?: unknown[]
}

export interface AutoLayerOptions extends UseChartLayerOptions {
  dependencies?: any[]
}