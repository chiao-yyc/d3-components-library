import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { StatisticalUtils, StatisticalData } from '../../shared/statistical-utils';
import { BoxPlotRenderer } from '../../shared/box-plot-renderer';
import { ViolinPlotProps, ProcessedViolinDataPoint, DensityPoint } from './types';

export class D3ViolinPlot extends BaseChart<ViolinPlotProps> {
  private processedData: ProcessedViolinDataPoint[] = [];
  private scales: any = {};
  private colorScale!: ColorScale;

  constructor(props: ViolinPlotProps) {
    super(props);
  }

  protected processData(): ProcessedViolinDataPoint[] {
    const { data, labelKey, valueKey, valuesKey, categoryKey } = this.props;
    
    if (!data?.length) {
      this.processedData = [];
      return this.processedData;
    }

    // 使用 DataProcessor 處理數據
    if (valuesKey) {
      // 情況1: 每個類別對應一個數組 (valuesKey 模式)
      this.processedData = data.map((d, index) => {
        const label = String(d[labelKey || 'label']);
        const values = Array.isArray(d[valuesKey]) ? d[valuesKey].filter(v => typeof v === 'number' && !isNaN(v)) : [];
        
        if (values.length === 0) return null;

        const statistics = StatisticalUtils.calculateStatistics(values, this.props.statisticsMethod);
        const densityData = this.calculateKernelDensity(values);
        
        return {
          label,
          values,
          statistics,
          densityData,
          originalData: d,
          index
        };
      }).filter(d => d !== null) as ProcessedViolinDataPoint[];
    } else {
      // 情況2: 長格式數據，需要分組 (labelKey + valueKey 模式)
      const processor = new DataProcessor({
        keys: { 
          x: categoryKey || labelKey || 'category', 
          y: valueKey || 'value' 
        },
        autoDetect: true
      });
      
      const result = processor.process(data);
      if (result.errors.length > 0) {
        this.handleError(new Error(result.errors.join(', ')));
        this.processedData = [];
        return this.processedData;
      }

      // 按類別分組數據
      const groupedData = d3.group(result.data, d => d.x);
      
      this.processedData = Array.from(groupedData.entries()).map(([label, values], index) => {
        const numericValues = values.map(v => v.y).filter(v => typeof v === 'number' && !isNaN(v));
        
        if (numericValues.length === 0) return null;

        const statistics = StatisticalUtils.calculateStatistics(numericValues, this.props.statisticsMethod);
        const densityData = this.calculateKernelDensity(numericValues);
        
        return {
          label: String(label),
          values: numericValues,
          statistics,
          densityData,
          originalData: values.map(v => v.originalData || v),
          index
        };
      }).filter(d => d !== null) as ProcessedViolinDataPoint[];
    }

    return this.processedData;
  }

