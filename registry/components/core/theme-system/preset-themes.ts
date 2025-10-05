/**
 * 預設主題定義
 * 提供多種預設主題供使用者選擇
 */

import { ThemeCore, ThemeFactory, type ThemeCoreConfig } from './core/theme-core';
import { type DesignTokens, type ColorPalette } from './core/design-tokens';

// 預設顏色調色盤
const defaultColors: ColorPalette = {
  primary: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff'
  },
  secondary: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  success: {
    light: '#86efac',
    main: '#10b981',
    dark: '#059669',
    contrastText: '#ffffff'
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  info: {
    light: '#67e8f9',
    main: '#06b6d4',
    dark: '#0891b2',
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#f8fafc',
    level1: '#f8fafc',
    level2: '#f1f5f9'
  },
  surface: {
    default: '#ffffff',
    variant: '#f8fafc'
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    hint: '#d1d5db'
  },
  divider: '#e5e7eb',
  border: '#d1d5db',
  chart: {
    series: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5'],
    qualitative: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628']
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

const darkColors: ColorPalette = {
  primary: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb',
    contrastText: '#ffffff'
  },
  secondary: {
    light: '#fb7185',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  success: {
    light: '#4ade80',
    main: '#10b981',
    dark: '#059669',
    contrastText: '#ffffff'
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  info: {
    light: '#67e8f9',
    main: '#06b6d4',
    dark: '#0891b2',
    contrastText: '#ffffff'
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
    level1: '#1e293b',
    level2: '#334155'
  },
  surface: {
    default: '#1e293b',
    variant: '#334155'
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    disabled: '#64748b',
    hint: '#475569'
  },
  divider: '#334155',
  border: '#475569',
  chart: {
    series: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5'],
    qualitative: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628']
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

// 基礎設計令牌
const baseTokens: DesignTokens = {
  colors: defaultColors,
  typography: {
    fontFamily: {
      sans: 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      serif: 'Georgia, "Times New Roman", Times, serif',
      mono: '"Courier New", Courier, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625'
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    },
    variants: {
      h1: {
        fontSize: '48px',
        fontWeight: 700,
        lineHeight: '1.25',
        letterSpacing: '-0.025em'
      },
      h2: {
        fontSize: '36px',
        fontWeight: 700,
        lineHeight: '1.25',
        letterSpacing: '-0.025em'
      },
      h3: {
        fontSize: '30px',
        fontWeight: 600,
        lineHeight: '1.25',
        letterSpacing: '0'
      },
      h4: {
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: '1.25',
        letterSpacing: '0'
      },
      h5: {
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: '1.25',
        letterSpacing: '0'
      },
      h6: {
        fontSize: '18px',
        fontWeight: 600,
        lineHeight: '1.25',
        letterSpacing: '0'
      },
      subtitle1: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      subtitle2: {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      body1: {
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      body2: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      caption: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '1.5',
        letterSpacing: '0'
      },
      overline: {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '1.5',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }
    }
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    presets: {
      fadeIn: {
        duration: '300ms',
        easing: 'ease-out',
        keyframes: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'
      },
      slideIn: {
        duration: '300ms',
        easing: 'ease-out',
        keyframes: '@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }'
      },
      scaleIn: {
        duration: '300ms',
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        keyframes: '@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }'
      },
      bounce: {
        duration: '600ms',
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        keyframes: '@keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0,-30px,0); } 70% { transform: translate3d(0,-15px,0); } 90% { transform: translate3d(0,-4px,0); } }'
      }
    }
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// 默認主題配置
const defaultThemeConfig: ThemeCoreConfig = {
  name: 'default',
  displayName: '預設主題',
  version: '1.0.0',
  description: 'D3 Components 預設主題，提供現代化的 UI 設計',
  author: 'D3 Components Team',
  tokens: baseTokens,
  dark: false
};

// 深色主題配置
const darkThemeConfig: ThemeCoreConfig = {
  name: 'dark',
  displayName: '深色主題',
  version: '1.0.0',
  description: '深色模式主題，適合低光環境使用',
  author: 'D3 Components Team',
  tokens: {
    ...baseTokens,
    colors: darkColors
  },
  dark: true
};

// 企業主題配置
const corporateColors: ColorPalette = {
  primary: {
    light: '#818cf8',
    main: '#4f46e5',
    dark: '#3730a3',
    contrastText: '#ffffff'
  },
  secondary: {
    light: '#a78bfa',
    main: '#8b5cf6',
    dark: '#7c3aed',
    contrastText: '#ffffff'
  },
  success: {
    light: '#34d399',
    main: '#059669',
    dark: '#047857',
    contrastText: '#ffffff'
  },
  warning: {
    light: '#fbbf24',
    main: '#d97706',
    dark: '#b45309',
    contrastText: '#000000'
  },
  error: {
    light: '#f87171',
    main: '#dc2626',
    dark: '#b91c1c',
    contrastText: '#ffffff'
  },
  info: {
    light: '#38bdf8',
    main: '#0ea5e9',
    dark: '#0284c7',
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#f9fafb',
    level1: '#f9fafb',
    level2: '#f3f4f6'
  },
  surface: {
    default: '#ffffff',
    variant: '#f9fafb'
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
    hint: '#d1d5db'
  },
  divider: '#d1d5db',
  border: '#d1d5db',
  chart: {
    series: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5'],
    qualitative: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628']
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

const corporateThemeConfig: ThemeCoreConfig = {
  name: 'corporate',
  displayName: '企業主題',
  version: '1.0.0',
  description: '適合企業環境的專業主題',
  author: 'D3 Components Team',
  tokens: {
    ...baseTokens,
    colors: corporateColors,
    typography: {
      ...baseTokens.typography,
      fontFamily: {
        sans: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        serif: 'Georgia, "Times New Roman", Times, serif',
        mono: '"Courier New", Courier, monospace'
      }
    }
  },
  dark: false
};

// 極簡主題配置
const minimalColors: ColorPalette = {
  primary: {
    light: '#6b7280',
    main: '#374151',
    dark: '#1f2937',
    contrastText: '#ffffff'
  },
  secondary: {
    light: '#9ca3af',
    main: '#6b7280',
    dark: '#4b5563',
    contrastText: '#ffffff'
  },
  success: {
    light: '#86efac',
    main: '#10b981',
    dark: '#059669',
    contrastText: '#ffffff'
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  info: {
    light: '#67e8f9',
    main: '#06b6d4',
    dark: '#0891b2',
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    level1: '#fafafa',
    level2: '#f5f5f5'
  },
  surface: {
    default: '#ffffff',
    variant: '#fafafa'
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    hint: '#d1d5db'
  },
  divider: '#e5e7eb',
  border: '#d1d5db',
  chart: {
    series: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5'],
    qualitative: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628']
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

const minimalThemeConfig: ThemeCoreConfig = {
  name: 'minimal',
  displayName: '極簡主題',
  version: '1.0.0',
  description: '極簡風格，專注於內容本身',
  author: 'D3 Components Team',
  tokens: {
    ...baseTokens,
    colors: minimalColors,
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.25rem',
      lg: '0.25rem',
      xl: '0.25rem',
      '2xl': '0.25rem',
      '3xl': '0.25rem',
      full: '0.25rem'
    },
    shadows: {
      none: 'none',
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      lg: '0 4px 6px 0 rgba(0, 0, 0, 0.1)',
      xl: '0 8px 15px 0 rgba(0, 0, 0, 0.1)',
      '2xl': '0 15px 25px 0 rgba(0, 0, 0, 0.1)',
      inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
  },
  dark: false
};

// 創建預設主題實例
export const defaultTheme = new ThemeCore(defaultThemeConfig);
export const darkTheme = new ThemeCore(darkThemeConfig);
export const corporateTheme = new ThemeCore(corporateThemeConfig);
export const minimalTheme = new ThemeCore(minimalThemeConfig);

// 為默認主題添加變體
defaultTheme.addVariant({
  name: 'high-contrast',
  overrides: {
    colors: {
      ...defaultColors,
      text: {
        primary: '#000000',
        secondary: '#333333',
        disabled: '#666666',
        hint: '#999999'
      },
      divider: '#000000',
      border: '#000000'
    }
  }
});

// 為深色主題添加變體
darkTheme.addVariant({
  name: 'oled',
  overrides: {
    colors: {
      ...darkColors,
      background: {
        default: '#000000',
        paper: '#000000',
        level1: '#0a0a0a',
        level2: '#141414'
      },
      surface: {
        default: '#000000',
        variant: '#0a0a0a'
      }
    }
  }
});

// 為企業主題添加變體
corporateTheme.addVariant({
  name: 'blue-accent',
  overrides: {
    colors: {
      ...corporateColors,
      primary: {
        light: '#60a5fa',
        main: '#2563eb',
        dark: '#1d4ed8',
        contrastText: '#ffffff'
      }
    }
  }
});

// 預設主題集合
export const presetThemes = {
  default: defaultTheme,
  dark: darkTheme,
  corporate: corporateTheme,
  minimal: minimalTheme
};

// 預設主題陣列
export const presetThemeList = [
  defaultTheme,
  darkTheme,
  corporateTheme,
  minimalTheme
];

// 主題註冊工具函數
export const registerPresetThemes = () => {
  presetThemeList.forEach(theme => {
    const existingTheme = ThemeFactory.get(theme.getName());
    if (!existingTheme) {
      ThemeFactory.register(theme);
    }
  });
};

// 主題創建工具
export const createThemeVariation = (
  baseName: string, 
  variationName: string, 
  overrides: Partial<DesignTokens>
): ThemeCore | null => {
  const baseTheme = presetThemes[baseName as keyof typeof presetThemes];
  if (!baseTheme) {
    console.error(`Base theme '${baseName}' not found`);
    return null;
  }

  const newConfig: ThemeCoreConfig = {
    name: `${baseName}-${variationName}`,
    displayName: `${baseTheme.getDisplayName()} - ${variationName}`,
    version: '1.0.0',
    tokens: {
      ...baseTheme.getTokens(),
      ...overrides
    },
    extends: baseName
  };

  return new ThemeCore(newConfig);
};

// 主題驗證和診斷
export const validateTheme = (theme: ThemeCore) => {
  const validation = theme.validate();
  
  if (!validation.valid) {
    console.error(`Theme '${theme.getName()}' validation failed:`, validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn(`Theme '${theme.getName()}' warnings:`, validation.warnings);
  }
  
  return validation;
};

// 主題對比度檢查工具
export const checkThemeAccessibility = (theme: ThemeCore) => {
  const colors = theme.getColors();
  const issues: string[] = [];
  
  // 簡化的對比度檢查
  const textOnBackground = getContrastRatio(colors.text.primary, colors.background.default);
  if (textOnBackground < 4.5) {
    issues.push(`Low contrast between text and background: ${textOnBackground.toFixed(2)}`);
  }
  
  const secondaryTextOnBackground = getContrastRatio(colors.text.secondary, colors.background.default);
  if (secondaryTextOnBackground < 3) {
    issues.push(`Low contrast for secondary text: ${secondaryTextOnBackground.toFixed(2)}`);
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
};

// 簡化的對比度計算
function getContrastRatio(color1: string, color2: string): number {
  // 這是一個簡化的實現，實際應用中建議使用專門的顏色工具庫
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  // 簡化的亮度計算
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): number[] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}