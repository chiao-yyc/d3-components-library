/**
 * 雷達圖數據渲染器
 * 負責渲染雷達圖的數據區域、線條、數據點等元素
 */

import * as d3 from 'd3';
import { PolarUtils, RadarAxisConfig, InterpolationType } from './polar-utils';
import { ColorScale } from '../../core/color-scheme/types';

export interface RadarDataPoint {
  x: number;
  y: number;
  value: any;
  normalizedValue: number;
  originalValue: number;
  axis: string;
}

export interface RadarSeries {
  label: string;
  values: any[];
  color: string;
  path: string;
  points: RadarDataPoint[];
  area?: string;
  index: number;
}

export interface DataStyles {
  strokeWidth?: number;
  areaOpacity?: number;
  dotRadius?: number;
  dotStroke?: string;
  dotStrokeWidth?: number;
  dotFill?: string;
}

export interface DataOptions {
  showArea?: boolean;
  showLine?: boolean;
  showDots?: boolean;
  interpolation?: InterpolationType;
  dataStyles?: DataStyles;
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  interactive?: boolean;
  onSeriesClick?: (series: RadarSeries, event: Event) => void;
  onSeriesHover?: (series: RadarSeries | null, event: Event) => void;
  onDotClick?: (point: RadarDataPoint, series: RadarSeries, event: Event) => void;
  onDotHover?: (point: RadarDataPoint | null, series: RadarSeries | null, event: Event) => void;
}

export class RadarDataRenderer {
  /**
   * 渲染完整的雷達圖數據
   */
  static renderData(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    series: RadarSeries[],
    centerX: number,
    centerY: number,
    axes: RadarAxisConfig[],
    options: DataOptions = {}
  ): void {
    const {
      showArea = true,
      showLine = true,
      showDots = true,
      animate = true
    } = options;

    // 清理現有數據
    container.selectAll('.radar-data').remove();

    // 創建數據群組
    const dataGroup = container.append('g').attr('class', 'radar-data');

    // 渲染順序：區域 -> 線條 -> 數據點
    const renderOrder = [];

    if (showArea) {
      renderOrder.push(() => this.renderAreas(dataGroup, series, options));
    }

    if (showLine) {
      renderOrder.push(() => this.renderLines(dataGroup, series, options));
    }

    if (showDots) {
      renderOrder.push(() => this.renderDots(dataGroup, series, options));
    }

    // 依序渲染各層
    renderOrder.forEach((renderFunc, index) => {
      if (animate) {
        setTimeout(() => renderFunc(), index * (options.animationDelay || 100));
      } else {
        renderFunc();
      }
    });
  }

