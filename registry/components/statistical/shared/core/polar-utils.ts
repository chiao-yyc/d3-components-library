/**
 * 極座標工具模組
 * 提供極座標轉換、角度計算、路徑生成等通用功能
 * 純 JavaScript/TypeScript 核心實現，框架無關
 */

import * as d3 from 'd3';

export interface Point {
  x: number;
  y: number;
}

export interface PolarPoint {
  radius: number;
  angle: number; // 角度（度）
}

export interface RadarAxisConfig {
  name: string;
  min: number;
  max: number;
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
  angle: number;
  position: Point;
}

export class PolarUtils {
  /**
   * 角度轉弧度
   */
  static angleToRadians(angle: number): number {
    return (angle * Math.PI) / 180;
  }

  /**
   * 弧度轉角度
   */
  static radiansToAngle(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * 極座標轉直角座標
   */
  static polarToCartesian(
    centerX: number, 
    centerY: number, 
    radius: number, 
    angle: number
  ): Point {
    const radians = this.angleToRadians(angle);
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  }

  /**
   * 直角座標轉極座標
   */
  static cartesianToPolar(
    x: number, 
    y: number, 
    centerX: number, 
    centerY: number
  ): PolarPoint {
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = this.radiansToAngle(Math.atan2(dy, dx));
    
    return { radius, angle };
  }

  /**
   * 計算雷達圖軸位置
   */
  static calculateAxisPositions(
    axes: string[],
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number = -90,
    clockwise: boolean = true,
    labelOffset: number = 20
  ): RadarAxisConfig[] {
    const totalAxes = axes.length;
    const angleStep = 360 / totalAxes;

    return axes.map((axis, index) => {
      const angle = startAngle + angleStep * index * (clockwise ? 1 : -1);
      const position = this.polarToCartesian(centerX, centerY, radius + labelOffset, angle);
      
      return {
        name: axis,
        min: 0,
        max: 1,
        scale: d3.scaleLinear().domain([0, 1]).range([0, radius]),
        angle,
        position
      };
    });
  }

  /**
   * 生成雷達圖路徑
   */
  static generateRadarPath(
    values: number[],
    axes: RadarAxisConfig[],
    centerX: number,
    centerY: number,
    interpolation: 'linear' | 'cardinal' | 'linear-closed' | 'cardinal-closed' = 'linear-closed'
  ): string {
    if (values.length !== axes.length) {
      throw new Error('Values length must match axes length');
    }

    const points = values.map((value, index) => {
      const axis = axes[index];
      const radius = axis.scale(value);
      return this.polarToCartesian(centerX, centerY, radius, axis.angle);
    });

    // 根據插值類型生成路徑
    switch (interpolation) {
      case 'linear':
        return this.generateLinearPath(points, false);
      
      case 'linear-closed':
        return this.generateLinearPath(points, true);
      
      case 'cardinal':
        return this.generateCardinalPath(points, false);
      
      case 'cardinal-closed':
        return this.generateCardinalPath(points, true);
      
      default:
        return this.generateLinearPath(points, true);
    }
  }

  /**
   * 生成線性路徑
   */
  private static generateLinearPath(points: Point[], closed: boolean = true): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    if (closed) {
      path += ' Z';
    }
    
    return path;
  }

  /**
   * 生成 Cardinal 平滑路徑
   */
  private static generateCardinalPath(points: Point[], closed: boolean = true): string {
    if (points.length < 2) return this.generateLinearPath(points, closed);

    // 使用 D3 的 line generator 搭配 cardinal interpolation
    const lineGenerator = d3.line<Point>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(closed ? d3.curveCardinalClosed : d3.curveCardinal);

    return lineGenerator(points) || '';
  }

  /**
   * 計算兩點之間的距離
   */
  static distance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 計算點到圓心的角度
   */
  static angleFromCenter(
    pointX: number, 
    pointY: number, 
    centerX: number, 
    centerY: number
  ): number {
    const dx = pointX - centerX;
    const dy = pointY - centerY;
    return this.radiansToAngle(Math.atan2(dy, dx));
  }

  /**
   * 標準化角度到 0-360 範圍
   */
  static normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) {
      normalized += 360;
    }
    return normalized;
  }

  /**
   * 計算角度差（考慮循環性）
   */
  static angleDifference(angle1: number, angle2: number): number {
    const diff = Math.abs(angle1 - angle2);
    return Math.min(diff, 360 - diff);
  }

  /**
   * 在兩個角度之間插值
   */
  static interpolateAngle(angle1: number, angle2: number, t: number): number {
    // 選擇最短路徑插值
    let diff = angle2 - angle1;
    
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    return this.normalizeAngle(angle1 + diff * t);
  }

  /**
   * 生成同心圓路徑
   */
  static generateConcentricCircle(
    centerX: number, 
    centerY: number, 
    radius: number
  ): string {
    return `M ${centerX - radius} ${centerY} 
            A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}
            A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`;
  }

  /**
   * 計算極座標網格的等分點
   */
  static calculateGridPoints(
    centerX: number,
    centerY: number,
    radius: number,
    levels: number,
    axes: number,
    startAngle: number = 0
  ): Array<{ level: number; angle: number; point: Point }> {
    const points: Array<{ level: number; angle: number; point: Point }> = [];
    const angleStep = 360 / axes;

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      
      for (let axisIndex = 0; axisIndex < axes; axisIndex++) {
        const angle = startAngle + angleStep * axisIndex;
        const point = this.polarToCartesian(centerX, centerY, levelRadius, angle);
        
        points.push({ level, angle, point });
      }
    }

    return points;
  }
}

// 導出常用角度常數
export const ANGLE_CONSTANTS = {
  NORTH: -90,
  EAST: 0,
  SOUTH: 90,
  WEST: 180,
  FULL_CIRCLE: 360,
  HALF_CIRCLE: 180,
  QUARTER_CIRCLE: 90
} as const;

// 導出常用插值類型
export type InterpolationType = 'linear' | 'cardinal' | 'linear-closed' | 'cardinal-closed';

export const INTERPOLATION_TYPES: Record<string, InterpolationType> = {
  LINEAR: 'linear',
  CARDINAL: 'cardinal',
  LINEAR_CLOSED: 'linear-closed',
  CARDINAL_CLOSED: 'cardinal-closed'
} as const;