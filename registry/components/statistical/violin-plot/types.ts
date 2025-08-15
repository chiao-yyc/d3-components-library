// 重新導出核心類型，保持向下兼容
export type {
  ViolinPlotDataPoint,
  ProcessedViolinDataPoint,
  DensityPoint,
  ViolinShape,
  ViolinPlotProps,
  ViolinPlotScales
} from './core/types';

// 為了向下兼容，保留舊的統計類型別名
export type ViolinStatistics = import('../shared/statistical-utils').StatisticalData;