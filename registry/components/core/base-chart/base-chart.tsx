import React, { ReactNode, useMemo, useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { ResponsiveChartContainer } from '../../primitives/canvas/responsive-chart-container'
import { renderAxis, renderGrid, renderLegend, renderArcLabels, renderBarLabels, renderPointLabels, AxisConfig, GridConfig, LegendConfig, LabelConfig, BarLabelConfig, PointLabelConfig } from './chart-utils'
import { 
  BrushZoomController, 
  CrosshairController, 
  ViewportController,
  BrushZoomConfig, 
  CrosshairConfig,
  createBrushZoom,
  createCrosshair,
  createViewportController
} from './interaction-utils'
import { createChartClipPath, createStandardDropShadow, createStandardGlow } from './visual-effects'
import { 
  GroupDataProcessor, 
  GroupProcessorResult, 
  GroupConfig,
  createGroupHighlightManager,
  createGroupFilterManager,
  createGroupLegend,
  GroupHighlightManager,
  GroupFilterManager
} from './chart-group-utils'
import { 
  createInteractionComposer, 
  createTransitionManager,
  InteractionComposer,
  TransitionManager,
  AnimationConfig
} from './interaction-animation-utils'

// 匯入 tooltip 相關類型和組件
import type { TooltipFormatter, TooltipData } from '../../ui/chart-tooltip/types'
import { ChartTooltip } from '../../ui/chart-tooltip/chart-tooltip'

// Tooltip 配置介面
export interface TooltipConfig {
  enabled?: boolean                          // 基本開關
  mode?: 'auto' | 'always' | 'disabled'     // 顯示策略
  theme?: 'light' | 'dark' | 'auto'         // 主題
  performanceThreshold?: number             // 大數據集禁用閾值
  disableOnLargeDataset?: boolean          // 是否在大數據集時自動禁用
  throttleMs?: number                      // 節流延遲 (ms)
  format?: TooltipFormatter                // 自定義格式化函數
  hideDelay?: number                       // 隱藏延遲
  showDelay?: number                       // 顯示延遲
}

// 預設配置常數
const DEFAULT_CHART_CONFIG = {
  responsive: true,        // 🎯 響應式優先
  aspect: 4/3,            // 標準寬高比 (4:3 更適合大多數圖表)
  minWidth: 300,          // 最小寬度
  maxWidth: 1200,         // 最大寬度  
  minHeight: 200,         // 最小高度
  maxHeight: 800,         // 最大高度
  fallbackWidth: 600,     // 後備寬度
  fallbackHeight: 450,    // 後備高度 (維持 4:3 比例)
  animate: true,          // 預設動畫
  animationDuration: 800, // 動畫時長
  showTooltip: true,      // 預設工具提示
  tooltip: {              // 預設 tooltip 配置
    enabled: true,
    mode: 'auto' as const,
    theme: 'dark' as const,
    performanceThreshold: 50000,
    disableOnLargeDataset: true
  }
}

export interface BaseChartProps {
  data: any[]
  
  // 🎯 響應式優先設計
  responsive?: boolean     // 預設 true
  aspect?: number         // 預設 16/9
  minWidth?: number       // 預設 300
  maxWidth?: number       // 預設 1200  
  minHeight?: number      // 預設 200
  maxHeight?: number      // 預設 800
  
  // 🔄 固定尺寸支援（當設定時自動 responsive: false）
  width?: number
  height?: number
  
  // 🛡️ 後備保護（內部使用）
  fallbackWidth?: number   // 預設 600
  fallbackHeight?: number  // 預設 400
  
  // 其他基礎屬性
  margin?: { top: number; right: number; bottom: number; left: number }
  className?: string
  style?: React.CSSProperties
  animate?: boolean        // 預設 true
  animationDuration?: number // 預設 800
  
  // 🎯 統一 Tooltip 配置
  showTooltip?: boolean    // 預設 true (向下兼容)
  tooltip?: TooltipConfig  // 新的統一配置介面
  tooltipFormatter?: TooltipFormatter // 便利的格式化函數 (向下兼容)
  onDataHover?: (data: any, event?: Event) => void // 標準事件處理器
  onDataClick?: (data: any, event?: Event) => void // 標準事件處理器
  
  onError?: (error: Error) => void
  
  // 調試用（開發階段）
  containerWidth?: number  // For debugging purposes
  
  // Group functionality props
  groupBy?: string
  groupColors?: string[]
  enableGroupHighlight?: boolean
  enableGroupFilter?: boolean
  showGroupLegend?: boolean
  groupLegendPosition?: { x: number; y: number }
  onGroupSelect?: (group: string, isSelected: boolean) => void
  onGroupHover?: (group: string | null) => void
}

export interface BaseChartState {
  tooltip: {
    x: number
    y: number
    content: ReactNode
    visible: boolean
    data?: any  // 添加數據引用
  } | null
  isLoading: boolean
  error: Error | null
}

export abstract class BaseChart<TProps extends BaseChartProps = BaseChartProps> {
  protected svgRef: React.RefObject<SVGSVGElement> | null = null;
  protected containerRef: React.RefObject<HTMLDivElement> | null = null;
  protected props: TProps
  protected state: BaseChartState
  
  // Group functionality managers
  protected groupProcessor?: GroupDataProcessor
  protected groupHighlightManager?: GroupHighlightManager
  protected groupFilterManager?: GroupFilterManager
  protected interactionComposer?: InteractionComposer
  protected transitionManager?: TransitionManager
  
  // 🎯 統一 Tooltip 管理
  protected tooltipConfig: TooltipConfig
  protected shouldShowTooltip: boolean = true
  
  // 🎯 React tooltip setter 由 createChartComponent 注入
  public reactTooltipSetter: ((tooltip: BaseChartState['tooltip']) => void) | null = null

  constructor(props: TProps) {
    this.props = props
    this.state = {
      tooltip: null,
      isLoading: false,
      error: null
    }
    
    // 🎯 初始化 tooltip 配置
    this.initializeTooltipConfig()
    
    // Initialize group functionality if enabled
    this.initializeGroupManagers()
  }

  // 抽象方法，子類必須實現
  protected abstract processData(): any
  protected abstract createScales(): any
  protected abstract renderChart(): void
  protected abstract getChartType(): string

  // 🎯 初始化 tooltip 配置和狀態
  protected initializeTooltipConfig(): void {
    const { showTooltip = true, tooltip = {}, data } = this.props
    
    // 合併配置，優先使用新的 tooltip 配置，向下兼容 showTooltip
    this.tooltipConfig = {
      ...DEFAULT_CHART_CONFIG.tooltip,
      ...tooltip,
      enabled: tooltip.enabled !== undefined ? tooltip.enabled : showTooltip
    }
    
    // 智慧決策：根據數據量決定是否顯示 tooltip
    const dataSize = data?.length || 0
    const shouldAutoDisable = this.tooltipConfig.disableOnLargeDataset && 
                             dataSize > (this.tooltipConfig.performanceThreshold || 50000)
    
    if (shouldAutoDisable && this.tooltipConfig.mode === 'auto') {
      this.shouldShowTooltip = false
    } else if (this.tooltipConfig.mode === 'disabled') {
      this.shouldShowTooltip = false
    } else {
      this.shouldShowTooltip = this.tooltipConfig.enabled !== false
    }
  }

  // Initialize group managers based on props
  protected initializeGroupManagers(): void {
    const { groupBy, groupColors, enableGroupHighlight, enableGroupFilter, animationDuration = 200 } = this.props
    
    if (groupBy) {
      this.groupProcessor = new GroupDataProcessor({
        groupKey: groupBy,
        colorScheme: groupColors
      })
    }
    
    if (enableGroupHighlight || enableGroupFilter) {
      this.transitionManager = createTransitionManager({
        duration: animationDuration
      })
      
      this.interactionComposer = createInteractionComposer(
        {
          groupSelector: '[data-group]',
          onHover: this.props.onGroupHover
        },
        {
          multiSelect: true,
          onSelect: this.props.onGroupSelect
        },
        {
          duration: animationDuration
        }
      )
    }
  }

  // New method to update props and trigger re-render cycle
  public update(newProps: TProps) {
    console.log('🚨🚨🚨 BASECHART UPDATE CALLED!!! 🚨🚨🚨');
    this.props = newProps; // Update internal props
    this.initializeTooltipConfig(); // Re-initialize tooltip config
    this.initializeGroupManagers(); // Re-initialize group managers with new props
    
    console.log('🚨 svgRef.current exists:', !!this.svgRef?.current);
    if (this.svgRef?.current) { // Only proceed if SVG is ready
      try {
        console.log('🚨 About to call processData, createScales, renderChart...');
        this.processData();
        this.createScales();
        this.renderChart();
        console.log('🚨 processData, createScales, renderChart completed');
      } catch (error) {
        console.error('🚨 Error in update:', error);
        this.handleError(error as Error);
      }
    }
  }

  // 🎯 智能尺寸檢測方法（響應式優先）
  protected getChartDimensions() {
    const { 
      width, 
      height,
      responsive = DEFAULT_CHART_CONFIG.responsive,
      aspect = DEFAULT_CHART_CONFIG.aspect,
      minWidth = DEFAULT_CHART_CONFIG.minWidth,
      maxWidth = DEFAULT_CHART_CONFIG.maxWidth,
      minHeight = DEFAULT_CHART_CONFIG.minHeight,
      maxHeight = DEFAULT_CHART_CONFIG.maxHeight,
      fallbackWidth = DEFAULT_CHART_CONFIG.fallbackWidth,
      fallbackHeight = DEFAULT_CHART_CONFIG.fallbackHeight,
      margin = { top: 20, right: 30, bottom: 40, left: 40 }
    } = this.props
    
    let finalWidth: number
    let finalHeight: number
    let mode: 'fixed' | 'responsive' | 'fallback'
    
    // 1. 🔄 固定尺寸模式：如果明確指定 width 和 height
    if (width !== undefined && height !== undefined) {
      finalWidth = width
      finalHeight = height  
      mode = 'fixed'
    }
    // 2. 🎯 響應式模式：預設行為或明確啟用
    else if (responsive !== false) {
      // 這裡應該從 ResponsiveChartContainer 獲取尺寸
      // 目前使用後備值，之後會在 createChartComponent 中處理
      finalWidth = fallbackWidth
      finalHeight = finalWidth / aspect
      
      // 應用約束條件
      finalWidth = Math.max(minWidth, Math.min(maxWidth, finalWidth))
      finalHeight = Math.max(minHeight, Math.min(maxHeight, finalHeight))
      
      mode = 'responsive'
    }
    // 3. 🛡️ 後備模式：響應式被禁用且沒有指定尺寸
    else {
      finalWidth = fallbackWidth
      finalHeight = fallbackHeight
      mode = 'fallback'
    }
    
    
    return {
      width: finalWidth,
      height: finalHeight,
      margin,
      chartWidth: finalWidth - margin.left - margin.right,
      chartHeight: finalHeight - margin.top - margin.bottom,
      mode // 調試用
    }
  }

  // 統一軸線渲染方法
  protected renderAxes(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: any,
    config: {
      showXAxis?: boolean;
      showYAxis?: boolean;
      xAxisConfig?: Partial<AxisConfig>;
      yAxisConfig?: Partial<AxisConfig>;
      showXGrid?: boolean;
      showYGrid?: boolean;
      xGridConfig?: Partial<GridConfig>;
      yGridConfig?: Partial<GridConfig>;
    } = {}
  ): void {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const { xScale, yScale } = scales;

    // 渲染 X 軸
    if (config.showXAxis !== false && xScale) {
      const xAxisConfig: AxisConfig = {
        scale: xScale,
        orientation: 'bottom',
        show: true,
        ...config.xAxisConfig
      };
      renderAxis(container, xAxisConfig, { width: chartWidth, height: chartHeight });
    }

    // 渲染 Y 軸
    if (config.showYAxis !== false && yScale) {
      const yAxisConfig: AxisConfig = {
        scale: yScale,
        orientation: 'left',
        show: true,
        ...config.yAxisConfig
      };
      renderAxis(container, yAxisConfig, { width: chartWidth, height: chartHeight });
    }

    // 渲染 X 網格線
    if (config.showXGrid && xScale) {
      const xGridConfig: GridConfig = {
        scale: xScale,
        orientation: 'vertical',
        show: true,
        ...config.xGridConfig
      };
      renderGrid(container, xGridConfig, { width: chartWidth, height: chartHeight });
    }

    // 渲染 Y 網格線
    if (config.showYGrid && yScale) {
      const yGridConfig: GridConfig = {
        scale: yScale,
        orientation: 'horizontal',
        show: true,
        ...config.yGridConfig
      };
      renderGrid(container, yGridConfig, { width: chartWidth, height: chartHeight });
    }
  }

  // 統一圖例渲染方法
  protected renderLegend(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: Array<{ label: string; color: string; value?: number }>,
    config: LegendConfig = {}
  ): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    return renderLegend(container, data, config, { width: chartWidth, height: chartHeight });
  }

  // 統一標籤渲染方法
  protected renderArcLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    arcs: any[],
    config: LabelConfig,
    arcGenerator: d3.Arc<any, any>
  ): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    return renderArcLabels(container, arcs, config, arcGenerator);
  }

  protected renderBarLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: any[],
    config: BarLabelConfig,
    scales: { xScale: any; yScale: any },
    orientation: 'vertical' | 'horizontal' = 'vertical'
  ): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    return renderBarLabels(container, data, config, scales, orientation);
  }

  protected renderPointLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: any[],
    config: PointLabelConfig,
    scales: { xScale: any; yScale: any }
  ): d3.Selection<SVGGElement, unknown, null, undefined> | null {
    return renderPointLabels(container, data, config, scales);
  }

  protected validateData(): boolean {
    const { data } = this.props
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.setState({ error: new Error('Invalid or empty data provided') })
      return false
    }
    return true
  }

  protected createSVGContainer(): d3.Selection<SVGGElement, unknown, null, undefined> {
    if (!this.svgRef.current) {
      throw new Error('SVG ref is not available')
    }

    const { margin } = this.getChartDimensions()
    const svg = d3.select(this.svgRef.current)
    
    // 清除現有內容
    svg.selectAll('*').remove()
    
    // 創建主要群組
    return svg
      .append('g')
      .attr('class', `${this.getChartType()}-chart`)
      .attr('transform', `translate(${margin.left},${margin.top})`)
  }

  protected createTooltip(x: number, y: number, content: ReactNode) {
    // 統一檢查：確保與新系統行為一致
    if (!this.shouldShowTooltip) return
    
    // 🎯 將相對於圖表群組的座標轉換為頁面絕對座標
    // 確保與 showTooltip 使用相同的座標系統
    let pageX = x;
    let pageY = y;
    
    if (this.svgRef && this.svgRef.current) {
      const svgRect = this.svgRef.current.getBoundingClientRect();
      const { margin } = this.getChartDimensions();
      
      // 轉換：圖表群組座標 → 頁面絕對座標
      pageX = svgRect.left + margin.left + x;
      pageY = svgRect.top + margin.top + y;
    }
    
    this.setState({
      tooltip: {
        x: pageX,
        y: pageY,
        content,
        visible: true
      }
    })
  }


  protected setState(newState: Partial<BaseChartState>) {
    this.state = { ...this.state, ...newState }
    // 觸發 React 重新渲染的機制將由 createChartComponent 處理
  }

  // 🎯 統一 Tooltip 事件處理方法
  
  /**
   * 顯示 tooltip
   */
  protected showTooltip(event: MouseEvent | Event, data: any): void {
    console.log('🚨🚨🚨 SHOWTOOLTIP CALLED!!! 🚨🚨🚨');
    
    if (!this.shouldShowTooltip) {
      return;
    }
    
    const position = this.getTooltipPosition(event)
    const content = this.formatTooltipContent(data)
    
    // 🎯 更新除錯座標顯示
    this.debugCoordinates = { x: position.x, y: position.y }
    
    const tooltipState = {
      x: position.x,
      y: position.y,
      content,
      visible: true
    }
    
    console.log('🎯 Final tooltip position set to:', { x: position.x, y: position.y });
    console.log('🎯 Tooltip state:', tooltipState);
    
    // 🎯 直接使用 React state
    if (this.reactTooltipSetter) {
      this.reactTooltipSetter(tooltipState);
    } else {
      // 回退到舊系統
      this.setState({ tooltip: tooltipState });
    }
    
    // 調用用戶自定義處理器
    this.props.onDataHover?.(data, event)
  }
  
  /**
   * 隱藏 tooltip
   */
  protected hideTooltip(): void {
    // 🎯 清除除錯座標顯示
    this.debugCoordinates = null
    
    // 🎯 直接使用 React state
    if (this.reactTooltipSetter) {
      this.reactTooltipSetter(null);
    } else {
      // 回退到舊系統
      this.setState({
        tooltip: this.state.tooltip ? { ...this.state.tooltip, visible: false } : null
      });
    }
    
    // 調用用戶自定義處理器
    this.props.onDataHover?.(null)
  }
  
  /**
   * 處理數據點擊事件
   */
  protected handleDataClick(event: MouseEvent | Event, data: any): void {
    this.props.onDataClick?.(data, event)
  }
  
  /**
   * 🎯 座標除錯狀態管理
   */
  private debugCoordinates: { x: number; y: number } | null = null
  
  /**
   * 是否顯示座標除錯資訊
   */
  private shouldShowCoordinateDebug(): boolean {
    // 可以通過環境變數或 props 控制
    return typeof window !== 'undefined' && !!this.debugCoordinates
  }
  
  /**
   * 渲染實時座標除錯顯示
   */
  private renderCoordinateDebug(): ReactNode {
    if (!this.debugCoordinates) return null
    
    const { x, y } = this.debugCoordinates
    
    return (
      <div 
        className="fixed z-[9999] pointer-events-none bg-black/80 text-white text-xs px-2 py-1 rounded font-mono"
        style={{
          left: x + 15,
          top: y - 40,
          fontSize: '10px',
          lineHeight: '1.2'
        }}
      >
        <div>🎯 Mouse: ({x}, {y})</div>
        <div>📍 Scroll: ({window.scrollX}, {window.scrollY})</div>
        <div>📐 Viewport: {window.innerWidth}×{window.innerHeight}</div>
      </div>
    )
  }
  
  /**
   * 從事件中獲取 tooltip 位置
   */
  private getTooltipPosition(event: Event): { x: number; y: number } {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    console.log('🔍 getTooltipPosition event type:', event.constructor.name);
    
    let coordinates: any = {};
    let finalPosition = { x: 0, y: 0 };
    
    if (event instanceof MouseEvent) {
      coordinates = {
        client: { x: event.clientX, y: event.clientY },
        page: { x: event.pageX, y: event.pageY },
        offset: { x: event.offsetX, y: event.offsetY },
        screen: { x: event.screenX, y: event.screenY }
      };
      finalPosition = { x: event.clientX, y: event.clientY };
    } else {
      // 處理 D3 事件（非標準 MouseEvent）
      const d3Event = event as any;
      if (d3Event.clientX !== undefined && d3Event.clientY !== undefined) {
        coordinates = {
          client: { x: d3Event.clientX, y: d3Event.clientY },
          page: { x: d3Event.pageX || 0, y: d3Event.pageY || 0 },
          offset: { x: d3Event.offsetX || 0, y: d3Event.offsetY || 0 },
          screen: { x: d3Event.screenX || 0, y: d3Event.screenY || 0 }
        };
        finalPosition = { x: d3Event.clientX, y: d3Event.clientY };
      }
    }
    
    // 🎯 完整座標系統分析
    const windowInfo = {
      scroll: { x: scrollX, y: scrollY },
      viewport: { width: viewportWidth, height: viewportHeight },
      document: { 
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth
      }
    };
    
    // 計算座標系統間的關係和一致性驗證
    const calculatedPageFromClient = {
      x: (coordinates.client?.x || 0) + scrollX,
      y: (coordinates.client?.y || 0) + scrollY
    };
    
    const coordinateDiff = {
      pageVsCalculated: {
        x: (coordinates.page?.x || 0) - calculatedPageFromClient.x,
        y: (coordinates.page?.y || 0) - calculatedPageFromClient.y
      },
      clientVsOffset: {
        x: (coordinates.client?.x || 0) - (coordinates.offset?.x || 0),
        y: (coordinates.client?.y || 0) - (coordinates.offset?.y || 0)
      }
    };
    
    // 檢查座標系統一致性
    const isPageConsistent = Math.abs(coordinateDiff.pageVsCalculated.x) < 2 && Math.abs(coordinateDiff.pageVsCalculated.y) < 2;
    
    console.log('📊 ===== 座標系統完整對比分析 =====');
    console.log('  🖱️ 各種滑鼠座標:', coordinates);
    console.log('  🌍 視窗與文檔資訊:', windowInfo);
    console.log('  🧮 座標一致性驗證:');
    console.log('    - client + scroll =', calculatedPageFromClient);
    console.log('    - page 實際值 =', coordinates.page);
    console.log('  📏 座標差異分析:', coordinateDiff);
    console.log('  ✅ 座標系統一致性:', { 
      isPageConsistent,
      pageDiff: coordinateDiff.pageVsCalculated,
      maxDiff: Math.max(
        Math.abs(coordinateDiff.pageVsCalculated.x), 
        Math.abs(coordinateDiff.pageVsCalculated.y)
      )
    });
    console.log('🎯 最終使用座標 (client):', finalPosition);
    console.log('==================================');
    
    return finalPosition;
  }
  
  /**
   * 格式化 tooltip 內容
   */
  private formatTooltipContent(data: any): ReactNode {
    const { tooltipFormatter, tooltip } = this.props
    
    // 優先使用 props 中的格式化函數
    if (tooltipFormatter) {
      return tooltipFormatter({ data, series: this.getChartType() })
    }
    
    // 使用 tooltip 配置中的格式化函數
    if (tooltip?.format) {
      return tooltip.format({ data, series: this.getChartType() })
    }
    
    // 預設格式化
    return this.getDefaultTooltipContent(data)
  }
  
  /**
   * 獲取預設 tooltip 內容
   */
  protected getDefaultTooltipContent(data: any): ReactNode {
    if (!data) return null
    
    return (
      <div className="text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-2">
            <span className="text-gray-300">{key}:</span>
            <span className="font-medium">{String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  protected handleError(error: Error) {
    this.setState({ error })
    this.props.onError?.(error)
  }

  // === 交互層管理方法 ===

  /**
   * 創建交互層 - 用於添加交互功能
   */
  protected createInteractiveLayer(
    container: d3.Selection<SVGGElement, unknown, null, undefined>
  ): d3.Selection<SVGGElement, unknown, null, undefined> {
    return container.append('g').attr('class', 'interactive-layer');
  }

  /**
   * 啟用筆刷縮放功能
   */
  protected enableBrushZoom(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    scales: { xScale: any; yScale: any },
    config: BrushZoomConfig,
    onZoomCallback?: (domain: [any, any]) => void
  ): BrushZoomController {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    const brushConfig: BrushZoomConfig = {
      enabled: true,
      direction: 'x',
      resetOnDoubleClick: true,
      onZoom: onZoomCallback,
      ...config
    };

    return createBrushZoom(container, scales, brushConfig, { 
      width: chartWidth, 
      height: chartHeight 
    });
  }

  /**
   * 啟用十字游標功能
   */
  protected enableCrosshair(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: any[],
    scales: { xScale: any; yScale: any },
    config: CrosshairConfig,
    dataAccessor?: (d: any) => any
  ): CrosshairController {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    const crosshairConfig: CrosshairConfig = {
      enabled: true,
      showCircle: true,
      showLines: true,
      showText: true,
      ...config
    };

    return createCrosshair(container, data, scales, crosshairConfig, { 
      width: chartWidth, 
      height: chartHeight 
    }, dataAccessor);
  }

  /**
   * 創建視窗控制器
   */
  protected createViewportController(
    scales: { xScale: any; yScale: any }
  ): ViewportController {
    return createViewportController(scales);
  }

  /**
   * 應用圖表剪裁路徑
   */
  protected applyChartClipPath(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetSelection: d3.Selection<any, any, any, any>
  ): string {
    const { chartWidth, chartHeight } = this.getChartDimensions();
    const clipPathUrl = createChartClipPath(svg, { width: chartWidth, height: chartHeight });
    targetSelection.attr('clip-path', clipPathUrl);
    return clipPathUrl;
  }

  /**
   * 添加標準陰影效果
   */
  protected addDropShadow(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetSelection: d3.Selection<any, any, any, any>
  ): string {
    const shadowUrl = createStandardDropShadow(svg);
    targetSelection.attr('filter', shadowUrl);
    return shadowUrl;
  }

  /**
   * 添加光暈效果
   */
  protected addGlowEffect(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    targetSelection: d3.Selection<any, any, any, any>,
    color: string = '#ffffff'
  ): string {
    const glowUrl = createStandardGlow(svg, color);
    targetSelection.attr('filter', glowUrl);
    return glowUrl;
  }

  // === Group functionality methods ===

  /**
   * Process data with group functionality
   */
  protected processGroupData(data: any[]): GroupProcessorResult | null {
    if (!this.groupProcessor) return null
    return this.groupProcessor.processGroupData(data)
  }

  /**
   * Enable group interactions on a selection
   */
  protected enableGroupInteractions(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    selection: d3.Selection<any, any, any, any>
  ): void {
    if (!this.interactionComposer) return

    if (this.props.enableGroupHighlight) {
      this.groupHighlightManager = createGroupHighlightManager(container, {
        transitionDuration: this.props.animationDuration
      })
    }

    if (this.props.enableGroupFilter && this.props.groupBy) {
      this.groupFilterManager = createGroupFilterManager(this.props.data, this.props.groupBy)
    }

    this.interactionComposer.enableInteractions(selection)
  }

  /**
   * Render group legend
   */
  protected renderGroupLegend(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    groupResult: GroupProcessorResult
  ): d3.Selection<any, any, any, any> | null {
    if (!this.props.showGroupLegend) return null

    return createGroupLegend(
      container,
      groupResult.groups,
      groupResult.colorScale,
      {
        position: this.props.groupLegendPosition,
        onClick: this.props.onGroupSelect ? (group: string) => {
          if (this.groupFilterManager) {
            this.groupFilterManager.toggleGroup(group)
            const isSelected = this.groupFilterManager.getActiveGroups().includes(group)
            this.props.onGroupSelect?.(group, isSelected)
          }
        } : undefined
      }
    )
  }

  /**
   * Apply group data attributes to elements
   */
  protected applyGroupAttributes(
    selection: d3.Selection<any, any, any, any>,
    groupKey: string
  ): d3.Selection<any, any, any, any> {
    return selection.attr('data-group', (d: any) => d[groupKey] || '')
  }

  /**
   * Get group color for data item
   */
  protected getGroupColor(data: any, groupResult: GroupProcessorResult): string {
    const group = data[this.props.groupBy || ''] || ''
    return groupResult.colorScale(group)
  }

  // 渲染方法 - 用於 createChartComponent
  renderContent(containerRef: React.RefObject<HTMLDivElement>, svgRef: React.RefObject<SVGSVGElement>, overrideProps?: Partial<BaseChartProps>, reactTooltip?: BaseChartState['tooltip']): ReactNode {
    const currentProps = overrideProps ? { ...this.props, ...overrideProps } : this.props
    const { className, style, width, height, responsive } = currentProps
    const { error } = this.state
    // 🎯 優先使用 React state 的 tooltip，回退到 class state
    const tooltip = reactTooltip || this.state.tooltip
    
    
    
    if (error) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-red-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">圖表錯誤</div>
            <div className="text-sm text-gray-600">{error.message}</div>
          </div>
        </div>
      )
    }

    if (!this.validateData()) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-gray-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">無數據</div>
            <div className="text-sm">請提供有效的數據來渲染圖表</div>
          </div>
        </div>
      )
    }

    const containerStyle = responsive ? { ...style, width: '100%' } : style


    return (
      <div ref={containerRef} className={cn('relative', className)} style={containerStyle}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className={cn(`${this.getChartType()}-svg`, 'overflow-visible')}
          style={responsive ? { maxWidth: '100%' } : {}}
        />
        
        {/* 🎯 統一 Tooltip 系統 */}
        {(() => {
          console.log('🔍 Tooltip render condition check:', { 
            tooltip: !!tooltip, 
            visible: tooltip?.visible, 
            shouldRender: !!(tooltip && tooltip.visible)
          });
          return tooltip && tooltip.visible ? this.renderTooltip(tooltip) : null;
        })()}
        
        {/* 🎯 實時座標除錯顯示 */}
        {this.shouldShowCoordinateDebug() && this.renderCoordinateDebug()}
      </div>
    )
  }
  
  /**
   * 🎯 渲染統一的 Tooltip 組件
   */
  private renderTooltip(tooltip: NonNullable<BaseChartState['tooltip']>): ReactNode {
    // 🔍 詳細座標驗證日誌
    console.log('🎯🔴 TOOLTIP 座標驗證:');
    console.log('  📍 原始滑鼠位置 (clientX/Y):', { x: tooltip.x, y: tooltip.y });
    console.log('  🔴 紅點位置 (position: fixed):', { 
      left: tooltip.x - 2, 
      top: tooltip.y - 2,
      center: { x: tooltip.x, y: tooltip.y }
    });
    console.log('  🟦 Tooltip 預期位置 (含offset):', { 
      originalX: tooltip.x,
      originalY: tooltip.y,
      offsetX: tooltip.x - 10,
      offsetY: tooltip.y - 10,
      offset: { x: -10, y: -10 }
    });
    
    return (
      <>
        <ChartTooltip
          visible={tooltip.visible}
          position={{ x: tooltip.x, y: tooltip.y }}
          content={tooltip.content}
          theme={this.tooltipConfig.theme}
          hideDelay={this.tooltipConfig.hideDelay}
          showDelay={this.tooltipConfig.showDelay}
          animate={this.props.animate}
          animationDuration={200}
          offset={{ x: -10, y: -10 }}
          placement="none"
        />
      </>
    )
  }

  // 向下兼容的 render 方法
  render(): ReactNode {
    return this.renderContent(this.containerRef, this.svgRef)
  }
}

