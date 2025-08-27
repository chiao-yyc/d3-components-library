import * as d3 from 'd3';

export interface StatisticalData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  mean?: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  std?: number;
  count: number;
}

export type StatisticalMethod = 'tukey' | 'standard' | 'percentile';

/**
 * 統計計算工具類 - BoxPlot 和 ViolinPlot 共用
 * 純 JavaScript/TypeScript 核心實現，框架無關
 */
export class StatisticalUtils {
  /**
   * 計算統計數據
   * @param values 數值數組
   * @param method 統計方法
   * @returns 統計數據對象
   */
  static calculateStatistics(values: number[], method: StatisticalMethod = 'tukey'): StatisticalData {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    if (n === 0) {
      return {
        min: 0, q1: 0, median: 0, q3: 0, max: 0,
        outliers: [], iqr: 0, lowerFence: 0, upperFence: 0,
        count: 0
      };
    }

    // 計算四分位數 - 使用 D3 的 quantile 函數保證一致性
    const q1 = d3.quantile(sorted, 0.25) || 0;
    const median = d3.quantile(sorted, 0.5) || 0;
    const q3 = d3.quantile(sorted, 0.75) || 0;
    const iqr = q3 - q1;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    // 計算標準差
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    // 計算上下界限
    let lowerFence: number, upperFence: number;
    
    switch (method) {
      case 'tukey':
        lowerFence = q1 - 1.5 * iqr;
        upperFence = q3 + 1.5 * iqr;
        break;
      case 'percentile':
        lowerFence = d3.quantile(sorted, 0.05) || sorted[0];
        upperFence = d3.quantile(sorted, 0.95) || sorted[sorted.length - 1];
        break;
      case 'standard':
      default:
        lowerFence = Math.min(...sorted);
        upperFence = Math.max(...sorted);
        break;
    }

    // 找出異常值
    const outliers = sorted.filter(val => val < lowerFence || val > upperFence);
    
    // 找出 whisker 的實際範圍（非異常值的最小最大值）
    const validValues = sorted.filter(val => val >= lowerFence && val <= upperFence);
    const min = validValues.length > 0 ? Math.min(...validValues) : sorted[0];
    const max = validValues.length > 0 ? Math.max(...validValues) : sorted[sorted.length - 1];

    return {
      min, q1, median, q3, max,
      outliers, mean, iqr,
      lowerFence, upperFence,
      std, count: n
    };
  }

  /**
   * 檢測異常值
   * @param values 數值數組
   * @param method 檢測方法
   * @param threshold 自定義閾值（僅對 tukey 方法有效）
   * @returns 異常值數組
   */
  static detectOutliers(
    values: number[], 
    method: StatisticalMethod = 'tukey',
    threshold: number = 1.5
  ): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    if (n === 0) return [];

    const q1 = d3.quantile(sorted, 0.25) || 0;
    const q3 = d3.quantile(sorted, 0.75) || 0;
    const iqr = q3 - q1;

    let lowerFence: number, upperFence: number;
    
    switch (method) {
      case 'tukey':
        lowerFence = q1 - threshold * iqr;
        upperFence = q3 + threshold * iqr;
        break;
      case 'percentile':
        lowerFence = d3.quantile(sorted, 0.05) || sorted[0];
        upperFence = d3.quantile(sorted, 0.95) || sorted[sorted.length - 1];
        break;
      case 'standard':
      default:
        return []; // 標準方法不認為有異常值
    }

    return sorted.filter(val => val < lowerFence || val > upperFence);
  }

  /**
   * 計算自動帶寬（Silverman's rule of thumb）
   * @param values 數值數組
   * @param factor 調整因子，默認 1.0
   * @returns 建議的帶寬值
   */
  static calculateBandwidth(values: number[], factor: number = 1.0): number {
    if (values.length === 0) return 1;
    
    const stats = this.calculateStatistics(values);
    const std = stats.std || 1;
    const n = values.length;
    
    // Silverman's rule: h = 1.06 * σ * n^(-1/5)
    return factor * 1.06 * std * Math.pow(n, -1/5);
  }

  /**
   * 生成確定性隨機數（用於一致的 jitter 效果）
   * @param seed 種子值
   * @returns 0-1 之間的偽隨機數
   */
  static seededRandom(seed: number): number {
    // Linear congruential generator
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    const x = (a * seed + c) % m;
    return x / m;
  }

  /**
   * 生成字符串的哈希值（用作隨機數種子）
   * @param str 輸入字符串
   * @returns 哈希值
   */
  static hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 計算數據的基本統計摘要
   * @param values 數值數組
   * @returns 統計摘要對象
   */
  static getSummary(values: number[]) {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        range: 0,
        variance: 0,
        std: 0,
        skewness: 0,
        kurtosis: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = d3.quantile(sorted, 0.5) || 0;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    // 計算方差和標準差
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    
    // 計算偏度和峰度
    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;

    return {
      count: n,
      sum,
      mean,
      median,
      min,
      max,
      range,
      variance,
      std,
      skewness,
      kurtosis
    };
  }
}