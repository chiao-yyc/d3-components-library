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
        chartColors = d3.schemeBlues[8] || d3.schemeBlues[d3.schemeBlues.length - 1];
        break;
      case 'diverging':
        chartColors = d3.schemeRdYlBu[8] || d3.schemeRdYlBu[d3.schemeRdYlBu.length - 1];
        break;
      case 'custom':
        chartColors = customColors || d3.schemeCategory10;
        break;
      default:
        chartColors = d3.schemeCategory10;
    }
  }

  const colors: ColorPalette = {
    primary: {
      light: chartColors[0],
      main: chartColors[0],
      dark: d3.color(chartColors[0])?.darker(0.5)?.toString() || chartColors[0]
    },
    secondary: {
      light: chartColors[1] || chartColors[0],
      main: chartColors[1] || chartColors[0],
      dark: d3.color(chartColors[1] || chartColors[0])?.darker(0.5)?.toString() || chartColors[0]
    },
    success: {
      light: '#86efac',
      main: '#10b981',
      dark: '#059669'
    },
    warning: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#dc2626'
    },
    info: {
      light: '#67e8f9',
      main: '#06b6d4',
      dark: '#0891b2'
    },
    background: {
      default: backgroundColor,
      paper: isLight ? '#f8fafc' : '#0f172a'
    },
    text: {
      primary: primaryTextColor,
      secondary: secondaryTextColor
    },
    divider: dividerColor
  };

  const tokens: DesignTokens = {
    colors,
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.625
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
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
      full: '9999px'
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    breakpoints: {
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
    primary: primaryColors,
    secondary: secondaryColors,
    success: {
      light: '#86efac',
      main: '#10b981',
      dark: '#059669'
    },
    warning: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#dc2626'
    },
    info: {
      light: accent ? generateColorVariants(accent).light : '#67e8f9',
      main: accent || '#06b6d4',
      dark: accent ? generateColorVariants(accent).dark : '#0891b2'
    },
    background: {
      default: isLight ? '#ffffff' : '#0f172a',
      paper: isLight ? '#f8fafc' : '#1e293b'
    },
    text: {
      primary: isLight ? '#1f2937' : '#f9fafb',
      secondary: isLight ? '#6b7280' : '#9ca3af'
    },
    divider: isLight ? '#e5e7eb' : '#374151'
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