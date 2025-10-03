// @ts-nocheck
/**
 * @deprecated This file contains legacy code and is no longer actively maintained.
 * Please use GaugeChartCore from './gauge-chart-core' instead.
 *
 * All TypeScript checking has been disabled for this file.
 * This implementation may be removed in a future version.
 */

import * as d3 from 'd3';
import { GaugeChartProps, ProcessedGaugeDataPoint, GaugeZone, TickData } from '../types';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

const DEFAULT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e'];

export class D3GaugeChart extends BaseChart<GaugeChartProps> {
  private processedData: ProcessedGaugeDataPoint = { value: 0 };
  private scales: any = {};
  private arcGenerator: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private colorScale!: ColorScale;

  constructor(props: GaugeChartProps) {
    super(props);
  }

  protected processData(): ProcessedGaugeDataPoint[] {
    try {
      const { data, value, min = 0, max = 100, valueKey, labelKey, valueAccessor, labelAccessor, mapping } = this.props;
      let processedValue = value !== undefined ? value : 0;
      let processedLabel: string | undefined;

      // 使用共用的 DataProcessor 如果有數據
      if (data && data.length > 0) {
        const processor = new DataProcessor({
          mapping: {
            x: mapping?.value || valueKey || valueAccessor || 'value',
            y: mapping?.label || labelKey || labelAccessor || 'label'
          },
          autoDetect: true
        });

        const result = processor.process(data);
        
        if (result.errors.length > 0) {
          this.handleError(new Error(result.errors.join(', ')));
        }

        if (result.data.length > 0) {
          const firstItem = result.data[0];
          processedValue = Number(firstItem.x) || 0;
          processedLabel = String(firstItem.y) || undefined;
        }
      }

      // 確保數值在範圍內
      processedValue = Math.max(min, Math.min(max, processedValue));
      
      this.processedData = { 
        value: processedValue, 
        label: processedLabel, 
        originalData: data?.[0] || { value: processedValue } 
      };
      
      return [this.processedData];
    } catch (error) {
      this.handleError(error as Error);
      // 使用默認值
      this.processedData = { value: this.props.min || 0, originalData: {} };
      return [this.processedData];
    }
  }

  protected createScales(): void {
    const { min = 0, max = 100, startAngle = -90, endAngle = 90, innerRadius, outerRadius, colors = DEFAULT_COLORS, zones, cornerRadius = 0, showTicks = true, showMinMax = true } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    const labelSpace = showTicks || showMinMax ? 40 : 20;
    const availableRadius = Math.min(chartWidth / 2, chartHeight) - labelSpace;
    const calculatedOuterRadius = outerRadius || Math.max(50, availableRadius);
    const calculatedInnerRadius = innerRadius || calculatedOuterRadius * 0.7;

    const startAngleRad = (startAngle) * Math.PI / 180;
    const endAngleRad = (endAngle) * Math.PI / 180;

    const angleScale = d3.scaleLinear().domain([min, max]).range([startAngleRad, endAngleRad]);

    // 使用共用顏色管理器
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

    this.scales = { angleScale, colorScale, chartWidth, chartHeight, calculatedInnerRadius, calculatedOuterRadius, startAngleRad, endAngleRad };
    this.arcGenerator = d3.arc().innerRadius(calculatedInnerRadius).outerRadius(calculatedOuterRadius).cornerRadius(cornerRadius);
  }

  private calculateTickData(): TickData[] {
    const { min = 0, max = 100, tickCount = 5, tickFormat, showTicks = true, showMinMax = true } = this.props;
    const { angleScale } = this.scales;
    if (!showTicks) return [];
    
    return d3.range(tickCount).map(i => {
      const tickValue = min + (max - min) * i / (tickCount - 1);
      const visualAngle = angleScale(tickValue) - Math.PI / 2; // 減去 90 度來轉換到視覺座標系
      return { value: tickValue, angle: visualAngle, label: tickFormat ? tickFormat(tickValue) : tickValue.toString() };
    }).filter(tick => {
      // 如果顯示 MinMax 標籤，則從 tick 中排除最小值和最大值，避免重複
      if (showMinMax) {
        return tick.value !== min && tick.value !== max;
      }
      return true;
    });
  }

