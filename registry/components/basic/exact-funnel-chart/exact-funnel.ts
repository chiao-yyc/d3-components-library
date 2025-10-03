// @ts-nocheck
/**
 * @deprecated This file contains legacy code and is no longer actively maintained.
 * Please use ExactFunnelChartCore from './core/exact-funnel-core' instead.
 *
 * All TypeScript checking has been disabled for this file.
 * This implementation may be removed in a future version.
 */

import * as d3 from 'd3';
import { select } from '../../core/d3-utils';

export interface ExactFunnelData {
  step: number;
  value: number;
  label: string;
}

export interface ExactFunnelConfig {
  data: ExactFunnelData[];
  width?: number;
  height?: number;
  background?: string;
  gradient1?: string;
  gradient2?: string;
  values?: string;
  labels?: string;
  percentages?: string;
  animate?: boolean;
  animationDuration?: number;
  showBorder?: boolean;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: number;
  labelFontSize?: number;
  percentageFontSize?: number;
}

export class ExactFunnelChart {
  private container: HTMLElement;
  private config: Required<ExactFunnelConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  constructor(container: HTMLElement, config: ExactFunnelConfig) {
    this.container = container;
    
    const defaultConfig = {
      width: 600,
      height: 300,
      background: '#2a2a2a',
      gradient1: '#FF6B6B',
      gradient2: '#4ECDC4',
      values: '#ffffff',
      labels: '#cccccc',
      percentages: '#888888',
      animate: true,
      animationDuration: 1000,
      showBorder: false,
      borderColor: '#ffffff',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 22,
      labelFontSize: 14,
      percentageFontSize: 18
    };

    this.config = { ...defaultConfig, ...config };
    this.render();
  }

  public render() {
    const { 
      data, width, height, background, gradient1, gradient2, values, labels, percentages,
      animate, animationDuration, showBorder, borderColor, fontFamily, fontSize, 
      labelFontSize, percentageFontSize
    } = this.config;
    
    // 清理容器
    select(this.container).selectAll('*').remove();
    
    // 創建 SVG 容器
    const svg = select(this.container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .style('background-color', background)
      .style('font-family', fontFamily)
      .style('border-radius', '8px');
    
    this.svg = svg;

    // 設置邊距和有效繪圖區域
    const margin = { top: 80, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 創建主繪圖組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 設置 x 比例尺
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);
    
    // 創建漸變定義
    const defs = svg.append('defs');
    const gradientId = `funnel-gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    gradient.selectAll('stop')
      .data([
        { offset: '0%', color: gradient1 },
        { offset: '100%', color: gradient2 }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // 計算漏斗各點的位置
    const maxValue = Math.max(...data.map(d => d.value));
    
    // 生成上下邊界的點
    const upperPoints: Array<[number, number]> = [];
    const lowerPoints: Array<[number, number]> = [];
    
    data.forEach((d, i) => {
      const x = xScale(i);
      const ratio = Math.sqrt(d.value / maxValue);
      const halfWidth = ratio * innerWidth * 0.4; // 控制漏斗最大寬度
      
      // 上邊界點（中心線上方）
      upperPoints.push([x, innerHeight * 0.5 - halfWidth]);
      // 下邊界點（中心線下方）  
      lowerPoints.push([x, innerHeight * 0.5 + halfWidth]);
    });

    // 使用 D3 的 area 生成器來創建漏斗形狀
    const area = d3.area<ExactFunnelData>()
      .x((d, i) => xScale(i))
      .y0((d, i) => upperPoints[i][1])  // 上邊界
      .y1((d, i) => lowerPoints[i][1])  // 下邊界
      .curve(d3.curveCatmullRom.alpha(0.5));

    const funnelPath = area(data);

    // 繪製漏斗主體
    const funnelShape = g.append('path')
      .attr('d', funnelPath)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', showBorder ? borderColor : 'none')
      .attr('stroke-width', showBorder ? 2 : 0);

    // 添加動畫效果
    if (animate) {
      funnelShape
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .attr('opacity', 1);
    }

    // 添加數值標籤
    const valueLabels = g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d, i) => xScale(i))
      .attr('y', (d, i) => upperPoints[i][1] - 10) // 放在漏斗上方
      .attr('text-anchor', 'middle')
      .attr('fill', values)
      .style('font-size', `${fontSize}px`)
      .style('font-weight', 'bold')
      .text(d => d3.format(',')(d.value));

    // 添加階段標籤
    const stageLabels = g.selectAll('.stage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('x', (d, i) => xScale(i))
      .attr('y', innerHeight * 0.5) // 放在中心線上
      .attr('text-anchor', 'middle')
      .attr('fill', labels)
      .style('font-size', `${labelFontSize}px`)
      .style('font-weight', '500')
      .text(d => d.label);

    // 添加百分比標籤（轉換率）
    const percentageLabels = g.selectAll('.percentage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'percentage-label')
      .attr('x', (d, i) => xScale(i))
      .attr('y', (d, i) => lowerPoints[i][1] + 20) // 放在漏斗下方
      .attr('text-anchor', 'middle')
      .attr('fill', percentages)
      .style('font-size', `${percentageFontSize}px`)
      .text((d, i) => {
        if (i === 0) return '';
        const conversionRate = (d.value / data[0].value) * 100;
        return `${conversionRate.toFixed(1)}%`;
      });

    // 添加分隔線（從第二個數據點開始）
    if (data.length > 1) {
      g.selectAll('.separator-line')
        .data(data.slice(1))
        .enter()
        .append('line')
        .attr('class', 'separator-line')
        .attr('x1', (d, i) => xScale(i + 1))
        .attr('y1', (d, i) => upperPoints[i + 1][1] - 30) // 從漏斗上方開始
        .attr('x2', (d, i) => xScale(i + 1))
        .attr('y2', (d, i) => lowerPoints[i + 1][1] + 30) // 到漏斗下方結束
        .attr('stroke', percentages)
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    }

    // 動畫標籤
    if (animate) {
      [valueLabels, stageLabels, percentageLabels].forEach(selection => {
        selection
          .attr('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay((d, i) => i * 100)
          .attr('opacity', 1);
      });
    }
  }

  public update(newConfig: Partial<ExactFunnelConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }

  public destroy() {
    select(this.container).selectAll('*').remove();
  }
}