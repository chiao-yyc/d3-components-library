
import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { ScatterPlotProps, ProcessedScatterDataPoint } from './types';
import { createChartClipPath, createStandardDropShadow, createStandardGlow } from '../../../core/base-chart/visual-effects';
import { BrushZoomController, CrosshairController } from '../../../core/base-chart/interaction-utils';
import { GroupProcessorResult } from '../../../core/base-chart/chart-group-utils';

export class D3ScatterPlot extends BaseChart<ScatterPlotProps> {
  private processedData: ProcessedScatterDataPoint[] = [];
  private scales: any = {};
  private colorScale: ColorScale | null = null;
  private trendlineData: { x: number; y: number }[] | null = null;
  private scatterGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  
  // 交互控制器
  private brushZoomController: BrushZoomController | null = null;
  private crosshairController: CrosshairController | null = null;
  private viewportController: any = null;
  
  // Group functionality
  private groupResult: GroupProcessorResult | null = null;

  constructor(props: ScatterPlotProps) {
    super(props);
  }

  protected processData(): { x: any; y: any; data: ProcessedScatterDataPoint[] } {
    const { data, mapping, xAccessor, yAccessor, sizeAccessor, colorAccessor, xKey, yKey, sizeKey, colorKey, groupBy } = this.props;
    
    if (!data?.length) {
      this.processedData = [];
      this.groupResult = null;
      return { x: null, y: null, data: [] };
    }

    const processor = new DataProcessor({
      mapping: {
        x: mapping?.x || xKey || xAccessor,
        y: mapping?.y || yKey || yAccessor,
        size: mapping?.size || sizeKey || sizeAccessor,
        color: mapping?.color || colorKey || colorAccessor
      },
      autoDetect: true
    });

    const result = processor.process(data);
    
    this.processedData = result.data.map((d, index) => ({
      x: Number(d.x) || 0,
      y: Number(d.y) || 0,
      size: d.size !== undefined ? Number(d.size) : undefined,
      color: d.color ? String(d.color) : undefined,
      originalData: d.originalData,
      index,
      // Add group information if groupBy is specified
      group: groupBy ? String(d.originalData[groupBy] || '') : undefined
    } as ProcessedScatterDataPoint));
    
    // Process group data if groupBy is specified
    if (groupBy) {
      this.groupResult = this.processGroupData(this.processedData.map(d => ({ 
        ...d.originalData, 
        [groupBy]: d.group 
      })));
    } else {
      this.groupResult = null;
    }
    
    return {
      x: this.processedData.map(d => d.x),
      y: this.processedData.map(d => d.y),
      data: this.processedData
    };
  }

