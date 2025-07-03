# 效能優化任務

## 任務概述
針對 D3 Components 專案進行全面的效能優化，包括 CLI 工具效能、組件渲染效能、資料處理效能和建構效能。

## 主要目標
1. 優化 CLI 工具執行速度和記憶體使用
2. 優化組件渲染效能和互動響應
3. 實作資料處理最佳化策略
4. 建立效能監控和基準測試

## 執行階段

### Phase 1: CLI 工具效能優化 (優先級: 高)

#### 任務 1.1: 啟動時間優化
- **目標**: 減少 CLI 工具的冷啟動時間
- **位置**: `cli/src/`
- **需求**:

```typescript
// cli/src/utils/lazy-loader.ts
/**
 * 延遲載入模組，減少啟動時間
 */
export class LazyLoader {
  private static cache = new Map<string, any>()
  
  static async load<T>(modulePath: string, loader: () => Promise<T>): Promise<T> {
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath)
    }
    
    const module = await loader()
    this.cache.set(modulePath, module)
    return module
  }
  
  // 預載入關鍵模組
  static async preload() {
    const criticalModules = [
      () => import('chalk'),
      () => import('ora'),
      () => import('fs-extra')
    ]
    
    await Promise.all(criticalModules.map(loader => loader()))
  }
}

// 使用範例
export async function getChalk() {
  return LazyLoader.load('chalk', () => import('chalk'))
}

export async function getOra() {
  return LazyLoader.load('ora', () => import('ora'))
}
```

```typescript
// cli/src/index.ts 優化版本
#!/usr/bin/env node

// 立即開始預載入關鍵模組
import { LazyLoader } from './utils/lazy-loader'
LazyLoader.preload()

import { Command } from 'commander'

const program = new Command()

// 延遲載入命令模組
program
  .command('add <component>')
  .description('添加組件到專案中')
  .option('-v, --variant <variant>', '選擇組件變體')
  .option('-d, --dir <directory>', '目標目錄', './src/components/ui')
  .option('--dry-run', '預覽變更但不實際執行')
  .action(async (...args) => {
    // 只在需要時載入 add 命令
    const { addCommand } = await import('./commands/add')
    return addCommand(...args)
  })

program
  .command('list')
  .description('列出所有可用組件')
  .option('-f, --filter <filter>', '過濾組件')
  .action(async (...args) => {
    const { listCommand } = await import('./commands/list')
    return listCommand(...args)
  })

// 其他命令也使用相同模式...

// 效能監控
if (process.env.CLI_PERF) {
  const startTime = process.hrtime.bigint()
  
  process.on('exit', () => {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // 轉換為毫秒
    console.error(`CLI 執行時間: ${duration.toFixed(2)}ms`)
  })
}

program.parse()
```

#### 任務 1.2: 檔案操作優化
- **目標**: 優化檔案讀寫和複製操作
- **位置**: `cli/src/utils/file-operations.ts`
- **需求**:

```typescript
// cli/src/utils/file-operations.ts
import fs from 'fs-extra'
import path from 'path'
import { Worker } from 'worker_threads'
import { pipeline } from 'stream/promises'

export class OptimizedFileOperations {
  private static readonly CHUNK_SIZE = 1024 * 1024 // 1MB chunks
  private static readonly MAX_CONCURRENT = 5 // 最大並發數
  
  /**
   * 並發複製多個檔案
   */
  static async copyFiles(operations: Array<{ source: string; target: string }>) {
    const semaphore = new Semaphore(this.MAX_CONCURRENT)
    
    const results = await Promise.all(
      operations.map(async (op) => {
        await semaphore.acquire()
        try {
          return await this.copyFile(op.source, op.target)
        } finally {
          semaphore.release()
        }
      })
    )
    
    return results
  }
  
  /**
   * 優化的單檔案複製
   */
  static async copyFile(source: string, target: string) {
    // 確保目標目錄存在
    await fs.ensureDir(path.dirname(target))
    
    // 對於小檔案，直接使用 fs-extra
    const stat = await fs.stat(source)
    if (stat.size < this.CHUNK_SIZE) {
      return fs.copy(source, target)
    }
    
    // 對於大檔案，使用串流
    const readStream = fs.createReadStream(source, { 
      highWaterMark: this.CHUNK_SIZE 
    })
    const writeStream = fs.createWriteStream(target)
    
    await pipeline(readStream, writeStream)
  }
  
  /**
   * 批次讀取檔案（使用 Worker）
   */
  static async readFiles(filePaths: string[]): Promise<Map<string, string>> {
    if (filePaths.length < 10) {
      // 少量檔案直接讀取
      const results = new Map<string, string>()
      await Promise.all(
        filePaths.map(async (filePath) => {
          const content = await fs.readFile(filePath, 'utf-8')
          results.set(filePath, content)
        })
      )
      return results
    }
    
    // 大量檔案使用 Worker
    return new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort } = require('worker_threads')
        const fs = require('fs-extra')
        
        parentPort.on('message', async (filePaths) => {
          const results = new Map()
          
          for (const filePath of filePaths) {
            try {
              const content = await fs.readFile(filePath, 'utf-8')
              results.set(filePath, content)
            } catch (error) {
              parentPort.postMessage({ error: error.message })
              return
            }
          }
          
          parentPort.postMessage({ results: Array.from(results.entries()) })
        })
      `, { eval: true })
      
      worker.postMessage(filePaths)
      
      worker.on('message', (data) => {
        if (data.error) {
          reject(new Error(data.error))
        } else {
          resolve(new Map(data.results))
        }
        worker.terminate()
      })
      
      worker.on('error', reject)
    })
  }
}

