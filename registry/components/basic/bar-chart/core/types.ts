/**
 * BarChart Core 類型定義
 */

import type { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

// BarChart 處理後的數據點
export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // BarChart 特有的處理屬性（如果需要）
}