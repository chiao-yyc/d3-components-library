/**
 * CandlestickChartCore - 純 JS/TS 的蠟燭圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core/base-chart-core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  ChartStateCallbacks
} from '../../../core/types';
import { /*createColorScale,*/ ColorScale } from '../../../core/color-scheme/color-manager';

// CandlestickChart 專用數據接口
export interface CandlestickData extends BaseChartData {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  [key: string]: any;
}

// 處理後的蠟燭圖數據點
export interface ProcessedCandlestickDataPoint extends BaseChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'doji';
  index: number;
  color: string;
  [key: string]: any; // 索引簽名以符合 BaseChartData
}

// CandlestickChart 專用配置接口
export interface CandlestickChartCoreConfig extends BaseChartCoreConfig<CandlestickData> {
  // 數據映射
  dateAccessor?: DataKeyOrAccessor<CandlestickData, Date | string>;
  openAccessor?: DataKeyOrAccessor<CandlestickData, number>;
  highAccessor?: DataKeyOrAccessor<CandlestickData, number>;
  lowAccessor?: DataKeyOrAccessor<CandlestickData, number>;
  closeAccessor?: DataKeyOrAccessor<CandlestickData, number>;
  volumeAccessor?: DataKeyOrAccessor<CandlestickData, number>;
  
  // 蠟燭圖配置
  orientation?: 'vertical' | 'horizontal';
  candleWidth?: number;
  wickWidth?: number;
  
  // 顏色配置
  colorMode?: 'tw' | 'us' | 'custom';
  upColor?: string;
  downColor?: string;
  dojiColor?: string;
  colors?: string[];
  
  // 成交量配置
  showVolume?: boolean;
  volumeHeightRatio?: number;
  volumeOpacity?: number;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  volumeAxisLabel?: string;
  
  // 交互配置
  enableZoom?: boolean;
  enablePan?: boolean;
  showCrosshair?: boolean;
  crosshairConfig?: {
    color?: string;
    opacity?: number;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  
  // 動畫
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  
  // 事件處理
  onDataClick?: (data: ProcessedCandlestickDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedCandlestickDataPoint | null, event: Event) => void;
}

// 預設配色
const DEFAULT_COLORS = {
  tw: { up: '#ef4444', down: '#22c55e', doji: '#6b7280' }, // 台股：紅漲綠跌
  us: { up: '#22c55e', down: '#ef4444', doji: '#6b7280' }, // 美股：綠漲紅跌
  custom: { up: '#10b981', down: '#f59e0b', doji: '#6b7280' }
};

// 主要的 CandlestickChart 核心類
export class CandlestickChartCore extends BaseChartCore<CandlestickData> {
  protected processedData: ProcessedCandlestickDataPoint[] = [];
  private _colorScale: ColorScale | null = null;
  private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private xScale: d3.ScaleTime<number, number> | null = null;
  private yScale: d3.ScaleLinear<number, number> | null = null;
  private volumeScale: d3.ScaleLinear<number, number> | null = null;
  
  private colorConfig: { up: string; down: string; doji: string } = DEFAULT_COLORS.tw;

  constructor(
    config: CandlestickChartCoreConfig,
    callbacks: ChartStateCallbacks = {}
  ) {
    super(config, callbacks);
  }

