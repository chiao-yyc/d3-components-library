import * as d3 from 'd3'
import { 
  ColorSchemeConfig, 
  ColorScale, 
  ColorManager, 
  ColorPalette, 
  ColorSchemeType,
  ColorFormat 
} from './types'
import { getPalette, getColorsFromPalette } from './color-palettes'

// 重新導出類型
export type { ColorScale, ColorSchemeConfig, ColorSchemeType, ColorFormat, ColorManager, ColorPalette }

// D3 色彩比例尺實現
class D3ColorScale implements ColorScale {
  private scale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string> | any
  private _domain: unknown[]
  private _range: string[]
  private config: ColorSchemeConfig

  constructor(config: ColorSchemeConfig) {
    this.config = config
    this._domain = []
    this._range = []
    this.scale = d3.scaleOrdinal<string, string>()
    this.createScale()
  }

  private createScale() {
    const { type, colors, count = 10, interpolate = false, reverse = false } = this.config
    
    // 獲取顏色數組
    let colorArray = colors || getColorsFromPalette(type, count)
    
    if (reverse) {
      colorArray = [...colorArray].reverse()
    }

    this._range = colorArray

    if (interpolate) {
      // 創建插值比例尺
      if (colorArray.length === 1) {
        this.scale = d3.scaleOrdinal<string, string>().range(colorArray) as any
      } else if (colorArray.length === 2) {
        const linearScale = d3.scaleLinear<string, string>()
          .domain([0, 1])
          .range(colorArray)
        this.scale = linearScale as any
      } else {
        const indices = colorArray.map((_, i) => i)
        const linearScale = d3.scaleLinear<string, string>()
          .domain(indices)
          .range(colorArray)
        this.scale = linearScale as any
      }
    } else {
      // 創建序數比例尺
      this.scale = d3.scaleOrdinal<string, string>().range(colorArray) as any
    }
  }

  getColor(value: number | string, index?: number): string {
    if (this.config.interpolate && typeof value === 'number') {
      return this.scale(value)
    }

    if (typeof value === 'string' || index !== undefined) {
      const idx = index !== undefined ? index : 0
      return this.scale(String(idx % this._range.length))
    }

    return this.scale(String(value))
  }

  getColors(count?: number): string[] {
    const numColors = count || this._range.length
    
    if (this.config.interpolate && numColors > this._range.length) {
      // 生成插值顏色
      return Array.from({ length: numColors }, (_, i) => {
        const t = i / (numColors - 1)
        return this.interpolate(t)
      })
    }
    
    return getColorsFromPalette(this.config.type, numColors)
  }

  domain(): any[] {
    return this._domain
  }

  range(): string[] {
    return this._range
  }

  setDomain(domain: any[]): ColorScale {
    this._domain = domain
    this.scale.domain(domain)
    return this
  }

  setRange(range: string[]): ColorScale {
    this._range = range
    this.scale.range(range)
    return this
  }

  interpolate(t: number): string {
    if (!this.config.interpolate) {
      const index = Math.floor(t * this._range.length)
      return this._range[Math.min(index, this._range.length - 1)]
    }

    const normalizedT = Math.max(0, Math.min(1, t))
    return this.scale(String(normalizedT))
  }

  copy(): ColorScale {
    return new D3ColorScale(this.config)
  }
}

// 色彩管理器實現
export class ChartColorManager implements ColorManager {
  private static instance: ChartColorManager

  static getInstance(): ChartColorManager {
    if (!ChartColorManager.instance) {
      ChartColorManager.instance = new ChartColorManager()
    }
    return ChartColorManager.instance
  }

  createScale(config: ColorSchemeConfig): ColorScale {
    return new D3ColorScale(config)
  }

  getPalette(name: ColorSchemeType): ColorPalette | null {
    return getPalette(name)
  }

  getColor(scheme: ColorSchemeType, index: number): string {
    const colors = this.getColors(scheme, index + 1)
    return colors[index] || colors[0]
  }

  getColors(scheme: ColorSchemeType, count: number): string[] {
    return getColorsFromPalette(scheme, count)
  }

  interpolateColors(color1: string, color2: string, steps: number): string[] {
    const interpolator = d3.interpolateRgb(color1, color2)
    return Array.from({ length: steps }, (_, i) => {
      return interpolator(i / (steps - 1))
    })
  }

  adjustBrightness(color: string, factor: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const adjust = (value: number) => {
      const adjusted = Math.round(value * factor)
      return Math.max(0, Math.min(255, adjusted))
    }

    return this.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    )
  }

  getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor)
    if (!rgb) return '#000000'

    // 計算亮度 (使用 YIQ 公式)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    
    // 如果背景較亮，返回深色文字；如果背景較暗，返回淺色文字
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  rgbToHex(r: number, g: number, b: number): string {
    const componentToHex = (c: number) => {
      const hex = Math.round(c).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  }

  // 轉換色彩格式
  convertColor(color: string, format: ColorFormat): string {
    switch (format) {
      case 'hex':
        return color.startsWith('#') ? color : this.rgbToColor(color, 'hex')
      case 'rgb':
        return this.hexToColor(color, 'rgb')
      case 'hsl':
        return this.hexToColor(color, 'hsl')
      case 'css':
        return color
      default:
        return color
    }
  }

  private hexToColor(hex: string, format: 'rgb' | 'hsl'): string {
    const rgb = this.hexToRgb(hex)
    if (!rgb) return hex

    if (format === 'rgb') {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }
    
    if (format === 'hsl') {
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    }

    return hex
  }

  private rgbToColor(rgb: string, format: 'hex'): string {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return rgb

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    if (format === 'hex') {
      return this.rgbToHex(r, g, b)
    }

    return rgb
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }
}

// 導出單例實例
export const colorManager = ChartColorManager.getInstance()

// 便利函數
export function createColorScale(
  configOrType: ColorSchemeConfig | ColorSchemeType | string[], 
  domain?: [number, number]
): ColorScale {
  if (Array.isArray(configOrType)) {
    // 如果是顏色數組
    return colorManager.createScale({
      type: 'custom',
      colors: configOrType,
      domain,
      interpolate: true
    })
  } else if (typeof configOrType === 'string') {
    // 如果是顏色主題字符串
    return colorManager.createScale({
      type: configOrType as ColorSchemeType,
      domain,
      interpolate: true
    })
  } else {
    // 如果是完整配置對象
    return colorManager.createScale(configOrType)
  }
}

export function getChartColors(scheme: ColorSchemeType, count: number = 10): string[] {
  return colorManager.getColors(scheme, count)
}

export function getChartColor(scheme: ColorSchemeType, index: number): string {
  return colorManager.getColor(scheme, index)
}