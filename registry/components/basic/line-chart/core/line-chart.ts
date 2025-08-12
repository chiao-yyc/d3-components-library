
import * as d3 from 'd3';
import { LineChartConfig, ProcessedDataPoint } from './types';

export class D3LineChart {
  private container: HTMLElement;
  private config: Required<Omit<LineChartConfig, 'xKey' | 'yKey' | 'seriesKey' | 'xAccessor' | 'yAccessor' | 'mapping' | 'tooltipFormat' | 'onDataClick' | 'onHover'> & LineChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedDataPoint[] = [];
  private seriesData: Record<string, ProcessedDataPoint[]> = {};
  private scales: any = {};

  constructor(container: HTMLElement, config: LineChartConfig) {
    this.container = container;
    const defaultConfig = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      strokeWidth: 2,
      curve: 'monotone' as const,
      showDots: false,
      dotRadius: 4,
      showArea: false,
      areaOpacity: 0.1,
      showGrid: true,
      gridOpacity: 0.2,
      showTooltip: true,
      animate: false,
      animationDuration: 1500,
      interactive: true,
    };

    this.config = { ...defaultConfig, ...config };
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, mapping, xAccessor, yAccessor, xKey, yKey, seriesKey } = this.config;
    if (!data?.length) {
        this.processedData = [];
        this.seriesData = {};
        return;
    }

    const processed = data.map((d) => {
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
        return {
            x: x instanceof Date ? x : (typeof x === 'string' && !isNaN(Date.parse(x))) ? new Date(x) : x,
            y: Number(y) || 0,
            originalData: d
        };
    });

    processed.sort((a, b) => {
        if (a.x instanceof Date && b.x instanceof Date) {
            return a.x.getTime() - b.x.getTime();
        }
        return String(a.x).localeCompare(String(b.x));
    });

    this.processedData = processed;

    if (seriesKey) {
        const groups = d3.group(processed, d => d.originalData[seriesKey]);
        this.seriesData = Object.fromEntries(groups);
    } else {
        this.seriesData = { 'default': processed };
    }
  }

  private setupScales() {
    const { width, height, margin } = this.config;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xDomain = d3.extent(this.processedData, d => d.x) as [any, any];
    const xScale = this.processedData[0]?.x instanceof Date
        ? d3.scaleTime().domain(xDomain).range([0, innerWidth])
        : d3.scaleLinear().domain(xDomain).range([0, innerWidth]);

    const yDomain = d3.extent(this.processedData, d => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
    const yScale = d3.scaleLinear()
        .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
        .range([innerHeight, 0]);

    this.scales = { xScale, yScale, innerWidth, innerHeight };
  }

  public render() {
    const { width, height, margin, showGrid, gridOpacity, colors, strokeWidth, curve, showArea, areaOpacity, showDots, dotRadius, animate, animationDuration, interactive } = this.config;
    const { xScale, yScale, innerWidth, innerHeight } = this.scales;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${margin.left},${margin.top})`);
    this.g.selectAll('*').remove();

    if (showGrid) {
        this.g.append('g').attr('class', 'grid-x').selectAll('line').data(xScale.ticks()).enter().append('line')
            .attr('x1', d => xScale(d)).attr('x2', d => xScale(d)).attr('y1', 0).attr('y2', innerHeight)
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
        this.g.append('g').attr('class', 'grid-y').selectAll('line').data(yScale.ticks()).enter().append('line')
            .attr('x1', 0).attr('x2', innerWidth).attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
    }

    const lineGenerator = d3.line<ProcessedDataPoint>().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3[this.getCurve(curve)]);
    const areaGenerator = d3.area<ProcessedDataPoint>().x(d => xScale(d.x)).y0(innerHeight).y1(d => yScale(d.y)).curve(d3[this.getCurve(curve)]);

    Object.entries(this.seriesData).forEach(([key, seriesPoints], index) => {
        const seriesColor = colors[index % colors.length];
        if (!seriesPoints?.length) return;

        if (showArea) {
            this.g.append('path').datum(seriesPoints).attr('class', `area-${key}`).attr('d', areaGenerator)
                .attr('fill', seriesColor).attr('fill-opacity', areaOpacity);
        }

        const line = this.g.append('path').datum(seriesPoints).attr('class', `line-${key}`).attr('d', lineGenerator)
            .attr('fill', 'none').attr('stroke', seriesColor).attr('stroke-width', strokeWidth);

        if (animate) {
            const totalLength = (line.node() as SVGPathElement).getTotalLength();
            line.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength)
                .transition().duration(animationDuration).attr('stroke-dashoffset', 0);
        }

        if (showDots) {
            const dots = this.g.selectAll(`.dot-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `dot-${key}`).attr('cx', d => xScale(d.x)).attr('cy', d => yScale(d.y))
                .attr('r', animate ? 0 : dotRadius).attr('fill', seriesColor).attr('stroke', 'white').attr('stroke-width', 2);
            if (animate) {
                dots.transition().delay((d, i) => i * 50).duration(300).attr('r', dotRadius);
            }
        }
        
        if (interactive) {
            this.g.selectAll(`.interact-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `interact-${key}`).attr('cx', d => xScale(d.x)).attr('cy', d => yScale(d.y))
                .attr('r', Math.max(dotRadius * 2, 8)).attr('fill', 'transparent').style('cursor', 'pointer')
                .on('mouseenter', (event, d) => {
                    this.config.onHover?.(d.originalData);
                })
                .on('mouseleave', () => {
                    this.config.onHover?.(null);
                })
                .on('click', (event, d) => {
                    this.config.onDataClick?.(d.originalData);
                });
        }
    });

    const xAxis = d3.axisBottom(xScale);
    if (this.processedData[0]?.x instanceof Date) {
        xAxis.tickFormat(d3.timeFormat('%m/%d') as any);
    }
    this.g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    this.g.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));
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

  public update(newConfig: Partial<LineChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupScales();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