  protected processData(): ChartData<CandlestickData>[] {
    const config = this.config as CandlestickChartCoreConfig;
    const { 
      data, 
      dateAccessor, 
      openAccessor, 
      highAccessor, 
      lowAccessor, 
      closeAccessor, 
      volumeAccessor,
      colorMode = 'tw',
      upColor,
      downColor,
      dojiColor
    } = config;

    if (!data || data.length === 0) {
      this.processedData = [];
      return [];
    }

    // 設定顏色配置
    const modeColors = DEFAULT_COLORS[colorMode] || DEFAULT_COLORS.tw;
    this.colorConfig = {
      up: upColor || modeColors.up,
      down: downColor || modeColors.down,
      doji: dojiColor || modeColors.doji
    };

    // 處理每個數據點
    const rawProcessedData = data.map((item, index) => {
      // 處理日期
      let date: Date;
      if (typeof dateAccessor === 'function') {
        const dateValue = dateAccessor(item, index, data);
        date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      } else if (typeof dateAccessor === 'string' || typeof dateAccessor === 'number') {
        const dateValue = item[dateAccessor];
        date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      } else {
        date = typeof item.date === 'string' ? new Date(item.date) : item.date;
      }

      // 處理價格數據
      const open = this.extractValue(item, openAccessor, 'open', index, data);
      const high = this.extractValue(item, highAccessor, 'high', index, data);
      const low = this.extractValue(item, lowAccessor, 'low', index, data);
      const close = this.extractValue(item, closeAccessor, 'close', index, data);
      const volume = this.extractValue(item, volumeAccessor, 'volume', index, data) || 0;

      // 計算變化和方向
      const change = close - open;
      const changePercent = open !== 0 ? (change / open) * 100 : 0;
      
      let direction: 'up' | 'down' | 'doji' = 'doji';
      if (change > 0) direction = 'up';
      else if (change < 0) direction = 'down';

      const color = this.colorConfig[direction];

      return {
        date,
        open,
        high,
        low,
        close,
        volume,
        change,
        changePercent,
        direction,
        index,
        color,
        originalData: item
      };
    }).filter(d => !isNaN(d.open) && !isNaN(d.high) && !isNaN(d.low) && !isNaN(d.close));

    this.processedData = rawProcessedData as ProcessedCandlestickDataPoint[];

    return this.processedData;
  }

  private extractValue(
    item: CandlestickData, 
    accessor: DataKeyOrAccessor<CandlestickData, any> | undefined, 
    defaultKey: string, 
    index: number, 
    data: CandlestickData[]
  ): number {
    if (typeof accessor === 'function') {
      return Number(accessor(item, index, data)) || 0;
    } else if (typeof accessor === 'string' || typeof accessor === 'number') {
      return Number(item[accessor]) || 0;
    } else {
      return Number(item[defaultKey as keyof CandlestickData]) || 0;
    }
  }

  protected createScales(): Record<string, any> {
    if (this.processedData.length === 0) return {};

    const config = this.config as CandlestickChartCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 計算成交量圖表高度分配
    const showVolume = config.showVolume !== false;
    const volumeHeightRatio = config.volumeHeightRatio || 0.25;
    const priceChartHeight = showVolume 
      ? chartHeight * (1 - volumeHeightRatio) 
      : chartHeight;
    const volumeChartHeight = showVolume 
      ? chartHeight * volumeHeightRatio - 10 
      : 0;

    // 時間比例尺
    const timeExtent = d3.extent(this.processedData, d => d.date) as [Date, Date];
    const timePadding = (timeExtent[1].getTime() - timeExtent[0].getTime()) * 0.05;
    
    this.xScale = d3.scaleTime()
      .domain([
        new Date(timeExtent[0].getTime() - timePadding),
        new Date(timeExtent[1].getTime() + timePadding)
      ])
      .range([0, chartWidth]);

    // 價格比例尺
    const allPrices = this.processedData.flatMap(d => [d.high, d.low]);
    const priceExtent = d3.extent(allPrices) as [number, number];
    
    this.yScale = d3.scaleLinear()
      .domain(priceExtent)
      .nice()
      .range([priceChartHeight, 0]);

    // 成交量比例尺
    if (showVolume) {
      const volumes = this.processedData.map(d => d.volume).filter(v => v > 0);
      if (volumes.length > 0) {
        const maxVolume = Math.max(...volumes);
        this.volumeScale = d3.scaleLinear()
          .domain([0, maxVolume])
          .range([volumeChartHeight, 0]);
      }
    }

    return {
      xScale: this.xScale,
      yScale: this.yScale,
      volumeScale: this.volumeScale
    };
  }

