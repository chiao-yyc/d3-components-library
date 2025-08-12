
import * as d3 from 'd3';
import { GaugeChartConfig, ProcessedGaugeDataPoint, GaugeZone, TickData } from './types';

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
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, value, min, max, valueKey, labelKey, valueAccessor, labelAccessor, mapping } = this.config;
    let processedValue = value !== undefined ? value : 0;
    let processedLabel: string | undefined;

    if (data && data.length > 0) {
      const d = data[0];
      if (mapping) {
        processedValue = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0;
        processedLabel = mapping.label ? (typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label])) : undefined;
      } else if (valueAccessor) {
        processedValue = valueAccessor(d);
        processedLabel = labelAccessor?.(d);
      } else if (valueKey) {
        processedValue = Number(d[valueKey]) || 0;
        processedLabel = labelKey ? String(d[labelKey]) : undefined;
      }
    }
    this.processedData = { value: Math.max(min, Math.min(max, processedValue)), label: processedLabel, originalData: data?.[0] || { value: processedValue } };
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

    let colorScale: d3.ScaleLinear<number, string> | null = null;
    if (!zones) {
      colorScale = d3.scaleLinear<string>().domain(d3.range(colors.length).map(i => min + (max - min) * i / (colors.length - 1))).range(colors);
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
        const valuePath = this.g.append('path').attr('d', valueArc).attr('fill', colorScale ? colorScale(this.processedData.value) : foregroundColor).attr('stroke', 'none');
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
}
