/**
 * FunnelChartCore - 純 JS/TS 的漏斗圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import { 
  scaleOrdinal 
} from '../../../core/d3-utils';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection
} from '../../../core/types';

export interface FunnelChartData extends BaseChartData {
  label?: string;
  value?: number;
  [key: string]: string | number | Date | boolean | null | undefined;
}

export interface FunnelDataPoint {
  label: string;
  value: number;
  originalData: ChartData<FunnelChartData>;
  percentage: number;
  conversionRate?: number;
}

export interface FunnelSegment {
  data: FunnelDataPoint;
  topWidth: number;
  bottomWidth: number;
  height: number;
  x: number;
  y: number;
  path: string;
  color: string;
  index: number;
}

export interface FunnelChartCoreConfig extends BaseChartCoreConfig<FunnelChartData> {
  // 數據存取
  labelKey?: DataKeyOrAccessor<FunnelChartData, string>;
  valueKey?: DataKeyOrAccessor<FunnelChartData, number>;
  
  // 漏斗圖專用配置
  direction?: 'top' | 'bottom' | 'left' | 'right';
  shape?: 'trapezoid' | 'rectangle' | 'curved';
  gap?: number;
  cornerRadius?: number;
  proportionalMode?: 'traditional' | 'equal' | 'custom';
  shrinkageType?: 'percentage' | 'fixed';
  shrinkageAmount?: number;
  minWidth?: number;
  
  // 顯示選項
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  showConversionRates?: boolean;
  labelPosition?: 'side' | 'center' | 'outside';
  
  // 格式化
  valueFormat?: (value: number) => string;
  percentageFormat?: (percentage: number) => string;
  conversionRateFormat?: (rate: number) => string;
  
  // 樣式
  colors?: string[];
  fontSize?: number;
  fontFamily?: string;
  
  // 事件 - 標準命名
  onDataClick?: (data: FunnelDataPoint, event: MouseEvent) => void;
  onDataHover?: (data: FunnelDataPoint | null, event: MouseEvent) => void;
  
  // 向下兼容的廢棄事件 (將在未來版本中移除)
  /** @deprecated 請使用 onDataClick 替代 */
  onSegmentClick?: (data: FunnelDataPoint, event: MouseEvent) => void;
  /** @deprecated 請使用 onDataHover 替代 */
  onSegmentHover?: (data: FunnelDataPoint | null, event: MouseEvent) => void;
  
  // 動畫配置
  animationDelay?: number;
}

export class FunnelChartCore extends BaseChartCore<FunnelChartData> {
  private processedDataPoints: FunnelDataPoint[] = [];
  private segments: FunnelSegment[] = [];
  private colorScale: any;

  constructor(config: FunnelChartCoreConfig, callbacks = {}) {
    super(config, callbacks);
  }

  public getChartType(): string {
    return 'funnel-chart';
  }

  protected processData(): ChartData<FunnelChartData>[] {
    const config = this.config as FunnelChartCoreConfig;
    const { data, labelKey, valueKey } = config;

    if (!data?.length) {
      this.processedDataPoints = [];
      return data;
    }

    // 處理數據點並生成 FunnelDataPoint
    const processedPoints = data.map((datum, index) => {
      let label: string;
      let value: number;

      // 獲取標籤
      if (typeof labelKey === 'function') {
        label = labelKey(datum, index, data);
      } else if (typeof labelKey === 'string' || typeof labelKey === 'number') {
        label = String(datum[labelKey]) || `Item ${index + 1}`;
      } else {
        label = `Item ${index + 1}`;
      }

      // 獲取數值
      if (typeof valueKey === 'function') {
        value = valueKey(datum, index, data);
      } else if (typeof valueKey === 'string' || typeof valueKey === 'number') {
        value = Number(datum[valueKey]) || 0;
      } else {
        // 假設數據本身就是數值
        value = typeof datum === 'number' ? datum : 0;
      }

      return {
        label,
        value,
        originalData: datum,
        percentage: 0, // 稍後計算
        conversionRate: 0 // 稍後計算
      } as FunnelDataPoint;
    });

    // 計算百分比和轉換率
    const totalValue = processedPoints.reduce((sum, d) => sum + d.value, 0);
    
    processedPoints.forEach((d, index) => {
      d.percentage = totalValue > 0 ? (d.value / totalValue) * 100 : 0;
      if (index > 0) {
        const previousValue = processedPoints[index - 1].value;
        d.conversionRate = previousValue > 0 ? (d.value / previousValue) * 100 : 0;
      }
    });

    this.processedDataPoints = processedPoints;
    return data;
  }