/**
 * 簡單的信號量實作
 */
class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []
  
  constructor(permits: number) {
    this.permits = permits
  }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }
    
    return new Promise(resolve => {
      this.waiting.push(resolve)
    })
  }
  
  release(): void {
    this.permits++
    
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!
      this.permits--
      next()
    }
  }
}
```

#### 任務 1.3: Registry 快取優化
- **目標**: 實作智慧快取機制
- **位置**: `cli/src/utils/cache-manager.ts`
- **需求**:

```typescript
// cli/src/utils/cache-manager.ts
import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import os from 'os'

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
  checksum: string
}

export class CacheManager {
  private static readonly CACHE_DIR = path.join(os.homedir(), '.d3-components-cache')
  private static readonly DEFAULT_TTL = 1000 * 60 * 60 * 24 // 24 小時
  
  /**
   * 初始化快取目錄
   */
  static async init() {
    await fs.ensureDir(this.CACHE_DIR)
  }
  
  /**
   * 設置快取
   */
  static async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    await this.init()
    
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: this.getVersion(),
      checksum: this.calculateChecksum(data)
    }
    
    const cachePath = this.getCachePath(key)
    await fs.writeJSON(cachePath, cacheEntry)
    
    // 設置 TTL（簡化版本，實際應該使用更精確的方法）
    setTimeout(() => {
      this.delete(key).catch(() => {}) // 忽略錯誤
    }, ttl)
  }
  
  /**
   * 獲取快取
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      await this.init()
      
      const cachePath = this.getCachePath(key)
      if (!await fs.pathExists(cachePath)) {
        return null
      }
      
      const cacheEntry: CacheEntry<T> = await fs.readJSON(cachePath)
      
      // 檢查版本
      if (cacheEntry.version !== this.getVersion()) {
        await this.delete(key)
        return null
      }
      
      // 檢查數據完整性
      const currentChecksum = this.calculateChecksum(cacheEntry.data)
      if (currentChecksum !== cacheEntry.checksum) {
        await this.delete(key)
        return null
      }
      
      return cacheEntry.data
      
    } catch (error) {
      // 快取損壞，刪除並返回 null
      await this.delete(key)
      return null
    }
  }
  
  /**
   * 刪除快取
   */
  static async delete(key: string): Promise<void> {
    const cachePath = this.getCachePath(key)
    await fs.remove(cachePath)
  }
  
  /**
   * 清空所有快取
   */
  static async clear(): Promise<void> {
    await fs.remove(this.CACHE_DIR)
  }
  
  /**
   * 獲取快取統計
   */
  static async getStats(): Promise<{
    totalSize: number
    fileCount: number
    oldestEntry: number
    newestEntry: number
  }> {
    await this.init()
    
    const files = await fs.readdir(this.CACHE_DIR)
    let totalSize = 0
    let oldestEntry = Date.now()
    let newestEntry = 0
    
    for (const file of files) {
      const filePath = path.join(this.CACHE_DIR, file)
      const stat = await fs.stat(filePath)
      
      totalSize += stat.size
      oldestEntry = Math.min(oldestEntry, stat.mtime.getTime())
      newestEntry = Math.max(newestEntry, stat.mtime.getTime())
    }
    
    return {
      totalSize,
      fileCount: files.length,
      oldestEntry,
      newestEntry
    }
  }
  
  private static getCachePath(key: string): string {
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
    return path.join(this.CACHE_DIR, `${hashedKey}.json`)
  }
  
  private static calculateChecksum<T>(data: T): string {
    const serialized = JSON.stringify(data)
    return crypto.createHash('md5').update(serialized).digest('hex')
  }
  
  private static getVersion(): string {
    // 從 package.json 讀取版本，這裡簡化為固定值
    return '1.0.0'
  }
}

