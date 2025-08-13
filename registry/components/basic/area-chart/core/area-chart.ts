
import * as d3 from 'd3';
import { AreaChartProps, ProcessedAreaDataPoint, AreaSeriesData } from './types';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale } from '../../../core/color-scheme/color-manager';
import { ProcessedDataPoint } from '../../../core/data-processor/types';

export class D3AreaChart extends BaseChart<AreaChartProps> {
  private seriesData: AreaSeriesData[] = [];
  private stackedData: any[] = [];
  private colorScale: any;

  constructor(config: AreaChartProps) {
    super(config);
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, categoryKey, xAccessor, yAccessor, categoryAccessor, stackMode } = this.props;
    if (!data?.length) {
      this.processedData = [];
      this.seriesData = [];
      this.stackedData = [];
      return [];
    }

    // 使用 DataProcessor 處理基本數據
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
    
    // 轉換為 AreaChart 特定格式並添加 category 信息
    this.processedData = result.data.map((d, index) => {
      let category: string | undefined;
      const originalData = data[index];
      
      if (mapping?.category) {
        category = typeof mapping.category === 'function' ? mapping.category(originalData) : originalData[mapping.category];
      } else if (categoryAccessor) {
        category = categoryAccessor(originalData);
      } else if (categoryKey) {
        category = originalData[categoryKey];
      }
      
      return {
        ...d,
        category: category || 'default',
        originalData,
        index
      } as ProcessedAreaDataPoint;
    }).filter(d => !isNaN(d.y));

    // 按 x 值排序
    this.processedData.sort((a, b) => {
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime();
      }
      if (typeof a.x === 'number' && typeof b.x === 'number') {
        return a.x - b.x;
      }
      return String(a.x).localeCompare(String(b.x));
    });

    // 分組處理
    const groupedData = d3.group(this.processedData, d => d.category || 'default');
    this.seriesData = Array.from(groupedData, ([key, values]) => ({ key, values }));

    // 堆疊處理
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
    
    return this.processedData;
  }

  protected createScales(): void {
    const { stackMode, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    const allValues = this.stackedData.flatMap(series => series.values);
    if (allValues.length === 0) {
      this.scales = { xScale: d3.scaleLinear(), yScale: d3.scaleLinear(), chartWidth, chartHeight };
      return;
    }
    
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
    
    // 創建顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      domain: this.seriesData.map((_, i) => i),
      interpolate: false
    });
  }

  protected renderChart(): void {
    const { 
      curve, fillOpacity, strokeWidth, showGrid, showDots, dotRadius, 
      animate, animationDuration, interactive, showTooltip, 
      showXAxis, showYAxis, xAxisFormat, yAxisFormat,
      onDataClick, onDataHover 
    } = this.props;
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    const g = this.createSVGContainer();

    if (showGrid) {
      // X axis grid
      g.append('g')
        .attr('class', 'grid grid-x')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.7);
      
      // Y axis grid  
      g.append('g')
        .attr('class', 'grid grid-y')
        .call(d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.7);
    }

    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.y0 || 0))
      .y1(d => yScale(d.y1 || d.y))
      .curve(d3[this.getCurve(curve || 'monotone')]);

    // 渲染區域
    const areas = g.selectAll('.area-path')
      .data(this.stackedData)
      .enter()
      .append('path')
      .attr('class', 'area-path')
      .attr('d', d => areaGenerator(d.values))
      .attr('fill', (d, i) => this.colorScale.getColor(i))
      .attr('fill-opacity', fillOpacity || 0.7)
      .attr('stroke', (d, i) => this.colorScale.getColor(i))
      .attr('stroke-width', strokeWidth || 2)
      .attr('stroke-opacity', 0.8);

    // 动画
    if (animate) {
      areas
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration || 750)
        .attr('opacity', 1);
    }

    // 如果需要顯示點
    if (showDots) {
      this.stackedData.forEach((series, seriesIndex) => {
        const dots = g.selectAll(`.dots-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append('circle')
          .attr('class', `dots dots-${seriesIndex}`)
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y1 || d.y))
          .attr('r', dotRadius || 3)
          .attr('fill', this.colorScale.getColor(seriesIndex))
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
          
        if (animate) {
          dots
            .attr('opacity', 0)
            .transition()
            .duration(animationDuration || 750)
            .delay((d, i) => i * 50)
            .attr('opacity', 1);
        }
      });
    }

    // 互動事件
    if (interactive && showTooltip) {
      areas
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [x, y] = d3.pointer(event, g.node());
          const content = `Series: ${d.key}<br/>Values: ${d.values.length} points`;
          this.createTooltip(x, y, content);
          onDataHover?.(d.values[0], d.key);
        })
        .on('mouseleave', () => {
          this.hideTooltip();
          onDataHover?.(null);
        })
        .on('click', (event, d) => {
          onDataClick?.(d.values[0], d.key);
        });
    }

    // 渲染軸線
    if (showXAxis !== false) {
      const xAxis = d3.axisBottom(xScale);
      if (xAxisFormat) {
        xAxis.tickFormat(xAxisFormat);
      }
      
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280');
    }

    if (showYAxis !== false) {
      const yAxis = d3.axisLeft(yScale);
      if (yAxisFormat) {
        yAxis.tickFormat(yAxisFormat);
      }
      
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280');
    }
  }

  protected getChartType(): string {
    return 'area';
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
