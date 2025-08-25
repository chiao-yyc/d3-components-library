import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
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

    // 計算蠟燭間距
    const timeRange = xScale.domain();
    const timeDiff = timeRange[1].getTime() - timeRange[0].getTime();
    const avgTimeBetweenPoints = timeDiff / Math.max(1, this.processedOHLCData.length - 1);
    const pixelPerMs = chartWidth / timeDiff;
    const availableWidth = avgTimeBetweenPoints * pixelPerMs;
    const candleActualWidth = Math.min(availableWidth * candleWidth, chartWidth / this.processedOHLCData.length * 0.8);

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

    // 使用與candlestick相同的寬度計算邏輯
    const timeRange = xScale.domain();
    const timeDiff = timeRange[1].getTime() - timeRange[0].getTime();
    const avgTimeBetweenPoints = timeDiff / Math.max(1, this.processedOHLCData.length - 1);
    const pixelPerMs = chartWidth / timeDiff;
    const availableWidth = avgTimeBetweenPoints * pixelPerMs;
    const volumeBarWidth = Math.min(availableWidth * 0.6, chartWidth / this.processedOHLCData.length * 0.6);

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

    // 繪製蠟燭圖
    const candleGroups = g.selectAll('.candlestick')
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

    // 成交量圖表
    if (showVolume && volumeScale && this.volumes.length) {
      const volumeG = g.append('g')
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

    // 繪製坐標軸
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

  protected createSVGContainer(): d3.Selection<SVGGElement, unknown, null, undefined> {
    if (!this.svgRef.current) {
      throw new Error('SVG ref is not available')
    }

    // 🔧 使用與 createScales/renderChart 相同的邏輯來獲取正確的 margin
    const { responsive, width, height } = this.props;
    let margin;
    
    if (responsive && width && height) {
      margin = { top: 20, right: 30, bottom: 40, left: 60 };
    } else {
      margin = this.getChartDimensions().margin;
    }

    const svg = d3.select(this.svgRef.current)
    
    // 🐛 調試：檢查 SVG 實際尺寸
    const svgElement = this.svgRef.current;
    console.log('🐛 SVG actual dimensions:', {
      svgClientWidth: svgElement.clientWidth,
      svgClientHeight: svgElement.clientHeight,
      svgWidth: svgElement.getAttribute('width'),
      svgHeight: svgElement.getAttribute('height'),
      svgViewBox: svgElement.getAttribute('viewBox'),
      propsWidth: width,
      propsHeight: height
    });
    
    // 清除現有內容
    svg.selectAll('*').remove()
    
    // 創建主要群組
    return svg
      .append('g')
      .attr('class', `${this.getChartType()}-chart`)
      .attr('transform', `translate(${margin.left},${margin.top})`)
  }

  protected getChartType(): string {
    return 'candlestick';
  }
}