// React 組件包裝器
export function createChartComponent<TProps extends BaseChartProps>(
  ChartClass: new (props: TProps) => BaseChart<TProps>
) {
  console.log('🚀 createChartComponent called for:', ChartClass.name);
  
  const ForwardedComponent = React.forwardRef<BaseChart<TProps>, TProps>((props, ref) => {
    // 🎯 應用預設配置（響應式優先）
    const propsWithDefaults = useMemo(() => ({
      ...DEFAULT_CHART_CONFIG,
      ...props,
      // 🔄 智能響應式檢測：如果指定了 width 和 height，自動禁用響應式
      responsive: (props.width !== undefined && props.height !== undefined) 
        ? false 
        : (props.responsive !== undefined ? props.responsive : DEFAULT_CHART_CONFIG.responsive)
    }), [props])
    
    
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [, forceUpdate] = useState({});
    const [responsiveDimensions, setResponsiveDimensions] = useState<{ width: number; height: number } | null>(null);
    
    // 🎯 直接用 React state 管理 tooltip
    const [tooltip, setTooltip] = useState<BaseChartState['tooltip']>(null);
    
    
    // 監聽 props 變化
    useEffect(() => {
    }, [propsWithDefaults.responsive, propsWithDefaults.width, propsWithDefaults.height])
    
    // 計算最終的 props (包含響應式尺寸)
    const finalProps = useMemo(() => {
      if (propsWithDefaults.responsive && responsiveDimensions) {
        return { ...propsWithDefaults, width: responsiveDimensions.width, height: responsiveDimensions.height }
      }
      return propsWithDefaults
    }, [propsWithDefaults, responsiveDimensions])
    
    // 只創建一次 chart 實例
    const chartInstanceRef = useRef<BaseChart<TProps> | null>(null);
    
    if (!chartInstanceRef.current) {
      const instance = new ChartClass(propsWithDefaults);
      chartInstanceRef.current = instance;
    }
    
    const chartInstance = chartInstanceRef.current;
    
    // 🎯 直接注入 React 的 tooltip setter
    chartInstance.reactTooltipSetter = setTooltip;
    

    // Assign refs to the instance
    chartInstance.containerRef = containerRef;
    chartInstance.svgRef = svgRef;
    
    useEffect(() => {
      console.log('🎯 createChartComponent useEffect triggered!');
      console.log('🎯 svgRef.current exists:', !!chartInstance.svgRef?.current);
      console.log('🎯 finalProps:', finalProps);
      if (chartInstance.svgRef?.current) {
        console.log('🎯 About to call chartInstance.update...');
        chartInstance.update(finalProps);
        console.log('🎯 chartInstance.update call completed');
      } else {
        console.log('🎯 SVG ref not available, skipping update');
      }
    }, [finalProps, chartInstance]);
    
    // 單獨的 useEffect 用於 SVG ref 變化
    useEffect(() => {
      console.log('🔧 SVG ref useEffect triggered!');
      console.log('🔧 svgRef.current:', !!chartInstance.svgRef?.current);
      console.log('🔧 finalProps exists:', !!finalProps);
      if (chartInstance.svgRef?.current && finalProps) {
        console.log('🔧 About to call chartInstance.update from SVG ref effect...');
        chartInstance.update(finalProps);
        console.log('🔧 chartInstance.update from SVG ref effect completed');
      }
    }, [chartInstance.svgRef?.current]);

    // 公開實例方法
    React.useImperativeHandle(ref, () => chartInstance, [chartInstance])

    // 如果啟用響應式模式，使用 ResponsiveChartContainer
    console.log('🎨 Checking responsive mode:', propsWithDefaults.responsive);
    if (propsWithDefaults.responsive) {
      console.log('🎨 Using ResponsiveChartContainer');
      
      return (
        <ResponsiveChartContainer
          aspect={propsWithDefaults.aspect}
          minWidth={propsWithDefaults.minWidth}
          maxWidth={propsWithDefaults.maxWidth}
          minHeight={propsWithDefaults.minHeight}
          maxHeight={propsWithDefaults.maxHeight}
          className={propsWithDefaults.className}
          style={propsWithDefaults.style}
        >
          {(dimensions: { width: number; height: number }) => {
            
            // 更新響應式尺寸狀態 - 延遲到下一個事件循環避免在 render 中更新 state
            if (!responsiveDimensions || 
                responsiveDimensions.width !== dimensions.width || 
                responsiveDimensions.height !== dimensions.height) {
              
              // 使用 setTimeout 延遲狀態更新到下一個事件循環
              setTimeout(() => {
                setResponsiveDimensions(dimensions)
                
                // 當尺寸改變時，同步更新圖表實例
                if (chartInstance.svgRef?.current && dimensions.width > 0 && dimensions.height > 0) {
                  console.log('📐 ResponsiveChartContainer calling update with dimensions:', dimensions);
                  const updatedProps = { ...props, width: dimensions.width, height: dimensions.height } as TProps
                  chartInstance.update(updatedProps)
                  console.log('📐 ResponsiveChartContainer update call completed');
                } else {
                  console.log('📐 ResponsiveChartContainer skipping update - svgRef:', !!(chartInstance as any).svgRef?.current, 'dimensions:', dimensions);
                }
              }, 0)
            }
            
            // 使用最新的尺寸渲染
            const currentProps = { ...props, width: dimensions.width, height: dimensions.height }
            return chartInstance.renderContent(containerRef, svgRef, currentProps, tooltip)
          }}
        </ResponsiveChartContainer>
      )
    }

    // 使用 React state 的 tooltip 而不是 chartInstance.state.tooltip
    return (
      <div ref={containerRef} className={cn('relative', propsWithDefaults.className)} style={propsWithDefaults.style}>
        {chartInstance.renderContent(containerRef, svgRef, undefined, tooltip)}
      </div>
    )
  })
  
  // 添加顯示名稱和調試信息
  ForwardedComponent.displayName = `createChartComponent(${ChartClass.name})`
  
  return ForwardedComponent
}


