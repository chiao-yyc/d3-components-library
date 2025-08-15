import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { 
  ObservableFunnelChartConfig,
  ObservableFunnelDataPoint,
  ProcessedObservableFunnelDataPoint 
} from './types';

export class D3ObservableFunnelChart extends BaseChart<ObservableFunnelChartConfig> {
  private processedData: ProcessedObservableFunnelDataPoint[] = [];
  private colorScale!: ColorScale;

  constructor(props: ObservableFunnelChartConfig) {
    super(props);
  }

  protected processData(): ProcessedObservableFunnelDataPoint[] {
    const { data, width = 600, height = 300, stepKey, valueKey, labelKey } = this.props;
    
    // 使用 DataProcessor 處理數據
    const processor = new DataProcessor({
      keys: { x: stepKey || 'step', y: valueKey || 'value' },
      autoDetect: true
    });
    
    const result = processor.process(data);
    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
      this.processedData = [];
      return this.processedData;
    }
    
    const processedBasicData = result.data;
    if (!processedBasicData?.length) {
      this.processedData = [];
      return this.processedData;
    }

    // 基於 Observable 範例的數據處理
    const x = d3.scaleLinear()
      .domain([1, processedBasicData.length + 1]) // 擴展域值以包含右側延伸
      .range([60, width - 60]);

    // 處理原始數據點 - 使用 DataProcessor 的結果
    const processedPoints = processedBasicData.map((d, i) => {
      const originalData = data[i]; // 保留原始數據
      const percentage = i === 0 ? 100 : (d.y / processedBasicData[0].y) * 100;
      
      // 計算路徑點（根據 Observable 範例）
      const ratio = Math.sqrt(d.y / processedBasicData[0].y);
      const yTop = height * 0.4 - (height * 0.3) * ratio;
      const yBottom = height * 0.6 + (height * 0.3) * ratio;
      
      return {
        step: d.x,
        value: d.y,
        label: originalData[labelKey || 'label'] || `Step ${d.x}`,
        percentage,
        x: x(d.x),
        y: yTop,
        originalData,
        pathPoints: [
          [x(d.x), yTop],
          [x(d.x), yBottom]
        ] as [number, number][]
      };
    });

    // 添加右側延伸點（使用最後一個數據點的比例）
    const lastPoint = processedPoints[processedPoints.length - 1];
    const extendedPoint = {
      ...lastPoint,
      step: processedBasicData.length + 1,
      x: x(processedBasicData.length + 1),
      pathPoints: [
        [x(processedBasicData.length + 1), lastPoint.pathPoints[0][1]], // 保持相同的 y 值
        [x(processedBasicData.length + 1), lastPoint.pathPoints[1][1]]
      ] as [number, number][]
    };

