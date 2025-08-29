/**
 * Virtual Scrolling 工具函數集合
 * 提供虛擬滾動的輔助功能
 */

import { VirtualScrollState, VirtualScrollItem } from '../../core/performance/virtual-scrolling';

/**
 * 自動估算項目高度
 */
export function estimateItemHeight(
  sampleData: any[],
  renderFunction: (item: any) => HTMLElement,
  maxSamples: number = 10
): number {
  if (sampleData.length === 0) return 40; // 默認高度

  const samples = sampleData.slice(0, maxSamples);
  let totalHeight = 0;

  samples.forEach(item => {
    try {
      const element = renderFunction(item);
      if (element) {
        totalHeight += element.offsetHeight || 40;
      }
    } catch (error) {
      totalHeight += 40; // 回退到默認值
    }
  });

  return Math.max(20, Math.floor(totalHeight / samples.length));
}

/**
 * 計算最佳預渲染區域大小
 */
export function calculateOptimalOverscan(
  itemHeight: number,
  containerHeight: number,
  scrollSpeed: 'slow' | 'normal' | 'fast' = 'normal'
): number {
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  
  switch (scrollSpeed) {
    case 'slow':
      return Math.max(2, Math.floor(visibleItems * 0.3));
    case 'fast':
      return Math.max(5, Math.floor(visibleItems * 0.8));
    default:
      return Math.max(3, Math.floor(visibleItems * 0.5));
  }
}

/**
 * 虛擬滾動性能監控器
 */
export class VirtualScrollPerformanceMonitor {
  private metrics: {
    renderTime: number[];
    memoryUsage: number[];
    frameDrops: number;
    scrollEvents: number;
  } = {
    renderTime: [],
    memoryUsage: [],
    frameDrops: 0,
    scrollEvents: 0
  };

  private lastFrameTime = 0;
  private isMonitoring = false;

  /**
   * 開始監控
   */
  start(): void {
    this.isMonitoring = true;
    this.metrics = {
      renderTime: [],
      memoryUsage: [],
      frameDrops: 0,
      scrollEvents: 0
    };
    this.lastFrameTime = performance.now();
  }

  /**
   * 停止監控
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * 記錄渲染時間
   */
  recordRenderTime(time: number): void {
    if (!this.isMonitoring) return;
    
    this.metrics.renderTime.push(time);
    
    // 檢測掉幀 (超過 16.67ms = 60fps)
    if (time > 16.67) {
      this.metrics.frameDrops++;
    }
    
    // 限制記錄數量
    if (this.metrics.renderTime.length > 100) {
      this.metrics.renderTime.shift();
    }
  }

  /**
   * 記錄記憶體使用
   */
  recordMemoryUsage(): void {
    if (!this.isMonitoring) return;
    
    // @ts-ignore
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      this.metrics.memoryUsage.push(memory);
      
      if (this.metrics.memoryUsage.length > 50) {
        this.metrics.memoryUsage.shift();
      }
    }
  }

  /**
   * 記錄滾動事件
   */
  recordScrollEvent(): void {
    if (!this.isMonitoring) return;
    this.metrics.scrollEvents++;
  }

  /**
   * 獲取性能報告
   */
  getReport(): {
    avgRenderTime: number;
    maxRenderTime: number;
    frameDropRate: number;
    avgMemoryUsage: number;
    scrollEventsPerSecond: number;
    status: 'excellent' | 'good' | 'poor';
  } {
    const { renderTime, memoryUsage, frameDrops, scrollEvents } = this.metrics;
    
    const avgRenderTime = renderTime.length > 0 
      ? renderTime.reduce((sum, t) => sum + t, 0) / renderTime.length 
      : 0;
    
    const maxRenderTime = renderTime.length > 0 
      ? Math.max(...renderTime) 
      : 0;
    
    const frameDropRate = renderTime.length > 0 
      ? frameDrops / renderTime.length 
      : 0;
    
    const avgMemoryUsage = memoryUsage.length > 0 
      ? memoryUsage.reduce((sum, m) => sum + m, 0) / memoryUsage.length 
      : 0;
    
    const scrollEventsPerSecond = scrollEvents / ((performance.now() - this.lastFrameTime) / 1000);
    
    // 評估性能狀態
    let status: 'excellent' | 'good' | 'poor';
    if (avgRenderTime < 5 && frameDropRate < 0.05) {
      status = 'excellent';
    } else if (avgRenderTime < 10 && frameDropRate < 0.1) {
      status = 'good';
    } else {
      status = 'poor';
    }

    return {
      avgRenderTime,
      maxRenderTime,
      frameDropRate,
      avgMemoryUsage,
      scrollEventsPerSecond,
      status
    };
  }
}

