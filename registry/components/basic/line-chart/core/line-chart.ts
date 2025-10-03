// @ts-nocheck
/**
 * @deprecated This file contains legacy code and is no longer actively maintained.
 *
 * All TypeScript checking has been disabled for this file.
 * Please use LineChartCore from './line-chart-core' instead.
 *
 * This file will be removed in a future version.
 */

import * as d3 from 'd3';
import { LineChartProps, ProcessedDataPoint } from './types';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale } from '../../../core/color-scheme/color-manager';
import { createChartClipPath } from '../../../core/base-chart/visual-effects';

/**
 * @deprecated This class is no longer maintained. Use LineChartCore instead.
 */
export class D3LineChart extends BaseChart<LineChartProps> {
  private processedData: ProcessedDataPoint[] = [];
  private scales: any = {};
  private colorScale: any;
  private seriesData: Record<string, ProcessedDataPoint[]> = {};
  
  // 交互功能控制器
  private brushZoomController: any = null;
  private crosshairController: any = null;
  private viewportController: any = null;

  constructor(props: LineChartProps) {
    super(props);
    console.log('🏗️ D3LineChart 構造函數被調用');
    console.log('🏗️ 交互功能 props:', {
      enableBrushZoom: props.enableBrushZoom,
      enableCrosshair: props.enableCrosshair,
      enableDropShadow: props.enableDropShadow,
      enableGlowEffect: props.enableGlowEffect
    });
  }

  protected processData(): ProcessedDataPoint[] {
    const { data, mapping, xKey, yKey, xAccessor, yAccessor, seriesKey } = this.props;
    
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
    
    this.processedData = result.data as ProcessedDataPoint[];

    // Handle series data specifically for LineChart
    if (seriesKey) {
        const groups = d3.group(this.processedData, (d: any) => d.originalData[seriesKey]);
        this.seriesData = Object.fromEntries(groups);
    } else {
        this.seriesData = { 'default': this.processedData };
    }

    return this.processedData;
  }

  protected createScales(): void {
    const { colors } = this.props; // Use this.props
    const { chartWidth, chartHeight } = this.getChartDimensions(); // Use BaseChart's method

    // Manual date conversion if x values are date strings
    const xValues = this.processedData.map((d: any) => {
      if (typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(d.x);
      }
      return d.x;
    });
    
    const xDomain = d3.extent(xValues) as [any, any];
    
    const xScale = xValues[0] instanceof Date
        ? d3.scaleTime().domain(xDomain).range([0, chartWidth]) // Use chartWidth
        : d3.scaleLinear().domain(xDomain).range([0, chartWidth]); // Use chartWidth

    const yDomain = d3.extent(this.processedData, (d: any) => d.y) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
    const yScale = d3.scaleLinear()
        .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
        .range([chartHeight, 0]); // Use chartHeight
            
    this.scales = { xScale, yScale, chartWidth, chartHeight }; // Update to chartWidth, chartHeight
            
    // Color scale (if there are multiple lines, set domain based on series key)
    this.colorScale = createColorScale({
        type: 'custom',
        colors: colors,
        domain: Object.keys(this.seriesData).map((_, i) => i), // Domain based on series keys
        interpolate: false
    });
  }

  protected renderChart(): void {
    console.log('🚨🚨🚨 NEW INTERACTIVE LINECHART VERSION LOADED 🚨🚨🚨');
    console.log('🎨 renderChart 開始執行');
    const { showGrid, gridOpacity, strokeWidth, curve, showArea, areaOpacity, showDots, dotRadius, animate, animationDuration, interactive, showTooltip } = this.props; // Use this.props
    const { xScale, yScale, chartWidth, chartHeight } = this.scales;
    
    console.log('🎨 renderChart props:', { 
      showGrid, showArea, showDots, animate, interactive,
      enableBrushZoom: this.props.enableBrushZoom,
      enableCrosshair: this.props.enableCrosshair
    });

    // Use BaseChart's method to create SVG and G elements
    const g = this.createSVGContainer();
    
    // 先渲染軸線，確保軸線在圖表內容和交互功能之前就存在
    const xAxisFormat = this.processedData[0]?.x instanceof Date ? d3.timeFormat('%m/%d') as any : undefined;
    this.renderAxes(g, { xScale, yScale }, {
      showXAxis: true,
      showYAxis: true,
      xAxisConfig: {
        format: xAxisFormat,
        fontSize: '12px',
        fontColor: '#6b7280'
      },
      yAxisConfig: {
        fontSize: '12px',
        fontColor: '#6b7280'
      }
    });
    console.log('🎯 軸線已在圖表內容之前渲染完成');
    
    if (showGrid) {
        g.append('g').attr('class', 'grid-x').selectAll('line').data((xScale as any).ticks()).enter().append('line')
            .attr('x1', (d: any) => (xScale as any)(d)).attr('x2', (d: any) => (xScale as any)(d)).attr('y1', 0).attr('y2', chartHeight) // Use chartHeight
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
        g.append('g').attr('class', 'grid-y').selectAll('line').data(yScale.ticks()).enter().append('line')
            .attr('x1', 0).attr('x2', chartWidth).attr('y1', (d: any) => yScale(d)).attr('y2', (d: any) => yScale(d)) // Use chartWidth
            .attr('stroke', '#e5e7eb').attr('stroke-opacity', gridOpacity);
    }

    const lineGenerator = d3.line<any>()
      .x((d: any, i: number) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return (xScale as any)(xVal);
      })
      .y((d: any) => yScale(d.y))
      .curve((d3 as any)[this.getCurve(curve)]);
    
