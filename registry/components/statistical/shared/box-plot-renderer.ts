import * as d3 from 'd3';
import { StatisticalData, StatisticalUtils } from './statistical-utils';

export interface BoxPlotRenderOptions {
  // 位置和尺寸
  centerX: number;
  centerY: number;
  orientation: 'vertical' | 'horizontal';
  
  // Box plot 配置
  boxWidth: number;
  showQuartiles?: boolean;
  showMedian?: boolean;
  showMean?: boolean;
  showWhiskers?: boolean;
  showOutliers?: boolean;
  whiskerWidth?: number;
  
  // 比例尺
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
  
  // 樣式
  boxFill?: string;
  boxFillOpacity?: number;
  boxStroke?: string;
  boxStrokeWidth?: number;
  medianStroke?: string;
  medianStrokeWidth?: number;
  meanStyle?: 'circle' | 'diamond' | 'square';
  outlierRadius?: number;
  outlierColor?: string;
  
  // 數據相關
  categoryIndex?: number;
  jitterWidth?: number;
}

/**
 * BoxPlot 渲染器 - 可用於獨立渲染或嵌入到其他圖表中
 */
export class BoxPlotRenderer {
  /**
   * 渲染嵌入式 BoxPlot（用於 ViolinPlot 等組合圖表）
   * @param group D3 選擇器組
   * @param statistics 統計數據
   * @param options 渲染選項
   */
  static renderEmbedded(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: StatisticalData,
    options: BoxPlotRenderOptions
  ): void {
    const {
      centerX,
      centerY,
      orientation,
      boxWidth,
      showQuartiles = true,
      showMedian = true,
      showMean = true,
      showWhiskers = true,
      showOutliers = true,
      whiskerWidth = 20,
      xScale,
      yScale,
      boxFill = 'white',
      boxFillOpacity = 0.8,
      boxStroke = '#374151',
      boxStrokeWidth = 2,
      medianStroke = '#000',
      medianStrokeWidth = 3,
      meanStyle = 'diamond',
      outlierRadius = 2,
      outlierColor = '#3b82f6',
      categoryIndex = 0,
      jitterWidth = 0.6
    } = options;

    // 創建 BoxPlot 容器
    const boxGroup = group.append('g').attr('class', 'embedded-box-plot');

    if (orientation === 'vertical') {
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;
      
      // 繪製箱體
      if (showQuartiles) {
        boxGroup.append('rect')
          .attr('class', 'box-rect')
          .attr('x', centerX - boxWidth / 2)
          .attr('y', yLinearScale(statistics.q3))
          .attr('width', boxWidth)
          .attr('height', yLinearScale(statistics.q1) - yLinearScale(statistics.q3))
          .attr('fill', boxFill)
          .attr('fill-opacity', boxFillOpacity)
          .attr('stroke', boxStroke)
          .attr('stroke-width', boxStrokeWidth);
      }

      // 繪製鬚線
      if (showWhiskers) {
        this.renderWhiskers(boxGroup, statistics, orientation, centerX, centerY, whiskerWidth, boxStroke, boxStrokeWidth, xScale, yScale);
      }

      // 繪製中位數線
      if (showMedian) {
        boxGroup.append('line')
          .attr('class', 'median-line')
          .attr('x1', centerX - boxWidth / 2)
          .attr('x2', centerX + boxWidth / 2)
          .attr('y1', yLinearScale(statistics.median))
          .attr('y2', yLinearScale(statistics.median))
          .attr('stroke', medianStroke)
          .attr('stroke-width', medianStrokeWidth);
      }

      // 繪製平均值標記
      if (showMean && statistics.mean !== undefined) {
        this.renderMeanMarker(boxGroup, statistics, orientation, centerX, centerY, meanStyle, boxStroke, boxStrokeWidth, xScale, yScale);
      }

      // 繪製異常值
      if (showOutliers) {
        this.renderOutliers(boxGroup, statistics.outliers, orientation, centerX, centerY, outlierRadius, outlierColor, boxStroke, categoryIndex, jitterWidth, boxWidth, xScale, yScale);
      }
    } else {
      // 水平方向的實現
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      
      // 繪製箱體
      if (showQuartiles) {
        boxGroup.append('rect')
          .attr('class', 'box-rect')
          .attr('x', xLinearScale(statistics.q1))
          .attr('y', centerY - boxWidth / 2)
          .attr('width', xLinearScale(statistics.q3) - xLinearScale(statistics.q1))
          .attr('height', boxWidth)
          .attr('fill', boxFill)
          .attr('fill-opacity', boxFillOpacity)
          .attr('stroke', boxStroke)
          .attr('stroke-width', boxStrokeWidth);
      }

      // 繪製鬚線
      if (showWhiskers) {
        this.renderWhiskers(boxGroup, statistics, orientation, centerX, centerY, whiskerWidth, boxStroke, boxStrokeWidth, xScale, yScale);
      }

      // 繪製中位數線
      if (showMedian) {
        boxGroup.append('line')
          .attr('class', 'median-line')
          .attr('x1', xLinearScale(statistics.median))
          .attr('x2', xLinearScale(statistics.median))
          .attr('y1', centerY - boxWidth / 2)
          .attr('y2', centerY + boxWidth / 2)
          .attr('stroke', medianStroke)
          .attr('stroke-width', medianStrokeWidth);
      }

      // 繪製平均值標記
      if (showMean && statistics.mean !== undefined) {
        this.renderMeanMarker(boxGroup, statistics, orientation, centerX, centerY, meanStyle, boxStroke, boxStrokeWidth, xScale, yScale);
      }

      // 繪製異常值
      if (showOutliers) {
        this.renderOutliers(boxGroup, statistics.outliers, orientation, centerX, centerY, outlierRadius, outlierColor, boxStroke, categoryIndex, jitterWidth, boxWidth, xScale, yScale);
      }
    }
  }

