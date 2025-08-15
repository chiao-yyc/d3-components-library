import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { BoxPlotProps, ProcessedBoxPlotDataPoint, BoxPlotStatistics } from './types';

export class D3BoxPlot extends BaseChart<BoxPlotProps> {
  private processedData: ProcessedBoxPlotDataPoint[] = [];
  private scales: any = {};
  private colorScale!: ColorScale;

  constructor(props: BoxPlotProps) {
    super(props);
  }

  protected processData(): ProcessedBoxPlotDataPoint[] {
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
        
        const statistics = this.calculateBoxPlotStatistics(values);
        
        return {
          label,
          values,
          statistics,
          originalData: d,
          index
        };
      }).filter(d => d.values.length > 0);
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
        const statistics = this.calculateBoxPlotStatistics(numericValues);
        
        return {
          label: String(label),
          values: numericValues,
          statistics,
          originalData: values.map(v => v.originalData || v),
          index
        };
      }).filter(d => d.values.length > 0);
    }

    return this.processedData;
  }

  protected createScales(): void {
    const { orientation, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 找出所有數值的範圍
    const allValues = this.processedData.flatMap(d => [
      d.statistics.min,
      d.statistics.max,
      ...d.statistics.outliers,
      ...(this.props.showAllPoints ? d.values : [])
    ]);
    const valueExtent = d3.extent(allValues) as [number, number];

    if (orientation === 'vertical') {
      const xScale = d3.scaleBand()
        .domain(this.processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([chartHeight, 0]);

      this.scales = { xScale, yScale, chartWidth, chartHeight };
    } else {
      const xScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([0, chartWidth]);

      const yScale = d3.scaleBand()
        .domain(this.processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2);

      this.scales = { xScale, yScale, chartWidth, chartHeight };
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
      boxWidth = 40,
      whiskerWidth = 20,
      showOutliers = true,
      showMean = true,
      showMedian = true,
      showWhiskers = true,
      showAllPoints = false,
      outlierRadius = 3,
      meanStyle = 'diamond',
      boxFillOpacity = 0.7,
      boxStroke = '#374151',
      boxStrokeWidth = 1,
      pointColorMode = 'uniform',
      jitterWidth = 0.6,
      pointRadius = 2,
      pointOpacity = 0.6
    } = this.props;

    const chartArea = this.createSVGContainer();
    const { xScale, yScale } = this.scales;

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

    // 繪製箱形圖組件
    this.processedData.forEach((d, i) => {
      const boxGroup = chartArea.append('g')
        .attr('class', `box-plot-group-${i}`);

      const color = this.colorScale.getColor(i);

      // 計算位置
      let boxX: number, boxY: number, boxWidthActual: number, boxHeightActual: number;
      let centerX: number, centerY: number;

      if (orientation === 'vertical') {
        const xBandScale = xScale as d3.ScaleBand<string>;
        const yLinearScale = yScale as d3.ScaleLinear<number, number>;
        
        centerX = (xBandScale(d.label) || 0) + xBandScale.bandwidth() / 2;
        boxX = centerX - boxWidth / 2;
        boxY = yLinearScale(d.statistics.q3);
        boxWidthActual = boxWidth;
        boxHeightActual = yLinearScale(d.statistics.q1) - yLinearScale(d.statistics.q3);
        centerY = boxY + boxHeightActual / 2;
      } else {
        const xLinearScale = xScale as d3.ScaleLinear<number, number>;
        const yBandScale = yScale as d3.ScaleBand<string>;
        
        centerY = (yBandScale(d.label) || 0) + yBandScale.bandwidth() / 2;
        boxX = xLinearScale(d.statistics.q1);
        boxY = centerY - boxWidth / 2;
        boxWidthActual = xLinearScale(d.statistics.q3) - xLinearScale(d.statistics.q1);
        boxHeightActual = boxWidth;
        centerX = boxX + boxWidthActual / 2;
      }

      // 繪製 whiskers
      if (showWhiskers) {
        this.renderWhiskers(boxGroup, d.statistics, orientation, centerX, centerY, whiskerWidth, boxStroke, boxStrokeWidth);
      }

      // 繪製箱體
      boxGroup.append('rect')
        .attr('class', 'box-rect')
        .attr('x', boxX)
        .attr('y', boxY)
        .attr('width', boxWidthActual)
        .attr('height', boxHeightActual)
        .attr('fill', color)
        .attr('fill-opacity', boxFillOpacity)
        .attr('stroke', boxStroke)
        .attr('stroke-width', boxStrokeWidth);

      // 繪製中位數線
      if (showMedian) {
        this.renderMedianLine(boxGroup, d.statistics, orientation, boxX, boxY, boxWidthActual, boxHeightActual, boxStroke, boxStrokeWidth + 1);
      }

      // 繪製平均值標記
      if (showMean && d.statistics.mean !== undefined) {
        this.renderMeanMarker(boxGroup, d.statistics, orientation, centerX, centerY, meanStyle, boxStroke, boxStrokeWidth);
      }

      // 繪製所有數值散點
      if (showAllPoints) {
        this.renderAllPoints(boxGroup, d, orientation, centerX, centerY, i, pointColorMode, jitterWidth, pointRadius, pointOpacity, boxWidth);
      }

      // 繪製異常值
      if (showOutliers) {
        this.renderOutliers(boxGroup, d, orientation, centerX, centerY, outlierRadius, color, boxStroke, jitterWidth, boxWidth);
      }
    });
  }

  private renderWhiskers(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: BoxPlotStatistics,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    whiskerWidth: number,
    stroke: string,
    strokeWidth: number
  ): void {
    const { xScale, yScale } = this.scales;

    if (orientation === 'vertical') {
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;
      
      // 上下 whisker 主線
      group.append('line')
        .attr('x1', centerX).attr('x2', centerX)
        .attr('y1', yLinearScale(statistics.q3)).attr('y2', yLinearScale(statistics.max))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      group.append('line')
        .attr('x1', centerX).attr('x2', centerX)
        .attr('y1', yLinearScale(statistics.q1)).attr('y2', yLinearScale(statistics.min))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      // whisker 端點
      group.append('line')
        .attr('x1', centerX - whiskerWidth / 2).attr('x2', centerX + whiskerWidth / 2)
        .attr('y1', yLinearScale(statistics.max)).attr('y2', yLinearScale(statistics.max))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      group.append('line')
        .attr('x1', centerX - whiskerWidth / 2).attr('x2', centerX + whiskerWidth / 2)
        .attr('y1', yLinearScale(statistics.min)).attr('y2', yLinearScale(statistics.min))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
    } else {
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      
      // 左右 whisker 主線
      group.append('line')
        .attr('x1', xLinearScale(statistics.q1)).attr('x2', xLinearScale(statistics.min))
        .attr('y1', centerY).attr('y2', centerY)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      group.append('line')
        .attr('x1', xLinearScale(statistics.q3)).attr('x2', xLinearScale(statistics.max))
        .attr('y1', centerY).attr('y2', centerY)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      // whisker 端點
      group.append('line')
        .attr('x1', xLinearScale(statistics.min)).attr('x2', xLinearScale(statistics.min))
        .attr('y1', centerY - whiskerWidth / 2).attr('y2', centerY + whiskerWidth / 2)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);

      group.append('line')
        .attr('x1', xLinearScale(statistics.max)).attr('x2', xLinearScale(statistics.max))
        .attr('y1', centerY - whiskerWidth / 2).attr('y2', centerY + whiskerWidth / 2)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
    }
  }

  private renderMedianLine(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: BoxPlotStatistics,
    orientation: 'vertical' | 'horizontal',
    boxX: number,
    boxY: number,
    boxWidth: number,
    boxHeight: number,
    stroke: string,
    strokeWidth: number
  ): void {
    const { xScale, yScale } = this.scales;

    if (orientation === 'vertical') {
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;
      
      group.append('line')
        .attr('x1', boxX).attr('x2', boxX + boxWidth)
        .attr('y1', yLinearScale(statistics.median)).attr('y2', yLinearScale(statistics.median))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
    } else {
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      
      group.append('line')
        .attr('x1', xLinearScale(statistics.median)).attr('x2', xLinearScale(statistics.median))
        .attr('y1', boxY).attr('y2', boxY + boxHeight)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
    }
  }

  private renderMeanMarker(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: BoxPlotStatistics,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    style: 'circle' | 'diamond' | 'square',
    stroke: string,
    strokeWidth: number
  ): void {
    if (statistics.mean === undefined) return;

    const { xScale, yScale } = this.scales;

    let meanX: number, meanY: number;
    if (orientation === 'vertical') {
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;
      meanX = centerX;
      meanY = yLinearScale(statistics.mean);
    } else {
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      meanX = xLinearScale(statistics.mean);
      meanY = centerY;
    }

    const size = 6;
    
    if (style === 'diamond') {
      group.append('path')
        .attr('d', `M ${meanX} ${meanY - size} L ${meanX + size} ${meanY} L ${meanX} ${meanY + size} L ${meanX - size} ${meanY} Z`)
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
    } else if (style === 'circle') {
      group.append('circle')
        .attr('cx', meanX).attr('cy', meanY).attr('r', 4)
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
    } else {
      group.append('rect')
        .attr('x', meanX - 4).attr('y', meanY - 4)
        .attr('width', 8).attr('height', 8)
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
    }
  }

  private renderAllPoints(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    dataPoint: ProcessedBoxPlotDataPoint,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    categoryIndex: number,
    colorMode: 'uniform' | 'by-value' | 'by-category',
    jitterWidth: number,
    radius: number,
    opacity: number,
    boxWidth: number
  ): void {
    const { xScale, yScale } = this.scales;

    dataPoint.values.forEach((value, pointIndex) => {
      let pointX: number, pointY: number, pointColor: string;

      // 使用確定性的隨機數生成器，基於數值和索引確保一致性
      const deterministicSeed = this.hashCode(value.toString() + pointIndex.toString() + categoryIndex.toString());
      const jitterOffset = this.seededRandom(deterministicSeed);

      // 計算位置
      if (orientation === 'vertical') {
        const yLinearScale = yScale as d3.ScaleLinear<number, number>;
        pointX = centerX + (jitterOffset - 0.5) * boxWidth * jitterWidth;
        pointY = yLinearScale(value);
      } else {
        const xLinearScale = xScale as d3.ScaleLinear<number, number>;
        pointX = xLinearScale(value);
        pointY = centerY + (jitterOffset - 0.5) * boxWidth * jitterWidth;
      }

      // 決定顏色
      if (colorMode === 'by-value') {
        const valueScale = d3.scaleSequential(d3.interpolateViridis)
          .domain(d3.extent(dataPoint.values) as [number, number]);
        pointColor = valueScale(value);
      } else if (colorMode === 'by-category') {
        pointColor = this.colorScale.getColor(categoryIndex);
      } else {
        pointColor = this.colorScale.getColor(categoryIndex);
      }

      group.append('circle')
        .attr('class', 'data-point')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('r', radius)
        .attr('fill', pointColor)
        .attr('fill-opacity', opacity)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);
    });
  }

  private renderOutliers(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    dataPoint: ProcessedBoxPlotDataPoint,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
    stroke: string,
    jitterWidth: number,
    boxWidth: number
  ): void {
    const { xScale, yScale } = this.scales;

    dataPoint.statistics.outliers.forEach((outlier, outlierIndex) => {
      let outlierX: number, outlierY: number;

      // 使用確定性的隨機數生成器，基於異常值和索引確保一致性
      const deterministicSeed = this.hashCode('outlier_' + outlier.toString() + outlierIndex.toString() + dataPoint.index.toString());
      const jitterOffset = this.seededRandom(deterministicSeed);

      if (orientation === 'vertical') {
        const yLinearScale = yScale as d3.ScaleLinear<number, number>;
        outlierX = centerX + (jitterOffset - 0.5) * boxWidth * jitterWidth;
        outlierY = yLinearScale(outlier);
      } else {
        const xLinearScale = xScale as d3.ScaleLinear<number, number>;
        outlierX = xLinearScale(outlier);
        outlierY = centerY + (jitterOffset - 0.5) * boxWidth * jitterWidth;
      }

      group.append('circle')
        .attr('class', 'outlier')
        .attr('cx', outlierX)
        .attr('cy', outlierY)
        .attr('r', radius)
        .attr('fill', color)
        .attr('fill-opacity', 0.6)
        .attr('stroke', stroke)
        .attr('stroke-width', 1);
    });
  }

  private calculateBoxPlotStatistics(values: number[]): BoxPlotStatistics {
    const { statisticsMethod = 'tukey' } = this.props;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    if (n === 0) {
      return {
        min: 0, q1: 0, median: 0, q3: 0, max: 0,
        outliers: [], iqr: 0, lowerFence: 0, upperFence: 0
      };
    }

    // 計算四分位數
    const q1 = d3.quantile(sorted, 0.25) || 0;
    const median = d3.quantile(sorted, 0.5) || 0;
    const q3 = d3.quantile(sorted, 0.75) || 0;
    const iqr = q3 - q1;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;

    // 計算上下界限
    let lowerFence: number, upperFence: number;
    if (statisticsMethod === 'tukey') {
      lowerFence = q1 - 1.5 * iqr;
      upperFence = q3 + 1.5 * iqr;
    } else {
      lowerFence = Math.min(...sorted);
      upperFence = Math.max(...sorted);
    }

    // 找出異常值
    const outliers = sorted.filter(val => val < lowerFence || val > upperFence);
    
    // 找出 whisker 的實際範圍
    const validValues = sorted.filter(val => val >= lowerFence && val <= upperFence);
    const min = validValues.length > 0 ? Math.min(...validValues) : sorted[0];
    const max = validValues.length > 0 ? Math.max(...validValues) : sorted[sorted.length - 1];

    return {
      min, q1, median, q3, max,
      outliers, mean, iqr,
      lowerFence, upperFence
    };
  }

  protected getChartType(): string {
    return 'box-plot';
  }

  public update(newConfig: Partial<BoxPlotProps>): void {
    this.props = { ...this.props, ...newConfig };
    this.renderChart();
  }

  // 確定性隨機數生成器輔助方法
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): number {
    // Linear congruential generator for deterministic random numbers
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    const x = (a * seed + c) % m;
    return x / m;
  }
}