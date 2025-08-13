import React, { ReactNode, useMemo, useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'

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

  constructor(props: TProps) {
    this.props = props
    this.state = {
      tooltip: null,
      isLoading: false,
      error: null
    }
  }

  // 抽象方法，子類必須實現
  protected abstract processData(): any
  protected abstract createScales(): any
  protected abstract renderChart(): void
  protected abstract getChartType(): string

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

  // 渲染方法
  render(): ReactNode {
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
      <div ref={this.containerRef} className={cn('relative', className)} style={style}>
        <svg
          ref={this.svgRef}
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
        try {
          chartInstance.processData();
          chartInstance.createScales();
          chartInstance.renderChart();
        } catch (error) {
          chartInstance.handleError(error as Error);
        }
      }
    }, [props, chartInstance]);

    // 公開實例方法
    React.useImperativeHandle(ref, () => chartInstance, [chartInstance])

    return chartInstance.render()
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