// 使用範例
export async function getCachedComponentConfig(name: string) {
  const cacheKey = `component-config-${name}`
  
  // 嘗試從快取獲取
  let config = await CacheManager.get(cacheKey)
  
  if (!config) {
    // 快取未命中，從 Registry 讀取
    config = await fetchComponentConfigFromRegistry(name)
    
    if (config) {
      // 存入快取
      await CacheManager.set(cacheKey, config, 1000 * 60 * 30) // 30 分鐘
    }
  }
  
  return config
}

async function fetchComponentConfigFromRegistry(name: string) {
  // 實際的 Registry 讀取邏輯
  // 這裡簡化為 null
  return null
}
```

### Phase 2: 組件渲染效能優化 (優先級: 高)

#### 任務 2.1: D3 渲染最佳化
- **目標**: 優化 D3 渲染效能和記憶體使用
- **位置**: `registry/components/bar-chart/performance.ts`
- **需求**:

```typescript
// registry/components/bar-chart/performance.ts
import { select, Selection } from 'd3'

export interface RenderConfig {
  enableVirtualization: boolean
  batchSize: number
  animationDuration: number
  useMemoization: boolean
}

export class PerformantRenderer {
  private renderConfig: RenderConfig
  private memoCache = new Map<string, any>()
  private animationFrame: number | null = null
  
  constructor(config: Partial<RenderConfig> = {}) {
    this.renderConfig = {
      enableVirtualization: true,
      batchSize: 100,
      animationDuration: 300,
      useMemoization: true,
      ...config
    }
  }
  
  /**
   * 批次渲染大量數據
   */
  renderBars(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    data: any[],
    scales: any
  ) {
    // 如果數據量大，啟用虛擬化
    if (data.length > 1000 && this.renderConfig.enableVirtualization) {
      return this.renderVirtualizedBars(svg, data, scales)
    }
    
    // 批次渲染
    return this.renderBatchedBars(svg, data, scales)
  }
  
  private renderVirtualizedBars(svg: any, data: any[], scales: any) {
    // 只渲染可見區域的元素
    const containerHeight = +svg.attr('height')
    const barHeight = scales.y.bandwidth()
    
    const visibleStart = Math.floor(svg.node().scrollTop / barHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / barHeight) + 5, // 5 個緩衝
      data.length
    )
    
    const visibleData = data.slice(visibleStart, visibleEnd)
    
    const bars = svg
      .selectAll('.bar')
      .data(visibleData, (d: any) => d.id || d.category)
    
    bars.exit().remove()
    
    const enterBars = bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d: any) => scales.y(d.category))
      .attr('height', scales.y.bandwidth())
      .attr('width', 0)
    
    // 合併 enter 和 update
    enterBars
      .merge(bars)
      .transition()
      .duration(this.renderConfig.animationDuration)
      .attr('width', (d: any) => scales.x(d.value))
      .attr('fill', (d: any, i: number) => this.getColor(i))
  }
  
  private renderBatchedBars(svg: any, data: any[], scales: any) {
    const batchSize = this.renderConfig.batchSize
    const batches = this.chunkArray(data, batchSize)
    
    let currentBatch = 0
    
    const renderNextBatch = () => {
      if (currentBatch >= batches.length) return
      
      const batch = batches[currentBatch]
      const startIndex = currentBatch * batchSize
      
      const bars = svg
        .selectAll(`.bar-batch-${currentBatch}`)
        .data(batch)
        .enter()
        .append('rect')
        .attr('class', `bar bar-batch-${currentBatch}`)
        .attr('x', 0)
        .attr('y', (d: any) => scales.y(d.category))
        .attr('height', scales.y.bandwidth())
        .attr('width', 0)
        .attr('fill', (d: any, i: number) => this.getColor(startIndex + i))
      
      // 動畫
      bars
        .transition()
        .duration(this.renderConfig.animationDuration / batches.length)
        .attr('width', (d: any) => scales.x(d.value))
        .on('end', () => {
          currentBatch++
          
          // 使用 requestAnimationFrame 避免阻塞
          this.animationFrame = requestAnimationFrame(renderNextBatch)
        })
    }
    
    renderNextBatch()
  }
  
  /**
   * 記憶化的比例尺計算
   */
  getMemoizedScales(data: any[], dimensions: any) {
    if (!this.renderConfig.useMemoization) {
      return this.calculateScales(data, dimensions)
    }
    
    const cacheKey = this.createScaleCacheKey(data, dimensions)
    
    if (this.memoCache.has(cacheKey)) {
      return this.memoCache.get(cacheKey)
    }
    
    const scales = this.calculateScales(data, dimensions)
    this.memoCache.set(cacheKey, scales)
    
    // 限制快取大小
    if (this.memoCache.size > 50) {
      const firstKey = this.memoCache.keys().next().value
      this.memoCache.delete(firstKey)
    }
    
    return scales
  }
  
  private calculateScales(data: any[], dimensions: any) {
    // 實際的比例尺計算邏輯
    // 這裡簡化
    return {
      x: (value: number) => value * dimensions.width / 100,
      y: {
        bandwidth: () => dimensions.height / data.length,
        call: (selection: any) => selection
      }
    }
  }
  
  private createScaleCacheKey(data: any[], dimensions: any): string {
    return `${data.length}-${dimensions.width}-${dimensions.height}-${JSON.stringify(data.slice(0, 3))}`
  }
  
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
  
  private getColor(index: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return colors[index % colors.length]
  }
  
  /**
   * 清理資源
   */
  dispose() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    this.memoCache.clear()
  }
}
```

#### 任務 2.2: React 效能優化
- **目標**: 優化 React 組件的渲染效能
- **位置**: `registry/components/bar-chart/bar-chart.tsx`
- **需求**:

```typescript
// registry/components/bar-chart/bar-chart.tsx (優化版本)
import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { PerformantRenderer } from './performance'

