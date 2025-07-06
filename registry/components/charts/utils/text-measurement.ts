/**
 * 測量文字寬度的工具函數
 */

// 創建隱藏的測量元素
let measureElement: HTMLSpanElement | null = null

function getMeasureElement(): HTMLSpanElement {
  if (!measureElement) {
    measureElement = document.createElement('span')
    measureElement.style.position = 'absolute'
    measureElement.style.visibility = 'hidden'
    measureElement.style.whiteSpace = 'nowrap'
    measureElement.style.fontSize = '12px'
    measureElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    document.body.appendChild(measureElement)
  }
  return measureElement
}

/**
 * 精確測量文字寬度
 */
export function measureTextWidth(text: string, fontSize: number = 12, fontFamily?: string): number {
  const element = getMeasureElement()
  element.style.fontSize = `${fontSize}px`
  if (fontFamily) {
    element.style.fontFamily = fontFamily
  }
  element.textContent = text
  return element.getBoundingClientRect().width
}

/**
 * 測量數字標籤的最大寬度
 */
export function measureMaxLabelWidth(values: number[], fontSize: number = 12): number {
  const labels = values.map(value => value.toLocaleString())
  const widths = labels.map(label => measureTextWidth(label, fontSize))
  return Math.max(...widths, 0)
}

/**
 * 估算文字寬度 (快速方法，不需要 DOM 操作)
 */
export function estimateTextWidth(text: string, fontSize: number = 12): number {
  // 基於字符的平均寬度估算
  const avgCharWidth = fontSize * 0.6 // 大約是字體大小的 60%
  return text.length * avgCharWidth
}

/**
 * 清理測量元素
 */
export function cleanupMeasureElement(): void {
  if (measureElement && measureElement.parentNode) {
    measureElement.parentNode.removeChild(measureElement)
    measureElement = null
  }
}