  protected createScales(): Record<string, ReturnType<typeof scaleOrdinal>> {
    const config = this.config as FunnelChartCoreConfig;
    const { colors = ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'] } = config;

    this.colorScale = scaleOrdinal<string, string>()
      .domain(this.processedDataPoints.map(d => d.label))
      .range(colors);
      
    return { color: this.colorScale };
  }

  protected renderChart(): void {
    if (!this.validateData()) return;

    const svg = this.createSVGContainer();
    
    // 生成漏斗段
    this.generateFunnelSegments();
    
    // 渲染漏斗段
    this.renderFunnelSegments(svg);
    
    // 渲染標籤
    this.renderLabels(svg);
  }

  private generateFunnelSegments(): void {
    const config = this.config as FunnelChartCoreConfig;
    const {
      direction: _direction = 'top',
      gap = 4,
      proportionalMode = 'traditional',
      shrinkageType: _shrinkageType = 'percentage',
      shrinkageAmount = 0.1,
      minWidth = 50
    } = config;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const segmentCount = this.processedDataPoints.length;
    
    if (segmentCount === 0) {
      this.segments = [];
      return;
    }

    const totalGap = (segmentCount - 1) * gap;
    const segmentHeight = (chartHeight - totalGap) / segmentCount;
    
    // 計算最大值
    const maxValue = Math.max(...this.processedDataPoints.map(d => d.value));
    
    this.segments = this.processedDataPoints.map((data, index) => {
      let topWidth: number, bottomWidth: number;
      
      if (proportionalMode === 'traditional') {
        // 基於數值比例計算寬度
        const ratio = data.value / maxValue;
        topWidth = Math.max(chartWidth * ratio, minWidth);
        
        // 下一段的寬度
        if (index < segmentCount - 1) {
          const nextRatio = this.processedDataPoints[index + 1].value / maxValue;
          bottomWidth = Math.max(chartWidth * nextRatio, minWidth);
        } else {
          bottomWidth = Math.max(topWidth * (1 - shrinkageAmount), minWidth);
        }
      } else {
        // 等寬模式
        topWidth = chartWidth;
        bottomWidth = Math.max(chartWidth * (1 - shrinkageAmount), minWidth);
      }

      const y = index * (segmentHeight + gap);
      const x = (chartWidth - topWidth) / 2;

      // 生成路徑
      const path = this.generateSegmentPath(
        x, y, topWidth, bottomWidth, segmentHeight, config.cornerRadius || 0
      );

      return {
        data,
        topWidth,
        bottomWidth,
        height: segmentHeight,
        x,
        y,
        path,
        color: String(this.colorScale(data.label)),
        index
      };
    });
  }

  private generateSegmentPath(
    x: number,
    y: number,
    topWidth: number,
    bottomWidth: number,
    height: number,
    cornerRadius: number
  ): string {
    const config = this.config as FunnelChartCoreConfig;
    const { shape = 'trapezoid' } = config;
    
    if (shape === 'rectangle') {
      return `M ${x} ${y} L ${x + topWidth} ${y} L ${x + topWidth} ${y + height} L ${x} ${y + height} Z`;
    }

    // 梯形路徑
    const bottomX = x + (topWidth - bottomWidth) / 2;
    
    if (cornerRadius > 0) {
      // 帶圓角的梯形
      return `M ${x + cornerRadius} ${y} 
              L ${x + topWidth - cornerRadius} ${y} 
              Q ${x + topWidth} ${y} ${x + topWidth} ${y + cornerRadius}
              L ${bottomX + bottomWidth} ${y + height - cornerRadius}
              Q ${bottomX + bottomWidth} ${y + height} ${bottomX + bottomWidth - cornerRadius} ${y + height}
              L ${bottomX + cornerRadius} ${y + height}
              Q ${bottomX} ${y + height} ${bottomX} ${y + height - cornerRadius}
              L ${x} ${y + cornerRadius}
              Q ${x} ${y} ${x + cornerRadius} ${y} Z`;
    }

    return `M ${x} ${y} L ${x + topWidth} ${y} L ${bottomX + bottomWidth} ${y + height} L ${bottomX} ${y + height} Z`;
  }

  private renderFunnelSegments(container: D3Selection<SVGGElement>): void {
    const config = this.config as FunnelChartCoreConfig;
    const { animate = true, animationDuration = 800, interactive = true } = config;

    const segments = container.selectAll('.funnel-segment')
      .data(this.segments)
      .enter()
      .append('path')
      .attr('class', 'funnel-segment')
      .attr('d', (_d: FunnelSegment) => _d.path)
      .attr('fill', (_d: FunnelSegment) => _d.color)
      .attr('stroke', 'var(--funnel-chart-segment-stroke, rgba(255, 255, 255, 0.8))')
      .attr('stroke-width', 1)
      .style('cursor', interactive ? 'pointer' : 'default');

    // 添加動畫
    if (animate) {
      segments
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((_d, i) => i * (config.animationDelay || 100))
        .attr('opacity', 1);
    }

    // 添加交互事件
    if (interactive) {
      segments
        .on('click', (event, d: FunnelSegment) => {
          // 優先使用新的事件處理器，向下兼容舊的
          config.onDataClick?.(d.data, event);
          config.onSegmentClick?.(d.data, event); // 向下兼容
        })
        .on('mouseover', (event, d: FunnelSegment) => {
          // 優先使用新的事件處理器，向下兼容舊的
          config.onDataHover?.(d.data, event);
          config.onSegmentHover?.(d.data, event); // 向下兼容

          // 計算相對於圖表容器的座標（修復 tooltip 偏移問題）
          if (this.containerElement) {
            const containerRect = this.containerElement.getBoundingClientRect();
            const tooltipX = event.clientX - containerRect.left;
            const tooltipY = event.clientY - containerRect.top;

            this.showTooltip(tooltipX, tooltipY, this.formatTooltipContent(d.data));
          }
        })
        .on('mouseout', (event) => {
          // 優先使用新的事件處理器，向下兼容舊的
          config.onDataHover?.(null, event);
          config.onSegmentHover?.(null, event); // 向下兼容
          this.hideTooltip();
        });
    }
  }

  private renderLabels(container: D3Selection<SVGGElement>): void {
    const config = this.config as FunnelChartCoreConfig;
    const {
      showLabels = true,
      showValues = true,
      showPercentages = true,
      showConversionRates: _showConversionRates = true,
      labelPosition = 'side',
      fontSize = 12,
      fontFamily = 'sans-serif'
    } = config;

    if (!showLabels) return;

    const { chartWidth } = this.getChartDimensions();
    const labelGroup = container.append('g').attr('class', 'funnel-labels');

    this.segments.forEach(segment => {
      const { data, x, y, topWidth, height } = segment;

      let labelX: number, labelY: number, textAnchor: string;

      if (labelPosition === 'side') {
        // 計算標籤可用空間，確保不溢出
        const rightSpace = chartWidth - (x + topWidth);
        const minLabelSpace = 100; // 標籤最小需要空間

        if (rightSpace >= minLabelSpace) {
          // 有足夠空間放在右側
          labelX = x + topWidth + 10;
          textAnchor = 'start';
        } else {
          // 空間不足，放在漏斗內部居中
          labelX = x + topWidth / 2;
          textAnchor = 'middle';
        }
        labelY = y + height / 2;
      } else {
        labelX = x + topWidth / 2;
        labelY = y + height / 2;
        textAnchor = 'middle';
      }

      // 主標籤
      labelGroup.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', textAnchor)
        .attr('dominant-baseline', 'middle')
        .style('font-size', `${fontSize}px`)
        .style('font-family', fontFamily)
        .style('font-weight', '600')
        .style('fill', 'var(--funnel-chart-text, #374151)')
        .text(data.label);

      // 數值標籤
      if (showValues) {
        const valueText = config.valueFormat ? config.valueFormat(data.value) : data.value.toString();
        labelGroup.append('text')
          .attr('x', labelX)
          .attr('y', labelY + fontSize + 2)
          .attr('text-anchor', textAnchor)
          .attr('dominant-baseline', 'middle')
          .style('font-size', `${fontSize - 2}px`)
          .style('font-family', fontFamily)
          .style('fill', 'var(--funnel-chart-text-muted, #6b7280)')
          .text(valueText);
      }

      // 百分比標籤
      if (showPercentages) {
        const percentageText = config.percentageFormat ?
          config.percentageFormat(data.percentage) :
          `${data.percentage.toFixed(1)}%`;

        labelGroup.append('text')
          .attr('x', labelX)
          .attr('y', labelY + (fontSize + 2) * (showValues ? 2 : 1))
          .attr('text-anchor', textAnchor)
          .attr('dominant-baseline', 'middle')
          .style('font-size', `${fontSize - 2}px`)
          .style('font-family', fontFamily)
          .style('fill', 'var(--funnel-chart-text-light, #9ca3af)')
          .text(percentageText);
      }
    });
  }

  private formatTooltipContent(data: FunnelDataPoint): string {
    const config = this.config as FunnelChartCoreConfig;

    if (config.valueFormat) {
      return `${data.label}: ${config.valueFormat(data.value)}`;
    }

    return `${data.label}: ${data.value}`;
  }

  // 公開 API
  public getFunnelDataPoints(): FunnelDataPoint[] {
    return [...this.processedDataPoints];
  }

  public getSegments(): FunnelSegment[] {
    return [...this.segments];
  }
}