  protected renderChart(): void {
    // 創建 SVG 容器和圖表組
    this.chartGroup = this.createSVGContainer();

    // 使用已處理的數據
    if (!this.processedData || this.processedData.length === 0) {
      this.chartGroup.selectAll('*').remove();
      return;
    }

    const config = this.config as CandlestickChartCoreConfig;

    // 渲染格線
    if (config.showGrid !== false) {
      this.renderGrid();
    }

    // 渲染蠟燭圖
    this.renderCandlesticks();

    // 渲染成交量
    if (config.showVolume !== false && this.volumeScale) {
      this.renderVolume();
    }

    // 使用統一軸線系統渲染軸線
    this.renderUnifiedAxes();
  }

  private renderGrid(): void {
    if (!this.chartGroup || !this.xScale || !this.yScale) return;

    const { chartWidth, chartHeight } = this.getChartDimensions();
    const config = this.config as CandlestickChartCoreConfig;
    const showVolume = config.showVolume !== false;
    const volumeHeightRatio = config.volumeHeightRatio || 0.25;
    const priceChartHeight = showVolume 
      ? chartHeight * (1 - volumeHeightRatio) 
      : chartHeight;

    const gridGroup = this.chartGroup.append('g').attr('class', 'grid');

    // 水平格線
    gridGroup.selectAll('.grid-horizontal')
      .data(this.yScale.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-horizontal')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => this.yScale!(d))
      .attr('y2', d => this.yScale!(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.5);

    // 垂直格線
    const timeTickCount = Math.min(10, Math.floor(chartWidth / 80));
    gridGroup.selectAll('.grid-vertical')
      .data(this.xScale.ticks(timeTickCount))
      .enter()
      .append('line')
      .attr('class', 'grid-vertical')
      .attr('x1', d => this.xScale!(d))
      .attr('x2', d => this.xScale!(d))
      .attr('y1', 0)
      .attr('y2', priceChartHeight)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.5);
  }

  private renderCandlesticks(): void {
    if (!this.chartGroup || !this.xScale || !this.yScale) return;

    const config = this.config as CandlestickChartCoreConfig;
    const {
      candleWidth = 0.8,
      wickWidth = 1,
      animate = true,
      animationDuration = 1000,
      animationDelay = 100
    } = config;

    // 計算蠟燭寬度
    const { chartWidth } = this.getChartDimensions();
    const baseSpacing = chartWidth / this.processedData.length;
    const actualCandleWidth = baseSpacing * candleWidth;

    // 創建蠟燭組
    const candleGroups = this.chartGroup.selectAll('.candlestick')
      .data(this.processedData)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .style('cursor', 'pointer');

    // 影線
    const wicks = candleGroups.append('line')
      .attr('class', 'wick')
      .attr('x1', d => this.xScale!(d.date))
      .attr('x2', d => this.xScale!(d.date))
      .attr('y1', d => this.yScale!(d.high))
      .attr('y2', d => this.yScale!(d.low))
      .attr('stroke', d => d.color)
      .attr('stroke-width', wickWidth);

    // 實體
    const bodies = candleGroups.append('rect')
      .attr('class', 'body')
      .attr('x', d => this.xScale!(d.date) - actualCandleWidth / 2)
      .attr('y', d => this.yScale!(Math.max(d.open, d.close)))
      .attr('width', actualCandleWidth)
      .attr('height', d => Math.max(1, Math.abs(this.yScale!(d.open) - this.yScale!(d.close))))
      .attr('fill', d => {
        if (d.direction === 'up') {
          return config.colorMode === 'tw' ? '#ffffff' : d.color;
        }
        return d.color;
      })
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1);

    // 動畫效果
    if (animate) {
      wicks.attr('opacity', 0)
        .transition()
        .delay((_d, i) => animationDelay + i * 10)
        .duration(animationDuration)
        .ease(d3.easeBackOut)
        .attr('opacity', 1);

      bodies.attr('opacity', 0)
        .transition()
        .delay((_d, i) => animationDelay + i * 10)
        .duration(animationDuration)
        .ease(d3.easeBackOut)
        .attr('opacity', 1);
    }

    // 添加交互事件
    this.addInteractionEvents(candleGroups);
  }