  protected createScales(): void {
    const { sizeRange = [3, 12], colors } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // X 軸比例尺
    const xDomain = d3.extent(this.processedData, d => d.x) as [number, number];
    const xPadding = (xDomain[1] - xDomain[0]) * 0.05;
    const xScale = d3.scaleLinear()
      .domain([xDomain[0] - xPadding, xDomain[1] + xPadding])
      .range([0, chartWidth]);

    // Y 軸比例尺
    const yDomain = d3.extent(this.processedData, d => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.05;
    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([chartHeight, 0]);

    // 大小比例尺
    let sizeScale: d3.ScaleSqrt<number, number> | null = null;
    if (this.processedData.some(d => d.size !== undefined)) {
      const sizeDomain = d3.extent(this.processedData, d => d.size) as [number, number];
      sizeScale = d3.scaleSqrt().domain(sizeDomain).range(sizeRange);
    }

    // 顏色比例尺 - 支援群組功能
    const hasColorData = this.processedData.some(d => d.color !== undefined);
    const hasGroupData = this.groupResult && this.groupResult.groups.length > 0;
    
    if (hasGroupData && this.groupResult) {
      // 使用群組顏色比例尺
      this.colorScale = {
        getColor: (value: any, index: number) => {
          const dataPoint = this.processedData[index];
          if (dataPoint && dataPoint.group) {
            return this.groupResult!.colorScale(dataPoint.group);
          }
          return this.groupResult!.colorScale(this.groupResult!.groups[0]);
        },
        setDomain: () => {},
        getDomain: () => this.groupResult!.groups
      };
    } else if (hasColorData) {
      const colorValues = [...new Set(this.processedData.map(d => d.color).filter(c => c !== undefined))];
      
      if (typeof this.processedData[0]?.color === 'number') {
        // 數值型顏色
        this.colorScale = createColorScale({
          type: 'blues',
          interpolate: true,
          count: colorValues.length
        });
        const colorDomain = d3.extent(this.processedData, d => Number(d.color)) as [number, number];
        this.colorScale.setDomain(colorDomain);
      } else {
        // 分類型顏色
        this.colorScale = createColorScale({
          type: 'custom',
          colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
          count: colorValues.length
        });
        this.colorScale.setDomain(colorValues as string[]);
      }
    }

    this.scales = { xScale, yScale, sizeScale, chartWidth, chartHeight };
  }

  private calculateTrendline() {
    const { showTrendline } = this.props;
    const { xScale, yScale } = this.scales;

    if (!showTrendline || !this.processedData.length || !xScale || !yScale) {
      this.trendlineData = null;
      return;
    }

    const n = this.processedData.length;
    const sumX = this.processedData.reduce((sum, d) => sum + d.x, 0);
    const sumY = this.processedData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = this.processedData.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumXX = this.processedData.reduce((sum, d) => sum + d.x * d.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xDomain = xScale.domain();
    this.trendlineData = [
      { x: xDomain[0], y: slope * xDomain[0] + intercept },
      { x: xDomain[1], y: slope * xDomain[1] + intercept }
    ];
  }

  protected renderChart(): void {
    const { radius = 4, opacity = 0.7, strokeWidth = 1, strokeColor = 'white', 
            showTrendline = false, trendlineColor = '#ef4444', trendlineWidth = 2, 
            animate, animationDuration = 750, colors } = this.props;
    const { xScale, yScale, sizeScale, chartWidth, chartHeight } = this.scales;

    // 計算趨勢線
    this.calculateTrendline();

    const g = this.createSVGContainer();
    this.scatterGroup = g.append('g').attr('class', 'scatter-group');

    // 網格線
    this.scatterGroup.append('g').attr('class', 'grid-x')
      .selectAll('line')
      .data(xScale.ticks())
      .enter().append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2);

    this.scatterGroup.append('g').attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks())
      .enter().append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2);

