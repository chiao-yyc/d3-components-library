/**
 * 統一的數據處理和驗證工具
 * 抽取共用的數據驗證、處理和轉換邏輯
 */

import { extent } from '../../d3-utils';
import {
  ChartData,
  BaseChartData,
  DataAccessor,
  DataKeyOrAccessor,
  // ChartError,
  DataValidationError
} from '../../types';

// === 數據驗證相關 ===

/**
 * 驗證圖表數據是否有效
 */
export function validateChartData<T extends BaseChartData>(
  data: unknown,
  chartType: string = 'chart'
): data is ChartData<T>[] {
  if (!Array.isArray(data)) {
    throw new DataValidationError(
      'Data must be an array',
      chartType,
      data
    );
  }

  if (data.length === 0) {
    throw new DataValidationError(
      'Data array cannot be empty',
      chartType,
      data
    );
  }

  // 檢查數據項是否為有效對象
  const invalidItems = data.filter(item => 
    typeof item !== 'object' || item === null || Array.isArray(item)
  );

  if (invalidItems.length > 0) {
    throw new DataValidationError(
      `Data contains ${invalidItems.length} invalid items. All items must be objects.`,
      chartType,
      invalidItems
    );
  }

  return true;
}

/**
 * 驗證必要的數據字段是否存在
 */
export function validateRequiredFields<T extends BaseChartData>(
  data: ChartData<T>[],
  requiredFields: (keyof T)[],
  chartType: string = 'chart'
): void {
  const missingFields = new Set<keyof T>();

  for (const item of data) {
    for (const field of requiredFields) {
      if (!(field in item) || item[field] === null || item[field] === undefined) {
        missingFields.add(field);
      }
    }
  }

  if (missingFields.size > 0) {
    throw new DataValidationError(
      `Missing required fields: ${Array.from(missingFields).join(', ')}`,
      chartType,
      Array.from(missingFields)
    );
  }
}

/**
 * 驗證數值字段的有效性
 */
export function validateNumericFields<T extends BaseChartData>(
  data: ChartData<T>[],
  numericFields: (keyof T)[],
  chartType: string = 'chart'
): void {
  const invalidItems: Array<{ index: number; field: keyof T; value: any }> = [];

  data.forEach((item, index) => {
    numericFields.forEach(field => {
      const value = item[field];
      if (value !== null && value !== undefined && (isNaN(Number(value)) || !isFinite(Number(value)))) {
        invalidItems.push({ index, field, value });
      }
    });
  });

  if (invalidItems.length > 0) {
    const errorMessage = `Invalid numeric values found:\n${invalidItems.map(
      ({ index, field, value }) => `  Row ${index}: ${String(field)} = ${value}`
    ).join('\n')}`;

    throw new DataValidationError(
      errorMessage,
      chartType,
      invalidItems
    );
  }
}

// === 數據存取工具 ===

/**
 * 安全的數據存取器
 */
export function createSafeAccessor<T extends BaseChartData, R>(
  keyOrAccessor: DataKeyOrAccessor<T, R>,
  defaultValue: R,
  chartType: string = 'chart'
): DataAccessor<T, R> {
  if (typeof keyOrAccessor === 'function') {
    return (datum: any, index: any, data: any) => {
      try {
        return keyOrAccessor(datum as T, index, data as T[]);
      } catch (error) {
        console.warn(`Accessor function failed for ${chartType} at index ${index}:`, error);
        return defaultValue;
      }
    };
  }

  // 字符串或數字鍵
  return (datum: any) => {
    try {
      const value = (datum as any)[keyOrAccessor];
      return value !== undefined && value !== null ? value as R : defaultValue;
    } catch (error) {
      console.warn(`Key access failed for ${chartType} with key ${String(keyOrAccessor)}:`, error);
      return defaultValue;
    }
  };
}

/**
 * 獲取數據字段的值數組
 */
