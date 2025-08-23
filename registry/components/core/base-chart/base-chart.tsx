import React, { ReactNode, useMemo, useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
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

export interface BaseChartProps {
  data: any[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  className?: string
  style?: React.CSSProperties
  animate?: boolean
  animationDuration?: number
  showTooltip?: boolean
  onError?: (error: Error) => void
  
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

  // 共用方法
  protected getChartDimensions() {
    const { width = 800, height = 400, margin = { top: 20, right: 30, bottom: 40, left: 40 } } = this.props
    return {
      width,
      height,
      margin,
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
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
  renderContent(containerRef: React.RefObject<HTMLDivElement>, svgRef: React.RefObject<SVGSVGElement>): ReactNode {
    const { className, style, width, height } = this.props
    const { tooltip, error } = this.state
    
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

    return (
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className={cn(`${this.getChartType()}-svg`, 'overflow-visible')}
        />
        
        {/* 工具提示 */}
        {tooltip && tooltip.visible && this.props.showTooltip && (
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
  return React.forwardRef<BaseChart<TProps>, TProps>((props, ref) => {
    
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const chartInstance = useMemo(() => new ChartClass(props), []);

    // Assign refs to the instance
    chartInstance.containerRef = containerRef;
    chartInstance.svgRef = svgRef;
    
    const [, forceUpdate] = useState({})
    
    useEffect(() => {
      
      if (chartInstance.svgRef?.current) {
        chartInstance.update(props); // Call the new update method
      }
    }, [props, chartInstance]);
    
    // 單獨的 useEffect 用於 SVG ref 變化
    useEffect(() => {
      if (chartInstance.svgRef?.current && props) {
        chartInstance.update(props);
      }
    }, [chartInstance.svgRef?.current]);

    // 公開實例方法
    React.useImperativeHandle(ref, () => chartInstance, [chartInstance])

    return chartInstance.renderContent(containerRef, svgRef)
  })
}

// 默認配置
export const DEFAULT_CHART_CONFIG = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 30, bottom: 40, left: 40 },
  animate: true,
  animationDuration: 750,
  showTooltip: true,
  colors: [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
  ]
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