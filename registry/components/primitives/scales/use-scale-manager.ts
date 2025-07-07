import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ScaleManager, ScaleConfig, ScaleType } from './scale-manager'
import { useChartCanvas } from '../canvas'

export interface UseScaleManagerOptions {
  autoCoordinate?: boolean
}

export const useScaleManager = (options: UseScaleManagerOptions = {}) => {
  const { contentArea } = useChartCanvas()
  const { autoCoordinate = true } = options
  
  const scaleManagerRef = useRef<ScaleManager>()
  
  const scaleManager = useMemo(() => {
    if (!scaleManagerRef.current) {
      scaleManagerRef.current = new ScaleManager(contentArea)
    }
    return scaleManagerRef.current
  }, [contentArea])

  useEffect(() => {
    if (autoCoordinate) {
      scaleManager.coordinateScales()
    }
  }, [scaleManager, autoCoordinate, contentArea])

  const registerScale = useCallback((
    name: string, 
    config: ScaleConfig, 
    axis?: 'x' | 'y' | 'y2'
  ) => {
    return scaleManager.registerScale(name, config, axis)
  }, [scaleManager])

  const registerExistingScale = useCallback((
    name: string,
    scale: any,
    config: ScaleConfig,
    axis?: 'x' | 'y' | 'y2'
  ) => {
    return scaleManager.registerExistingScale(name, scale, config, axis)
  }, [scaleManager])

  const autoConfigureScale = useCallback((
    name: string,
    data: any[],
    accessor: (d: any) => any,
    type: ScaleType,
    axis: 'x' | 'y' | 'y2'
  ) => {
    return scaleManager.autoConfigureScale(name, data, accessor, type, axis)
  }, [scaleManager])

  const getScale = useCallback((name: string) => {
    return scaleManager.getScale(name)
  }, [scaleManager])

  const updateDomain = useCallback((name: string, domain: any[]) => {
    scaleManager.updateDomain(name, domain)
  }, [scaleManager])

  const updateRange = useCallback((name: string, range: any[]) => {
    scaleManager.updateRange(name, range)
  }, [scaleManager])

  const getScalesByAxis = useCallback((axis: 'x' | 'y' | 'y2') => {
    return scaleManager.getScalesByAxis(axis)
  }, [scaleManager])

  const coordinateScales = useCallback(() => {
    scaleManager.coordinateScales()
  }, [scaleManager])

  return {
    registerScale,
    registerExistingScale,
    autoConfigureScale,
    getScale,
    updateDomain,
    updateRange,
    getScalesByAxis,
    coordinateScales,
    scaleManager
  }
}