import React, { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'

export interface RegressionData {
  x: number
  y: number
}

export interface RegressionLineProps {
  data: RegressionData[]
  xScale: any
  yScale: any
  className?: string
  animate?: boolean
  animationDuration?: number
  strokeColor?: string
  strokeWidth?: number
  strokeDasharray?: string
  opacity?: number
  regressionType?: 'linear' | 'polynomial' | 'exponential'
  polynomialDegree?: number
  showEquation?: boolean
  showRSquared?: boolean
  onLineClick?: (regressionData: { slope: number; intercept: number; rSquared: number }, event: React.MouseEvent) => void
}

export const RegressionLine: React.FC<RegressionLineProps> = ({
  data,
  xScale,
  yScale,
  className = '',
  animate = true,
  animationDuration = 300,
  strokeColor = '#ef4444',
  strokeWidth = 2,
  strokeDasharray = '5,5',
  opacity = 0.8,
  regressionType = 'linear',
  polynomialDegree = 2,
  showEquation = false,
  showRSquared = false,
  onLineClick
}) => {
  const regressionRef = useRef<SVGGElement>(null)

  // 計算回歸線數據
  const regressionResult = useMemo(() => {
    if (!data || data.length < 2 || !xScale || !yScale) return null

    // 過濾有效數據點
    const validData = data.filter(d => 
      typeof d.x === 'number' && 
      typeof d.y === 'number' && 
      !isNaN(d.x) && 
      !isNaN(d.y)
    )

    if (validData.length < 2) return null

    let lineData: { x: number; y: number }[] = []
    let slope = 0
    let intercept = 0
    let rSquared = 0

    if (regressionType === 'linear') {
      // 線性回歸計算
      const n = validData.length
      const sumX = validData.reduce((sum, d) => sum + d.x, 0)
      const sumY = validData.reduce((sum, d) => sum + d.y, 0)
      const sumXY = validData.reduce((sum, d) => sum + d.x * d.y, 0)
      const sumXX = validData.reduce((sum, d) => sum + d.x * d.x, 0)
      // const __sumYY = validData.reduce((sum, d) => sum + d.y * d.y, 0)

      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      intercept = (sumY - slope * sumX) / n

      // 計算 R² 
      const meanY = sumY / n
      const totalSumSquares = validData.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0)
      const residualSumSquares = validData.reduce((sum, d) => {
        const predicted = slope * d.x + intercept
        return sum + Math.pow(d.y - predicted, 2)
      }, 0)
      rSquared = 1 - (residualSumSquares / totalSumSquares)

      // 生成線段數據
      const xDomain = xScale.domain()
      const xRange = d3.range(xDomain[0], xDomain[1], (xDomain[1] - xDomain[0]) / 100)
      lineData = xRange.map(x => ({
        x,
        y: slope * x + intercept
      }))
    } else if (regressionType === 'polynomial') {
      // 多項式回歸（簡化版，這裡使用二次回歸）
      // 實際應用中可能需要更複雜的數學庫
      const n = validData.length
      
      // 構建矩陣進行多項式回歸（二次）
      if (polynomialDegree === 2) {
        const sumX = validData.reduce((sum, d) => sum + d.x, 0)
        const sumX2 = validData.reduce((sum, d) => sum + d.x * d.x, 0)
        const sumX3 = validData.reduce((sum, d) => sum + Math.pow(d.x, 3), 0)
        const sumX4 = validData.reduce((sum, d) => sum + Math.pow(d.x, 4), 0)
        const sumY = validData.reduce((sum, d) => sum + d.y, 0)
        const sumXY = validData.reduce((sum, d) => sum + d.x * d.y, 0)
        const sumX2Y = validData.reduce((sum, d) => sum + d.x * d.x * d.y, 0)

        // 解方程組 (簡化版)
        const a0 = sumY / n
        const a1 = (sumXY - sumX * a0) / sumX2
        const a2 = (sumX2Y - sumX2 * a0 - sumX3 * a1) / sumX4

        const xDomain = xScale.domain()
        const xRange = d3.range(xDomain[0], xDomain[1], (xDomain[1] - xDomain[0]) / 100)
        lineData = xRange.map(x => ({
          x,
          y: a0 + a1 * x + a2 * x * x
        }))

        // 簡化的 R² 計算
        const meanY = sumY / n
        const totalSumSquares = validData.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0)
        const residualSumSquares = validData.reduce((sum, d) => {
          const predicted = a0 + a1 * d.x + a2 * d.x * d.x
          return sum + Math.pow(d.y - predicted, 2)
        }, 0)
        rSquared = 1 - (residualSumSquares / totalSumSquares)
      }
    }

    return {
      lineData,
      slope,
      intercept,
      rSquared: Math.max(0, Math.min(1, rSquared)) // 確保 R² 在 0-1 範圍內
    }
  }, [data, xScale, yScale, regressionType, polynomialDegree])

  useEffect(() => {
    if (!regressionRef.current || !regressionResult || !xScale || !yScale) return

    const selection = d3.select(regressionRef.current)
    selection.selectAll('*').remove()

    const { lineData, slope, intercept, rSquared } = regressionResult

    // 創建線段生成器
    const line = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveLinear)

    // 繪製回歸線
    const path = selection
      .append('path')
      .datum(lineData)
      .attr('class', `regression-line ${className}`)
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-dasharray', strokeDasharray)
      .attr('opacity', animate ? 0 : opacity)
      .attr('d', line)

    if (animate) {
      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr('stroke-dasharray', `0 ${totalLength}`)
        .transition()
        .duration(animationDuration)
        .attr('stroke-dasharray', strokeDasharray)
        .attr('opacity', opacity)
    }

    // 添加點擊事件
    if (onLineClick) {
      path
        .style('cursor', 'pointer')
        .on('click', function(event) {
          onLineClick({ slope, intercept, rSquared }, event)
        })
    }

    // 顯示回歸方程式
    if (showEquation && regressionType === 'linear') {
      const equation = `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`
      selection
        .append('text')
        .attr('class', 'regression-equation')
        .attr('x', 10)
        .attr('y', 20)
        .attr('fill', strokeColor)
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .text(equation)
    }

    // 顯示 R² 值
    if (showRSquared) {
      const rSquaredText = `R² = ${rSquared.toFixed(4)}`
      selection
        .append('text')
        .attr('class', 'regression-r-squared')
        .attr('x', 10)
        .attr('y', showEquation ? 40 : 20)
        .attr('fill', strokeColor)
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .text(rSquaredText)
    }

  }, [
    regressionResult,
    xScale,
    yScale,
    className,
    animate,
    animationDuration,
    strokeColor,
    strokeWidth,
    strokeDasharray,
    opacity,
    showEquation,
    showRSquared,
    onLineClick,
    regressionType
  ])

  return (
    <g ref={regressionRef} className={`regression-line-container ${className}`} />
  )
}