  /**
   * 渲染數據區域
   */
  static renderAreas(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    series: RadarSeries[],
    options: DataOptions = {}
  ): void {
    const {
      dataStyles = {},
      animate = true,
      animationDuration = 1000,
      interactive = true,
      onSeriesClick,
      onSeriesHover
    } = options;

    const { areaOpacity = 0.25 } = dataStyles;

    const areaGroup = container.append('g').attr('class', 'radar-areas');

    const areas = areaGroup.selectAll('.radar-area')
      .data(series)
      .enter()
      .append('path')
      .attr('class', (d, i) => `radar-area area-${i}`)
      .attr('data-testid', (d, i) => `radar-area-${i}`)
      .attr('d', d => d.area || d.path)
      .attr('fill', d => d.color)
      .attr('fill-opacity', animate ? 0 : areaOpacity)
      .attr('stroke', 'none')
      .style('cursor', interactive ? 'pointer' : 'default');

    // 動畫效果
    if (animate) {
      areas.transition()
        .duration(animationDuration)
        .delay((d, i) => i * 50)
        .ease(d3.easeQuadOut)
        .attr('fill-opacity', areaOpacity);
    }

    // 交互事件
    if (interactive) {
      areas
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', Math.min(areaOpacity + 0.2, 1));
          
          onSeriesHover?.(d, event);
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', areaOpacity);
          
          onSeriesHover?.(null, event);
        })
        .on('click', function(event, d) {
          onSeriesClick?.(d, event);
        });
    }
  }

  /**
   * 渲染數據線條
   */
  static renderLines(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    series: RadarSeries[],
    options: DataOptions = {}
  ): void {
    const {
      dataStyles = {},
      animate = true,
      animationDuration = 1000,
      interactive = true,
      onSeriesClick,
      onSeriesHover
    } = options;

    const { strokeWidth = 2 } = dataStyles;

    const lineGroup = container.append('g').attr('class', 'radar-lines');

    const lines = lineGroup.selectAll('.radar-line')
      .data(series)
      .enter()
      .append('path')
      .attr('class', (d, i) => `radar-line line-${i}`)
      .attr('data-testid', (d, i) => `radar-line-${i}`)
      .attr('d', d => d.path)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', strokeWidth)
      .style('cursor', interactive ? 'pointer' : 'default');

    // 動畫效果
    if (animate) {
      lines.each(function(d, i) {
        const line = d3.select(this);
        const node = line.node() as SVGPathElement;
        
        // 安全地獲取路徑長度，在測試環境中提供 fallback
        let totalLength = 0;
        try {
          if (node && typeof node.getTotalLength === 'function') {
            totalLength = node.getTotalLength();
          } else {
            // 測試環境 fallback: 估算路徑長度
            totalLength = 100; // 使用合理的默認值
          }
        } catch (error) {
          // 如果 getTotalLength() 失敗，使用估算值
          totalLength = 100;
        }
        
        line
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(animationDuration)
          .delay(i * 100)
          .ease(d3.easeQuadOut)
          .attr('stroke-dashoffset', 0)
          .on('end', function() {
            d3.select(this).attr('stroke-dasharray', 'none');
          });
      });
    }

    // 交互事件
    if (interactive) {
      lines
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke-width', strokeWidth + 2);
          
          onSeriesHover?.(d, event);
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke-width', strokeWidth);
          
          onSeriesHover?.(null, event);
        })
        .on('click', function(event, d) {
          onSeriesClick?.(d, event);
        });
    }
  }

  /**
   * 渲染數據點
   */
  static renderDots(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    series: RadarSeries[],
    options: DataOptions = {}
  ): void {
    const {
      dataStyles = {},
      animate = true,
      animationDuration = 1000,
      interactive = true,
      onDotClick,
      onDotHover
    } = options;

    const {
      dotRadius = 4,
      dotStroke = '#fff',
      dotStrokeWidth = 2
    } = dataStyles;

    const dotsGroup = container.append('g').attr('class', 'radar-dots');

    // 為每個系列創建點群組
    const seriesGroups = dotsGroup.selectAll('.series-dots')
      .data(series)
      .enter()
      .append('g')
      .attr('class', (d, i) => `series-dots series-${i}`);

    // 在每個系列群組中渲染點
    seriesGroups.each(function(seriesData, seriesIndex) {
      const group = d3.select(this);
      
      const dots = group.selectAll('.radar-dot')
        .data(seriesData.points)
        .enter()
        .append('circle')
        .attr('class', (d, i) => `radar-dot dot-${seriesIndex}-${i}`)
        .attr('data-testid', (d, i) => `radar-dot-${seriesIndex}-${i}`)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', animate ? 0 : dotRadius)
        .attr('fill', seriesData.color)
        .attr('stroke', dotStroke)
        .attr('stroke-width', dotStrokeWidth)
        .style('cursor', interactive ? 'pointer' : 'default')
        .datum(d => ({ point: d, series: seriesData }));

      // 動畫效果
      if (animate) {
        dots.transition()
          .duration(animationDuration / 2)
          .delay((d, i) => seriesIndex * 100 + i * 50)
          .ease(d3.easeBackOut.overshoot(1.5))
          .attr('r', dotRadius);
      }

      // 交互事件
      if (interactive) {
        dots
          .on('mouseenter', function(event, d: any) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', dotRadius + 2);
            
            onDotHover?.(d.point, d.series, event);
          })
          .on('mouseleave', function(event, d: any) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', dotRadius);
            
            onDotHover?.(null, null, event);
          })
          .on('click', function(event, d: any) {
            onDotClick?.(d.point, d.series, event);
          });
      }
    });
  }

  /**
   * 生成雷達圖數據系列
   */
  static generateRadarSeries(
    data: any[],
    axes: RadarAxisConfig[],
    centerX: number,
    centerY: number,
    colorScale: ColorScale | null,
    interpolation: InterpolationType = 'linear-closed',
    labelAccessor?: (d: any) => string,
    valueAccessor?: (d: any, axis: string) => number
  ): RadarSeries[] {
    return data.map((d, seriesIndex) => {
      const label = labelAccessor ? labelAccessor(d) : `Series ${seriesIndex + 1}`;
      const color = colorScale?.getColor ? colorScale.getColor(seriesIndex) : `hsl(${(seriesIndex * 137.5) % 360}, 70%, 50%)`;

      // 生成數據點
      const points: RadarDataPoint[] = axes.map((axis) => {
        const value = valueAccessor ? valueAccessor(d, axis.name) : d[axis.name] || 0;
        const normalizedValue = (value - axis.min) / (axis.max - axis.min);
        const radius = axis.scale(normalizedValue);
        const position = PolarUtils.polarToCartesian(centerX, centerY, radius, axis.angle);
        
        return {
          x: position.x,
          y: position.y,
          value,
          normalizedValue,
          originalValue: value,
          axis: axis.name
        };
      });

      // 生成路徑
      const path = PolarUtils.generateRadarPath(
        points.map(p => p.normalizedValue),
        axes,
        centerX,
        centerY,
        interpolation
      );

      return {
        label,
        values: points.map(p => p.value),
        color,
        path,
        points,
        area: path, // 區域路徑與線條路徑相同
        index: seriesIndex
      };
    });
  }

  /**
   * 更新數據樣式
   */
  static updateDataStyles(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    styles: DataStyles
  ): void {
    const {
      strokeWidth = 2,
      areaOpacity = 0.25,
      dotRadius = 4,
      dotStroke = '#fff',
      dotStrokeWidth = 2
    } = styles;

    // 更新線條樣式
    container.selectAll('.radar-line')
      .transition()
      .duration(300)
      .attr('stroke-width', strokeWidth);

    // 更新區域樣式
    container.selectAll('.radar-area')
      .transition()
      .duration(300)
      .attr('fill-opacity', areaOpacity);

    // 更新點樣式
    container.selectAll('.radar-dot')
      .transition()
      .duration(300)
      .attr('r', dotRadius)
      .attr('stroke', dotStroke)
      .attr('stroke-width', dotStrokeWidth);
  }

  /**
   * 高亮特定系列
   */
  static highlightSeries(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    seriesIndex: number | null,
    dimOpacity: number = 0.3
  ): void {
    if (seriesIndex === null) {
      // 取消高亮
      container.selectAll('.radar-area, .radar-line')
        .transition()
        .duration(200)
        .style('opacity', 1);
      
      container.selectAll('.radar-dot')
        .transition()
        .duration(200)
        .style('opacity', 1);
    } else {
      // 高亮指定系列
      container.selectAll('.radar-area, .radar-line')
        .transition()
        .duration(200)
        .style('opacity', (d: any, i: number) => i === seriesIndex ? 1 : dimOpacity);
      
      container.selectAll('.series-dots')
        .transition()
        .duration(200)
        .style('opacity', (d: any, i: number) => i === seriesIndex ? 1 : dimOpacity);
    }
  }

  /**
   * 切換數據可見性
   */
  static toggleDataVisibility(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    options: {
      showAreas?: boolean;
      showLines?: boolean;
      showDots?: boolean;
    }
  ): void {
    const { showAreas = true, showLines = true, showDots = true } = options;

    container.selectAll('.radar-areas')
      .style('display', showAreas ? 'block' : 'none');
    
    container.selectAll('.radar-lines')
      .style('display', showLines ? 'block' : 'none');
    
    container.selectAll('.radar-dots')
      .style('display', showDots ? 'block' : 'none');
  }

  /**
   * 獲取數據邊界框
   */
  static getDataBounds(series: RadarSeries[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    series.forEach(s => {
      s.points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });

    return { minX, maxX, minY, maxY };
  }
}