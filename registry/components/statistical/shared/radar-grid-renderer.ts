/**
 * 雷達圖網格渲染器
 * 負責渲染同心圓網格、放射狀軸線、標籤等元素
 */

import * as d3 from 'd3';
import { PolarUtils, RadarAxisConfig } from './polar-utils';
import { 
  type StandardAxisStyles, 
  DEFAULT_AXIS_STYLES 
} from '../../core/axis-styles/axis-styles';

export interface GridStyles {
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fill?: string;
}

export interface LabelStyles {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging' | 'central';
}

export interface GridOptions {
  showGrid?: boolean;
  showGridLabels?: boolean;
  showAxes?: boolean;
  showAxisLabels?: boolean;
  levels?: number;
  gridStyles?: GridStyles;
  axisStyles?: GridStyles;
  labelStyles?: LabelStyles;
  gridLabelOffset?: number;
  axisLabelOffset?: number;
  valueFormat?: (value: number) => string;
  glowEffect?: boolean;
  // 新增：支持統一樣式系統
  standardAxisStyles?: Partial<StandardAxisStyles>;
}

export class RadarGridRenderer {
  /**
   * 渲染完整的雷達圖網格系統
   */
  static renderGrid(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    axes: RadarAxisConfig[],
    maxValue: number,
    options: GridOptions = {}
  ): void {
    const {
      showGrid = true,
      showGridLabels = true,
      showAxes = true,
      showAxisLabels = true,
      levels = 5,
      glowEffect = false,
      standardAxisStyles
    } = options;

    // 合併統一樣式與自定義樣式
    const mergedStandardStyles = { ...DEFAULT_AXIS_STYLES, ...standardAxisStyles };
    const unifiedLabelStyles: LabelStyles = {
      fontSize: parseInt(mergedStandardStyles.fontSize),
      fontFamily: mergedStandardStyles.fontFamily,
      fill: mergedStandardStyles.fontColor,
      ...options.labelStyles
    };

    // 清理現有網格
    container.selectAll('.radar-grid').remove();

    // 創建網格群組
    const gridGroup = container.append('g').attr('class', 'radar-grid');

    // 添加濾鏡效果（如果啟用）
    if (glowEffect) {
      this.addGlowFilter(container);
    }

    // 渲染同心圓
    if (showGrid) {
      this.renderConcentricCircles(
        gridGroup,
        centerX,
        centerY,
        radius,
        levels,
        options.gridStyles,
        glowEffect
      );
    }

    // 渲染放射軸
    if (showAxes) {
      this.renderRadialAxes(
        gridGroup,
        centerX,
        centerY,
        radius,
        axes,
        options.axisStyles,
        glowEffect
      );
    }

    // 渲染網格標籤
    if (showGridLabels) {
      this.renderGridLabels(
        gridGroup,
        centerX,
        centerY,
        radius,
        levels,
        maxValue,
        options.gridLabelOffset || 10,
        unifiedLabelStyles,
        options.valueFormat
      );
    }

    // 渲染軸標籤
    if (showAxisLabels) {
      this.renderAxisLabels(
        gridGroup,
        axes,
        unifiedLabelStyles
      );
    }
  }

