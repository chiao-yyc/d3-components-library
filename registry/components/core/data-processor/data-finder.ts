import * as d3 from 'd3';

/**
 * 數據查找工具類 - 支援高效的數據定位和範圍查詢
 * 基於 D3 bisector 算法實現，適用於大數據集的快速查找
 */
export class DataFinder<T> {
  private bisector: d3.Bisector<T, any>;
  private accessor: (d: T) => any;

  constructor(accessor: (d: T) => any) {
    this.accessor = accessor;
    this.bisector = d3.bisector(accessor);
  }

  /**
   * 查找最接近指定值的數據點
   * @param data 數據數組（需要按 accessor 字段排序）
   * @param value 目標值
   * @returns 最接近的數據點，如果數據為空則返回 null
   */
  findNearest(data: T[], value: any): T | null {
    if (!data || data.length === 0) return null;

    const index = this.findNearestIndex(data, value);
    return index >= 0 ? data[index] : null;
  }

  /**
   * 查找最接近指定值的數據點索引
   * @param data 數據數組（需要按 accessor 字段排序）
   * @param value 目標值
   * @returns 最接近的數據點索引
   */
  findNearestIndex(data: T[], value: any): number {
    if (!data || data.length === 0) return -1;

    const index = this.bisector.left(data, value, 1);
    
    // 邊界情況處理
    if (index === 0) return 0;
    if (index >= data.length) return data.length - 1;

    // 比較前後兩個點，選擇距離更近的
    const prev = data[index - 1];
    const curr = data[index];
    
    const prevDistance = Math.abs(this.accessor(prev) - value);
    const currDistance = Math.abs(this.accessor(curr) - value);
    
    return prevDistance < currDistance ? index - 1 : index;
  }

  /**
   * 查找指定範圍內的所有數據點
   * @param data 數據數組（需要按 accessor 字段排序）
   * @param range 範圍 [最小值, 最大值]
   * @returns 範圍內的數據點數組
   */
  findInRange(data: T[], range: [any, any]): T[] {
    if (!data || data.length === 0) return [];

    const [min, max] = range;
    const startIndex = this.bisector.left(data, min);
    const endIndex = this.bisector.right(data, max);
    
    return data.slice(startIndex, endIndex);
  }

  /**
   * 查找指定範圍內的數據點索引範圍
   * @param data 數據數組（需要按 accessor 字段排序）
   * @param range 範圍 [最小值, 最大值]
   * @returns 索引範圍 [起始索引, 結束索引]
   */
  findRangeIndices(data: T[], range: [any, any]): [number, number] {
    if (!data || data.length === 0) return [-1, -1];

    const [min, max] = range;
    const startIndex = this.bisector.left(data, min);
    const endIndex = this.bisector.right(data, max);
    
    return [startIndex, endIndex];
  }

  /**
   * 檢查數據是否已按 accessor 字段排序
   * @param data 數據數組
   * @returns 是否已排序
   */
  isSorted(data: T[]): boolean {
    if (!data || data.length <= 1) return true;

    for (let i = 1; i < data.length; i++) {
      if (this.accessor(data[i - 1]) > this.accessor(data[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * 對數據按 accessor 字段進行排序
   * @param data 數據數組
   * @returns 排序後的數據數組
   */
  sort(data: T[]): T[] {
    return [...data].sort((a, b) => {
      const aVal = this.accessor(a);
      const bVal = this.accessor(b);
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }
}

/**
 * 多維度數據查找器 - 支援 X 和 Y 軸的組合查找
 */
export class MultiDimensionalFinder<T> {
  private xFinder: DataFinder<T>;
  private yFinder: DataFinder<T>;

  constructor(
    xAccessor: (d: T) => any,
    yAccessor: (d: T) => any
  ) {
    this.xFinder = new DataFinder(xAccessor);
    this.yFinder = new DataFinder(yAccessor);
  }

  /**
   * 基於歐幾里得距離查找最近的數據點
   * @param data 數據數組
   * @param point 目標點 [x, y]
   * @param scales 比例尺對象 { xScale, yScale }
   * @returns 最接近的數據點
   */
  findNearestPoint(
    data: T[], 
    point: [any, any], 
    scales: { xScale: any; yScale: any }
  ): T | null {
    if (!data || data.length === 0) return null;

    const [targetX, targetY] = point;
    const { xScale, yScale } = scales;

    let nearest: T | null = null;
    let minDistance = Infinity;

    for (const d of data) {
      const x = xScale(this.xFinder['accessor'](d));
      const y = yScale(this.yFinder['accessor'](d));
      
      const distance = Math.sqrt(
        Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = d;
      }
    }

    return nearest;
  }

  /**
   * 查找矩形區域內的所有數據點
   * @param data 數據數組
   * @param bounds 邊界 { x: [min, max], y: [min, max] }
   * @returns 區域內的數據點數組
   */
  findInBounds(
    data: T[], 
    bounds: { x: [any, any]; y: [any, any] }
  ): T[] {
    if (!data || data.length === 0) return [];

    return data.filter(d => {
      const x = this.xFinder['accessor'](d);
      const y = this.yFinder['accessor'](d);
      
      return x >= bounds.x[0] && x <= bounds.x[1] &&
             y >= bounds.y[0] && y <= bounds.y[1];
    });
  }

  /**
   * 獲取 X 軸查找器
   */
  getXFinder(): DataFinder<T> {
    return this.xFinder;
  }

  /**
   * 獲取 Y 軸查找器
   */
  getYFinder(): DataFinder<T> {
    return this.yFinder;
  }
}

/**
 * 創建多維度數據查找器的便利函數
 * @param xAccessor X 軸數據存取器
 * @param yAccessor Y 軸數據存取器
 * @returns 多維度數據查找器實例
 */
export function createMultiDimensionalFinder<T>(
  xAccessor: (d: T) => any,
  yAccessor: (d: T) => any
): MultiDimensionalFinder<T> {
  return new MultiDimensionalFinder(xAccessor, yAccessor);
}

/**
 * 創建基於時間軸的數據查找器
 * @param timeAccessor 時間存取器
 * @returns 時間數據查找器實例
 */
export function createTimeFinder<T>(
  timeAccessor: (d: T) => Date | string | number
): DataFinder<T> {
  return new DataFinder((d: T) => {
    const value = timeAccessor(d);
    return value instanceof Date ? value : new Date(value);
  });
}

/**
 * 創建基於數值的數據查找器
 * @param numericAccessor 數值存取器
 * @returns 數值數據查找器實例
 */
export function createNumericFinder<T>(
  numericAccessor: (d: T) => number
): DataFinder<T> {
  return new DataFinder(numericAccessor);
}