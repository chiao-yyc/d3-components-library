
import * as d3 from 'd3';
import { GaugeChartConfig, ProcessedGaugeDataPoint, GaugeZone, TickData } from './types';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale } from '../../../core/color-scheme/color-manager';

const DEFAULT_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e'];

export class D3GaugeChart {
  private container: HTMLElement;
  private config: Required<Omit<GaugeChartConfig, 'valueKey' | 'labelKey' | 'valueAccessor' | 'labelAccessor' | 'mapping' | 'tooltipFormat' | 'onValueChange'> & GaugeChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedGaugeDataPoint = { value: 0 };
  private scales: any = {};
  private arcGenerator: d3.Arc<any, d3.DefaultArcObject> | null = null;

  constructor(container: HTMLElement, config: GaugeChartConfig) {
    try {
      this.container = container;
      const defaultConfig = {
        width: 300,
        height: 200,
        margin: { top: 30, right: 30, bottom: 50, left: 30 },
        min: 0,
        max: 100,
        startAngle: -90,
        endAngle: 90,
        cornerRadius: 0,
        backgroundColor: '#e5e7eb',
        foregroundColor: '#3b82f6',
        colors: DEFAULT_COLORS,
        showValue: true,
        showLabel: true,
        showTicks: true,
        showMinMax: true,
        tickCount: 5,
        fontSize: 14,
        fontFamily: 'sans-serif',
        animate: true,
        animationDuration: 1000,
        animationEasing: 'easeElasticOut',
        interactive: true,
        showTooltip: true,
      };

      this.config = { ...defaultConfig, ...config };
      this.validateConfig();
      this.svg = d3.select(this.container).append('svg');
      this.g = this.svg.append('g');
      this.update(this.config);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private processData() {
    try {
      const { data, value, min, max, valueKey, labelKey, valueAccessor, labelAccessor, mapping } = this.config;
      let processedValue = value !== undefined ? value : 0;
      let processedLabel: string | undefined;

      // 使用共用的 DataProcessor 如果有數據
      if (data && data.length > 0) {
        const processor = new DataProcessor({
          mapping: mapping || {
            x: valueKey || valueAccessor,
            y: labelKey || labelAccessor
          },
          autoDetect: true
        });

        const result = processor.process(data);
        
        if (result.errors.length > 0) {
          console.warn('GaugeChart data processing warnings:', result.errors);
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
    } catch (error) {
      this.handleError(error as Error);
      // 使用默認值
      this.processedData = { value: this.config.min, originalData: {} };
    }
  }

  private setupScales() {
    const { width, height, margin, min, max, startAngle, endAngle, innerRadius, outerRadius, colors, zones } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const labelSpace = this.config.showTicks || this.config.showMinMax ? 40 : 20;
    const availableRadius = Math.min(chartWidth / 2, chartHeight) - labelSpace;
    const calculatedOuterRadius = outerRadius || Math.max(50, availableRadius);
    const calculatedInnerRadius = innerRadius || calculatedOuterRadius * 0.7;

    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;

    const angleScale = d3.scaleLinear().domain([min, max]).range([startAngleRad, endAngleRad]);

    // 使用共用顏色管理器
    let colorScale: any = null;
    if (!zones) {
      try {
        colorScale = createColorScale({
          type: 'custom',
          colors: colors,
          domain: [min, max],
          interpolate: true
        });
      } catch (error) {
        console.warn('Failed to create color scale, using fallback:', error);
        // 使用原來的 D3 實現作為備案
        colorScale = d3.scaleLinear<string>()
          .domain(d3.range(colors.length).map(i => min + (max - min) * i / (colors.length - 1)))
          .range(colors);
      }
    }

    this.scales = { angleScale, colorScale, chartWidth, chartHeight, calculatedInnerRadius, calculatedOuterRadius, startAngleRad, endAngleRad };
    this.arcGenerator = d3.arc().innerRadius(calculatedInnerRadius).outerRadius(calculatedOuterRadius).cornerRadius(this.config.cornerRadius);
  }

  private calculateTickData(): TickData[] {
    const { min, max, tickCount, tickFormat } = this.config;
    const { angleScale } = this.scales;
    if (!this.config.showTicks) return [];
    
    return d3.range(tickCount).map(i => {
      const tickValue = min + (max - min) * i / (tickCount - 1);
      return { value: tickValue, angle: angleScale(tickValue), label: tickFormat ? tickFormat(tickValue) : tickValue.toString() };
    });
  }

  public render() {
    const { width, height, margin, backgroundColor, foregroundColor, zones, needleColor, needleWidth, centerCircleRadius, centerCircleColor, showValue, showLabel, showTicks, showMinMax, fontSize, fontFamily, animate, animationDuration, animationEasing } = this.config;
    const { angleScale, colorScale, chartWidth, chartHeight, calculatedInnerRadius, calculatedOuterRadius, startAngleRad, endAngleRad } = this.scales;

    const centerX = chartWidth / 2;
    const centerY = Math.max(calculatedOuterRadius + 20, chartHeight - calculatedOuterRadius - 20);

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${centerX + margin.left}, ${centerY + margin.top})`);
    this.g.selectAll('*').remove();

    const backgroundArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: endAngleRad });
    if (backgroundArc) {
      this.g.append('path').attr('d', backgroundArc).attr('fill', backgroundColor).attr('stroke', 'none');
    }

    if (zones) {
      zones.forEach((zone, i) => {
        const zoneStartAngle = angleScale(Math.max(zone.min, this.config.min));
        const zoneEndAngle = angleScale(Math.min(zone.max, this.config.max));
        const zoneArc = this.arcGenerator!({ startAngle: zoneStartAngle, endAngle: zoneEndAngle });
        if (zoneArc) {
          this.g.append('path').attr('d', zoneArc).attr('fill', zone.color).attr('stroke', 'none');
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
        const valuePath = this.g.append('path').attr('d', valueArc).attr('fill', valueColor).attr('stroke', 'none');
        if (animate) {
          const initialArc = this.arcGenerator!({ startAngle: startAngleRad, endAngle: startAngleRad });
          if (initialArc) {
            valuePath.attr('d', initialArc).transition().duration(animationDuration).ease(d3.easeElasticOut).attrTween('d', () => {
              const interpolate = d3.interpolate(startAngleRad, valueAngle);
              return t => this.arcGenerator!({ startAngle: startAngleRad, endAngle: interpolate(t) });
            });
          }
        }
      }
    }

    const needleAngle = angleScale(this.processedData.value);
    const needleLength = calculatedOuterRadius + 10;
    const needleX = Math.cos(needleAngle) * needleLength;
    const needleY = Math.sin(needleAngle) * needleLength;

    const needle = this.g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', needleX).attr('y2', needleY)
      .attr('stroke', needleColor).attr('stroke-width', needleWidth).attr('stroke-linecap', 'round');

    if (animate) {
      needle.attr('x2', Math.cos(startAngleRad) * needleLength).attr('y2', Math.sin(startAngleRad) * needleLength)
        .transition().duration(animationDuration).ease(d3.easeElasticOut).attr('x2', needleX).attr('y2', needleY);
    }

    this.g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', centerCircleRadius).attr('fill', centerCircleColor);

    if (showTicks) {
      const tickData = this.calculateTickData();
      const ticks = this.g.selectAll('.tick').data(tickData).enter().append('g').attr('class', 'tick');
      ticks.append('line').attr('x1', d => Math.cos(d.angle) * (calculatedOuterRadius + 5)).attr('y1', d => Math.sin(d.angle) * (calculatedOuterRadius + 5)).attr('x2', d => Math.cos(d.angle) * (calculatedOuterRadius + 15)).attr('y2', d => Math.sin(d.angle) * (calculatedOuterRadius + 15)).attr('stroke', '#6b7280').attr('stroke-width', 1);
      ticks.append('text').attr('x', d => Math.cos(d.angle) * (calculatedOuterRadius + 25)).attr('y', d => Math.sin(d.angle) * (calculatedOuterRadius + 25)).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').style('font-size', `${fontSize - 2}px`).style('font-family', fontFamily).style('fill', '#6b7280').text(d => d.label);
    }

    if (showMinMax) {
      const minAngle = startAngleRad;
      const maxAngle = endAngleRad;
      const labelRadius = calculatedOuterRadius + 35;
      this.g.append('text').attr('x', Math.cos(minAngle) * labelRadius).attr('y', Math.sin(minAngle) * labelRadius).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').style('font-size', `${fontSize - 2}px`).style('font-family', fontFamily).style('fill', '#6b7280').text(this.config.tickFormat ? this.config.tickFormat(this.config.min) : this.config.min.toString());
      this.g.append('text').attr('x', Math.cos(maxAngle) * labelRadius).attr('y', Math.sin(maxAngle) * labelRadius).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').style('font-size', `${fontSize - 2}px`).style('font-family', fontFamily).style('fill', '#6b7280').text(this.config.tickFormat ? this.config.tickFormat(this.config.max) : this.config.max.toString());
    }

    // 添加互動功能
    this.setupInteractions();
  }

  private setupInteractions(): void {
    const { interactive, showTooltip, tooltipFormat } = this.config;
    
    if (interactive && showTooltip) {
      // 為主要的 arc 添加 tooltip
      this.g.selectAll('path')
        .filter((d, i, nodes) => nodes.length > 1 ? i === nodes.length - 1 : true) // 選擇最後一個path（數值arc）
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          const rect = this.container.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          let content = `Value: ${this.processedData.value}`;
          if (this.processedData.label) {
            content += `<br>Label: ${this.processedData.label}`;
          }
          
          if (tooltipFormat) {
            content = tooltipFormat(this.processedData.value, this.processedData.label);
          }
          
          this.createTooltip(x, y, content);
        })
        .on('mouseleave', () => {
          this.hideTooltip();
        });
    }
  }

  public update(newConfig: Partial<GaugeChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }

  // === 新增共用工具方法 ===

  private validateConfig(): void {
    const { min, max, width, height, data, value } = this.config;

    if (min >= max) {
      throw new Error('GaugeChart: min value must be less than max value');
    }

    if (width <= 0 || height <= 0) {
      throw new Error('GaugeChart: width and height must be positive numbers');
    }

    if (value !== undefined && (value < min || value > max)) {
      console.warn(`GaugeChart: value ${value} is outside the range [${min}, ${max}]`);
    }

    if (data && !Array.isArray(data)) {
      throw new Error('GaugeChart: data must be an array');
    }
  }

  private handleError(error: Error): void {
    console.error('GaugeChart Error:', error.message);
    
    // 顯示錯誤訊息在圖表區域
    const errorMessage = d3.select(this.container)
      .append('div')
      .style('color', 'red')
      .style('text-align', 'center')
      .style('padding', '20px')
      .style('font-family', 'sans-serif')
      .text(`Chart Error: ${error.message}`);

    // 可選：觸發回調
    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  private createTooltip(x: number, y: number, content: string): void {
    if (!this.config.showTooltip) return;

    // 移除現有tooltip
    d3.select(this.container).select('.gauge-tooltip').remove();

    // 創建新tooltip
    d3.select(this.container)
      .append('div')
      .attr('class', 'gauge-tooltip')
      .style('position', 'absolute')
      .style('left', `${x + 10}px`)
      .style('top', `${y - 10}px`)
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .html(content);
  }

  private hideTooltip(): void {
    d3.select(this.container).select('.gauge-tooltip').remove();
  }
}
