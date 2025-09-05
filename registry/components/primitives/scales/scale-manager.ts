import { 
  scaleLinear, 
  scaleBand, 
  scaleTime, 
  scaleOrdinal, 
  scaleLog, 
  scaleSqrt, 
  scalePow,
  extent
} from '../../core/d3-utils'

export type ScaleType = 'linear' | 'band' | 'time' | 'ordinal' | 'log' | 'sqrt' | 'pow'

export interface ScaleConfig {
  type: ScaleType
  domain?: unknown[]
  range?: unknown[]
  padding?: number
  paddingInner?: number
  paddingOuter?: number
  nice?: boolean
  clamp?: boolean
}

export interface ScaleRegistration {
  name: string
  scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string> | d3.ScaleOrdinal<string, unknown> | d3.ScaleLogarithmic<number, number> | d3.ScalePower<number, number>
  config: ScaleConfig
  axis?: 'x' | 'y' | 'y2'
}

export class ScaleManager {
  private scales: Map<string, ScaleRegistration> = new Map()
  private contentArea: { width: number; height: number }
  
  constructor(contentArea: { width: number; height: number }) {
    this.contentArea = contentArea
  }

  registerScale(name: string, config: ScaleConfig, axis?: 'x' | 'y' | 'y2'): any {
    const scale = this.createScale(config)
    
    const registration: ScaleRegistration = {
      name,
      scale,
      config,
      axis
    }
    
    this.scales.set(name, registration)
    return scale
  }

  // 直接註冊已存在的比例尺實例
  registerExistingScale(name: string, scale: any, config: ScaleConfig, axis?: 'x' | 'y' | 'y2'): any {
    const registration: ScaleRegistration = {
      name,
      scale,
      config,
      axis
    }
    
    this.scales.set(name, registration)
    return scale
  }

  getScale(name: string): any {
    const registration = this.scales.get(name)
    return registration?.scale
  }

  updateDomain(name: string, domain: any[]): void {
    const registration = this.scales.get(name)
    if (registration) {
      registration.scale.domain(domain)
      registration.config.domain = domain
    }
  }

  updateRange(name: string, range: any[]): void {
    const registration = this.scales.get(name)
    if (registration) {
      registration.scale.range(range)
      registration.config.range = range
    }
  }

  getScalesByAxis(axis: 'x' | 'y' | 'y2'): ScaleRegistration[] {
    return Array.from(this.scales.values()).filter(reg => reg.axis === axis)
  }

  private createScale(config: ScaleConfig): any {
    let scale: any

    switch (config.type) {
      case 'linear':
        scale = scaleLinear()
        break
      case 'band':
        scale = scaleBand()
        if (config.padding !== undefined) scale.padding(config.padding)
        if (config.paddingInner !== undefined) scale.paddingInner(config.paddingInner)
        if (config.paddingOuter !== undefined) scale.paddingOuter(config.paddingOuter)
        break
      case 'time':
        scale = scaleTime()
        break
      case 'ordinal':
        scale = scaleOrdinal()
        break
      case 'log':
        scale = scaleLog()
        break
      case 'sqrt':
        scale = scaleSqrt()
        break
      case 'pow':
        scale = scalePow()
        break
      default:
        throw new Error(`Unsupported scale type: ${config.type}`)
    }

    if (config.domain) scale.domain(config.domain)
    if (config.range) scale.range(config.range)
    if (config.nice && 'nice' in scale) scale.nice()
    if (config.clamp && 'clamp' in scale) scale.clamp(config.clamp)

    return scale
  }

  autoConfigureScale(
    name: string, 
    data: any[], 
    accessor: (d: any) => any, 
    type: ScaleType,
    axis: 'x' | 'y' | 'y2'
  ): any {
    const values = data.map(accessor).filter(v => v != null)
    let domain: any[]
    let range: any[]

    if (type === 'band' || type === 'ordinal') {
      domain = Array.from(new Set(values))
    } else if (type === 'time') {
      domain = extent(values) as [Date, Date]
    } else {
      domain = extent(values) as [number, number]
    }

    if (axis === 'x') {
      range = [0, this.contentArea.width]
    } else {
      range = [this.contentArea.height, 0]
    }

    const config: ScaleConfig = {
      type,
      domain,
      range,
      nice: type === 'linear' || type === 'time',
      padding: type === 'band' ? 0.1 : undefined
    }

    return this.registerScale(name, config, axis)
  }

  coordinateScales(): void {
    const xScales = this.getScalesByAxis('x')
    const yScales = this.getScalesByAxis('y')
    const y2Scales = this.getScalesByAxis('y2')

    xScales.forEach(reg => {
      reg.scale.range([0, this.contentArea.width])
    })

    yScales.forEach(reg => {
      reg.scale.range([this.contentArea.height, 0])
    })

    y2Scales.forEach(reg => {
      reg.scale.range([this.contentArea.height, 0])
    })
  }

  getAllScales(): Map<string, ScaleRegistration> {
    return new Map(this.scales)
  }

  clear(): void {
    this.scales.clear()
  }
}