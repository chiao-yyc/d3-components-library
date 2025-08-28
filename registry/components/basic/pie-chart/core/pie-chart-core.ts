/**
 * PieChartCore - 純 JS/TS 的圓餅圖核心實現
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

// PieChart 專用數據接口
export interface PieChartData extends BaseChartData {
  label?: string;
  value?: number;
  color?: string;
  [key: string]: string | number | Date | boolean | null | undefined;
}

// 處理後的數據點
export interface ProcessedPieDataPoint {
  label: string;
  value: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
  color: string;
  originalData: ChartData<PieChartData>;
  index: number;
}

// 扇形片段數據
export interface PieSegment {
  data: ProcessedPieDataPoint;
  path: string;
  centroid: [number, number];
  labelPosition: [number, number];
  arc: d3.Arc<any, d3.DefaultArcObject>;
}

// 標籤配置
export interface LabelConfig {
  show: boolean;
  position: 'inside' | 'outside' | 'edge';
  format?: (value: number, percentage: number, label: string) => string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  offset?: number;
  connector?: {
    show: boolean;
    color: string;
    strokeWidth: number;
  };
}

// 圖例配置
export interface LegendConfig {
  show: boolean;
  position: 'right' | 'bottom' | 'left' | 'top';
  itemWidth?: number;
  itemHeight?: number;
  spacing?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

// PieChart 專用配置接口
export interface PieChartCoreConfig extends BaseChartCoreConfig {
  // 數據映射
  labelAccessor?: DataKeyOrAccessor<PieChartData, string>;
  valueAccessor?: DataKeyOrAccessor<PieChartData, number>;
  colorAccessor?: DataKeyOrAccessor<PieChartData, string>;
  
  // 圓餅圖形狀
  innerRadius?: number; // 0 = 圓餅圖, >0 = 環形圖
  outerRadius?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  padAngle?: number;
  
  // 視覺樣式
  colors?: string[];
  strokeWidth?: number;
  strokeColor?: string;
  
  // 標籤配置
  labels?: LabelConfig;
  
  // 圖例配置
  legend?: LegendConfig;
  
  // 排序
  sortBy?: 'value' | 'label' | 'none';
  sortOrder?: 'asc' | 'desc';
  
  // 動畫
  animationType?: 'fade' | 'scale' | 'rotate' | 'none';
  
  // 事件處理
  onSegmentClick?: (data: ProcessedPieDataPoint, event: Event) => void;
  onSegmentHover?: (data: ProcessedPieDataPoint | null, event: Event) => void;
  onLegendClick?: (data: ProcessedPieDataPoint, event: Event) => void;
  onLegendHover?: (data: ProcessedPieDataPoint | null, event: Event) => void;
}

// 主要的 PieChart 核心類
export class PieChartCore extends BaseChartCore<PieChartData> {
  private processedData: ProcessedPieDataPoint[] = [];
  private segments: PieSegment[] = [];
  private colorScale: ColorScale | null = null;
  private pieGroup: D3Selection | null = null;
  private legendGroup: D3Selection | null = null;
  private radius: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;

  constructor(
    config: PieChartCoreConfig,
    callbacks?: ChartStateCallbacks<PieChartData>
  ) {
    super(config, callbacks);
  }

  // 實現抽象方法：返回圖表類型
  public getChartType(): string {
    return 'pie-chart';
  }

  // 實現抽象方法：創建比例尺（圓餅圖不需要傳統比例尺，返回空物件）
  protected createScales(): Record<string, any> {
    // 圓餅圖不使用傳統的 x/y 比例尺
    // 所有的計算都是基於角度和半徑
    return {};
  }

  protected processData(): { 
    pie: d3.Pie<any, ProcessedPieDataPoint>;
    arc: d3.Arc<any, d3.DefaultArcObject>;
    data: ProcessedPieDataPoint[] 
  } {
    const config = this.config as PieChartCoreConfig;
    const { data, labelAccessor, valueAccessor, colorAccessor } = config;

    if (!data || data.length === 0) {
      this.processedData = [];
      this.segments = [];
      return {
        pie: d3.pie(),
        arc: d3.arc(),
        data: []
      };
    }
    
    // 處理數據點 - 使用統一的數據存取模式
    const rawProcessedData = data.map((item, index) => {
      // 處理 Label 值
      let label: string;
      if (typeof labelAccessor === 'function') {
        label = labelAccessor(item, index, data);
      } else if (typeof labelAccessor === 'string' || typeof labelAccessor === 'number') {
        label = String(item[labelAccessor]) || `Item ${index + 1}`;
      } else {
        label = String(item.label) || `Item ${index + 1}`;
      }

      // 處理 Value 值
      let value: number;
      if (typeof valueAccessor === 'function') {
        value = valueAccessor(item, index, data);
      } else if (typeof valueAccessor === 'string' || typeof valueAccessor === 'number') {
        value = Number(item[valueAccessor]) || 0;
      } else {
        value = Number(item.value) || 0;
      }

      // 處理 Color 值
      let color: string | undefined;
      if (colorAccessor) {
        if (typeof colorAccessor === 'function') {
          color = colorAccessor(item, index, data);
        } else if (typeof colorAccessor === 'string' || typeof colorAccessor === 'number') {
          color = item[colorAccessor] as string;
        }
      }

      return {
        label,
        value: Math.abs(value), // 確保值為正數
        color,
        originalData: item,
        index
      };
    });

    // 過濾掉值為 0 或負數的項目
    const filteredData = rawProcessedData.filter(d => d.value > 0);

    // 排序處理
    this.applySorting(filteredData);

    // 計算總值和百分比
    const totalValue = d3.sum(filteredData, d => d.value);
    
    this.processedData = filteredData.map(item => ({
      ...item,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      startAngle: 0, // 將由 d3.pie 計算
      endAngle: 0    // 將由 d3.pie 計算
    }));

    // 創建顏色比例尺
    this.createColorScale();

    // 應用顏色
    this.processedData.forEach((item, index) => {
      if (!item.color) {
        item.color = this.colorScale?.getColor(index) || config.colors?.[index % (config.colors?.length || 1)] || '#3b82f6';
      }
    });

    // 創建餅圖生成器
    const pie = d3.pie<ProcessedPieDataPoint>()
      .value(d => d.value)
      .startAngle(config.startAngle || 0)
      .endAngle(config.endAngle || 2 * Math.PI)
      .padAngle(config.padAngle || 0);

    // 計算半徑和中心位置
    this.calculateDimensions();

    // 創建弧形生成器
    const arc = d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
      .innerRadius(config.innerRadius || 0)
      .outerRadius(config.outerRadius || this.radius)
      .cornerRadius(config.cornerRadius || 0);

    return { pie, arc, data: this.processedData };
  }

  private applySorting(data: any[]): void {
    const config = this.config as PieChartCoreConfig;
    
    if (config.sortBy === 'none') return;
    
    const order = config.sortOrder === 'desc' ? -1 : 1;
    
    if (config.sortBy === 'value') {
      data.sort((a, b) => order * (a.value - b.value));
    } else if (config.sortBy === 'label') {
      data.sort((a, b) => order * a.label.localeCompare(b.label));
    }
  }

  private createColorScale(): void {
    const config = this.config as PieChartCoreConfig;
    
    if (config.colors) {
      this.colorScale = createColorScale(config.colors, this.processedData.length);
    }
  }

  private calculateDimensions(): void {
    const config = this.config as PieChartCoreConfig;
    
    // 計算可用空間（考慮圖例位置）
    let availableWidth = this.chartWidth;
    let availableHeight = this.chartHeight;
    
    if (config.legend?.show) {
      if (config.legend.position === 'right' || config.legend.position === 'left') {
        availableWidth *= 0.75; // 為圖例預留空間
      } else {
        availableHeight *= 0.75;
      }
    }
    
    // 計算半徑
    this.radius = config.outerRadius || Math.min(availableWidth, availableHeight) / 2 - 10;
    
    // 計算中心位置
    this.centerX = availableWidth / 2;
    this.centerY = availableHeight / 2;
  }

  protected renderChart(): void {
    if (!this.chartGroup || this.processedData.length === 0) return;

    const config = this.config as PieChartCoreConfig;
    const { pie, arc } = this.processData();

    // 清除之前的內容
    this.chartGroup.selectAll('*').remove();

    // 創建餅圖組
    this.pieGroup = this.chartGroup
      .append('g')
      .attr('class', 'pie-chart-group')
      .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

    // 渲染扇形
    this.renderSegments(pie, arc);

    // 渲染標籤
    if (config.labels?.show) {
      this.renderLabels(pie, arc);
    }

    // 渲染圖例
    if (config.legend?.show) {
      this.renderLegend();
    }
  }

  private renderSegments(
    pie: d3.Pie<any, ProcessedPieDataPoint>,
    arc: d3.Arc<any, d3.DefaultArcObject>
  ): void {
    if (!this.pieGroup) return;

    const config = this.config as PieChartCoreConfig;
    const pieData = pie(this.processedData);

    // 更新處理後的數據的角度信息
    pieData.forEach((d, i) => {
      if (this.processedData[d.index]) {
        this.processedData[d.index].startAngle = d.startAngle;
        this.processedData[d.index].endAngle = d.endAngle;
      }
    });

    const segments = this.pieGroup
      .selectAll<SVGPathElement, d3.PieArcDatum<ProcessedPieDataPoint>>('.pie-segment')
      .data(pieData)
      .join('path')
      .attr('class', 'pie-segment')
      .attr('data-testid', (d, i) => `pie-slice-${i}`) // 添加測試 ID
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', config.strokeColor || 'white')
      .attr('stroke-width', config.strokeWidth || 1)
      .style('cursor', 'pointer');

    // 計算片段信息
    this.segments = pieData.map(d => ({
      data: d.data,
      path: arc(d) || '',
      centroid: arc.centroid(d),
      labelPosition: this.calculateLabelPosition(d, arc),
      arc
    }));

    // 添加交互
    segments
      .on('click', (event, d) => {
        config.onSegmentClick?.(d.data, event);
      })
      .on('mouseenter', (event, d) => {
        // 高亮效果
        d3.select(event.target)
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('transform', () => {
            const centroid = arc.centroid(d);
            return `translate(${centroid[0] * 0.1}, ${centroid[1] * 0.1})`;
          });
        
        config.onSegmentHover?.(d.data, event);
      })
      .on('mouseleave', (event, d) => {
        // 重置效果
        d3.select(event.target)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('transform', 'translate(0, 0)');
        
        config.onSegmentHover?.(null, event);
      });
  }

  private calculateLabelPosition(
    d: d3.PieArcDatum<ProcessedPieDataPoint>,
    arc: d3.Arc<any, d3.DefaultArcObject>
  ): [number, number] {
    const config = this.config as PieChartCoreConfig;
    const centroid = arc.centroid(d);
    
    switch (config.labels?.position) {
      case 'inside':
        return [centroid[0] * 0.6, centroid[1] * 0.6];
      case 'edge':
        return centroid;
      case 'outside':
      default:
        const offset = config.labels?.offset || 1.2;
        return [centroid[0] * offset, centroid[1] * offset];
    }
  }

  private renderLabels(
    pie: d3.Pie<any, ProcessedPieDataPoint>,
    arc: d3.Arc<any, d3.DefaultArcObject>
  ): void {
    if (!this.pieGroup) return;

    const config = this.config as PieChartCoreConfig;
    const labelConfig = config.labels!;
    const pieData = pie(this.processedData);

    const labels = this.pieGroup
      .selectAll<SVGTextElement, d3.PieArcDatum<ProcessedPieDataPoint>>('.pie-label')
      .data(pieData)
      .join('text')
      .attr('class', 'pie-label')
      .attr('transform', d => {
        const pos = this.calculateLabelPosition(d, arc);
        return `translate(${pos[0]}, ${pos[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', labelConfig.fontSize || 12)
      .attr('font-family', labelConfig.fontFamily || 'Arial, sans-serif')
      .attr('fill', labelConfig.color || '#333')
      .text(d => {
        if (labelConfig.format) {
          return labelConfig.format(d.data.value, d.data.percentage, d.data.label);
        }
        return `${d.data.label} (${d.data.percentage.toFixed(1)}%)`;
      });

    // 連接線（用於外部標籤）
    if (labelConfig.position === 'outside' && labelConfig.connector?.show) {
      this.pieGroup
        .selectAll<SVGLineElement, d3.PieArcDatum<ProcessedPieDataPoint>>('.label-connector')
        .data(pieData)
        .join('line')
        .attr('class', 'label-connector')
        .attr('x1', d => arc.centroid(d)[0])
        .attr('y1', d => arc.centroid(d)[1])
        .attr('x2', d => this.calculateLabelPosition(d, arc)[0])
        .attr('y2', d => this.calculateLabelPosition(d, arc)[1])
        .attr('stroke', labelConfig.connector!.color || '#999')
        .attr('stroke-width', labelConfig.connector!.strokeWidth || 1)
        .attr('opacity', 0.6);
    }
  }

  private renderLegend(): void {
    if (!this.chartGroup) return;

    const config = this.config as PieChartCoreConfig;
    const legendConfig = config.legend!;

    // 創建圖例組
    this.legendGroup = this.chartGroup
      .append('g')
      .attr('class', 'pie-legend');

    const itemHeight = legendConfig.itemHeight || 20;
    const spacing = legendConfig.spacing || 5;
    const fontSize = legendConfig.fontSize || 12;

    // 計算圖例位置
    let legendX = 0;
    let legendY = 0;
    
    switch (legendConfig.position) {
      case 'right':
        legendX = this.centerX + this.radius + 20;
        legendY = this.centerY - (this.processedData.length * (itemHeight + spacing)) / 2;
        break;
      case 'bottom':
        legendX = 20;
        legendY = this.chartHeight - this.processedData.length * (itemHeight + spacing) - 10;
        break;
      case 'left':
        legendX = 20;
        legendY = this.centerY - (this.processedData.length * (itemHeight + spacing)) / 2;
        break;
      case 'top':
        legendX = 20;
        legendY = 20;
        break;
    }

    this.legendGroup.attr('transform', `translate(${legendX}, ${legendY})`);

    // 渲染圖例項目
    const legendItems = this.legendGroup
      .selectAll('.legend-item')
      .data(this.processedData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * (itemHeight + spacing)})`)
      .style('cursor', 'pointer');

    // 顏色方塊
    legendItems
      .append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color)
      .attr('rx', 2);

    // 文字標籤
    legendItems
      .append('text')
      .attr('x', 20)
      .attr('y', 6)
      .attr('dy', '0.35em')
      .attr('font-size', fontSize)
      .attr('font-family', legendConfig.fontFamily || 'Arial, sans-serif')
      .attr('fill', legendConfig.color || '#333')
      .text(d => `${d.label} (${d.value})`);

    // 圖例交互
    legendItems
      .on('click', (event, d) => {
        config.onLegendClick?.(d, event);
      })
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.7);
        config.onLegendHover?.(d, event);
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        config.onLegendHover?.(null, event);
      });
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<PieChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedPieDataPoint[] {
    return this.processedData;
  }

  // 公共方法：獲取片段數據
  public getSegments(): PieSegment[] {
    return this.segments;
  }

  // 公共方法：高亮特定片段
  public highlightSegments(labels: string[]): void {
    if (!this.pieGroup) return;

    this.pieGroup
      .selectAll('.pie-segment')
      .attr('opacity', 0.3);

    labels.forEach(label => {
      const index = this.processedData.findIndex(d => d.label === label);
      if (index !== -1) {
        this.pieGroup!
          .selectAll('.pie-segment')
          .filter((d: any) => d.data.label === label)
          .attr('opacity', 1);
      }
    });
  }

  // 公共方法：重置高亮
  public resetHighlight(): void {
    if (!this.pieGroup) return;

    this.pieGroup
      .selectAll('.pie-segment')
      .attr('opacity', 1);
  }

  // 公共方法：切換片段顯示
  public toggleSegment(label: string): void {
    // 這個功能需要重新計算數據，暫時用高亮代替
    const currentData = this.processedData.find(d => d.label === label);
    if (currentData) {
      this.highlightSegments([label]);
    }
  }

  // 公共方法：獲取總值
  public getTotalValue(): number {
    return d3.sum(this.processedData, d => d.value);
  }

  // 公共方法：獲取指定標籤的數據
  public getDataByLabel(label: string): ProcessedPieDataPoint | undefined {
    return this.processedData.find(d => d.label === label);
  }
}