  /**
   * 渲染同心圓網格
   */
  static renderConcentricCircles(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    levels: number,
    styles: GridStyles = {},
    glowEffect: boolean = false
  ): void {
    const {
      stroke = '#e5e7eb',
      strokeWidth = 1,
      opacity = 0.7,
      fill = 'none'
    } = styles;

    const circleGroup = container.append('g').attr('class', 'concentric-circles');

    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      
      circleGroup.append('circle')
        .attr('class', `grid-circle level-${level}`)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', r)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', opacity)
        .style('filter', glowEffect ? 'url(#glow)' : 'none');
    }
  }

  /**
   * 渲染放射狀軸線
   */
  static renderRadialAxes(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    axes: RadarAxisConfig[],
    styles: GridStyles = {},
    glowEffect: boolean = false
  ): void {
    const {
      stroke = '#9ca3af',
      strokeWidth = 1,
      opacity = 0.7
    } = styles;

    const axisGroup = container.append('g').attr('class', 'radial-axes');

    axes.forEach((axis, _index) => {
      const endPosition = PolarUtils.polarToCartesian(centerX, centerY, radius, axis.angle);

      axisGroup.append('line')
        .attr('class', `axis-line axis-${_index}`)
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', endPosition.x)
        .attr('y2', endPosition.y)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', opacity)
        .style('filter', glowEffect ? 'url(#glow)' : 'none');
    });
  }

  /**
   * 渲染網格標籤（數值標籤）
   */
  static renderGridLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    levels: number,
    maxValue: number,
    offset: number,
    styles: LabelStyles = {},
    valueFormat?: (value: number) => string
  ): void {
    const {
      fontSize = 10,
      fontFamily = 'sans-serif',
      fill = '#6b7280',
      textAnchor = 'start',
      dominantBaseline = 'middle'
    } = styles;

    const labelGroup = container.append('g').attr('class', 'grid-labels');

    for (let level = 1; level < levels; level++) { // 不渲染最外圈標籤
      const r = (radius / levels) * level;
      const labelValue = (maxValue * level) / levels;
      
      labelGroup.append('text')
        .attr('class', `grid-label level-${level}`)
        .attr('x', centerX + offset)
        .attr('y', centerY - r)
        .attr('text-anchor', textAnchor)
        .attr('dominant-baseline', dominantBaseline)
        .style('font-size', `${fontSize}px`)
        .style('font-family', fontFamily)
        .style('fill', fill)
        .text(valueFormat ? valueFormat(labelValue) : labelValue.toFixed(1));
    }
  }

  /**
   * 渲染軸標籤
   */
  static renderAxisLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    axes: RadarAxisConfig[],
    styles: LabelStyles = {}
  ): void {
    const {
      fontSize = 12,
      fontFamily = 'sans-serif',
      fill = '#374151',
      textAnchor = 'middle',
      dominantBaseline = 'middle'
    } = styles;

    const labelGroup = container.append('g').attr('class', 'axis-labels');

    axes.forEach((axis, _index) => {
      labelGroup.append('text')
        .attr('class', `axis-label axis-${_index}`)
        .attr('x', axis.position.x)
        .attr('y', axis.position.y)
        .attr('text-anchor', textAnchor)
        .attr('dominant-baseline', dominantBaseline)
        .style('font-size', `${fontSize}px`)
        .style('font-family', fontFamily)
        .style('font-weight', 'bold')
        .style('fill', fill)
        .text(axis.name);
    });
  }

  /**
   * 添加發光濾鏡效果
   */
  static addGlowFilter(
    container: d3.Selection<SVGGElement, unknown, null, undefined>
  ): void {
    // 避免重複創建濾鏡
    if (container.select('#glow').empty()) {
      const defs = container.append('defs');
      
      const filter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      filter.append('feGaussianBlur')
        .attr('stdDeviation', '2.5')
        .attr('result', 'coloredBlur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
  }

  /**
   * 渲染自定義網格圖案（多邊形網格）
   */
  static renderPolygonGrid(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    axes: RadarAxisConfig[],
    levels: number,
    styles: GridStyles = {}
  ): void {
    const {
      stroke = '#e5e7eb',
      strokeWidth = 1,
      opacity = 0.7,
      fill = 'none'
    } = styles;

    const polygonGroup = container.append('g').attr('class', 'polygon-grid');

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      
      const points = axes.map(axis => 
        PolarUtils.polarToCartesian(centerX, centerY, levelRadius, axis.angle)
      );

      const pathData = PolarUtils.generateLinearPath(points, true);

      polygonGroup.append('path')
        .attr('class', `grid-polygon level-${level}`)
        .attr('d', pathData)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', opacity);
    }
  }

  /**
   * 渲染網格點
   */
  static renderGridPoints(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number,
    radius: number,
    levels: number,
    axesCount: number,
    startAngle: number = 0,
    pointRadius: number = 2,
    styles: GridStyles = {}
  ): void {
    const {
      fill = '#9ca3af',
      opacity = 0.5
    } = styles;

    const pointsGroup = container.append('g').attr('class', 'grid-points');
    
    const gridPoints = PolarUtils.calculateGridPoints(
      centerX, 
      centerY, 
      radius, 
      levels, 
      axesCount, 
      startAngle
    );

    gridPoints.forEach(({ level, angle, point }, _index) => {
      pointsGroup.append('circle')
        .attr('class', `grid-point level-${level} angle-${Math.round(angle)}`)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', pointRadius)
        .attr('fill', fill)
        .attr('opacity', opacity);
    });
  }

  /**
   * 更新網格可見性
   */
  static updateGridVisibility(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    options: {
      showCircles?: boolean;
      showAxes?: boolean;
      showLabels?: boolean;
      showPoints?: boolean;
    }
  ): void {
    const { showCircles = true, showAxes = true, showLabels = true, showPoints = true } = options;

    container.selectAll('.concentric-circles')
      .style('display', showCircles ? 'block' : 'none');
    
    container.selectAll('.radial-axes')
      .style('display', showAxes ? 'block' : 'none');
    
    container.selectAll('.grid-labels, .axis-labels')
      .style('display', showLabels ? 'block' : 'none');
    
    container.selectAll('.grid-points')
      .style('display', showPoints ? 'block' : 'none');
  }
}