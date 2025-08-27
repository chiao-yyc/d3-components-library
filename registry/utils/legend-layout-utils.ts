import * as d3 from 'd3';

/**
 * 圖例佈局配置介面
 */
export interface LegendLayoutConfig {
  position: 'top' | 'bottom' | 'left' | 'right';
  chartWidth: number;
  chartHeight: number;
  containerWidth: number;
  containerHeight: number;
  margins: { top: number; right: number; bottom: number; left: number };
  title?: string;
  
  // 尺寸配置
  maxHorizontalWidth?: number;
  maxVerticalHeight?: number;
  minBuffer?: number; // 最小緩衝空間
}

/**
 * 圖例佈局結果
 */
export interface LegendLayoutResult {
  position: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  isVertical: boolean;
  adjustmentReason?: string; // 位置調整原因
}

/**
 * 計算智能圖例佈局
 * 
 * 功能：
 * 1. 檢測可用空間
 * 2. 自動調整位置防止溢出
 * 3. 響應式尺寸調整
 * 
 * @param config 佈局配置
 * @returns 優化後的佈局結果
 */
export function calculateLegendLayout(config: LegendLayoutConfig): LegendLayoutResult {
  const {
    position,
    chartWidth,
    chartHeight,
    containerWidth,
    containerHeight,
    margins,
    maxHorizontalWidth = 200,
    maxVerticalHeight = 150,
    minBuffer = 40
  } = config;

  // 計算實際可用空間
  const availableRightSpace = containerWidth - chartWidth - margins.left - margins.right - minBuffer;
  const availableBottomSpace = containerHeight - chartHeight - margins.top - margins.bottom - minBuffer;
  const availableLeftSpace = margins.left - minBuffer;
  const availableTopSpace = margins.top - minBuffer;

  // 基礎尺寸計算
  const baseHorizontalWidth = Math.min(maxHorizontalWidth, chartWidth * 0.6);
  const baseVerticalHeight = Math.min(maxVerticalHeight, chartHeight * 0.6);
  
  let actualPosition = position;
  let adjustmentReason: string | undefined;
  
  // 智能位置調整邏輯
  if (position === 'right' && availableRightSpace < 80) {
    // 右側空間不足，嘗試底部
    if (availableBottomSpace >= 60) {
      actualPosition = 'bottom';
      adjustmentReason = '右側空間不足，自動切換到底部';
    } else if (availableLeftSpace >= 80) {
      actualPosition = 'left';
      adjustmentReason = '右側和底部空間不足，切換到左側';
    } else if (availableTopSpace >= 60) {
      actualPosition = 'top';
      adjustmentReason = '右側、底部、左側空間不足，切換到頂部';
    }
  } else if (position === 'bottom' && availableBottomSpace < 60) {
    // 底部空間不足，嘗試右側
    if (availableRightSpace >= 80) {
      actualPosition = 'right';
      adjustmentReason = '底部空間不足，自動切換到右側';
    } else if (availableTopSpace >= 60) {
      actualPosition = 'top';
      adjustmentReason = '底部和右側空間不足，切換到頂部';
    }
  } else if (position === 'left' && availableLeftSpace < 80) {
    if (availableRightSpace >= 80) {
      actualPosition = 'right';
      adjustmentReason = '左側空間不足，切換到右側';
    } else if (availableBottomSpace >= 60) {
      actualPosition = 'bottom';
      adjustmentReason = '左側和右側空間不足，切換到底部';
    }
  }

  // 根據最終位置計算尺寸
  const isVertical = actualPosition === 'left' || actualPosition === 'right';
  let legendWidth: number;
  let legendHeight: number;

  if (isVertical) {
    legendWidth = 20;
    legendHeight = Math.min(baseVerticalHeight, chartHeight * 0.8);
  } else {
    legendWidth = Math.min(baseHorizontalWidth, chartWidth * 0.8);
    legendHeight = 20;
  }

  // 計算座標位置
  let legendX: number;
  let legendY: number;

  switch (actualPosition) {
    case 'top':
      legendX = (chartWidth - legendWidth) / 2;
      legendY = -60;
      break;
      
    case 'bottom':
      legendX = (chartWidth - legendWidth) / 2;
      legendY = Math.min(chartHeight + 40, chartHeight + availableBottomSpace - legendHeight);
      break;
      
    case 'left':
      legendX = Math.max(-margins.left + 10, -80);
      legendY = (chartHeight - legendHeight) / 2;
      break;
      
    case 'right':
    default:
      legendX = Math.min(chartWidth + 20, chartWidth + availableRightSpace - legendWidth);
      legendY = (chartHeight - legendHeight) / 2;
      break;
  }

  return {
    position: actualPosition,
    x: legendX,
    y: legendY,
    width: legendWidth,
    height: legendHeight,
    isVertical,
    adjustmentReason
  };
}

