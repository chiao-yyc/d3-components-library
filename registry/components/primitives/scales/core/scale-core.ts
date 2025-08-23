/**
 * ScaleCore - 純 JS/TS 比例尺核心邏輯
 * 框架無關的比例尺創建和管理
 */

import * as d3 from 'd3';

export type ScaleType = 'linear' | 'log' | 'sqrt' | 'time' | 'ordinal' | 'band' | 'point';

export interface ScaleCoreConfig {
  type: ScaleType;
  domain: any[];
  range: any[];
  nice?: boolean;
  clamp?: boolean;
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
}

export class ScaleCore {
  private config: ScaleCoreConfig;
  private scale: any;

  constructor(config: ScaleCoreConfig) {
    this.config = config;
    this.scale = this.createScale();
  }

  private createScale(): any {
    const { type, domain, range, nice, clamp, padding, paddingInner, paddingOuter } = this.config;
    
    let scale: any;
    
    switch (type) {
      case 'linear':
        scale = d3.scaleLinear();
        break;
      case 'log':
        scale = d3.scaleLog();
        break;
      case 'sqrt':
        scale = d3.scaleSqrt();
        break;
      case 'time':
        scale = d3.scaleTime();
        break;
      case 'ordinal':
        scale = d3.scaleOrdinal();
        break;
      case 'band':
        scale = d3.scaleBand();
        break;
      case 'point':
        scale = d3.scalePoint();
        break;
      default:
        scale = d3.scaleLinear();
    }

    scale.domain(domain).range(range);
    
    // 應用配置
    if (nice && scale.nice) scale.nice();
    if (clamp && scale.clamp) scale.clamp(clamp);
    if (padding !== undefined && scale.padding) scale.padding(padding);
    if (paddingInner !== undefined && scale.paddingInner) scale.paddingInner(paddingInner);
    if (paddingOuter !== undefined && scale.paddingOuter) scale.paddingOuter(paddingOuter);

    return scale;
  }

  public getScale(): any {
    return this.scale;
  }

  public updateConfig(newConfig: Partial<ScaleCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.scale = this.createScale();
  }

  public getConfig(): ScaleCoreConfig {
    return { ...this.config };
  }

  public copy(): ScaleCore {
    return new ScaleCore({ ...this.config });
  }
}