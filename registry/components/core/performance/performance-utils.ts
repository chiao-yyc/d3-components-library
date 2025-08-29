/**
 * Performance utility functions
 * 性能相關工具函數
 */

// 數據點檢測
export interface DataPoint {
  x: number | Date;
  y: number;
  [key: string]: any;
}

// 視窗定義
export interface Viewport {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * 計算數據集的最適渲染模式
 */
export function calculateOptimalRenderMode(
  dataCount: number,
  threshold: number = 10000
): 'svg' | 'canvas' {
  return dataCount > threshold ? 'canvas' : 'svg';
}

/**
 * 視窗內數據點篩選 (虛擬化支援)
 */
export function filterVisibleDataPoints<T extends DataPoint>(
  data: T[],
  viewport: Viewport,
  xScale: (value: any) => number,
  yScale: (value: number) => number,
  margin: number = 10
): T[] {
  return data.filter(point => {
    const x = xScale(point.x);
    const y = yScale(point.y);
    
    return (
      x >= viewport.left - margin &&
      x <= viewport.right + margin &&
      y >= viewport.top - margin &&
      y <= viewport.bottom + margin
    );
  });
}

/**
 * 批次處理數據以避免阻塞主線程
 */
export function processBatched<T>(
  data: T[],
  batchSize: number,
  processor: (batch: T[], batchIndex: number) => void,
  onComplete?: () => void
): void {
  let index = 0;
  
  function processBatch() {
    const endIndex = Math.min(index + batchSize, data.length);
    const batch = data.slice(index, endIndex);
    
    processor(batch, Math.floor(index / batchSize));
    
    index = endIndex;
    
    if (index < data.length) {
      // 使用 requestAnimationFrame 避免阻塞
      requestAnimationFrame(processBatch);
    } else {
      onComplete?.();
    }
  }
  
  processBatch();
}

/**
 * Canvas 高效能點渲染
 */
export function renderPointsToCanvas(
  ctx: CanvasRenderingContext2D,
  points: DataPoint[],
  options: {
    xScale: (value: any) => number;
    yScale: (value: number) => number;
    radius?: number;
    fillStyle?: string | ((point: DataPoint, index: number) => string);
    strokeStyle?: string;
    lineWidth?: number;
  }
): void {
  const {
    xScale,
    yScale,
    radius = 3,
    fillStyle = '#3b82f6',
    strokeStyle,
    lineWidth = 1
  } = options;
  
  // 批次設置樣式以提升性能
  ctx.save();
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
  }
  
  points.forEach((point, index) => {
    const x = xScale(point.x);
    const y = yScale(point.y);
    
    // 跳過視窗外的點
    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
    
    if (x < -radius || x > canvasWidth + radius || 
        y < -radius || y > canvasHeight + radius) {
      return;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    // 設置填充顏色
    if (typeof fillStyle === 'function') {
      ctx.fillStyle = fillStyle(point, index);
    } else {
      ctx.fillStyle = fillStyle;
    }
    
    ctx.fill();
    
    if (strokeStyle) {
      ctx.stroke();
    }
  });
  
  ctx.restore();
}

/**
 * Canvas 高效能線條渲染
 */
export function renderLineToCanvas(
  ctx: CanvasRenderingContext2D,
  points: DataPoint[],
  options: {
    xScale: (value: any) => number;
    yScale: (value: number) => number;
    strokeStyle?: string;
    lineWidth?: number;
    lineDash?: number[];
    smooth?: boolean;
  }
): void {
  if (points.length === 0) return;
  
  const {
    xScale,
    yScale,
    strokeStyle = '#3b82f6',
    lineWidth = 2,
    lineDash,
    smooth = false
  } = options;
  
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  
  if (lineDash) {
    ctx.setLineDash(lineDash);
  }
  
  ctx.beginPath();
  
  if (smooth && points.length > 2) {
    // 使用三次貝塞爾曲線平滑
    const firstPoint = points[0];
    ctx.moveTo(xScale(firstPoint.x), yScale(firstPoint.y));
    
    for (let i = 1; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      
      const currentX = xScale(currentPoint.x);
      const currentY = yScale(currentPoint.y);
      const nextX = xScale(nextPoint.x);
      const nextY = yScale(nextPoint.y);
      
      const controlX = (currentX + nextX) / 2;
      
      ctx.quadraticCurveTo(currentX, currentY, controlX, (currentY + nextY) / 2);
    }
    
    const lastPoint = points[points.length - 1];
    ctx.lineTo(xScale(lastPoint.x), yScale(lastPoint.y));
  } else {
    // 直線連接
    points.forEach((point, index) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
  }
  
  ctx.stroke();
  ctx.restore();
}

/**
 * 性能監控工具
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();
  
  start(name: string): void {
    this.startTimes.set(name, performance.now());
  }
  
  end(name: string): number {
    const startTime = this.startTimes.get(name);
    if (startTime === undefined) {
      console.warn(`Performance timer '${name}' not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(duration);
    this.startTimes.delete(name);
    
    return duration;
  }
  
  getAverage(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getStats(name: string): { avg: number; min: number; max: number; count: number } {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    return {
      avg: this.getAverage(name),
      min: Math.min(...times),
      max: Math.max(...times),
      count: times.length
    };
  }
  
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
      this.startTimes.delete(name);
    } else {
      this.metrics.clear();
      this.startTimes.clear();
    }
  }
}

/**
 * 記憶體使用量檢測
 */
export function getMemoryUsage(): number | undefined {
  // @ts-ignore - performance.memory 在某些環境可能不存在
  if (typeof (performance as any).memory !== 'undefined') {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return undefined;
}

/**
 * 設備像素比檢測和優化
 */
export function getOptimalPixelRatio(): number {
  const deviceRatio = window.devicePixelRatio || 1;
  
  // 在高 DPI 設備上限制最大比例以保持性能
  return Math.min(deviceRatio, 2);
}

/**
 * Canvas 上下文優化設置
 */
export function optimizeCanvasContext(
  ctx: CanvasRenderingContext2D,
  options: {
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: 'low' | 'medium' | 'high';
  } = {}
): void {
  const {
    imageSmoothingEnabled = false,  // 關閉平滑以提升性能
    imageSmoothingQuality = 'low'
  } = options;
  
  ctx.imageSmoothingEnabled = imageSmoothingEnabled;
  if (ctx.imageSmoothingEnabled) {
    ctx.imageSmoothingQuality = imageSmoothingQuality;
  }
}