export interface BarChartProps {
  data: any[]
  xKey?: string
  yKey?: string
  width?: number
  height?: number
  margin?: Margin
  className?: string
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

// 使用 memo 避免不必要的重渲染
export const BarChart = memo<BarChartProps>(({
  data,
  xKey = 'x',
  yKey = 'y',
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  className,
  onDataClick,
  onHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const rendererRef = useRef<PerformantRenderer>()
  
  // 初始化渲染器
  useEffect(() => {
    rendererRef.current = new PerformantRenderer({
      enableVirtualization: data.length > 1000,
      batchSize: Math.min(100, Math.ceil(data.length / 10)),
      useMemoization: true
    })
    
    return () => {
      rendererRef.current?.dispose()
    }
  }, [data.length])
  
  // 記憶化資料處理
  const processedData = useMemo(() => {
    console.time('Data Processing')
    
    const result = data
      .filter(d => d[xKey] != null && d[yKey] != null)
      .map(d => ({
        ...d,
        x: d[xKey],
        y: +d[yKey] // 確保是數字
      }))
      .sort((a, b) => b.y - a.y) // 按值排序
    
    console.timeEnd('Data Processing')
    return result
  }, [data, xKey, yKey])
  
  // 記憶化比例尺計算
  const scales = useMemo(() => {
    if (!rendererRef.current) return null
    
    console.time('Scale Calculation')
    
    const dimensions = {
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    }
    
    const result = rendererRef.current.getMemoizedScales(processedData, dimensions)
    
    console.timeEnd('Scale Calculation')
    return result
  }, [processedData, width, height, margin])
  
  // 記憶化事件處理器
  const handleDataClick = useCallback((event: MouseEvent, datum: any) => {
    event.preventDefault()
    onDataClick?.(datum)
  }, [onDataClick])
  
  const handleDataHover = useCallback((event: MouseEvent, datum: any) => {
    onHover?.(datum)
  }, [onHover])
  
  // D3 渲染效果
  useEffect(() => {
    if (!svgRef.current || !scales || !rendererRef.current) return
    
    console.time('D3 Rendering')
    
    const svg = select(svgRef.current)
    
    // 清理舊內容
    svg.selectAll('*').remove()
    
    // 創建主要組件
    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    // 渲染長條
    rendererRef.current.renderBars(chartGroup, processedData, scales)
    
    // 添加事件監聽（使用事件委託）
    chartGroup.on('click', function(event) {
      const target = event.target
      if (target.classList.contains('bar')) {
        const datum = select(target).datum()
        handleDataClick(event, datum)
      }
    })
    
    chartGroup.on('mouseover', function(event) {
      const target = event.target
      if (target.classList.contains('bar')) {
        const datum = select(target).datum()
        handleDataHover(event, datum)
      }
    })
    
    console.timeEnd('D3 Rendering')
    
  }, [processedData, scales, margin, handleDataClick, handleDataHover])
  
  return (
    <div className={`bar-chart ${className || ''}`}>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        style={{ display: 'block' }} // 避免額外的空白
      />
    </div>
  )
})

BarChart.displayName = 'BarChart'

// 自訂比較函數，提供更精確的重渲染控制
export const BarChartOptimized = memo(BarChart, (prevProps, nextProps) => {
  // 深度比較 data（如果需要）
  if (prevProps.data.length !== nextProps.data.length) {
    return false
  }
  
  // 簡單的 props 比較
  const keysToCompare: (keyof BarChartProps)[] = [
    'xKey', 'yKey', 'width', 'height', 'className'
  ]
  
  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  
  // 比較 margin 物件
  if (JSON.stringify(prevProps.margin) !== JSON.stringify(nextProps.margin)) {
    return false
  }
  
  // 如果所有關鍵 props 都相同，跳過重渲染
  return true
})

// 使用選擇器來避免不必要的計算
export function useChartData(data: any[], xKey: string, yKey: string) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data
      .filter(d => d[xKey] != null && d[yKey] != null)
      .map(d => ({
        ...d,
        x: d[xKey],
        y: +d[yKey]
      }))
  }, [data, xKey, yKey])
}

