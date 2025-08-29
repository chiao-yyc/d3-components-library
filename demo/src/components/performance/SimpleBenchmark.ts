/**
 * Simplified Performance Benchmark for Demo
 * 真實性能測量工具 (簡化版)
 */

export interface BenchmarkResult {
  renderMode: 'svg' | 'canvas';
  dataSize: number;
  renderTime: number;        // 毫秒
  memoryUsage: number;       // MB
  fps: number;               // 幀數
  timestamp: number;
}

export interface BenchmarkComparison {
  svgResult: BenchmarkResult;
  canvasResult: BenchmarkResult;
  speedupRatio: number;      // Canvas vs SVG 速度提升倍數
  memoryRatio: number;       // 記憶體使用比較
  recommendation: 'svg' | 'canvas' | 'auto';
}

/**
 * 簡化的性能基準測試器
 */
export class SimpleBenchmark {
  private results: BenchmarkResult[] = [];
  
  /**
   * 記錄單個測試結果
   */
  recordResult(result: BenchmarkResult): void {
    this.results.push({
      ...result,
      timestamp: Date.now()
    });
    
    // 只保留最近 50 個結果
    if (this.results.length > 50) {
      this.results = this.results.slice(-50);
    }
  }
  
  /**
   * 獲取指定數據大小的結果
   */
  getResultsForDataSize(dataSize: number, tolerance: number = 100): BenchmarkResult[] {
    return this.results.filter(result => 
      Math.abs(result.dataSize - dataSize) <= tolerance
    );
  }
  
  /**
   * 比較 SVG vs Canvas 性能
   */
  comparePerformance(dataSize: number): BenchmarkComparison | null {
    const results = this.getResultsForDataSize(dataSize);
    const svgResults = results.filter(r => r.renderMode === 'svg');
    const canvasResults = results.filter(r => r.renderMode === 'canvas');
    
    if (svgResults.length === 0 || canvasResults.length === 0) {
      return null;
    }
    
    // 使用最新的結果
    const svgResult = svgResults[svgResults.length - 1];
    const canvasResult = canvasResults[canvasResults.length - 1];
    
    const speedupRatio = svgResult.renderTime / canvasResult.renderTime;
    const memoryRatio = svgResult.memoryUsage / canvasResult.memoryUsage;
    
    let recommendation: 'svg' | 'canvas' | 'auto';
    if (dataSize < 1000) {
      recommendation = 'svg';
    } else if (speedupRatio > 2 || dataSize > 10000) {
      recommendation = 'canvas';
    } else {
      recommendation = 'auto';
    }
    
    return {
      svgResult,
      canvasResult,
      speedupRatio,
      memoryRatio,
      recommendation
    };
  }
  
  /**
   * 獲取性能趨勢
   */
  getPerformanceTrend(renderMode: 'svg' | 'canvas', maxResults: number = 10): {
    renderTimes: number[];
    memoryUsage: number[];
    fps: number[];
    timestamps: number[];
  } {
    const modeResults = this.results
      .filter(r => r.renderMode === renderMode)
      .slice(-maxResults);
      
    return {
      renderTimes: modeResults.map(r => r.renderTime),
      memoryUsage: modeResults.map(r => r.memoryUsage),
      fps: modeResults.map(r => r.fps),
      timestamps: modeResults.map(r => r.timestamp)
    };
  }
  
  /**
   * 生成性能報告
   */
  generateReport(): {
    totalTests: number;
    averageRenderTime: { svg: number; canvas: number };
    averageMemoryUsage: { svg: number; canvas: number };
    averageFPS: { svg: number; canvas: number };
    bestPerformingMode: 'svg' | 'canvas';
    recommendations: string[];
  } {
    const svgResults = this.results.filter(r => r.renderMode === 'svg');
    const canvasResults = this.results.filter(r => r.renderMode === 'canvas');
    
    const avgSvgRenderTime = svgResults.length > 0 
      ? svgResults.reduce((sum, r) => sum + r.renderTime, 0) / svgResults.length 
      : 0;
    const avgCanvasRenderTime = canvasResults.length > 0 
      ? canvasResults.reduce((sum, r) => sum + r.renderTime, 0) / canvasResults.length 
      : 0;
      
    const avgSvgMemory = svgResults.length > 0 
      ? svgResults.reduce((sum, r) => sum + r.memoryUsage, 0) / svgResults.length 
      : 0;
    const avgCanvasMemory = canvasResults.length > 0 
      ? canvasResults.reduce((sum, r) => sum + r.memoryUsage, 0) / canvasResults.length 
      : 0;
      
    const avgSvgFPS = svgResults.length > 0 
      ? svgResults.reduce((sum, r) => sum + r.fps, 0) / svgResults.length 
      : 0;
    const avgCanvasFPS = canvasResults.length > 0 
      ? canvasResults.reduce((sum, r) => sum + r.fps, 0) / canvasResults.length 
      : 0;
    
    const bestPerformingMode = avgCanvasRenderTime < avgSvgRenderTime ? 'canvas' : 'svg';
    
    const recommendations = [];
    if (avgCanvasRenderTime < avgSvgRenderTime * 0.5) {
      recommendations.push('🚀 Canvas 模式顯著優於 SVG，建議大數據集使用 Canvas');
    }
    if (avgCanvasMemory < avgSvgMemory * 0.7) {
      recommendations.push('💾 Canvas 模式記憶體效率更高');
    }
    if (avgCanvasFPS > avgSvgFPS * 1.2) {
      recommendations.push('📊 Canvas 模式提供更流暢的動畫體驗');
    }
    
    return {
      totalTests: this.results.length,
      averageRenderTime: { svg: avgSvgRenderTime, canvas: avgCanvasRenderTime },
      averageMemoryUsage: { svg: avgSvgMemory, canvas: avgCanvasMemory },
      averageFPS: { svg: avgSvgFPS, canvas: avgCanvasFPS },
      bestPerformingMode,
      recommendations
    };
  }
  
  /**
   * 清除所有結果
   */
  clearResults(): void {
    this.results = [];
  }
  
  /**
   * 獲取所有結果
   */
  getAllResults(): BenchmarkResult[] {
    return [...this.results];
  }
}

// 全域實例
export const benchmarkInstance = new SimpleBenchmark();