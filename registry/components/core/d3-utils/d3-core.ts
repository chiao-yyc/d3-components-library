/**
 * D3 核心工具模組
 * 統一管理 D3 功能匯出，支援按需載入以優化 bundle 大小
 */

// === 核心選擇器和 DOM 操作 ===
export { 
  select, 
  selectAll, 
  selection,
  create
} from 'd3-selection';

export type { 
  Selection,
  BaseType
} from 'd3-selection';

// === 比例尺 ===
export {
  scaleLinear,
  scaleTime,
  scaleBand,
  scaleOrdinal,
  scalePoint,
  scaleLog,
  scalePow,
  scaleSqrt,
  scaleThreshold,
  scaleQuantile,
  scaleQuantize
} from 'd3-scale';

export type {
  ScaleLinear,
  ScaleTime,
  ScaleBand,
  ScaleOrdinal,
  ScalePoint,
  ScaleLogarithmic,
  ScalePow,
  ScaleContinuousNumeric,
  ScaleThreshold,
  ScaleQuantile,
  ScaleQuantize
} from 'd3-scale';

// === 數組和數據處理 ===
export {
  min,
  max,
  extent,
  sum,
  mean,
  median,
  deviation,
  variance,
  bisector,
  ascending,
  descending,
  range,
  group,
  rollup,
  index
} from 'd3-array';

// === 形狀生成器 ===
export {
  line,
  area,
  arc,
  pie,
  stack,
  symbol,
  symbolCircle,
  symbolSquare,
  symbolTriangle,
  symbolStar,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveStep,
  curveStepAfter,
  curveStepBefore
} from 'd3-shape';

export type {
  Line,
  Area,
  Arc,
  Pie,
  Stack,
  Symbol,
  CurveFactory
} from 'd3-shape';

// === 軸線 ===
export {
  axisTop,
  axisRight,
  axisBottom,
  axisLeft
} from 'd3-axis';

export type {
  Axis
} from 'd3-axis';

// === 動畫和過渡 ===
export {
  transition
} from 'd3-transition';

// === 緩動函數 ===
export {
  easeLinear,
  easeCubic,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeElastic,
  easeElasticIn,
  easeElasticOut,
  easeElasticInOut,
  easeBounce,
  easeBounceIn,
  easeBounceOut,
  easeBounceInOut
} from 'd3-ease';

export type {
  Transition
} from 'd3-transition';

// === 顏色 ===
export {
  color,
  hsl,
  rgb,
  lab,
  hcl
} from 'd3-color';

export type {
  Color,
  HSLColor,
  RGBColor,
  LabColor,
  HCLColor
} from 'd3-color';

// === 插值函數 ===
export {
  interpolate,
  interpolateHsl,
  interpolateRgb,
  interpolateLab,
  interpolateHcl,
  interpolateNumber,
  interpolateString,
  interpolateArray
} from 'd3-interpolate';

// === 顏色方案 ===
export {
  schemeCategory10,
  schemeAccent,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
  interpolateViridis,
  interpolatePlasma,
  interpolateInferno,
  interpolateMagma,
  interpolateWarm,
  interpolateCool,
  interpolateRainbow,
  interpolateSinebow
} from 'd3-scale-chromatic';

// === 格式化 ===
export {
  format,
  formatPrefix,
  formatSpecifier,
  precisionFixed,
  precisionPrefix,
  precisionRound
} from 'd3-format';

export {
  timeFormat,
  timeParse,
  timeFormat as d3TimeFormat,
  timeParse as d3TimeParse
} from 'd3-time-format';

// === 幾何和物理 ===
export {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceRadial
} from 'd3-force';

export {
  drag
} from 'd3-drag';

export {
  zoom,
  zoomIdentity,
  zoomTransform
} from 'd3-zoom';

export {
  brush,
  brushX,
  brushY
} from 'd3-brush';

// === 層次結構 ===
export {
  hierarchy,
  stratify,
  tree,
  cluster,
  partition,
  pack,
  packSiblings,
  packEnclose,
  treemap,
  treemapBinary,
  treemapDice,
  treemapSlice,
  treemapSliceDice,
  treemapSquarify,
  treemapResquarify
} from 'd3-hierarchy';

export type {
  HierarchyNode,
  HierarchyLink,
  TreeLayout,
  ClusterLayout,
  PartitionLayout,
  PackLayout,
  TreemapLayout
} from 'd3-hierarchy';

// === 路徑 ===
export {
  path
} from 'd3-path';

// === 便利方法和工具函數 ===

// Import D3 functions for internal use in utility functions
import { 
  scaleLinear as scaleLinearFn, 
  scaleBand as scaleBandFn, 
  scaleTime as scaleTimeFn, 
  scaleOrdinal as scaleOrdinalFn 
} from 'd3-scale';
import { 
  extent as extentFn,
  group as groupFn, 
  rollup as rollupFn 
} from 'd3-array';
import { interpolate as interpolateFn } from 'd3-interpolate';
import { easeCubicInOut } from 'd3-ease';

/**
 * 創建安全的 D3 選擇器
 */
export function safeSelect<T extends BaseType>(selector: string | T): Selection<T, unknown, null, undefined> {
  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return select(element as T);
  }
  return select(selector);
}

/**
 * 創建響應式比例尺
 */
