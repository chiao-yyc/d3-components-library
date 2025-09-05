
import * as d3 from 'd3';
import { AreaChartProps, ProcessedAreaDataPoint, AreaSeriesData } from './types';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale } from '../../../core/color-scheme/color-manager';
import { ProcessedDataPoint } from '../../../core/data-processor/types';
import { createChartClipPath, createStandardGlow } from '../../../core/base-chart/visual-effects';
import { BrushZoomController, CrosshairController, createBrushZoom, createCrosshair } from '../../../core/base-chart/interaction-utils';

export class D3AreaChart extends BaseChart<AreaChartProps> {
  private processedData: ProcessedAreaDataPoint[] = [];
  private seriesData: AreaSeriesData[] = [];
  private stackedData: d3.Series<Record<string, number>, string>[] = [];
  private colorScale: ReturnType<typeof createColorScale>;
  private scales: {
    xScale?: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    yScale?: d3.ScaleLinear<number, number>;
    chartWidth: number;
    chartHeight: number;
  } = { chartWidth: 0, chartHeight: 0 };
  
  // 交互控制器
  private brushZoomController: BrushZoomController | null = null;
  private crosshairController: CrosshairController | null = null;
  private viewportController: any = null;

  constructor(config: AreaChartProps) {
    super(config);
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, categoryKey, xAccessor, yAccessor, categoryAccessor, stackMode } = this.props;
    if (!data?.length) {
      this.processedData = [];
      this.seriesData = [];
      this.stackedData = [];
      return [];
    }

    // 使用 DataProcessor 處理基本數據
    const processor = new DataProcessor({
      mapping: mapping,
      keys: { x: xKey, y: yKey },
      accessors: { x: xAccessor, y: yAccessor },
      autoDetect: true,
    });
    const result = processor.process(data);
    if (result.errors.length > 0) {
      this.handleError(new Error(result.errors.join(', ')));
    }
    
    // 轉換為 AreaChart 特定格式並添加 category 信息
    this.processedData = result.data.map((d, index) => {
      let category: string | undefined;
      const originalData = data[index];
      
      if (mapping?.category) {
        category = typeof mapping.category === 'function' ? mapping.category(originalData) : originalData[mapping.category];
      } else if (categoryAccessor) {
        category = categoryAccessor(originalData);
      } else if (categoryKey) {
        category = originalData[categoryKey];
      }
      
      return {
        ...d,
        category: category || 'default',
        originalData,
        index
      } as ProcessedAreaDataPoint;
    }).filter(d => !isNaN(d.y));

