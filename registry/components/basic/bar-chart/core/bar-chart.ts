
import * as d3 from 'd3';
import { BarChartProps, ProcessedDataPoint } from '../types';
import { BaseChart, BaseChartProps } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

export class D3BarChart extends BaseChart<BarChartProps> {
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};
  private colorScale!: ColorScale; // Add colorScale property

  constructor(props: BarChartProps) {
    super(props); // Call super with container and config

    // No need for defaultConfig here, BaseChart handles it
    // this.config is now this.props
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, xAccessor, yAccessor } = this.props;
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
    return this.processedData;
  }

  protected createScales(): void {
    const { orientation, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

    if (orientation === 'vertical') {
      xScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, chartWidth])
        .padding(0.1);
      yScale = d3.scaleLinear()
        .domain([0, d3.max(this.processedData, d => d.y) || 0])
        .range([chartHeight, 0])
        .nice();
    } else {
      xScale = d3.scaleLinear()
        .domain([0, d3.max(this.processedData, d => d.y) || 0])
        .range([0, chartWidth])
        .nice();
      yScale = d3.scaleBand()
        .domain(this.processedData.map(d => String(d.x)))
        .range([0, chartHeight])
        .padding(0.1);
    }
    this.scales = { xScale, yScale, chartWidth, chartHeight };
    
    this.colorScale = createColorScale({
        type: 'custom',
        colors: colors,
        domain: [0, this.processedData.length - 1],
        interpolate: false
    });
  }

  protected renderChart(): void {
    const { orientation, animate, animationDuration, interactive, showTooltip, showLabels, labelPosition, labelFormat } = this.props;
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    const g = this.createSVGContainer();

    const bars = g.selectAll('.bar')
      .data(this.processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('fill', (d, i) => this.colorScale.getColor(i));

    if (orientation === 'vertical') {
      bars
        .attr('x', d => (xScale as d3.ScaleBand<string>)(String(d.x)) || 0)
        .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
        .attr('y', animate ? chartHeight : d => (yScale as d3.ScaleLinear<number, number>)(d.y))
        .attr('height', animate ? 0 : d => chartHeight - (yScale as d3.ScaleLinear<number, number>)(d.y));
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
          .attr('height', d => chartHeight - (yScale as d3.ScaleLinear<number, number>)(d.y));
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
          this.props.onDataClick?.(d.originalData);
        })
        .on('mouseenter', (event, d) => {
          const element = d3.select(event.currentTarget);
          if (animate) {
            element.transition().duration(200).style('opacity', 0.8);
          } else {
            element.interrupt().style('opacity', 0.8);
          }
          if (showTooltip) {
            const [x, y] = d3.pointer(event, g.node());
            this.createTooltip(x, y, `X: ${d.x}<br/>Y: ${d.y}`);
          }
          this.props.onHover?.(d.originalData);
        })
        .on('mouseleave', (event) => {
          const element = d3.select(event.currentTarget);
          if (animate) {
            element.transition().duration(200).style('opacity', 1);
          } else {
            element.interrupt().style('opacity', 1);
          }
          if (showTooltip) {
            this.hideTooltip();
          }
          this.props.onHover?.(null);
        });
    }

    // 使用 BaseChart 共用軸線渲染工具
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true,
      xAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      }
    });

    // 渲染條形標籤
    if (showLabels) {
      this.renderBarLabels(g, this.processedData, {
        show: true,
        position: labelPosition || 'top',
        format: labelFormat,
        fontSize: '11px',
        fontColor: '#374151'
      }, { xScale, yScale }, orientation);
    }
  }

  protected getChartType(): string {
    return 'bar';
  }
}
