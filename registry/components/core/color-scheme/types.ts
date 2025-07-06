export type ColorSchemeType = 
  | 'custom'
  | 'blues' 
  | 'greens' 
  | 'oranges' 
  | 'reds' 
  | 'purples'
  | 'greys'
  | 'rainbow'
  | 'viridis'
  | 'plasma'
  | 'inferno'
  | 'magma'
  | 'cividis'
  | 'turbo'

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'css'

export interface ColorSchemeConfig {
  // 基本配置
  type: ColorSchemeType
  colors?: string[]
  
  // 數量配置
  count?: number
  
  // 漸變配置
  interpolate?: boolean
  reverse?: boolean
  
  // 範圍配置
  domain?: [number, number]
  range?: [number, number]
  
  // 格式配置
  format?: ColorFormat
  
  // 透明度
  opacity?: number
  
  // 動態配置
  adaptive?: boolean
  contrastThreshold?: number
}

export interface ColorScale {
  // 獲取顏色
  getColor(value: number | string, index?: number): string
  
  // 獲取顏色數組
  getColors(count?: number): string[]
  
  // 獲取範圍
  domain(): any[]
  range(): string[]
  
  // 配置
  setDomain(domain: any[]): ColorScale
  setRange(range: string[]): ColorScale
  
  // 插值
  interpolate(t: number): string
  
  // 工具方法
  copy(): ColorScale
  invert?(color: string): any
}

export interface ColorPalette {
  name: string
  colors: string[]
  type: 'sequential' | 'diverging' | 'categorical' | 'qualitative'
  description?: string
  source?: string
}

export interface ColorManager {
  // 創建色彩比例尺
  createScale(config: ColorSchemeConfig): ColorScale
  
  // 獲取調色板
  getPalette(name: ColorSchemeType): ColorPalette | null
  
  // 獲取顏色
  getColor(scheme: ColorSchemeType, index: number): string
  getColors(scheme: ColorSchemeType, count: number): string[]
  
  // 工具方法
  interpolateColors(color1: string, color2: string, steps: number): string[]
  adjustBrightness(color: string, factor: number): string
  getContrastColor(backgroundColor: string): string
  hexToRgb(hex: string): { r: number; g: number; b: number } | null
  rgbToHex(r: number, g: number, b: number): string
}