/**
 * ViolinPlotCore - 純 JS/TS 的小提琴圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  // D3Selection,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { StatisticalUtils, StatisticalData, StatisticalMethod } from '../../shared/statistical-utils';
import { BoxPlotRenderer } from '../../shared/box-plot-renderer';

// ViolinPlot 專用數據接口
export interface ViolinPlotData extends BaseChartData {
  label?: string;
  value?: number;
  values?: number[]; 
  [key: string]: any;
}

// 密度點接口
export interface DensityPoint {
  value: number;
  density: number;
}

// 處理後的小提琴圖數據點
export interface ProcessedViolinDataPoint {
  label: string;
  values: number[];
  statistics: StatisticalData;
  densityData: DensityPoint[];
  originalData: ChartData<ViolinPlotData>;
  index: number;
  color: string;
}

// ViolinPlot 專用配置接口
export interface ViolinPlotCoreConfig extends BaseChartCoreConfig<ViolinPlotData> {
  // 數據映射
  labelAccessor?: DataKeyOrAccessor<ViolinPlotData, string>;
  valueAccessor?: DataKeyOrAccessor<ViolinPlotData, number>;
  valuesAccessor?: DataKeyOrAccessor<ViolinPlotData, number[]>;
  
  // 小提琴圖配置
  orientation?: 'vertical' | 'horizontal';
  violinWidth?: number;
  
  // 核密度估計配置
  bandwidth?: number;
  resolution?: number;
  kdeMethod?: 'gaussian' | 'epanechnikov' | 'triangular';
  smoothing?: number;
  clipMin?: number;
  clipMax?: number;
  
  // BoxPlot 配置
  showBoxPlot?: boolean;
  boxPlotWidth?: number;
  showMedian?: boolean;
  showMean?: boolean;
  showQuartiles?: boolean;
  showOutliers?: boolean;
  showWhiskers?: boolean;
  
  // 統計設定
  statisticsMethod?: StatisticalMethod;
  
  // 視覺樣式
  colors?: string[];
  violinFillOpacity?: number;
  violinStroke?: string;
  violinStrokeWidth?: number;
  boxPlotStroke?: string;
  boxPlotStrokeWidth?: number;
  boxPlotFillOpacity?: number;
  medianStroke?: string;
  medianStrokeWidth?: number;
  meanStyle?: 'circle' | 'diamond' | 'square';
  outlierRadius?: number;
  jitterWidth?: number;
  
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
  onDataClick?: (data: ProcessedViolinDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedViolinDataPoint | null, event: Event) => void;
}

// 主要的 ViolinPlot 核心類
export class ViolinPlotCore extends BaseChartCore<ViolinPlotData> {
  protected scales: Record<string, any> = {};
  private colorScale: ColorScale | null = null;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number> | null = null;
  private yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string> | null = null;
  private densityScale: d3.ScaleLinear<number, number> | null = null;

  constructor(
    config: ViolinPlotCoreConfig,
    callbacks: ChartStateCallbacks = {}
  ) {
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'violin-plot';
  }

  protected processData(): ChartData<ViolinPlotData>[] {
    const config = this.config as ViolinPlotCoreConfig;
    const { data, labelAccessor, valueAccessor, valuesAccessor, statisticsMethod } = config;

    console.log('🎻 NEW ViolinPlotCore processData called!', {
      dataLength: data?.length,
      labelAccessor,
      valuesAccessor
    });

    if (!data || data.length === 0) {
      this.processedData = [] as any;
      return [];
    }

    // 處理數據點 - 使用統一的數據存取模式
    const processedData: ProcessedViolinDataPoint[] = data.map((item, index) => {
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

      // 計算統計數據和密度數據
      const statistics = StatisticalUtils.calculateStatistics(values, statisticsMethod);
      const densityData = this.calculateKernelDensity(values);

      return {
        label,
        values,
        statistics,
        densityData,
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
    const processedData = this.processedData as unknown as ProcessedViolinDataPoint[];
    if (!processedData || processedData.length === 0) return {};

    const config = this.config as ViolinPlotCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 找出所有數值的範圍
    const allValues = processedData.flatMap(d => d.values);
    const valueExtent = d3.extent(allValues) as [number, number];

    // 找出最大密度值（用於標準化小提琴寬度）
    const maxDensity = Math.max(...processedData.flatMap(d => d.densityData.map(p => p.density)));

    if (config.orientation === 'horizontal') {
      // 水平方向：Y軸為類別，X軸為數值
      this.yScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2);

      this.xScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([0, chartWidth])
        .nice();
    } else {
      // 垂直方向（默認）：X軸為類別，Y軸為數值
      this.xScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2);

      this.yScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([chartHeight, 0])
        .nice();
    }

    this.densityScale = d3.scaleLinear()
      .domain([0, maxDensity])
      .range([0, (config.violinWidth || 80) / 2]);

    // Store scales in protected member
    this.scales = {
      xScale: this.xScale,
      yScale: this.yScale,
      densityScale: this.densityScale
    };

    return this.scales;
  }

  protected renderChart(): void {
    // 創建 SVG 容器和圖表組
    this.chartGroup = this.createSVGContainer();

    // 使用已處理的數據
    const processedData = this.processedData as unknown as ProcessedViolinDataPoint[];
    if (!processedData || processedData.length === 0) {
      console.warn('ViolinPlotCore: No processed data available');
      this.chartGroup.selectAll('*').remove();
      return;
    }

    // 渲染小提琴圖
    this.renderViolins(processedData);

    // 使用統一軸線系統渲染軸線
    this.renderUnifiedAxes();
  }

  private renderViolins(processedData: ProcessedViolinDataPoint[]): void {
    if (!this.chartGroup || !this.xScale || !this.yScale || !this.densityScale) return;

    const config = this.config as ViolinPlotCoreConfig;
    const {
      orientation = 'vertical',
      animate = true,
      animationDuration = 1000,
      animationDelay = 100,
      violinFillOpacity = 0.7,
      violinStroke = '#374151',
      violinStrokeWidth = 1
    } = config;

    // 繪製每個小提琴
    processedData.forEach((d, i) => {
      const violinGroup = this.chartGroup!
        .append('g')
        .attr('class', `violin-group-${i}`)
        .attr('data-testid', `violin-${i}`);

      const color = this.colorScale?.getColor(i) || d.color;

      // 計算小提琴路徑
      const violinPath = this.generateViolinPath(d, orientation);

      // 繪製小提琴形狀
      const violinElement = violinGroup
        .append('path')
        .attr('class', 'violin-path')
        .attr('fill', color)
        .attr('fill-opacity', violinFillOpacity)
        .attr('stroke', violinStroke)
        .attr('stroke-width', violinStrokeWidth);

      if (animate) {
        // 動畫效果：與 BoxPlot 一致的延遲模式
        const initialPath = this.generateInitialViolinPath(d, orientation);
        violinElement
          .attr('d', initialPath)
          .transition()
          .delay(animationDelay + i * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('d', violinPath);
      } else {
        violinElement.attr('d', violinPath);
      }

      // 渲染嵌入的 BoxPlot
      if (config.showBoxPlot) {
        this.renderEmbeddedBoxPlot(violinGroup, d, i);
      }

      // 添加交互事件
      this.addInteractionEvents(violinGroup, d);
    });
  }

  private generateViolinPath(data: ProcessedViolinDataPoint, orientation: string): string {
    if (!this.xScale || !this.yScale || !this.densityScale) return '';

    let centerX: number, centerY: number;
    let violinPath: string;

    if (orientation === 'vertical') {
      const xBandScale = this.xScale as d3.ScaleBand<string>;
      const yLinearScale = this.yScale as d3.ScaleLinear<number, number>;
      
      centerX = (xBandScale(data.label) || 0) + xBandScale.bandwidth() / 2;

      // 生成小提琴路徑
      const leftPoints = data.densityData.map(p => [
        centerX - this.densityScale!(p.density),
        yLinearScale(p.value)
      ] as [number, number]);

      const rightPoints = data.densityData.map(p => [
        centerX + this.densityScale!(p.density),
        yLinearScale(p.value)
      ] as [number, number]);

      // 創建對稱的小提琴形狀
      const allPoints = [...leftPoints, ...rightPoints.reverse()];
      violinPath = d3.line().curve(d3.curveCatmullRom)(allPoints) || '';
    } else {
      const xLinearScale = this.xScale as d3.ScaleLinear<number, number>;
      const yBandScale = this.yScale as d3.ScaleBand<string>;
      
      centerY = (yBandScale(data.label) || 0) + yBandScale.bandwidth() / 2;

      // 生成橫向小提琴路徑
      const topPoints = data.densityData.map(p => [
        xLinearScale(p.value),
        centerY - this.densityScale!(p.density)
      ] as [number, number]);

      const bottomPoints = data.densityData.map(p => [
        xLinearScale(p.value),
        centerY + this.densityScale!(p.density)
      ] as [number, number]);

      // 創建對稱的小提琴形狀
      const allPoints = [...topPoints, ...bottomPoints.reverse()];
      violinPath = d3.line().curve(d3.curveCatmullRom)(allPoints) || '';
    }

    return violinPath;
  }

  private generateInitialViolinPath(data: ProcessedViolinDataPoint, orientation: string): string {
    if (!this.xScale || !this.yScale) return '';

    if (orientation === 'vertical') {
      const xBandScale = this.xScale as d3.ScaleBand<string>;
      const yLinearScale = this.yScale as d3.ScaleLinear<number, number>;
      
      const centerX = (xBandScale(data.label) || 0) + xBandScale.bandwidth() / 2;
      const yExtent = d3.extent(data.densityData, p => yLinearScale(p.value)) as [number, number];
      return `M ${centerX} ${yExtent[0]} L ${centerX} ${yExtent[1]} Z`;
    } else {
      const xLinearScale = this.xScale as d3.ScaleLinear<number, number>;
      const yBandScale = this.yScale as d3.ScaleBand<string>;
      
      const centerY = (yBandScale(data.label) || 0) + yBandScale.bandwidth() / 2;
      const xExtent = d3.extent(data.densityData, p => xLinearScale(p.value)) as [number, number];
      return `M ${xExtent[0]} ${centerY} L ${xExtent[1]} ${centerY} Z`;
    }
  }

  private renderEmbeddedBoxPlot(
    violinGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ProcessedViolinDataPoint,
    index: number
  ): void {
    const config = this.config as ViolinPlotCoreConfig;
    const { orientation = 'vertical' } = config;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    if (!this.xScale || !this.yScale) {
      console.error('🚨 Scales not initialized for BoxPlot rendering!');
      return;
    }

    // 像 BoxPlot 一樣，重新創建適當的數值 scale
    const allValues = data.values;
    const valueExtent = d3.extent(allValues) as [number, number];
    
    let xScale: any, yScale: any;
    let centerX: number = 0, centerY: number = 0;

    if (orientation === 'horizontal') {
      // 水平方向：X軸數值，Y軸類別
      xScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([0, chartWidth])
        .nice();
      yScale = this.yScale; // 使用現有的 band scale
      const yBandScale = yScale as d3.ScaleBand<string>;
      centerY = (yBandScale(data.label) || 0) + yBandScale.bandwidth() / 2;
    } else {
      // 垂直方向：X軸類別，Y軸數值  
      xScale = this.xScale; // 使用現有的 band scale
      yScale = d3.scaleLinear()
        .domain(valueExtent)
        .range([chartHeight, 0])
        .nice();
      const xBandScale = xScale as d3.ScaleBand<string>;
      centerX = (xBandScale(data.label) || 0) + xBandScale.bandwidth() / 2;
    }

    BoxPlotRenderer.renderEmbedded(violinGroup, data.statistics, {
      centerX,
      centerY,
      orientation,
      boxWidth: config.boxPlotWidth || 15,
      showQuartiles: config.showQuartiles,
      showMedian: config.showMedian,
      showMean: config.showMean,
      showWhiskers: config.showWhiskers ?? true,
      showOutliers: config.showOutliers,
      whiskerWidth: 10,
      xScale: xScale,
      yScale: yScale,
      // 樣式參數（與 BoxPlot 一致）
      boxFill: data.color,
      boxFillOpacity: config.boxPlotFillOpacity || 0.7,
      boxStroke: config.boxPlotStroke || '#374151',
      boxStrokeWidth: config.boxPlotStrokeWidth || 1,
      medianStroke: config.medianStroke || '#000',
      medianStrokeWidth: config.medianStrokeWidth || 3,
      meanStyle: config.meanStyle || 'diamond',
      outlierRadius: config.outlierRadius || 3,
      outlierColor: data.color,
      jitterWidth: config.jitterWidth || 0.6,
      // 動畫參數
      animate: config.animate,
      animationDuration: config.animationDuration,
      animationDelay: config.animationDelay,
      categoryIndex: index
    });
  }

  private addInteractionEvents(
    violinGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ProcessedViolinDataPoint
  ): void {
    const config = this.config as ViolinPlotCoreConfig;

    if (config.interactive) {
      violinGroup
        .style('cursor', 'pointer')
        .on('click', (event) => {
          config.onDataClick?.(data, event);
        })
        .on('mouseover', (event) => {
          config.onDataHover?.(data, event);
          
          // 計算相對於圖表容器的座標
          const containerRect = this.containerElement?.getBoundingClientRect();
          if (containerRect) {
            const tooltipX = event.clientX - containerRect.left;
            const tooltipY = event.clientY - containerRect.top;
            this.showTooltip(tooltipX, tooltipY, this.formatTooltipContent(data));
          }
        })
        .on('mouseout', (event) => {
          config.onDataHover?.(null, event);
          this.hideTooltip();
        });
    }
  }

  private renderUnifiedAxes(): void {
    const config = this.config as ViolinPlotCoreConfig;

    // 渲染軸線使用統一的 BaseChartCore 方法
    if (config.showXAxis !== false && this.xScale) {
      this.renderXAxis(this.xScale, {
        label: config.xAxisLabel,
        showGrid: config.showGrid
      });
    }

    if (config.showYAxis !== false && this.yScale) {
      this.renderYAxis(this.yScale, {
        label: config.yAxisLabel,
        showGrid: config.showGrid
      });
    }
  }

  /**
   * 計算核密度估計
   */
  private calculateKernelDensity(values: number[]): DensityPoint[] {
    if (!values.length) return [];
    
    const config = this.config as ViolinPlotCoreConfig;
    const { resolution = 100, smoothing = 1, kdeMethod = 'gaussian', bandwidth } = config;

    const sortedValues = values.sort((a, b) => a - b);
    const min = d3.min(sortedValues) as number;
    const max = d3.max(sortedValues) as number;

    if (min === max) {
      // 單一值情況，返回一個點
      return [{ value: min, density: 1 }];
    }

    const range = max - min;
    const step = range / (resolution - 1);
    
    const h = bandwidth || this.calculateBandwidth(values) * smoothing;
    const kernel = this.getKernelFunction(kdeMethod);
    
    const densityPoints: DensityPoint[] = [];
    
    for (let i = 0; i < resolution; i++) {
      const x = min + i * step;
      let density = 0;
      
      for (const value of values) {
        const u = (x - value) / h;
        density += kernel(u);
      }
      
      density = density / (values.length * h);
      densityPoints.push({ value: x, density });
    }
    
    return densityPoints;
  }

  private calculateBandwidth(values: number[]): number {
    const n = values.length;
    const std = d3.deviation(values) || 1;
    // Silverman's rule of thumb
    return 1.06 * std * Math.pow(n, -1/5);
  }

  private getKernelFunction(method: string): (u: number) => number {
    switch (method) {
      case 'epanechnikov':
        return (u: number) => Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
      case 'triangular':
        return (u: number) => Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
      case 'gaussian':
      default:
        return (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
  }

  private formatTooltipContent(data: ProcessedViolinDataPoint): string {
    return `${data.label}: ${d3.format(',')(data.values.length)} values`;
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<ViolinPlotCoreConfig>): void {
    super.updateConfig(newConfig);
  }

  // 公共方法：獲取處理後的數據
  public override getProcessedData(): ChartData<ViolinPlotData>[] | null {
    return this.processedData as any;
  }

  // 公共方法：獲取比例尺
  public getScales() {
    return {
      xScale: this.xScale,
      yScale: this.yScale,
      densityScale: this.densityScale
    };
  }
}