    // 按 x 值排序
    this.processedData.sort((a: ProcessedAreaDataPoint, b: ProcessedAreaDataPoint) => {
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime();
      }
      if (typeof a.x === 'number' && typeof b.x === 'number') {
        return a.x - b.x;
      }
      return String(a.x).localeCompare(String(b.x));
    });

    // 分組處理
    const groupedData = d3.group(this.processedData, (d: ProcessedAreaDataPoint) => d.category || 'default');
    this.seriesData = Array.from(groupedData, ([key, values]) => ({ key, values }));

    // 堆疊處理
    if (stackMode === 'none' || this.seriesData.length <= 1) {
      this.stackedData = this.seriesData.map(series => (
        { ...series, values: series.values.map(d => ({ ...d, y0: 0, y1: d.y })) }
      ));
    } else {
        const stack = d3.stack()
            .keys(this.seriesData.map(s => s.key))
            .value((d: any, key: string) => d[key] || 0)
            .order(d3.stackOrderNone)
            .offset(stackMode === 'stack' ? d3.stackOffsetNone : d3.stackOffsetExpand);

        const dataForStacking = Array.from(d3.group(this.processedData, (d: ProcessedAreaDataPoint) => d.x).values()).map(values => {
            const obj: any = { x: values[0].x };
            this.seriesData.forEach(series => {
                const point = values.find((v: ProcessedAreaDataPoint) => v.category === series.key);
                obj[series.key] = point ? point.y : 0;
            });
            return obj;
        });

        const stacked = stack(dataForStacking);
        this.stackedData = stacked.map((layer, i) => ({
            key: layer.key,
            values: layer.map((d, j) => ({
                x: d.data.x,
                y: d.data[layer.key],
                y0: d[0],
                y1: d[1],
                originalData: this.processedData.find((p: ProcessedAreaDataPoint) => p.x === d.data.x && p.category === layer.key)?.originalData,
                index: j,
                category: layer.key
            }))
        }));
    }
    
    return this.processedData;
  }

  protected createScales(): void {
    const { stackMode, colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    const allValues = this.stackedData.flatMap((series: any) => series.values);
    if (allValues.length === 0) {
      this.scales = { xScale: d3.scaleLinear(), yScale: d3.scaleLinear(), chartWidth, chartHeight };
      return;
    }
    
    let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
    const firstX = allValues[0]?.x;
    if (firstX instanceof Date) {
      xScale = d3.scaleTime().domain(d3.extent(allValues, d => d.x as Date) as [Date, Date]).range([0, chartWidth]);
    } else if (typeof firstX === 'number') {
      xScale = d3.scaleLinear().domain(d3.extent(allValues, d => d.x as number) as [number, number]).range([0, chartWidth]);
    } else {
      xScale = d3.scaleBand().domain(Array.from(new Set(allValues.map(d => String(d.x))))).range([0, chartWidth]).padding(0.1);
    }

    const yExtent = stackMode === 'percent' 
      ? [0, 1]
      : [0, d3.max(allValues, d => d.y1 || d.y) || 0];
    
    const yScale = d3.scaleLinear().domain(yExtent).range([chartHeight, 0]).nice();

    this.scales = { xScale, yScale, chartWidth, chartHeight };
    
    // 創建顏色比例尺
    this.colorScale = createColorScale({
      type: 'custom',
      colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      domain: this.seriesData.map((_, i) => i),
      interpolate: false
    });
  }

  protected renderChart(): void {
    const { 
      curve, fillOpacity, strokeWidth, showGrid, showDots, dotRadius, 
      animate, animationDuration, interactive, showTooltip, 
      showXAxis, showYAxis, xAxisFormat, yAxisFormat,
      onDataClick, onDataHover 
    } = this.props;
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    const g = this.createSVGContainer();

    if (showGrid) {
      // X axis grid
      g.append('g')
        .attr('class', 'grid grid-x')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.7);
      
      // Y axis grid  
      g.append('g')
        .attr('class', 'grid grid-y')
        .call(d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
        )
        .selectAll('line')
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.7);
    }

    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.y0 || 0))
      .y1(d => yScale(d.y1 || d.y))
      .curve(d3[this.getCurve(curve || 'monotone')]);

    // 渲染區域
    const areas = g.selectAll('.area-path')
      .data(this.stackedData)
      .enter()
      .append('path')
      .attr('class', 'area-path')
      .attr('data-testid', (d, i) => `area-path-${i}`)
      .attr('d', d => areaGenerator(d.values))
      .attr('fill', (d, i) => this.colorScale.getColor(i))
      .attr('fill-opacity', fillOpacity || 0.7)
      .attr('stroke', (d, i) => this.colorScale.getColor(i))
      .attr('stroke-width', strokeWidth || 2)
      .attr('stroke-opacity', 0.8);

    // 动画
    if (animate) {
      areas
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration || 750)
        .attr('opacity', 1);
    }

    // 如果需要顯示點
    if (showDots) {
      this.stackedData.forEach((series, seriesIndex) => {
        const dots = g.selectAll(`.dots-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append('circle')
          .attr('class', `dots dots-${seriesIndex}`)
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y1 || d.y))
          .attr('r', dotRadius || 3)
          .attr('fill', this.colorScale.getColor(seriesIndex))
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
          
        if (animate) {
          dots
            .attr('opacity', 0)
            .transition()
            .duration(animationDuration || 750)
            .delay((d, i) => i * 50)
            .attr('opacity', 1);
        }
      });
    }

    // 互動事件
    if (interactive && showTooltip) {
      areas
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [x, y] = d3.pointer(event, g.node());
          const content = `Series: ${d.key}<br/>Values: ${d.values.length} points`;
          this.createTooltip(x, y, content);
          onDataHover?.(d.values[0], d.key);
        })
        .on('mouseleave', () => {
          this.hideTooltip();
          onDataHover?.(null);
        })
        .on('click', (event, d) => {
          onDataClick?.(d.values[0], d.key);
        });
    }

    // 使用 BaseChart 共用軸線渲染工具
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis,
      showYAxis,
      xAxisConfig: {
        format: xAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        format: yAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280'
      }
    });

    // === 添加交互功能 ===
    this.addInteractionFeatures(g);
  }

  /**
   * 添加交互功能 (移植自 LineChart)
   */
  private addInteractionFeatures(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    console.log('🔧 AreaChart: addInteractionFeatures 開始執行');
    
    // 清理舊的交互控制器和元素
    this.cleanupInteractionControllers();
    container.selectAll('.brush').remove();
    container.selectAll('.crosshair').remove();
    container.selectAll('.focus').remove();
    
    const { 
      enableBrushZoom, 
      brushZoomConfig, 
      onZoom, 
      onZoomReset,
      enableCrosshair, 
      crosshairConfig,
      enableDropShadow,
      enableGlowEffect,
      glowColor,
      dataAccessor
    } = this.props;

    console.log('⚙️ AreaChart 交互功能配置:', { 
      enableBrushZoom, 
      enableCrosshair, 
      enableDropShadow, 
      enableGlowEffect
    });

    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    // === 默認剪裁路徑：防止圖表內容溢出軸線區域 ===
    let defaultClipPathId = null;
    if (this.svgRef?.current) {
      console.log('✂️ AreaChart: 創建默認剪裁路徑，防止圖表內容溢出軸線區域');
      const svg = d3.select(this.svgRef.current);
      
      defaultClipPathId = createChartClipPath(svg, { width: chartWidth, height: chartHeight });
      console.log('✂️ AreaChart: 默認剪裁路徑創建完成:', defaultClipPathId);
      
      // 將剪裁路徑應用到所有圖表內容元素，保護軸線
      const areaElements = container.selectAll('path[class*="area-"]');
      const lineElements = container.selectAll('path[class*="line-"]');
      const dotElements = container.selectAll('circle[class*="dot-"]');
      
      console.log('✂️ AreaChart: 應用默認剪裁路徑 - 區域:', areaElements.size(), '線條:', lineElements.size(), '點:', dotElements.size());
      
      areaElements.attr('clip-path', defaultClipPathId);
      lineElements.attr('clip-path', defaultClipPathId);
      dotElements.attr('clip-path', defaultClipPathId);
      
      // 確保軸線永遠不被剪裁
      const axisElements = container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
      axisElements.attr('clip-path', null);
      console.log('✂️ AreaChart: 軸線保護完成，保護了', axisElements.size(), '個軸線元素');
    }

    // 應用視覺效果
    if (enableDropShadow && this.svgRef?.current) {
      console.log('🌑 AreaChart: 開始應用陰影效果');
      const svg = d3.select(this.svgRef.current);
      const areaElements = container.selectAll('path[class*="area-"]');
      this.addDropShadow(svg, areaElements);
      console.log('🌑 AreaChart: 陰影效果應用完成');
    }

    if (enableGlowEffect && this.svgRef?.current) {
      console.log('✨ AreaChart: 開始應用光暈效果, 顏色:', glowColor);
      const svg = d3.select(this.svgRef.current);
      const areaElements = container.selectAll('path[class*="area-"]');
      this.addGlowEffect(svg, areaElements, glowColor);
      console.log('✨ AreaChart: 光暈效果應用完成');
    }

    // 筆刷縮放功能
    if (enableBrushZoom) {
      console.log('🖱️ AreaChart: 開始創建筆刷縮放功能');
      
      // 使用統一的控制器建立筆刷縮放功能
      this.brushZoomController = createBrushZoom(
        container,
        { xScale, yScale },
        {
          enabled: true,
          direction: 'x',
          resetOnDoubleClick: brushZoomConfig?.resetOnDoubleClick !== false,
          onZoom: onZoom,
          onReset: onZoomReset
        },
        { width: chartWidth, height: chartHeight }
      );
      
      console.log('🖌️ AreaChart: 筆刷控制器建立完成');
      
      console.log('🖱️ AreaChart: 筆刷縮放功能創建完成');
    }

    // 十字游標功能
    if (enableCrosshair) {
      console.log('🎯 AreaChart: 開始創建十字游標功能');
      
      // 使用統一的控制器建立十字游標功能
      this.crosshairController = createCrosshair(
        container,
        this.stackedData.flatMap(series => series.values),
        { xScale, yScale },
        {
          enabled: true,
          circleRadius: crosshairConfig?.circleRadius || 4,
          formatText: crosshairConfig?.formatText,
          ...crosshairConfig
        },
        { width: chartWidth, height: chartHeight },
        dataAccessor
      );

      console.log('🎯 AreaChart: 十字游標控制器建立完成');
    }

    console.log('🔧 AreaChart: addInteractionFeatures 執行完成');
  }

  /**
   * 清理交互控制器
   */
  private cleanupInteractionControllers(): void {
    if (this.brushZoomController) {
      this.brushZoomController.destroy?.();
      this.brushZoomController = null;
    }
    
    if (this.crosshairController) {
      this.crosshairController.destroy?.();
      this.crosshairController = null;
    }
    
    this.viewportController = null;
  }

  /**
   * 重寫 update 方法以處理交互控制器更新
   */
  public update(newProps: AreaChartProps): void {
    // 清理舊的交互控制器
    this.cleanupInteractionControllers();
    
    // 調用父類的 update 方法
    super.update(newProps);
  }

  /**
   * 處理筆刷結束事件 (移植自 LineChart)
   */
  private handleBrushEnd(
    event: any, 
    scales: { xScale: any; yScale: any }, 
    onZoom?: (domain: [any, any]) => void,
    onZoomReset?: () => void
  ): void {
    console.log('🖌️ AreaChart: handleBrushEnd 開始處理');
    const selection = event.selection;
    
    if (!selection) {
      console.log('🖌️ AreaChart: 沒有選擇區域，執行重置');
      this.resetZoom(scales, onZoomReset);
    } else {
      console.log('🖌️ AreaChart: 有選擇區域，進行縮放');
      const [x0, x1] = selection;
      const newDomain: [any, any] = [scales.xScale.invert(x0), scales.xScale.invert(x1)];
      
      console.log('🖌️ AreaChart: 縮放到新域值:', newDomain);
      
      // 更新比例尺
      scales.xScale.domain(newDomain);
      
      // 重新渲染圖表內容
      this.updateChartAfterZoom(scales);
      
      // 清除筆刷選擇
      const container = d3.select(this.svgRef?.current).select('g');
      container.select('.brush').call(d3.brushX().move, null);
      
      // 觸發用戶回調
      if (onZoom) {
        console.log('🖌️ AreaChart: 觸發用戶縮放回調');
        onZoom(newDomain);
      }
    }
    console.log('🖌️ AreaChart: handleBrushEnd 處理完成');
  }

  /**
   * 重置縮放 (移植自 LineChart)
   */
  private resetZoom(scales: { xScale: any; yScale: any }, onZoomReset?: () => void): void {
    // 重置到原始域 - 需要重新計算原始數據範圍
    const allValues = this.stackedData.flatMap((series: any) => series.values);
    let originalXDomain: [any, any];
    
    const firstX = allValues[0]?.x;
    if (firstX instanceof Date) {
      originalXDomain = d3.extent(allValues, (d: any) => d.x) as [Date, Date];
    } else if (typeof firstX === 'number') {
      originalXDomain = d3.extent(allValues, (d: any) => d.x) as [number, number];
    } else {
      originalXDomain = [allValues[0]?.x, allValues[allValues.length - 1]?.x];
    }
    
    scales.xScale.domain(originalXDomain);
    this.updateChartAfterZoom(scales);
    
    if (onZoomReset) {
      onZoomReset();
    }
  }

  /**
   * 縮放後更新圖表 (移植自 LineChart，適配 Area Chart)
   */
  private updateChartAfterZoom(scales: { xScale: any; yScale: any }): void {
    if (!this.svgRef?.current) return;

    const svg = d3.select(this.svgRef.current);
    const container = svg.select('g');
    
    // 更新 X 軸
    const xAxisGroup = container.select('.bottom-axis');
    if (!xAxisGroup.empty()) {
      console.log('🔄 AreaChart: 找到 X 軸組，開始更新');
      const xAxisFormat = this.stackedData[0]?.values[0]?.x instanceof Date ? d3.timeFormat('%m/%d') as any : undefined;
      xAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(scales.xScale).tickFormat(xAxisFormat));
      console.log('🔄 AreaChart: X 軸更新完成');
    }
    
    // 更新區域路徑
    const areaGenerator = d3.area<any>()
      .x(d => scales.xScale(d.x))
      .y0(d => scales.yScale(d.y0 || 0))
      .y1(d => scales.yScale(d.y1 || d.y))
      .curve(d3[this.getCurve(this.props.curve || 'monotone')]);

    container.selectAll('.area-path')
      .transition()
      .duration(1000)
      .attr('d', (d: any) => areaGenerator(d.values));
      
    // 更新線條（如果有的話）
    const lineGenerator = d3.line<any>()
      .x(d => scales.xScale(d.x))
      .y(d => scales.yScale(d.y1 || d.y))
      .curve(d3[this.getCurve(this.props.curve || 'monotone')]);

    container.selectAll('.line-path')
      .transition()
      .duration(1000)
      .attr('d', (d: any) => lineGenerator(d.values));

    console.log('🔄 AreaChart: 圖表更新完成');
  }

  /**
   * 處理十字游標移動 (移植自 LineChart，適配 Area Chart)
   */
  private handleCrosshairMove(
    event: MouseEvent,
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    focus: d3.Selection<SVGCircleElement, unknown, null, undefined>,
    focusText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    scales: { xScale: any; yScale: any },
    crosshairConfig?: Partial<CrosshairConfig>
  ): void {
    const [mouseX] = d3.pointer(event, container.node());
    const xValue = scales.xScale.invert(mouseX);
    
    // 查找最近的數據點 - 使用第一個系列的數據
    if (this.stackedData.length === 0) return;
    
    const bisect = d3.bisector((d: any) => d.x).left;
    const seriesValues = this.stackedData[0].values;
    const i = bisect(seriesValues, xValue, 1);
    const selectedData = seriesValues[i];
    
    if (selectedData) {
      const x = scales.xScale(selectedData.x);
      const y = scales.yScale(selectedData.y1 || selectedData.y);

      focus.attr('cx', x).attr('cy', y);

      const textContent = crosshairConfig?.formatText 
        ? crosshairConfig.formatText(selectedData)
        : `${selectedData.x}: ${(selectedData.y || 0).toFixed(2)}`;
      
      focusText
        .text(textContent)
        .attr('x', x + 10)
        .attr('y', y - 10);
    }
  }

  protected getChartType(): string {
    return 'area';
  }

  private getCurve(curveName: string) {
      switch (curveName) {
          case 'monotone': return 'curveMonotoneX';
          case 'cardinal': return 'curveCardinal';
          case 'basis': return 'curveBasis';
          case 'step': return 'curveStep';
          default: return 'curveLinear';
      }
  }
}
