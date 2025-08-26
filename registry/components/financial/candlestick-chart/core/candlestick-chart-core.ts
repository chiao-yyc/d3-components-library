import * as d3 from 'd3';
import React from 'react';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { renderAxis, AxisConfig } from '../../../core/base-chart/chart-utils';
import { CandlestickChartProps, CandlestickItem, VolumeItem } from '../types';

// 預設配置
const DEFAULT_COLORS = {
  tw: { up: '#ef4444', down: '#22c55e', doji: '#6b7280' }, // 台股：紅漲綠跌
  us: { up: '#22c55e', down: '#ef4444', doji: '#6b7280' }, // 美股：綠漲紅跌
  custom: { up: '#10b981', down: '#f59e0b', doji: '#6b7280' }
};

export class D3CandlestickChart extends BaseChart<CandlestickChartProps> {
  private processedOHLCData: any[] = [];
  private candlesticks: CandlestickItem[] = [];
  private volumes: VolumeItem[] = [];
  private colors: any = {};
  private scales: any = {};
  
  // 🔧 新增：縮放級別和動態寬度管理
  private currentScale: number = 1;
  private currentMaxCandleWidth: number = 20;

  constructor(config: CandlestickChartProps) {
    super(config);
  }

  protected processData(): any[] {
    const { data, mapping, colorMode = 'tw', upColor, downColor, dojiColor } = this.props;
    
    if (!data?.length) {
      this.processedOHLCData = [];
      this.candlesticks = [];
      this.volumes = [];
      return [];
    }

    // 模擬 useOHLCProcessor 的邏輯
    const processedData = data.map((d, index) => {
      const date = new Date(d.date);
      const open = Number(d.open);
      const high = Number(d.high);
      const low = Number(d.low);
      const close = Number(d.close);
      const volume = d.volume ? Number(d.volume) : 0;
      
      const change = close - open;
      const changePercent = open !== 0 ? (change / open) * 100 : 0;
      let direction: 'up' | 'down' | 'doji' = 'doji';
      
      if (change > 0) direction = 'up';
      else if (change < 0) direction = 'down';

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
        index
      };
    });

    // 顏色配置
    const modeColors = DEFAULT_COLORS[colorMode] || DEFAULT_COLORS.custom;
    this.colors = {
      up: upColor || modeColors.up,
      down: downColor || modeColors.down,
      doji: dojiColor || modeColors.doji
    };

