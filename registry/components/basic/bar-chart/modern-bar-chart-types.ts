/**
 * 現代化 BarChart 類型定義
 * 支援統一的數據存取模式和 hooks 架構
 */

import type { ModernChartProps } from '../../core/base-chart/create-modern-chart';
import type { DataMapping, ProcessedDataPoint as CoreProcessedDataPoint } from '../../core/data-processor/types';

// Re-export core types
export type { DataMapping };

// BarChart 處理後的數據點
export interface ProcessedDataPoint extends CoreProcessedDataPoint {
  // BarChart 特有的處理屬性（如果需要）
}

// BarChart 的核心配置介面
export interface ModernBarChartProps extends ModernChartProps {
  // === 數據映射配置 (推薦) ===
  mapping?: DataMapping;
  
  // === 向下兼容的廢棄屬性 - Key-based 模式 ===
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xKey?: string;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yKey?: string;
  
  // === 向下兼容的廢棄屬性 - Accessor-based 模式 ===
  /** @deprecated 請使用 mapping.x 替代。將在 v1.0.0 版本中移除。 */
  xAccessor?: (d: any) => any;
  /** @deprecated 請使用 mapping.y 替代。將在 v1.0.0 版本中移除。 */
  yAccessor?: (d: any) => any;

  // === BarChart 特有屬性 ===
  orientation?: 'vertical' | 'horizontal';
  colors?: string[];
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // 標籤配置
  showLabels?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  labelFormat?: (value: any) => string;
  
  // 樣式配置
  barOpacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  
  // 工具提示
  tooltipFormat?: (data: ProcessedDataPoint) => string;
  
  // 事件處理
  onDataClick?: (data: ProcessedDataPoint) => void;
  onHover?: (data: ProcessedDataPoint | null) => void;
  
  // 動畫配置
  animate?: boolean;
  animationDuration?: number;
  
  // 互動配置
  interactive?: boolean;
}

// 向下兼容的類型別名
export type BarChartProps = ModernBarChartProps;