import * as d3 from 'd3'

export interface ColorScheme {
  name: string
  colors: string[]
  type: 'categorical' | 'sequential' | 'diverging'
  description?: string
}

export const PREDEFINED_COLOR_SCHEMES: Record<string, ColorScheme> = {
  // D3 categorical schemes
  category10: {
    name: 'Category10',
    colors: d3.schemeCategory10,
    type: 'categorical',
    description: 'D3 default 10-color categorical scheme'
  },
  
  // Custom schemes for data visualization
  iris: {
    name: 'Iris',
    colors: ['#440154ff', '#21908dff', '#fde725ff'],
    type: 'categorical',
    description: 'Colors optimized for iris species data'
  },
  
  // Professional business colors
  business: {
    name: 'Business',
    colors: ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'],
    type: 'categorical',
    description: 'Professional business presentation colors'
  },
  
  // Accessibility-friendly colors
  accessible: {
    name: 'Accessible',
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'],
    type: 'categorical',
    description: 'Colorblind-friendly categorical colors'
  },
  
  // Pastel colors
  pastel: {
    name: 'Pastel',
    colors: ['#a8e6cf', '#dcedc8', '#ffd3a5', '#ffc3a0', '#d4a5cd', '#b39ddb', '#90caf9', '#81c784'],
    type: 'categorical',
    description: 'Soft pastel colors for subtle visualizations'
  },
  
  // High contrast colors
  contrast: {
    name: 'High Contrast',
    colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    type: 'categorical',
    description: 'High contrast colors for accessibility'
  },
  
  // Viridis-inspired categorical
  viridis: {
    name: 'Viridis',
    colors: ['#440154', '#31688e', '#35b779', '#fde725'],
    type: 'categorical',
    description: 'Viridis-inspired categorical colors'
  },
  
  // Warm colors
  warm: {
    name: 'Warm',
    colors: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4'],
    type: 'categorical',
    description: 'Warm color palette'
  },
  
  // Cool colors
  cool: {
    name: 'Cool',
    colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090'],
    type: 'categorical',
    description: 'Cool color palette'
  }
}

export interface ColorMappingConfig {
  scheme?: string | string[]
  fallbackColors?: string[]
  autoGenerate?: boolean
  maxColors?: number
  blendMode?: 'none' | 'interpolate' | 'lighten' | 'darken'
}

export class CategoricalColorManager {
  private config: ColorMappingConfig
  private colorMappings: Map<string, string> = new Map()
  private usedColors: Set<string> = new Set()

  constructor(config: ColorMappingConfig = {}) {
    this.config = {
      fallbackColors: PREDEFINED_COLOR_SCHEMES.category10.colors,
      autoGenerate: true,
      maxColors: 20,
      blendMode: 'none',
      ...config
    }
  }

  /**
   * Create a color scale for categorical data
   */
  createColorScale(categories: string[]): d3.ScaleOrdinal<string, string> {
    const colors = this.getColorsForCategories(categories)
    
    const scale = d3.scaleOrdinal<string, string>()
      .domain(categories)
      .range(colors)

    // Store mappings for consistency
    categories.forEach((category, index) => {
      this.colorMappings.set(category, colors[index])
      this.usedColors.add(colors[index])
    })

    return scale
  }

  /**
   * Get colors for a list of categories
   */
  private getColorsForCategories(categories: string[]): string[] {
    const colors = this.resolveColorScheme()
    
    if (categories.length <= colors.length) {
      return colors.slice(0, categories.length)
    }

    // Generate additional colors if needed
    if (this.config.autoGenerate) {
      return this.generateExtendedColors(colors, categories.length)
    }

    // Repeat colors if not auto-generating
    const repeatedColors: string[] = []
    for (let i = 0; i < categories.length; i++) {
      repeatedColors.push(colors[i % colors.length])
    }
    return repeatedColors
  }

  /**
   * Resolve color scheme from config
   */
  private resolveColorScheme(): string[] {
    const { scheme, fallbackColors } = this.config

    if (Array.isArray(scheme)) {
      return scheme
    }

    if (typeof scheme === 'string') {
      const predefinedScheme = PREDEFINED_COLOR_SCHEMES[scheme]
      if (predefinedScheme) {
        return predefinedScheme.colors
      }
    }

    return fallbackColors || PREDEFINED_COLOR_SCHEMES.category10.colors
  }

  /**
   * Generate additional colors when needed
   */
  private generateExtendedColors(baseColors: string[], targetCount: number): string[] {
    const colors = [...baseColors]
    
    while (colors.length < targetCount && colors.length < (this.config.maxColors || 20)) {
      const baseColor = baseColors[colors.length % baseColors.length]
      
      switch (this.config.blendMode) {
        case 'lighten':
          colors.push(this.lightenColor(baseColor, 0.2))
          break
        case 'darken':
          colors.push(this.darkenColor(baseColor, 0.2))
          break
        case 'interpolate':
          const nextBaseColor = baseColors[(colors.length + 1) % baseColors.length]
          colors.push(this.interpolateColors(baseColor, nextBaseColor, 0.5))
          break
        default:
          // Generate a slight variation
          colors.push(this.varyColor(baseColor))
          break
      }
    }

    return colors.slice(0, targetCount)
  }

