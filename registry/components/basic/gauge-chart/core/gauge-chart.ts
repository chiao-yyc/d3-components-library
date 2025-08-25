
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
    console.log('🎯 D3GaugeChart constructor called with props:', {
      responsive: props.responsive,
      width: props.width,
      height: props.height,
      value: props.value
    });
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
          mapping: mapping || {
            x: valueKey || valueAccessor,
            y: labelKey || labelAccessor
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

    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;

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
        console.warn('Failed to create color scale, using fallback:', error);
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
    const { min = 0, max = 100, tickCount = 5, tickFormat, showTicks = true } = this.props;
    const { angleScale } = this.scales;
    if (!showTicks) return [];
    
    return d3.range(tickCount).map(i => {
      const tickValue = min + (max - min) * i / (tickCount - 1);
      return { value: tickValue, angle: angleScale(tickValue), label: tickFormat ? tickFormat(tickValue) : tickValue.toString() };
    });
  }

  public renderContent(): void {
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

    const svg = this.getSVG();
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
              .duration(animationDuration)
              .ease(d3.easeElasticOut)
              .attrTween('d', () => {
                const interpolate = d3.interpolate(startAngleRad, valueAngle);
                return (t: number) => this.arcGenerator!({ startAngle: startAngleRad, endAngle: interpolate(t) }) || '';
              });
          }
        }
      }
    }

    // 指針
    const needleAngle = angleScale(this.processedData.value);
    const needleLength = calculatedOuterRadius + 10;
    const needleX = Math.cos(needleAngle) * needleLength;
    const needleY = Math.sin(needleAngle) * needleLength;

    const needle = g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', needleX).attr('y2', needleY)
      .attr('stroke', needleColor)
      .attr('stroke-width', needleWidth)
      .attr('stroke-linecap', 'round');

    if (animate) {
      needle
        .attr('x2', Math.cos(startAngleRad) * needleLength)
        .attr('y2', Math.sin(startAngleRad) * needleLength)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeElasticOut)
        .attr('x2', needleX)
        .attr('y2', needleY);
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
      const minAngle = startAngleRad;
      const maxAngle = endAngleRad;
      const labelRadius = calculatedOuterRadius + 35;
      
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
      // 為主要的 arc 添加 tooltip
      g.selectAll('path')
        .filter((d, i, nodes) => nodes.length > 1 ? i === nodes.length - 1 : true) // 選擇最後一個path（數值arc）
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          let content = `Value: ${this.processedData.value}`;
          if (this.processedData.label) {
            content += `<br>Label: ${this.processedData.label}`;
          }
          
          if (tooltipFormat) {
            content = tooltipFormat(this.processedData.value, this.processedData.label);
          }
          
          this.showTooltip(event, content);
        })
        .on('mouseleave', () => {
          this.hideTooltip();
        });
    }
  }

  public getChartType(): string {
    return 'gauge';
  }
}