export function createResponsiveScale(
  type: 'linear' | 'band' | 'time' | 'ordinal',
  domain: any[],
  range: any[]
) {
  switch (type) {
    case 'linear':
      return scaleLinearFn().domain(domain).range(range);
    case 'band':
      return scaleBandFn().domain(domain).range(range);
    case 'time':
      return scaleTimeFn().domain(domain).range(range);
    case 'ordinal':
      return scaleOrdinalFn().domain(domain).range(range);
    default:
      throw new Error(`Unsupported scale type: ${type}`);
  }
}

/**
 * 智能資料範圍計算
 */
export function calculateDomain(data: any[], accessor: (d: any) => any): [any, any] {
  const values = data.map(accessor).filter(v => v != null);
  if (values.length === 0) return [0, 1];
  
  const firstValue = values[0];
  if (firstValue instanceof Date || typeof firstValue === 'string') {
    return extentFn(values) as [any, any];
  }
  
  if (typeof firstValue === 'number') {
    const [min, max] = extentFn(values) as [number, number];
    return [min, max];
  }
  
  // 類別資料
  return Array.from(new Set(values)) as [any, any];
}

/**
 * 相容舊版 D3 nest 功能的群組工具
 * 使用新的 d3.group API 實現
 */
export function nest() {
  let keys: ((d: any) => string)[] = [];
  let rollupFunction: ((values: any[]) => any) | null = null;

  const nest = {
    key: function(keyFunction: (d: any) => string) {
      keys.push(keyFunction);
      return nest;
    },
    
    rollup: function(rollup: (values: any[]) => any) {
      rollupFunction = rollup;
      return nest;
    },
    
    entries: function(data: any[]) {
      if (keys.length === 0) return data;
      
      // 使用 d3.group 建立巢狀結構
      let result = data;
      
      if (keys.length === 1) {
        const grouped = groupFn(data, keys[0]);
        result = Array.from(grouped, ([key, values]) => ({
          key,
          values: rollupFunction ? rollupFunction(values) : values
        }));
      } else if (keys.length === 2) {
        const grouped = groupFn(data, keys[0], keys[1]);
        result = Array.from(grouped, ([key1, level2]) => ({
          key: key1,
          values: Array.from(level2, ([key2, values]) => ({
            key: key2,
            values: rollupFunction ? rollupFunction(values) : values
          }))
        }));
      } else {
        // 對於更複雜的巢狀，使用遞迴方式
        result = createNestedStructure(data, keys, rollupFunction);
      }
      
      return result;
    },
    
    map: function(data: any[]) {
      if (keys.length === 1) {
        return rollupFunction ? rollupFn(data, rollupFunction, keys[0]) : groupFn(data, keys[0]);
      }
      return groupFn(data, ...keys);
    }
  };

  return nest;
}

/**
 * 建立遞迴巢狀結構的輔助函數
 */
function createNestedStructure(
  data: any[], 
  keys: ((d: any) => string)[], 
  rollupFunction: ((values: any[]) => any) | null,
  level: number = 0
): any {
  if (level >= keys.length) {
    return rollupFunction ? rollupFunction(data) : data;
  }
  
  const grouped = groupFn(data, keys[level]);
  return Array.from(grouped, ([key, values]) => ({
    key,
    values: createNestedStructure(values, keys, rollupFunction, level + 1)
  }));
}

/**
 * 安全的顏色插值
 */
export function safeColorInterpolate(colorA: string, colorB: string, t: number): string {
  try {
    const interpolator = interpolateFn(colorA, colorB);
    return interpolator(Math.max(0, Math.min(1, t)));
  } catch (error) {
    console.warn('Color interpolation failed, using fallback', error);
    return t < 0.5 ? colorA : colorB;
  }
}

/**
 * 智能軸線配置
 */
export function configureAxis(
  axis: Axis<any>,
  scale: any,
  options: {
    ticks?: number;
    tickFormat?: (d: any) => string;
    tickSize?: number;
    tickSizeInner?: number;
    tickSizeOuter?: number;
    tickPadding?: number;
  } = {}
) {
  const {
    ticks = 5,
    tickFormat,
    tickSize,
    tickSizeInner,
    tickSizeOuter,
    tickPadding = 3
  } = options;

  axis.scale(scale);

  if (tickFormat) {
    axis.tickFormat(tickFormat);
  }

  if (typeof ticks === 'number') {
    axis.ticks(ticks);
  }

  if (tickSize !== undefined) {
    axis.tickSize(tickSize);
  }

  if (tickSizeInner !== undefined) {
    axis.tickSizeInner(tickSizeInner);
  }

  if (tickSizeOuter !== undefined) {
    axis.tickSizeOuter(tickSizeOuter);
  }

  axis.tickPadding(tickPadding);

  return axis;
}

/**
 * 動畫優化工具
 */
export function createOptimizedTransition(selection: Selection<any, any, any, any>, duration = 300) {
  return selection
    .transition()
    .duration(duration)
    .ease(easeCubicInOut);
}

/**
 * 資料綁定簡化工具
 */
export function bindData<TElement extends BaseType, TData>(
  selection: Selection<TElement, any, any, any>,
  data: TData[],
  keyFunction?: (d: TData, i: number) => string
) {
  return keyFunction 
    ? selection.data(data, keyFunction)
    : selection.data(data);
}