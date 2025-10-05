/**
 * BoxPlotCore - 純 JS/TS 的盒鬚圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { StatisticalUtils, StatisticalData, StatisticalMethod } from '../../shared/statistical-utils';
import { BoxPlotRenderer } from '../../shared/box-plot-renderer';

// BoxPlot 專用數據接口
export interface BoxPlotData extends BaseChartData {
  label?: string;
  value?: number;
  values?: number[]; 
  [key: string]: any;
}

// 處理後的盒鬚圖數據點
export interface ProcessedBoxPlotDataPoint {
  label: string;
  values: number[];
  statistics: StatisticalData;
  originalData: ChartData<BoxPlotData>;
  index: number;
  color: string;
}

// BoxPlot 專用配置接口
export interface BoxPlotCoreConfig extends BaseChartCoreConfig<BoxPlotData> {
  // 數據映射
  labelAccessor?: DataKeyOrAccessor<BoxPlotData, string>;
  valueAccessor?: DataKeyOrAccessor<BoxPlotData, number>;
  valuesAccessor?: DataKeyOrAccessor<BoxPlotData, number[]>;
  
  // 盒鬚圖配置
  orientation?: 'vertical' | 'horizontal';
  boxWidth?: number;
  whiskerWidth?: number;
  showOutliers?: boolean;
  showMean?: boolean;
  showMedian?: boolean;
  showWhiskers?: boolean;
  showAllPoints?: boolean;
  statisticsMethod?: StatisticalMethod;
  
  // 視覺樣式
  colors?: string[];
  pointColorMode?: 'uniform' | 'by-value' | 'by-category';
  jitterWidth?: number;
  pointRadius?: number;
  pointOpacity?: number;
  boxFillOpacity?: number;
  boxStroke?: string;
  boxStrokeWidth?: number;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // 動畫
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  
  // 事件處理
  onDataClick?: (data: ProcessedBoxPlotDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedBoxPlotDataPoint | null, event: Event) => void;
}

// 主要的 BoxPlot 核心類
export class BoxPlotCore extends BaseChartCore<BoxPlotData> {
  private colorScale: ColorScale | null = null;
  private chartGroup: D3Selection | null = null;
  private xScale: d3.ScaleBand<string> | null = null;
  private yScale: d3.ScaleLinear<number, number> | null = null;

  constructor(
    config: BoxPlotCoreConfig,
    callbacks?: ChartStateCallbacks<BoxPlotData>
  ) {
    super(config, callbacks);
  }

  protected processData(): ChartData<BoxPlotData>[] {
    const config = this.config as BoxPlotCoreConfig;
    const { data, labelAccessor, valueAccessor, valuesAccessor, statisticsMethod } = config;

    if (!data || data.length === 0) {
      this.processedData = [] as any;
      return [];
    }

    // 處理數據點 - 使用統一的數據存取模式
    const processedData: ProcessedBoxPlotDataPoint[] = data.map((item, index) => {
      // 處理 Label 值
      let label: string;
      if (typeof labelAccessor === 'function') {
        label = labelAccessor(item, index, data);
      } else if (typeof labelAccessor === 'string' || typeof labelAccessor === 'number') {
        label = String(item[labelAccessor]) || `Series ${index + 1}`;
      } else {
        label = String(item.label) || `Series ${index + 1}`;
      }

      // 處理 Values 數組
      let values: number[] = [];
      if (valuesAccessor) {
        if (typeof valuesAccessor === 'function') {
          values = valuesAccessor(item, index, data) || [];
        } else if (typeof valuesAccessor === 'string' || typeof valuesAccessor === 'number') {
          values = (item[valuesAccessor] as number[]) || [];
        }
      } else if (item.values && Array.isArray(item.values)) {
        values = item.values;
      } else if (valueAccessor) {
        // 單一值轉換為數組
        if (typeof valueAccessor === 'function') {
          values = [valueAccessor(item, index, data)];
        } else if (typeof valueAccessor === 'string' || typeof valueAccessor === 'number') {
          values = [Number(item[valueAccessor]) || 0];
        }
      } else if (typeof item.value === 'number') {
        values = [item.value];
      } else {
        values = [];
      }

      // 計算統計數據
      const statistics = StatisticalUtils.calculateStatistics(values, statisticsMethod);

      return {
        label,
        values,
        statistics,
        originalData: item,
        index,
        color: config.colors?.[index % (config.colors?.length || 1)] || '#3b82f6'
      };
    });

    this.processedData = processedData as any;

    // 創建顏色比例尺
    if (config.colors) {
      this.colorScale = createColorScale({
        type: 'custom',
        colors: config.colors,
        domain: [0, Math.max(1, processedData.length - 1)]
      });
    }

    return processedData as any;
  }

  protected createScales(): Record<string, any> {
    const processedData = this.processedData as unknown as ProcessedBoxPlotDataPoint[];
    if (!processedData || processedData.length === 0) return {};

    const config = this.config as BoxPlotCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    if (config.orientation === 'horizontal') {
      // 水平方向：Y軸為類別，X軸為數值
      this.xScale = null; // 數值軸將在渲染時創建
      this.yScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2) as any;
    } else {
      // 垂直方向（默認）：X軸為類別，Y軸為數值
      this.xScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2);
      this.yScale = null; // 數值軸將在渲染時創建
    }

    return {
      xScale: this.xScale,
      yScale: this.yScale
    };
  }

  protected renderChart(): void {
    // 創建 SVG 容器和圖表組
    this.chartGroup = this.createSVGContainer();

    // 使用已處理的數據（由 BaseChartCore.initialize() 呼叫 processData() 設置）
    const processedData = this.processedData as unknown as ProcessedBoxPlotDataPoint[];
    if (!processedData || processedData.length === 0) {
      this.chartGroup?.selectAll('*').remove();
      return;
    }

    const config = this.config as BoxPlotCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 創建數值比例尺
    const allValues = processedData.flatMap(d => d.values);
    const valueExtent = d3.extent(allValues) as [number, number];
    
    let xScale: any, yScale: any;
    if (config.orientation === 'horizontal') {
      // 水平方向：X軸數值，Y軸類別
      xScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([0, chartWidth])
        .nice();
      yScale = this.yScale;
    } else {
      // 垂直方向：X軸類別，Y軸數值
      xScale = this.xScale;
      yScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([chartHeight, 0])
        .nice();
    }

    // 使用 BoxPlotRenderer 渲染盒鬚圖
    this.renderBoxPlotsWithRenderer(xScale, yScale, processedData);

    // 使用統一軸線系統渲染軸線
    this.renderUnifiedAxes(xScale, yScale);
  }

  private renderBoxPlotsWithRenderer(
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
    processedData: ProcessedBoxPlotDataPoint[]
  ): void {
    if (!this.chartGroup) return;

    const config = this.config as BoxPlotCoreConfig;

    // 使用 BoxPlotRenderer.renderStandalone 方法
    BoxPlotRenderer.renderStandalone(this.chartGroup as any, processedData, {
      xScale,
      yScale,
      colorScale: this.colorScale,
    }, {
      orientation: config.orientation || 'vertical',
      boxWidth: config.boxWidth || 40,
      whiskerWidth: config.whiskerWidth || 20,
      showOutliers: config.showOutliers ?? true,
      showMean: config.showMean ?? true,
      showMedian: config.showMedian ?? true,
      showWhiskers: config.showWhiskers ?? true,
      boxFillOpacity: config.boxFillOpacity || 0.7,
      boxStroke: config.boxStroke || '#374151',
      boxStrokeWidth: config.boxStrokeWidth || 1,
      outlierRadius: config.pointRadius || 3,
      jitterWidth: config.jitterWidth || 0.6,
      animate: config.animate ?? true,
      animationDuration: config.animationDuration || 800,
      animationDelay: config.animationDelay || 0
    });

    // 添加交互事件到生成的元素
    this.addInteractionEvents();
  }

  private addInteractionEvents(): void {
    if (!this.chartGroup) return;

    const config = this.config as BoxPlotCoreConfig;
    const processedData = this.processedData as unknown as ProcessedBoxPlotDataPoint[];

    // 為每個 box plot 組添加事件
    this.chartGroup.selectAll('[class*="box-plot-group-"]')
      .style('cursor', 'pointer')
      .on('click', (event, _d) => {
        const index = parseInt(event.currentTarget.className.baseVal.split('-').pop());
        const dataPoint = processedData[index];
        if (dataPoint) {
          config.onDataClick?.(dataPoint, event);
        }
      })
      .on('mouseenter', (event, _d) => {
        const index = parseInt(event.currentTarget.className.baseVal.split('-').pop());
        const dataPoint = processedData[index];
        if (dataPoint) {
          config.onDataHover?.(dataPoint, event);
        }
      })
      .on('mouseleave', (event, _d) => {
        config.onDataHover?.(null, event);
      });
  }

  private renderUnifiedAxes(
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  ): void {
    const config = this.config as BoxPlotCoreConfig;

    // 渲染軸線使用統一的 BaseChartCore 方法
    if (config.showXAxis !== false) {
      this.renderStandardAxis(xScale, 'bottom', {
        label: config.xAxisLabel,
        showGrid: config.showGrid
      });
    }

    if (config.showYAxis !== false) {
      this.renderStandardAxis(yScale, 'left', {
        label: config.yAxisLabel,
        showGrid: config.showGrid
      });
    }
  }


  public getChartType(): string {
    return 'box-plot';
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<BoxPlotCoreConfig>): void {
    super.updateConfig(newConfig);
  }

  // 公共方法：獲取處理後的數據
  public override getProcessedData(): ChartData<BoxPlotData>[] | null {
    return this.processedData as any;
  }
}