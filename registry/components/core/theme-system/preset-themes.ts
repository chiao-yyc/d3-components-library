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
    dark: '#1d4ed8'
  },
  secondary: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626'
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
    default: '#ffffff',
    paper: '#f8fafc'
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280'
  },
  divider: '#e5e7eb'
};

const darkColors: ColorPalette = {
  primary: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb'
  },
  secondary: {
    light: '#fb7185',
    main: '#ef4444',
    dark: '#dc2626'
  },
  success: {
    light: '#4ade80',
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
    default: '#0f172a',
    paper: '#1e293b'
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8'
  },
  divider: '#334155'
};

// 基礎設計令牌
const baseTokens: DesignTokens = {
  colors: defaultColors,
  typography: {
    fontFamily: 'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
    dark: '#3730a3'
  },
  secondary: {
    light: '#a78bfa',
    main: '#8b5cf6',
    dark: '#7c3aed'
  },
  success: {
    light: '#34d399',
    main: '#059669',
    dark: '#047857'
  },
  warning: {
    light: '#fbbf24',
    main: '#d97706',
    dark: '#b45309'
  },
  error: {
    light: '#f87171',
    main: '#dc2626',
    dark: '#b91c1c'
  },
  info: {
    light: '#38bdf8',
    main: '#0ea5e9',
    dark: '#0284c7'
  },
  background: {
    default: '#ffffff',
    paper: '#f9fafb'
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563'
  },
  divider: '#d1d5db'
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
      fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }
  },
  dark: false
};

// 極簡主題配置
const minimalColors: ColorPalette = {
  primary: {
    light: '#6b7280',
    main: '#374151',
    dark: '#1f2937'
  },
  secondary: {
    light: '#9ca3af',
    main: '#6b7280',
    dark: '#4b5563'
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
    default: '#ffffff',
    paper: '#ffffff'
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280'
  },
  divider: '#e5e7eb'
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
      full: '0.25rem'
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      lg: '0 4px 6px 0 rgba(0, 0, 0, 0.1)',
      xl: '0 8px 15px 0 rgba(0, 0, 0, 0.1)',
      '2xl': '0 15px 25px 0 rgba(0, 0, 0, 0.1)'
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
        secondary: '#333333'
      },
      divider: '#000000'
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
        paper: '#000000'
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
        dark: '#1d4ed8'
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