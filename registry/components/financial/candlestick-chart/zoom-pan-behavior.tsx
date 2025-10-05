import React, { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

export interface ZoomPanBehaviorProps {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  xScale: any
  yScale: any
  data: any[]
  onZoomChange?: (transform: d3.ZoomTransform) => void
  onScaleUpdate?: (newXScale: any, newYScale: any) => void
  enabled?: boolean
  enableX?: boolean
  enableY?: boolean
  scaleExtent?: [number, number]
  translateExtent?: [[number, number], [number, number]]
  constrainToData?: boolean
  resetOnDoubleClick?: boolean
  wheelStep?: number
}

export const ZoomPanBehavior: React.FC<ZoomPanBehaviorProps> = ({
  width,
  height,
  margin,
  xScale,
  yScale,
  data,
  onZoomChange,
  onScaleUpdate,
  enabled = true,
  enableX = true,
  enableY = false, // K線圖通常不需要 Y 軸縮放
  scaleExtent = [0.5, 10],
  translateExtent,
  constrainToData = true,
  resetOnDoubleClick = true
}) => {
  const zoomRef = useRef<SVGRectElement>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGRectElement, unknown>>()
  const originalXScaleRef = useRef(xScale.copy())
  const originalYScaleRef = useRef(yScale.copy())

  // 計算數據範圍約束
  const getDataConstraints = useCallback(() => {
    if (!constrainToData || !data.length) return null

    const xDomain = d3.extent(data, d => d.date || d.x) as [any, any]
    const xRange = [0, width - margin.left - margin.right]
    
    return {
      xMin: xScale(xDomain[0]),
      xMax: xScale(xDomain[1]),
      xRange
    }
  }, [data, xScale, width, margin, constrainToData])

  // 創建縮放行為
  const createZoomBehavior = useCallback(() => {
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const zoom = d3.zoom<SVGRectElement, unknown>()
      .scaleExtent(scaleExtent)
      .on('zoom', (event) => {
        if (!enabled) return

        const transform = event.transform as d3.ZoomTransform
        
        // 創建新的比例尺
        let newXScale = originalXScaleRef.current.copy()
        let newYScale = originalYScaleRef.current.copy()

        if (enableX) {
          newXScale = transform.rescaleX(originalXScaleRef.current)
          
          // 數據範圍約束
          if (constrainToData) {
            const constraints = getDataConstraints()
            if (constraints) {
              const [_x0, _x1] = newXScale.range()
              const [dx0, dx1] = newXScale.domain()
              
              // 限制平移範圍，確保不超出數據範圍
              const originalDomain = originalXScaleRef.current.domain()
              const domainWidth = dx1 - dx0
              const originalDomainWidth = originalDomain[1] - originalDomain[0]
              
              // 如果當前域寬度大於原始域，限制在原始範圍內
              if (domainWidth >= originalDomainWidth) {
                newXScale.domain(originalDomain)
              } else {
                // 確保不會平移超出數據範圍
                let newDx0 = dx0
                let newDx1 = dx1
                
                if (newDx0 < originalDomain[0]) {
                  const offset = originalDomain[0] - newDx0
                  newDx0 = originalDomain[0]
                  newDx1 = newDx1 + offset
                }
                
                if (newDx1 > originalDomain[1]) {
                  const offset = newDx1 - originalDomain[1]
                  newDx1 = originalDomain[1]
                  newDx0 = newDx0 - offset
                }
                
                newXScale.domain([newDx0, newDx1])
              }
            }
          }
        }

        if (enableY) {
          newYScale = transform.rescaleY(originalYScaleRef.current)
        }

        // 通知父組件比例尺更新
        onScaleUpdate?.(newXScale, newYScale)
        onZoomChange?.(transform)
      })

    // 設置平移範圍約束
    if (translateExtent) {
      zoom.translateExtent(translateExtent)
    } else {
      // 預設約束在圖表區域內
      zoom.translateExtent([
        [0, 0], 
        [chartWidth, chartHeight]
      ])
    }

    // 雙擊重置 - 使用 filter 來處理雙擊
    if (resetOnDoubleClick) {
      zoom.filter((event) => {
        // 阻止雙擊的預設縮放行為
        if (event.type === 'dblclick') {
          return false
        }
        return true
      })
    }

    return zoom
  }, [
    width, height, margin, enabled, enableX, enableY, 
    scaleExtent, translateExtent, constrainToData, 
    resetOnDoubleClick, onZoomChange, onScaleUpdate, 
    getDataConstraints
  ])

  // 初始化和更新縮放行為
  useEffect(() => {
    const element = zoomRef.current
    if (!element) return

    const zoom = createZoomBehavior()
    zoomBehaviorRef.current = zoom

    const selection = d3.select(element)
    selection.call(zoom)

    // 添加雙擊重置功能
    if (resetOnDoubleClick) {
      selection.on('dblclick.zoom', () => {
        selection
          .transition()
          .duration(300)
          .call(zoom.transform, d3.zoomIdentity)
      })
    }

    // 清理
    return () => {
      selection.on('.zoom', null)
    }
  }, [createZoomBehavior, resetOnDoubleClick])

  // 更新原始比例尺引用
  useEffect(() => {
    originalXScaleRef.current = xScale.copy()
    originalYScaleRef.current = yScale.copy()
  }, [xScale, yScale])

  // Note: Programmatic zoom control methods removed as they were unused
  // If you need to expose zoom controls, add a ref prop to ZoomPanBehaviorProps
  // and implement useImperativeHandle with methods like zoomTo, zoomIn, zoomOut, resetZoom

  if (!enabled) return null

  return (
    <g className="zoom-pan-behavior">
      {/* 透明遮罩用於捕捉縮放和平移事件 */}
      <rect
        ref={zoomRef}
        x={0}
        y={0}
        width={width - margin.left - margin.right}
        height={height - margin.top - margin.bottom}
        fill="transparent"
        style={{ 
          cursor: enabled ? 'grab' : 'default',
          pointerEvents: 'all'
        }}
      />

      {/* 縮放控制提示 */}
      {enabled && (
        <g className="zoom-controls-hint" style={{ pointerEvents: 'none' }}>
          <text
            x={width - margin.left - margin.right - 10}
            y={15}
            textAnchor="end"
            fontSize="10"
            fill="#666"
            opacity={0.7}
          >
            滾輪縮放 • 雙擊重置
          </text>
        </g>
      )}
    </g>
  )
}

export default ZoomPanBehavior