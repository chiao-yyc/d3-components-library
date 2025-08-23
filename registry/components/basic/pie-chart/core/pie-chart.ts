
import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { PieChartProps, ProcessedPieDataPoint } from './types';

export class D3PieChart extends BaseChart<PieChartProps> {
  private processedData: ProcessedPieDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private pieGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

  constructor(props: PieChartProps) {
    super(props);
  }

  protected processData(): { x: any; y: any; data: ProcessedPieDataPoint[] } {
    const { data, mapping, labelAccessor, valueAccessor, colorAccessor, labelKey, valueKey, colorKey } = this.props;
    
    if (!data?.length) {
      this.processedData = [];
      return { x: null, y: null, data: [] };
    }

    const processor = new DataProcessor({
      mapping: {
        x: mapping?.label || labelKey || labelAccessor,
        y: mapping?.value || valueKey || valueAccessor,
        color: mapping?.color || colorKey || colorAccessor
      },
      autoDetect: true
    });

    const result = processor.process(data);
    
    const processed = result.data.map((d, index) => ({
      label: String(d.x || ''),
      value: Number(d.y) || 0,
      color: d.color ? String(d.color) : undefined,
      originalData: d.originalData,
      x: d.x,
      y: d.y,
      index,
      percentage: 0,
      startAngle: 0,
      endAngle: 0
    } as ProcessedPieDataPoint)).filter(d => d.value > 0);

    const total = processed.reduce((sum, d) => sum + d.value, 0);
    processed.forEach(d => {
      d.percentage = (d.value / total) * 100;
    });

    this.processedData = processed.sort((a, b) => b.value - a.value);
    
    return {
      x: this.processedData.map(d => d.label),
      y: this.processedData.map(d => d.value),
      data: this.processedData
    };
  }

  protected createScales(): void {
    const { colors, colorScheme } = this.props;
    const hasColorData = this.processedData.some(d => d.color !== undefined);
    
    if (hasColorData) {
      const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
      this.colorScale = createColorScale({
        type: (colorScheme || 'custom') as any,
        colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        count: colorValues.length
      });
      this.colorScale.setDomain(colorValues as string[]);
    } else {
      this.colorScale = createColorScale({
        type: (colorScheme || 'custom') as any,
        colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        count: this.processedData.length
      });
      this.colorScale.setDomain(this.processedData.map((d, i) => i.toString()));
    }
  }

  protected renderChart(): void {
    const { innerRadius = 0, cornerRadius = 0, padAngle = 0, animate, animationDuration = 750, animationType = 'sweep', colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const outerRadius = Math.min(chartWidth, chartHeight) / 2 - 10;

    const g = this.createSVGContainer();
    this.pieGroup = g.append('g').attr('class', 'pie-group');
    this.pieGroup.attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    const pie = d3.pie<ProcessedPieDataPoint>()
      .value(d => d.value)
      .sort(null)
      .padAngle(padAngle);
      
    const arc = d3.arc<d3.PieArcDatum<ProcessedPieDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius);

    const arcs = pie(this.processedData);

    const paths = this.pieGroup.selectAll('.pie-slice')
      .data(arcs)
      .enter()
      .append('path')
      .attr('class', 'pie-slice')
      .attr('fill', (d, i) => {
        if (this.colorScale) {
          return this.colorScale.getColor(d.data.color || i.toString(), i);
        }
        const defaultColors = colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        return defaultColors[i % defaultColors.length];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    if (animate) {
      const transition = paths.transition().duration(animationDuration);
      
      switch (animationType) {
        case 'fade':
          paths.style('opacity', 0).attr('d', arc);
          transition.style('opacity', 1);
          break;
          
        case 'scale':
          paths.attr('transform', 'scale(0)').attr('d', arc);
          transition.attr('transform', 'scale(1)');
          break;
          
        case 'rotate':
          paths.attr('d', arc).style('transform-origin', 'center');
          paths.style('transform', 'rotate(-90deg)');
          transition.style('transform', 'rotate(0deg)');
          break;
          
        case 'sweep':
        default:
          transition.attrTween('d', d => {
            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return t => arc(i(t))!;
          });
          break;
      }
    } else {
      paths.attr('d', arc);
    }
  }

  public getChartType(): string {
    return 'pie';
  }

  protected setupEventListeners(): void {
    const { onSliceClick, onSliceHover, interactive } = this.props;
    
    if (!interactive) return;

    if (this.pieGroup) {
      this.pieGroup.selectAll('.pie-slice')
        .on('click', onSliceClick ? (event, d: any) => {
          onSliceClick(d.data);
        } : null)
        .on('mouseover', onSliceHover ? (event, d: any) => {
          onSliceHover(d.data);
        } : null)
        .on('mouseout', onSliceHover ? () => {
          onSliceHover(null);
        } : null);
    }
  }
}
