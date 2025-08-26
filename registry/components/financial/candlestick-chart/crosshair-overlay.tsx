import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { throttle, getChartRelativePosition, findClosestDataPoint } from '../../../utils/interaction-helpers'

export interface CrosshairOverlayProps {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  data: any[]
  xScale: any
  yScale: any
  xAccessor: (d: any) => any
  yAccessor: (d: any) => number
  visible?: boolean
  color?: string
  opacity?: number
  strokeWidth?: number
  strokeDasharray?: string
  onDataPoint?: (dataPoint: any, index: number) => void
}

export const CrosshairOverlay: React.FC<CrosshairOverlayProps> = ({
  width,
  height,
  margin,
  data,
  xScale,
  yScale,
  xAccessor,
  yAccessor,
  visible = true,
  color = '#666666',
  opacity = 0.8,
  strokeWidth = 1,
  strokeDasharray = '3,3',
  onDataPoint
}) => {
  const overlayRef = useRef<SVGRectElement>(null)
  const crosshairGroupRef = useRef<SVGGElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [activeDataPoint, setActiveDataPoint] = useState<{ data: any; index: number } | null>(null)

  const throttledMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!overlayRef.current) return

      const svgElement = overlayRef.current.closest('svg') as SVGSVGElement
      if (!svgElement) return

      const chartPos = getChartRelativePosition(event, svgElement, margin)
      
      // 檢查是否在圖表區域內
      if (chartPos.x < 0 || chartPos.x > width - margin.left - margin.right ||
          chartPos.y < 0 || chartPos.y > height - margin.top - margin.bottom) {
        setMousePosition(null)
        setActiveDataPoint(null)
        return
      }

      setMousePosition(chartPos)

      // 查找最接近的數據點
      const closest = findClosestDataPoint(chartPos.x, data, xScale, xAccessor)
      if (closest) {
        setActiveDataPoint(closest)
        onDataPoint?.(closest.data, closest.index)
      }
    }, 16), // ~60fps
    [data, xScale, xAccessor, margin, width, height, onDataPoint]
  )

  const handleMouseLeave = useCallback(() => {
    setMousePosition(null)
    setActiveDataPoint(null)
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    overlay.addEventListener('mousemove', throttledMouseMove)
    overlay.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      overlay.removeEventListener('mousemove', throttledMouseMove)
      overlay.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [throttledMouseMove, handleMouseLeave])

  // 更新十字線位置
  useEffect(() => {
    const crosshairGroup = crosshairGroupRef.current
    if (!crosshairGroup || !mousePosition || !activeDataPoint) {
      if (crosshairGroup) {
        crosshairGroup.style.display = 'none'
      }
      return
    }

    crosshairGroup.style.display = 'block'

    // 獲取精確的數據點位置
    const dataX = xScale(xAccessor(activeDataPoint.data))
    const dataY = yScale(yAccessor(activeDataPoint.data))

    // 更新垂直線
    const verticalLine = crosshairGroup.querySelector('.crosshair-vertical') as SVGLineElement
    if (verticalLine) {
      verticalLine.setAttribute('x1', dataX.toString())
      verticalLine.setAttribute('x2', dataX.toString())
      verticalLine.setAttribute('y1', '0')
      verticalLine.setAttribute('y2', (height - margin.top - margin.bottom).toString())
    }

    // 更新水平線
    const horizontalLine = crosshairGroup.querySelector('.crosshair-horizontal') as SVGLineElement
    if (horizontalLine) {
      horizontalLine.setAttribute('x1', '0')
      horizontalLine.setAttribute('x2', (width - margin.left - margin.right).toString())
      horizontalLine.setAttribute('y1', dataY.toString())
      horizontalLine.setAttribute('y2', dataY.toString())
    }

    // 更新焦點圓點
    const focusCircle = crosshairGroup.querySelector('.crosshair-focus') as SVGCircleElement
    if (focusCircle) {
      focusCircle.setAttribute('cx', dataX.toString())
      focusCircle.setAttribute('cy', dataY.toString())
    }
  }, [mousePosition, activeDataPoint, xScale, yScale, xAccessor, yAccessor, width, height, margin])

  if (!visible) return null

  return (
    <g className="crosshair-overlay">
      {/* 透明遮罩用於捕捉滑鼠事件 */}
      <rect
        ref={overlayRef}
        x={0}
        y={0}
        width={width - margin.left - margin.right}
        height={height - margin.top - margin.bottom}
        fill="transparent"
        style={{ cursor: 'crosshair' }}
      />

      {/* 十字線組件 */}
      <g 
        ref={crosshairGroupRef} 
        className="crosshair-lines"
        style={{ display: 'none', pointerEvents: 'none' }}
      >
        {/* 垂直線 */}
        <line
          className="crosshair-vertical"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={opacity}
        />

        {/* 水平線 */}
        <line
          className="crosshair-horizontal"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={opacity}
        />

        {/* 焦點圓點 */}
        <circle
          className="crosshair-focus"
          r="3"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          opacity={opacity}
        />
      </g>
    </g>
  )
}

export default CrosshairOverlay