/**
 * ColorCore - 純 JS/TS 顏色管理核心邏輯
 * 框架無關的顏色配置和主題管理
 */

import * as d3 from 'd3';

export type ColorSchemeType = 'category10' | 'set3' | 'pastel' | 'dark' | 'custom';

export interface ColorCoreConfig {
  type: ColorSchemeType;
  customColors?: string[];
  domain?: string[];
}

export class ColorCore {
  private config: ColorCoreConfig;
  private colorScale: d3.ScaleOrdinal<string, string>;

  constructor(config: ColorCoreConfig) {
    this.config = config;
    this.colorScale = this.createColorScale();
  }

  private createColorScale(): d3.ScaleOrdinal<string, string> {
    const { type, customColors, domain } = this.config;
    let colors: string[];

    switch (type) {
      case 'category10':
        colors = [...d3.schemeCategory10];
        break;
      case 'set3':
        colors = [...d3.schemeSet3];
        break;
      case 'pastel':
        colors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];
        break;
      case 'dark':
        colors = ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'];
        break;
      case 'custom':
        colors = customColors || [...d3.schemeCategory10];
        break;
      default:
        colors = [...d3.schemeCategory10];
    }

    const scale = d3.scaleOrdinal<string, string>().range(colors);
    
    if (domain) {
      scale.domain(domain);
    }

    return scale;
  }

  public getColor(key: string): string {
    return this.colorScale(key);
  }

  public getColors(): string[] {
    return this.colorScale.range();
  }

  public getScale(): d3.ScaleOrdinal<string, string> {
    return this.colorScale;
  }

  public updateConfig(newConfig: Partial<ColorCoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.colorScale = this.createColorScale();
  }

  public getConfig(): ColorCoreConfig {
    return { ...this.config };
  }
}