/**
 * Color System Core Module
 * 顏色系統核心模組
 * 
 * 提供框架無關的統一顏色管理、色彩方案、分類顏色等核心功能
 * 可被所有圖表組件重用，支援業務、可存取性、主題等多種色彩方案
 */

// 統一顏色管理器
export {
  UnifiedColorManager,
  UnifiedColorScale,
  unifiedColorManager,
  type ColorScheme,
  type ColorMappingConfig,
  type ColorScale,
  PREDEFINED_COLOR_SCHEMES
} from './unified-color-manager';

// 工廠函數和便利函數
export {
  createColorManager,
  createCategoricalColors,
  getColors
} from './unified-color-manager';