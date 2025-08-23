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
  
  // 動畫相關
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  animationEasing?: string;
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
        const rect = boxGroup.append('rect')
          .attr('class', 'box-rect')
          .attr('x', centerX - boxWidth / 2)
          .attr('width', boxWidth)
          .attr('fill', boxFill)
          .attr('fill-opacity', boxFillOpacity)
          .attr('stroke', boxStroke)
          .attr('stroke-width', boxStrokeWidth);
          
        if (options.animate) {
          rect
            .attr('y', yLinearScale(statistics.median))
            .attr('height', 0)
            .transition()
            .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100)
            .duration(options.animationDuration || 800)
            .ease(d3.easeBackOut)
            .attr('y', yLinearScale(statistics.q3))
            .attr('height', yLinearScale(statistics.q1) - yLinearScale(statistics.q3));
        } else {
          rect
            .attr('y', yLinearScale(statistics.q3))
            .attr('height', yLinearScale(statistics.q1) - yLinearScale(statistics.q3));
        }
      }

      // 繪製鬚線
      if (showWhiskers) {
        this.renderWhiskers(boxGroup, statistics, orientation, centerX, centerY, whiskerWidth, boxStroke, boxStrokeWidth, xScale, yScale, options);
      }

      // 繪製中位數線
      if (showMedian) {
        const medianLine = boxGroup.append('line')
          .attr('class', 'median-line')
          .attr('y1', yLinearScale(statistics.median))
          .attr('y2', yLinearScale(statistics.median))
          .attr('stroke', medianStroke)
          .attr('stroke-width', medianStrokeWidth);
          
        if (options.animate) {
          medianLine
            .attr('x1', centerX)
            .attr('x2', centerX)
            .transition()
            .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 200)
            .duration(options.animationDuration || 600)
            .ease(d3.easeBackOut)
            .attr('x1', centerX - boxWidth / 2)
            .attr('x2', centerX + boxWidth / 2);
        } else {
          medianLine
            .attr('x1', centerX - boxWidth / 2)
            .attr('x2', centerX + boxWidth / 2);
        }
      }

      // 繪製平均值標記
      if (showMean && statistics.mean !== undefined) {
        this.renderMeanMarker(boxGroup, statistics, orientation, centerX, centerY, meanStyle, boxStroke, boxStrokeWidth, xScale, yScale, options);
      }

      // 繪製異常值
      if (showOutliers) {
        this.renderOutliers(boxGroup, statistics.outliers, orientation, centerX, centerY, outlierRadius, outlierColor, boxStroke, categoryIndex, jitterWidth, boxWidth, xScale, yScale, options);
      }
    } else {
      // 水平方向的實現
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      
      // 繪製箱體
      if (showQuartiles) {
        const rect = boxGroup.append('rect')
          .attr('class', 'box-rect')
          .attr('y', centerY - boxWidth / 2)
          .attr('height', boxWidth)
          .attr('fill', boxFill)
          .attr('fill-opacity', boxFillOpacity)
          .attr('stroke', boxStroke)
          .attr('stroke-width', boxStrokeWidth);
          
        if (options.animate) {
          rect
            .attr('x', xLinearScale(statistics.median))
            .attr('width', 0)
            .transition()
            .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100)
            .duration(options.animationDuration || 800)
            .ease(d3.easeBackOut)
            .attr('x', xLinearScale(statistics.q1))
            .attr('width', xLinearScale(statistics.q3) - xLinearScale(statistics.q1));
        } else {
          rect
            .attr('x', xLinearScale(statistics.q1))
            .attr('width', xLinearScale(statistics.q3) - xLinearScale(statistics.q1));
        }
      }

      // 繪製鬚線
      if (showWhiskers) {
        this.renderWhiskers(boxGroup, statistics, orientation, centerX, centerY, whiskerWidth, boxStroke, boxStrokeWidth, xScale, yScale, options);
      }

      // 繪製中位數線
      if (showMedian) {
        const medianLine = boxGroup.append('line')
          .attr('class', 'median-line')
          .attr('x1', xLinearScale(statistics.median))
          .attr('x2', xLinearScale(statistics.median))
          .attr('stroke', medianStroke)
          .attr('stroke-width', medianStrokeWidth);
          
        if (options.animate) {
          medianLine
            .attr('y1', centerY)
            .attr('y2', centerY)
            .transition()
            .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 200)
            .duration(options.animationDuration || 600)
            .ease(d3.easeBackOut)
            .attr('y1', centerY - boxWidth / 2)
            .attr('y2', centerY + boxWidth / 2);
        } else {
          medianLine
            .attr('y1', centerY - boxWidth / 2)
            .attr('y2', centerY + boxWidth / 2);
        }
      }

      // 繪製平均值標記
      if (showMean && statistics.mean !== undefined) {
        this.renderMeanMarker(boxGroup, statistics, orientation, centerX, centerY, meanStyle, boxStroke, boxStrokeWidth, xScale, yScale, options);
      }

      // 繪製異常值
      if (showOutliers) {
        this.renderOutliers(boxGroup, statistics.outliers, orientation, centerX, centerY, outlierRadius, outlierColor, boxStroke, categoryIndex, jitterWidth, boxWidth, xScale, yScale, options);
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
      jitterWidth = 0.6,
      animate = true,
      animationDuration = 800,
      animationDelay = 0
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
        jitterWidth,
        animate,
        animationDuration,
        animationDelay
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
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
    options?: { animate?: boolean; animationDuration?: number; animationDelay?: number; categoryIndex?: number }
  ): void {
    if (orientation === 'vertical') {
      const yLinearScale = yScale as d3.ScaleLinear<number, number>;
      
      // 上下 whisker 主線
      const upperWhisker = group.append('line')
        .attr('x1', centerX).attr('x2', centerX)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
      
      const lowerWhisker = group.append('line')
        .attr('x1', centerX).attr('x2', centerX)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        upperWhisker
          .attr('y1', yLinearScale(statistics.q3))
          .attr('y2', yLinearScale(statistics.q3))
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 400)
          .duration(options.animationDuration || 600)
          .ease(d3.easeBackOut)
          .attr('y2', yLinearScale(statistics.max));
          
        lowerWhisker
          .attr('y1', yLinearScale(statistics.q1))
          .attr('y2', yLinearScale(statistics.q1))
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 400)
          .duration(options.animationDuration || 600)
          .ease(d3.easeBackOut)
          .attr('y2', yLinearScale(statistics.min));
      } else {
        upperWhisker
          .attr('y1', yLinearScale(statistics.q3))
          .attr('y2', yLinearScale(statistics.max));
        lowerWhisker
          .attr('y1', yLinearScale(statistics.q1))
          .attr('y2', yLinearScale(statistics.min));
      }

      // whisker 端點
      const upperCap = group.append('line')
        .attr('y1', yLinearScale(statistics.max)).attr('y2', yLinearScale(statistics.max))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      const lowerCap = group.append('line')
        .attr('y1', yLinearScale(statistics.min)).attr('y2', yLinearScale(statistics.min))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        upperCap
          .attr('x1', centerX).attr('x2', centerX)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 500)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('x1', centerX - whiskerWidth / 2)
          .attr('x2', centerX + whiskerWidth / 2);
          
        lowerCap
          .attr('x1', centerX).attr('x2', centerX)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 500)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('x1', centerX - whiskerWidth / 2)
          .attr('x2', centerX + whiskerWidth / 2);
      } else {
        upperCap
          .attr('x1', centerX - whiskerWidth / 2)
          .attr('x2', centerX + whiskerWidth / 2);
        lowerCap
          .attr('x1', centerX - whiskerWidth / 2)
          .attr('x2', centerX + whiskerWidth / 2);
      }
    } else {
      const xLinearScale = xScale as d3.ScaleLinear<number, number>;
      
      // 左右 whisker 主線
      const leftWhisker = group.append('line')
        .attr('y1', centerY).attr('y2', centerY)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
      
      const rightWhisker = group.append('line')
        .attr('y1', centerY).attr('y2', centerY)
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        leftWhisker
          .attr('x1', xLinearScale(statistics.q1))
          .attr('x2', xLinearScale(statistics.q1))
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 400)
          .duration(options.animationDuration || 600)
          .ease(d3.easeBackOut)
          .attr('x2', xLinearScale(statistics.min));
          
        rightWhisker
          .attr('x1', xLinearScale(statistics.q3))
          .attr('x2', xLinearScale(statistics.q3))
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 400)
          .duration(options.animationDuration || 600)
          .ease(d3.easeBackOut)
          .attr('x2', xLinearScale(statistics.max));
      } else {
        leftWhisker
          .attr('x1', xLinearScale(statistics.q1))
          .attr('x2', xLinearScale(statistics.min));
        rightWhisker
          .attr('x1', xLinearScale(statistics.q3))
          .attr('x2', xLinearScale(statistics.max));
      }

      // whisker 端點
      const leftCap = group.append('line')
        .attr('x1', xLinearScale(statistics.min)).attr('x2', xLinearScale(statistics.min))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      const rightCap = group.append('line')
        .attr('x1', xLinearScale(statistics.max)).attr('x2', xLinearScale(statistics.max))
        .attr('stroke', stroke).attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        leftCap
          .attr('y1', centerY).attr('y2', centerY)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 500)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('y1', centerY - whiskerWidth / 2)
          .attr('y2', centerY + whiskerWidth / 2);
          
        rightCap
          .attr('y1', centerY).attr('y2', centerY)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 500)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('y1', centerY - whiskerWidth / 2)
          .attr('y2', centerY + whiskerWidth / 2);
      } else {
        leftCap
          .attr('y1', centerY - whiskerWidth / 2)
          .attr('y2', centerY + whiskerWidth / 2);
        rightCap
          .attr('y1', centerY - whiskerWidth / 2)
          .attr('y2', centerY + whiskerWidth / 2);
      }
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
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
    options?: { animate?: boolean; animationDuration?: number; animationDelay?: number; categoryIndex?: number }
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
      const diamond = group.append('path')
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        diamond
          .attr('d', `M ${meanX} ${meanY} L ${meanX} ${meanY} L ${meanX} ${meanY} L ${meanX} ${meanY} Z`)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 600)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('d', `M ${meanX} ${meanY - size} L ${meanX + size} ${meanY} L ${meanX} ${meanY + size} L ${meanX - size} ${meanY} Z`);
      } else {
        diamond.attr('d', `M ${meanX} ${meanY - size} L ${meanX + size} ${meanY} L ${meanX} ${meanY + size} L ${meanX - size} ${meanY} Z`);
      }
    } else if (style === 'circle') {
      const circle = group.append('circle')
        .attr('cx', meanX).attr('cy', meanY)
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        circle
          .attr('r', 0)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 600)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('r', 4);
      } else {
        circle.attr('r', 4);
      }
    } else {
      const rect = group.append('rect')
        .attr('fill', '#fff')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth);
        
      if (options?.animate) {
        rect
          .attr('x', meanX).attr('y', meanY)
          .attr('width', 0).attr('height', 0)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 600)
          .duration(options.animationDuration || 400)
          .ease(d3.easeBackOut)
          .attr('x', meanX - 4).attr('y', meanY - 4)
          .attr('width', 8).attr('height', 8);
      } else {
        rect
          .attr('x', meanX - 4).attr('y', meanY - 4)
          .attr('width', 8).attr('height', 8);
      }
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
    yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
    options?: { animate?: boolean; animationDuration?: number; animationDelay?: number; categoryIndex?: number }
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

      const outlierCircle = group.append('circle')
        .attr('class', 'outlier')
        .attr('cx', outlierX)
        .attr('cy', outlierY)
        .attr('fill', color)
        .attr('fill-opacity', 0.6)
        .attr('stroke', stroke)
        .attr('stroke-width', 1);
        
      if (options?.animate) {
        outlierCircle
          .attr('r', 0)
          .transition()
          .delay((options.animationDelay || 0) + (options.categoryIndex || 0) * 100 + 700 + outlierIndex * 50)
          .duration(options.animationDuration || 300)
          .ease(d3.easeBackOut)
          .attr('r', radius);
      } else {
        outlierCircle.attr('r', radius);
      }
    });
  }
}