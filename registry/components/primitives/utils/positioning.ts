/**
 * 統一的位置計算與對齊工具函數
 * 解決不同圖表組件在 Band Scale 下對齊不一致的問題
 */

export type AlignmentStrategy = 'start' | 'center' | 'end'

export interface PositionConfig {
  alignment: AlignmentStrategy
  offset?: number
}

/**
 * 統一的位置計算工具函數
 * @param value - 數據值
 * @param scale - D3 比例尺
 * @param alignment - 對齊策略
 * @param offset - 額外偏移量
 * @returns 計算後的位置
 */
export const calculateAlignedPosition = (
  value: any,
  scale: any,
  alignment: AlignmentStrategy = 'center',
  offset: number = 0
): number => {
  const basePosition = scale(value)
  
  // Linear 或 Time Scale：直接返回
  if (!scale.bandwidth) {
    return basePosition + offset
  }
  
  // Band Scale：根據對齊策略計算
  const bandwidth = scale.bandwidth()
  
  switch (alignment) {
    case 'start':
      return basePosition + offset
      
    case 'center':
      return basePosition + bandwidth / 2 + offset
      
    case 'end':
      return basePosition + bandwidth + offset
      
    default:
      return basePosition + bandwidth / 2 + offset
  }
}

/**
 * 為 Bar 組件計算對齊位置
 * Bar 需要特殊處理：x 位置需要考慮條形寬度
 * @param value - 數據值
 * @param scale - X 比例尺
 * @param alignment - 對齊策略
 * @param barWidth - 條形寬度
 * @param offset - 額外偏移量
 */
export const calculateBarPosition = (
  value: any,
  scale: any,
  alignment: AlignmentStrategy = 'center',
  barWidth: number,
  offset: number = 0
): { x: number; width: number } => {
  const alignedPosition = calculateAlignedPosition(value, scale, alignment, offset)
  
  let x: number
  
  switch (alignment) {
    case 'start':
      x = alignedPosition
      break
      
    case 'center':
      x = alignedPosition - barWidth / 2
      break
      
    case 'end':
      x = alignedPosition - barWidth
      break
      
    default:
      x = alignedPosition - barWidth / 2
  }
  
  return { x, width: barWidth }
}

/**
 * 計算分組條形圖的位置
 * @param value - 數據值
 * @param scale - X 比例尺
 * @param groupIndex - 組內索引
 * @param groupCount - 組內總數
 * @param barWidthRatio - 條形寬度比例（相對於 bandwidth）
 * @param alignment - 對齊策略
 */
export const calculateGroupedBarPosition = (
  value: any,
  scale: any,
  groupIndex: number,
  groupCount: number,
  barWidthRatio: number = 0.8,
  alignment: AlignmentStrategy = 'center'
): { x: number; width: number } => {
  if (!scale.bandwidth) {
    throw new Error('分組條形圖需要 Band Scale')
  }
  
  const bandwidth = scale.bandwidth()
  const totalBarWidth = bandwidth * barWidthRatio
  const individualBarWidth = totalBarWidth / groupCount
  
  // 計算組的起始位置
  const groupStartOffset = (bandwidth - totalBarWidth) / 2
  const barX = calculateAlignedPosition(value, scale, 'start') + 
               groupStartOffset + 
               groupIndex * individualBarWidth
  
  return {
    x: barX,
    width: individualBarWidth
  }
}

/**
 * 檢查多個組件是否對齊
 * @param elements - 要檢查的元素位置
 * @param tolerance - 允許的誤差範圍（像素）
 */
export const checkAlignment = (
  elements: Array<{ type: string, positions: number[] }>,
  tolerance: number = 1
): { aligned: boolean; misalignments: Array<{ index: number; diff: number }> } => {
  if (elements.length < 2) return { aligned: true, misalignments: [] }
  
  const referencePositions = elements[0].positions
  const misalignments: Array<{ index: number; diff: number }> = []
  
  let aligned = true
  
  elements.forEach((element, elementIndex) => {
    element.positions.forEach((pos, positionIndex) => {
      const diff = Math.abs(pos - referencePositions[positionIndex])
      if (diff > tolerance) {
        aligned = false
        misalignments.push({
          index: elementIndex * element.positions.length + positionIndex,
          diff
        })
      }
    })
  })
  
  return { aligned, misalignments }
}

/**
 * 為 Line 生成器創建位置函數
 * @param xScale - X 比例尺
 * @param yScale - Y 比例尺
 * @param alignment - X 軸對齊策略
 */
export const createLinePositionGenerator = (
  xScale: any,
  yScale: any,
  alignment: AlignmentStrategy = 'center'
) => ({
  x: (d: any) => calculateAlignedPosition(d.x, xScale, alignment),
  y: (d: any) => yScale(d.y)
})

/**
 * 批量計算位置（用於性能優化）
 * @param data - 數據數組
 * @param xScale - X 比例尺
 * @param alignment - 對齊策略
 * @param offset - 偏移量
 */
export const calculatePositionsBatch = (
  data: any[],
  xScale: any,
  alignment: AlignmentStrategy = 'center',
  offset: number = 0
): number[] => {
  // 預計算常用值以提高性能
  const hasBandwidth = !!xScale.bandwidth
  const bandwidth = hasBandwidth ? xScale.bandwidth() : 0
  
  let offsetValue: number
  switch (alignment) {
    case 'start':
      offsetValue = offset
      break
    case 'center':
      offsetValue = (hasBandwidth ? bandwidth / 2 : 0) + offset
      break
    case 'end':
      offsetValue = (hasBandwidth ? bandwidth : 0) + offset
      break
    default:
      offsetValue = (hasBandwidth ? bandwidth / 2 : 0) + offset
  }
  
  return data.map(d => xScale(d.x) + offsetValue)
}

/**
 * 創建對齊配置的預設值
 */
export const DEFAULT_ALIGNMENT_CONFIG: Record<string, AlignmentStrategy> = {
  bar: 'center',
  line: 'center', 
  scatter: 'center',
  area: 'center',
  waterfall: 'center'
}

/**
 * 驗證對齊策略是否有效
 */
export const validateAlignment = (alignment: any): AlignmentStrategy => {
  const validAlignments: AlignmentStrategy[] = ['start', 'center', 'end']
  return validAlignments.includes(alignment) ? alignment : 'center'
}

/**
 * 為組件提供統一對齊的 Hook
 */
export const useUnifiedAlignment = (
  componentType: string,
  providedAlignment?: AlignmentStrategy
): AlignmentStrategy => {
  return validateAlignment(providedAlignment) || DEFAULT_ALIGNMENT_CONFIG[componentType] || 'center'
}

/**
 * Debug 工具：輸出對齊診斷信息
 */
export const debugAlignment = (
  componentType: string,
  value: any,
  scale: any,
  alignment: AlignmentStrategy,
  calculatedPosition: number
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Alignment Debug] ${componentType}:`, {
      value,
      alignment,
      hasBandwidth: !!scale.bandwidth,
      bandwidth: scale.bandwidth?.() || 'N/A',
      basePosition: scale(value),
      finalPosition: calculatedPosition,
      offset: calculatedPosition - scale(value)
    })
  }
}