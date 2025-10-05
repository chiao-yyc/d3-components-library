/**
 * RadarChartCore - 純 JS/TS 的雷達圖核心實現
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
import { PolarUtils, RadarAxisConfig, InterpolationType } from '../../shared/polar-utils';
import { RadarGridRenderer, GridOptions } from '../../shared/radar-grid-renderer';
import { RadarDataRenderer, RadarSeries, DataOptions } from '../../shared/radar-data-renderer';

// RadarChart 專用數據接口
export interface RadarChartData extends BaseChartData {
  label?: string;
  [axis: string]: string | number | Date | boolean | null | undefined;
}

// 處理後的雷達圖數據點
export interface ProcessedRadarDataPoint {
  label: string;
  values: RadarValue[];
  originalData: ChartData<RadarChartData>;
  index: number;
}

// 雷達圖數值
export interface RadarValue {
  axis: string;
  value: number;
  normalizedValue: number;
  originalValue: number;
}

// RadarChart 專用配置接口
export interface RadarChartCoreConfig extends BaseChartCoreConfig<RadarChartData> {
  // 數據映射
  labelAccessor?: DataKeyOrAccessor<RadarChartData, string>;
  axisKeys?: string[]; // 軸線名稱列表
  valueAccessor?: (data: RadarChartData, axis: string) => number;
  
  // 雷達圖形狀配置
  radius?: number;
  startAngle?: number;
  clockwise?: boolean;
  
  // 比例配置
  minValue?: number;
  maxValue?: number;
  autoScale?: boolean;
  scaleType?: 'linear' | 'log';
  
  // 視覺樣式
  colors?: string[];
  colorScheme?: string;
  strokeWidth?: number;
  areaOpacity?: number;
  interpolation?: InterpolationType;
  
  // 網格配置
  showGrid?: boolean;
  showGridLabels?: boolean;
  levels?: number;
  gridStroke?: string;
  gridStrokeWidth?: number;
  gridOpacity?: number;
  
  // 軸線配置
  showAxes?: boolean;
  showAxisLabels?: boolean;
  axisStroke?: string;
  axisStrokeWidth?: number;
  axisLabelOffset?: number;
  
  // 數據顯示配置
  showArea?: boolean;
  showLine?: boolean;
  showDots?: boolean;
  dotRadius?: number;
  dotStroke?: string;
  dotStrokeWidth?: number;
  
  // 動畫
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  
  // 交互
  interactive?: boolean;
  glowEffect?: boolean;
  
  // 格式化
  valueFormat?: (value: number) => string;
  fontSize?: number;
  fontFamily?: string;
  
  // 事件處理
  onDataClick?: (data: ProcessedRadarDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedRadarDataPoint | null, event: Event) => void;
  onSeriesClick?: (data: ProcessedRadarDataPoint, event: Event) => void;
  onSeriesHover?: (data: ProcessedRadarDataPoint | null, event: Event) => void;
  onDotClick?: (value: RadarValue, series: ProcessedRadarDataPoint, event: Event) => void;
  onDotHover?: (value: RadarValue | null, series: ProcessedRadarDataPoint | null, event: Event) => void;
}

// 主要的 RadarChart 核心類
export class RadarChartCore extends BaseChartCore<RadarChartData> {
  private colorScale: ColorScale | null = null;
  private chartGroup: D3Selection | null = null;
  private radarAxes: RadarAxisConfig[] = [];
  private radarSeries: RadarSeries[] = [];
  private chartRadius: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;

  constructor(
    config: RadarChartCoreConfig,
    callbacks?: ChartStateCallbacks
  ) {
    super(config, callbacks);
  }

  protected processData(): ChartData<RadarChartData>[] {
    const config = this.config as RadarChartCoreConfig;
    const { 
      data, 
      axisKeys = [], 
      labelAccessor, 
      valueAccessor,
      minValue = 0,
      maxValue,
      autoScale = true
    } = config;

    if (!data || data.length === 0 || axisKeys.length === 0) {
      this.processedData = [] as any;
      return [];
    }

    // 計算數值範圍
    let actualMaxValue = maxValue;
    if (autoScale || actualMaxValue === undefined) {
      const allValues = data.flatMap(d =>
        axisKeys.map(axis => {
          if (valueAccessor) {
            return valueAccessor(d, axis);
          } else {
            return Number(d[axis]) || 0;
          }
        })
      );
      actualMaxValue = Math.max(...allValues);
    }

    // 處理數據點 - 使用統一的數據存取模式
    const processedData: ProcessedRadarDataPoint[] = data.map((item, index) => {
      // 處理 Label 值
      let label: string;
      if (typeof labelAccessor === 'function') {
        label = labelAccessor(item, index, data);
      } else if (typeof labelAccessor === 'string' || typeof labelAccessor === 'number') {
        label = String(item[labelAccessor]) || `Series ${index + 1}`;
      } else {
        label = String(item.label) || `Series ${index + 1}`;
      }

      // 處理每個軸線的值
      const values: RadarValue[] = axisKeys.map(axis => {
        let value: number;

        if (valueAccessor) {
          value = valueAccessor(item, axis);
        } else {
          value = Number(item[axis]) || 0;
        }

        const normalizedValue = (value - minValue) / (actualMaxValue! - minValue);

        return {
          axis,
          value: normalizedValue,
          normalizedValue,
          originalValue: value
        };
      });

      return {
        label,
        values,
        originalData: item,
        index
      };
    });

    this.processedData = processedData as any;

    // 創建顏色比例尺
    try {
      this.colorScale = createColorScale({
        type: config.colorScheme || 'custom',
        colors: config.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        domain: [0, Math.max(1, processedData.length - 1)],
        interpolate: config.colorScheme !== 'custom'
      } as any);
    } catch (error) {
      console.warn('Failed to create color scale, using fallback:', error);
      // 創建簡單的 fallback colorScale
      this.colorScale = {
        getColor: (index: number) => {
          const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
          return defaultColors[index % defaultColors.length];
        },
        getColors: (_count?: number) => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        domain: () => [0, processedData.length - 1],
        range: () => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
      } as ColorScale;
    }

    return processedData as any;
  }

  protected createScales(): Record<string, any> {
    const processedData = this.processedData as unknown as ProcessedRadarDataPoint[];
    if (!processedData || processedData.length === 0) return {};

    const config = this.config as RadarChartCoreConfig;
    const { 
      startAngle = -90,
      clockwise = true,
      axisLabelOffset = 20,
      minValue = 0,
      maxValue = 1,
      scaleType = 'linear',
      axisKeys = []
    } = config;

    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 計算圖表尺寸
    this.chartRadius = config.radius || Math.min(chartWidth, chartHeight) / 2 - 40;
    this.centerX = chartWidth / 2;
    this.centerY = chartHeight / 2;

    // 生成雷達軸配置
    this.radarAxes = PolarUtils.calculateAxisPositions(
      axisKeys,
      this.centerX,
      this.centerY,
      this.chartRadius,
      startAngle,
      clockwise,
      axisLabelOffset
    );

    // 為每個軸設置數值範圍和比例尺
    this.radarAxes.forEach(axis => {
      axis.min = minValue;
      axis.max = maxValue;
      axis.scale = scaleType === 'log' 
        ? d3.scaleLog().domain([minValue || 0.1, maxValue]).range([0, this.chartRadius])
        : d3.scaleLinear().domain([minValue, maxValue]).range([0, this.chartRadius]);
    });

    return {
      radarAxes: this.radarAxes,
      centerX: this.centerX,
      centerY: this.centerY,
      chartRadius: this.chartRadius
    };
  }

  protected renderChart(): void {
    // 創建 SVG 容器和圖表組
    this.chartGroup = this.createSVGContainer();

    // 使用已處理的數據（由 BaseChartCore.initialize() 呼叫 processData() 設置）
    const processedData = this.processedData as unknown as ProcessedRadarDataPoint[];
    if (!processedData || processedData.length === 0) {
      this.chartGroup?.selectAll('*').remove();
      return;
    }

    const config = this.config as RadarChartCoreConfig;
    const {
      interpolation = 'linear-closed',
      showGrid = true,
      showGridLabels = true,
      showAxes = true,
      showAxisLabels = true,
      showArea = true,
      showLine = true,
      showDots = true,
      levels = 5,
      gridStroke = '#e5e7eb',
      gridStrokeWidth = 1,
      gridOpacity = 0.7,
      axisStroke = '#9ca3af',
      axisStrokeWidth = 1,
      strokeWidth = 2,
      areaOpacity = 0.25,
      dotRadius = 4,
      dotStroke = '#fff',
      dotStrokeWidth = 2,
      valueFormat,
      fontSize = 12,
      fontFamily = 'sans-serif',
      animate = true,
      animationDuration = 1000,
      animationDelay = 100,
      interactive = true,
      glowEffect = false,
      onSeriesClick,
      onSeriesHover,
      onDotClick,
      onDotHover
    } = config;

    // 生成雷達數據系列
    this.radarSeries = RadarDataRenderer.generateRadarSeries(
      processedData,
      this.radarAxes,
      this.centerX,
      this.centerY,
      this.colorScale,
      interpolation as InterpolationType,
      (d) => d.label,
      (d, axis) => {
        const value = d.values.find((v: any) => v.axis === axis);
        return value ? value.normalizedValue : 0;
      }
    );

    // 渲染網格系統
    const gridOptions: GridOptions = {
      showGrid,
      showGridLabels,
      showAxes,
      showAxisLabels,
      levels,
      gridStyles: {
        stroke: gridStroke,
        strokeWidth: gridStrokeWidth,
        opacity: gridOpacity
      },
      axisStyles: {
        stroke: axisStroke,
        strokeWidth: axisStrokeWidth,
        opacity: gridOpacity
      },
      labelStyles: {
        fontSize,
        fontFamily,
        fill: '#6b7280'
      },
      gridLabelOffset: 10,
      axisLabelOffset: 0,
      valueFormat,
      glowEffect,
      // 使用統一樣式系統
      standardAxisStyles: {
        fontSize: `${fontSize}px`,
        fontColor: '#6b7280',
        fontFamily,
        tickPadding: 8,
        gridColor: gridStroke,
        domainColor: axisStroke
      }
    };

    RadarGridRenderer.renderGrid(
      this.chartGroup,
      this.centerX,
      this.centerY,
      this.chartRadius,
      this.radarAxes,
      this.radarAxes[0]?.max || 1,
      gridOptions
    );

    // 渲染數據
    const dataOptions: DataOptions = {
      showArea,
      showLine,
      showDots,
      interpolation: interpolation as InterpolationType,
      dataStyles: {
        strokeWidth,
        areaOpacity,
        dotRadius,
        dotStroke,
        dotStrokeWidth
      },
      animate,
      animationDuration,
      animationDelay,
      interactive,
      onSeriesClick,
      onSeriesHover,
      onDotClick,
      onDotHover
    };

    RadarDataRenderer.renderData(
      this.chartGroup,
      this.radarSeries,
      this.centerX,
      this.centerY,
      this.radarAxes,
      dataOptions
    );
  }

  public getChartType(): string {
    return 'radar-chart';
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<RadarChartCoreConfig>): void {
    super.updateConfig(newConfig);
  }

  // 公共方法：獲取處理後的數據
  public override getProcessedData(): ChartData<RadarChartData>[] | null {
    return this.processedData as any;
  }

  // 公共方法：獲取雷達系列數據
  public getRadarSeries(): RadarSeries[] {
    return this.radarSeries;
  }

  // 公共方法：獲取雷達軸配置
  public getRadarAxes(): RadarAxisConfig[] {
    return this.radarAxes;
  }

  // 公共方法：高亮特定系列
  public highlightSeries(seriesIndex: number | null): void {
    if (!this.chartGroup) return;
    
    RadarDataRenderer.highlightSeries(this.chartGroup, seriesIndex);
  }

  // 公共方法：更新樣式
  public updateStyles(styles: {
    strokeWidth?: number;
    areaOpacity?: number;
    dotRadius?: number;
  }): void {
    if (!this.chartGroup) return;
    
    RadarDataRenderer.updateDataStyles(this.chartGroup, styles);
  }

  // 公共方法：切換數據可見性
  public toggleDataVisibility(options: {
    showAreas?: boolean;
    showLines?: boolean;
    showDots?: boolean;
  }): void {
    if (!this.chartGroup) return;
    
    RadarDataRenderer.toggleDataVisibility(this.chartGroup, options);
  }
}