  /**
   * Lighten a color by a factor
   */
  private lightenColor(color: string, factor: number): string {
    const d3Color = d3.color(color)
    if (d3Color) {
      return d3Color.brighter(factor).toString()
    }
    return color
  }

  /**
   * Darken a color by a factor
   */
  private darkenColor(color: string, factor: number): string {
    const d3Color = d3.color(color)
    if (d3Color) {
      return d3Color.darker(factor).toString()
    }
    return color
  }

  /**
   * Interpolate between two colors
   */
  private interpolateColors(color1: string, color2: string, t: number): string {
    const interpolator = d3.interpolate(color1, color2)
    return interpolator(t)
  }

  /**
   * Create a slight variation of a color
   */
  private varyColor(color: string): string {
    const d3Color = d3.color(color)
    if (d3Color && 'h' in d3Color && 's' in d3Color && 'l' in d3Color) {
      const hslColor = d3Color as d3.HSLColor
      const newH = (hslColor.h + 30) % 360
      return d3.hsl(newH, hslColor.s, hslColor.l).toString()
    }
    return color
  }

  /**
   * Get color for a specific category
   */
  getColorForCategory(category: string): string | null {
    return this.colorMappings.get(category) || null
  }

  /**
   * Add or update color mapping for a category
   */
  setColorForCategory(category: string, color: string): void {
    this.colorMappings.set(category, color)
    this.usedColors.add(color)
  }

  /**
   * Remove color mapping for a category
   */
  removeCategory(category: string): void {
    const color = this.colorMappings.get(category)
    if (color) {
      this.colorMappings.delete(category)
      this.usedColors.delete(color)
    }
  }

  /**
   * Get all current mappings
   */
  getAllMappings(): Map<string, string> {
    return new Map(this.colorMappings)
  }

  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.colorMappings.clear()
    this.usedColors.clear()
  }

  /**
   * Get available predefined schemes
   */
  static getAvailableSchemes(): ColorScheme[] {
    return Object.values(PREDEFINED_COLOR_SCHEMES)
  }

  /**
   * Get colors from a predefined scheme
   */
  static getSchemeColors(schemeName: string): string[] | null {
    const scheme = PREDEFINED_COLOR_SCHEMES[schemeName]
    return scheme ? scheme.colors : null
  }
}

/**
 * Utility functions for color analysis and manipulation
 */
export const colorUtils = {
  /**
   * Check if a color has good contrast for text
   */
  hasGoodContrast: (backgroundColor: string, textColor: string = '#000000'): boolean => {
    const bgColor = d3.color(backgroundColor)
    const txtColor = d3.color(textColor)
    
    if (!bgColor || !txtColor) return false
    
    // Simple contrast check using luminance
    const bgLuminance = 0.299 * bgColor.rgb().r + 0.587 * bgColor.rgb().g + 0.114 * bgColor.rgb().b
    const txtLuminance = 0.299 * txtColor.rgb().r + 0.587 * txtColor.rgb().g + 0.114 * txtColor.rgb().b
    
    const contrast = Math.abs(bgLuminance - txtLuminance) / 255
    return contrast > 0.5
  },

  /**
   * Generate complementary color
   */
  getComplementaryColor: (color: string): string => {
    const d3Color = d3.color(color)
    if (d3Color && 'h' in d3Color && 's' in d3Color && 'l' in d3Color) {
      const hslColor = d3Color as d3.HSLColor
      const complementaryH = (hslColor.h + 180) % 360
      return d3.hsl(complementaryH, hslColor.s, hslColor.l).toString()
    }
    return color
  },

  /**
   * Check if color is light or dark
   */
  isLightColor: (color: string): boolean => {
    const d3Color = d3.color(color)
    if (!d3Color) return false
    
    const { r, g, b } = d3Color.rgb()
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    return luminance > 127.5
  },

  /**
   * Get optimal text color for a background
   */
  getOptimalTextColor: (backgroundColor: string): string => {
    return colorUtils.isLightColor(backgroundColor) ? '#000000' : '#ffffff'
  },

  /**
   * Convert hex to rgba with alpha
   */
  hexToRgba: (hex: string, alpha: number): string => {
    const d3Color = d3.color(hex)
    if (!d3Color) return hex
    
    const { r, g, b } = d3Color.rgb()
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

/**
 * Factory function to create a color manager with common configurations
 */
export function createColorManager(
  type: 'business' | 'accessible' | 'pastel' | 'viridis' | 'custom',
  customColors?: string[]
): CategoricalColorManager {
  switch (type) {
    case 'business':
      return new CategoricalColorManager({
        scheme: 'business',
        autoGenerate: true,
        blendMode: 'lighten'
      })
    
    case 'accessible':
      return new CategoricalColorManager({
        scheme: 'accessible',
        autoGenerate: true,
        blendMode: 'none'
      })
    
    case 'pastel':
      return new CategoricalColorManager({
        scheme: 'pastel',
        autoGenerate: true,
        blendMode: 'lighten'
      })
    
    case 'viridis':
      return new CategoricalColorManager({
        scheme: 'viridis',
        autoGenerate: true,
        blendMode: 'interpolate'
      })
    
    case 'custom':
      return new CategoricalColorManager({
        scheme: customColors,
        autoGenerate: true,
        blendMode: 'interpolate'
      })
    
    default:
      return new CategoricalColorManager()
  }
}