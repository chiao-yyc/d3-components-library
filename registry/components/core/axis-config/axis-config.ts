/**
 * D3 Components 統一軸線配置系統
 * 為所有 Cartesian coordinate 圖表提供一致的軸線控制方式
 */

/**
 * 軸線配置接口
 * 適用於所有 Cartesian coordinate 圖表的 X 和 Y 軸
 */
export interface AxisConfig {
  /** 是否包含原點 (適合散點圖等需要 (0,0) 參考的圖表) */
  includeOrigin?: boolean;
  
  /** 是否從零開始 (適合柱狀圖等需要零基準的圖表) */
  beginAtZero?: boolean;
  
  /** 域值控制 */
  domain?: 'auto' | [number, number] | ((data: unknown[]) => [number, number]);
  
  /** 是否使用 D3 nice() 產生友好的刻度值 */
  nice?: boolean;
  
  /** 域值邊距百分比 (預留空間避免數據點貼邊) */
  padding?: number;
}

/**
 * 圖表類型軸線默認值配置
 */
export interface ChartAxisDefaults {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
}

/**
 * 預定義的圖表類型默認值
 */
export const CHART_AXIS_DEFAULTS: Record<string, ChartAxisDefaults> = {
  // === 統計圖表 ===
  'scatter-plot': {
    xAxis: { includeOrigin: false, nice: true },
    yAxis: { includeOrigin: false, nice: true }
  },
  
  'box-plot': {
    xAxis: { domain: 'auto' }, // 類別軸
    yAxis: { beginAtZero: false, nice: true }
  },
  
  'violin-plot': {
    xAxis: { domain: 'auto' }, // 類別軸
    yAxis: { beginAtZero: false, nice: true }
  },
  
  // === 基礎圖表 ===
  'line': {
    xAxis: { beginAtZero: false, nice: true },
    yAxis: { beginAtZero: false, nice: true }
  },
  
  'area': {
    xAxis: { beginAtZero: false, nice: true },
    yAxis: { beginAtZero: false, nice: true }
  },
  
  'bar': {
    xAxis: { domain: 'auto' }, // 通常是類別軸
    yAxis: { beginAtZero: true, nice: true }
  },
  
  // === 金融圖表 ===
  'candlestick': {
    xAxis: { beginAtZero: false, nice: true }, // 時間軸
    yAxis: { beginAtZero: false, nice: true, padding: 0.1 } // 價格軸，需要一些邊距
  },
  
  // === 特殊圖表 ===
  'funnel': {
    xAxis: { beginAtZero: true, nice: true },
    yAxis: { domain: 'auto' } // 類別軸
  },
  
  'gauge': {
    // 極坐標圖表，不使用 Cartesian 軸線系統
  },
  
  'pie': {
    // 極坐標圖表，不使用 Cartesian 軸線系統
  },
  
  'radar': {
    // 極坐標圖表，使用專門的 RadarAxisConfig
  },
  
  'heatmap': {
    xAxis: { domain: 'auto' }, // 類別軸
    yAxis: { domain: 'auto' }  // 類別軸
  },
  
  'tree-map': {
    // 樹狀圖不使用傳統軸線
  },
  
  // === 通用默認值 ===
  'default': {
    xAxis: { beginAtZero: false, nice: true },
    yAxis: { beginAtZero: false, nice: true }
  }
};

/**
 * 域值計算結果
 */
export type DomainResult = [number, number];

/**
 * 域值計算函數類型
 */
export type DomainFunction = (data: any[]) => DomainResult;

/**
 * 軸線配置解析選項
 */
export interface AxisConfigResolveOptions {
  /** 數據值陣列 */
  values: number[];
  /** 軸線配置 */
  axisConfig?: AxisConfig;
  /** 快捷配置 - 包含原點 */
  includeOrigin?: boolean;
  /** 快捷配置 - 從零開始 */
  beginAtZero?: boolean;
  /** 圖表類型默認值 */
  chartDefaults?: AxisConfig;
}

/**
 * 判斷是否為有效的數值範圍
 */
export function isValidDomain(domain: any): domain is [number, number] {
  return Array.isArray(domain) && 
         domain.length === 2 && 
         typeof domain[0] === 'number' && 
         typeof domain[1] === 'number' &&
         !isNaN(domain[0]) && 
         !isNaN(domain[1]);
}

/**
 * 合併軸線配置
 * 處理配置優先級：明確配置 > 快捷配置 > 默認值
 */
export function mergeAxisConfig(
  axisConfig?: AxisConfig,
  shortcuts?: { includeOrigin?: boolean; beginAtZero?: boolean },
  defaults?: AxisConfig
): AxisConfig {
  const merged: AxisConfig = {
    ...defaults,
    ...shortcuts,
    ...axisConfig
  };
  
  return merged;
}