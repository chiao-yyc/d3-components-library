
import * as d3 from 'd3';
import { HeatmapConfig, ProcessedHeatmapDataPoint, LegendTick } from './types';

export class D3Heatmap {
  private container: HTMLElement;
  private config: Required<Omit<HeatmapConfig, 'xKey' | 'yKey' | 'valueKey' | 'xAccessor' | 'yAccessor' | 'valueAccessor' | 'mapping' | 'tooltipFormat' | 'onCellClick' | 'onCellHover'> & HeatmapConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedHeatmapDataPoint[] = [];
  private xValues: string[] = [];
  private yValues: string[] = [];
  private gridData: ProcessedHeatmapDataPoint[] = [];
  private scales: any = {};
  private colorScale: d3.ScaleSequential<number, string> | null = null;

  constructor(container: HTMLElement, config: HeatmapConfig) {
    this.container = container;
    const defaultConfig = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 80, bottom: 60, left: 80 },
      cellPadding: 2,
      cellRadius: 0,
      colorScheme: 'blues' as const,
      showXAxis: true,
      showYAxis: true,
      xAxisRotation: -45,
      yAxisRotation: 0,
      showLegend: true,
      legendPosition: 'right' as const,
      legendTitle: '數值',
      showValues: false,
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
    const { data, mapping, xAccessor, yAccessor, valueAccessor, xKey, yKey, valueKey, domain } = this.config;
    if (!data?.length) {
      this.processedData = [];
      this.xValues = [];
      this.yValues = [];
      this.gridData = [];
      return;
    }

    this.processedData = data.map((d, index) => {
      let x: string | number, y: string | number, value: number;

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x];
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y];
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0;
      } else if (xAccessor && yAccessor && valueAccessor) {
        x = xAccessor(d);
        y = yAccessor(d);
        value = valueAccessor(d);
      } else if (xKey && yKey && valueKey) {
        x = d[xKey];
        y = d[yKey];
        value = Number(d[valueKey]) || 0;
      } else {
        const keys = Object.keys(d);
        x = d[keys[0]];
        y = d[keys[1]];
        value = Number(d[keys[2]]) || 0;
      }

      return {
        x: String(x), y: String(y), value, originalData: d, xIndex: 0, yIndex: 0, normalizedValue: 0
      } as ProcessedHeatmapDataPoint;
    }).filter(d => !isNaN(d.value));

    this.xValues = Array.from(new Set(this.processedData.map(d => d.x))).sort();
    this.yValues = Array.from(new Set(this.processedData.map(d => d.y))).sort();

    const dataMap = new Map();
    this.processedData.forEach(d => {
      dataMap.set(`${d.x}-${d.y}`, d);
    });

    const values = this.processedData.map(d => d.value);
    const valueExtent = domain || d3.extent(values) as [number, number];
    const [minValue, maxValue] = valueExtent;

    this.gridData = [];
    this.yValues.forEach((y, yIndex) => {
      this.xValues.forEach((x, xIndex) => {
        const key = `${x}-${y}`;
        const existing = dataMap.get(key);
        
        if (existing) {
          this.gridData.push({
            ...existing, xIndex, yIndex, normalizedValue: (existing.value - minValue) / (maxValue - minValue)
          });
        } else {
          this.gridData.push({
            x, y, value: 0, xIndex, yIndex, normalizedValue: 0, originalData: null
          });
        }
      });
    });
  }

  private setupScales() {
    const { width, height, margin, cellPadding, colorScheme, colors, domain } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const cellWidth = chartWidth / this.xValues.length;
    const cellHeight = chartHeight / this.yValues.length;

    const xScale = d3.scaleBand().domain(this.xValues).range([0, chartWidth]).padding(cellPadding / cellWidth);
    const yScale = d3.scaleBand().domain(this.yValues).range([0, chartHeight]).padding(cellPadding / cellHeight);

    const values = this.processedData.map(d => d.value);
    const valueExtent = domain || d3.extent(values) as [number, number];

    if (colors) {
      this.colorScale = d3.scaleSequential().domain(valueExtent).interpolator(d3.interpolateRgbBasis(colors));
    } else {
      const schemes = {
        blues: d3.interpolateBlues,
        greens: d3.interpolateGreens,
        reds: d3.interpolateReds,
        oranges: d3.interpolateOranges,
        purples: d3.interpolatePurples,
        greys: d3.interpolateGreys
      };
      this.colorScale = d3.scaleSequential().domain(valueExtent).interpolator(schemes[colorScheme] || schemes.blues);
    }

    this.scales = { xScale, yScale, cellWidth, cellHeight, chartWidth, chartHeight };
  }

  public render() {
    const { width, height, margin, cellRadius, showValues, valueFormat, textColor, showXAxis, showYAxis, xAxisFormat, yAxisFormat, xAxisRotation, yAxisRotation, animate, animationDuration, interactive } = this.config;
    const { xScale, yScale, cellWidth, cellHeight, chartWidth, chartHeight } = this.scales;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${margin.left},${margin.top})`);
    this.g.selectAll('*').remove();

    const cells = this.g.selectAll('.heatmap-cell').data(this.gridData).enter().append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.x) || 0)
      .attr('y', d => yScale(d.y) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', cellRadius)
      .attr('ry', cellRadius)
      .attr('fill', d => d.value === 0 ? '#f3f4f6' : this.colorScale!(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    if (animate) {
      cells.attr('opacity', 0).transition().duration(animationDuration).delay((d, i) => (i % this.xValues.length) * 50).attr('opacity', 1);
    }

    if (showValues) {
      const labels = this.g.selectAll('.heatmap-label').data(this.gridData.filter(d => d.value !== 0)).enter().append('text')
        .attr('class', 'heatmap-label')
        .attr('x', d => (xScale(d.x) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.y) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .style('font-size', `${Math.min(xScale.bandwidth(), yScale.bandwidth()) / 4}px`)
        .style('fill', d => {
          if (typeof textColor === 'function') return textColor(d.value, d.normalizedValue);
          return textColor || (d.normalizedValue > 0.5 ? '#fff' : '#000');
        })
        .style('pointer-events', 'none')
        .text(d => valueFormat ? valueFormat(d.value) : d.value.toFixed(1));

      if (animate) {
        labels.attr('opacity', 0).transition().duration(animationDuration).delay((d, i) => (i % this.xValues.length) * 50 + 200).attr('opacity', 1);
      }
    }

    if (showXAxis) {
      const xAxis = d3.axisBottom(xScale);
      if (xAxisFormat) xAxis.tickFormat(xAxisFormat);
      const xAxisGroup = this.g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${chartHeight})`).call(xAxis);
      if (xAxisRotation !== 0) xAxisGroup.selectAll('text').style('text-anchor', xAxisRotation < 0 ? 'end' : 'start').attr('transform', `rotate(${xAxisRotation})`);
    }

    if (showYAxis) {
      const yAxis = d3.axisLeft(yScale);
      if (yAxisFormat) yAxis.tickFormat(yAxisFormat);
      const yAxisGroup = this.g.append('g').attr('class', 'y-axis').call(yAxis);
      if (yAxisRotation !== 0) yAxisGroup.selectAll('text').attr('transform', `rotate(${yAxisRotation})`);
    }

    this.g.selectAll('.domain').style('stroke', '#d1d5db');
    this.g.selectAll('.tick line').style('stroke', '#d1d5db');
  }

  public update(newConfig: Partial<HeatmapConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
