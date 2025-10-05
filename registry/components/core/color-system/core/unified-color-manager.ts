/**
 * 統一的顏色管理系統
 * 整合了 categorical-color-utils 和 color-manager 的功能
 * 提供完整的顏色方案和分類顏色管理
 */

import {
  scaleOrdinal,
  scaleLinear,
  color as d3Color,
  hsl,
  interpolate,
  schemeCategory10
} from '../../d3-utils';

// === 核心類型定義 ===

export interface ColorScheme {
  name: string;
  colors: string[];
  type: 'categorical' | 'sequential' | 'diverging';
  description?: string;
}

export interface ColorMappingConfig {
  scheme?: string | string[];
  fallbackColors?: string[];
  autoGenerate?: boolean;
  maxColors?: number;
  blendMode?: 'none' | 'interpolate' | 'lighten' | 'darken';
  interpolate?: boolean;
  reverse?: boolean;
}

export interface ColorScale {
  getColor(value: string | number, index?: number): string;
  getColors(count?: number): string[];
  domain(): any[];
  range(): string[];
  setDomain(domain: any[]): ColorScale;
  setRange(range: string[]): ColorScale;
  interpolate(t: number): string;
  copy(): ColorScale;
}

// === 預定義顏色方案 ===

export const PREDEFINED_COLOR_SCHEMES: Record<string, ColorScheme> = {
  // D3 categorical schemes
  category10: {
    name: 'Category10',
    colors: schemeCategory10,
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
};

// === 核心顏色管理類 ===

export class UnifiedColorScale implements ColorScale {
  private scale: any;
  private _domain: any[] = [];
  private _range: string[] = [];
  private config: ColorMappingConfig;
  private colorMappings: Map<string, string> = new Map();
  private usedColors: Set<string> = new Set();

  constructor(config: ColorMappingConfig) {
    this.config = {
      fallbackColors: PREDEFINED_COLOR_SCHEMES.category10.colors,
      autoGenerate: true,
      maxColors: 20,
      blendMode: 'none',
      interpolate: false,
      reverse: false,
      ...config
    };
    this.createScale();
  }

  private createScale(): void {
    const colors = this.resolveColorScheme();
    this._range = this.config.reverse ? [...colors].reverse() : colors;

    if (this.config.interpolate && this._range.length > 1) {
      // 使用線性插值比例尺
      this.scale = scaleLinear()
        .range(this._range)
        .interpolate(interpolate);
    } else {
      // 使用序數比例尺
      this.scale = scaleOrdinal<string, string>()
        .range(this._range);
    }
  }

  private resolveColorScheme(): string[] {
    const { scheme, fallbackColors } = this.config;

    if (Array.isArray(scheme)) {
      return scheme;
    }

    if (typeof scheme === 'string') {
      const predefinedScheme = PREDEFINED_COLOR_SCHEMES[scheme];
      if (predefinedScheme) {
        return predefinedScheme.colors;
      }
    }

    return fallbackColors || PREDEFINED_COLOR_SCHEMES.category10.colors;
  }

  getColor(value: string | number, index?: number): string {
    if (this.config.interpolate && typeof value === 'number') {
      return this.scale(value);
    }

    if (typeof value === 'string') {
      // 檢查是否已有映射
      if (this.colorMappings.has(value)) {
        return this.colorMappings.get(value)!;
      }

      // 創建新的映射
      const color = this.scale(value);
      this.colorMappings.set(value, color);
      this.usedColors.add(color);
      return color;
    }

    if (index !== undefined) {
      return this._range[index % this._range.length];
    }

    return this.scale(value);
  }

  getColors(count?: number): string[] {
    const targetCount = count || this._range.length;

    if (targetCount <= this._range.length) {
      return this._range.slice(0, targetCount);
    }

    // 需要生成更多顏色
    if (this.config.autoGenerate) {
      return this.generateExtendedColors(this._range, targetCount);
    }

    // 重複現有顏色
    const repeatedColors: string[] = [];
    for (let i = 0; i < targetCount; i++) {
      repeatedColors.push(this._range[i % this._range.length]);
    }
    return repeatedColors;
  }

  private generateExtendedColors(baseColors: string[], targetCount: number): string[] {
    const colors = [...baseColors];
    const maxColors = this.config.maxColors || 20;

    while (colors.length < targetCount && colors.length < maxColors) {
      const baseColor = baseColors[colors.length % baseColors.length];

      switch (this.config.blendMode) {
        case 'lighten':
          colors.push(this.lightenColor(baseColor, 0.2));
          break;
        case 'darken':
          colors.push(this.darkenColor(baseColor, 0.2));
          break;
        case 'interpolate':
          const nextBaseColor = baseColors[(colors.length + 1) % baseColors.length];
          colors.push(this.interpolateColors(baseColor, nextBaseColor, 0.5));
          break;
        default:
          colors.push(this.varyColor(baseColor));
          break;
      }
    }

    return colors.slice(0, targetCount);
  }

  private lightenColor(color: string, factor: number): string {
    const d3color = d3Color(color);
    return d3color ? d3color.brighter(factor).toString() : color;
  }

  private darkenColor(color: string, factor: number): string {
    const d3color = d3Color(color);
    return d3color ? d3color.darker(factor).toString() : color;
  }

  private interpolateColors(color1: string, color2: string, t: number): string {
    const interpolator = interpolate(color1, color2);
    return interpolator(t);
  }

  private varyColor(color: string): string {
    const d3color = d3Color(color);
    if (d3color && 'h' in d3color && 's' in d3color && 'l' in d3color) {
      const hslColor = d3color as any;  // HSL color type
      const newH = (hslColor.h + 30) % 360;
      return hsl(newH, hslColor.s, hslColor.l).toString();
    }
    return color;
  }

  domain(): any[] {
    return [...this._domain];
  }

  range(): string[] {
    return [...this._range];
  }

  setDomain(domain: any[]): ColorScale {
    this._domain = domain;
    if (this.scale && 'domain' in this.scale) {
      this.scale.domain(domain);
    }
    return this;
  }

  setRange(range: string[]): ColorScale {
    this._range = range;
    if (this.scale && 'range' in this.scale) {
      this.scale.range(range);
    }
    return this;
  }

  interpolate(t: number): string {
    if (!this.config.interpolate) {
      const index = Math.floor(t * this._range.length);
      return this._range[Math.min(index, this._range.length - 1)];
    }

    const normalizedT = Math.max(0, Math.min(1, t));
    return this.scale(normalizedT);
  }

  copy(): ColorScale {
    return new UnifiedColorScale(this.config);
  }

  // === 分類顏色專用方法 ===

  createCategoricalScale(categories: string[]): this {
    const colors = this.getColors(categories.length);
    
    this.setDomain(categories);
    this.setRange(colors);

    // 存儲映射
    categories.forEach((category, index) => {
      this.colorMappings.set(category, colors[index]);
      this.usedColors.add(colors[index]);
    });

    return this;
  }

  getColorForCategory(category: string): string | null {
    return this.colorMappings.get(category) || null;
  }

  setColorForCategory(category: string, color: string): void {
    this.colorMappings.set(category, color);
    this.usedColors.add(color);
  }

  removeCategory(category: string): void {
    const color = this.colorMappings.get(category);
    if (color) {
      this.colorMappings.delete(category);
      this.usedColors.delete(color);
    }
  }

  getAllMappings(): Map<string, string> {
    return new Map(this.colorMappings);
  }

  clearMappings(): void {
    this.colorMappings.clear();
    this.usedColors.clear();
  }
}

// === 統一顏色管理器 ===

export class UnifiedColorManager {
  private static instance: UnifiedColorManager;

  static getInstance(): UnifiedColorManager {
    if (!UnifiedColorManager.instance) {
      UnifiedColorManager.instance = new UnifiedColorManager();
    }
    return UnifiedColorManager.instance;
  }

  /**
   * 創建顏色比例尺
   */
  createColorScale(config: ColorMappingConfig): UnifiedColorScale {
    return new UnifiedColorScale(config);
  }

  /**
   * 創建分類顏色比例尺
   */
  createCategoricalColorScale(
    categories: string[], 
    scheme?: string | string[]
  ): UnifiedColorScale {
    const config: ColorMappingConfig = {
      scheme: scheme || 'category10',
      autoGenerate: true,
      blendMode: 'none'
    };

    const colorScale = new UnifiedColorScale(config);
    return colorScale.createCategoricalScale(categories);
  }

  /**
   * 獲取預定義方案
   */
  getAvailableSchemes(): ColorScheme[] {
    return Object.values(PREDEFINED_COLOR_SCHEMES);
  }

  /**
   * 獲取方案顏色
   */
  getSchemeColors(schemeName: string): string[] | null {
    const scheme = PREDEFINED_COLOR_SCHEMES[schemeName];
    return scheme ? scheme.colors : null;
  }

  /**
   * 顏色工具方法
   */
  hasGoodContrast(backgroundColor: string, textColor: string = '#000000'): boolean {
    const bgColor = d3Color(backgroundColor);
    const txtColor = d3Color(textColor);
    
    if (!bgColor || !txtColor) return false;
    
    const bgRgb = bgColor.rgb();
    const txtRgb = txtColor.rgb();
    
    const bgLuminance = 0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b;
    const txtLuminance = 0.299 * txtRgb.r + 0.587 * txtRgb.g + 0.114 * txtRgb.b;
    
    const contrast = Math.abs(bgLuminance - txtLuminance) / 255;
    return contrast > 0.5;
  }

  getComplementaryColor(color: string): string {
    const d3color = d3Color(color);
    if (d3color && 'h' in d3color && 's' in d3color && 'l' in d3color) {
      const hslColor = d3color as any;
      const complementaryH = (hslColor.h + 180) % 360;
      return hsl(complementaryH, hslColor.s, hslColor.l).toString();
    }
    return color;
  }

  isLightColor(color: string): boolean {
    const d3color = d3Color(color);
    if (!d3color) return false;
    
    const rgb = d3color.rgb();
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    return luminance > 127.5;
  }

  getOptimalTextColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  }

  hexToRgba(hex: string, alpha: number): string {
    const d3color = d3Color(hex);
    if (!d3color) return hex;
    
    const rgb = d3color.rgb();
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
}

// === 導出單例和便利函數 ===

export const unifiedColorManager = UnifiedColorManager.getInstance();

/**
 * 工廠函數：創建不同類型的顏色管理器
 */
export function createColorManager(
  type: 'business' | 'accessible' | 'pastel' | 'viridis' | 'custom',
  customColors?: string[]
): UnifiedColorScale {
  const configs: Record<string, ColorMappingConfig> = {
    business: {
      scheme: 'business',
      autoGenerate: true,
      blendMode: 'lighten'
    },
    accessible: {
      scheme: 'accessible',
      autoGenerate: true,
      blendMode: 'none'
    },
    pastel: {
      scheme: 'pastel',
      autoGenerate: true,
      blendMode: 'lighten'
    },
    viridis: {
      scheme: 'viridis',
      autoGenerate: true,
      blendMode: 'interpolate'
    },
    custom: {
      scheme: customColors || [],
      autoGenerate: true,
      blendMode: 'interpolate'
    }
  };

  return unifiedColorManager.createColorScale(configs[type] || configs.business);
}

/**
 * 便利函數：快速創建分類顏色比例尺
 */
export function createCategoricalColors(
  categories: string[], 
  scheme: string = 'category10'
): UnifiedColorScale {
  return unifiedColorManager.createCategoricalColorScale(categories, scheme);
}

/**
 * 便利函數：獲取顏色列表
 */
export function getColors(scheme: string, count: number = 10): string[] {
  return unifiedColorManager.getSchemeColors(scheme)?.slice(0, count) || 
    PREDEFINED_COLOR_SCHEMES.category10.colors.slice(0, count);
}