/**
 * 虛擬滾動數據處理器
 */
export class VirtualScrollDataProcessor<T = any> {
  private cache = new Map<string, any>();
  private sortedIndices: number[] = [];
  
  constructor(private data: T[]) {
    this.updateIndices();
  }

  /**
   * 更新數據
   */
  setData(data: T[]): void {
    this.data = data;
    this.cache.clear();
    this.updateIndices();
  }

  /**
   * 搜索數據
   */
  search(query: string, searchFields: (keyof T)[]): number[] {
    const cacheKey = `search:${query}:${searchFields.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const results: number[] = [];
    const lowerQuery = query.toLowerCase();
    
    this.data.forEach((item, index) => {
      const matches = searchFields.some(field => {
        const value = String(item[field]).toLowerCase();
        return value.includes(lowerQuery);
      });
      
      if (matches) {
        results.push(index);
      }
    });

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 排序數據
   */
  sort(field: keyof T, direction: 'asc' | 'desc' = 'asc'): number[] {
    const cacheKey = `sort:${String(field)}:${direction}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const indices = Array.from({ length: this.data.length }, (_, i) => i);
    
    indices.sort((a, b) => {
      const valueA = this.data[a][field];
      const valueB = this.data[b][field];
      
      let comparison = 0;
      if (valueA < valueB) comparison = -1;
      else if (valueA > valueB) comparison = 1;
      
      return direction === 'desc' ? -comparison : comparison;
    });

    this.cache.set(cacheKey, indices);
    return indices;
  }

  /**
   * 過濾數據
   */
  filter(predicate: (item: T, index: number) => boolean): number[] {
    const results: number[] = [];
    
    this.data.forEach((item, index) => {
      if (predicate(item, index)) {
        results.push(index);
      }
    });

    return results;
  }

  /**
   * 分組數據
   */
  groupBy(field: keyof T): Map<any, number[]> {
    const groups = new Map<any, number[]>();
    
    this.data.forEach((item, index) => {
      const key = item[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(index);
    });

    return groups;
  }

  /**
   * 獲取項目
   */
  getItem(index: number): T | undefined {
    return this.data[index];
  }

  /**
   * 獲取項目列表
   */
  getItems(indices: number[]): T[] {
    return indices.map(index => this.data[index]).filter(Boolean);
  }

  /**
   * 清理快取
   */
  clearCache(): void {
    this.cache.clear();
  }

  private updateIndices(): void {
    this.sortedIndices = Array.from({ length: this.data.length }, (_, i) => i);
  }
}

/**
 * 創建自適應虛擬滾動配置
 */
export function createAdaptiveVirtualConfig(
  dataSize: number,
  deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): {
  chunkSize: number;
  overscan: number;
  throttleMs: number;
  itemHeight: number;
} {
  let chunkSize: number;
  let overscan: number;
  let throttleMs: number;
  let itemHeight: number;

  // 根據數據大小調整
  if (dataSize < 1000) {
    chunkSize = 100;
    overscan = 3;
  } else if (dataSize < 10000) {
    chunkSize = 500;
    overscan = 5;
  } else if (dataSize < 100000) {
    chunkSize = 2000;
    overscan = 8;
  } else {
    chunkSize = 5000;
    overscan = 10;
  }

  // 根據設備類型調整
  switch (deviceType) {
    case 'mobile':
      throttleMs = 32; // 30fps
      itemHeight = 60;
      overscan = Math.max(2, overscan - 2);
      break;
    case 'tablet':
      throttleMs = 24; // 40fps
      itemHeight = 50;
      overscan = Math.max(3, overscan - 1);
      break;
    default:
      throttleMs = 16; // 60fps
      itemHeight = 40;
      break;
  }

  return {
    chunkSize,
    overscan,
    throttleMs,
    itemHeight
  };
}

/**
 * 虛擬滾動 Hook 工具
 */
export function useVirtualScrollOptimization() {
  const monitor = new VirtualScrollPerformanceMonitor();

  const startMonitoring = () => monitor.start();
  const stopMonitoring = () => monitor.stop();
  const getPerformanceReport = () => monitor.getReport();

  return {
    monitor,
    startMonitoring,
    stopMonitoring,
    getPerformanceReport,
    recordRenderTime: (time: number) => monitor.recordRenderTime(time),
    recordScrollEvent: () => monitor.recordScrollEvent(),
    recordMemoryUsage: () => monitor.recordMemoryUsage()
  };
}