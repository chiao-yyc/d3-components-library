import * as d3 from 'd3'

export interface AxisProps {
  scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> | d3.ScaleBand<string> | d3.ScaleOrdinal<string, unknown>
  orientation: 'top' | 'bottom' | 'left' | 'right'
  tickCount?: number
  tickSize?: number
  tickSizeInner?: number
  tickSizeOuter?: number
  tickPadding?: number
  tickFormat?: (domainValue: unknown, index: number) => string
  tickValues?: unknown[]
  ticks?: any[]
  label?: string
  labelOffset?: number
  className?: string
  gridlines?: boolean
  gridlinesClassName?: string
  transform?: string
}

export interface XAxisProps extends Omit<AxisProps, 'orientation' | 'transform'> {
  position?: 'top' | 'bottom'
  offset?: number
}

export interface YAxisProps extends Omit<AxisProps, 'orientation' | 'transform'> {
  position?: 'left' | 'right'
  offset?: number
}

export interface DualAxisProps {
  leftAxis: YAxisProps
  rightAxis: YAxisProps
  className?: string
}