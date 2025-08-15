import * as d3 from 'd3';

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
      percentages: '#888888'
    };

    this.config = { ...defaultConfig, ...config };
    this.render();
  }

  private addWebFont(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, name: string, url: string) {
    // 在真實實作中，這裡會處理字體載入
    return svg;
  }

  public render() {
    const { data, width, height, background, gradient1, gradient2, values, labels, percentages } = this.config;
    
    // 清理容器
    d3.select(this.container).selectAll('*').remove();
    
    // 完全按照 Observable 範例的程式碼
    const svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .call(this.addWebFont, 'Lato', 'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wXiWtFCc.woff2')
      .call(this.addWebFont, 'Lato-Bold', 'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2')
      .attr('style', `
        background-color: ${background};
        font-family: 'Lato';
      `);
    
    this.svg = svg;

    // 設置 x 比例尺
    const x = d3.scaleLinear()
      .domain([1, data.length])
      .range([60, width - 60]);
    
    // 創建 data2 用於路徑生成
    const data2: Array<[number, number]> = [];
    
    // 上半部分路徑點
    data.forEach((d, i) => {
      const ratio = Math.sqrt(d.value / data[0].value);
      const yPos = height * 0.4 - (height * 0.3) * ratio;
      data2.push([x(d.step), yPos]);
    });
    
    // 下半部分路徑點（鏡像）
    for (let i = data.length - 1; i >= 0; i--) {
      const d = data[i];
      const ratio = Math.sqrt(d.value / data[0].value);
      const yPos = height * 0.6 + (height * 0.3) * ratio;
      data2.push([x(d.step), yPos]);
    }
    
    // 創建 area generators
    const area = d3.area<[number, number]>()
      .x(d => d[0])
      .y0(d => d[1])
      .y1(d => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaMirror = d3.area<[number, number]>()
      .x(d => d[0])
      .y0(d => d[1]) 
      .y1(d => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    // 完全按照 Observable 範例創建漸變
    svg.append('linearGradient')
      .attr('id', 'temperature-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', x(1)).attr('y1', 0)
      .attr('x2', x(data.length)).attr('y2', 0)
      .selectAll('stop')
        .data([
          {offset: '0%', color: gradient1 },
          {offset: '100%', color: gradient2 },
        ])
      .enter().append('stop')
        .attr('offset', function(d) { return d.offset; })
        .attr('stop-color', function(d) { return d.color; });
    
    // 繪製主路徑
    svg.append('path')
        .datum(data2)
        .attr('fill', 'url(#temperature-gradient)')
        .attr('d', area);
    
    // 繪製鏡像路徑
    svg.append('path')
      .datum(data2)
      .attr('fill', 'url(#temperature-gradient)')
      .attr('d', areaMirror);

    // 數值標籤 - 完全按照 Observable 範例
    svg.selectAll('.values')
      .data(data)
      .enter()
      .append('text')
        .attr('class', 'values')
        .attr('x', ({ step }) => x(step) + 10)
        .attr('y', 30)
        .text(({ value }) => d3.format(',')(value))
        .attr('style', `
          fill: ${values};
          font-size: 22px;
        `);
    
    // 標籤 - 完全按照 Observable 範例
    svg.selectAll('.labels')
      .data(data)
      .enter()
      .append('text')
        .attr('class', 'labels')
        .attr('x', ({ step }) => x(step) + 10)
        .attr('y', 50)
        .text(({ label }) => label)
        .attr('style', `
            fill: ${labels};
            font-family: 'Lato-Bold';
            font-size: 14px;
        `);
    
    // 百分比 - 完全按照 Observable 範例
    svg.selectAll('.percentages')
      .data(data)
      .enter()
      .append('text')
        .attr('class', 'percentages')
        .attr('x', ({ step }) => x(step) + 10)
        .attr('y', 70)
        .text(({ value }, index) => index === 0 ? '' : d3.format('.1%')(value / data[0].value))
        .attr('style', `
            fill: ${percentages};
            font-size: 18px;
        `);
        
    // 分隔線 - 完全按照 Observable 範例
    svg.selectAll('line')
      .data(d3.range(2, data.length + 1))
      .enter()
      .append('line')
        .attr('x1', value => x(value))
        .attr('y1', 10)
        .attr('x2', value => x(value))
        .attr('y2', height - 30)
        .style('stroke-width', 1)
        .style('stroke', percentages)
        .style('fill', 'none');
  }

  public update(newConfig: Partial<ExactFunnelConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }

  public destroy() {
    d3.select(this.container).selectAll('*').remove();
  }
}