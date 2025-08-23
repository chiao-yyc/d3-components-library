import { BaseChartProps } from '../../../core/base-chart/base-chart';
import { ProcessedDataPoint as CoreProcessedDataPoint } from '../../../core/data-processor/types';

// 相關性矩陣資料點
export interface ProcessedCorrelogramDataPoint extends CoreProcessedDataPoint {
  x: string;                    // X 軸變數名稱
  y: string;                    // Y 軸變數名稱
  value: number;                // 相關係數值 (-1 到 1)
  xIndex: number;               // X 軸索引
  yIndex: number;               // Y 軸索引
  normalizedValue: number;      // 正規化後的絕對值 (0 到 1)
  position: 'upper' | 'lower' | 'diagonal';  // 矩陣位置
}

// Correlogram 特定屬性
export interface CorrelogramProps extends BaseChartProps {
  // 資料來源選項
  correlationMatrix?: number[][];     // 直接提供相關係數矩陣
  variables?: string[];              // 變數名稱陣列
  
  // 資料映射 (用於原始資料)
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  xAccessor?: (d: any) => any;
  yAccessor?: (d: any) => any;
  valueAccessor?: (d: any) => any;

  // 顯示選項
  showUpperTriangle?: boolean;       // 顯示上三角 (圓圈)
  showLowerTriangle?: boolean;       // 顯示下三角 (文字)
  showDiagonal?: boolean;           // 顯示對角線 (變數名)
  
  // 樣式配置
  cellPadding?: number;             // 格子間距
  maxCircleRadius?: number;         // 最大圓圈半徑
  minCircleRadius?: number;         // 最小圓圈半徑
  colorScheme?: 'default' | 'custom';
  customColors?: [string, string, string];  // [負相關, 零相關, 正相關]
  
  // 文字顯示
  showValues?: boolean;             // 顯示數值
  valueFormat?: (value: number) => string;
  textColor?: string | ((value: number, normalized: number) => string);
  fontSize?: string;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisRotation?: number;
  yAxisRotation?: number;
  
  // 過濾和交互
  threshold?: number;               // 顯示閾值 (絕對值)
  onCellClick?: (x: string, y: string, value: number, event: Event) => void;
  onCellHover?: (x: string, y: string, value: number, event: Event) => void;
}

// 內部配置
export interface CorrelogramScales {
  xScale: any;
  yScale: any;
  colorScale: any;
  sizeScale: any;
  chartWidth: number;
  chartHeight: number;
}

// 矩陣資料處理結果
export interface CorrelogramMatrix {
  variables: string[];
  data: ProcessedCorrelogramDataPoint[];
  extent: [number, number];         // 相關係數範圍
}