    // 趋勢線
    if (this.trendlineData && showTrendline) {
      const lineGenerator = d3.line<{x: number, y: number}>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
      
      this.scatterGroup.append('path')
        .datum(this.trendlineData)
        .attr('class', 'trendline')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', trendlineColor)
        .attr('stroke-width', trendlineWidth)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8);
    }

    // 散點圖點 - 支援群組功能
    const circles = this.scatterGroup.selectAll('.dot')
      .data(this.processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale ? sizeScale(d.size!) : radius)
      .attr('fill', (d, i) => {
        if (this.colorScale && (d.color !== undefined || d.group !== undefined)) {
          return this.colorScale.getColor(d.color || d.group, i);
        }
        const defaultColors = colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        return defaultColors[i % defaultColors.length];
      })
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', animate ? 0 : opacity);

    // 應用群組屬性
    if (this.props.groupBy) {
      this.applyGroupAttributes(circles, this.props.groupBy);
    }

    // 動畫
    if (animate) {
      circles.transition()
        .delay((d, i) => i * 10)
        .duration(animationDuration)
        .attr('opacity', opacity);
    }

    // 使用 BaseChart 共用軸線渲染工具
    this.renderAxes(this.scatterGroup, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true,
      xAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        fontSize: '12px', 
        fontColor: '#6b7280'
      }
    });

    // === 添加群組圖例 ===
    if (this.groupResult && this.props.showGroupLegend) {
      this.renderGroupLegend(this.scatterGroup, this.groupResult);
    }

    // === 添加群組互動功能 ===
    if (this.props.enableGroupHighlight || this.props.enableGroupFilter) {
      console.log('🎨 ScatterPlot: 開始設置群組交互功能');
      this.setupGroupInteractions(circles);
    }

    // === 添加交互功能 ===
    this.addInteractionFeatures(g);
  }

  /**
   * 設置群組交互功能
   */
  private setupGroupInteractions(circles: d3.Selection<SVGCircleElement, ProcessedScatterDataPoint, SVGGElement, unknown>): void {
    if (!this.props.groupBy) return;

    console.log('🎨 ScatterPlot: 設置群組交互事件');

    if (this.props.enableGroupHighlight) {
      circles
        .on('mouseover.group', (event, d) => {
          const group = d.group;
          if (group) {
            console.log('🎯 群組懸停:', group);
            
            // 高亮同群組的所有散點 - 僅使用顏色和透明度
            circles
              .transition()
              .duration(200)
              .style('opacity', (data) => data.group === group ? 1 : 0.3);

            // 調用用戶回調
            if (this.props.onGroupHover) {
              this.props.onGroupHover(group);
            }
          }
        })
        .on('mouseleave.group', (event, d) => {
          console.log('🎯 群組離開');
          
          // 重置所有散點
          circles
            .transition()
            .duration(200)
            .style('opacity', this.props.opacity || 0.7);

          // 調用用戶回調
          if (this.props.onGroupHover) {
            this.props.onGroupHover(null);
          }
        });
    }

    if (this.props.enableGroupFilter) {
      circles
        .style('cursor', 'pointer')
        .on('click.group', (event, d) => {
          const group = d.group;
          if (group && this.props.onGroupSelect) {
            console.log('🎯 群組點擊:', group);
            // 這裡可以實現群組篩選邏輯
            this.props.onGroupSelect(group, true);
          }
        });
    }
  }

  /**
   * 添加交互功能 (針對 Scatter Plot 優化，支援 XY 雙軸縮放)
   */
  private addInteractionFeatures(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    console.log('🔧 ScatterPlot: addInteractionFeatures 開始執行');
    
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

    console.log('⚙️ ScatterPlot 交互功能配置:', { 
      enableBrushZoom, 
      enableCrosshair, 
      enableDropShadow, 
      enableGlowEffect,
      brushZoomDirection: brushZoomConfig?.direction || 'xy'
    });

    const { xScale, yScale, chartWidth, chartHeight } = this.scales;

    // === 默認剪裁路徑：防止圖表內容溢出軸線區域 ===
    let defaultClipPathId = null;
    if (this.svgRef?.current) {
      console.log('✂️ ScatterPlot: 創建默認剪裁路徑，防止圖表內容溢出軸線區域');
      const svg = d3.select(this.svgRef.current);
      
      defaultClipPathId = createChartClipPath(svg, { width: chartWidth, height: chartHeight });
      console.log('✂️ ScatterPlot: 默認剪裁路徑創建完成:', defaultClipPathId);
      
      // 將剪裁路徑應用到所有散點元素，保護軸線
      const dotElements = container.selectAll('circle.dot');
      const trendlineElements = container.selectAll('path.trendline');
      
      console.log('✂️ ScatterPlot: 應用默認剪裁路徑 - 散點:', dotElements.size(), '趨勢線:', trendlineElements.size());
      
      dotElements.attr('clip-path', defaultClipPathId);
      trendlineElements.attr('clip-path', defaultClipPathId);
      
      // 確保軸線永遠不被剪裁
      const axisElements = container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
      axisElements.attr('clip-path', null);
      console.log('✂️ ScatterPlot: 軸線保護完成，保護了', axisElements.size(), '個軸線元素');
    }

    // 應用視覺效果
    if (enableDropShadow && this.svgRef?.current) {
      console.log('🌑 ScatterPlot: 開始應用陰影效果');
      const svg = d3.select(this.svgRef.current);
      const dotElements = container.selectAll('circle.dot');
      this.addDropShadow(svg, dotElements);
      console.log('🌑 ScatterPlot: 陰影效果應用完成');
    }

    if (enableGlowEffect && this.svgRef?.current) {
      console.log('✨ ScatterPlot: 開始應用光暈效果, 顏色:', glowColor);
      const svg = d3.select(this.svgRef.current);
      const dotElements = container.selectAll('circle.dot');
      this.addGlowEffect(svg, dotElements, glowColor);
      console.log('✨ ScatterPlot: 光暈效果應用完成');
    }

    // 筆刷縮放功能 (Scatter Plot 的特色：支援 XY 雙軸縮放)
    if (enableBrushZoom) {
      console.log('🖱️ ScatterPlot: 開始創建筆刷縮放功能');
      
      // ScatterPlot 預設使用 XY 雙軸縮放，這是它的優勢
      const direction = brushZoomConfig?.direction || 'xy';
      console.log('🖱️ ScatterPlot: 縮放方向:', direction);
      
      // 使用統一的控制器建立筆刷縮放功能
      this.brushZoomController = createBrushZoom(
        container,
        { xScale, yScale },
        {
          enabled: true,
          direction: direction,
          resetOnDoubleClick: brushZoomConfig?.resetOnDoubleClick !== false,
          onZoom: onZoom,
          onReset: onZoomReset
        },
        { width: chartWidth, height: chartHeight }
      );
      
      console.log('🖌️ ScatterPlot: 筆刷控制器建立完成');
      
      console.log('🖱️ ScatterPlot: 筆刷縮放功能創建完成');
    }

    // 十字游標功能
    if (enableCrosshair) {
      console.log('🎯 ScatterPlot: 開始創建十字游標功能');
      
      // 使用統一的控制器建立十字游標功能
      this.crosshairController = createCrosshair(
        container,
        this.processedData,
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

      console.log('🎯 ScatterPlot: 十字游標控制器建立完成');
    }

    console.log('🔧 ScatterPlot: addInteractionFeatures 執行完成');
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
  public update(newProps: ScatterPlotProps): void {
    // 清理舊的交互控制器
    this.cleanupInteractionControllers();
    
    // 調用父類的 update 方法
    super.update(newProps);
  }

  /**
   * 處理筆刷結束事件 (ScatterPlot 特色：支援 XY 雙軸縮放)
   */
  private handleBrushEnd(
    event: any, 
    scales: { xScale: any; yScale: any }, 
    onZoom?: (domain: { x?: [any, any]; y?: [any, any] }) => void,
    onZoomReset?: () => void,
    direction: string = 'xy'
  ): void {
    console.log('🖌️ ScatterPlot: handleBrushEnd 開始處理, 方向:', direction);
    const selection = event.selection;
    
    if (!selection) {
      console.log('🖌️ ScatterPlot: 沒有選擇區域，執行重置');
      this.resetZoom(scales, onZoomReset);
    } else {
      console.log('🖌️ ScatterPlot: 有選擇區域，進行縮放');
      
      let newDomain: { x?: [any, any]; y?: [any, any] } = {};
      
      if (direction === 'x') {
        const [x0, x1] = selection;
        newDomain.x = [scales.xScale.invert(x0), scales.xScale.invert(x1)];
        scales.xScale.domain(newDomain.x);
      } else if (direction === 'y') {
        const [y0, y1] = selection;
        newDomain.y = [scales.yScale.invert(y1), scales.yScale.invert(y0)]; // Y軸反向
        scales.yScale.domain(newDomain.y);
      } else if (direction === 'xy') {
        // 2D 筆刷選擇，ScatterPlot 的特色功能
        const [[x0, y0], [x1, y1]] = selection;
        newDomain.x = [scales.xScale.invert(x0), scales.xScale.invert(x1)];
        newDomain.y = [scales.yScale.invert(y1), scales.yScale.invert(y0)]; // Y軸反向
        
        scales.xScale.domain(newDomain.x);
        scales.yScale.domain(newDomain.y);
      }
      
      console.log('🖌️ ScatterPlot: 縮放到新域值:', newDomain);
      
      // 重新渲染圖表內容
      this.updateChartAfterZoom(scales);
      
      // 清除筆刷選擇
      const container = d3.select(this.svgRef?.current).select('g');
      if (direction === 'x') {
        container.select('.brush').call(d3.brushX().move, null);
      } else if (direction === 'y') {
        container.select('.brush').call(d3.brushY().move, null);
      } else {
        container.select('.brush').call(d3.brush().move, null);
      }
      
      // 觸發用戶回調
      if (onZoom) {
        console.log('🖌️ ScatterPlot: 觸發用戶縮放回調');
        onZoom(newDomain);
      }
    }
    console.log('🖌️ ScatterPlot: handleBrushEnd 處理完成');
  }

  /**
   * 重置縮放 (ScatterPlot 雙軸重置)
   */
  private resetZoom(scales: { xScale: any; yScale: any }, onZoomReset?: () => void): void {
    // 重置到原始域
    const originalXDomain = d3.extent(this.processedData, (d: any) => d.x) as [number, number];
    const originalYDomain = d3.extent(this.processedData, (d: any) => d.y) as [number, number];
    
    scales.xScale.domain(originalXDomain);
    scales.yScale.domain(originalYDomain);
    this.updateChartAfterZoom(scales);
    
    if (onZoomReset) {
      onZoomReset();
    }
  }

  /**
   * 縮放後更新圖表 (ScatterPlot 雙軸更新)
   */
  private updateChartAfterZoom(scales: { xScale: any; yScale: any }): void {
    if (!this.svgRef?.current) return;

    const svg = d3.select(this.svgRef.current);
    const container = svg.select('g');
    
    // 更新軸線
    const xAxisGroup = container.select('.bottom-axis');
    if (!xAxisGroup.empty()) {
      console.log('🔄 ScatterPlot: 找到 X 軸組，開始更新');
      xAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(scales.xScale));
      console.log('🔄 ScatterPlot: X 軸更新完成');
    }
    
    const yAxisGroup = container.select('.left-axis');
    if (!yAxisGroup.empty()) {
      console.log('🔄 ScatterPlot: 找到 Y 軸組，開始更新');
      yAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisLeft(scales.yScale));
      console.log('🔄 ScatterPlot: Y 軸更新完成');
    }
    
    // 更新散點位置
    container.selectAll('.dot')
      .transition()
      .duration(1000)
      .attr('cx', (d: any) => scales.xScale(d.x))
      .attr('cy', (d: any) => scales.yScale(d.y));
      
    // 更新趨勢線（如果有的話）
    if (this.trendlineData) {
      const lineGenerator = d3.line<{x: number, y: number}>()
        .x(d => scales.xScale(d.x))
        .y(d => scales.yScale(d.y));
        
      container.select('.trendline')
        .transition()
        .duration(1000)
        .attr('d', lineGenerator(this.trendlineData));
    }

    console.log('🔄 ScatterPlot: 圖表更新完成');
  }

  /**
   * 處理十字游標移動 (ScatterPlot 最近點查找)
   */
  private handleCrosshairMove(
    event: MouseEvent,
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    focus: d3.Selection<SVGCircleElement, unknown, null, undefined>,
    focusText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    scales: { xScale: any; yScale: any },
    crosshairConfig?: Partial<any>
  ): void {
    const [mouseX, mouseY] = d3.pointer(event, container.node());
    const xValue = scales.xScale.invert(mouseX);
    const yValue = scales.yScale.invert(mouseY);
    
    // 查找最近的散點
    if (this.processedData.length === 0) return;
    
    // 使用歐幾里得距離查找最近點
    let minDistance = Infinity;
    let nearestPoint: any = null;
    
    this.processedData.forEach(d => {
      const dx = scales.xScale(d.x) - mouseX;
      const dy = scales.yScale(d.y) - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = d;
      }
    });
    
    if (nearestPoint && minDistance < 50) { // 只在 50px 範圍內顯示
      const x = scales.xScale(nearestPoint.x);
      const y = scales.yScale(nearestPoint.y);

      focus.attr('cx', x).attr('cy', y);

      const textContent = crosshairConfig?.formatText 
        ? crosshairConfig.formatText(nearestPoint)
        : `X: ${nearestPoint.x.toFixed(2)}, Y: ${nearestPoint.y.toFixed(2)}`;
      
      focusText
        .text(textContent)
        .attr('x', x + 10)
        .attr('y', y - 10);
    } else {
      // 如果沒有找到近點，隱藏焦點
      focus.style('opacity', 0);
      focusText.style('opacity', 0);
    }
  }

  public getChartType(): string {
    return 'scatter';
  }

  protected setupEventListeners(): void {
    const { onDataClick, onHover, interactive } = this.props;
    
    if (!interactive) return;

    if (this.scatterGroup) {
      this.scatterGroup.selectAll('.dot')
        .on('click', onDataClick ? (event, d: any) => {
          onDataClick(d);
        } : null)
        .on('mouseover', onHover ? (event, d: any) => {
          onHover(d);
        } : null)
        .on('mouseout', onHover ? () => {
          onHover(null);
        } : null);
    }
  }

}
