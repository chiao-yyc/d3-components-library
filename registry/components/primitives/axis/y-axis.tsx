import React from 'react'
import { Axis, AxisProps } from './axis'
import { useChartCanvas } from '../canvas'

export interface YAxisProps extends Omit<AxisProps, 'orientation' | 'transform'> {
  position?: 'left' | 'right'
  offset?: number
}

export const YAxis: React.FC<YAxisProps> = ({
  position = 'left',
  offset = 0,
  ...axisProps
}) => {
  const { contentArea } = useChartCanvas()
  
  const orientation = position
  const transform = position === 'left'
    ? `translate(${offset}, 0)`
    : `translate(${contentArea.width + offset}, 0)`

  return (
    <Axis
      {...axisProps}
      orientation={orientation}
      transform={transform}
    />
  )
}