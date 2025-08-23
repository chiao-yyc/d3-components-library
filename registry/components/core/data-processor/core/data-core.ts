/**
 * DataCore - 純 JS/TS 數據處理核心邏輯
 * 框架無關的數據清理、轉換和驗證
 */

export interface DataCoreConfig {
  validateData?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: (item: any) => boolean;
  transformBy?: (item: any) => any;
}

export class DataCore {
  private config: DataCoreConfig;

  constructor(config: DataCoreConfig = {}) {
    this.config = config;
  }

  public processData<T>(data: T[]): T[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    let processedData = [...data];
    const { validateData = true, sortBy, sortOrder = 'asc', filterBy, transformBy } = this.config;

    // 數據驗證
    if (validateData) {
      processedData = this.validateDataArray(processedData);
    }

    // 數據過濾
    if (filterBy) {
      processedData = processedData.filter(filterBy);
    }

    // 數據轉換
    if (transformBy) {
      processedData = processedData.map(transformBy);
    }

    // 數據排序
    if (sortBy) {
      processedData = this.sortData(processedData, sortBy, sortOrder);
    }

    return processedData;
  }

  private validateDataArray<T>(data: T[]): T[] {
    return data.filter(item => item !== null && item !== undefined);
  }

  private sortData<T>(data: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return data.sort((a: any, b: any) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  public detectDataTypes(data: any[]): Record<string, 'number' | 'string' | 'date' | 'boolean'> {
    if (!data.length) return {};
    
    const sample = data[0];
    const types: Record<string, 'number' | 'string' | 'date' | 'boolean'> = {};
    
    Object.keys(sample).forEach(key => {
      const value = sample[key];
      if (typeof value === 'number') {
        types[key] = 'number';
      } else if (typeof value === 'boolean') {
        types[key] = 'boolean';
      } else if (value instanceof Date) {
        types[key] = 'date';
      } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        types[key] = 'date';
      } else {
        types[key] = 'string';
      }
    });
    
    return types;
  }

  public updateConfig(newConfig: Partial<DataCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): DataCoreConfig {
    return { ...this.config };
  }
}