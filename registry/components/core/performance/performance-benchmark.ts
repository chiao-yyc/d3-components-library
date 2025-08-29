/**
 * 性能基準測試工具
 * 用於測試和驗證 Canvas Fallback 系統效果
 */

export interface BenchmarkResult {
  testName: string;
  dataSize: number;
  renderMode: 'svg' | 'canvas';
  renderTime: number;        // 毫秒
  memoryUsage: number;       // MB
  fps: number;               // 幀數
  success: boolean;
  error?: string;
}

export interface BenchmarkSuite {
  testName: string;
  dataSizes: number[];
  iterations: number;
  warmupRounds: number;
}

/**
 * 性能基準測試器
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  
  /**
   * 執行完整的基準測試套件
   */
  async runBenchmarkSuite(
    suite: BenchmarkSuite,
    renderFunction: (data: any[], mode: 'svg' | 'canvas') => Promise<number>
  ): Promise<BenchmarkResult[]> {
    console.log(`🚀 開始執行基準測試: ${suite.testName}`);
    
    this.results = [];
    
    for (const dataSize of suite.dataSizes) {
      console.log(`📊 測試數據規模: ${dataSize.toLocaleString()} 點`);
      
      // 生成測試數據
      const testData = this.generateTestData(dataSize);
      
      // 測試 SVG 模式
      const svgResult = await this.runSingleBenchmark(
        `${suite.testName} - SVG`,
        testData,
        'svg',
        renderFunction,
        suite.iterations,
        suite.warmupRounds
      );
      this.results.push(svgResult);
      
      // 測試 Canvas 模式
      const canvasResult = await this.runSingleBenchmark(
        `${suite.testName} - Canvas`,
        testData,
        'canvas',
        renderFunction,
        suite.iterations,
        suite.warmupRounds
      );
      this.results.push(canvasResult);
      
      // 輸出對比結果
      this.logComparison(svgResult, canvasResult);
    }
    
    console.log(`✅ 基準測試完成，共 ${this.results.length} 個測試`);
    return this.results;
  }
  
  /**
   * 執行單個基準測試
   */
  private async runSingleBenchmark(
    testName: string,
    data: any[],
    mode: 'svg' | 'canvas',
    renderFunction: (data: any[], mode: 'svg' | 'canvas') => Promise<number>,
    iterations: number,
    warmupRounds: number
  ): Promise<BenchmarkResult> {
    const startMemory = this.getMemoryUsage();
    
    try {
      // 預熱輪次
      for (let i = 0; i < warmupRounds; i++) {
        await renderFunction(data.slice(0, Math.min(100, data.length)), mode);
      }
      
      // 實際測試輪次
      const renderTimes: number[] = [];
      const fpsValues: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        try {
          await renderFunction(data, mode);
          const renderTime = performance.now() - startTime;
          renderTimes.push(renderTime);
          
          // 估算 FPS
          const fps = renderTime > 0 ? Math.min(60, 1000 / renderTime) : 60;
          fpsValues.push(fps);
          
        } catch (error) {
          console.error(`❌ 渲染失敗 (${mode}):`, error);
          throw error;
        }
        
        // 避免阻塞主線程
        if (i < iterations - 1) {
          await this.delay(10);
        }
      }
      
      const endMemory = this.getMemoryUsage();
      
      // 計算平均值
      const avgRenderTime = renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length;
      const avgFPS = fpsValues.reduce((sum, f) => sum + f, 0) / fpsValues.length;
      const memoryDelta = Math.max(0, endMemory - startMemory);
      
      return {
        testName,
        dataSize: data.length,
        renderMode: mode,
        renderTime: avgRenderTime,
        memoryUsage: memoryDelta,
        fps: avgFPS,
        success: true
      };
      
    } catch (error) {
      return {
        testName,
        dataSize: data.length,
        renderMode: mode,
        renderTime: 0,
        memoryUsage: 0,
        fps: 0,
        success: false,
        error: String(error)
      };
    }
  }
  
  /**
   * 生成測試數據
   */
  private generateTestData(count: number): Array<{x: number, y: number, size: number, color: number}> {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: Math.random() * 100,
        y: Math.random() * 100 + Math.sin(i * 0.01) * 10,
        size: Math.random() * 5 + 2,
        color: i % 5
      });
    }
    return data;
  }
  
  /**
   * 記憶體使用量檢測
   */
  private getMemoryUsage(): number {
    // @ts-ignore
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }
  
  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 輸出對比結果
   */
  private logComparison(svgResult: BenchmarkResult, canvasResult: BenchmarkResult): void {
    const dataSize = svgResult.dataSize.toLocaleString();
    
    console.log(`\n📈 ${dataSize} 數據點性能對比:`);
    console.log(`  SVG 模式:    ${svgResult.renderTime.toFixed(1)}ms | ${svgResult.memoryUsage.toFixed(1)}MB | ${svgResult.fps.toFixed(1)}fps`);
    console.log(`  Canvas 模式: ${canvasResult.renderTime.toFixed(1)}ms | ${canvasResult.memoryUsage.toFixed(1)}MB | ${canvasResult.fps.toFixed(1)}fps`);
    
    if (svgResult.success && canvasResult.success) {
      const speedImprovement = svgResult.renderTime / canvasResult.renderTime;
      const memoryImprovement = svgResult.memoryUsage / canvasResult.memoryUsage;
      
      console.log(`  性能提升:    ${speedImprovement.toFixed(1)}x 速度 | ${memoryImprovement.toFixed(1)}x 記憶體效率`);
      
      if (speedImprovement > 2) {
        console.log(`  🚀 Canvas 模式顯著優於 SVG！`);
      } else if (speedImprovement < 0.8) {
        console.log(`  📊 SVG 模式在此數據量下表現更佳`);
      }
    }
    console.log('');
  }
  
  /**
   * 獲取測試報告
   */
  public getDetailedReport(): string {
    if (this.results.length === 0) {
      return '無測試結果';
    }
    
    const successfulResults = this.results.filter(r => r.success);
    const failedResults = this.results.filter(r => !r.success);
    
    let report = `📊 Canvas Fallback 性能測試報告\n`;
    report += `==================================\n\n`;
    
    report += `✅ 成功測試: ${successfulResults.length}/${this.results.length}\n`;
    if (failedResults.length > 0) {
      report += `❌ 失敗測試: ${failedResults.length}\n`;
    }
    report += `\n`;
    
    // 按數據大小分組
    const groupedResults = new Map<number, BenchmarkResult[]>();
    successfulResults.forEach(result => {
      if (!groupedResults.has(result.dataSize)) {
        groupedResults.set(result.dataSize, []);
      }
      groupedResults.get(result.dataSize)!.push(result);
    });
    
    // 生成對比報告
    Array.from(groupedResults.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([dataSize, results]) => {
        const svgResult = results.find(r => r.renderMode === 'svg');
        const canvasResult = results.find(r => r.renderMode === 'canvas');
        
        report += `📈 ${dataSize.toLocaleString()} 數據點:\n`;
        
        if (svgResult && canvasResult) {
          const speedRatio = svgResult.renderTime / canvasResult.renderTime;
          const memoryRatio = svgResult.memoryUsage / canvasResult.memoryUsage;
          
          report += `  渲染時間: SVG ${svgResult.renderTime.toFixed(1)}ms → Canvas ${canvasResult.renderTime.toFixed(1)}ms (${speedRatio.toFixed(1)}x)\n`;
          report += `  記憶體用量: SVG ${svgResult.memoryUsage.toFixed(1)}MB → Canvas ${canvasResult.memoryUsage.toFixed(1)}MB (${memoryRatio.toFixed(1)}x)\n`;
          report += `  幀率: SVG ${svgResult.fps.toFixed(1)}fps → Canvas ${canvasResult.fps.toFixed(1)}fps\n`;
          
          const recommendation = this.getRecommendation(dataSize, speedRatio, memoryRatio);
          report += `  建議: ${recommendation}\n`;
        }
        
        report += `\n`;
      });
    
    // 失敗的測試
    if (failedResults.length > 0) {
      report += `❌ 失敗的測試:\n`;
      failedResults.forEach(result => {
        report += `  - ${result.testName} (${result.dataSize.toLocaleString()} 點): ${result.error}\n`;
      });
    }
    
    return report;
  }
  
  /**
   * 根據測試結果提供建議
   */
  private getRecommendation(dataSize: number, speedRatio: number, memoryRatio: number): string {
    if (dataSize < 1000) {
      return '🎨 建議使用 SVG（保持互動性）';
    } else if (dataSize < 10000) {
      if (speedRatio > 1.5) {
        return '⚡ 建議使用 Canvas（性能提升明顯）';
      } else {
        return '🎨 可使用 SVG（性能差異不大）';
      }
    } else {
      if (speedRatio > 2 || memoryRatio > 2) {
        return '🚀 強烈建議使用 Canvas（大幅性能提升）';
      } else {
        return '⚡ 建議使用 Canvas（處理大數據集）';
      }
    }
  }
  
  /**
   * 導出結果為 CSV
   */
  public exportToCSV(): string {
    const headers = ['測試名稱', '數據大小', '渲染模式', '渲染時間(ms)', '記憶體使用(MB)', 'FPS', '成功', '錯誤'];
    
    const rows = this.results.map(result => [
      result.testName,
      result.dataSize.toString(),
      result.renderMode,
      result.renderTime.toFixed(2),
      result.memoryUsage.toFixed(2),
      result.fps.toFixed(1),
      result.success ? 'true' : 'false',
      result.error || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// 預設測試套件
export const DEFAULT_BENCHMARK_SUITES: BenchmarkSuite[] = [
  {
    testName: 'ScatterPlot 基準測試',
    dataSizes: [100, 1000, 5000, 10000, 25000, 50000],
    iterations: 3,
    warmupRounds: 2
  },
  {
    testName: 'ScatterPlot 壓力測試',
    dataSizes: [75000, 100000],
    iterations: 2,
    warmupRounds: 1
  }
];

/**
 * 快速性能測試
 */
export async function quickPerformanceTest(): Promise<void> {
  const benchmark = new PerformanceBenchmark();
  
  console.log('🔬 開始快速性能測試...');
  
  // 模擬渲染函數
  const mockRenderFunction = async (data: any[], mode: 'svg' | 'canvas'): Promise<number> => {
    const baseTime = mode === 'canvas' ? 1 : 10; // Canvas 基礎更快
    const complexity = data.length * (mode === 'canvas' ? 0.001 : 0.01);
    const renderTime = baseTime + complexity + Math.random() * 5;
    
    // 模擬渲染時間
    await new Promise(resolve => setTimeout(resolve, Math.min(renderTime, 100)));
    
    return renderTime;
  };
  
  const results = await benchmark.runBenchmarkSuite(
    {
      testName: '快速測試',
      dataSizes: [1000, 5000, 15000],
      iterations: 2,
      warmupRounds: 1
    },
    mockRenderFunction
  );
  
  console.log(benchmark.getDetailedReport());
}