    this.processedOHLCData = processedData;
    return processedData;
  }

  protected createScales(): void {
    const { showVolume = true, volumeHeightRatio = 0.25 } = this.props;
    
    // 🔧 確保使用正確的尺寸：如果是響應式模式，應該使用實際傳入的 width/height
    const { width, height, responsive } = this.props;
    let dimensions;
    
    if (responsive && width && height) {
      // 響應式模式下使用傳入的實際尺寸
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      dimensions = {
        width,
        height,
        margin,
        chartWidth: width - margin.left - margin.right,
        chartHeight: height - margin.top - margin.bottom
      };
    } else {
      // 固定模式使用 getChartDimensions
      dimensions = this.getChartDimensions();
    }
    
    const { chartWidth, chartHeight } = dimensions;
    
    
    if (!this.processedOHLCData.length) {
      this.scales = { xScale: d3.scaleTime(), yScale: d3.scaleLinear(), volumeScale: null };
      return;
    }

    // 計算圖表高度分配
    const priceChartHeight = showVolume 
      ? chartHeight * (1 - volumeHeightRatio) 
      : chartHeight;
    const volumeChartHeight = showVolume 
      ? chartHeight * volumeHeightRatio - 10 
      : 0;

    // 時間比例尺
    const timeExtent = d3.extent(this.processedOHLCData, d => d.date) as [Date, Date];
    const timePadding = (timeExtent[1].getTime() - timeExtent[0].getTime()) * 0.05;
    const xScale = d3.scaleTime()
      .domain([
        new Date(timeExtent[0].getTime() - timePadding),
        new Date(timeExtent[1].getTime() + timePadding)
      ])
      .range([0, chartWidth]);

    // 價格比例尺
    const allPrices = this.processedOHLCData.flatMap(d => [d.high, d.low]);
    const priceExtent = d3.extent(allPrices) as [number, number];
    const yScale = d3.scaleLinear()
      .domain(priceExtent)
      .nice()
      .range([priceChartHeight, 0]);

    // 成交量比例尺
    let volumeScale = null;
    if (showVolume) {
      const volumes = this.processedOHLCData.map(d => d.volume || 0).filter(v => v > 0);
      if (volumes.length > 0) {
        const maxVolume = Math.max(...volumes);
        volumeScale = d3.scaleLinear()
          .domain([0, maxVolume])
          .range([volumeChartHeight, 0]);
      }
    }

    this.scales = { 
      xScale, 
      yScale, 
      volumeScale, 
      chartWidth, 
      chartHeight,
      priceChartHeight,
      volumeChartHeight 
    };

    // 計算蠟燭和成交量數據
    this.calculateCandlesticks();
    this.calculateVolumes();
  }

  private calculateCandlesticks(): void {
    const { candleWidth = 0.8 } = this.props;
    const { xScale, yScale, chartWidth } = this.scales;
    
    if (!this.processedOHLCData.length) {
      this.candlesticks = [];
      return;
    }

    // 🔧 使用智能寬度計算，防止重疊
    const candleActualWidth = this.calculateSmartCandleWidth();
    
    // 更新當前最大寬度（用於邊距計算）
    this.currentMaxCandleWidth = candleActualWidth;

    this.candlesticks = this.processedOHLCData.map((d, i) => {
      const x = xScale(d.date) - candleActualWidth / 2;
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyBottom = yScale(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      const wickTop = yScale(d.high);
      const wickBottom = yScale(d.low);

      let color = this.colors.doji;
      if (d.direction === 'up') color = this.colors.up;
      else if (d.direction === 'down') color = this.colors.down;

      return {
        data: d,
        geometry: {
          x,
          bodyTop,
          bodyBottom,
          bodyHeight,
          wickTop,
          wickBottom,
          width: candleActualWidth
        },
        color,
        index: i
      };
    });
  }

  private calculateVolumes(): void {
    const { showVolume } = this.props;
    const { xScale, volumeScale, chartWidth, volumeChartHeight } = this.scales;
    
    if (!showVolume || !volumeScale || !this.processedOHLCData.length) {
      this.volumes = [];
      return;
    }

    // 🔧 使用智能寬度計算，與蠟燭同步且防止重疊
    const volumeBarWidth = this.calculateSmartVolumeWidth();

    this.volumes = this.processedOHLCData.map((d, i) => {
      if (!d.volume) return null;

      const x = xScale(d.date) - volumeBarWidth / 2;
      const scaledY = volumeScale(d.volume);
      const barHeight = volumeChartHeight - scaledY;
      const y = scaledY;

      let color = this.colors.doji;
      if (d.direction === 'up') color = this.colors.up;
      else if (d.direction === 'down') color = this.colors.down;

      return {
        data: d,
        geometry: {
          x,
          y,
          width: volumeBarWidth,
          height: barHeight
        },
        color,
        index: i
      };
    }).filter(Boolean) as VolumeItem[];
  }

  protected renderChart(): void {
    console.log('🚀🚀🚀 CANDLESTICK renderChart() CALLED AT:', new Date().toISOString(), '🚀🚀🚀');
    if (!this.processedOHLCData.length) {
      return;
    }

    const { 
      showGrid = true, 
      showVolume = true, 
      wickWidth = 1, 
      colorMode = 'tw',
      interactive = true,
      showTooltip = true,
      showCrosshair = false,
      enableZoom = false,
      enablePan = false,
      onDataClick,
      onDataHover,
      onCandleClick, // 向下兼容
      onCandleHover  // 向下兼容
    } = this.props;
    
    // 🔧 確保使用正確的尺寸
    const { width, height, responsive } = this.props;
    let chartDimensions;
    
    if (responsive && width && height) {
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      chartDimensions = {
        chartWidth: width - margin.left - margin.right,
        chartHeight: height - margin.top - margin.bottom
      };
    } else {
      chartDimensions = this.getChartDimensions();
    }
    
    // 🐛 調試：檢查各種尺寸
    console.log('🐛 Candlestick renderChart dimensions:', {
      propsWidth: width,
      propsHeight: height,
      responsive,
      chartDimensions,
      scales: {
        chartWidth: this.scales.chartWidth,
        chartHeight: this.scales.chartHeight,
        priceChartHeight: this.scales.priceChartHeight,
        volumeChartHeight: this.scales.volumeChartHeight
      }
    });
    
    const { 
      xScale, 
      yScale, 
      volumeScale, 
      priceChartHeight,
      volumeChartHeight,
      chartWidth, // 🔧 使用 scales 中正確計算的 chartWidth
      chartHeight // 🔧 使用 scales 中正確計算的 chartHeight
    } = this.scales;

    const g = this.createSVGContainer();

    // 🔧 創建剪切群組，確保所有圖表內容不溢出overlay
    const strictClipId = (g.node() as any).__strictClipId;
    const chartContentGroup = g.append('g')
      .attr('class', 'chart-content-clipped')
      .attr('clip-path', `url(#${strictClipId})`);

    // 繪製格線
    if (showGrid) {
      // 水平格線
      g.append('g')
        .attr('class', 'grid-horizontal')
        .selectAll('line')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5);

      // 垂直格線
      const timeTickCount = Math.min(10, Math.floor(chartWidth / 80));
      g.append('g')
        .attr('class', 'grid-vertical')
        .selectAll('line')
        .data(xScale.ticks(timeTickCount))
        .enter()
        .append('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', priceChartHeight)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5);
    }

    // 繪製蠟燭圖（在剪切群組內）
    const candleGroups = chartContentGroup.selectAll('.candlestick')
      .data(this.candlesticks)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .style('cursor', interactive ? 'pointer' : 'default');

    // 影線
    candleGroups.append('line')
      .attr('class', 'wick')
      .attr('x1', d => d.geometry.x + d.geometry.width / 2)
      .attr('x2', d => d.geometry.x + d.geometry.width / 2)
      .attr('y1', d => d.geometry.wickTop)
      .attr('y2', d => d.geometry.wickBottom)
      .attr('stroke', d => d.color)
      .attr('stroke-width', wickWidth);

    // 實體
    candleGroups.append('rect')
      .attr('class', 'body')
      .attr('x', d => d.geometry.x)
      .attr('y', d => d.geometry.bodyTop)
      .attr('width', d => d.geometry.width)
      .attr('height', d => d.geometry.bodyHeight)
      .attr('fill', d => {
        if (d.data.direction === 'up') {
          return colorMode === 'tw' ? '#ffffff' : '#ffffff';
        }
        return d.color;
      })
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1);

    // 成交量圖表（也在剪切群組內）
    if (showVolume && volumeScale && this.volumes.length) {
      const volumeG = chartContentGroup.append('g')
        .attr('class', 'volume-chart')
        .attr('transform', `translate(0, ${priceChartHeight + 10})`);
        
      // 🐛 調試：檢查成交量圖表位置和預期底部位置
      const volumeTopPosition = priceChartHeight + 10;
      const volumeBottomPosition = volumeTopPosition + volumeChartHeight;
      console.log('🐛 Volume chart positioning:', {
        priceChartHeight,
        volumeChartHeight,
        volumeTopPosition,
        volumeBottomPosition,
        totalChartHeight: chartHeight,
        exceeds: volumeBottomPosition > chartHeight
      });

      volumeG.selectAll('.volume-bar')
        .data(this.volumes)
        .enter()
        .append('rect')
        .attr('class', 'volume-bar')
        .attr('x', d => d.geometry.x)
        .attr('y', d => d.geometry.y)
        .attr('width', d => d.geometry.width)
        .attr('height', d => d.geometry.height)
        .attr('fill', d => d.color)
        .attr('opacity', 0.6);

      // 成交量 Y 軸
      volumeG.append('g')
        .attr('class', 'volume-axis')
        .call(d3.axisLeft(volumeScale).ticks(3))
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#6b7280');
    }

    // 互動事件
    if (interactive) {
      candleGroups
        .on('mouseenter', (event, d) => {
          if (showTooltip) {
            const [x, y] = d3.pointer(event, g.node());
            const content = this.formatTooltipContent(d.data);
            this.createTooltip(x, y, content);
          }
          (onDataHover || onCandleHover)?.(d.data);
        })
        .on('mouseleave', () => {
          this.hideTooltip();
          (onDataHover || onCandleHover)?.(null);
        })
        .on('click', (event, d) => {
          (onDataClick || onCandleClick)?.(d.data);
        });
    }
    
    // 十字線功能現在由 setupZoomPan 中的統一覆蓋層處理
    // 不再在這裡直接調用 setupCrosshair
    
    // 縮放和平移功能
    if (enableZoom || enablePan) {
      try {
        this.setupZoomPan(g);
      } catch (error) {
        console.warn('Error setting up zoom/pan:', error);
      }
    }

    // 繪製坐標軸 - 使用統一的數據對齊方法
    // Y 軸使用傳統方法
    const yAxisGroup = g.append('g')
      .attr('class', 'left-axis')
      .call(d3.axisLeft(yScale));
      
    yAxisGroup.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280');
      
    // X 軸使用統一的數據對齊方法
    console.log('🚀 INITIAL RENDER: Calling createOrUpdateXAxis');
    this.createOrUpdateXAxis(g, xScale);
    
    // 檢查最終的 DOM 結構
    console.log('🔍 RENDER COMPLETE - Final DOM axes:', {
      xAxisExists: !g.select('.bottom-axis').empty(),
      yAxisExists: !g.select('.left-axis').empty(),
      totalAxisGroups: g.selectAll('g[class*="axis"]').size()
    });
  }


  private formatTooltipContent(data: any): string {
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

  private setupCrosshair(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const { chartWidth, chartHeight, xScale, yScale, volumeScale, priceChartHeight, volumeChartHeight } = this.scales;
    const { crosshairConfig = {}, showVolume = true } = this.props;

    // 創建十字線組
    const crosshairGroup = g.append('g')
      .attr('class', 'crosshair-group')
      .style('display', 'none')
      .style('pointer-events', 'none');

    // 垂直線
    const verticalLine = crosshairGroup.append('line')
      .attr('class', 'crosshair-vertical')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', crosshairConfig.color || '#666')
      .attr('stroke-width', crosshairConfig.strokeWidth || 1)
      .attr('stroke-dasharray', crosshairConfig.strokeDasharray || '3,3')
      .attr('opacity', crosshairConfig.opacity || 0.7);

    // 價格標籤（右側）
    const priceLabel = crosshairGroup.append('g').attr('class', 'price-label');
    priceLabel.append('rect').attr('fill', '#333').attr('rx', 2);
    priceLabel.append('text')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle');

    // 成交量標籤（右側，在成交量圖表區域）
    let volumeLabel = null;
    if (showVolume && volumeScale) {
      volumeLabel = crosshairGroup.append('g').attr('class', 'volume-label');
      volumeLabel.append('rect').attr('fill', '#333').attr('rx', 2);
      volumeLabel.append('text')
        .attr('fill', 'white')
        .attr('font-size', '11px')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle');
    }

    // 日期標籤（底部）
    const dateLabel = crosshairGroup.append('g').attr('class', 'date-label');
    dateLabel.append('rect').attr('fill', '#333').attr('rx', 2);
    dateLabel.append('text')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging');

    // 十字線交互邏輯將由統一的覆蓋層處理
    // 這裡只負責設置十字線的視覺元素
    
    // 返回十字線元素以便統一處理交互
    return {
      crosshairGroup,
      verticalLine,
      priceLabel,
      volumeLabel,
      dateLabel,
      scales: { xScale, yScale, volumeScale, priceChartHeight, chartWidth, chartHeight }
    };
  }

  private attachCrosshairToOverlay(
    g: d3.Selection<SVGGElement, unknown, null, undefined>, 
    overlay: d3.Selection<SVGRectElement, unknown, null, undefined>
  ): void {
    const { showCrosshair } = this.props;
    
    // 只有啟用十字線時才設置
    if (!showCrosshair) {
      return;
    }
    
    const crosshairElements = this.setupCrosshair(g);
    
    if (!crosshairElements) {
      return;
    }
    
    const { 
      crosshairGroup, 
      verticalLine, 
      priceLabel, 
      volumeLabel, 
      dateLabel,
      scales 
    } = crosshairElements;
    
    const { yScale, volumeScale, priceChartHeight, chartWidth, chartHeight } = scales;
    
    overlay
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const closestData = this.findClosestDataPoint(mouseX);
        
        if (closestData) {
          const dataPoint = closestData.data;
          // 🔧 使用當前的比例尺（會在縮放時更新）
          const dataX = this.scales.xScale(dataPoint.date);
          const dataY = yScale(dataPoint.close);

          crosshairGroup.style('display', 'block');
          
          // 更新垂直線
          verticalLine.attr('x1', dataX).attr('x2', dataX);

          // 更新價格標籤（在價格圖表區域的右側）
          const priceText = `${dataPoint.close.toFixed(2)}`;
          priceLabel.select('text').text(priceText);
          
          const priceBBox = (priceLabel.select('text').node() as any)?.getBBox();
          if (priceBBox) {
            // 從右側對齊，背景框從文字右端開始向左延展
            priceLabel.select('rect')
              .attr('x', chartWidth - priceBBox.width - 8)
              .attr('y', dataY - priceBBox.height / 2 - 2)
              .attr('width', priceBBox.width + 8)
              .attr('height', priceBBox.height + 4);
            
            // 文字位置從右側開始，留一點padding
            priceLabel.select('text')
              .attr('x', chartWidth - 4)
              .attr('y', dataY);
          }

          // 更新成交量標籤（在成交量圖表區域的右側）
          if (volumeLabel && dataPoint.volume && volumeScale) {
            const volumeText = `${(dataPoint.volume / 1000000).toFixed(1)}M`;
            // 成交量圖表的 Y 位置 = 價格圖表高度 + 間距 + 成交量比例尺位置
            const volumeY = priceChartHeight + 10 + volumeScale(dataPoint.volume);
            
            volumeLabel.select('text').text(volumeText);
            
            const volumeBBox = (volumeLabel.select('text').node() as any)?.getBBox();
            if (volumeBBox) {
              // 從右側對齊，背景框從文字右端開始向左延展
              volumeLabel.select('rect')
                .attr('x', chartWidth - volumeBBox.width - 8)
                .attr('y', volumeY - volumeBBox.height / 2 - 2)
                .attr('width', volumeBBox.width + 8)
                .attr('height', volumeBBox.height + 4);
              
              // 文字位置從右側開始，留一點padding
              volumeLabel.select('text')
                .attr('x', chartWidth - 4)
                .attr('y', volumeY);
            }
          }

          // 更新日期標籤（在底部）
          const dateText = d3.timeFormat('%m/%d')(dataPoint.date);
          dateLabel.select('text').text(dateText);
          
          const dateBBox = (dateLabel.select('text').node() as any)?.getBBox();
          if (dateBBox) {
            dateLabel.select('rect')
              .attr('x', dataX - dateBBox.width / 2 - 4)
              .attr('y', chartHeight + 5)
              .attr('width', dateBBox.width + 8)
              .attr('height', dateBBox.height + 4);
            
            dateLabel.select('text')
              .attr('x', dataX)
              .attr('y', chartHeight + 9);
          }
        }
      })
      .on('mouseleave', () => {
        crosshairGroup.style('display', 'none');
      });
  }


  // 節流函數防止過於頻繁的更新
  private throttle(func: Function, delay: number) {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // 基於 D3.js 最佳實務的全新縮放實現
  private setupZoomPan(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { chartWidth, chartHeight, xScale, yScale, volumeScale, priceChartHeight } = this.scales;
    const { zoomConfig = {}, enableZoom = false, enablePan = false, showVolume = true, showGrid = true } = this.props;
    
    console.log('🚀 setupZoomPan called with D3.js best practices pattern');
    
    if (!enableZoom && !enablePan) {
      console.log('⚠️ setupZoomPan early return: both zoom and pan disabled');
      return;
    }
    
    // 保存原始比例尺 - 這是關鍵！
    const originalXScale = xScale.copy();
    const originalYScale = yScale.copy();
    const originalVolumeScale = volumeScale ? volumeScale.copy() : null;
    
    // 創建漸進式更新函數：即時更新重要元素，延遲更新次要元素
    let immediateUpdateTimer: NodeJS.Timeout | null = null;
    let delayedUpdateTimer: NodeJS.Timeout | null = null;
    
    const progressiveUpdate = (transform: any) => {
      // 🚀 第一階段：即時更新最重要的視覺元素
      const immediateUpdate = () => {
        // 使用標準的 D3 zoom 變換 - rescaleX 會正確處理縮放和平移
        let newXScale = transform.rescaleX(originalXScale);
        
        console.log('🔄 Transform applied:', { 
          scale: transform.k, 
          translateX: transform.x,
          domainStart: newXScale.domain()[0].toLocaleDateString(),
          domainEnd: newXScale.domain()[1].toLocaleDateString()
        });
        
        // 約束到數據範圍
        if (zoomConfig.constrainToData !== false) {
          const originalDomain = originalXScale.domain();
          const newDomain = newXScale.domain();
          
          if (newDomain[0] < originalDomain[0] || newDomain[1] > originalDomain[1]) {
            const clampedStart = Math.max(newDomain[0].getTime(), originalDomain[0].getTime());
            const clampedEnd = Math.min(newDomain[1].getTime(), originalDomain[1].getTime());
            newXScale.domain([new Date(clampedStart), new Date(clampedEnd)]);
          }
        }
        
        // 更新比例尺
        this.scales.xScale = newXScale;
        
        // 🔧 確保縮放級別已更新，然後重新計算蠟燭
        this.currentScale = transform.k;
        this.calculateCandlesticks();
        this.updateChartElementsPositions(g);
        
        // 🔧 立即更新格線（與蠟燭圖同步）
        if (showGrid) {
          console.log('📐 Updating gridlines...');
          this.updateGridlines(g, newXScale, this.scales.yScale, chartWidth, priceChartHeight);
        }
        
        // 🔧 立即更新成交量位置（與蠟燭圖同步）
        if (showVolume) {
          console.log('📊 Updating volume bars...');
          this.calculateVolumes();
          this.updateVolumePositions(g);
        }
        
        // console.log('⚡ Immediate update completed'); // 優化：減少日誌
      };
      
      // 🔄 第二階段：延遲更新次要元素
      const delayedUpdate = () => {
        // 更新成交量（如果需要）
        if (showVolume) {
          this.calculateVolumes();
          // 更新成交量柱狀圖位置
          const volumeGroups = g.select('.chart-content-clipped').selectAll('.volume-bar');
          if (this.volumes?.length > 0) {
            volumeGroups.each((_d: any, i, nodes) => {
              const group = d3.select(nodes[i]);
              const volumeData = this.volumes?.[i];
              if (volumeData && volumeData.geometry) {
                group
                  .attr('x', volumeData.geometry.x)
                  .attr('width', volumeData.geometry.width);
              }
            });
          }
        }
        
        // 更新 X 軸
        this.createOrUpdateXAxis(g, this.scales.xScale);
        
        // console.log('🔄 Delayed update completed'); // 優化：減少日誌
      };
      
      // 清除之前的定時器
      if (immediateUpdateTimer) clearTimeout(immediateUpdateTimer);
      if (delayedUpdateTimer) clearTimeout(delayedUpdateTimer);
      
      // 立即執行第一階段
      immediateUpdate();
      
      // 延遲執行第二階段
      delayedUpdateTimer = setTimeout(delayedUpdate, 50); // 50ms後更新次要元素
    };

    // 計算基於數據範圍的合理平移邊界
    const dataTimeRange = d3.extent(this.processedOHLCData, d => d.date) as [Date, Date];
    const dataStartX = originalXScale(dataTimeRange[0]);
    const dataEndX = originalXScale(dataTimeRange[1]);
    const dataRangeWidth = dataEndX - dataStartX;
    
    console.log('📊 Data range for translate bounds:', {
      dataStart: dataTimeRange[0].toLocaleDateString(),
      dataEnd: dataTimeRange[1].toLocaleDateString(),
      dataStartX,
      dataEndX,
      dataRangeWidth,
      chartWidth
    });
    
    // 🔧 使用正確的D3.js邊界約束模式
    const zoom = d3.zoom<SVGGElement, unknown>()
      .scaleExtent(zoomConfig.scaleExtent || [0.5, 10])
      .extent([[0, 0], [chartWidth, chartHeight]])
      .filter((event) => {
        // 金融圖表標準：滾輪縮放，拖拽平移，雙擊重置
        return event.type === 'wheel' || 
               event.type === 'mousedown' || 
               event.type === 'dblclick';
      })
      .on('zoom', (event) => {
        const transform = event.transform;
        
        // 🔧 動態邊界約束 - 考慮蠟燭寬度的精確邊界
        const scale = transform.k;
        const originalX = transform.x;
        
        // 保存縮放級別
        this.currentScale = scale;
        
        // 獲取動態邊界（考慮當前蠟燭寬度）
        const bounds = this.getEffectiveChartBounds();
        
        // 動態邊界約束：基於實際有效繪圖區域
        const maxTranslateX = bounds.left; // 右邊界：預留右側蠟燭空間
        const minTranslateX = bounds.width * (1 - scale) - bounds.left; // 左邊界：考慮縮放和左側蠟燭空間
        
        // 約束檢查
        let constrainedX = Math.max(minTranslateX, Math.min(maxTranslateX, originalX));
        
        // 只有在真正需要約束時才修改
        if (Math.abs(constrainedX - originalX) > 0.1) {
          transform.x = constrainedX;
          console.log('🚫 Dynamic boundary constrained:', { 
            original: originalX, 
            constrained: constrainedX, 
            candleWidth: this.currentMaxCandleWidth,
            bounds 
          });
        }
        
        // 使用修改後的變換更新圖表
        progressiveUpdate(transform);
      });

    // 關鍵：直接在圖表組上應用 zoom，而不是創建額外的覆蓋層
    g.call(zoom);
    
    // 添加一個透明的矩形來確保整個圖表區域都能接收事件
    // 同時處理縮放和十字線交互
    const overlay = g.append('rect')
      .attr('class', 'zoom-overlay interactive-overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('cursor', 'crosshair'); // 預設使用十字線游標
    
    console.log('🎮 Modern zoom setup complete:', {
      chartWidth,
      chartHeight,
      enableZoom,
      enablePan,
      overlayNode: overlay.node()
    });
    
    // 雙擊重置
    if (zoomConfig.resetOnDoubleClick !== false) {
      overlay.on('dblclick', (event) => {
        event.stopPropagation();
        event.preventDefault();
        
        console.log('🔄 Double-click reset triggered');
        
        // 重置比例尺和縮放級別
        this.scales.xScale = originalXScale.copy();
        this.scales.yScale = originalYScale.copy();
        if (originalVolumeScale) {
          this.scales.volumeScale = originalVolumeScale.copy();
        }
        this.currentScale = 1; // 重置縮放級別
        
        // 重新計算並更新
        this.calculateCandlesticks();
        if (showVolume) {
          this.calculateVolumes();
        }
        this.updateChartElements(g);
        
        // 使用統一的 X 軸方法重置軸線，保持數據對齊
        this.createOrUpdateXAxis(g, this.scales.xScale);
        
        // 重置變換
        g.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
      });
    }
    
    // 在覆蓋層上添加十字線功能
    this.attachCrosshairToOverlay(g, overlay);
    
    // 事件處理優化：移除詳細調試日誌
    overlay
      .on('mouseenter', () => {
        // 可以在這裡添加鼠標進入的處理邏輯
      })
      .on('wheel', (event) => {
        // 防止頁面滾動
        event.preventDefault();
      });
  }

  // 專門為縮放優化的快速位置更新方法
  private updateChartElementsPositions(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    // 🔧 從剪切群組中選擇元素
    const candleGroups = g.select('.chart-content-clipped').selectAll('.candlestick');
    
    if (!this.candlesticks || this.candlesticks.length === 0) {
      return;
    }
    
    // 快速更新蠟燭圖位置
    candleGroups.each((_d: any, i, nodes) => {
      const group = d3.select(nodes[i]);
      const candleData = this.candlesticks?.[i];
      
      if (candleData && candleData.geometry) {
        // 更新影線
        group.select('.wick')
          .attr('x1', candleData.geometry.x + candleData.geometry.width / 2)
          .attr('x2', candleData.geometry.x + candleData.geometry.width / 2)
          .attr('y1', candleData.geometry.wickTop)
          .attr('y2', candleData.geometry.wickBottom);
        
        // 更新實體
        group.select('.body')
          .attr('x', candleData.geometry.x)
          .attr('y', candleData.geometry.bodyTop)
          .attr('width', candleData.geometry.width)
          .attr('height', candleData.geometry.bodyHeight);
      }
    });
    
    // 更新成交量柱狀圖
    if (this.props.showVolume && this.volumes?.length > 0) {
      const volumeBars = g.select('.chart-content-clipped').selectAll('.volume-bar');
      volumeBars.each((_d: any, i, nodes) => {
        const bar = d3.select(nodes[i]);
        const volumeData = this.volumes?.[i];
        
        if (volumeData && volumeData.geometry) {
          bar
            .attr('x', volumeData.geometry.x)
            .attr('y', volumeData.geometry.y)
            .attr('width', volumeData.geometry.width)
            .attr('height', volumeData.geometry.height);
        }
      });
    }
  }

  private updateChartElements(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { xScale, yScale, volumeScale } = this.scales;
    
    // 更新蠟燭圖元素
    const candleGroups = g.selectAll('.candlestick');
    
    // 確保數據存在再更新
    if (!this.candlesticks || this.candlesticks.length === 0) {
      console.warn('⚠️ candlesticks data is empty, skipping update');
      return;
    }
    
    console.log('🔄 Updating chart elements:', {
      candlesticksCount: this.candlesticks.length,
      candleGroupsCount: candleGroups.size(),
      firstCandleData: this.candlesticks[0]
    });
    
    candleGroups.each((_d: any, i, nodes) => {
      const group = d3.select(nodes[i]);
      const candleData = this.candlesticks?.[i];
      
      if (candleData && candleData.geometry) {
        // 更新影線
        group.select('.wick')
          .attr('x1', candleData.geometry.x + candleData.geometry.width / 2)
          .attr('x2', candleData.geometry.x + candleData.geometry.width / 2)
          .attr('y1', candleData.geometry.wickTop)
          .attr('y2', candleData.geometry.wickBottom);
        
        // 更新實體
        group.select('.body')
          .attr('x', candleData.geometry.x)
          .attr('y', candleData.geometry.bodyTop)
          .attr('width', candleData.geometry.width)
          .attr('height', candleData.geometry.bodyHeight);
      }
    });
    
    // 更新成交量柱狀圖
    if (this.props.showVolume && volumeScale && this.volumes?.length > 0) {
      const volumeBars = g.select('.chart-content-clipped').selectAll('.volume-bar');
      
      volumeBars.each((_d: any, i, nodes) => {
        const bar = d3.select(nodes[i]);
        const volumeData = this.volumes?.[i];
        
        if (volumeData && volumeData.geometry) {
          bar
            .attr('x', volumeData.geometry.x)
            .attr('y', volumeData.geometry.y)
            .attr('width', volumeData.geometry.width)
            .attr('height', volumeData.geometry.height);
        }
      });
    }
    
    // 更新軸線
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true,
      xAxisConfig: {
        format: d3.timeFormat('%m/%d'),
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      }
    });
  }

  // 移除未使用的 updateChart 方法
  // private updateChart(): void { ... }

  private findClosestDataPoint(mouseX: number): { data: any; index: number } | null {
    if (!this.processedOHLCData.length) return null;

    const { xScale } = this.scales;
    let closestIndex = 0;
    let minDistance = Infinity;

    this.processedOHLCData.forEach((d, i) => {
      const dataX = xScale(d.date);
      const distance = Math.abs(mouseX - dataX);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    return {
      data: this.processedOHLCData[closestIndex],
      index: closestIndex
    };
  }

  private getMargin() {
    const { responsive, width, height } = this.props;
    return responsive && width && height ? 
      { top: 20, right: 30, bottom: 40, left: 60 } :
      this.getChartDimensions().margin;
  }

  protected createSVGContainer(): d3.Selection<SVGGElement, unknown, null, undefined> {
    if (!this.svgRef.current) {
      throw new Error('SVG ref is not available')
    }

    const margin = this.getMargin();
    const { chartWidth, chartHeight } = this.scales;
    const svg = d3.select(this.svgRef.current)
    
    // 清除現有內容
    svg.selectAll('*').remove()
    
    // 🔧 添加嚴格的clipPath，防止溢出overlay
    const clipId = `strict-chart-bounds-${Date.now()}`;
    svg.append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', chartWidth)
      .attr('height', chartHeight);
    
    // 創建主要群組
    const mainGroup = svg
      .append('g')
      .attr('class', `${this.getChartType()}-chart`)
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // 存儲clipId供後續使用
    (mainGroup.node() as any).__strictClipId = clipId;
      
    return mainGroup;
  }

  protected getChartType(): string {
    return 'candlestick';
  }

  // 🔧 新增：智能寬度計算，防止蠟燭重疊
  private calculateSmartCandleWidth(): number {
    const { candleWidth = 0.8 } = this.props;
    const { xScale, chartWidth } = this.scales;
    
    if (!this.processedOHLCData.length) return 1;
    
    // 獲取可見時間範圍
    const currentDomain = xScale.domain();
    const visibleTimeSpan = currentDomain[1].getTime() - currentDomain[0].getTime();
    
    // 計算原始數據時間範圍
    const dataTimeRange = d3.extent(this.processedOHLCData, d => d.date) as [Date, Date];
    const totalTimeSpan = dataTimeRange[1].getTime() - dataTimeRange[0].getTime();
    
    // 縮放比例（可見時間 vs 總時間）
    const zoomRatio = totalTimeSpan / visibleTimeSpan;
    
    // 基於數據密度計算基礎間距
    const baseSpacing = chartWidth / this.processedOHLCData.length;
    const currentSpacing = baseSpacing * zoomRatio;
    
    // 寬度約束：不超過間距的85%，避免重疊
    const maxAllowedWidth = currentSpacing * 0.85;
    const baseWidth = baseSpacing * candleWidth;
    const scaledWidth = baseWidth * this.currentScale;
    
    // 最終寬度：在縮放寬度和最大允許寬度之間取較小值
    const finalWidth = Math.min(scaledWidth, maxAllowedWidth);
    
    return Math.min(50, Math.max(0.5, finalWidth));
  }

  // 🔧 新增：智能成交量寬度計算，與蠟燭寬度同步
  private calculateSmartVolumeWidth(): number {
    const { xScale, chartWidth } = this.scales;
    
    if (!this.processedOHLCData.length) return 1;
    
    // 獲取可見時間範圍
    const currentDomain = xScale.domain();
    const visibleTimeSpan = currentDomain[1].getTime() - currentDomain[0].getTime();
    
    // 計算原始數據時間範圍
    const dataTimeRange = d3.extent(this.processedOHLCData, d => d.date) as [Date, Date];
    const totalTimeSpan = dataTimeRange[1].getTime() - dataTimeRange[0].getTime();
    
    // 縮放比例（可見時間 vs 總時間）
    const zoomRatio = totalTimeSpan / visibleTimeSpan;
    
    // 基於數據密度計算基礎間距（成交量比蠟燭窄）
    const baseSpacing = chartWidth / this.processedOHLCData.length;
    const currentSpacing = baseSpacing * zoomRatio;
    
    // 成交量寬度：比蠟燭窄，約為間距的50%
    const maxAllowedWidth = currentSpacing * 0.5;
    const baseWidth = baseSpacing * 0.6; // 60%的基礎間距
    const scaledWidth = baseWidth * this.currentScale;
    
    // 最終寬度
    const finalWidth = Math.min(scaledWidth, maxAllowedWidth);
    
    return Math.min(30, Math.max(0.5, finalWidth));
  }

  // 🔧 新增：動態邊界計算方法
  private getEffectiveChartBounds(): { left: number, right: number, width: number } {
    const { chartWidth } = this.scales;
    
    // 根據當前蠟燭寬度動態計算邊距，最少預留10px
    const candlePadding = Math.max(this.currentMaxCandleWidth / 2, 10);
    
    return {
      left: candlePadding,
      right: chartWidth - candlePadding,
      width: chartWidth - candlePadding * 2
    };
  }

  /**
   * 快速更新成交量位置 - 在縮放時立即調用
   */
  private updateVolumePositions(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const volumeGroups = g.select('.chart-content-clipped').selectAll('.volume-bar');
    if (this.volumes?.length > 0) {
      volumeGroups.each((_d: any, i, nodes) => {
        const group = d3.select(nodes[i]);
        const volumeData = this.volumes?.[i];
        if (volumeData && volumeData.geometry) {
          group
            .attr('x', volumeData.geometry.x)
            .attr('width', volumeData.geometry.width);
        }
      });
    }
  }

  /**
   * 動態更新格線 - 在縮放/平移時調用
   */
  private updateGridlines(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    newXScale: any,
    yScale: any,
    chartWidth: number,
    priceChartHeight: number
  ): void {
    // 更新水平格線（Y軸方向）
    const horizontalGrid = g.select('.grid-horizontal');
    if (!horizontalGrid.empty()) {
      const yTicks = yScale.ticks();
      const horizontalLines = horizontalGrid.selectAll('line').data(yTicks);
      
      horizontalLines.exit().remove();
      
      horizontalLines
        .enter()
        .append('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5)
        .merge(horizontalLines as any)
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d));
    }
    
    // 更新垂直格線（X軸方向）- 使用新的比例尺
    const verticalGrid = g.select('.grid-vertical');
    if (!verticalGrid.empty()) {
      const timeTickCount = Math.min(10, Math.floor(chartWidth / 80));
      const xTicks = newXScale.ticks(timeTickCount);
      const verticalLines = verticalGrid.selectAll('line').data(xTicks);
      
      verticalLines.exit().remove();
      
      verticalLines
        .enter()
        .append('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.5)
        .merge(verticalLines as any)
        .attr('x1', d => newXScale(d))
        .attr('x2', d => newXScale(d))
        .attr('y1', 0)
        .attr('y2', priceChartHeight);
    }
    
  }

  // 統一的 X 軸管理方法，確保初始創建和縮放更新都使用相同的數據對齊邏輯
  private createOrUpdateXAxis(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number, never>
  ): void {
    const { chartWidth, chartHeight } = this.scales;
    
    // 根據縮放級別智能調整 tick 數量
    const currentLevel = xScale.domain()[1].getTime() - xScale.domain()[0].getTime();
    const originalDomain = this.scales.xScale.domain()[1].getTime() - this.scales.xScale.domain()[0].getTime();
    const zoomRatio = originalDomain / currentLevel;
    
    // 🔧 關鍵修復：使用實際數據點而不是自動 ticks，確保與蠟燭對齊
    const visibleDataPoints = this.processedOHLCData.filter(d => {
      const time = d.date.getTime();
      const domainStart = xScale.domain()[0].getTime();
      const domainEnd = xScale.domain()[1].getTime();
      return time >= domainStart && time <= domainEnd;
    });
    
    // 智能選擇要顯示的 tick 點，避免重疊
    let tickPoints: Date[] = [];
    if (visibleDataPoints.length > 0) {
      const maxTicks = Math.min(12, Math.max(3, Math.floor(chartWidth / 80)));
      const step = Math.max(1, Math.floor(visibleDataPoints.length / maxTicks));
      
      // 選擇均勻分布的數據點
      for (let i = 0; i < visibleDataPoints.length; i += step) {
        tickPoints.push(visibleDataPoints[i].date);
      }
      
      // 確保包含最後一個點（如果不重疊的話）
      const lastPoint = visibleDataPoints[visibleDataPoints.length - 1].date;
      const lastTick = tickPoints[tickPoints.length - 1];
      if (lastTick && (lastPoint.getTime() - lastTick.getTime()) > (step * 86400000)) { // 如果間隔超過一天
        tickPoints.push(lastPoint);
      }
    }
    
    // 創建時間格式函數
    const timeFormat = (d: Date) => {
      if (zoomRatio > 10) {
        return d3.timeFormat('%H:%M')(d);
      } else if (zoomRatio > 2) {
        return d3.timeFormat('%m/%d %H:%M')(d);
      } else {
        return d3.timeFormat('%m/%d')(d);
      }
    };
    
    // 選取現有的 X 軸群組
    let xAxisGroup = g.select('.bottom-axis');
    
    // 如果不存在，創建新的（只在第一次執行或軸線被意外刪除時）
    if (xAxisGroup.empty()) {
      console.log('🔧 Creating initial X-axis with data-aligned ticks (INITIAL RENDER)');
      
      // 🎯 關鍵修復：創建時也直接使用 tickValues，確保與更新時一致
      const xAxisGenerator = d3.axisBottom(xScale)
        .tickValues(tickPoints) // 明確指定 tick 值
        .tickFormat(timeFormat);
        
      // 創建新的軸線群組
      xAxisGroup = g.append('g')
        .attr('class', 'bottom-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxisGenerator);
        
      // 應用 BaseChart 統一樣式
      xAxisGroup.selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#6b7280');
    } else {
      // 更新現有軸線的值（保持原有 DOM 元素和樣式）
      console.log('🔄 Updating existing X-axis values with data-aligned ticks');
      
      // 🎯 關鍵：使用實際數據點創建軸線，而不是自動 ticks
      const xAxisGenerator = d3.axisBottom(xScale)
        .tickValues(tickPoints) // 明確指定 tick 值
        .tickFormat(timeFormat);
      
      // 使用過渡動畫平滑更新軸線
      xAxisGroup
        .transition()
        .duration(150) // 快速但平滑的過渡
        .ease(d3.easeQuadOut)
        .call(xAxisGenerator);
      
      // 確保保持 BaseChart 的統一樣式
      xAxisGroup.selectAll('text')
        .style('font-size', '11px')
        .style('fill', '#6b7280');
    }
    
    console.log('🔧 X-axis updated with data-aligned ticks', {
      tickPoints: tickPoints.length,
      visibleDataPoints: visibleDataPoints.length,
      zoomRatio,
      domain: xScale.domain(),
      actualTickDates: tickPoints.map(d => d.toLocaleDateString()),
      firstTickDate: tickPoints[0]?.toLocaleDateString(),
      lastTickDate: tickPoints[tickPoints.length - 1]?.toLocaleDateString(),
      method: xAxisGroup.empty() ? 'created' : 'updated'
    });
  }
}