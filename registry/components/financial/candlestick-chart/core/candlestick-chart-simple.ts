import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { CandlestickChartProps } from '../types';

export class D3CandlestickChartSimple extends BaseChart<CandlestickChartProps> {
  protected processedData: any[] = [];
  protected scales: any = {};

  constructor(config: CandlestickChartProps) {
    super(config);
    console.log('🔥 D3CandlestickChartSimple constructor called');
  }

  protected processData(): any[] {
    console.log('🔥 D3CandlestickChartSimple processData called with data:', this.props.data?.length);
    
    if (!this.props.data?.length) {
      return [];
    }

    // 處理 OHLC 數據
    const processedData = this.props.data.map((d, index) => {
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

    console.log('🔥 Processed OHLC data:', processedData.slice(0, 2));
    this.processedData = processedData;
    return processedData;
  }

  protected createScales(): void {
    console.log('🔥 D3CandlestickChartSimple createScales called');
    const dimensions = this.getChartDimensions();
    const { chartWidth, chartHeight } = dimensions;
    
    console.log('🔥 Full dimensions:', dimensions);
    console.log('🔥 Chart dimensions:', { chartWidth, chartHeight });
    console.log('🔥 Processed data length:', this.processedData?.length);
    
    if (!this.processedData?.length) {
      console.log('🔥 No data, creating empty scales');
      const xScale = d3.scaleTime().range([0, chartWidth]);
      const yScale = d3.scaleLinear().range([chartHeight, 0]);
      this.scales = { xScale, yScale, chartWidth, chartHeight };
      return;
    }

    // 時間比例尺
    const timeExtent = d3.extent(this.processedData, d => d.date) as [Date, Date];
    const timePadding = (timeExtent[1].getTime() - timeExtent[0].getTime()) * 0.05;
    const xScale = d3.scaleTime()
      .domain([
        new Date(timeExtent[0].getTime() - timePadding),
        new Date(timeExtent[1].getTime() + timePadding)
      ])
      .range([0, chartWidth]);

    // 價格比例尺
    const allPrices = this.processedData.flatMap(d => [d.high, d.low]);
    const priceExtent = d3.extent(allPrices) as [number, number];
    const yScale = d3.scaleLinear()
      .domain(priceExtent)
      .nice()
      .range([chartHeight, 0]);

    this.scales = { xScale, yScale, chartWidth, chartHeight };
    console.log('🔥 Scales created:', { 
      timeDomain: xScale.domain(), 
      priceDomain: yScale.domain(),
      chartWidth,
      chartHeight 
    });
  }

  protected renderChart(): void {
    console.log('🔥 D3CandlestickChartSimple renderChart called');
    console.log('🔥 renderChart - processedData length:', this.processedData?.length);
    console.log('🔥 renderChart - scales:', this.scales);
    
    const g = this.createSVGContainer();
    console.log('🔥 SVG container created:', !!g);
    
    // 檢查並修復 SVG 元素的尺寸
    if (this.svgRef?.current) {
      const svgElement = this.svgRef.current;
      const svgRect = svgElement.getBoundingClientRect();
      const svgWidth = svgElement.getAttribute('width');
      const svgHeight = svgElement.getAttribute('height');
      
      console.log('🔥 SVG element info BEFORE fix:', {
        attributes: { width: svgWidth, height: svgHeight },
        clientRect: { width: svgRect.width, height: svgRect.height },
        chartDimensions: { width: this.scales.chartWidth, height: this.scales.chartHeight }
      });
      
      // 獲取完整尺寸（包括 margin）
      const fullDimensions = this.getChartDimensions();
      
      // 設置 SVG 的 viewBox 來確保內容完整顯示
      const svg = d3.select(svgElement);
      svg
        .attr('viewBox', `0 0 ${fullDimensions.width} ${fullDimensions.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
        
      console.log('🔥 Applied viewBox:', `0 0 ${fullDimensions.width} ${fullDimensions.height}`);
    }
    
    // 先繪製一個測試背景矩形
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.scales?.chartWidth || 100)
      .attr('height', this.scales?.chartHeight || 100)
      .attr('fill', 'rgba(0,255,0,0.1)')
      .attr('stroke', 'green')
      .attr('stroke-width', 1);
    
    if (!this.processedData?.length) {
      console.log('🔥 No data, showing message');
      g.append('text')
        .attr('x', (this.scales.chartWidth || 100) / 2)
        .attr('y', (this.scales.chartHeight || 100) / 2)
        .text('No data available')
        .attr('text-anchor', 'middle')
        .attr('fill', '#666');
      return;
    }

    const { xScale, yScale, chartWidth, chartHeight: _chartHeight } = this.scales;
    const { colorMode = 'tw' } = this.props;

    // 顏色配置
    const colors = {
      tw: { up: '#ef4444', down: '#22c55e', doji: '#6b7280' }, // 台股
      us: { up: '#22c55e', down: '#ef4444', doji: '#6b7280' }, // 美股
      custom: { up: '#10b981', down: '#f59e0b', doji: '#6b7280' }
    };
    const currentColors = colors[colorMode] || colors.custom;

    // 計算蠟燭寬度
    const candleWidth = Math.max(2, chartWidth / this.processedData.length * 0.6);

    console.log('🔥 Rendering candlesticks:', {
      dataCount: this.processedData.length,
      candleWidth,
      colors: currentColors
    });

    // 繪製蠟燭圖
    const candleGroups = g.selectAll('.candlestick')
      .data(this.processedData)
      .enter()
      .append('g')
      .attr('class', 'candlestick');

    // 影線 (High-Low line)
    candleGroups.append('line')
      .attr('class', 'wick')
      .attr('x1', d => xScale(d.date))
      .attr('x2', d => xScale(d.date))
      .attr('y1', d => yScale(d.high))
      .attr('y2', d => yScale(d.low))
      .attr('stroke', d => {
        if (d.direction === 'up') return currentColors.up;
        else if (d.direction === 'down') return currentColors.down;
        return currentColors.doji;
      })
      .attr('stroke-width', 1);

    // 實體 (Open-Close rectangle)
    candleGroups.append('rect')
      .attr('class', 'body')
      .attr('x', d => xScale(d.date) - candleWidth/2)
      .attr('y', d => yScale(Math.max(d.open, d.close)))
      .attr('width', candleWidth)
      .attr('height', d => Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
      .attr('fill', d => {
        if (d.direction === 'up') {
          // 上漲蠟燭：台股空心（白色），美股實心
          return colorMode === 'tw' ? '#ffffff' : currentColors.up;
        } else if (d.direction === 'down') {
          // 下跌蠟燭：實心
          return currentColors.down;
        }
        return currentColors.doji;
      })
      .attr('stroke', d => {
        if (d.direction === 'up') return currentColors.up;
        else if (d.direction === 'down') return currentColors.down;
        return currentColors.doji;
      })
      .attr('stroke-width', 1);

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

    console.log('🔥 Candlestick rendering completed');
  }

  protected getChartType(): string {
    return 'candlestick-simple';
  }
}