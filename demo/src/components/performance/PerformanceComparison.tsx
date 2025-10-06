/**
 * Performance Comparison Component
 * 顯示真實的 SVG vs Canvas 性能對比
 */

import React, { useState, useEffect, useMemo } from 'react';
import { benchmarkInstance, BenchmarkComparison } from './SimpleBenchmark';
import {
  ChartBarIcon,
  FunnelIcon,
  BoltIcon,
  PaintBrushIcon,
  ChartPieIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export interface PerformanceComparisonProps {
  currentDataSize: number;
  className?: string;
}

export function PerformanceComparison({ 
  currentDataSize, 
  className = '' 
}: PerformanceComparisonProps) {
  const [comparison, setComparison] = useState<BenchmarkComparison | null>(null);
  const [report, setReport] = useState<any>(null);

  // 監聽 benchmark 數據變化
  useEffect(() => {
    const updateComparison = () => {
      const newComparison = benchmarkInstance.comparePerformance(currentDataSize);
      const newReport = benchmarkInstance.generateReport();
      
      setComparison(newComparison);
      setReport(newReport);
    };

    // 立即更新
    updateComparison();
    
    // 每秒檢查一次更新
    const interval = setInterval(updateComparison, 1000);
    
    return () => clearInterval(interval);
  }, [currentDataSize]);

  // 性能改善指標
  const improvementMetrics = useMemo(() => {
    if (!comparison) return null;

    const { speedupRatio, memoryRatio, svgResult, canvasResult } = comparison;
    
    return {
      renderTimeImprovement: ((speedupRatio - 1) * 100).toFixed(0),
      memoryImprovement: ((memoryRatio - 1) * 100).toFixed(0),
      fpsImprovement: ((canvasResult.fps / svgResult.fps - 1) * 100).toFixed(0),
      isSignificantSpeedup: speedupRatio > 2,
      isSignificantMemorySaving: memoryRatio > 1.5
    };
  }, [comparison]);

  if (!comparison && !report) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="flex justify-center mb-2">
            <ChartBarIcon className="w-8 h-8" />
          </div>
          <p>累積測試數據中...</p>
          <p className="text-sm mt-1">請切換不同的渲染模式以收集比較數據</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SVG vs Canvas 直接對比 */}
      {comparison && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            SVG vs Canvas 性能對比
            <span className="ml-2 text-sm text-gray-500">
              ({currentDataSize.toLocaleString()} 數據點)
            </span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                SVG 模式
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>{comparison.svgResult.renderTime.toFixed(1)}ms</div>
                <div>{comparison.svgResult.memoryUsage.toFixed(1)}MB</div>
                <div>{comparison.svgResult.fps.toFixed(1)}fps</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                Canvas 模式
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>{comparison.canvasResult.renderTime.toFixed(1)}ms</div>
                <div>{comparison.canvasResult.memoryUsage.toFixed(1)}MB</div>
                <div>{comparison.canvasResult.fps.toFixed(1)}fps</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                性能提升
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>{comparison.speedupRatio.toFixed(1)}x 速度</div>
                <div>{comparison.memoryRatio.toFixed(1)}x 記憶體</div>
                <div className="text-green-600 font-medium">
                  {improvementMetrics?.renderTimeImprovement}% ↑
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                推薦模式
              </div>
              <div className="text-sm">
                {comparison.recommendation === 'canvas' ? (
                  <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                    <BoltIcon className="w-4 h-4" /> Canvas
                  </span>
                ) : comparison.recommendation === 'svg' ? (
                  <span className="text-blue-600 font-medium flex items-center justify-center gap-1">
                    <PaintBrushIcon className="w-4 h-4" /> SVG
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center justify-center gap-1">
                    <ChartPieIcon className="w-4 h-4" /> Auto
                  </span>
                )}
              </div>
              {improvementMetrics?.isSignificantSpeedup && (
                <div className="text-xs text-green-600 mt-1">顯著提升</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 總體性能報告 */}
      {report && report.totalTests > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            總體性能報告 ({report.totalTests} 次測試)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">平均渲染時間</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">SVG:</span>
                  <span>{report.averageRenderTime.svg.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Canvas:</span>
                  <span>{report.averageRenderTime.canvas.toFixed(1)}ms</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">平均記憶體使用</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">SVG:</span>
                  <span>{report.averageMemoryUsage.svg.toFixed(1)}MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Canvas:</span>
                  <span>{report.averageMemoryUsage.canvas.toFixed(1)}MB</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">平均 FPS</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">SVG:</span>
                  <span>{report.averageFPS.svg.toFixed(1)}fps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Canvas:</span>
                  <span>{report.averageFPS.canvas.toFixed(1)}fps</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 智能建議 */}
          {report.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5" />
                智能建議
              </h4>
              <div className="space-y-1">
                {report.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-sm text-gray-600">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PerformanceComparison;