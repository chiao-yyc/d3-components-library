
import * as d3 from 'd3';
import { LineChartProps, ProcessedDataPoint } from './types';
import { BaseChart, BaseChartProps } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale } from '../../../core/color-scheme/color-manager';

export class D3LineChart extends BaseChart<LineChartProps> {
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};
  private colorScale: any;
  private seriesData: Record<string, ProcessedDataPoint[]> = {};

  constructor(props: LineChartProps) {
    super(props);
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, xAccessor, yAccessor, seriesKey } = this.props;
    
    const processor = new DataProcessor({
        mapping: mapping,
        keys: { x: xKey, y: yKey },
        accessors: { x: xAccessor, y: yAccessor },
        autoDetect: true,
    });
    const result = processor.process(data);
    
    if (result.errors.length > 0) {
        this.handleError(new Error(result.errors.join(', ')));
    }
    
    this.processedData = result.data as ProcessedDataPoint[];

    // Handle series data specifically for LineChart
    if (seriesKey) {
        const groups = d3.group(this.processedData, (d: any) => d.originalData[seriesKey]);
        this.seriesData = Object.fromEntries(groups);
    } else {
        this.seriesData = { 'default': this.processedData };
    }

    return this.processedData;
  }

  protected createScales(): void {
    const { colors } = this.props; // Use this.props
    const { chartWidth, chartHeight } = this.getChartDimensions(); // Use BaseChart's method

    console.log('LineChart createScales: processedData:', this.processedData);
    console.log('LineChart createScales: first x value:', this.processedData[0]?.x, 'type:', typeof this.processedData[0]?.x, 'isDate:', this.processedData[0]?.x instanceof Date);
    
    // Manual date conversion if x values are date strings
    const xValues = this.processedData.map((d: any) => {
      if (typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(d.x);
      }
      return d.x;
    });
    console.log('LineChart createScales: first converted x value:', xValues[0], 'type:', typeof xValues[0], 'isDate:', xValues[0] instanceof Date);
    
    const xDomain = d3.extent(xValues) as [any, any];
    console.log('LineChart createScales: xDomain:', xDomain);
    
    const xScale = xValues[0] instanceof Date
        ? d3.scaleTime().domain(xDomain).range([0, chartWidth]) // Use chartWidth
        : d3.scaleLinear().domain(xDomain).range([0, chartWidth]); // Use chartWidth

    const yDomain = d3.extent(this.processedData, (d: any) => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
    const yScale = d3.scaleLinear()
        .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
        .range([chartHeight, 0]); // Use chartHeight
            
    this.scales = { xScale, yScale, chartWidth, chartHeight }; // Update to chartWidth, chartHeight
            
    // Color scale (if there are multiple lines, set domain based on series key)
    this.colorScale = createColorScale({
        type: 'custom',
        colors: colors,
        domain: Object.keys(this.seriesData).map((_, i) => i), // Domain based on series keys
        interpolate: false
    });
  }

  protected renderChart(): void {
    const { showGrid, gridOpacity, strokeWidth, curve, showArea, areaOpacity, showDots, dotRadius, animate, animationDuration, interactive, showTooltip } = this.props; // Use this.props
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    // Use BaseChart's method to create SVG and G elements
    const g = this.createSVGContainer();
    
    if (showGrid) {
        g.append('g').attr('class', 'grid-x').selectAll('line').data((xScale as any).ticks()).enter().append('line')
            .attr('x1', (d: any) => (xScale as any)(d)).attr('x2', (d: any) => (xScale as any)(d)).attr('y1', 0).attr('y2', chartHeight) // Use chartHeight
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
        g.append('g').attr('class', 'grid-y').selectAll('line').data(yScale.ticks()).enter().append('line')
            .attr('x1', 0).attr('x2', chartWidth).attr('y1', (d: any) => yScale(d)).attr('y2', (d: any) => yScale(d)) // Use chartWidth
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
    }

    const lineGenerator = d3.line<any>()
      .x((d: any, i: number) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return (xScale as any)(xVal);
      })
      .y((d: any) => yScale(d.y))
      .curve((d3 as any)[this.getCurve(curve)]);
    
    const areaGenerator = d3.area<any>()
      .x((d: any, i: number) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return (xScale as any)(xVal);
      })
      .y0(chartHeight)
      .y1((d: any) => yScale(d.y))
      .curve((d3 as any)[this.getCurve(curve)]); // Use chartHeight

    Object.entries(this.seriesData).forEach(([key, seriesPoints], index) => {
        const seriesColor = this.colorScale.getColor(index); // Use colorScale with index
        if (!seriesPoints?.length) return;

        if (showArea) {
            g.append('path').datum(seriesPoints).attr('class', `area-${key}`).attr('d', areaGenerator)
                .attr('fill', seriesColor).attr('fill-opacity', areaOpacity);
        }

        const line = g.append('path').datum(seriesPoints).attr('class', `line-${key}`).attr('d', lineGenerator)
            .attr('fill', 'none').attr('stroke', seriesColor).attr('stroke-width', strokeWidth);

        if (animate) {
            const totalLength = (line.node() as SVGPathElement).getTotalLength();
            line.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength)
                .transition().duration(animationDuration).attr('stroke-dashoffset', 0);
        }

        if (showDots) {
            const dots = g.selectAll(`.dot-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `dot-${key}`)
                .attr('cx', (d: any) => {
                  const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
                  return (xScale as any)(xVal);
                })
                .attr('cy', (d: any) => yScale(d.y))
                .attr('r', animate ? 0 : dotRadius).attr('fill', seriesColor).attr('stroke', 'white').attr('stroke-width', 2);
            if (animate) {
                dots.transition().delay((d: any, i: number) => i * 50).duration(300).attr('r', dotRadius);
            }
        }
        
        if (interactive) {
            g.selectAll(`.interact-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `interact-${key}`)
                .attr('cx', (d: any) => {
                  const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
                  return (xScale as any)(xVal);
                })
                .attr('cy', (d: any) => yScale(d.y))
                .attr('r', Math.max(dotRadius * 2, 8)).attr('fill', 'transparent').style('cursor', 'pointer')
                .on('mouseenter', (event: any, d: any) => {
                    const [x, y] = d3.pointer(event, g.node());
                    this.createTooltip(x, y, `X: ${d.x}, Y: ${d.y}`); // Use BaseChart's createTooltip
                    this.props.onHover?.(d.originalData);
                })
                .on('mouseleave', () => {
                    this.hideTooltip(); // Use BaseChart's hideTooltip
                    this.props.onHover?.(null);
                })
                .on('click', (event: any, d: any) => {
                    this.props.onDataClick?.(d.originalData);
                });
        }
    });

    // 使用 BaseChart 共用軸線渲染工具
    const xAxisFormat = this.processedData[0]?.x instanceof Date ? d3.timeFormat('%m/%d') as any : undefined;
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true,
      xAxisConfig: {
        format: xAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      }
    });
  }

  protected getChartType(): string {
    return 'line';
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

  
}