  private renderVolume(): void {
    if (!this.chartGroup || !this.xScale || !this.volumeScale) return;

    const config = this.config as CandlestickChartCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const volumeHeightRatio = config.volumeHeightRatio || 0.25;
    const priceChartHeight = chartHeight * (1 - volumeHeightRatio);
    
    // 成交量圖表組
    const volumeGroup = this.chartGroup.append('g')
      .attr('class', 'volume-chart')
      .attr('transform', `translate(0, ${priceChartHeight + 10})`);

    // 計算成交量柱寬度
    const baseSpacing = chartWidth / this.processedData.length;
    const volumeBarWidth = baseSpacing * 0.6;

    // 繪製成交量柱
    volumeGroup.selectAll('.volume-bar')
      .data(this.processedData.filter(d => d.volume > 0))
      .enter()
      .append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => this.xScale!(d.date) - volumeBarWidth / 2)
      .attr('y', d => this.volumeScale!(d.volume))
      .attr('width', volumeBarWidth)
      .attr('height', _d => (chartHeight * volumeHeightRatio - 10) - this.volumeScale!(_d.volume))
      .attr('fill', _d => _d.color)
      .attr('opacity', config.volumeOpacity || 0.6);
  }

  private addInteractionEvents(
    candleGroups: d3.Selection<SVGGElement, ProcessedCandlestickDataPoint, SVGGElement, unknown>
  ): void {
    const config = this.config as CandlestickChartCoreConfig;
    
    candleGroups
      .on('click', (event, d) => {
        config.onDataClick?.(d, event);
      })
      .on('mouseenter', (event, d) => {
        // 顯示工具提示
        const [x, y] = d3.pointer(event, this.containerElement);
        const tooltipContent = this.formatTooltipContent(d);
        this.showTooltip(x, y, tooltipContent);
        config.onDataHover?.(d, event);
      })
      .on('mouseleave', (event, _d) => {
        this.hideTooltip();
        config.onDataHover?.(null, event);
      });
  }

  private formatTooltipContent(data: ProcessedCandlestickDataPoint): string {
    const formatNumber = (num: number) => num.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    
    const formatPercent = (num: number) => {
      const sign = num >= 0 ? '+' : '';
      return `${sign}${num.toFixed(2)}%`;
    };

    return `
      <div>
        <div><strong>${data.date.toLocaleDateString()}</strong></div>
        <div>開盤: ${formatNumber(data.open)}</div>
        <div>收盤: ${formatNumber(data.close)}</div>
        <div>最高: ${formatNumber(data.high)}</div>
        <div>最低: ${formatNumber(data.low)}</div>
        <div>漲跌: ${formatNumber(data.change)} (${formatPercent(data.changePercent)})</div>
        ${data.volume ? `<div>成交量: ${data.volume.toLocaleString()}</div>` : ''}
      </div>
    `;
  }

  private renderUnifiedAxes(): void {
    const config = this.config as CandlestickChartCoreConfig;
    const { chartHeight } = this.getChartDimensions();

    // 渲染主要價格軸線
    if (config.showXAxis !== false && this.xScale) {
      this.renderXAxis(this.xScale, {
        label: config.xAxisLabel,
        showGrid: config.showGrid,
        tickFormat: d3.timeFormat('%m/%d')
      });
    }

    if (config.showYAxis !== false && this.yScale) {
      // 對於多軸線的情況，手動渲染價格 Y 軸以控制標籤位置
      this.renderPriceYAxis(this.yScale, config);
    }

    // 渲染成交量軸線（如果啟用成交量顯示）
    if (config.showVolume !== false && this.volumeScale) {
      const volumeHeightRatio = config.volumeHeightRatio || 0.25;
      const priceChartHeight = chartHeight * (1 - volumeHeightRatio);
      
      // 創建成交量軸線，位置在成交量圖表區域
      this.renderVolumeAxis(this.volumeScale, priceChartHeight + 10);
    }
  }