  /**
   * 渲染獨立的 BoxPlot（用於 BoxPlot 組件）
   * @param chartArea 圖表區域
   * @param processedData 處理後的數據
   * @param scales 比例尺
   * @param options 渲染選項
   */
  static renderStandalone(
    chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
    processedData: any[],
    scales: any,
    options: Partial<BoxPlotRenderOptions>
  ): void {
    const {
      orientation = 'vertical',
      boxWidth = 40,
      whiskerWidth = 20,
      showQuartiles = true,
      showMedian = true,
      showMean = true,
      showWhiskers = true,
      showOutliers = true,
      boxFillOpacity = 0.7,
      boxStroke = '#374151',
      boxStrokeWidth = 1,
      medianStroke = '#000',
      medianStrokeWidth = 3,
      meanStyle = 'diamond',
      outlierRadius = 3,
      jitterWidth = 0.6
    } = options;

    const { xScale, yScale } = scales;

    // 渲染每個箱形圖
    processedData.forEach((d, i) => {
      const boxGroup = chartArea.append('g')
        .attr('class', `box-plot-group-${i}`);

      const color = scales.colorScale?.getColor(i) || '#3b82f6';

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

      // 使用嵌入式渲染方法
      this.renderEmbedded(boxGroup, d.statistics, {
        centerX,
        centerY,
        orientation,
        boxWidth,
        showQuartiles,
        showMedian,
        showMean,
        showWhiskers,
        showOutliers,
        whiskerWidth,
        xScale,
        yScale,
        boxFill: color,
        boxFillOpacity,
        boxStroke,
        boxStrokeWidth,
        medianStroke,
        medianStrokeWidth,
        meanStyle,
        outlierRadius,
        outlierColor: color,
        categoryIndex: i,
        jitterWidth
      });
    });
  }

  /**
   * 渲染鬚線
   */
  private static renderWhiskers(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: StatisticalData,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    whiskerWidth: number,
    stroke: string,
    strokeWidth: number,
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  ): void {
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

  /**
   * 渲染平均值標記
   */
  private static renderMeanMarker(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    statistics: StatisticalData,
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    style: 'circle' | 'diamond' | 'square',
    stroke: string,
    strokeWidth: number,
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  ): void {
    if (statistics.mean === undefined) return;

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

  /**
   * 渲染異常值
   */
  private static renderOutliers(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    outliers: number[],
    orientation: 'vertical' | 'horizontal',
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
    stroke: string,
    categoryIndex: number,
    jitterWidth: number,
    boxWidth: number,
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  ): void {
    outliers.forEach((outlier, outlierIndex) => {
      let outlierX: number, outlierY: number;

      // 使用確定性的隨機數生成器
      const deterministicSeed = StatisticalUtils.hashCode('outlier_' + outlier.toString() + outlierIndex.toString() + categoryIndex.toString());
      const jitterOffset = StatisticalUtils.seededRandom(deterministicSeed);

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
}