import React, { createContext, useContext, useCallback, useState, useRef } from 'react'
import { ChartType, getChartZIndex, getChartLayerOrder } from './chart-layer-constants'

export interface ChartLayer {
  id: string
  type: string
  chartType?: ChartType
  zIndex: number
  visible: boolean
  interactive: boolean
  clipPath?: string
  transform?: string
  className?: string
  data?: any[]
  component: React.ReactNode
}

export interface LayerManagerContextValue {
  layers: ChartLayer[]
  addLayer: (layer: Omit<ChartLayer, 'id'>) => string
  addChartLayer: (layer: Omit<ChartLayer, 'id' | 'zIndex'> & { chartType: ChartType }) => string
  removeLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<ChartLayer>) => void
  getLayer: (layerId: string) => ChartLayer | undefined
  setLayerVisibility: (layerId: string, visible: boolean) => void
  setLayerZIndex: (layerId: string, zIndex: number) => void
  getLayersByType: (type: string) => ChartLayer[]
  getLayersByChartType: (chartType: ChartType) => ChartLayer[]
  sortedLayers: ChartLayer[]
}

const LayerManagerContext = createContext<LayerManagerContextValue | null>(null)

export const useLayerManager = () => {
  const context = useContext(LayerManagerContext)
  if (!context) {
    throw new Error('useLayerManager must be used within a LayerManager')
  }
  return context
}

export interface LayerManagerProps {
  children: React.ReactNode
}

export const LayerManager: React.FC<LayerManagerProps> = ({ children }) => {
  const [layers, setLayers] = useState<ChartLayer[]>([])
  const layerIdCounter = useRef(0)

  const addLayer = useCallback((layerData: Omit<ChartLayer, 'id'>): string => {
    const id = `layer-${++layerIdCounter.current}`
    const layer: ChartLayer = {
      ...layerData,
      id
    }
    
    setLayers(prev => [...prev, layer])
    return id
  }, [])

  const addChartLayer = useCallback((layerData: Omit<ChartLayer, 'id' | 'zIndex'> & { chartType: ChartType }): string => {
    const id = `chart-layer-${++layerIdCounter.current}`
    const defaultZIndex = getChartZIndex(layerData.chartType)
    const layer: ChartLayer = {
      ...layerData,
      id,
      zIndex: defaultZIndex
    }
    
    setLayers(prev => [...prev, layer])
    return id
  }, [])

  const removeLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId))
  }, [])

  const updateLayer = useCallback((layerId: string, updates: Partial<ChartLayer>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ))
  }, [])

  const getLayer = useCallback((layerId: string) => {
    return layers.find(layer => layer.id === layerId)
  }, [layers])

  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    updateLayer(layerId, { visible })
  }, [updateLayer])

  const setLayerZIndex = useCallback((layerId: string, zIndex: number) => {
    updateLayer(layerId, { zIndex })
  }, [updateLayer])

  const getLayersByType = useCallback((type: string) => {
    return layers.filter(layer => layer.type === type)
  }, [layers])

  const getLayersByChartType = useCallback((chartType: ChartType) => {
    return layers.filter(layer => layer.chartType === chartType)
  }, [layers])

  const sortedLayers = React.useMemo(() => {
    return [...layers]
      .filter(layer => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [layers])

  const contextValue: LayerManagerContextValue = {
    layers,
    addLayer,
    addChartLayer,
    removeLayer,
    updateLayer,
    getLayer,
    setLayerVisibility,
    setLayerZIndex,
    getLayersByType,
    getLayersByChartType,
    sortedLayers
  }

  return (
    <LayerManagerContext.Provider value={contextValue}>
      {children}
      {sortedLayers.map(layer => (
        <g
          key={layer.id}
          className={`chart-layer chart-layer-${layer.type} ${layer.className || ''}`}
          transform={layer.transform}
          clipPath={layer.clipPath ? `url(#${layer.clipPath})` : undefined}
          style={{
            pointerEvents: layer.interactive ? 'all' : 'none'
          }}
        >
          {layer.component}
        </g>
      ))}
    </LayerManagerContext.Provider>
  )
}