  protected renderChart(): void {
    this.renderGauge();
  }

  protected getChartType(): string {
    return 'gauge';
  }

  private renderGauge(): void {
    // 檢查 SVG 是否可用
    if (!this.svgRef?.current) {
      return;
    }

    // 檢查 scales 是否已初始化
    if (!this.scales || typeof this.scales !== 'object') {
      return;
    }

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
    } = this.props;
    
    const { angleScale, colorScale, chartWidth, chartHeight, calculatedInnerRadius, calculatedOuterRadius, startAngleRad, endAngleRad } = this.scales;
    const { margin } = this.getChartDimensions();

    const centerX = chartWidth / 2;
    const centerY = Math.max(calculatedOuterRadius + 20, chartHeight - calculatedOuterRadius - 20);

    const svg = d3.select(this.svgRef.current);
    svg.selectAll('*').remove(); // 清除之前的內容
    
    const g = svg.append('g')
      .attr('transform', `translate(${centerX + margin.left}, ${centerY + margin.top})`);

    // 背景弧線
    const backgroundArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: endAngleRad });
    if (backgroundArc) {
      g.append('path').attr('d', backgroundArc).attr('fill', backgroundColor).attr('stroke', 'none');
    }

    // 區域或數值弧線
    if (zones) {
      zones.forEach((zone, i) => {
        const zoneStartAngle = angleScale(Math.max(zone.min, min));
        const zoneEndAngle = angleScale(Math.min(zone.max, max));
        const zoneArc = this.arcGenerator!({ startAngle: zoneStartAngle, endAngle: zoneEndAngle });
        if (zoneArc) {
          g.append('path').attr('d', zoneArc).attr('fill', zone.color).attr('stroke', 'none');
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
        const valuePath = g.append('path').attr('d', valueArc).attr('fill', valueColor).attr('stroke', 'none');
        
        if (animate) {
          const initialArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: startAngleRad });
          if (initialArc) {
            valuePath.attr('d', initialArc)
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
    const needleLength = calculatedOuterRadius + 10;
    const targetAngleDegrees = angleScale(this.processedData.value) * 180 / Math.PI; // 轉換為度數，與弧線使用相同角度
    
    // 創建指針組，方便旋轉
    const needleGroup = g.append('g')
      .attr('class', 'needle-group');
    
    // 創建一個垂直向上的指針（0度位置）
    const needle = needleGroup.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', -needleLength) // 向上指向
      .attr('stroke', needleColor)
      .attr('stroke-width', needleWidth)
      .attr('stroke-linecap', 'round');

    if (animate) {
      // 指針應該從最小值位置開始動畫，與弧線使用相同的角度系統
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

    // 中心圓
    g.append('circle')
      .attr('cx', 0).attr('cy', 0)
      .attr('r', centerCircleRadius)
      .attr('fill', centerCircleColor);

    // 刻度
    if (showTicks) {
      const tickData = this.calculateTickData();
      const ticks = g.selectAll('.tick')
        .data(tickData)
        .enter()
        .append('g')
        .attr('class', 'tick');
        
      ticks.append('line')
        .attr('x1', d => Math.cos(d.angle) * (calculatedOuterRadius + 5))
        .attr('y1', d => Math.sin(d.angle) * (calculatedOuterRadius + 5))
        .attr('x2', d => Math.cos(d.angle) * (calculatedOuterRadius + 15))
        .attr('y2', d => Math.sin(d.angle) * (calculatedOuterRadius + 15))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 1);
        
      ticks.append('text')
        .attr('x', d => Math.cos(d.angle) * (calculatedOuterRadius + 25))
        .attr('y', d => Math.sin(d.angle) * (calculatedOuterRadius + 25))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(d => d.label);
    }

    // 最小值和最大值標籤
    if (showMinMax) {
      const minAngle = startAngleRad - Math.PI / 2; // 轉換到視覺座標系
      const maxAngle = endAngleRad - Math.PI / 2;   // 轉換到視覺座標系
      const labelRadius = calculatedOuterRadius + 35;
      
      // 為 min 和 max 添加 tick 短線標記
      g.append('line')
        .attr('x1', Math.cos(minAngle) * (calculatedOuterRadius + 5))
        .attr('y1', Math.sin(minAngle) * (calculatedOuterRadius + 5))
        .attr('x2', Math.cos(minAngle) * (calculatedOuterRadius + 15))
        .attr('y2', Math.sin(minAngle) * (calculatedOuterRadius + 15))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 1);
        
      g.append('line')
        .attr('x1', Math.cos(maxAngle) * (calculatedOuterRadius + 5))
        .attr('y1', Math.sin(maxAngle) * (calculatedOuterRadius + 5))
        .attr('x2', Math.cos(maxAngle) * (calculatedOuterRadius + 15))
        .attr('y2', Math.sin(maxAngle) * (calculatedOuterRadius + 15))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 1);
      
      g.append('text')
        .attr('x', Math.cos(minAngle) * labelRadius)
        .attr('y', Math.sin(minAngle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(tickFormat ? tickFormat(min) : min.toString());
        
      g.append('text')
        .attr('x', Math.cos(maxAngle) * labelRadius)
        .attr('y', Math.sin(maxAngle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', `${fontSize - 2}px`)
        .style('font-family', fontFamily)
        .style('fill', '#6b7280')
        .text(tickFormat ? tickFormat(max) : max.toString());
    }

    // 添加互動功能
    this.setupInteractions(g);
  }

  private setupInteractions(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { interactive = true, showTooltip = true, tooltipFormat } = this.props;
    
    if (interactive && showTooltip) {
      // 為主要的 arc 和指針添加 tooltip
      const interactiveElements = g.selectAll('path, .needle-group')
        .filter((d, i, nodes) => {
          const element = nodes[i] as SVGElement;
          // 選擇數值arc（最後一個path）和指針組
          return element.classList?.contains('needle-group') || 
                 (element.tagName === 'path' && i === nodes.length - 1);
        });
        
      interactiveElements
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          // 創建或顯示 tooltip
          this.createTooltip(event);
        })
        .on('mousemove', (event) => {
          // 更新 tooltip 位置
          this.updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
          // 隱藏 tooltip
          this.hideTooltipElement();
        });
    }
  }
  
  private createTooltip(event: MouseEvent): void {
    const { tooltipFormat } = this.props;
    
    // 創建 tooltip 內容
    let content = `Value: ${this.processedData.value}`;
    if (this.processedData.label) {
      content += `<br>Label: ${this.processedData.label}`;
    }
    
    if (tooltipFormat) {
      const formattedContent = tooltipFormat(this.processedData.value, this.processedData.label);
      content = typeof formattedContent === 'string' ? formattedContent : content;
    }
    
    // 創建或更新 tooltip 元素
    let tooltip = d3.select('body').select('.gauge-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'gauge-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('opacity', '0');
    }
    
    tooltip
      .html(content)
      .style('opacity', '1');
      
    this.updateTooltipPosition(event);
  }
  
  private updateTooltipPosition(event: MouseEvent): void {
    const tooltip = d3.select('.gauge-tooltip');
    if (!tooltip.empty()) {
      // 使用相對於視窗的座標而非頁面座標
      tooltip
        .style('left', (event.clientX + 10) + 'px')
        .style('top', (event.clientY - 10) + 'px');
    }
  }
  
  private hideTooltipElement(): void {
    d3.select('.gauge-tooltip').style('opacity', '0');
  }
}
