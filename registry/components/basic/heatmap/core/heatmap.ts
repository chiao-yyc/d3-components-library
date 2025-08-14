
import * as d3 from 'd3';
import { ProcessedHeatmapDataPoint } from '../types';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { ColorScale, createColorScale } from '../../../core/color-scheme/color-manager';
import { ScaleManager } from '../../../primitives/scales/scale-manager';

import { HeatmapProps } from '../types';

export class D3Heatmap extends BaseChart<HeatmapProps> {
  private processedData: ProcessedHeatmapDataPoint[] = [];
  private xValues: string[] = [];
  private yValues: string[] = [];
  private gridData: ProcessedHeatmapDataPoint[] = [];
  private colorScale: ColorScale | null = null;
  private scaleManager: ScaleManager | null = null;
  private scales: any = {};

  constructor(props: HeatmapProps) {
    super(props);
  }

  protected processData(): ProcessedHeatmapDataPoint[] {
    const { data, mapping, xAccessor, yAccessor, valueAccessor, xKey, yKey, valueKey, domain } = this.props;
    if (!data?.length) {
      this.processedData = [];
      this.xValues = [];
      this.yValues = [];
      this.gridData = [];
      return [];
    }

    // 使用 DataProcessor 處理原始數據
    const processor = new DataProcessor({
      mapping: mapping,
      keys: { x: xKey, y: yKey, value: valueKey },
      accessors: { x: xAccessor, y: yAccessor, value: valueAccessor },
      autoDetect: true,
    });
    const processorResult = processor.process(data);
    if (processorResult.errors.length > 0) {
      this.handleError(new Error(processorResult.errors.join(', ')));
    }
    const processedByDataProcessor = processorResult.data;

    // DataProcessor 已經處理了 mapping，直接使用結果
    this.processedData = processedByDataProcessor.map((d, index) => {
      const x = String(d.x);
      const y = String(d.y);
      const value = Number(d.value) || 0;

      // 調試信息
      if (index < 3) {
        console.log('HeatMap data processing:', { 
          processedData: d,
          x, 
          y, 
          value,
          originalValue: d.value
        });
      }

      return {
        x,
        y,
        value,
        originalData: d.originalData,
        xIndex: 0,
        yIndex: 0,
        normalizedValue: 0
      } as ProcessedHeatmapDataPoint;
    }).filter(d => !isNaN(d.value));

    this.xValues = Array.from(new Set(this.processedData.map(d => String(d.x)))).sort();
    this.yValues = Array.from(new Set(this.processedData.map(d => String(d.y)))).sort();

    const dataMap = new Map();
    this.processedData.forEach(d => {
      dataMap.set(`${d.x}-${d.y}`, d);
    });

    const values = this.processedData.map(d => d.value);
    const valueExtent = domain || d3.extent(values) as [number, number];
    const [minValue, maxValue] = valueExtent;

    // 調試網格數據生成
    console.log('HeatMap gridData generation:', {
      processedDataLength: this.processedData.length,
      xValues: this.xValues,
      yValues: this.yValues,
      valueExtent,
      minValue,
      maxValue
    });

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

    // 調試最終網格數據
    console.log('HeatMap final gridData:', {
      totalCells: this.gridData.length,
      cellsWithData: this.gridData.filter(d => d.value !== 0).length,
      sampleCells: this.gridData.slice(0, 5)
    });

    return this.processedData;
  }

  protected createScales(): void {
    const { cellPadding, colorScheme, colors, domain } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 初始化 ScaleManager
    this.scaleManager = new ScaleManager({ width: chartWidth, height: chartHeight });

    const cellWidth = chartWidth / this.xValues.length;
    const cellHeight = chartHeight / this.yValues.length;

    // 使用 ScaleManager 註冊比例尺
    this.scaleManager.registerScale('x', {
      type: 'band',
      domain: this.xValues,
      range: [0, chartWidth],
      padding: (cellPadding || 2) / cellWidth
    }, 'x');

    this.scaleManager.registerScale('y', {
      type: 'band', 
      domain: this.yValues,
      range: [0, chartHeight],
      padding: (cellPadding || 2) / cellHeight
    }, 'y');

    const xScale = this.scaleManager.getScale('x');
    const yScale = this.scaleManager.getScale('y');
    this.scales = { xScale, yScale, chartWidth, chartHeight };

    const values = this.processedData.map(d => d.value);
    const valueExtent = domain || d3.extent(values) as [number, number];

    // 調試信息
    console.log('HeatMap createScales with ScaleManager:', {
      processedDataLength: this.processedData.length,
      values: values.slice(0, 5),
      valueExtent,
      colorScheme,
      colors,
      scaleManager: !!this.scaleManager
    });

    if (colors) {
      this.colorScale = createColorScale(colors, valueExtent);
    } else {
      this.colorScale = createColorScale(colorScheme || 'blues', valueExtent);
    }
  }

  protected renderChart(): void {
    const { cellRadius, showValues, valueFormat, textColor, showXAxis, showYAxis, xAxisFormat, yAxisFormat, xAxisRotation, yAxisRotation, animate, animationDuration } = this.props;
    const { xScale, yScale, chartHeight } = this.scales;

    // 關鍵調試信息
    console.log('HeatMap renderChart:', {
      gridDataLength: this.gridData.length,
      gridDataSample: this.gridData.slice(0, 3),
      colorScale: this.colorScale,
      scalesReady: !!(xScale && yScale)
    });

    const g = this.createSVGContainer();

    const cells = g.selectAll('.heatmap-cell').data(this.gridData).enter().append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.x) || 0)
      .attr('y', d => yScale(d.y) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', cellRadius || 0)
      .attr('ry', cellRadius || 0)
      .attr('fill', d => {
        if (d.originalData === null) {
          return 'transparent'; // 沒有數據的格子透明
        }
        return this.colorScale!.getColor(d.value);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    if (animate) {
      cells.attr('opacity', 0).transition().duration(animationDuration || 750).delay((d, i) => (i % this.xValues.length) * 50).attr('opacity', 1);
    }

    if (showValues) {
      const labels = g.selectAll('.heatmap-label').data(this.gridData.filter(d => d.value !== 0)).enter().append('text')
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
        labels.attr('opacity', 0).transition().duration(animationDuration || 750).delay((d, i) => (i % this.xValues.length) * 50 + 200).attr('opacity', 1);
      }
    }

    // 使用 BaseChart 共用軸線渲染工具
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis,
      showYAxis,
      xAxisConfig: {
        format: xAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280',
        rotation: xAxisRotation
      },
      yAxisConfig: {
        format: yAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280',
        rotation: yAxisRotation
      }
    });
  }

  protected getChartType(): string {
    return 'heatmap';
  }
}
