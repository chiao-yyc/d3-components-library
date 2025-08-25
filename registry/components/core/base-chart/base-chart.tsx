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
  showTooltip: true       // 預設工具提示
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
  showTooltip?: boolean    // 預設 true
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

  constructor(props: TProps) {
    console.log('🎯 BaseChart constructor called with props:', {
      responsive: props.responsive,
      width: props.width, 
      height: props.height,
      containerWidth: (props as any).containerWidth
    })
    this.props = props
    this.state = {
      tooltip: null,
      isLoading: false,
      error: null
    }
    
    // Initialize group functionality if enabled
    this.initializeGroupManagers()
  }

  // 抽象方法，子類必須實現
  protected abstract processData(): any
  protected abstract createScales(): any
  protected abstract renderChart(): void
  protected abstract getChartType(): string

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
    
    this.props = newProps; // Update internal props
    this.initializeGroupManagers(); // Re-initialize group managers with new props
    
    if (this.svgRef?.current) { // Only proceed if SVG is ready
      try {
        this.processData();
        this.createScales();
        this.renderChart();
      } catch (error) {
        this.handleError(error as Error);
      }
    } else {
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
    
    console.log('🔧 Chart dimensions calculated:', {
      mode,
      width: finalWidth,
      height: finalHeight,
      responsive,
      props: { width, height, responsive }
    })
    
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
    this.setState({
      tooltip: {
        x,
        y,
        content,
        visible: true
      }
    })
  }

  protected hideTooltip() {
    this.setState({
      tooltip: null
    })
  }

  protected setState(newState: Partial<BaseChartState>) {
    this.state = { ...this.state, ...newState }
    // 觸發 React 重新渲染的機制將由 createChartComponent 處理
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
  renderContent(containerRef: React.RefObject<HTMLDivElement>, svgRef: React.RefObject<SVGSVGElement>, overrideProps?: Partial<BaseChartProps>): ReactNode {
    const currentProps = overrideProps ? { ...this.props, ...overrideProps } : this.props
    const { className, style, width, height, responsive } = currentProps
    const { tooltip, error } = this.state
    
    console.log('🎨 renderContent called:', {
      originalProps: { width: this.props.width, height: this.props.height },
      overrideProps,
      currentProps: { width: currentProps.width, height: currentProps.height },
      extractedProps: { width, height },
      responsive
    })
    
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
        
        {/* 工具提示 */}
        {tooltip && tooltip.visible && currentProps.showTooltip && (
          <div
            className="absolute z-50 pointer-events-none px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg whitespace-nowrap"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              maxWidth: '300px'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
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
    
    console.log('🎯 createChartComponent: forwardRef render function called!')
    console.log('🎯 createChartComponent: rendering with props:', { 
      responsive: propsWithDefaults.responsive, 
      width: propsWithDefaults.width, 
      height: propsWithDefaults.height,
      mode: propsWithDefaults.width && propsWithDefaults.height ? 'fixed' : 'responsive'
    })
    
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [, forceUpdate] = useState({});
    const [responsiveDimensions, setResponsiveDimensions] = useState<{ width: number; height: number } | null>(null);
    
    // 監聽 props 變化
    useEffect(() => {
      console.log('🎯 createChartComponent: props changed via useEffect:', { 
        responsive: propsWithDefaults.responsive, 
        width: propsWithDefaults.width, 
        height: propsWithDefaults.height 
      })
      console.log('🎯 createChartComponent: will enter responsive mode?', propsWithDefaults.responsive)
    }, [propsWithDefaults.responsive, propsWithDefaults.width, propsWithDefaults.height])
    
    // 計算最終的 props (包含響應式尺寸)
    const finalProps = useMemo(() => {
      if (propsWithDefaults.responsive && responsiveDimensions) {
        return { ...propsWithDefaults, width: responsiveDimensions.width, height: responsiveDimensions.height }
      }
      return propsWithDefaults
    }, [propsWithDefaults, responsiveDimensions])
    
    const chartInstance = useMemo(() => {
      const instance = new ChartClass(finalProps);
      
      // 重寫 setState 以觸發 React 重新渲染
      const originalSetState = instance.setState.bind(instance);
      instance.setState = (newState: Partial<BaseChartState>) => {
        originalSetState(newState);
        forceUpdate({}); // 強制 React 重新渲染
      };
      
      return instance;
    }, []);

    // Assign refs to the instance
    chartInstance.containerRef = containerRef;
    chartInstance.svgRef = svgRef;
    
    useEffect(() => {
      if (chartInstance.svgRef?.current) {
        chartInstance.update(finalProps);
      }
    }, [finalProps, chartInstance]);
    
    // 單獨的 useEffect 用於 SVG ref 變化
    useEffect(() => {
      if (chartInstance.svgRef?.current && finalProps) {
        chartInstance.update(finalProps);
      }
    }, [chartInstance.svgRef?.current]);

    // 公開實例方法
    React.useImperativeHandle(ref, () => chartInstance, [chartInstance])

    // 如果啟用響應式模式，使用 ResponsiveChartContainer
    console.log('🔍 Checking responsive condition:', { 
      propsResponsive: props.responsive, 
      propsWithDefaultsResponsive: propsWithDefaults.responsive 
    })
    if (propsWithDefaults.responsive) {
      console.log('🎯 BaseChart: entering responsive mode with ResponsiveChartContainer')
      console.log('🎯 ResponsiveChartContainer props:', { 
        aspect: propsWithDefaults.aspect, 
        minWidth: propsWithDefaults.minWidth, 
        maxWidth: propsWithDefaults.maxWidth, 
        minHeight: propsWithDefaults.minHeight, 
        maxHeight: propsWithDefaults.maxHeight 
      })
      
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
            console.log('📊 BaseChart render function called with dimensions:', dimensions)
            console.log('📊 Current props:', { width: props.width, height: props.height, responsive: props.responsive })
            console.log('🔍 Creating currentProps with dimensions:', { ...props, width: dimensions.width, height: dimensions.height })
            
            // 更新響應式尺寸狀態
            if (!responsiveDimensions || 
                responsiveDimensions.width !== dimensions.width || 
                responsiveDimensions.height !== dimensions.height) {
              console.log('📊 Updating responsiveDimensions state:', dimensions)
              setResponsiveDimensions(dimensions)
              
              // 當尺寸改變時，同步更新圖表實例
              if (chartInstance.svgRef?.current && dimensions.width > 0 && dimensions.height > 0) {
                const updatedProps = { ...props, width: dimensions.width, height: dimensions.height }
                console.log('📊 Updating chartInstance with props:', updatedProps)
                setTimeout(() => chartInstance.update(updatedProps), 0)
              }
            }
            
            // 使用最新的尺寸渲染
            const currentProps = { ...props, width: dimensions.width, height: dimensions.height }
            console.log('📊 Rendering with currentProps:', currentProps)
            return chartInstance.renderContent(containerRef, svgRef, currentProps)
          }}
        </ResponsiveChartContainer>
      )
    }

    return chartInstance.renderContent(containerRef, svgRef)
  })
  
  // 添加顯示名稱和調試信息
  ForwardedComponent.displayName = `createChartComponent(${ChartClass.name})`
  console.log('🎯 createChartComponent created:', ForwardedComponent.displayName)
  
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
export type { BaseChartCoreConfig, ChartStateCallbacks } from './core';

// React 包裝層
export { createReactChartWrapper } from './react-chart-wrapper';
export type { ReactChartWrapperProps } from './react-chart-wrapper';