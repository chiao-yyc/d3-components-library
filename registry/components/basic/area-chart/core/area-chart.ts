
import * as d3 from 'd3';
import { AreaChartConfig, ProcessedAreaDataPoint, AreaSeriesData } from './types';

export class D3AreaChart {
  private container: HTMLElement;
  private config: Required<Omit<AreaChartConfig, 'xKey' | 'yKey' | 'categoryKey' | 'xAccessor' | 'yAccessor' | 'categoryAccessor' | 'mapping' | 'tooltipFormat' | 'onDataClick' | 'onDataHover'> & AreaChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedAreaDataPoint[] = [];
  private seriesData: AreaSeriesData[] = [];
  private stackedData: any[] = [];
  private scales: any = {};

  constructor(container: HTMLElement, config: AreaChartConfig) {
    this.container = container;
    const defaultConfig = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      curve: 'monotone' as const,
      stackMode: 'none' as const,
      fillOpacity: 0.7,
      strokeWidth: 2,
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      colorScheme: 'custom' as const,
      gradient: true,
      showXAxis: true,
      showYAxis: true,
      showGrid: true,
      showDots: false,
      dotRadius: 3,
      interactive: true,
      animate: true,
      animationDuration: 750,
      showTooltip: true,
    };

    this.config = { ...defaultConfig, ...config };
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, mapping, xAccessor, yAccessor, categoryAccessor, xKey, yKey, categoryKey, stackMode } = this.config;
    if (!data?.length) {
      this.processedData = [];
      this.seriesData = [];
      this.stackedData = [];
      return;
    }

    this.processedData = data.map((d, index) => {
      let x: Date | number | string, y: number, category: string | undefined;

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x];
        y = typeof mapping.y === 'function' ? mapping.y(d) : Number(d[mapping.y]) || 0;
        category = mapping.category ? (typeof mapping.category === 'function' ? mapping.category(d) : d[mapping.category]) : undefined;
      } else if (xAccessor && yAccessor) {
        x = xAccessor(d);
        y = yAccessor(d);
        category = categoryAccessor?.(d);
      } else if (xKey && yKey) {
        x = d[xKey];
        y = Number(d[yKey]) || 0;
        category = categoryKey ? d[categoryKey] : undefined;
      } else {
        const keys = Object.keys(d);
        x = d[keys[0]];
        y = Number(d[keys[1]]) || 0;
        category = keys[2] ? d[keys[2]] : undefined;
      }

      if (typeof x === 'string' && !isNaN(Date.parse(x))) {
        x = new Date(x);
      }

      return {
        x, y, category: category || 'default', originalData: d, index
      } as ProcessedAreaDataPoint;
    }).filter(d => !isNaN(d.y));

    this.processedData.sort((a, b) => {
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime();
      }
      if (typeof a.x === 'number' && typeof b.x === 'number') {
        return a.x - b.x;
      }
      return String(a.x).localeCompare(String(b.x));
    });

    const groupedData = d3.group(this.processedData, d => d.category || 'default');
    this.seriesData = Array.from(groupedData, ([key, values]) => ({ key, values }));

    if (stackMode === 'none' || this.seriesData.length <= 1) {
      this.stackedData = this.seriesData.map(series => (
        { ...series, values: series.values.map(d => ({ ...d, y0: 0, y1: d.y })) }
      ));
    } else {
        const stack = d3.stack()
            .keys(this.seriesData.map(s => s.key))
            .value((d: any, key) => d[key] || 0)
            .order(d3.stackOrderNone)
            .offset(stackMode === 'stack' ? d3.stackOffsetNone : d3.stackOffsetExpand);

        const dataForStacking = Array.from(d3.group(this.processedData, d => d.x).values()).map(values => {
            const obj: any = { x: values[0].x };
            this.seriesData.forEach(series => {
                const point = values.find(v => v.category === series.key);
                obj[series.key] = point ? point.y : 0;
            });
            return obj;
        });

        const stacked = stack(dataForStacking);
        this.stackedData = stacked.map((layer, i) => ({
            key: layer.key,
            values: layer.map((d, j) => ({
                x: d.data.x,
                y: d.data[layer.key],
                y0: d[0],
                y1: d[1],
                originalData: this.processedData.find(p => p.x === d.data.x && p.category === layer.key)?.originalData,
                index: j,
                category: layer.key
            }))
        }));
    }
  }

  private setupScales() {
    const { width, height, margin, stackMode } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allValues = this.stackedData.flatMap(series => series.values);
    
    let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
    const firstX = allValues[0]?.x;
    if (firstX instanceof Date) {
      xScale = d3.scaleTime().domain(d3.extent(allValues, d => d.x as Date) as [Date, Date]).range([0, chartWidth]);
    } else if (typeof firstX === 'number') {
      xScale = d3.scaleLinear().domain(d3.extent(allValues, d => d.x as number) as [number, number]).range([0, chartWidth]);
    } else {
      xScale = d3.scaleBand().domain(Array.from(new Set(allValues.map(d => String(d.x))))).range([0, chartWidth]).padding(0.1);
    }

    const yExtent = stackMode === 'percent' 
      ? [0, 1]
      : [0, d3.max(allValues, d => d.y1 || d.y) || 0];
    
    const yScale = d3.scaleLinear().domain(yExtent).range([chartHeight, 0]).nice();

    this.scales = { xScale, yScale, chartWidth, chartHeight };
  }

  public render() {
    const { width, height, margin, curve, fillOpacity, strokeWidth, colors, colorScheme, gradient, showGrid, showDots, dotRadius, animate, animationDuration } = this.config;
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${margin.left},${margin.top})`);
    this.g.selectAll('*').remove();

    const colorScale = d3.scaleOrdinal(colors);

    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.y0 || 0))
      .y1(d => yScale(d.y1 || d.y))
      .curve(d3[this.getCurve(curve)]);

    this.g.selectAll('.area-path').data(this.stackedData).enter().append('path')
        .attr('class', 'area-path')
        .attr('d', d => areaGenerator(d.values))
        .attr('fill', d => colorScale(d.key))
        .attr('fill-opacity', fillOpacity);

    const xAxis = d3.axisBottom(xScale);
    this.g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    this.g.append('g').attr('class', 'y-axis').call(yAxis);
  }

  private getCurve(curveName: string) {
      switch (curveName) {
          case 'monotone': return 'curveMonotoneX';
          case 'cardinal': return 'curveCardinal';
          case 'basis': return 'curveBasis';
          case 'step': return 'curveStep';
          default: return 'curveLinear';
      }
  }

  public update(newConfig: Partial<AreaChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