    const areaGenerator = d3.area<any>()
      .x((d: any, i: number) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return (xScale as any)(xVal);
      })
      .y0(chartHeight)
      .y1((d: any) => yScale(d.y))
      .curve((d3 as any)[this.getCurve(curve)]); // Use chartHeight

    Object.entries(this.seriesData).forEach(([key, seriesPoints], index) => {
        const seriesColor = this.colorScale.getColor(index); // Use colorScale with index
        if (!seriesPoints?.length) return;

        if (showArea) {
            g.append('path').datum(seriesPoints).attr('class', `area-${key}`).attr('d', areaGenerator)
                .attr('fill', seriesColor).attr('fill-opacity', areaOpacity);
        }

        const line = g.append('path').datum(seriesPoints).attr('class', `line-${key}`).attr('d', lineGenerator)
            .attr('fill', 'none').attr('stroke', seriesColor).attr('stroke-width', strokeWidth);

        if (animate) {
            const totalLength = (line.node() as SVGPathElement).getTotalLength();
            line.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength)
                .transition().duration(animationDuration).attr('stroke-dashoffset', 0);
        }

        if (showDots) {
            const dots = g.selectAll(`.dot-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `dot-${key}`)
                .attr('cx', (d: any) => {
                  const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
                  return (xScale as any)(xVal);
                })
                .attr('cy', (d: any) => yScale(d.y))
                .attr('r', animate ? 0 : dotRadius).attr('fill', seriesColor).attr('stroke', 'white').attr('stroke-width', 2);
            if (animate) {
                dots.transition().delay((d: any, i: number) => i * 50).duration(300).attr('r', dotRadius);
            }
        }
        
        if (interactive) {
            g.selectAll(`.interact-${key}`).data(seriesPoints).enter().append('circle')
                .attr('class', `interact-${key}`)
                .attr('cx', (d: any) => {
                  const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
                  return (xScale as any)(xVal);
                })
                .attr('cy', (d: any) => yScale(d.y))
                .attr('r', Math.max(dotRadius * 2, 8)).attr('fill', 'transparent').style('cursor', 'pointer')
                .on('mouseenter', (event: any, d: any) => {
                    const [x, y] = d3.pointer(event, g.node());
                    this.createTooltip(x, y, `X: ${d.x}, Y: ${d.y}`); // Use BaseChart's createTooltip
                    this.props.onHover?.(d.originalData);
                })
                .on('mouseleave', () => {
                    this.hideTooltip(); // Use BaseChart's hideTooltip
                    this.props.onHover?.(null);
                })
                .on('click', (event: any, d: any) => {
                    this.props.onDataClick?.(d.originalData);
                });
        }
    });

    // 軸線已在前面渲染，這裡不再重複

    // === 添加交互功能 ===
    this.addInteractionFeatures(g);
  }

  /**
   * 添加交互功能
   */
  private addInteractionFeatures(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    console.log('🔧 addInteractionFeatures 開始執行');
    console.log('📊 容器選擇器:', container);
    console.log('🎯 容器節點:', container.node());
    
    // 清理舊的交互元素，避免重複創建
    console.log('🧹 清理舊的交互元素');
    container.selectAll('.brush').remove();
    container.selectAll('.crosshair').remove();
    container.selectAll('.focus').remove();
    
    // 移除所有現有的剪裁路徑，但要精確控制
    if (this.svgRef?.current) {
      const svg = d3.select(this.svgRef.current);
      // 只移除我們創建的剪裁路徑
      svg.select('defs').selectAll('clipPath[id="chart-clip"]').remove();
      
      // 只移除圖表內容元素的剪裁路徑屬性，不影響軸線
      const contentElements = container.selectAll('path[class*="line-"], path[class*="area-"], circle[class*="dot-"], circle[class*="interact-"]');
      contentElements.attr('clip-path', null);
      
      // 明確確保軸線永遠不會有剪裁路徑（預防性措施）
      const axisElements = container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
      axisElements.attr('clip-path', null);
      console.log('🧹 預防性清除軸線剪裁路徑，找到軸線:', axisElements.size(), '個');
      
      console.log('🧹 精確清理了剪裁路徑，保護軸線元素');
    }
    
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

    console.log('⚙️ 交互功能配置:', { 
      enableBrushZoom, 
      enableCrosshair, 
      enableDropShadow, 
      enableGlowEffect,
      brushZoomConfig,
      crosshairConfig
    });

    const { xScale, yScale, chartWidth, chartHeight } = this.scales;
    console.log('📏 比例尺和尺寸:', { chartWidth, chartHeight });
    console.log('📐 xScale domain:', xScale.domain());
    console.log('📐 yScale domain:', yScale.domain());

    // 應用視覺效果
    if (enableDropShadow && this.svgRef?.current) {
      console.log('🌑 開始應用陰影效果');
      const svg = d3.select(this.svgRef.current);
      const lineElements = container.selectAll('path[class*="line-"]');
      console.log('🌑 找到線條元素數量:', lineElements.size());
      console.log('🌑 線條元素:', lineElements.nodes());
      this.addDropShadow(svg, lineElements);
      console.log('🌑 陰影效果應用完成');
    }

    if (enableGlowEffect && this.svgRef?.current) {
      console.log('✨ 開始應用光暈效果, 顏色:', glowColor);
      const svg = d3.select(this.svgRef.current);
      const lineElements = container.selectAll('path[class*="line-"]');
      console.log('✨ 找到線條元素數量:', lineElements.size());
      console.log('✨ 線條元素:', lineElements.nodes());
      this.addGlowEffect(svg, lineElements, glowColor);
      console.log('✨ 光暈效果應用完成');
    }

    // === 默認剪裁路徑：防止圖表內容溢出軸線區域 ===
    // 總是創建剪裁路徑來防止任何圖表內容溢出，這是最佳實踐
    let clipPathId = null;
    if (this.svgRef?.current) {
      console.log('✂️ 創建默認剪裁路徑，防止圖表內容溢出軸線區域');
      const svg = d3.select(this.svgRef.current);
      
      const { chartWidth, chartHeight } = this.getChartDimensions();
      clipPathId = createChartClipPath(svg, { width: chartWidth, height: chartHeight });
      console.log('✂️ 默認剪裁路徑創建完成:', clipPathId);
      
      // 將剪裁路徑應用到所有圖表內容元素，保護軸線
      const lineElements = container.selectAll('path[class*="line-"]');
      const areaElements = container.selectAll('path[class*="area-"]');
      const dotElements = container.selectAll('circle[class*="dot-"]');
      
      console.log('✂️ 應用默認剪裁路徑 - 線條:', lineElements.size(), '區域:', areaElements.size(), '點:', dotElements.size());
      
      lineElements.attr('clip-path', clipPathId);
      areaElements.attr('clip-path', clipPathId);
      dotElements.attr('clip-path', clipPathId);
      
      // 確保軸線永遠不被剪裁
      const axisElements = container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
      axisElements.attr('clip-path', null);
      console.log('✂️ 軸線保護完成，保護了', axisElements.size(), '個軸線元素');
    }

    // 筆刷縮放功能 - 參考 line_zoom.js 的實現
    if (enableBrushZoom) {
      console.log('🖱️ 開始創建筆刷縮放功能');
      console.log('🖱️ brushZoomConfig:', brushZoomConfig);
      
      // 創建筆刷
      console.log('🖌️ 創建筆刷，範圍:', [[0, 0], [chartWidth, chartHeight]]);
      const brush = d3.brushX()
        .extent([[0, 0], [chartWidth, chartHeight]])
        .on('end', (event) => {
          console.log('🖌️ 筆刷事件觸發:', event);
          console.log('🖌️ 筆刷選擇範圍:', event.selection);
          this.handleBrushEnd(event, { xScale, yScale }, onZoom, onZoomReset);
        });

      // 將筆刷添加到主容器
      console.log('🖌️ 將筆刷添加到主容器');
      const brushGroup = container.append('g')
        .attr('class', 'brush')
        .call(brush);

      console.log('🖌️ 筆刷組創建完成:', brushGroup);
      console.log('🖌️ 筆刷組節點:', brushGroup.node());

      // 雙擊重置功能
      if (brushZoomConfig?.resetOnDoubleClick !== false) {
        console.log('🔄 設置雙擊重置功能');
        container.on('dblclick', () => {
          console.log('🔄 雙擊重置觸發');
          this.resetZoom({ xScale, yScale }, onZoomReset);
        });
      }
      
      console.log('🖱️ 筆刷縮放功能創建完成');
    }

    // 十字游標功能 - 參考 line_cursor.js 的實現
    if (enableCrosshair) {
      console.log('🎯 開始創建十字游標功能');
      console.log('🎯 crosshairConfig:', crosshairConfig);
      
      // 創建焦點圓圈
      console.log('⭕ 創建焦點圓圈');
      const focus = container.append('g')
        .append('circle')
        .style('fill', 'none')
        .attr('stroke', 'black')
        .attr('r', crosshairConfig?.circleRadius || 4)
        .style('opacity', 0);

      console.log('⭕ 焦點圓圈創建完成:', focus);
      console.log('⭕ 焦點圓圈節點:', focus.node());

      // 創建焦點文字
      console.log('📝 創建焦點文字');
      const focusText = container.append('g')
        .append('text')
        .style('opacity', 0)
        .attr('text-anchor', 'left')
        .attr('alignment-baseline', 'middle');

      console.log('📝 焦點文字創建完成:', focusText);
      console.log('📝 焦點文字節點:', focusText.node());

      // 創建交互矩形
      console.log('🔲 創建交互矩形，尺寸:', chartWidth, 'x', chartHeight);
      const interactionRect = container.append('rect')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .on('mouseover', () => {
          console.log('🎯 鼠標進入交互區域');
          focus.style('opacity', 1);
          focusText.style('opacity', 1);
        })
        .on('mousemove', (event) => {
          console.log('🎯 鼠標移動:', event);
          this.handleCrosshairMove(event, container, focus, focusText, { xScale, yScale }, crosshairConfig);
        })
        .on('mouseout', () => {
          console.log('🎯 鼠標離開交互區域');
          focus.style('opacity', 0);
          focusText.style('opacity', 0);
        });

      console.log('🔲 交互矩形創建完成:', interactionRect);
      console.log('🔲 交互矩形節點:', interactionRect.node());
      console.log('🎯 十字游標功能創建完成');
    }

    // 獨立的剪裁路徑功能已移除 - 剪裁路徑現在只作為筆刷縮放的內建功能
    
    // === 最終軸線保護：無論啟用什麼功能，都要確保軸線不被剪裁 ===
    console.log('🛡️ 執行最終軸線保護');
    const finalAxisProtection = container.selectAll('.bottom-axis, .left-axis, .top-axis, .right-axis, .x-axis, .y-axis, g[class*="axis"]');
    finalAxisProtection.attr('clip-path', null);
    console.log('🛡️ 最終軸線保護完成，保護了', finalAxisProtection.size(), '個軸線元素');
    
    console.log('🔧 addInteractionFeatures 執行完成');
  }

  /**
   * 處理筆刷結束事件 - 基於 line_zoom.js
   */
  private handleBrushEnd(
    event: any, 
    scales: { xScale: any; yScale: any }, 
    onZoom?: (domain: [any, any]) => void,
    onZoomReset?: () => void
  ): void {
    console.log('🖌️ handleBrushEnd 開始處理');
    console.log('🖌️ event:', event);
    const selection = event.selection;
    console.log('🖌️ selection:', selection);
    
    if (!selection) {
      console.log('🖌️ 沒有選擇區域');
      // 沒有選擇區域 - 可能是要重置
      if (!this.idleTimeoutId) {
        console.log('🖌️ 設置閒置超時');
        this.idleTimeoutId = window.setTimeout(() => {
          this.idleTimeoutId = null;
        }, 350);
        return;
      }
      console.log('🖌️ 執行重置縮放');
      // 重置縮放
      this.resetZoom(scales, onZoomReset);
    } else {
      console.log('🖌️ 有選擇區域，進行縮放');
      // 有選擇區域 - 進行縮放
      const [x0, x1] = selection;
      console.log('🖌️ 選擇範圍:', x0, 'to', x1);
      const newDomain: [any, any] = [scales.xScale.invert(x0), scales.xScale.invert(x1)];
      
      console.log('🖌️ 縮放到新域值:', newDomain);
      
      // 更新比例尺
      scales.xScale.domain(newDomain);
      console.log('🖌️ 比例尺域值已更新');
      
      // 重新渲染圖表內容
      console.log('🖌️ 開始更新圖表');
      this.updateChartAfterZoom(scales);
      console.log('🖌️ 圖表更新完成');
      
      // 清除筆刷選擇
      console.log('🖌️ 清除筆刷選擇');
      const container = d3.select(this.svgRef?.current).select('g');
      container.select('.brush').call(d3.brushX().move, null);
      
      // 觸發用戶回調
      if (onZoom) {
        console.log('🖌️ 觸發用戶縮放回調');
        onZoom(newDomain);
      }
    }
    console.log('🖌️ handleBrushEnd 處理完成');
  }

  /**
   * 重置縮放 - 基於 line_zoom.js
   */
  private resetZoom(scales: { xScale: any; yScale: any }, onZoomReset?: () => void): void {
    // 重置到原始域
    const originalXDomain = d3.extent(this.processedData, (d: any) => {
      const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
      return xVal;
    }) as [any, any];
    
    scales.xScale.domain(originalXDomain);
    
    console.log('重置到原始域值:', originalXDomain);
    
    // 重新渲染
    this.updateChartAfterZoom(scales);
    
    // 觸發用戶回調
    if (onZoomReset) {
      onZoomReset();
    }
  }

  /**
   * 縮放後更新圖表
   */
  private updateChartAfterZoom(scales: { xScale: any; yScale: any }): void {
    if (!this.svgRef?.current) return;

    const svg = d3.select(this.svgRef.current);
    const container = svg.select('g');
    
    // 更新軸線 - 查找由 BaseChart 的 renderAxes 方法創建的軸線
    const xAxisFormat = this.processedData[0]?.x instanceof Date ? d3.timeFormat('%m/%d') as any : undefined;
    
    // 嘗試多種可能的軸線選擇器，按優先級順序
    let xAxisGroup = container.select('.bottom-axis'); // BaseChart renderAxis 創建的類名
    if (xAxisGroup.empty()) {
      xAxisGroup = container.select('g[data-axis="x"]');
    }
    if (xAxisGroup.empty()) {
      xAxisGroup = container.select('.x-axis');
    }
    if (xAxisGroup.empty()) {
      // 查找包含 axisBottom 調用的 g 元素，使用更精確的條件
      xAxisGroup = container.selectAll('g').filter(function() {
        const element = d3.select(this);
        const hasAxisElements = element.selectAll('.domain').size() > 0 && element.selectAll('.tick').size() > 0;
        const transform = element.attr('transform');
        const isBottomAxis = transform && transform.includes(`translate(0,${scales.yScale.range()[0]})`);
        return hasAxisElements && isBottomAxis;
      });
    }
    
    if (!xAxisGroup.empty()) {
      console.log('🔄 找到 X 軸組，開始更新');
      xAxisGroup
        .transition()
        .duration(1000)
        .call(d3.axisBottom(scales.xScale).tickFormat(xAxisFormat));
      console.log('🔄 X 軸更新完成');
    } else {
      console.warn('❌ 無法找到 X 軸組進行更新，將重新創建軸線');
      // 如果找不到現有軸線，重新使用 BaseChart 的 renderAxes 方法
      this.renderAxes(container, { xScale: scales.xScale, yScale: scales.yScale }, {
        showXAxis: true,
        showYAxis: true,
        xAxisConfig: {
          format: xAxisFormat,
          fontSize: '12px',
          fontColor: '#6b7280'
        },
        yAxisConfig: {
          fontSize: '12px',
          fontColor: '#6b7280'
        }
      });
    }
    
    // 更新線條和相關元素
    const lineGenerator = d3.line<any>()
      .x((d: any) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return scales.xScale(xVal);
      })
      .y((d: any) => scales.yScale(d.y))
      .curve((d3 as any)[this.getCurve(this.props.curve || 'linear')]);

    const areaGenerator = d3.area<any>()
      .x((d: any) => {
        const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
        return scales.xScale(xVal);
      })
      .y0(this.scales.chartHeight)
      .y1((d: any) => scales.yScale(d.y))
      .curve((d3 as any)[this.getCurve(this.props.curve || 'linear')]);

    Object.entries(this.seriesData).forEach(([key, seriesPoints]) => {
      // 更新線條
      const lineElement = container.select(`.line-${key}`)
        .transition()
        .duration(1000)
        .attr('d', lineGenerator(seriesPoints));
        
      // 更新區域 (如果存在)
      const areaElement = container.select(`.area-${key}`);
      if (!areaElement.empty()) {
        areaElement
          .transition()
          .duration(1000)
          .attr('d', areaGenerator(seriesPoints));
      }
      
      // 如果啟用了筆刷縮放，確保剪裁路徑仍然應用到圖表內容元素
      if (this.props.enableBrushZoom) {
        const clipPathId = 'url(#chart-clip)';
        container.select(`.line-${key}`).attr('clip-path', clipPathId);
        if (!areaElement.empty()) {
          areaElement.attr('clip-path', clipPathId);
        }
      }
      
      // 獨立剪裁路徑功能已移除
        
      // 更新點 (如果存在)
      const dots = container.selectAll(`.dot-${key}`);
      if (!dots.empty()) {
        dots
          .transition()
          .duration(1000)
          .attr('cx', (d: any) => {
            const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
            return scales.xScale(xVal);
          })
          .attr('cy', (d: any) => scales.yScale(d.y));
          
        // 確保點元素也有剪裁路徑（僅當筆刷縮放啟用時）
        if (this.props.enableBrushZoom) {
          const clipPathId = 'url(#chart-clip)';
          dots.attr('clip-path', clipPathId);
        }
      }
        
      // 更新交互圓圈 (如果存在)
      const interactDots = container.selectAll(`.interact-${key}`);
      if (!interactDots.empty()) {
        interactDots
          .transition()
          .duration(1000)
          .attr('cx', (d: any) => {
            const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
            return scales.xScale(xVal);
          })
          .attr('cy', (d: any) => scales.yScale(d.y));
          
        // 確保交互元素也有剪裁路徑
        if (this.props.enableBrushZoom) {
          const clipPathId = 'url(#chart-clip)';
          interactDots.attr('clip-path', clipPathId);
        }
      }
    });
  }

  /**
   * 處理十字游標移動 - 基於 line_cursor.js
   */
  private handleCrosshairMove(
    event: MouseEvent,
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    focus: d3.Selection<SVGCircleElement, unknown, null, undefined>,
    focusText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    scales: { xScale: any; yScale: any },
    config?: any
  ): void {
    // console.log('🎯 handleCrosshairMove 開始處理');
    
    // 獲取鼠標位置
    const [mouseX] = d3.pointer(event, container.node());
    // console.log('🎯 鼠標位置:', mouseX);
    
    // 反轉獲取 X 值
    const x0 = scales.xScale.invert(mouseX);
    // console.log('🎯 反轉得到 X 值:', x0);
    
    // 創建 bisector 查找最近的數據點
    const bisect = d3.bisector((d: any) => {
      const xVal = typeof d.x === 'string' && d.x.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(d.x) : d.x;
      return xVal;
    }).left;
    
    const i = bisect(this.processedData, x0, 1);
    const selectedData = this.processedData[i];
    // console.log('🎯 找到數據點:', selectedData);
    
    if (selectedData) {
      const xVal = typeof selectedData.x === 'string' && selectedData.x.match(/^\d{4}-\d{2}-\d{2}$/) 
        ? new Date(selectedData.x) : selectedData.x;
      const x = scales.xScale(xVal);
      const y = scales.yScale(selectedData.y);
      
      // console.log('🎯 計算位置:', x, y);
      
      // 更新焦點圓圈位置
      focus
        .attr('cx', x)
        .attr('cy', y);
      
      // 更新文字位置和內容
      const formatText = config?.formatText || ((data: any) => `X: ${data.x}, Y: ${data.y}`);
      focusText
        .html(formatText(selectedData))
        .attr('x', x + 15)
        .attr('y', y);
    }
  }

  private idleTimeoutId: number | null = null;


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
  public update(newProps: LineChartProps): void {
    // 清理舊的交互控制器
    this.cleanupInteractionControllers();
    
    // 調用父類的 update 方法
    super.update(newProps);
  }

  protected getChartType(): string {
    return 'line';
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
