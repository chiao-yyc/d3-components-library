import { useMemo } from 'react'
import { ColorSchemeConfig, ColorScale, ColorSchemeType } from './types'
import { colorManager } from './color-manager'

export interface UseColorSchemeOptions extends Partial<ColorSchemeConfig> {
  // 數據相關
  data?: any[]
  seriesCount?: number
  
  // 響應式配置
  responsive?: boolean
  
  // 無障礙配置
  accessibility?: boolean
  colorBlindSafe?: boolean
}

export interface UseColorSchemeResult {
  // 色彩比例尺
  colorScale: ColorScale
  
  // 便利方法
  getColor: (value: any, index?: number) => string
  getColors: (count?: number) => string[]
  
  // 色彩資訊
  colors: string[]
  palette: string[]
  
  // 工具方法
  interpolateColor: (t: number) => string
  getContrastColor: (backgroundColor: string) => string
  adjustBrightness: (color: string, factor: number) => string
}

export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const {
    type = 'custom',
    colors,
    count,
    data,
    seriesCount,
    interpolate = false,
    reverse = false,
    opacity,
    responsive = true,
    accessibility = false,
    colorBlindSafe = false,
    ...config
  } = options

  // 計算實際需要的顏色數量
  const actualCount = useMemo(() => {
    if (count) return count
    if (seriesCount) return seriesCount
    if (data) {
      // 根據數據推測需要的顏色數量
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        if (typeof firstItem === 'object' && firstItem !== null) {
          // 如果是對象數組，可能需要為每個系列分配顏色
          return Math.min(data.length, 10) // 限制最大數量
        }
      }
      return Math.min(data.length, 10)
    }
    return 10 // 預設值
  }, [count, seriesCount, data])

  // 調整色彩方案以支援無障礙需求
  const adjustedScheme = useMemo(() => {
    let scheme = type
    
    if (colorBlindSafe) {
      // 使用色盲友善的調色板
      const colorBlindSafeSchemes: ColorSchemeType[] = ['cividis', 'viridis', 'plasma']
      if (!colorBlindSafeSchemes.includes(type)) {
        scheme = 'cividis'
      }
    }
    
    return scheme
  }, [type, colorBlindSafe])

  // 創建色彩比例尺
  const colorScale = useMemo(() => {
    const schemeConfig: ColorSchemeConfig = {
      type: adjustedScheme,
      colors,
      count: actualCount,
      interpolate,
      reverse,
      opacity,
      ...config
    }

    return colorManager.createScale(schemeConfig)
  }, [adjustedScheme, colors, actualCount, interpolate, reverse, opacity, config])

  // 獲取色彩數組
  const colorArray = useMemo(() => {
    return colorScale.getColors(actualCount)
  }, [colorScale, actualCount])

  // 獲取調色板（更多顏色選項）
  const palette = useMemo(() => {
    return colorManager.getColors(adjustedScheme, Math.max(actualCount, 20))
  }, [adjustedScheme, actualCount])

  // 便利方法
  const getColor = useMemo(() => {
    return (value: any, index?: number) => {
      let color = colorScale.getColor(value, index)
      
      // 應用透明度
      if (opacity !== undefined && opacity < 1) {
        color = applyOpacity(color, opacity)
      }
      
      return color
    }
  }, [colorScale, opacity])

  const getColors = useMemo(() => {
    return (requestedCount?: number) => {
      const colors = colorScale.getColors(requestedCount || actualCount)
      
      // 應用透明度
      if (opacity !== undefined && opacity < 1) {
        return colors.map(color => applyOpacity(color, opacity))
      }
      
      return colors
    }
  }, [colorScale, actualCount, opacity])

  const interpolateColor = useMemo(() => {
    return (t: number) => {
      let color = colorScale.interpolate(t)
      
      // 應用透明度
      if (opacity !== undefined && opacity < 1) {
        color = applyOpacity(color, opacity)
      }
      
      return color
    }
  }, [colorScale, opacity])

  return {
    colorScale,
    getColor,
    getColors,
    colors: colorArray,
    palette,
    interpolateColor,
    getContrastColor: colorManager.getContrastColor.bind(colorManager),
    adjustBrightness: colorManager.adjustBrightness.bind(colorManager)
  }
}

// 應用透明度的輔助函數
function applyOpacity(color: string, opacity: number): string {
  // 簡單的透明度應用 - 可以根據需要擴展
  if (color.startsWith('#')) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
    return color + alpha
  }
  
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }
  
  return color
}

// 專門用於圖表系列的 Hook
export function useSeriesColors(
  seriesCount: number, 
  scheme: ColorSchemeType = 'custom'
): string[] {
  return useMemo(() => {
    return colorManager.getColors(scheme, seriesCount)
  }, [seriesCount, scheme])
}

// 專門用於漸變的 Hook
export function useGradientColors(
  startColor: string,
  endColor: string,
  steps: number = 10
): string[] {
  return useMemo(() => {
    return colorManager.interpolateColors(startColor, endColor, steps)
  }, [startColor, endColor, steps])
}