
import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { ScatterPlotProps, ProcessedScatterDataPoint } from './types';

export class D3ScatterPlot extends BaseChart<ScatterPlotProps> {
  private processedData: ProcessedScatterDataPoint[] = [];
  private scales: any = {};
  private colorScale: ColorScale | null = null;
  private trendlineData: { x: number; y: number }[] | null = null;
  private scatterGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

  constructor(props: ScatterPlotProps) {
    super(props);
  }

  protected processData(): { x: any; y: any; data: ProcessedScatterDataPoint[] } {
    const { data, mapping, xAccessor, yAccessor, sizeAccessor, colorAccessor, xKey, yKey, sizeKey, colorKey } = this.props;
    
    if (!data?.length) {
      this.processedData = [];
      return { x: null, y: null, data: [] };
    }

    const processor = new DataProcessor({
      mapping: {
        x: mapping?.x || xKey || xAccessor,
        y: mapping?.y || yKey || yAccessor,
        size: mapping?.size || sizeKey || sizeAccessor,
        color: mapping?.color || colorKey || colorAccessor
      },
      autoDetect: true
    });

    const result = processor.process(data);
    
    this.processedData = result.data.map((d, index) => ({
      x: Number(d.x) || 0,
      y: Number(d.y) || 0,
      size: d.size !== undefined ? Number(d.size) : undefined,
      color: d.color ? String(d.color) : undefined,
      originalData: d.originalData,
      index
    } as ProcessedScatterDataPoint));
    
    return {
      x: this.processedData.map(d => d.x),
      y: this.processedData.map(d => d.y),
      data: this.processedData
    };
  }

  protected createScales(): void {
    const { sizeRange = [3, 12], colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // X 軸比例尺
    const xDomain = d3.extent(this.processedData, d => d.x) as [number, number];
    const xPadding = (xDomain[1] - xDomain[0]) * 0.05;
    const xScale = d3.scaleLinear()
      .domain([xDomain[0] - xPadding, xDomain[1] + xPadding])
      .range([0, chartWidth]);

    // Y 軸比例尺
    const yDomain = d3.extent(this.processedData, d => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.05;
    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([chartHeight, 0]);

    // 大小比例尺
    let sizeScale: d3.ScaleSqrt<number, number> | null = null;
    if (this.processedData.some(d => d.size !== undefined)) {
      const sizeDomain = d3.extent(this.processedData, d => d.size) as [number, number];
      sizeScale = d3.scaleSqrt().domain(sizeDomain).range(sizeRange);
    }

    // 顏色比例尺
    const hasColorData = this.processedData.some(d => d.color !== undefined);
    if (hasColorData) {
      const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
      
      if (typeof this.processedData[0]?.color === 'number') {
        // 數值型顏色
        this.colorScale = createColorScale({
          type: 'blues',
          interpolate: true,
          count: colorValues.length
        });
        const colorDomain = d3.extent(this.processedData, d => Number(d.color)) as [number, number];
        this.colorScale.setDomain(colorDomain);
      } else {
        // 分類型顏色
        this.colorScale = createColorScale({
          type: 'custom',
          colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
          count: colorValues.length
        });
        this.colorScale.setDomain(colorValues as string[]);
      }
    }

    this.scales = { xScale, yScale, sizeScale, chartWidth, chartHeight };
  }

  private calculateTrendline() {
    const { showTrendline } = this.props;
    const { xScale, yScale } = this.scales;

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

  protected renderChart(): void {
    const { radius = 4, opacity = 0.7, strokeWidth = 1, strokeColor = 'white', 
            showTrendline = false, trendlineColor = '#ef4444', trendlineWidth = 2, 
            animate, animationDuration = 750, colors } = this.props;
    const { xScale, yScale, sizeScale, chartWidth, chartHeight } = this.scales;

    // 計算趨勢線
    this.calculateTrendline();

    const g = this.createSVGContainer();
    this.scatterGroup = g.append('g').attr('class', 'scatter-group');

    // 網格線
    this.scatterGroup.append('g').attr('class', 'grid-x')
      .selectAll('line')
      .data(xScale.ticks())
      .enter().append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2);

    this.scatterGroup.append('g').attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks())
      .enter().append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2);

    // 趋勢線
    if (this.trendlineData && showTrendline) {
      const lineGenerator = d3.line<{x: number, y: number}>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
      
      this.scatterGroup.append('path')
        .datum(this.trendlineData)
        .attr('class', 'trendline')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', trendlineColor)
        .attr('stroke-width', trendlineWidth)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8);
    }

    // 散點圖點
    const circles = this.scatterGroup.selectAll('.dot')
      .data(this.processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale ? sizeScale(d.size!) : radius)
      .attr('fill', (d, i) => {
        if (this.colorScale && d.color !== undefined) {
          return this.colorScale.getColor(d.color, i);
        }
        const defaultColors = colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        return defaultColors[i % defaultColors.length];
      })
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', animate ? 0 : opacity);

    // 動畫
    if (animate) {
      circles.transition()
        .delay((d, i) => i * 10)
        .duration(animationDuration)
        .attr('opacity', opacity);
    }

    // 軸線
    const xAxis = d3.axisBottom(xScale);
    this.scatterGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    this.scatterGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // 軸線樣式
    this.scatterGroup.selectAll('.domain').style('stroke', '#d1d5db');
    this.scatterGroup.selectAll('.tick line').style('stroke', '#d1d5db');
  }

  public getChartType(): string {
    return 'scatter';
  }

  protected setupEventListeners(): void {
    const { onDataClick, onHover, interactive } = this.props;
    
    if (!interactive) return;

    if (this.scatterGroup) {
      this.scatterGroup.selectAll('.dot')
        .on('click', onDataClick ? (event, d: any) => {
          onDataClick(d);
        } : null)
        .on('mouseover', onHover ? (event, d: any) => {
          onHover(d);
        } : null)
        .on('mouseout', onHover ? () => {
          onHover(null);
        } : null);
    }
  }

}