export function useChartDimensions(width: number, height: number, margin: Margin) {
  return useMemo(() => ({
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
    margin
  }), [width, height, margin])
}
```

### Phase 3: 資料處理最佳化 (優先級: 中)

#### 任務 3.1: 大資料集處理
- **目標**: 優化大資料集的處理效能
- **位置**: `registry/utils/data-processor.ts`
- **需求**:

```typescript
// registry/utils/data-processor.ts
export class DataProcessor {
  private static readonly CHUNK_SIZE = 10000 // 每次處理 10k 筆資料
  private worker?: Worker
  
  /**
   * 處理大資料集（使用 Worker）
   */
  static async processLargeDataset(
    data: any[], 
    transformFn: (chunk: any[]) => any[]
  ): Promise<any[]> {
    if (data.length < this.CHUNK_SIZE) {
      // 小資料集直接處理
      return transformFn(data)
    }
    
    // 大資料集使用 Worker
    return this.processWithWorker(data, transformFn)
  }
  
  private static async processWithWorker(
    data: any[], 
    transformFn: (chunk: any[]) => any[]
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(`
        const { parentPort } = require('worker_threads')
        
        // 將函數字串轉換為實際函數
        function createTransformFunction(fnString) {
          return new Function('return ' + fnString)()
        }
        
        parentPort.on('message', ({ data, transformFnString }) => {
          try {
            const transformFn = createTransformFunction(transformFnString)
            const chunkSize = 10000
            const results = []
            
            for (let i = 0; i < data.length; i += chunkSize) {
              const chunk = data.slice(i, i + chunkSize)
              const processedChunk = transformFn(chunk)
              results.push(...processedChunk)
              
              // 報告進度
              parentPort.postMessage({
                type: 'progress',
                progress: Math.min(100, ((i + chunkSize) / data.length) * 100)
              })
            }
            
            parentPort.postMessage({ type: 'result', data: results })
          } catch (error) {
            parentPort.postMessage({ type: 'error', error: error.message })
          }
        })
      `, { eval: true })
      
      const results: any[] = []
      
      worker.postMessage({
        data,
        transformFnString: transformFn.toString()
      })
      
      worker.on('message', (message) => {
        switch (message.type) {
          case 'progress':
            // 可以在這裡更新進度條
            break
          case 'result':
            resolve(message.data)
            worker.terminate()
            break
          case 'error':
            reject(new Error(message.error))
            worker.terminate()
            break
        }
      })
      
      worker.on('error', (error) => {
        reject(error)
        worker.terminate()
      })
    })
  }
  
  /**
   * 資料取樣（用於大資料集預覽）
   */
  static sampleData(data: any[], sampleSize: number = 1000): any[] {
    if (data.length <= sampleSize) {
      return data
    }
    
    // 分層取樣：保持資料分布
    const step = data.length / sampleSize
    const sampledData: any[] = []
    
    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(i * step)
      sampledData.push(data[index])
    }
    
    return sampledData
  }
  
  /**
   * 增量式資料處理
   */
  static async processIncremental<T, R>(
    data: T[],
    processor: (item: T, index: number) => R,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    const results: R[] = []
    const batchSize = 100
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      // 使用 requestIdleCallback 在空閒時處理
      await new Promise(resolve => {
        const processNextItem = (startIndex: number) => {
          const endIndex = Math.min(startIndex + 10, batch.length)
          
          for (let j = startIndex; j < endIndex; j++) {
            const result = processor(batch[j], i + j)
            results.push(result)
          }
          
          if (endIndex < batch.length) {
            requestIdleCallback(() => processNextItem(endIndex))
          } else {
            resolve(void 0)
          }
        }
        
        processNextItem(0)
      })
      
      // 報告進度
      const progress = ((i + batchSize) / data.length) * 100
      onProgress?.(Math.min(100, progress))
    }
    
    return results
  }
  
  /**
   * 記憶化資料轉換
   */
  private static transformCache = new Map<string, any>()
  
  static memoizedTransform<T, R>(
    data: T[],
    transformer: (data: T[]) => R,
    keyGenerator: (data: T[]) => string
  ): R {
    const cacheKey = keyGenerator(data)
    
    if (this.transformCache.has(cacheKey)) {
      return this.transformCache.get(cacheKey)
    }
    
    const result = transformer(data)
    
    // 限制快取大小
    if (this.transformCache.size > 100) {
      const firstKey = this.transformCache.keys().next().value
      this.transformCache.delete(firstKey)
    }
    
    this.transformCache.set(cacheKey, result)
    return result
  }
}