/**
 * 創建響應式圖例群組
 * 
 * @param container SVG 容器
 * @param layout 佈局結果
 * @param className CSS 類別名
 * @returns 圖例群組元素
 */
export function createResponsiveLegendGroup(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  layout: LegendLayoutResult,
  className: string = 'chart-legend'
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const legendGroup = container.append('g')
    .attr('class', className)
    .attr('transform', `translate(${layout.x}, ${layout.y})`)
    .style('overflow', 'hidden'); // 防止溢出

  // 調試日誌
  if (layout.adjustmentReason) {
    console.log(`📍 Legend 佈局調整: ${layout.adjustmentReason}`);
  }
  
  console.log(`📏 Legend 佈局信息:`, {
    position: layout.position,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    isVertical: layout.isVertical
  });

  return legendGroup;
}

/**
 * 建立標準漸層圖例
 * 
 * @param legendGroup 圖例群組
 * @param gradientId 漸層 ID
 * @param colorStops 顏色停止點
 * @param layout 佈局結果
 */
export function createGradientLegend(
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  gradientId: string,
  colorStops: Array<{ offset: string; color: string }>,
  layout: LegendLayoutResult
): void {
  const svg = legendGroup.select(function() {
    return this.closest('svg');
  }) as d3.Selection<SVGSVGElement, unknown, null, undefined>;
  
  // 確保 defs 存在
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  
  // 創建漸層
  const gradient = defs.append('linearGradient')
    .attr('id', gradientId)
    .attr('gradientUnits', 'userSpaceOnUse');

  // 設定漸層方向
  if (layout.isVertical) {
    gradient.attr('x1', 0).attr('y1', layout.height).attr('x2', 0).attr('y2', 0);
  } else {
    gradient.attr('x1', 0).attr('y1', 0).attr('x2', layout.width).attr('y2', 0);
  }

  // 添加顏色停止點
  colorStops.forEach(stop => {
    gradient.append('stop')
      .attr('offset', stop.offset)
      .attr('stop-color', stop.color);
  });

  // 繪製漸層矩形
  legendGroup.append('rect')
    .attr('width', layout.width)
    .attr('height', layout.height)
    .style('fill', `url(#${gradientId})`)
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1);
}

/**
 * 添加圖例標題
 */
export function addLegendTitle(
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  title: string,
  layout: LegendLayoutResult
): void {
  legendGroup.append('text')
    .attr('class', 'legend-title')
    .attr('x', layout.isVertical ? -10 : layout.width / 2)
    .attr('y', layout.isVertical ? -10 : -10)
    .attr('text-anchor', layout.isVertical ? 'end' : 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text(title);
}

/**
 * 添加數值標籤
 */
export function addLegendLabels(
  legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  labels: Array<{ value: number; text: string }>,
  layout: LegendLayoutResult
): void {
  labels.forEach((label, i) => {
    const ratio = i / (labels.length - 1);
    const labelX = layout.isVertical ? layout.width + 5 : ratio * layout.width;
    const labelY = layout.isVertical ? layout.height - ratio * layout.height + 4 : layout.height + 15;

    legendGroup.append('text')
      .attr('class', 'legend-label')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', layout.isVertical ? 'start' : 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(label.text);
  });
}