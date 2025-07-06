export interface AxisProps {
  scale: any
  orientation: 'top' | 'bottom' | 'left' | 'right'
  tickCount?: number
  tickSize?: number
  tickSizeInner?: number
  tickSizeOuter?: number
  tickPadding?: number
  tickFormat?: (domainValue: any, index: number) => string
  tickValues?: any[]
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