// 使用範例
export async function processChartData(rawData: any[]) {
  // 如果資料量大，先取樣預覽
  if (rawData.length > 10000) {
    const sampleData = DataProcessor.sampleData(rawData, 1000)
    console.log('使用取樣資料進行預覽:', sampleData.length, '筆')
    
    // 在背景處理完整資料
    DataProcessor.processLargeDataset(rawData, (chunk) => {
      return chunk.map(item => ({
        x: item.category,
        y: +item.value,
        originalData: item
      }))
    }).then(processedData => {
      console.log('完整資料處理完成:', processedData.length, '筆')
      // 更新圖表
    })
    
    // 先回傳取樣資料
    return sampleData.map(item => ({
      x: item.category,
      y: +item.value,
      originalData: item
    }))
  }
  
  // 小資料集直接處理
  return rawData.map(item => ({
    x: item.category,
    y: +item.value,
    originalData: item
  }))
}
```

### Phase 4: 效能監控和基準測試 (優先級: 低)

#### 任務 4.1: 效能監控系統
- **目標**: 建立效能監控和分析系統
- **位置**: `tests/performance/`
- **需求**:

```typescript
// tests/performance/performance-monitor.ts
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  cpuUsage: number
  fps: number
  dataProcessingTime: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private isMonitoring = false
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  startMonitoring() {
    this.isMonitoring = true
    this.collectMetrics()
  }
  
  stopMonitoring() {
    this.isMonitoring = false
  }
  
  private async collectMetrics() {
    if (!this.isMonitoring) return
    
    const metrics: PerformanceMetrics = {
      renderTime: this.measureRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: await this.getCPUUsage(),
      fps: this.getFPS(),
      dataProcessingTime: 0 // 會在實際處理時更新
    }
    
    this.metrics.push(metrics)
    
    // 限制記錄數量
    if (this.metrics.length > 1000) {
      this.metrics.shift()
    }
    
    // 每秒收集一次
    setTimeout(() => this.collectMetrics(), 1000)
  }
  
  private measureRenderTime(): number {
    // 使用 Performance Observer 測量渲染時間
    return performance.now()
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }
  
  private async getCPUUsage(): Promise<number> {
    // 簡化的 CPU 使用率計算
    const start = performance.now()
    await new Promise(resolve => setTimeout(resolve, 10))
    const end = performance.now()
    
    return (end - start) / 10 * 100 // 百分比
  }
  
  private getFPS(): number {
    // 使用 requestAnimationFrame 計算 FPS
    let frames = 0
    let lastTime = performance.now()
    
    const countFrames = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = frames
        frames = 0
        lastTime = currentTime
        return fps
      }
      
      requestAnimationFrame(countFrames)
      return 60 // 預設值
    }
    
    return countFrames()
  }
  
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        fps: 0,
        dataProcessingTime: 0
      }
    }
    
    const sum = this.metrics.reduce((acc, metric) => ({
      renderTime: acc.renderTime + metric.renderTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      fps: acc.fps + metric.fps,
      dataProcessingTime: acc.dataProcessingTime + metric.dataProcessingTime
    }))
    
    const count = this.metrics.length
    
    return {
      renderTime: sum.renderTime / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      fps: sum.fps / count,
      dataProcessingTime: sum.dataProcessingTime / count
    }
  }
  
  generateReport(): string {
    const avg = this.getAverageMetrics()
    
    return `效能報告:
==========
平均渲染時間: ${avg.renderTime.toFixed(2)}ms
平均記憶體使用: ${avg.memoryUsage.toFixed(2)}MB
平均 CPU 使用率: ${avg.cpuUsage.toFixed(2)}%
平均 FPS: ${avg.fps.toFixed(0)}
平均資料處理時間: ${avg.dataProcessingTime.toFixed(2)}ms

收集樣本數: ${this.metrics.length}
監控期間: ${this.isMonitoring ? '監控中' : '已停止'}
`
  }
}