export function extractFieldValues<T extends BaseChartData, R>(
  data: ChartData<T>[],
  keyOrAccessor: DataKeyOrAccessor<T, R>,
  options: {
    filterNull?: boolean;
    unique?: boolean;
    sort?: boolean;
  } = {}
): R[] {
  const { filterNull = true, unique = false, sort = false } = options;
  const accessor = createSafeAccessor(keyOrAccessor, null as any, 'data-extraction');

  let values = data.map(accessor) as R[];

  if (filterNull) {
    values = values.filter(v => v !== null && v !== undefined) as R[];
  }

  if (unique) {
    values = Array.from(new Set(values)) as R[];
  }

  if (sort && values.length > 0) {
    const firstValue = values[0];
    if (typeof firstValue === 'number' || firstValue instanceof Date) {
      values.sort((a, b) => {
        if (a instanceof Date && b instanceof Date) {
          return a.getTime() - b.getTime();
        }
        return (a as number) - (b as number);
      });
    } else if (typeof firstValue === 'string') {
      values.sort();
    }
  }

  return values;
}

// === 數據範圍計算 ===

/**
 * 計算數值範圍
 */
export function calculateNumericDomain<T extends BaseChartData>(
  data: ChartData<T>[],
  accessor: DataKeyOrAccessor<T, number>,
  options: {
    includeZero?: boolean;
    padding?: number;
    nice?: boolean;
  } = {}
): [number, number] {
  const { includeZero = false, padding = 0, nice = false } = options;
  
  const values = extractFieldValues(data, accessor, { filterNull: true });
  
  if (values.length === 0) {
    return [0, 1];
  }

  let [min, max] = extent(values) as [number, number];
  
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  if (padding > 0) {
    const range = max - min;
    const paddingValue = range * padding;
    min -= paddingValue;
    max += paddingValue;
  }

  if (nice) {
    // 簡單的 nice 化處理
    const range = max - min;
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
    const normalizedRange = range / magnitude;
    
    let niceRange: number;
    if (normalizedRange <= 1) niceRange = 1;
    else if (normalizedRange <= 2) niceRange = 2;
    else if (normalizedRange <= 5) niceRange = 5;
    else niceRange = 10;
    
    const niceInterval = niceRange * magnitude;
    min = Math.floor(min / niceInterval) * niceInterval;
    max = Math.ceil(max / niceInterval) * niceInterval;
  }

  return [min, max];
}

/**
 * 計算時間範圍
 */
export function calculateTimeDomain<T extends BaseChartData>(
  data: ChartData<T>[],
  accessor: DataKeyOrAccessor<T, Date | string | number>
): [Date, Date] {
  const values = extractFieldValues(data, accessor, { filterNull: true });
  
  if (values.length === 0) {
    return [new Date(), new Date()];
  }

  // 轉換為 Date 對象
  const dates = values.map(value => {
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if (typeof value === 'number') return new Date(value);
    return new Date();
  });

  return extent(dates) as [Date, Date];
}

/**
 * 計算類別域
 */
export function calculateCategoricalDomain<T extends BaseChartData>(
  data: ChartData<T>[],
  accessor: DataKeyOrAccessor<T, string>,
  options: {
    sort?: boolean;
    maxCategories?: number;
  } = {}
): string[] {
  const { sort = false, maxCategories } = options;

  const categories = extractFieldValues(data, accessor, {
    filterNull: true,
    unique: true,
    sort
  }) as string[];

  if (maxCategories && categories.length > maxCategories) {
    console.warn(`Too many categories (${categories.length}), truncating to ${maxCategories}`);
    return categories.slice(0, maxCategories);
  }

  return categories;
}

// === 數據轉換和處理 ===

/**
 * 分組數據
 */