// 工具函數
export const chartUtils = {
  // 數據驗證
  validateData: (data: any[]): boolean => {
    return Array.isArray(data) && data.length > 0
  },

  // 自動檢測數據類型
  detectDataTypes: (data: any[]): { [key: string]: 'number' | 'string' | 'date' | 'boolean' } => {
    if (!data.length) return {}
    
    const sample = data[0]
    const types: { [key: string]: 'number' | 'string' | 'date' | 'boolean' } = {}
    
    Object.keys(sample).forEach(key => {
      const value = sample[key]
      if (typeof value === 'number') {
        types[key] = 'number'
      } else if (typeof value === 'boolean') {
        types[key] = 'boolean'
      } else if (value instanceof Date) {
        types[key] = 'date'
      } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        types[key] = 'date'
      } else {
        types[key] = 'string'
      }
    })
    
    return types
  },

  // 建議映射
  suggestMapping: (data: any[]) => {
    const types = chartUtils.detectDataTypes(data)
    const keys = Object.keys(types)
    
    const xKey = keys.find(k => types[k] === 'date' || types[k] === 'string') || keys[0]
    const yKey = keys.find(k => types[k] === 'number' && k !== xKey) || keys[1]
    const categoryKey = keys.find(k => types[k] === 'string' && k !== xKey && k !== yKey)
    
    return { xKey, yKey, categoryKey }
  },

  // 格式化值
  formatValue: (value: any, type?: string): string => {
    if (value === null || value === undefined) return ''
    
    if (type === 'number' || typeof value === 'number') {
      return d3.format('.2f')(value)
    }
    
    if (type === 'date' || value instanceof Date) {
      return d3.timeFormat('%Y-%m-%d')(new Date(value))
    }
    
    return String(value)
  }
}

// === 新架構導出 ===
// 框架無關的核心邏輯
export { BaseChartCore } from './core';
export type { BaseChartCoreConfig, ChartStateCallbacks } from '../types';

// React 包裝層
export { createReactChartWrapper } from './react-chart-wrapper';
export type { ReactChartWrapperProps } from './react-chart-wrapper';