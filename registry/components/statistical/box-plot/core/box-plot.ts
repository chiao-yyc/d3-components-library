import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { StatisticalUtils } from '../../shared/statistical-utils';
import { BoxPlotRenderer } from '../../shared/box-plot-renderer';
import { BoxPlotProps, ProcessedBoxPlotDataPoint/* , BoxPlotStatistics */ } from './types';

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
        
        const statistics = StatisticalUtils.calculateStatistics(values, this.props.statisticsMethod);
        
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
        const statistics = StatisticalUtils.calculateStatistics(numericValues, this.props.statisticsMethod);
        
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
      pointOpacity = 0.6,
      animate = true,
      animationDuration = 800,
      animationDelay = 0
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

    // 使用 BoxPlotRenderer.renderStandalone 渲染基本 BoxPlot 元素
    BoxPlotRenderer.renderStandalone(chartArea, this.processedData, {
      ...this.scales,
      colorScale: this.colorScale
    }, {
      orientation,
      boxWidth,
      whiskerWidth,
      showQuartiles: true, // BoxPlot 總是顯示四分位數（箱體）
      showMedian,
      showMean,
      showWhiskers,
      showOutliers,
      boxFillOpacity,
      boxStroke,
      boxStrokeWidth,
      meanStyle,
      outlierRadius,
      jitterWidth,
      animate,
      animationDuration,
      animationDelay
    });

    // 繪製 showAllPoints 功能（BoxPlot 特有功能，不在共用渲染器中）
    if (showAllPoints) {
      this.processedData.forEach((d, i) => {
        const boxGroup = chartArea.select(`.box-plot-group-${i}`);
        if (!boxGroup.empty()) {
          // 計算位置
          let centerX: number, centerY: number;

          if (orientation === 'vertical') {
            const xBandScale = xScale as d3.ScaleBand<string>;
            centerX = (xBandScale(d.label) || 0) + xBandScale.bandwidth() / 2;
            centerY = 0; // 不需要在垂直模式下使用
          } else {
            const yBandScale = yScale as d3.ScaleBand<string>;
            centerY = (yBandScale(d.label) || 0) + yBandScale.bandwidth() / 2;
            centerX = 0; // 不需要在水平模式下使用
          }

          this.renderAllPoints(boxGroup, d, orientation, centerX, centerY, i, pointColorMode, jitterWidth, pointRadius, pointOpacity, boxWidth, animate, animationDuration, animationDelay);
        }
      });
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
    boxWidth: number,
    animate?: boolean,
    animationDuration?: number,
    animationDelay?: number
  ): void {
    const { xScale, yScale } = this.scales;

    dataPoint.values.forEach((value, pointIndex) => {
      let pointX: number, pointY: number, pointColor: string;

      // 使用確定性的隨機數生成器，基於數值和索引確保一致性
      const deterministicSeed = StatisticalUtils.hashCode(value.toString() + pointIndex.toString() + categoryIndex.toString());
      const jitterOffset = StatisticalUtils.seededRandom(deterministicSeed);

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

      const point = group.append('circle')
        .attr('class', 'data-point')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('fill', pointColor)
        .attr('fill-opacity', opacity)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);
        
      if (animate) {
        point
          .attr('r', 0)
          .transition()
          .delay((animationDelay || 0) + categoryIndex * 100 + 900 + pointIndex * 30)
          .duration(animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('r', radius);
      } else {
        point.attr('r', radius);
      }
    });
  }



  protected getChartType(): string {
    return 'box-plot';
  }

  public update(newConfig: Partial<BoxPlotProps>): void {
    this.props = { ...this.props, ...newConfig };
    this.renderChart();
  }

}