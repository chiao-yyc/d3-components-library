/**
 * Statistical Shared Core Module
 * 統計圖表共享核心模組
 * 
 * 提供框架無關的統計計算、極座標轉換、文字處理等核心功能
 * 可被 BoxPlot、ViolinPlot、RadarChart 等統計圖表組件重用
 */

// 統計計算工具
export {
  StatisticalUtils,
  type StatisticalData,
  type StatisticalMethod
} from './statistical-utils';

// 極座標轉換工具
export {
  PolarUtils,
  ANGLE_CONSTANTS,
  INTERPOLATION_TYPES,
  type Point,
  type PolarPoint,
  type RadarAxisConfig,
  type InterpolationType
} from './polar-utils';

// 文字處理工具
export {
  TextUtils,
  TEXT_ANCHOR,
  DOMINANT_BASELINE,
  type TextWrapOptions,
  type TextMeasurement,
  type TextPosition,
  type AxisLabelConfig
} from './text-utils';

// 導出渲染器（向下兼容，但建議使用核心工具）
export { BoxPlotRenderer } from '../box-plot-renderer';
export { RadarDataRenderer } from '../radar-data-renderer';
export { RadarGridRenderer } from '../radar-grid-renderer';
export { TreeMapRenderer } from '../tree-map-renderer';
export { TreeMapLabelRenderer } from '../tree-map-label-renderer';
export { TreeMapUtils } from '../tree-map-utils';