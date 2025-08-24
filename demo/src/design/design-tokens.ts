/**
 * Design Tokens System
 * 統一的設計令牌系統，包含顏色、間距、字體、陰影等設計規範
 */

export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe', 
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      600: '#059669'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706'
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    },
    // 漸變背景
    gradients: {
      primary: 'from-slate-50 to-blue-50/30',
      card: 'from-white/80 to-white/40',
      accent: 'from-blue-500 to-blue-600'
    }
  },
  
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '5rem',   // 80px
    '5xl': '6rem'    // 96px
  },

  typography: {
    // 標題樣式
    heading1: 'text-3xl font-bold tracking-tight text-gray-900',
    heading2: 'text-2xl font-semibold text-gray-800', 
    heading3: 'text-lg font-semibold text-gray-800',
    heading4: 'text-base font-semibold text-gray-800',
    
    // 正文樣式
    body: 'text-sm text-gray-600',
    bodyLarge: 'text-base text-gray-700',
    caption: 'text-xs text-gray-500',
    
    // 特殊樣式
    label: 'text-sm font-medium text-gray-700',
    code: 'font-mono text-sm',
    
    // 互動元素
    button: 'text-sm font-medium',
    link: 'text-sm text-blue-600 hover:text-blue-800'
  },

  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },

  shadows: {
    // 基礎陰影
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
    
    // 特殊陰影
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
    colored: '0 4px 14px 0 rgb(59 130 246 / 0.15)', // 帶顏色的陰影
    glass: '0 8px 32px 0 rgb(31 38 135 / 0.37)' // 玻璃擬態陰影
  },

  animation: {
    // 動畫時長
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms'
    },
    
    // 緩動函數 (Framer Motion 格式)
    easing: {
      linear: 'linear',
      easeOut: [0.16, 1, 0.3, 1],
      easeIn: [0.4, 0, 1, 1],
      easeInOut: [0.4, 0, 0.2, 1],
      bounce: [0.68, -0.55, 0.265, 1.55]
    },

    // 預設動畫配置
    presets: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      },
      slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
      }
    }
  },

  // 響應式斷點
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-index 層級
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
}

// 輔助函數
export const getColorClass = (color: string, shade: number = 500) => {
  return `${color}-${shade}`
}

export const getSpacingClass = (size: keyof typeof designTokens.spacing, property: 'p' | 'm' | 'gap' = 'p') => {
  return `${property}-${size}`
}

// 導出常用組合樣式
export const commonStyles = {
  // 玻璃擬態卡片
  glassCard: 'bg-white/80 backdrop-blur-sm border border-white/50 shadow-glass',
  
  // 現代化按鈕
  primaryButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg',
  secondaryButton: 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors',
  
  // 輸入框
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  
  // 控制面板
  controlPanel: 'bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg',
  
  // 圖表容器
  chartContainer: 'bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/50'
}

export type DesignTokens = typeof designTokens