  protected createScales(): void {
    const { orientation, colors, violinWidth } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 找出所有數值的範圍
    const allValues = this.processedData.flatMap(d => [
      d.statistics.min,
      d.statistics.max,
      ...d.statistics.outliers,
      ...d.values
    ]);
    const valueExtent = d3.extent(allValues) as [number, number];

    // 找出最大密度值（用於標準化小提琴寬度）
    const maxDensity = Math.max(...this.processedData.flatMap(d => d.densityData.map(p => p.density)));

    if (orientation === 'vertical') {
      const xScale = d3.scaleBand()
        .domain(this.processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([chartHeight, 0]);

      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2]);

      this.scales = { xScale, yScale, densityScale, chartWidth, chartHeight };
    } else {
      const xScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([0, chartWidth]);

      const yScale = d3.scaleBand()
        .domain(this.processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2);

      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2]);

      this.scales = { xScale, yScale, densityScale, chartWidth, chartHeight };
    }

    // 創建顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors || ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
      domain: [0, this.processedData.length - 1],
      interpolate: false
    });
  }

  protected renderChart(): void {
    if (!this.svgRef?.current) return;
    
    this.processData();
    this.createScales();

    const { 
      orientation = 'vertical',
      violinWidth = 80,
      showBoxPlot = true,
      boxPlotWidth = 15,
      showMedian = true,
      showMean = true,
      showQuartiles = true,
      showOutliers = true,
      violinFillOpacity = 0.7,
      violinStroke = '#374151',
      violinStrokeWidth = 1,
      boxPlotStroke = '#374151',
      boxPlotStrokeWidth = 2,
      medianStroke = '#000',
      medianStrokeWidth = 3,
      meanStyle = 'diamond'
    } = this.props;

    const chartArea = this.createSVGContainer();
    const { xScale, yScale, densityScale } = this.scales;

    // 使用 BaseChart 工具函數渲染坐標軸
    this.renderAxes(chartArea, { xScale, yScale }, {
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

    // 繪製小提琴圖
    this.processedData.forEach((d, i) => {
      const violinGroup = chartArea.append('g')
        .attr('class', `violin-group-${i}`);

      const color = this.colorScale.getColor(i);

      // 計算位置
      let centerX: number, centerY: number;
      let violinPath: string;

      if (orientation === 'vertical') {
        const xBandScale = xScale as d3.ScaleBand<string>;
        const yLinearScale = yScale as d3.ScaleLinear<number, number>;
        
        centerX = (xBandScale(d.label) || 0) + xBandScale.bandwidth() / 2;
        centerY = 0; // 不需要在垂直模式下使用

        // 生成小提琴路徑
        const leftPoints = d.densityData.map(p => [
          centerX - densityScale(p.density),
          yLinearScale(p.value)
        ] as [number, number]);

        const rightPoints = d.densityData.map(p => [
          centerX + densityScale(p.density),
          yLinearScale(p.value)
        ] as [number, number]);

        // 創建對稱的小提琴形狀
        const allPoints = [...leftPoints, ...rightPoints.reverse()];
        violinPath = d3.line().curve(d3.curveCatmullRom)(allPoints) || '';
      } else {
        const xLinearScale = xScale as d3.ScaleLinear<number, number>;
        const yBandScale = yScale as d3.ScaleBand<string>;
        
        centerY = (yBandScale(d.label) || 0) + yBandScale.bandwidth() / 2;
        centerX = 0; // 不需要在水平模式下使用

        // 生成橫向小提琴路徑
        const topPoints = d.densityData.map(p => [
          xLinearScale(p.value),
          centerY - densityScale(p.density)
        ] as [number, number]);

        const bottomPoints = d.densityData.map(p => [
          xLinearScale(p.value),
          centerY + densityScale(p.density)
        ] as [number, number]);

        // 創建對稱的小提琴形狀
        const allPoints = [...topPoints, ...bottomPoints.reverse()];
        violinPath = d3.line().curve(d3.curveCatmullRom)(allPoints) || '';
      }

      // 繪製小提琴路徑
      violinGroup.append('path')
        .attr('class', 'violin-path')
        .attr('d', violinPath)
        .attr('fill', color)
        .attr('fill-opacity', violinFillOpacity)
        .attr('stroke', violinStroke)
        .attr('stroke-width', violinStrokeWidth);

      // 繪製嵌入的 BoxPlot
      if (showBoxPlot) {
        BoxPlotRenderer.renderEmbedded(violinGroup, d.statistics, {
          centerX,
          centerY: orientation === 'vertical' ? centerY : centerY,
          orientation,
          boxWidth: boxPlotWidth,
          showQuartiles,
          showMedian,
          showMean,
          showWhiskers: true, // ViolinPlot 中的 BoxPlot 總是顯示 whiskers
          showOutliers,
          whiskerWidth: 10, // 較小的 whisker 寬度
          xScale,
          yScale,
          boxFill: 'white',
          boxFillOpacity: 0.8,
          boxStroke: boxPlotStroke,
          boxStrokeWidth: boxPlotStrokeWidth,
          medianStroke,
          medianStrokeWidth,
          meanStyle,
          outlierRadius: 2,
          outlierColor: color,
          categoryIndex: i,
          jitterWidth: 0.5
        });
      }
    });
  }

  /**
   * 計算核密度估計
   */
  private calculateKernelDensity(values: number[]): DensityPoint[] {
    const {
      bandwidth,
      resolution = 100,
      kdeMethod = 'gaussian',
      smoothing = 1,
      clipMin,
      clipMax
    } = this.props;

    if (values.length === 0) return [];

    // 計算自動帶寬
    const autoBandwidth = bandwidth || StatisticalUtils.calculateBandwidth(values);
    const adjustedBandwidth = autoBandwidth * smoothing;

    const min = clipMin ?? Math.min(...values);
    const max = clipMax ?? Math.max(...values);
    const range = max - min;
    const step = range / resolution;

    const kernelFunction = this.getKernelFunction(kdeMethod);
    const densityPoints: DensityPoint[] = [];

    for (let i = 0; i <= resolution; i++) {
      const x = min + i * step;
      let density = 0;

      for (const value of values) {
        const u = (x - value) / adjustedBandwidth;
        density += kernelFunction(u);
      }

      density = density / (values.length * adjustedBandwidth);
      densityPoints.push({ value: x, density });
    }

    return densityPoints;
  }

  /**
   * 獲取核函數
   */
  private getKernelFunction(method: string): (u: number) => number {
    switch (method) {
      case 'epanechnikov':
        return (u: number) => Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
      case 'triangular':
        return (u: number) => Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
      case 'gaussian':
      default:
        return (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
  }

  protected getChartType(): string {
    return 'violin-plot';
  }

  public update(newConfig: Partial<ViolinPlotProps>): void {
    this.props = { ...this.props, ...newConfig };
    this.renderChart();
  }
}