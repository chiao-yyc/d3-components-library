
import * as d3 from 'd3';
import { PieChartConfig, ProcessedPieDataPoint } from './types';

export class D3PieChart {
  private container: HTMLElement;
  private config: Required<Omit<PieChartConfig, 'labelKey' | 'valueKey' | 'colorKey' | 'labelAccessor' | 'valueAccessor' | 'colorAccessor' | 'mapping' | 'tooltipFormat' | 'onSliceClick' | 'onSliceHover' | 'centerTextFormat' | 'legendFormat'> & PieChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedPieDataPoint[] = [];
  private colorScale: d3.ScaleOrdinal<string, string> | null = null;

  constructor(container: HTMLElement, config: PieChartConfig) {
    this.container = container;
    const defaultConfig = {
      width: 400,
      height: 400,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      innerRadius: 0,
      cornerRadius: 0,
      padAngle: 0,
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      colorScheme: 'custom' as const,
      showLabels: true,
      showPercentages: true,
      labelThreshold: 5,
      showLegend: true,
      legendPosition: 'right' as const,
      interactive: true,
      animate: true,
      animationDuration: 750,
      showCenterText: true,
      animationType: 'sweep' as const,
      hoverEffect: 'lift' as const,
      showTooltip: true,
    };

    this.config = { ...defaultConfig, ...config };
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, mapping, labelAccessor, valueAccessor, colorAccessor, labelKey, valueKey, colorKey } = this.config;
    if (!data?.length) {
      this.processedData = [];
      return;
    }

    const processed = data.map((d, index) => {
      let label: string, value: number, color: string | undefined;

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label]);
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0;
        color = mapping.color ? (typeof mapping.color === 'function' ? mapping.color(d) : String(d[mapping.color])) : undefined;
      } else if (labelAccessor && valueAccessor) {
        label = labelAccessor(d);
        value = valueAccessor(d);
        color = colorAccessor?.(d);
      } else if (labelKey && valueKey) {
        label = String(d[labelKey]);
        value = Number(d[valueKey]) || 0;
        color = colorKey ? d[colorKey] : undefined;
      } else {
        const keys = Object.keys(d);
        label = String(d[keys[0]]);
        value = Number(d[keys[1]]) || 0;
        color = keys[2] ? d[keys[2]] : undefined;
      }

      return {
        label, value, color, originalData: d, percentage: 0, startAngle: 0, endAngle: 0, index
      } as ProcessedPieDataPoint;
    }).filter(d => d.value > 0);

    const total = processed.reduce((sum, d) => sum + d.value, 0);
    processed.forEach(d => {
      d.percentage = (d.value / total) * 100;
    });

    this.processedData = processed.sort((a, b) => b.value - a.value);
  }

  private setupColorScale() {
    const { colors, colorScheme } = this.config;
    const hasColorData = this.processedData.some(d => d.color !== undefined);
    if (!hasColorData) {
        this.colorScale = d3.scaleOrdinal(colors).domain(this.processedData.map((d,i) => i.toString()));
        return;
    }
    
    if (colorScheme !== 'custom') {
      const schemes = {
        category10: d3.schemeCategory10,
        set3: d3.schemeSet3,
        pastel: d3.schemePastel1,
        dark: d3.schemeDark2
      };
      const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
      this.colorScale = d3.scaleOrdinal(schemes[colorScheme]).domain(colorValues as string[]);
    } else {
        const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
        this.colorScale = d3.scaleOrdinal(colors).domain(colorValues as string[]);
    }
  }

  public render() {
    const { width, height, margin, innerRadius, cornerRadius, padAngle, animate, animationDuration } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const outerRadius = Math.min(chartWidth, chartHeight) / 2 - 10;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${width / 2}, ${height / 2})`);
    this.g.selectAll('*').remove();

    const pie = d3.pie<ProcessedPieDataPoint>().value(d => d.value).sort(null).padAngle(padAngle);
    const arc = d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius);

    const arcs = pie(this.processedData);

    const paths = this.g.selectAll('.pie-slice').data(arcs).enter().append('path')
      .attr('class', 'pie-slice')
      .attr('fill', (d, i) => this.colorScale ? this.colorScale(d.data.color || i.toString()) : this.config.colors[i % this.config.colors.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    if (animate) {
      paths.transition().duration(animationDuration)
        .attrTween('d', d => {
          const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return t => arc(i(t))!;
        });
    } else {
      paths.attr('d', arc);
    }
  }

  public update(newConfig: Partial<PieChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupColorScale();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
