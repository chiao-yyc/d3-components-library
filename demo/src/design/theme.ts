/**
 * Theme Configuration
 * 主題配置系統，包含主題切換和樣式計算函數
 */

import { designTokens } from './design-tokens'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  accentColor: string
  borderRadius: keyof typeof designTokens.radius
  animationsEnabled: boolean
}

export const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: 'blue',
  accentColor: 'blue', 
  borderRadius: 'lg',
  animationsEnabled: true
}

// 主題相關的工具函數
export const themeUtils = {
  // 獲取當前主題的背景類
  getBackgroundClass: (mode: ThemeMode = 'light') => {
    if (mode === 'dark') {
      return 'bg-gradient-to-br from-gray-900 to-gray-800'
    }
    return 'bg-gradient-to-br from-slate-50 to-blue-50/30'
  },

  // 獲取卡片背景類
  getCardClass: (mode: ThemeMode = 'light', blur: boolean = true) => {
    const base = mode === 'dark' 
      ? 'bg-gray-800/80 border-gray-700/50' 
      : 'bg-white/80 border-white/50'
    
    const blurClass = blur ? 'backdrop-blur-sm' : ''
    return `${base} ${blurClass} shadow-lg`
  },

  // 獲取文字顏色類
  getTextClass: (variant: 'primary' | 'secondary' | 'muted' = 'primary', mode: ThemeMode = 'light') => {
    if (mode === 'dark') {
      switch (variant) {
        case 'primary': return 'text-gray-100'
        case 'secondary': return 'text-gray-300' 
        case 'muted': return 'text-gray-400'
      }
    }
    
    switch (variant) {
      case 'primary': return 'text-gray-900'
      case 'secondary': return 'text-gray-700'
      case 'muted': return 'text-gray-500'
    }
  },

  // 獲取邊框顏色
  getBorderClass: (mode: ThemeMode = 'light') => {
    return mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
  }
}

// 動畫配置
export const animationConfig = {
  // 頁面過渡動畫
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: 0.3, 
      ease: designTokens.animation.easing.easeOut 
    }
  },

  // 卡片進入動畫
  cardEntry: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.2,
      ease: designTokens.animation.easing.easeOut 
    }
  },

  // 控制面板動畫
  panelAnimation: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 0.3,
      ease: designTokens.animation.easing.easeOut,
      staggerChildren: 0.1
    }
  },

  // 列表項目動畫
  listItemAnimation: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 0.2,
      ease: designTokens.animation.easing.easeOut 
    }
  }
}

// 響應式工具
export const responsive = {
  // 取得響應式網格類別
  getGridCols: (mobile: number = 1, tablet: number = 2, desktop: number = 3) => {
    return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
  },

  // 取得響應式間距
  getSpacing: (mobile: string = '4', tablet: string = '6', desktop: string = '8') => {
    return `space-y-${mobile} md:space-y-${tablet} lg:space-y-${desktop}`
  },

  // 取得響應式填充
  getPadding: (mobile: string = '4', tablet: string = '6', desktop: string = '8') => {
    return `p-${mobile} md:p-${tablet} lg:p-${desktop}`
  }
}

// 圖表主題配色
export const chartTheme = {
  // 主要配色方案
  colors: {
    primary: ['#3b82f6', '#1d4ed8', '#1e40af'],
    success: ['#10b981', '#059669', '#047857'], 
    warning: ['#f59e0b', '#d97706', '#b45309'],
    danger: ['#ef4444', '#dc2626', '#b91c1c'],
    neutral: ['#6b7280', '#4b5563', '#374151'],
    
    // 多色彩方案 (適合多系列圖表)
    categorical: [
      '#3b82f6', // 藍色
      '#10b981', // 綠色
      '#f59e0b', // 黃色
      '#ef4444', // 紅色
      '#8b5cf6', // 紫色
      '#06b6d4', // 青色
      '#f97316', // 橙色
      '#ec4899', // 粉色
    ],

    // 漸變配色
    gradients: {
      blue: ['#dbeafe', '#3b82f6'],
      green: ['#dcfce7', '#10b981'],
      purple: ['#f3e8ff', '#8b5cf6'],
      orange: ['#fed7aa', '#f97316']
    }
  },

  // 圖表樣式
  styles: {
    axis: {
      stroke: '#e5e7eb',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    grid: {
      stroke: '#f3f4f6',
      strokeDasharray: '2,2'
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '8px',
      boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
    }
  }
}

// 導出主題系統
export const theme = {
  tokens: designTokens,
  config: defaultTheme,
  utils: themeUtils,
  animation: animationConfig,
  responsive,
  chart: chartTheme
} as const

export default theme