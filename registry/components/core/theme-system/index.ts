/**
 * Theme System - 統一匯出介面
 * D3 Components 企業級主題管理系統
 */

// 核心主題類別和工廠
export { ThemeCore, ThemeFactory, ThemeEventEmitter } from './core/theme-core';
export type { 
  ThemeCoreConfig, 
  ThemeVariant, 
  ThemeTransition, 
  ThemeChangeEvent, 
  ThemeChangeListener 
} from './core/theme-core';

// 設計令牌
export type { 
  DesignTokens, 
  ColorPalette, 
  Typography, 
  Spacing, 
  Animation, 
  BorderRadius, 
  Shadows, 
  Breakpoints 
} from './core/design-tokens';

// React 整合
export { 
  ThemeProvider, 
  useTheme, 
  useThemeChange, 
  useThemeSetup, 
  useThemeStyles,
  withTheme 
} from './theme-provider';
export type { ThemeContextValue, ThemeProviderProps } from './theme-provider';

// 預設主題
export { 
  defaultTheme, 
  darkTheme, 
  corporateTheme, 
  minimalTheme,
  presetThemes,
  presetThemeList,
  registerPresetThemes,
  createThemeVariation,
  validateTheme,
  checkThemeAccessibility 
} from './preset-themes';

// 主題工具函數
export { 
  createChartTheme, 
  createCustomPalette, 
  generateColorVariants,
  generateHarmoniousColors,
  getAccessibleTextColor,
  blendThemes,
  createResponsiveTheme,
  createThemeTransition,
  injectThemeCSS,
  saveThemePreference,
  loadThemePreference,
  analyzeThemePerformance
} from './theme-utils';
export type { ChartThemeConfig, CustomPaletteConfig, ThemeTransitionConfig } from './theme-utils';

// 便捷導出：常用的主題創建函數
export const createTheme = (config: Partial<ThemeCoreConfig> & { name: string }) => {
  const { ThemeCore } = require('./core/theme-core');
  const { baseTokens } = require('./preset-themes');
  
  return new ThemeCore({
    displayName: config.name,
    version: '1.0.0',
    tokens: baseTokens,
    ...config
  });
};

// 便捷導出：快速主題切換
export const quickThemeSwitch = {
  toLight: () => 'default',
  toDark: () => 'dark',
  toCorporate: () => 'corporate',
  toMinimal: () => 'minimal'
};

// 主題相關常數
export const THEME_CONSTANTS = {
  DEFAULT_THEME: 'default',
  DARK_THEME: 'dark',
  CSS_PREFIX: '--theme',
  STORAGE_KEY: 'theme-preference',
  VARIANT_STORAGE_KEY: 'theme-variant-preference'
} as const;

// 主題事件類型
export const THEME_EVENTS = {
  THEME_CHANGE: 'theme-change',
  VARIANT_CHANGE: 'variant-change'
} as const;