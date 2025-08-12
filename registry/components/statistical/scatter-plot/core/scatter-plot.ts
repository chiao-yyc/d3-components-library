
import * as d3 from 'd3';
import { ScatterPlotConfig, ProcessedDataPoint } from './types';

export class D3ScatterPlot {
  private container: HTMLElement;
  private config: Required<Omit<ScatterPlotConfig, 'xKey' | 'yKey' | 'sizeKey' | 'colorKey' | 'xAccessor' | 'yAccessor' | 'sizeAccessor' | 'colorAccessor' | 'mapping' | 'tooltipFormat' | 'onDataClick' | 'onHover'> & ScatterPlotConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};
  private trendlineData: { x: number; y: number }[] | null = null;

  constructor(container: HTMLElement, config: ScatterPlotConfig) {
    this.container = container;
    const defaultConfig = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      radius: 4,
      minRadius: 3,
      maxRadius: 12,
      sizeRange: [3, 12],
      opacity: 0.7,
      strokeWidth: 1,
      strokeColor: 'white',
      showTrendline: false,
      trendlineColor: '#ef4444',
      trendlineWidth: 2,
      showTooltip: true,
      animate: false,
      animationDuration: 750,
      interactive: true,
    };

    this.config = { ...defaultConfig, ...config };
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, mapping, xAccessor, yAccessor, sizeAccessor, colorAccessor, xKey, yKey, sizeKey, colorKey } = this.config;
    if (!data?.length) {
      this.processedData = [];
      return;
    }

    this.processedData = data.map((d, index) => {
      let x: any, y: any, size: any, color: any;

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x];
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y];
        size = mapping.size ? (typeof mapping.size === 'function' ? mapping.size(d) : d[mapping.size]) : undefined;
        color = mapping.color ? (typeof mapping.color === 'function' ? mapping.color(d) : d[mapping.color]) : undefined;
      } else {
        x = xAccessor ? xAccessor(d) : (xKey ? d[xKey] : Object.values(d)[0]);
        y = yAccessor ? yAccessor(d) : (yKey ? d[yKey] : Object.values(d)[1]);
        size = sizeAccessor ? sizeAccessor(d) : (sizeKey ? d[sizeKey] : undefined);
        color = colorAccessor ? colorAccessor(d) : (colorKey ? d[colorKey] : undefined);
      }

      return {
        x: Number(x) || 0,
        y: Number(y) || 0,
        size: size !== undefined ? Number(size) : undefined,
        color: color,
        originalData: d
      } as ProcessedDataPoint;
    });
  }

  private setupScales() {
    const { width, height, margin, radius, sizeRange, colors } = this.config;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xDomain = d3.extent(this.processedData, d => d.x) as [number, number];
    const xPadding = (xDomain[1] - xDomain[0]) * 0.05;
    const xScale = d3.scaleLinear().domain([xDomain[0] - xPadding, xDomain[1] + xPadding]).range([0, innerWidth]);

    const yDomain = d3.extent(this.processedData, d => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.05;
    const yScale = d3.scaleLinear().domain([yDomain[0] - yPadding, yDomain[1] + yPadding]).range([innerHeight, 0]);

    let sizeScale: d3.ScaleSqrt<number, number> | null = null;
    if (this.processedData.some(d => d.size !== undefined)) {
      const sizeDomain = d3.extent(this.processedData, d => d.size) as [number, number];
      sizeScale = d3.scaleSqrt().domain(sizeDomain).range(sizeRange);
    }

    let colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<number, string> | null = null;
    if (this.processedData.some(d => d.color !== undefined)) {
      const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
      if (typeof this.processedData[0]?.color === 'number') {
        const colorDomain = d3.extent(this.processedData, d => d.color) as [number, number];
        colorScale = d3.scaleSequential(d3.interpolateBlues).domain(colorDomain);
      } else {
        colorScale = d3.scaleOrdinal().domain(colorValues as string[]).range(colors);
      }
    }

    this.scales = { xScale, yScale, sizeScale, colorScale, innerWidth, innerHeight };
  }

  private calculateTrendline() {
    const { showTrendline } = this.config;
    const { xScale, yScale, innerWidth, innerHeight } = this.scales;

    if (!showTrendline || !this.processedData.length || !xScale || !yScale) {
      this.trendlineData = null;
      return;
    }

    const n = this.processedData.length;
    const sumX = this.processedData.reduce((sum, d) => sum + d.x, 0);
    const sumY = this.processedData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = this.processedData.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumXX = this.processedData.reduce((sum, d) => sum + d.x * d.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xDomain = xScale.domain();
    this.trendlineData = [
      { x: xDomain[0], y: slope * xDomain[0] + intercept },
      { x: xDomain[1], y: slope * xDomain[1] + intercept }
    ];
  }

  public render() {
    const { width, height, margin, radius, opacity, strokeWidth, strokeColor, showTrendline, trendlineColor, trendlineWidth, animate, animationDuration, interactive } = this.config;
    const { xScale, yScale, sizeScale, colorScale, innerWidth, innerHeight } = this.scales;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${margin.left},${margin.top})`);
    this.g.selectAll('*').remove();

    this.g.append('rect').attr('width', innerWidth).attr('height', innerHeight).attr('fill', 'none').attr('stroke', 'none');

    this.g.append('g').attr('class', 'grid-x').selectAll('line').data(xScale.ticks()).enter().append('line')
      .attr('x1', d => xScale(d)).attr('x2', d => xScale(d)).attr('y1', 0).attr('y2', innerHeight)
      .attr('stroke', '#e5e7eb').attr('stroke-opacity', 0.2);

    this.g.append('g').attr('class', 'grid-y').selectAll('line').data(yScale.ticks()).enter().append('line')
      .attr('x1', 0).attr('x2', innerWidth).attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb').attr('stroke-opacity', 0.2);

    if (this.trendlineData) {
      const lineGenerator = d3.line<{x: number, y: number}>().x(d => xScale(d.x)).y(d => yScale(d.y));
      this.g.append('path').datum(this.trendlineData).attr('class', 'trendline').attr('d', lineGenerator)
        .attr('fill', 'none').attr('stroke', trendlineColor).attr('stroke-width', trendlineWidth).attr('stroke-dasharray', '5,5').attr('opacity', 0.8);
    }

    const circles = this.g.selectAll('.dot').data(this.processedData).enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale ? sizeScale(d.size) : radius)
      .attr('fill', d => colorScale ? colorScale(d.color) : this.config.colors[0])
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', animate ? 0 : opacity);

    if (animate) {
      circles.transition().delay((d, i) => i * 10).duration(500).attr('opacity', opacity).attr('r', d => sizeScale ? sizeScale(d.size) : radius);
    }

    const xAxis = d3.axisBottom(xScale);
    this.g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    this.g.append('g').attr('class', 'y-axis').call(yAxis);

    this.g.selectAll('.domain').style('stroke', '#d1d5db');
    this.g.selectAll('.tick line').style('stroke', '#d1d5db');
  }

  public update(newConfig: Partial<ScatterPlotConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.calculateTrendline();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