export function groupDataBy<T extends BaseChartData>(
  data: ChartData<T>[],
  keyAccessor: DataKeyOrAccessor<T, string>
): Map<string, ChartData<T>[]> {
  const accessor = createSafeAccessor(keyAccessor, 'default', 'group-by');
  const groups = new Map<string, ChartData<T>[]>();

  data.forEach(item => {
    const key = accessor(item, 0, data);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  return groups;
}

/**
 * 排序數據
 */
export function sortData<T extends BaseChartData>(
  data: ChartData<T>[],
  keyAccessor: DataKeyOrAccessor<T, any>,
  direction: 'asc' | 'desc' = 'asc'
): ChartData<T>[] {
  const accessor = createSafeAccessor(keyAccessor, 0, 'sort');
  
  return [...data].sort((a, b) => {
    const valueA = accessor(a, 0, data);
    const valueB = accessor(b, 0, data);
    
    let comparison = 0;
    
    if (valueA instanceof Date && valueB instanceof Date) {
      comparison = valueA.getTime() - valueB.getTime();
    } else if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    } else {
      comparison = String(valueA).localeCompare(String(valueB));
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * 過濾數據
 */
export function filterData<T extends BaseChartData>(
  data: ChartData<T>[],
  predicate: (item: ChartData<T>, index: number, array: ChartData<T>[]) => boolean
): ChartData<T>[] {
  return data.filter(predicate);
}

/**
 * 聚合數據
 */
export function aggregateData<T extends BaseChartData>(
  data: ChartData<T>[],
  groupKey: DataKeyOrAccessor<T, string>,
  valueKey: DataKeyOrAccessor<T, number>,
  aggregateFunction: 'sum' | 'avg' | 'min' | 'max' | 'count' = 'sum'
): Array<{ group: string; value: number; count: number }> {
  const groups = groupDataBy(data, groupKey);
  const valueAccessor = createSafeAccessor(valueKey, 0, 'aggregate');
  
  const results: Array<{ group: string; value: number; count: number }> = [];

  groups.forEach((items, group) => {
    const values = items.map(item => valueAccessor(item, 0, items));
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    
    let aggregatedValue: number;
    
    switch (aggregateFunction) {
      case 'sum':
        aggregatedValue = numericValues.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        aggregatedValue = numericValues.length > 0 
          ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
          : 0;
        break;
      case 'min':
        aggregatedValue = Math.min(...numericValues);
        break;
      case 'max':
        aggregatedValue = Math.max(...numericValues);
        break;
      case 'count':
        aggregatedValue = items.length;
        break;
      default:
        aggregatedValue = 0;
    }

    results.push({
      group,
      value: aggregatedValue,
      count: items.length
    });
  });

  return results;
}

// === 數據品質檢查 ===

/**
 * 檢查數據品質
 */
export function analyzeDataQuality<T extends BaseChartData>(
  data: ChartData<T>[],
  _chartType: string = 'chart'
): {
  totalRows: number;
  nullValues: number;
  undefinedValues: number;
  emptyStrings: number;
  duplicateRows: number;
  dataTypes: Map<string, Set<string>>;
  issues: string[];
} {
  const analysis = {
    totalRows: data.length,
    nullValues: 0,
    undefinedValues: 0,
    emptyStrings: 0,
    duplicateRows: 0,
    dataTypes: new Map<string, Set<string>>(),
    issues: [] as string[]
  };

  // 分析每個字段的數據類型和空值
  const seen = new Set<string>();

  data.forEach((item, _index) => {
    const itemStr = JSON.stringify(item);
    if (seen.has(itemStr)) {
      analysis.duplicateRows++;
    }
    seen.add(itemStr);

    Object.entries(item).forEach(([key, value]) => {
      if (!analysis.dataTypes.has(key)) {
        analysis.dataTypes.set(key, new Set());
      }

      if (value === null) {
        analysis.nullValues++;
      } else if (value === undefined) {
        analysis.undefinedValues++;
      } else if (value === '') {
        analysis.emptyStrings++;
      } else {
        analysis.dataTypes.get(key)!.add(typeof value);
      }
    });
  });

  // 生成建議
  if (analysis.nullValues > 0) {
    analysis.issues.push(`Found ${analysis.nullValues} null values`);
  }
  
  if (analysis.undefinedValues > 0) {
    analysis.issues.push(`Found ${analysis.undefinedValues} undefined values`);
  }
  
  if (analysis.emptyStrings > 0) {
    analysis.issues.push(`Found ${analysis.emptyStrings} empty strings`);
  }
  
  if (analysis.duplicateRows > 0) {
    analysis.issues.push(`Found ${analysis.duplicateRows} duplicate rows`);
  }

  // 檢查數據類型一致性
  analysis.dataTypes.forEach((types, key) => {
    if (types.size > 1) {
      analysis.issues.push(`Field '${key}' has mixed data types: ${Array.from(types).join(', ')}`);
    }
  });

  return analysis;
}

// === 便利函數 ===

/**
 * 快速數據驗證
 */
export function quickValidateData<T extends BaseChartData>(
  data: unknown,
  chartType: string = 'chart'
): ChartData<T>[] {
  validateChartData<T>(data, chartType);
  return data as ChartData<T>[];
}

/**
 * 安全的數值轉換
 */
export function safeNumberConvert(value: unknown): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  if (value instanceof Date) return value.getTime();
  return 0;
}

/**
 * 安全的字符串轉換
 */
export function safeStringConvert(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value.toString();
  return String(value);
}