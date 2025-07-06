import React from 'react'
import { Axis, AxisProps } from './axis'
import { useChartCanvas } from '../canvas'

export interface XAxisProps extends Omit<AxisProps, 'orientation' | 'transform'> {
  position?: 'top' | 'bottom'
  offset?: number
}

export const XAxis: React.FC<XAxisProps> = ({
  position = 'bottom',
  offset = 0,
  ...axisProps
}) => {
  const { contentArea } = useChartCanvas()
  
  const orientation = position
  const transform = position === 'bottom' 
    ? `translate(0, ${contentArea.height + offset})`
    : `translate(0, ${offset})`

  return (
    <Axis
      {...axisProps}
      orientation={orientation}
      transform={transform}
    />
  )
}