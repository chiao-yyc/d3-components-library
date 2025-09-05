/**
 * 交互行為輔助工具函式
 * 提供事件處理、滑鼠位置計算、節流防抖等功能
 */

/**
 * 節流函式 - 限制函式執行頻率
 * @param func 要節流的函式
 * @param delay 節流延遲時間 (毫秒)
 * @returns 節流後的函式
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  let lastExecTime = 0
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * 防抖函式 - 延遲執行函式直到停止調用
 * @param func 要防抖的函式  
 * @param delay 防抖延遲時間 (毫秒)
 * @returns 防抖後的函式
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * 獲取相對於 SVG 元素的滑鼠位置
 * @param event 滑鼠事件
 * @param svgElement SVG 元素
 * @returns 相對位置座標
 */
export function getRelativeMousePosition(
  event: MouseEvent | React.MouseEvent,
  svgElement: SVGSVGElement
): { x: number; y: number } {
  const rect = svgElement.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

/**
 * 獲取相對於圖表內容區域的滑鼠位置 (排除 margin)
 * @param event 滑鼠事件
 * @param svgElement SVG 元素
 * @param margin 圖表邊距
 * @returns 相對於內容區域的座標
 */
export function getChartRelativePosition(
  event: MouseEvent | React.MouseEvent,
  svgElement: SVGSVGElement,
  margin: { top: number; right: number; bottom: number; left: number }
): { x: number; y: number } {
  const relativePos = getRelativeMousePosition(event, svgElement)
  return {
    x: relativePos.x - margin.left,
    y: relativePos.y - margin.top
  }
}

/**
 * 檢測是否為觸控設備
 * @returns 是否為觸控設備
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - Legacy API compatibility
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * 創建 RAF 管理器
 * @returns RAF 管理器實例
 */
export function createAnimationManager() {
  let rafId: number | null = null
  let isRunning = false
  
  return {
    start(callback: () => void) {
      if (isRunning) return
      
      isRunning = true
      const animate = () => {
        if (!isRunning) return
        
        callback()
        rafId = requestAnimationFrame(animate)
      }
      rafId = requestAnimationFrame(animate)
    },
    
    stop() {
      isRunning = false
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },
    
    get isRunning() {
      return isRunning
    }
  }
}

/**
 * 邊界限制函式
 * @param value 要限制的值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制後的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 檢查點是否在矩形內
 * @param point 點座標
 * @param rect 矩形區域
 * @returns 是否在矩形內
 */
export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/**
 * 計算兩點間距離
 * @param p1 第一個點
 * @param p2 第二個點
 * @returns 距離
 */
export function getDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 查找最接近滑鼠位置的數據點
 * @param mouseX 滑鼠 X 座標
 * @param dataPoints 數據點陣列
 * @param xScale X 軸比例尺
 * @returns 最接近的數據點及索引
 */
export function findClosestDataPoint<T>(
  mouseX: number,
  dataPoints: T[],
  xScale: any,
  xAccessor: (d: T) => any
): { data: T; index: number; distance: number } | null {
  if (!dataPoints.length) return null
  
  let closestIndex = 0
  let minDistance = Infinity
  
  dataPoints.forEach((d, i) => {
    const dataX = xScale(xAccessor(d))
    const distance = Math.abs(mouseX - dataX)
    
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  })
  
  return {
    data: dataPoints[closestIndex],
    index: closestIndex,
    distance: minDistance
  }
}

/**
 * 創建事件處理器的清理函式
 * @param element 目標元素
 * @param eventType 事件類型
 * @param handler 事件處理器
 * @param options 事件選項
 * @returns 清理函式
 */
export function addEventListenerWithCleanup(
  element: Element | Window | Document,
  eventType: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(eventType, handler, options)
  
  return () => {
    element.removeEventListener(eventType, handler, options)
  }
}

/**
 * 批量添加事件監聽器
 * @param element 目標元素
 * @param events 事件配置陣列
 * @returns 批量清理函式
 */
export function addMultipleEventListeners(
  element: Element | Window | Document,
  events: Array<{
    type: string
    handler: EventListener
    options?: boolean | AddEventListenerOptions
  }>
): () => void {
  const cleanupFunctions = events.map(({ type, handler, options }) =>
    addEventListenerWithCleanup(element, type, handler, options)
  )
  
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}