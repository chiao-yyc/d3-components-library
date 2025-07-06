import { useEffect, useCallback } from 'react'
import { useLayerManager } from './layer-manager'
import type { ChartLayer } from './layer-manager'

export interface UseChartLayerOptions {
  type: string
  zIndex?: number
  visible?: boolean
  interactive?: boolean
  clipPath?: string
  transform?: string
  className?: string
  data?: any[]
}

export const useChartLayer = (
  component: React.ReactNode,
  options: UseChartLayerOptions
) => {
  const layerManager = useLayerManager()
  
  const {
    type,
    zIndex = 0,
    visible = true,
    interactive = true,
    clipPath,
    transform,
    className,
    data
  } = options

  const addLayer = useCallback(() => {
    return layerManager.addLayer({
      type,
      component,
      zIndex,
      visible,
      interactive,
      clipPath,
      transform,
      className,
      data
    })
  }, [
    layerManager,
    type,
    component,
    zIndex,
    visible,
    interactive,
    clipPath,
    transform,
    className,
    data
  ])

  const updateLayer = useCallback((layerId: string, updates: Partial<ChartLayer>) => {
    layerManager.updateLayer(layerId, updates)
  }, [layerManager])

  const removeLayer = useCallback((layerId: string) => {
    layerManager.removeLayer(layerId)
  }, [layerManager])

  return {
    addLayer,
    updateLayer,
    removeLayer,
    layerManager
  }
}

export interface AutoLayerOptions extends UseChartLayerOptions {
  dependencies?: any[]
}

export const useAutoLayer = (
  component: React.ReactNode,
  options: AutoLayerOptions
) => {
  const { dependencies = [], ...layerOptions } = options
  const { addLayer, removeLayer, updateLayer } = useChartLayer(component, layerOptions)
  
  useEffect(() => {
    const layerId = addLayer()
    
    return () => {
      removeLayer(layerId)
    }
  }, [component, ...dependencies])

  return {
    updateLayer,
    removeLayer
  }
}