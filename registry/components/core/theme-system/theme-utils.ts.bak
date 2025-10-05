/**
 * Theme Utilities - 主題工具函數
 * 提供主題創建、顏色處理、圖表主題等實用工具
 */

import * as d3 from 'd3';
import { ThemeCore, type ThemeCoreConfig } from './core/theme-core';
import { type DesignTokens, type ColorPalette } from './core/design-tokens';

// 圖表專用主題創建
export interface ChartThemeConfig {
  name: string;
  displayName?: string;
  baseTheme?: 'light' | 'dark';
  colorScheme?: 'category' | 'sequential' | 'diverging' | 'custom';
  customColors?: string[];
  chartBackground?: string;
  gridColor?: string;
  axisColor?: string;
  textColor?: string;
  tooltipStyle?: {
    background?: string;
    text?: string;
    border?: string;
  };
}

export const createChartTheme = (config: ChartThemeConfig): ThemeCore => {
  const {
    name,
    displayName = name,
    baseTheme = 'light',
    colorScheme = 'category',
    customColors,
    chartBackground,
    gridColor,
    axisColor,
    textColor,
    tooltipStyle
  } = config;

  // 基礎色彩根據 baseTheme 決定
  const isLight = baseTheme === 'light';
  const backgroundColor = chartBackground || (isLight ? '#ffffff' : '#1f2937');
  const primaryTextColor = textColor || (isLight ? '#1f2937' : '#f9fafb');
  const secondaryTextColor = isLight ? '#6b7280' : '#9ca3af';
  const dividerColor = gridColor || (isLight ? '#e5e7eb' : '#374151');

  // 生成圖表顏色
  let chartColors: string[];
  if (customColors) {
    chartColors = customColors;
  } else {
    switch (colorScheme) {
      case 'sequential':
        chartColors = [...(d3.schemeBlues[8] || d3.schemeBlues[d3.schemeBlues.length - 1])];
        break;
      case 'diverging':
        chartColors = [...(d3.schemeRdYlBu[8] || d3.schemeRdYlBu[d3.schemeRdYlBu.length - 1])];
        break;
      case 'custom':
        chartColors = customColors || [...d3.schemeCategory10];
        break;
      default:
        chartColors = [...d3.schemeCategory10];
    }
  }

  const colors: ColorPalette = {
    primary: {
      light: chartColors[0],
      main: chartColors[0],
      dark: d3.color(chartColors[0])?.darker(0.5)?.toString() || chartColors[0],
      contrastText: '#ffffff'
    },
    secondary: {
      light: chartColors[1] || chartColors[0],
      main: chartColors[1] || chartColors[0],
      dark: d3.color(chartColors[1] || chartColors[0])?.darker(0.5)?.toString() || chartColors[0],
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
      default: backgroundColor,
      paper: isLight ? '#f8fafc' : '#0f172a',
      level1: isLight ? '#f8fafc' : '#1e293b',
      level2: isLight ? '#f1f5f9' : '#334155'
    },
    surface: {
      default: backgroundColor,
      variant: isLight ? '#f8fafc' : '#1e293b'
    },
    text: {
      primary: primaryTextColor,
      secondary: secondaryTextColor,
      disabled: isLight ? '#94a3b8' : '#64748b',
      hint: isLight ? '#cbd5e1' : '#475569'
    },
    divider: dividerColor,
    border: isLight ? '#d1d5db' : '#475569',
    chart: {
      series: chartColors,
      categorical: chartColors,
      sequential: chartColors,
      diverging: chartColors,
      qualitative: chartColors
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

  const tokens: DesignTokens = {
    colors,
    typography: {
      fontFamily: {
        sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: 'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
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
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      52: '208px',
      56: '224px',
      60: '240px',
      64: '256px',
      72: '288px',
      80: '320px',
      96: '384px'
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
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      presets: {
        fadeIn: {
          duration: '300ms',
          easing: 'ease-in-out',
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
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
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

  const themeConfig: ThemeCoreConfig = {
    name,
    displayName,
    version: '1.0.0',
    description: `Chart theme: ${displayName}`,
    tokens,
    dark: baseTheme === 'dark'
  };

  const theme = new ThemeCore(themeConfig);

  // 添加圖表專用方法
  (theme as any).getChartColors = () => chartColors;
  (theme as any).getChartTheme = () => ({
    background: backgroundColor,
    text: primaryTextColor,
    grid: dividerColor,
    axis: axisColor || secondaryTextColor,
    tooltip: {
      background: tooltipStyle?.background || colors.background.paper,
      text: tooltipStyle?.text || primaryTextColor,
      border: tooltipStyle?.border || dividerColor
    }
  });

  return theme;
};

// 自訂調色盤創建
export interface CustomPaletteConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  baseTheme?: 'light' | 'dark';
  generateVariants?: boolean;
}

export const createCustomPalette = (config: CustomPaletteConfig): ColorPalette => {
  const {
    primary,
    secondary = primary,
    accent,
    baseTheme = 'light',
    generateVariants = true
  } = config;

  const isLight = baseTheme === 'light';

  let primaryColors = { light: primary, main: primary, dark: primary };
  let secondaryColors = { light: secondary, main: secondary, dark: secondary };

  if (generateVariants) {
    primaryColors = generateColorVariants(primary);
    secondaryColors = generateColorVariants(secondary);
  }

  return {
    primary: { ...primaryColors, contrastText: '#ffffff' },
    secondary: { ...secondaryColors, contrastText: '#ffffff' },
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
      light: accent ? generateColorVariants(accent).light : '#67e8f9',
      main: accent || '#06b6d4',
      dark: accent ? generateColorVariants(accent).dark : '#0891b2',
      contrastText: '#ffffff'
    },
    background: {
      default: isLight ? '#ffffff' : '#0f172a',
      paper: isLight ? '#f8fafc' : '#1e293b',
      level1: isLight ? '#f8fafc' : '#1e293b',
      level2: isLight ? '#f1f5f9' : '#334155'
    },
    surface: {
      default: isLight ? '#ffffff' : '#0f172a',
      variant: isLight ? '#f8fafc' : '#1e293b'
    },
    text: {
      primary: isLight ? '#1f2937' : '#f9fafb',
      secondary: isLight ? '#6b7280' : '#9ca3af',
      disabled: isLight ? '#94a3b8' : '#64748b',
      hint: isLight ? '#cbd5e1' : '#475569'
    },
    divider: isLight ? '#e5e7eb' : '#374151',
    border: isLight ? '#d1d5db' : '#475569',
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
};

// 顏色變體生成
export const generateColorVariants = (baseColor: string): { light: string; main: string; dark: string } => {
  try {
    const color = d3.color(baseColor);
    if (!color) {
      return { light: baseColor, main: baseColor, dark: baseColor };
    }

    const lightColor = color.brighter(0.5);
    const darkColor = color.darker(0.5);

    return {
      light: lightColor.toString(),
      main: baseColor,
      dark: darkColor.toString()
    };
  } catch (error) {
    console.warn('Failed to generate color variants for:', baseColor);
    return { light: baseColor, main: baseColor, dark: baseColor };
  }
};

// 色彩和諧工具
export const generateHarmoniousColors = (baseColor: string, count: number = 5): string[] => {
  try {
    const color = d3.color(baseColor);
    if (!color) return [baseColor];

    const hsl = d3.hsl(color);
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      const newHue = (hsl.h + (360 / count) * i) % 360;
      const newColor = d3.hsl(newHue, hsl.s, hsl.l);
      colors.push(newColor.toString());
    }

    return colors;
  } catch (error) {
    console.warn('Failed to generate harmonious colors for:', baseColor);
    return Array(count).fill(baseColor);
  }
};

// 無障礙色彩檢查
export const getAccessibleTextColor = (backgroundColor: string): string => {
  try {
    const bgColor = d3.color(backgroundColor);
    if (!bgColor) return '#000000';

    const luminance = getLuminance(backgroundColor);
    
    // 如果背景較亮，使用深色文字；如果背景較暗，使用淺色文字
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch (error) {
    return '#000000';
  }
};

// 簡化的亮度計算
function getLuminance(color: string): number {
  try {
    const rgbColor = d3.rgb(color);
    const [r, g, b] = [rgbColor.r, rgbColor.g, rgbColor.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch (error) {
    return 0;
  }
}

// 主題混合工具
export const blendThemes = (theme1: ThemeCore, theme2: ThemeCore, ratio: number = 0.5): ThemeCore => {
  const blendedTheme = theme1.mix(theme2, ratio);
  return blendedTheme;
};

// 響應式主題工具
export const createResponsiveTheme = (
  baseTheme: ThemeCore,
  breakpointOverrides: Record<string, Partial<DesignTokens>>
): ThemeCore => {
  const responsiveTheme = baseTheme.clone(`${baseTheme.getName()}-responsive`);
  
  // 為不同斷點創建變體
  Object.entries(breakpointOverrides).forEach(([breakpoint, overrides]) => {
    responsiveTheme.addVariant({
      name: `${breakpoint}-variant`,
      overrides
    });
  });

  return responsiveTheme;
};

// 主題轉換動畫工具
export interface ThemeTransitionConfig {
  duration?: number;
  easing?: string;
  properties?: string[];
}

export const createThemeTransition = (config: ThemeTransitionConfig = {}): string => {
  const {
    duration = 300,
    easing = 'ease-in-out',
    properties = ['background-color', 'color', 'border-color', 'box-shadow']
  } = config;

  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
};

// CSS 變數注入工具
export const injectThemeCSS = (theme: ThemeCore, prefix: string = '--theme'): void => {
  const cssString = theme.generateCSSString(prefix);
  
  let styleElement = document.getElementById('theme-variables') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'theme-variables';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = cssString;
};

// 主題持久化工具
export const saveThemePreference = (themeName: string, variant?: string): void => {
  try {
    localStorage.setItem('theme-preference', themeName);
    if (variant) {
      localStorage.setItem('theme-variant-preference', variant);
    } else {
      localStorage.removeItem('theme-variant-preference');
    }
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
};

export const loadThemePreference = (): { theme: string | null; variant: string | null } => {
  try {
    return {
      theme: localStorage.getItem('theme-preference'),
      variant: localStorage.getItem('theme-variant-preference')
    };
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
    return { theme: null, variant: null };
  }
};

// 主題效能分析工具
export const analyzeThemePerformance = (theme: ThemeCore) => {
  const start = performance.now();
  
  // 測試令牌訪問效能
  const tokens = theme.getTokens();
  const colorAccess = theme.getColor('primary.main');
  const cssGeneration = theme.generateCSSVariables();
  
  const end = performance.now();
  
  return {
    executionTime: end - start,
    tokenCount: JSON.stringify(tokens).length,
    cssVariableCount: Object.keys(cssGeneration).length,
    memoryUsage: JSON.stringify(theme.serialize()).length
  };
};