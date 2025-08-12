
import * as d3 from 'd3';
import { BarChartConfig, ProcessedDataPoint } from './types';

export class D3BarChart {
  private container: HTMLElement;
  private config: Required<BarChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};

  constructor(container: HTMLElement, config: BarChartConfig) {
    this.container = container;
    
    const defaultConfig: Omit<Required<BarChartConfig>, 'data' | 'xKey' | 'yKey' | 'xAccessor' | 'yAccessor' | 'mapping' | 'tooltipFormat' | 'onDataClick' | 'onHover'> = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      orientation: 'vertical',
      colors: ['#3b82f6'],
      animate: false,
      animationDuration: 750,
      interactive: true,
      showTooltip: true,
    };

    this.config = { ...defaultConfig, ...config } as Required<BarChartConfig>;

    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');

    this.update(this.config);
  }

  private processData() {
    const { data, mapping, xAccessor, yAccessor, xKey, yKey } = this.config;
    if (!data?.length) {
      this.processedData = [];
      return;
    }

    const processed = data.map((d, index) => {
      let x: any, y: any;
      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x];
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y];
      } else if (xAccessor && yAccessor) {
        x = xAccessor(d);
        y = yAccessor(d);
      } else if (xKey && yKey) {
        x = d[xKey];
        y = d[yKey];
      } else {
        const keys = Object.keys(d);
        x = d[keys[0]];
        y = d[keys[1]];
      }
      return { x, y: +y, originalData: d, index } as ProcessedDataPoint;
    });
    this.processedData = processed.filter(d => !isNaN(d.y));
  }

  private setupScales() {
    const { width, height, margin, orientation } = this.config;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

    if (orientation === 'vertical') {
      xScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, innerWidth])
        .padding(0.1);
      yScale = d3.scaleLinear()
        .domain([0, d3.max(this.processedData, d => d.y) || 0])
        .range([innerHeight, 0])
        .nice();
    } else {
      xScale = d3.scaleLinear()
        .domain([0, d3.max(this.processedData, d => d.y) || 0])
        .range([0, innerWidth])
        .nice();
      yScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, innerHeight])
        .padding(0.1);
    }
    this.scales = { xScale, yScale, innerWidth, innerHeight };
  }

  public render() {
    const { width, height, margin, orientation, colors, animate, animationDuration, interactive } = this.config;
    const { xScale, yScale, innerWidth, innerHeight } = this.scales;

    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bar-chart-svg');

    this.g
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.g.selectAll('*').remove();

    const bars = this.g.selectAll('.bar')
      .data(this.processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('fill', (d, i) => colors[i % colors.length]);

    if (orientation === 'vertical') {
      bars
        .attr('x', d => (xScale as d3.ScaleBand<string>)(String(d.x)) || 0)
        .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
        .attr('y', animate ? innerHeight : d => (yScale as d3.ScaleLinear<number, number>)(d.y))
        .attr('height', animate ? 0 : d => innerHeight - (yScale as d3.ScaleLinear<number, number>)(d.y));
    } else {
      bars
        .attr('x', 0)
        .attr('y', d => (yScale as d3.ScaleBand<string>)(String(d.x)) || 0)
        .attr('width', animate ? 0 : d => (xScale as d3.ScaleLinear<number, number>)(d.y))
        .attr('height', (yScale as d3.ScaleBand<string>).bandwidth());
    }

    if (animate) {
      if (orientation === 'vertical') {
        bars.transition()
          .duration(animationDuration)
          .attr('y', d => (yScale as d3.ScaleLinear<number, number>)(d.y))
          .attr('height', d => innerHeight - (yScale as d3.ScaleLinear<number, number>)(d.y));
      } else {
        bars.transition()
          .duration(animationDuration)
          .attr('width', d => (xScale as d3.ScaleLinear<number, number>)(d.y));
      }
    }

    if (interactive) {
      bars
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          this.config.onDataClick?.(d.originalData);
        })
        .on('mouseenter', (event, d) => {
          d3.select(event.currentTarget).style('opacity', 0.8);
          this.config.onHover?.(d.originalData);
        })
        .on('mouseleave', (event) => {
          d3.select(event.currentTarget).style('opacity', 1);
          this.config.onHover?.(null);
        });
    }

    const xAxis = orientation === 'vertical' 
      ? d3.axisBottom(xScale as d3.ScaleBand<string>)
      : d3.axisBottom(xScale as d3.ScaleLinear<number, number>);
    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxis = orientation === 'vertical'
      ? d3.axisLeft(yScale as d3.ScaleLinear<number, number>)
      : d3.axisLeft(yScale as d3.ScaleBand<string>);
    this.g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);
  }

  public update(newConfig: Partial<BarChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