    this.processedData = [...processedPoints, extendedPoint];
    return this.processedData;
  }

  protected createScales(): void {
    const { colors } = this.props;
    
    // 創建顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors || ['#FF6B6B', '#4ECDC4'],
      domain: [0, this.processedData.length - 1],
      interpolate: true // 使用插值來創建漸變效果
    });
  }

  protected renderChart(): void {
    if (!this.svgRef?.current) return;
    
    this.processData();
    this.createScales();

    const { 
      width = 600, 
      height = 300, 
      background = '#2a2a2a'
    } = this.props;

    // 使用 BaseChart 的 SVG 容器創建（但不使用 margin transform）
    const svg = d3.select(this.svgRef.current);
    svg
      .attr('viewBox', [0, 0, width, height])
      .attr('style', `
        background-color: ${background};
        font-family: 'Lato', sans-serif;
      `);

    // 清除現有內容
    svg.selectAll('*').remove();
    
    // 創建主要圖表區域
    const chartArea = svg.append('g')
      .attr('class', 'observable-funnel-chart');

    // 創建漸變定義 - 使用 ColorScale
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
    
    const gradient = defs.selectAll('#observable-funnel-gradient')
      .data([null])
      .join('linearGradient')
      .attr('id', 'observable-funnel-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', this.processedData[0]?.x || 0)
      .attr('y1', 0)
      .attr('x2', this.processedData[this.processedData.length - 1]?.x || width)
      .attr('y2', 0);

    // 使用 ColorScale 生成漸變色
    const colorStops = [
      { offset: '0%', color: this.colorScale.getColor(0) },
      { offset: '100%', color: this.colorScale.getColor(this.processedData.length - 1) }
    ];

    gradient.selectAll('stop')
      .data(colorStops)
      .join('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);


    // 使用 Observable 風格的 D3 area generator
    const area = d3.area<ProcessedObservableFunnelDataPoint>()
      .x(d => d.x)
      .y0(d => d.pathPoints[0][1]) // 上邊界
      .y1(d => d.pathPoints[1][1]) // 下邊界
      .curve(d3.curveCatmullRom.alpha(0.5));

    // 繪製主漏斗路徑
    chartArea.append('path')
      .datum(this.processedData)
      .attr('fill', 'url(#observable-funnel-gradient)')
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('d', area);

    // 繪製文字標籤
    this.renderLabels(chartArea);

    // 繪製分隔線
    this.renderSeparatorLines(chartArea);

    // 添加互動功能
    if (this.props.interactive) {
      this.addInteractivity(chartArea);
    }
  }

  private renderLabels(chartArea: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { 
      showValues = true, 
      showLabels = true, 
      showPercentages = true, 
      valueColor = '#ffffff', 
      labelColor = '#cccccc', 
      percentageColor = '#888888',
      valueFont = 'Lato, sans-serif',
      labelFont = 'Lato-Bold, sans-serif',
      percentageFont = 'Lato, sans-serif'
    } = this.props;

    if (showValues) {
      chartArea.selectAll('.values')
        .data(this.processedData)
        .join('text')
        .attr('class', 'values')
        .attr('x', d => d.x + 10)
        .attr('y', 30)
        .text(d => d3.format(',')(d.value))
        .attr('style', `
          fill: ${valueColor};
          font-size: 22px;
          font-family: ${valueFont};
        `);
    }

    if (showLabels) {
      chartArea.selectAll('.labels')
        .data(this.processedData)
        .join('text')
        .attr('class', 'labels')
        .attr('x', d => d.x + 10)
        .attr('y', 50)
        .text(d => d.label)
        .attr('style', `
          fill: ${labelColor};
          font-family: ${this.props.labelFont};
          font-size: 14px;
        `);
    }

    if (showPercentages) {
      chartArea.selectAll('.percentages')
        .data(this.processedData)
        .join('text')
        .attr('class', 'percentages')
        .attr('x', d => d.x + 10)
        .attr('y', 70)
        .text((d, i) => i === 0 ? '' : d3.format('.1%')(d.value / this.processedData[0].value))
        .attr('style', `
          fill: ${percentageColor};
          font-size: 18px;
          font-family: ${this.props.percentageFont};
        `);
    }
  }

  private renderSeparatorLines(chartArea: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { height = 300, percentageColor = '#888888' } = this.props;
    
    chartArea.selectAll('.separator-line')
      .data(d3.range(2, this.processedData.length + 1))
      .join('line')
      .attr('class', 'separator-line')
      .attr('x1', stepValue => this.processedData[stepValue - 1]?.x || 0)
      .attr('y1', 10)
      .attr('x2', stepValue => this.processedData[stepValue - 1]?.x || 0)
      .attr('y2', height! - 30)
      .style('stroke-width', 1)
      .style('stroke', percentageColor)
      .style('fill', 'none');
  }

  private addInteractivity(chartArea: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const { onStepClick, onStepHover, height = 300 } = this.props;

    if (onStepClick || onStepHover) {
      // 為每個步驟創建透明的互動區域
      chartArea.selectAll('.interaction-area')
        .data(this.processedData)
        .join('rect')
        .attr('class', 'interaction-area')
        .attr('x', d => d.x - 20)
        .attr('y', 10)
        .attr('width', 100)
        .attr('height', height - 40)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('click', (event, d) => onStepClick?.(d, event))
        .on('mouseenter', (event, d) => onStepHover?.(d, event))
        .on('mouseleave', (event, d) => onStepHover?.(null, event));
    }
  }

  protected getChartType(): string {
    return 'observable-funnel-chart';
  }

  public update(newConfig: Partial<ObservableFunnelChartConfig>): void {
    this.props = { ...this.props, ...newConfig };
    this.renderChart();
  }
}