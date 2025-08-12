import * as d3 from 'd3'
import type { ComboChartSeries } from './chart-series-processor'

// 比例尺工廠類
export class ChartScaleFactory {
  
  /**
   * 創建 X 軸比例尺
   */
  static createXScale(xDomain: any[], contentWidth: number): any {
    const firstValue = xDomain[0]
    let scale: any

    if (firstValue instanceof Date) {
      scale = d3.scaleTime()
        .domain(xDomain as [Date, Date])
        .range([0, contentWidth])
    } else if (typeof firstValue === 'number') {
      scale = d3.scaleLinear()
        .domain(xDomain as [number, number])
        .range([0, contentWidth])
        .nice()
    } else {
      scale = d3.scaleBand()
        .domain(xDomain)
        .range([0, contentWidth])
        .padding(0.1)
    }

    return scale
  }

  /**
   * 創建 Y 軸比例尺
   */
  static createYScale(yDomain: [number, number], contentHeight: number): any {
    return d3.scaleLinear()
      .domain(yDomain)
      .range([contentHeight, 0])
      .nice()
  }

  /**
   * 註冊比例尺到 ScaleManager
   */
  static registerScales(
    registerExistingScale: (name: string, scale: any, config: any, axis?: string) => any,
    xDomain: any[],
    leftYDomain: [number, number],
    rightYDomain: [number, number],
    contentArea: { width: number; height: number },
    series: ComboChartSeries[]
  ) {
    // 創建比例尺
    const xScale = this.createXScale(xDomain, contentArea.width)
    const leftYScale = this.createYScale(leftYDomain, contentArea.height)
    const rightYScale = this.createYScale(rightYDomain, contentArea.height)

    // 註冊 X 軸比例尺
    const firstValue = xDomain[0]
    registerExistingScale('x', xScale, {
      type: firstValue instanceof Date ? 'time' : typeof firstValue === 'number' ? 'linear' : 'band',
      domain: xDomain,
      range: [0, contentArea.width],
      padding: typeof firstValue === 'string' ? 0.1 : undefined,
      nice: typeof firstValue === 'number'
    }, 'x')

    // 註冊左 Y 軸比例尺（如果有左軸系列）
    if (series.some(s => s.yAxis === 'left')) {
      registerExistingScale('leftY', leftYScale, {
        type: 'linear',
        domain: leftYDomain,
        range: [contentArea.height, 0],
        nice: true
      }, 'y')
    }

    // 註冊右 Y 軸比例尺（如果有右軸系列）
    if (series.some(s => s.yAxis === 'right')) {
      registerExistingScale('rightY', rightYScale, {
        type: 'linear',
        domain: rightYDomain,
        range: [contentArea.height, 0],
        nice: true
      }, 'y2')
    }

    return { xScale, leftYScale, rightYScale }
  }

  /**
   * 獲取曲線函數
   */
  static getCurveFunction(curveType: string = 'linear') {
    switch (curveType) {
      case 'linear': return d3.curveLinear
      case 'monotone': return d3.curveMonotoneX
      case 'cardinal': return d3.curveCardinal
      case 'basis': return d3.curveBasis
      case 'step': return d3.curveStep
      default: return d3.curveLinear
    }
  }
}