// 效能測試套件
export class PerformanceBenchmark {
  static async runChartBenchmark(dataSize: number): Promise<PerformanceMetrics> {
    const testData = this.generateTestData(dataSize)
    const monitor = PerformanceMonitor.getInstance()
    
    monitor.startMonitoring()
    
    const startTime = performance.now()
    
    // 模擬圖表渲染
    await this.simulateChartRender(testData)
    
    const endTime = performance.now()
    
    monitor.stopMonitoring()
    
    const metrics = monitor.getAverageMetrics()
    metrics.renderTime = endTime - startTime
    
    return metrics
  }
  
  private static generateTestData(size: number): any[] {
    return Array.from({ length: size }, (_, i) => ({
      category: `Category ${i}`,
      value: Math.random() * 100,
      id: i
    }))
  }
  
  private static async simulateChartRender(data: any[]): Promise<void> {
    // 模擬資料處理
    const processedData = data.map(d => ({
      x: d.category,
      y: d.value
    }))
    
    // 模擬 D3 渲染（CPU 密集操作）
    for (let i = 0; i < processedData.length; i++) {
      // 模擬 DOM 操作
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }
}
```

#### 任務 4.2: 基準測試腳本
- **目標**: 建立自動化基準測試
- **位置**: `scripts/benchmark.js`
- **需求**:

```javascript
#!/usr/bin/env node
// scripts/benchmark.js

const { PerformanceBenchmark } = require('../tests/performance/performance-monitor')
const fs = require('fs-extra')
const path = require('path')

class BenchmarkRunner {
  constructor() {
    this.results = []
  }
  
  async runAllBenchmarks() {
    console.log('🚀 開始效能基準測試...\n')
    
    const testSizes = [100, 500, 1000, 5000, 10000]
    
    for (const size of testSizes) {
      console.log(`📊 測試資料量: ${size}`)
      
      const metrics = await PerformanceBenchmark.runChartBenchmark(size)
      
      this.results.push({
        dataSize: size,
        ...metrics,
        timestamp: new Date().toISOString()
      })
      
      console.log(`   渲染時間: ${metrics.renderTime.toFixed(2)}ms`)
      console.log(`   記憶體使用: ${metrics.memoryUsage.toFixed(2)}MB`)
      console.log(`   FPS: ${metrics.fps.toFixed(0)}`)
      console.log()
    }
    
    await this.generateReport()
    await this.checkPerformanceRegression()
  }
  
  async generateReport() {
    const reportPath = path.join(__dirname, '../performance-report.json')
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.calculateSummary()
    }
    
    await fs.writeJSON(reportPath, report, { spaces: 2 })
    
    console.log('📋 效能報告已生成:', reportPath)
    
    // 也生成 Markdown 報告
    await this.generateMarkdownReport(report)
  }
  
  calculateSummary() {
    const totalTests = this.results.length
    const avgRenderTime = this.results.reduce((sum, r) => sum + r.renderTime, 0) / totalTests
    const avgMemoryUsage = this.results.reduce((sum, r) => sum + r.memoryUsage, 0) / totalTests
    const avgFPS = this.results.reduce((sum, r) => sum + r.fps, 0) / totalTests
    
    return {
      totalTests,
      averageRenderTime: avgRenderTime,
      averageMemoryUsage: avgMemoryUsage,
      averageFPS: avgFPS,
      performanceGrade: this.calculateGrade(avgRenderTime, avgMemoryUsage, avgFPS)
    }
  }
  
  calculateGrade(renderTime, memoryUsage, fps) {
    let score = 100
    
    // 渲染時間評分 (< 100ms = 滿分)
    if (renderTime > 100) score -= Math.min(30, (renderTime - 100) / 10)
    
    // 記憶體使用評分 (< 50MB = 滿分)
    if (memoryUsage > 50) score -= Math.min(30, (memoryUsage - 50) / 5)
    
    // FPS 評分 (> 30 = 滿分)
    if (fps < 30) score -= Math.min(40, (30 - fps) * 2)
    
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    return 'D'
  }
  
  async generateMarkdownReport(report) {
    const markdown = `# 效能基準測試報告

**生成時間**: ${report.timestamp}
**總評級**: ${report.summary.performanceGrade}

## 測試摘要

- **測試次數**: ${report.summary.totalTests}
- **平均渲染時間**: ${report.summary.averageRenderTime.toFixed(2)}ms
- **平均記憶體使用**: ${report.summary.averageMemoryUsage.toFixed(2)}MB
- **平均 FPS**: ${report.summary.averageFPS.toFixed(0)}

## 詳細結果

| 資料量 | 渲染時間 (ms) | 記憶體 (MB) | FPS | CPU 使用率 (%) |
|-------|--------------|------------|-----|----------------|
${report.results.map(r => 
  `| ${r.dataSize} | ${r.renderTime.toFixed(2)} | ${r.memoryUsage.toFixed(2)} | ${r.fps.toFixed(0)} | ${r.cpuUsage.toFixed(2)} |`
).join('\n')}

## 效能建議

${this.generateRecommendations(report.summary)}
`
    
    const markdownPath = path.join(__dirname, '../docs/performance-report.md')
    await fs.writeFile(markdownPath, markdown)
    
    console.log('📄 Markdown 報告已生成:', markdownPath)
  }
  
