/**
 * GaugeChartCore - 純 JS/TS 的量表圖核心實現
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

// GaugeChart 專用數據接口
export interface GaugeChartData extends BaseChartData {
  value?: number;
  label?: string;
  [key: string]: any;
}

// 處理後的量表數據點
export interface ProcessedGaugeDataPoint {
  value: number;
  label?: string;
  originalData: ChartData<GaugeChartData>;
}

// 量表區域配置
export interface GaugeZone {
  min: number;
  max: number;
  color: string;
}

// 刻度數據
export interface TickData {
  value: number;
  angle: number;
  label: string;
}

// GaugeChart 專用配置接口
export interface GaugeChartCoreConfig extends BaseChartCoreConfig {
  // 數據映射
  valueAccessor?: DataKeyOrAccessor<GaugeChartData, number>;
  labelAccessor?: DataKeyOrAccessor<GaugeChartData, string>;
  
  // 量表範圍
  min?: number;
  max?: number;
  value?: number; // 直接指定值（不使用數據）
  
  // 角度設定
  startAngle?: number; // 起始角度（度）
  endAngle?: number;   // 結束角度（度）
  
  // 半徑設定
  innerRadius?: number;
  outerRadius?: number;
  
  // 視覺樣式
  backgroundColor?: string;
  foregroundColor?: string;
  colors?: string[];
  zones?: GaugeZone[]; // 區域劃分
  cornerRadius?: number;
  
  // 指針樣式
  needleColor?: string;
  needleWidth?: number;
  centerCircleRadius?: number;
  centerCircleColor?: string;
  
  // 標籤和刻度
  showValue?: boolean;
  showLabel?: boolean;
  showTicks?: boolean;
  showMinMax?: boolean;
  tickCount?: number;
  tickFormat?: (value: number) => string;
  fontSize?: number;
  fontFamily?: string;
  
  // 動畫
  animationType?: 'sweep' | 'bounce' | 'elastic' | 'none';
  animationEasing?: string;
  
  // 交互
  tooltipFormat?: (value: number, label?: string) => string;
  
  // 事件處理
  onGaugeClick?: (data: ProcessedGaugeDataPoint, event: Event) => void;
  onGaugeHover?: (data: ProcessedGaugeDataPoint | null, event: Event) => void;
}

// 主要的 GaugeChart 核心類
export class GaugeChartCore extends BaseChartCore<GaugeChartData> {
  private processedData: ProcessedGaugeDataPoint = { value: 0, originalData: {} as any };
  private scales: Record<string, any> = {};
  private arcGenerator: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private colorScale: ColorScale | null = null;
  private gaugeGroup: D3Selection | null = null;

  constructor(
    config: GaugeChartCoreConfig,
    callbacks?: ChartStateCallbacks<GaugeChartData>
  ) {
    super(config, callbacks);
  }

  // 實現抽象方法：返回圖表類型
  public getChartType(): string {
    return 'gauge-chart';
  }

  // 實現抽象方法：創建比例尺
  protected createScales(): Record<string, any> {
    const config = this.config as GaugeChartCoreConfig;
    const { 
      min = 0, 
      max = 100, 
      startAngle = -90, 
      endAngle = 90,
      innerRadius, 
      outerRadius,
      colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e'],
      zones,
      cornerRadius = 0,
      showTicks = true,
      showMinMax = true
    } = config;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();

    const labelSpace = showTicks || showMinMax ? 40 : 20;
    const availableRadius = Math.min(chartWidth / 2, chartHeight) - labelSpace;
    const calculatedOuterRadius = outerRadius || Math.max(50, availableRadius);
    const calculatedInnerRadius = innerRadius || calculatedOuterRadius * 0.7;

    const startAngleRad = (startAngle) * Math.PI / 180;
    const endAngleRad = (endAngle) * Math.PI / 180;

    const angleScale = d3.scaleLinear().domain([min, max]).range([startAngleRad, endAngleRad]);

    // 創建顏色比例尺
    let colorScale: any = null;
    if (!zones) {
      try {
        this.colorScale = createColorScale({
          type: 'custom',
          colors: colors,
          domain: [min, max],
          interpolate: true
        });
        colorScale = this.colorScale;
      } catch (error) {
        // 使用原來的 D3 實現作為備案
        colorScale = d3.scaleLinear<string>()
          .domain(d3.range(colors.length).map(i => min + (max - min) * i / (colors.length - 1)))
          .range(colors);
      }
    }

    this.scales = {
      angleScale,
      colorScale,
      chartWidth,
      chartHeight,
      calculatedInnerRadius,
      calculatedOuterRadius,
      startAngleRad,
      endAngleRad
    };

    // 創建弧形生成器
    this.arcGenerator = d3.arc()
      .innerRadius(calculatedInnerRadius)
      .outerRadius(calculatedOuterRadius)
      .cornerRadius(cornerRadius);

    return this.scales;
  }

  protected processData(): ProcessedGaugeDataPoint[] {
    const config = this.config as GaugeChartCoreConfig;
    const { data, value, min = 0, max = 100, valueAccessor, labelAccessor } = config;
    
    let processedValue = value !== undefined ? value : 0;
    let processedLabel: string | undefined;

    if (data && data.length > 0) {
      const firstItem = data[0];
      
      // 處理 Value 值
      if (typeof valueAccessor === 'function') {
        processedValue = valueAccessor(firstItem, 0, data);
      } else if (typeof valueAccessor === 'string' || typeof valueAccessor === 'number') {
        processedValue = Number(firstItem[valueAccessor]) || 0;
      } else {
        processedValue = Number(firstItem.value) || 0;
      }
      
      // 處理 Label 值
      if (typeof labelAccessor === 'function') {
        processedLabel = labelAccessor(firstItem, 0, data);
      } else if (typeof labelAccessor === 'string' || typeof labelAccessor === 'number') {
        processedLabel = String(firstItem[labelAccessor]);
      } else {
        processedLabel = String(firstItem.label);
      }
    }

    // 確保數值在範圍內
    processedValue = Math.max(min, Math.min(max, processedValue));
    
    this.processedData = {
      value: processedValue,
      label: processedLabel,
      originalData: data?.[0] || { value: processedValue } as any
    };

    return [this.processedData];
  }

  private calculateTickData(): TickData[] {
    const config = this.config as GaugeChartCoreConfig;
    const { min = 0, max = 100, tickCount = 5, tickFormat, showTicks = true, showMinMax = true } = config;
    const { angleScale } = this.scales;
    
    if (!showTicks) return [];
    
    return d3.range(tickCount).map(i => {
      const tickValue = min + (max - min) * i / (tickCount - 1);
      const visualAngle = angleScale(tickValue) - Math.PI / 2; // 減去 90 度來轉換到視覺座標系
      return { 
        value: tickValue, 
        angle: visualAngle, 
        label: tickFormat ? tickFormat(tickValue) : tickValue.toString() 
      };
    }).filter(tick => {
      // 如果顯示 MinMax 標籤，則從 tick 中排除最小值和最大值，避免重複
      if (showMinMax) {
        return tick.value !== min && tick.value !== max;
      }
      return true;
    });
  }

  protected renderChart(): void {
    // 創建 SVG 容器和圖表組
    this.chartGroup = this.createSVGContainer();

    const config = this.config as GaugeChartCoreConfig;

    // 使用已處理的數據（由 BaseChartCore.initialize() 呼叫 processData() 設置）
    if (!this.processedData || typeof this.processedData.value !== 'number') {
      this.chartGroup.selectAll('*').remove();
      return;
    }

    // 清除之前的內容
    this.chartGroup.selectAll('*').remove();

    // 創建量表組
    this.gaugeGroup = this.chartGroup
      .append('g')
      .attr('class', 'gauge-chart-group');

    this.renderGauge();
  }

  private renderGauge(): void {
    if (!this.gaugeGroup || !this.scales) return;

    const config = this.config as GaugeChartCoreConfig;
    const {
      backgroundColor = '#e5e7eb',
      foregroundColor = '#3b82f6',
      zones,
      needleColor = '#374151',
      needleWidth = 3,
      centerCircleRadius = 8,
      centerCircleColor = '#374151',
      showValue = true,
      showLabel = true,
      showTicks = true,
      showMinMax = true,
      fontSize = 14,
      fontFamily = 'sans-serif',
      animate = true,
      animationDuration = 1000,
      animationEasing = 'easeElasticOut',
      min = 0,
      max = 100,
      tickFormat
    } = config;

    const {
      angleScale,
      colorScale,
      chartWidth,
      chartHeight,
      calculatedInnerRadius,
      calculatedOuterRadius,
      startAngleRad,
      endAngleRad
    } = this.scales;

    const centerX = chartWidth / 2;
    const centerY = Math.max(calculatedOuterRadius + 20, chartHeight - calculatedOuterRadius - 20);

    // 設定量表組的位置
    this.gaugeGroup.attr('transform', `translate(${centerX}, ${centerY})`);

    // 背景弧線
    const backgroundArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: endAngleRad });
    if (backgroundArc) {
      this.gaugeGroup
        .append('path')
        .attr('d', backgroundArc)
        .attr('fill', backgroundColor)
        .attr('stroke', 'none');
    }

    // 區域或數值弧線
    if (zones) {
      zones.forEach((zone, i) => {
        const zoneStartAngle = angleScale(Math.max(zone.min, min));
        const zoneEndAngle = angleScale(Math.min(zone.max, max));
        const zoneArc = this.arcGenerator!({ startAngle: zoneStartAngle, endAngle: zoneEndAngle });
        if (zoneArc) {
          this.gaugeGroup!
            .append('path')
            .attr('d', zoneArc)
            .attr('fill', zone.color)
            .attr('stroke', 'none');
        }
      });
    } else {
      const valueAngle = angleScale(this.processedData.value);
      const valueArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: valueAngle });
      if (valueArc) {
        const valueColor = colorScale ?
          (typeof colorScale.getColor === 'function' ?
            colorScale.getColor(this.processedData.value) :
            colorScale(this.processedData.value)) :
          foregroundColor;

        const valuePath = this.gaugeGroup!
          .append('path')
          .attr('d', valueArc)
          .attr('fill', valueColor)
          .attr('stroke', 'none');

        if (animate) {
          const initialArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: startAngleRad });
          if (initialArc) {
            valuePath
              .attr('d', initialArc)
              .transition()
              .duration(animationDuration * 1.5)
              .ease(d3.easeCubicOut)
              .attrTween('d', () => {
                const interpolate = d3.interpolate(startAngleRad, valueAngle);
                return (t: number) => this.arcGenerator!({ startAngle: startAngleRad, endAngle: interpolate(t) }) || '';
              });
          }
        }
      }
    }

    // 指針
    this.renderNeedle(animate, animationDuration);

    // 中心圓
    this.gaugeGroup
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', centerCircleRadius)
      .attr('fill', centerCircleColor);

    // 刻度
    if (showTicks) {
      this.renderTicks();
    }

    // 最小值和最大值標籤
    if (showMinMax) {
      this.renderMinMaxLabels();
    }

    // 添加互動功能
    this.setupInteractions();
  }

  private renderNeedle(animate: boolean, animationDuration: number): void {
    const config = this.config as GaugeChartCoreConfig;
    const { needleColor = '#374151', needleWidth = 3, min = 0 } = config;
    const { angleScale, calculatedOuterRadius } = this.scales;

    const needleLength = calculatedOuterRadius + 10;
    const targetAngleDegrees = angleScale(this.processedData.value) * 180 / Math.PI;

    // 創建指針組
    const needleGroup = this.gaugeGroup!
      .append('g')
      .attr('class', 'needle-group');

    // 創建垂直向上的指針
    needleGroup
      .append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', -needleLength)
      .attr('stroke', needleColor)
      .attr('stroke-width', needleWidth)
      .attr('stroke-linecap', 'round');

    if (animate) {
      const minValueAngleDegrees = angleScale(min) * 180 / Math.PI;
      needleGroup
        .attr('transform', `rotate(${minValueAngleDegrees})`)
        .transition()
        .duration(animationDuration * 1.2)
        .ease(d3.easeCubicOut)
        .attr('transform', `rotate(${targetAngleDegrees})`);
    } else {
      needleGroup.attr('transform', `rotate(${targetAngleDegrees})`);
    }
  }

  private renderTicks(): void {
    const config = this.config as GaugeChartCoreConfig;
    const { fontSize = 14, fontFamily = 'sans-serif' } = config;
    const { calculatedOuterRadius } = this.scales;

    const tickData = this.calculateTickData();
    const ticks = this.gaugeGroup!
      .selectAll('.tick')
      .data(tickData)
      .enter()
      .append('g')
      .attr('class', 'tick');

    ticks
      .append('line')
      .attr('x1', d => Math.cos(d.angle) * (calculatedOuterRadius + 5))
      .attr('y1', d => Math.sin(d.angle) * (calculatedOuterRadius + 5))
      .attr('x2', d => Math.cos(d.angle) * (calculatedOuterRadius + 15))
      .attr('y2', d => Math.sin(d.angle) * (calculatedOuterRadius + 15))
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1);

    ticks
      .append('text')
      .attr('x', d => Math.cos(d.angle) * (calculatedOuterRadius + 25))
      .attr('y', d => Math.sin(d.angle) * (calculatedOuterRadius + 25))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', `${fontSize - 2}px`)
      .style('font-family', fontFamily)
      .style('fill', '#6b7280')
      .text(d => d.label);
  }

  private renderMinMaxLabels(): void {
    const config = this.config as GaugeChartCoreConfig;
    const { min = 0, max = 100, tickFormat, fontSize = 14, fontFamily = 'sans-serif' } = config;
    const { calculatedOuterRadius, startAngleRad, endAngleRad } = this.scales;

    const minAngle = startAngleRad - Math.PI / 2;
    const maxAngle = endAngleRad - Math.PI / 2;
    const labelRadius = calculatedOuterRadius + 35;

    // Min 標記線
    this.gaugeGroup!
      .append('line')
      .attr('x1', Math.cos(minAngle) * (calculatedOuterRadius + 5))
      .attr('y1', Math.sin(minAngle) * (calculatedOuterRadius + 5))
      .attr('x2', Math.cos(minAngle) * (calculatedOuterRadius + 15))
      .attr('y2', Math.sin(minAngle) * (calculatedOuterRadius + 15))
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1);

    // Max 標記線
    this.gaugeGroup!
      .append('line')
      .attr('x1', Math.cos(maxAngle) * (calculatedOuterRadius + 5))
      .attr('y1', Math.sin(maxAngle) * (calculatedOuterRadius + 5))
      .attr('x2', Math.cos(maxAngle) * (calculatedOuterRadius + 15))
      .attr('y2', Math.sin(maxAngle) * (calculatedOuterRadius + 15))
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1);

    // Min 文字標籤
    this.gaugeGroup!
      .append('text')
      .attr('x', Math.cos(minAngle) * labelRadius)
      .attr('y', Math.sin(minAngle) * labelRadius)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', `${fontSize - 2}px`)
      .style('font-family', fontFamily)
      .style('fill', '#6b7280')
      .text(tickFormat ? tickFormat(min) : min.toString());

    // Max 文字標籤
    this.gaugeGroup!
      .append('text')
      .attr('x', Math.cos(maxAngle) * labelRadius)
      .attr('y', Math.sin(maxAngle) * labelRadius)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', `${fontSize - 2}px`)
      .style('font-family', fontFamily)
      .style('fill', '#6b7280')
      .text(tickFormat ? tickFormat(max) : max.toString());
  }

  private setupInteractions(): void {
    const config = this.config as GaugeChartCoreConfig;
    const { interactive = true, showTooltip = true, onGaugeClick, onGaugeHover } = config;

    if (!interactive) return;

    // 為量表區域添加交互
    const interactiveElements = this.gaugeGroup!
      .selectAll('path, .needle-group')
      .style('cursor', 'pointer');

    interactiveElements
      .on('click', (event) => {
        onGaugeClick?.(this.processedData, event);
      })
      .on('mouseenter', (event) => {
        onGaugeHover?.(this.processedData, event);
        if (showTooltip) {
          this.showTooltip(event);
        }
      })
      .on('mouseleave', (event) => {
        onGaugeHover?.(null, event);
        if (showTooltip) {
          this.hideTooltip();
        }
      });
  }

  private showTooltip(event: Event): void {
    const config = this.config as GaugeChartCoreConfig;
    const { tooltipFormat } = config;

    let content = `Value: ${this.processedData.value}`;
    if (this.processedData.label) {
      content += `<br>Label: ${this.processedData.label}`;
    }

    if (tooltipFormat) {
      const formattedContent = tooltipFormat(this.processedData.value, this.processedData.label);
      content = typeof formattedContent === 'string' ? formattedContent : content;
    }

    // 創建簡單的 tooltip（實際應用中可以使用更完善的 tooltip 系統）
    const tooltip = d3.select('body')
      .selectAll('.gauge-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'gauge-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('opacity', '1');

    tooltip.html(content);

    const mouseEvent = event as MouseEvent;
    tooltip
      .style('left', (mouseEvent.pageX + 10) + 'px')
      .style('top', (mouseEvent.pageY - 10) + 'px');
  }

  private hideTooltip(): void {
    d3.select('.gauge-tooltip').remove();
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<GaugeChartCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.renderChart();
  }

  // 公共方法：獲取當前數據
  public getCurrentData(): ProcessedGaugeDataPoint {
    return this.processedData;
  }

  // 公共方法：設置新的值
  public setValue(newValue: number, animate: boolean = true): void {
    const config = this.config as GaugeChartCoreConfig;
    const { min = 0, max = 100 } = config;
    
    const clampedValue = Math.max(min, Math.min(max, newValue));
    this.processedData.value = clampedValue;
    
    if (animate) {
      this.renderChart();
    } else {
      const tempAnimate = config.animate;
      this.config = { ...this.config, animate: false };
      this.renderChart();
      this.config = { ...this.config, animate: tempAnimate };
    }
  }
}