  private renderPriceYAxis(priceScale: d3.ScaleLinear<number, number>, config: CandlestickChartCoreConfig): void {
    if (!this.svgElement) return;
    
    const { chartHeight } = this.getChartDimensions();
    const volumeHeightRatio = config.showVolume !== false ? (config.volumeHeightRatio || 0.25) : 0;
    const priceChartHeight = chartHeight * (1 - volumeHeightRatio);
    
    const svgSelection = d3.select(this.svgElement);
    let chartArea = svgSelection.select('.chart-area') as d3.Selection<SVGGElement, unknown, null, undefined>;
    
    // 如果沒有找到 .chart-area，嘗試找圖表特定的類名
    if (chartArea.empty()) {
      chartArea = svgSelection.select(`g.${this.getChartType()}-chart`) as d3.Selection<SVGGElement, unknown, null, undefined>;
    }
    
    if (chartArea.empty()) return;

    // 創建價格軸線群組
    const priceAxisGroup = chartArea
      .append('g')
      .attr('class', 'price-axis left-axis')
      .attr('transform', 'translate(0, 0)');

    // 使用統一的軸線樣式
    const axis = d3.axisLeft(priceScale);
    priceAxisGroup.call(axis);

    // 應用統一的軸線樣式
    priceAxisGroup.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    priceAxisGroup.selectAll('line')
      .style('stroke', '#d1d5db')
      .style('stroke-width', '1px');

    priceAxisGroup.select('.domain')
      .style('stroke', '#d1d5db')
      .style('stroke-width', '1px');

    // 添加價格軸標籤，位置調整為價格圖表區域的中央
    if (config.yAxisLabel || config.showVolume !== false) {
      const labelText = config.yAxisLabel || '價格';
      priceAxisGroup
        .append('text')
        .attr('class', 'axis-label price-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(priceChartHeight / 2))  // 價格圖表區域的中心
        .attr('y', -35)  // 距離軸線的偏移
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#374151')
        .style('font-family', 'system-ui, -apple-system, sans-serif')
        .text(labelText);
    }
  }

  private renderVolumeAxis(volumeScale: d3.ScaleLinear<number, number>, yOffset: number): void {
    if (!this.svgElement) return;
    
    const { chartHeight } = this.getChartDimensions();
    const config = this.config as CandlestickChartCoreConfig;
    const volumeHeightRatio = config.volumeHeightRatio || 0.25;
    const volumeChartHeight = chartHeight * volumeHeightRatio - 10;
    
    const svgSelection = d3.select(this.svgElement);
    let chartArea = svgSelection.select('.chart-area') as d3.Selection<SVGGElement, unknown, null, undefined>;
    
    // 如果沒有找到 .chart-area，嘗試找圖表特定的類名
    if (chartArea.empty()) {
      chartArea = svgSelection.select(`g.${this.getChartType()}-chart`) as d3.Selection<SVGGElement, unknown, null, undefined>;
    }
    
    if (chartArea.empty()) return;

    // 創建成交量軸線群組
    const volumeAxisGroup = chartArea
      .append('g')
      .attr('class', 'volume-axis left-axis')
      .attr('transform', `translate(0, ${yOffset})`);

    // 使用統一的軸線樣式
    const axis = d3.axisLeft(volumeScale)
      .ticks(3)
      .tickFormat(d => {
        const value = +d;
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
      });

    volumeAxisGroup.call(axis);

    // 應用統一的軸線樣式
    volumeAxisGroup.selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    volumeAxisGroup.selectAll('line')
      .style('stroke', '#d1d5db')
      .style('stroke-width', '1px');

    volumeAxisGroup.select('.domain')
      .style('stroke', '#d1d5db')
      .style('stroke-width', '1px');

    // 添加成交量軸標籤，位置調整為成交量圖表區域的中央
    const volumeLabelText = config.volumeAxisLabel || '成交量';
    volumeAxisGroup
      .append('text')
      .attr('class', 'axis-label volume-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(volumeChartHeight / 2))  // 成交量圖表區域的中心
      .attr('y', -35)  // 距離軸線的偏移
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#374151')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .text(volumeLabelText);
  }

  public getChartType(): string {
    return 'candlestick-chart';
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<CandlestickChartCoreConfig>): void {
    super.updateConfig(newConfig);
  }

  // 公共方法：獲取處理後的數據
  public getProcessedData(): ChartData<CandlestickData>[] {
    return this.processedData;
  }
}