  generateRecommendations(summary) {
    const recommendations = []
    
    if (summary.averageRenderTime > 100) {
      recommendations.push('- 🐌 **渲染時間偏高**: 考慮實作虛擬化或資料取樣')
    }
    
    if (summary.averageMemoryUsage > 50) {
      recommendations.push('- 🧠 **記憶體使用偏高**: 檢查是否有記憶體洩漏或考慮實作資料清理')
    }
    
    if (summary.averageFPS < 30) {
      recommendations.push('- 🎬 **FPS 偏低**: 優化動畫或減少同時渲染的元素數量')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- ✅ **效能表現良好**: 繼續保持當前的實作品質')
    }
    
    return recommendations.join('\n')
  }
  
  async checkPerformanceRegression() {
    const historyPath = path.join(__dirname, '../performance-history.json')
    
    let history = []
    if (await fs.pathExists(historyPath)) {
      history = await fs.readJSON(historyPath)
    }
    
    // 添加當前結果到歷史
    history.push({
      timestamp: new Date().toISOString(),
      summary: this.calculateSummary()
    })
    
    // 保留最近 10 次記錄
    if (history.length > 10) {
      history = history.slice(-10)
    }
    
    await fs.writeJSON(historyPath, history, { spaces: 2 })
    
    // 檢查效能回歸
    if (history.length > 1) {
      const current = history[history.length - 1].summary
      const previous = history[history.length - 2].summary
      
      const renderTimeRegression = ((current.averageRenderTime - previous.averageRenderTime) / previous.averageRenderTime) * 100
      const memoryRegression = ((current.averageMemoryUsage - previous.averageMemoryUsage) / previous.averageMemoryUsage) * 100
      
      if (renderTimeRegression > 20) {
        console.warn(`⚠️  效能回歸警告: 渲染時間增加了 ${renderTimeRegression.toFixed(1)}%`)
      }
      
      if (memoryRegression > 20) {
        console.warn(`⚠️  效能回歸警告: 記憶體使用增加了 ${memoryRegression.toFixed(1)}%`)
      }
    }
  }
}

// 執行基準測試
if (require.main === module) {
  const runner = new BenchmarkRunner()
  runner.runAllBenchmarks().catch(console.error)
}

module.exports = BenchmarkRunner
```

## 執行檢查清單

### Phase 1 完成標準
- [ ] CLI 啟動時間 < 500ms
- [ ] 檔案操作效能優化完成
- [ ] 快取機制實作並運作正常
- [ ] 記憶體使用量合理控制

### Phase 2 完成標準
- [ ] 大資料集渲染效能提升 > 50%
- [ ] React 組件重渲染次數減少
- [ ] D3 渲染批次化實作完成
- [ ] 記憶化策略有效運作

### Phase 3 完成標準
- [ ] 大資料集處理使用 Worker
- [ ] 資料取樣機制實作完成
- [ ] 增量處理避免阻塞 UI
- [ ] 記憶化快取命中率 > 80%

### Phase 4 完成標準
- [ ] 效能監控系統運作正常
- [ ] 基準測試可自動執行
- [ ] 效能回歸檢測有效
- [ ] 效能報告自動生成

## 成功指標

### 效能目標
- **CLI 啟動時間**: < 500ms
- **圖表渲染時間**: < 100ms (1000 個資料點)
- **記憶體使用**: < 50MB (正常使用)
- **FPS**: > 30 (動畫期間)

### 使用者體驗目標
- **互動響應時間**: < 16ms
- **資料載入感知**: < 2 秒
- **大資料集處理**: 支援 100k+ 資料點
- **記憶體洩漏**: 0 個已知洩漏

### 開發體驗目標
- **建構時間**: < 30 秒
- **熱重載時間**: < 3 秒
- **測試執行時間**: < 2 分鐘
- **效能監控覆蓋率**: 100%

## 維護策略

1. **定期基準測試**: 每次 PR 都執行基準測試
2. **效能回歸監控**: 設置效能回歸警報
3. **程式碼審查**: 效能相關變更需要特別審查
4. **使用者反饋**: 收集真實使用環境的效能數據

## 後續優化方向

完成基礎效能優化後，可進一步考慮：
- WebGL 渲染支援（大量資料點）
- Web Workers 池管理
- 預測式快取策略
- 自適應效能調整（根據設備能力）