export type ScaleType = 'linear' | 'band' | 'time' | 'ordinal' | 'log' | 'sqrt' | 'pow'

export interface ScaleConfig {
  type: ScaleType
  domain?: any[]
  range?: any[]
  padding?: number
  paddingInner?: number
  paddingOuter?: number
  nice?: boolean
  clamp?: boolean
}

export interface ScaleRegistration {
  name: string
  scale: any
  config: ScaleConfig
  axis?: 'x' | 'y' | 'y2'
}

export interface UseScaleManagerOptions {
  autoCoordinate?: boolean
}