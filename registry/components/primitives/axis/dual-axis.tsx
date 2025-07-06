import React from 'react'
import { YAxis, YAxisProps } from './y-axis'

export interface DualAxisProps {
  leftAxis: YAxisProps
  rightAxis: YAxisProps
  className?: string
}

export const DualAxis: React.FC<DualAxisProps> = ({
  leftAxis,
  rightAxis,
  className = ''
}) => {
  return (
    <g className={`dual-axis ${className}`}>
      <YAxis
        {...leftAxis}
        position="left"
        className={`dual-axis-left ${leftAxis.className || ''}`}
      />
      <YAxis
        {...rightAxis}
        position="right"
        className={`dual-axis-right ${rightAxis.className || ''}`}
      />
    </g>
  )
}