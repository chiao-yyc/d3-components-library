/**
 * ExactFunnelChartCore - 流線型漏斗圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection
} from '../../../core/types';

export interface ExactFunnelChartData extends BaseChartData {
  step?: number;
  value?: number;
  label?: string;
  [key: string]: string | number | Date | boolean | null | undefined;
}

export interface ExactFunnelDataPoint {
  step: number;
  value: number;
  label: string;
  originalData: ChartData<ExactFunnelChartData>;
  percentage: number;
  conversionRate?: number;
}

export interface ExactFunnelChartCoreConfig extends BaseChartCoreConfig<ExactFunnelChartData> {
  // 數據存取
  stepKey?: DataKeyOrAccessor<ExactFunnelChartData, number>;
  valueKey?: DataKeyOrAccessor<ExactFunnelChartData, number>;
  labelKey?: DataKeyOrAccessor<ExactFunnelChartData, string>;
  
  // 視覺配置
  background?: string;
  gradient1?: string;
  gradient2?: string;
  values?: string;
  labels?: string;
  percentages?: string;
  showBorder?: boolean;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: number;
  labelFontSize?: number;
  percentageFontSize?: number;
  
  // 事件處理 - 標準命名
  onDataClick?: (data: ExactFunnelDataPoint, event: MouseEvent) => void;
  onDataHover?: (data: ExactFunnelDataPoint | null, event: MouseEvent) => void;
  
  // 動畫配置
  animationDelay?: number;
}

export class ExactFunnelChartCore extends BaseChartCore<ExactFunnelChartData> {
  private processedDataPoints: ExactFunnelDataPoint[] = [];
  private upperPoints: Array<[number, number]> = [];
  private lowerPoints: Array<[number, number]> = [];
  protected scales: Record<string, any> = {};
  protected config: ExactFunnelChartCoreConfig;

  constructor(config: ExactFunnelChartCoreConfig, callbacks = {}) {
    super(config, callbacks);
    this.config = config;
  }

  public getChartType(): string {
    return 'exact-funnel-chart';
  }

  protected processData(): ChartData<ExactFunnelChartData>[] {
    const config = this.config;
    const { data, stepKey, valueKey, labelKey } = config;

    if (!data?.length) {
      this.processedDataPoints = [];
      return data;
    }

    // 處理數據點並生成 ExactFunnelDataPoint
    const processedPoints = data.map((datum, index) => {
      let step: number;
      let value: number;
      let label: string;

      // 獲取步驟
      if (typeof stepKey === 'function') {
        step = stepKey(datum, index, data);
      } else if (typeof stepKey === 'string' || typeof stepKey === 'number') {
        step = Number(datum[stepKey]) || (index + 1);
      } else {
        step = index + 1;
      }

      // 獲取數值
      if (typeof valueKey === 'function') {
        value = valueKey(datum, index, data);
      } else if (typeof valueKey === 'string' || typeof valueKey === 'number') {
        value = Number(datum[valueKey]) || 0;
      } else {
        value = typeof datum === 'number' ? datum : 0;
      }

      // 獲取標籤
      if (typeof labelKey === 'function') {
        label = labelKey(datum, index, data);
      } else if (typeof labelKey === 'string' || typeof labelKey === 'number') {
        label = String(datum[labelKey]) || `Step ${step}`;
      } else {
        label = `Step ${step}`;
      }

      return {
        step,
        value,
        label,
        originalData: datum,
        percentage: 0, // 稍後計算
        conversionRate: 0 // 稍後計算
      } as ExactFunnelDataPoint;
    });

    // 計算百分比和轉換率
    const values = processedPoints.map(d => d.value).filter(v => !isNaN(v) && v >= 0);
    const maxValue = values.length > 0 ? Math.max(...values) : 1;
    
    processedPoints.forEach((d, index) => {
      // 確保數值是有效的
      if (isNaN(d.value) || d.value < 0) {
        d.value = 0;
      }
      
      d.percentage = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
      if (index > 0) {
        const previousValue = processedPoints[index - 1].value;
        d.conversionRate = previousValue > 0 ? (d.value / previousValue) * 100 : 0;
      }
    });

    this.processedDataPoints = processedPoints;
    
    // 調試日誌
    console.log('ExactFunnelChart processed data:', {
      original: data,
      processed: processedPoints,
      accessors: { stepKey, valueKey, labelKey },
      maxValue
    });
    
    return data;
  }

  protected createScales(): Record<string, any> {
    const { chartWidth } = this.getChartDimensions();
    const dataLength = this.processedDataPoints.length;
    
    // X 軸比例尺
    const xScale = d3.scaleLinear()
      .domain([0, dataLength - 1])
      .range([0, chartWidth]);
      
    return { xScale };
  }

  protected renderChart(): void {
    if (!this.validateData()) return;

    // 創建比例尺
    this.scales = this.createScales();
    
    const svg = this.createSVGContainer();
    this.generateFunnelShape(svg);
    this.renderLabels(svg);
  }

  private generateFunnelShape(container: D3Selection<SVGGElement>): void {
    const config = this.config;
    const { 
      gradient1 = '#FF6B6B', 
      gradient2 = '#4ECDC4',
      background = '#2a2a2a',
      animate = true,
      animationDuration = 1000
    } = config;
    
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const xScale = this.scales?.xScale as d3.ScaleLinear<number, number>;
    
    if (!xScale) {
      console.error('xScale not found in scales');
      return;
    }
    
    // 設置容器背景
    container.style('background-color', background);
    
    // 計算漏斗各點的位置
    const values = this.processedDataPoints.map(d => d.value).filter(v => !isNaN(v) && v >= 0);
    const maxValue = values.length > 0 ? Math.max(...values) : 1; // 防止除以0錯誤
    
    // 檢查是否有有效數據 (至少一個非零值)
    if (values.length === 0 || values.every(v => v === 0)) {
      console.warn('No valid data points for funnel rendering');
      // 顯示無數據提示
      container.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .style('font-size', '14px')
        .text('No data to display');
      return;
    }
    
    // 驗證尺寸有效性
    if (!chartWidth || !chartHeight || chartWidth <= 0 || chartHeight <= 0) {
      console.error('Invalid chart dimensions:', { chartWidth, chartHeight });
      return;
    }
    
    // 生成上下邊界的點
    this.upperPoints = [];
    this.lowerPoints = [];
    
    this.processedDataPoints.forEach((d, i) => {
      const x = xScale(i);
      
      // 確保 x 值有效
      if (isNaN(x)) {
        console.error('Invalid x value for point', i, d);
        return;
      }
      
      const ratio = Math.sqrt(d.value / maxValue);
      const halfWidth = ratio * chartWidth * 0.4; // 控制漏斗最大寬度
      
      // 確保計算出的值有效
      if (isNaN(halfWidth)) {
        console.error('Invalid halfWidth calculation', { ratio, chartWidth, value: d.value, maxValue });
        return;
      }
      
      // 上邊界點（中心線上方）
      this.upperPoints.push([x, chartHeight * 0.5 - halfWidth]);
      // 下邊界點（中心線下方）  
      this.lowerPoints.push([x, chartHeight * 0.5 + halfWidth]);
    });

    // 創建漸變
    const defs = container.select('defs').empty() ? container.append('defs') : container.select('defs');
    const gradientId = `funnel-gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    gradient.selectAll('stop')
      .data([
        { offset: '0%', color: gradient1 },
        { offset: '100%', color: gradient2 }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // 確保有足夠的點來繪製漏斗
    if (this.upperPoints.length === 0 || this.lowerPoints.length === 0) {
      console.error('No valid points calculated for funnel');
      return;
    }

    // 使用 D3 的 area 生成器來創建漏斗形狀
    const areaGen = d3.area<ExactFunnelChartData>()
      .x((_d, i) => xScale(i))
      .y0((_d, i) => this.upperPoints[i] ? this.upperPoints[i][1] : 0)  // 上邊界，帶安全檢查
      .y1((_d, i) => this.lowerPoints[i] ? this.lowerPoints[i][1] : 0)  // 下邊界，帶安全檢查
      .curve(d3.curveCatmullRom.alpha(0.5));

    const funnelPath = areaGen(this.processedDataPoints.map(d => d.originalData));

    // 檢查生成的路徑是否有效
    if (!funnelPath || funnelPath.includes('NaN')) {
      console.error('Invalid funnel path generated:', funnelPath);
      return;
    }

    // 繪製漏斗主體
    const funnelShape = container.append('path')
      .attr('d', funnelPath)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', 'none');

    // 添加動畫效果
    if (animate) {
      funnelShape
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .attr('opacity', 1);
    }

    // 添加交互事件
    if (config.interactive) {
      funnelShape
        .style('cursor', 'pointer')
        .on('click', (event) => {
          // 這裡可以根據點擊位置判斷具體的數據點
          const firstPoint = this.processedDataPoints[0];
          config.onDataClick?.(firstPoint, event);
        })
        .on('mouseover', (event) => {
          const firstPoint = this.processedDataPoints[0];
          config.onDataHover?.(firstPoint, event);
          
          // 計算相對於圖表容器的座標（修復 tooltip 偏移問題）
          const containerRect = this.containerElement?.getBoundingClientRect();
          if (containerRect) {
            const tooltipX = event.clientX - containerRect.left;
            const tooltipY = event.clientY - containerRect.top;
            this.showTooltip(tooltipX, tooltipY, this.formatTooltipContent(firstPoint));
          }
        })
        .on('mouseout', (event) => {
          config.onDataHover?.(null, event);
          this.hideTooltip();
        });
    }
  }

  private renderLabels(container: D3Selection<SVGGElement>): void {
    const config = this.config;
    const {
      values = '#ffffff',
      labels = '#cccccc',
      percentages = '#888888',
      fontSize = 22,
      labelFontSize = 14,
      percentageFontSize = 18,
      fontFamily = 'Inter, system-ui, -apple-system, sans-serif',
      animate = true,
      animationDuration = 1000
    } = config;

    const xScale = this.scales?.xScale as d3.ScaleLinear<number, number>;
    const formatter = d3.format(',');

    if (!xScale) {
      console.error('xScale not found in scales');
      return;
    }

    const { chartHeight } = this.getChartDimensions();

    // 計算安全的標籤位置邊界
    const minTopSpace = fontSize + 5; // 頂部最小空間
    const minBottomSpace = percentageFontSize + 5; // 底部最小空間

    // 添加垂直 tick 線段
    const tickLines = container.selectAll('.tick-line')
      .data(this.processedDataPoints)
      .enter()
      .append('line')
      .attr('class', 'tick-line')
      .attr('x1', (_d, i) => xScale(i))
      .attr('x2', (_d, i) => xScale(i))
      .attr('y1', (_d, i) => {
        const upperY = this.upperPoints[i] ? this.upperPoints[i][1] : 0;
        return Math.max(upperY - 30, minTopSpace);
      })
      .attr('y2', (_d, i) => {
        const upperY = this.upperPoints[i] ? this.upperPoints[i][1] : 0;
        return Math.max(upperY - 5, minTopSpace);
      })
      .attr('stroke', values)
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // 添加數值標籤
    const valueLabels = container.selectAll('.value-label')
      .data(this.processedDataPoints)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (_d, i) => xScale(i))
      .attr('y', (_d, i) => {
        const upperY = this.upperPoints[i] ? this.upperPoints[i][1] : 0;
        // 確保標籤不會超出頂部邊界
        return Math.max(upperY - 35, minTopSpace);
      })
      .attr('text-anchor', 'middle')
      .attr('fill', values)
      .style('font-size', `${fontSize}px`)
      .style('font-weight', '600')
      .style('font-family', fontFamily)
      .text(d => formatter(d.value));

    // 添加階段標籤
    const stageLabels = container.selectAll('.stage-label')
      .data(this.processedDataPoints)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('x', (_d, i) => xScale(i))
      .attr('y', (_d, i) => {
        if (this.upperPoints[i] && this.lowerPoints[i]) {
          return (this.upperPoints[i][1] + this.lowerPoints[i][1]) / 2;
        }
        return chartHeight / 2;
      })
      .attr('text-anchor', 'middle')
      .attr('fill', labels)
      .style('font-size', `${labelFontSize}px`)
      .style('font-weight', '500')
      .style('font-family', fontFamily)
      .text(d => d.label);

    // 添加百分比標籤（轉換率）
    const percentageLabels = container.selectAll('.percentage-label')
      .data(this.processedDataPoints)
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('x', (_d, i) => xScale(i))
      .attr('y', (_d, i) => {
        const lowerY = this.lowerPoints && this.lowerPoints[i] ? this.lowerPoints[i][1] : chartHeight;
        // 確保標籤不會超出底部邊界
        return Math.min(lowerY + 20, chartHeight - minBottomSpace);
      })
      .attr('text-anchor', 'middle')
      .attr('fill', percentages)
      .style('font-size', `${percentageFontSize}px`)
      .style('font-family', fontFamily)
      .text((d, i) => {
        if (i === 0) return '';
        return `${d.conversionRate?.toFixed(1)}%`;
      });

    // 動畫標籤和 tick 線
    if (animate) {
      // 動畫 tick 線
      tickLines
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((_d: any, i: number) => i * 100)
        .attr('opacity', 0.8);

      // 動畫標籤
      [valueLabels, stageLabels, percentageLabels].forEach(selection => {
        selection
          .attr('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay((_d: any, i: number) => i * 100)
          .attr('opacity', 1);
      });
    }
  }

  private formatTooltipContent(data: ExactFunnelDataPoint): string {
    return `${data.label}: ${d3.format(',')(data.value)} (${data.percentage.toFixed(1)}%)`;
  }

  // 公開 API
  public getProcessedDataPoints(): ExactFunnelDataPoint[] {
    return [...this.processedDataPoints];
  }
}