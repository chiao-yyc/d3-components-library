/**
 * useBaseChart Hook - 統一的圖表 Hook
 * 取代類別繼承模式，提供現代化的 React hooks 介面
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { BaseChartCore } from './core/base-chart-core';
import type { BaseChartCoreConfig, ChartStateCallbacks } from './core';

export interface UseBaseChartOptions<TData = unknown> extends BaseChartCoreConfig<TData> {
  onError?: (error: Error) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onTooltipShow?: (x: number, y: number, content: unknown) => void;
  onTooltipHide?: () => void;
}

export interface UseBaseChartReturn<TCore extends BaseChartCore = BaseChartCore> {
  containerRef: React.RefObject<HTMLDivElement>;
  svgRef: React.RefObject<SVGSVGElement>;
  chartInstance: TCore | null;
  isLoading: boolean;
  error: Error | null;
  tooltip: {
    x: number;
    y: number;
    content: any;
    visible: boolean;
  } | null;
}

/**
 * 通用的 useBaseChart hook
 * 適用於所有繼承 BaseChartCore 的圖表組件
 */
export function useBaseChart<TCore extends BaseChartCore>(
  ChartCoreClass: new (config: BaseChartCoreConfig, callbacks: ChartStateCallbacks) => TCore,
  options: UseBaseChartOptions
): UseBaseChartReturn<TCore> {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: any;
    visible: boolean;
  } | null>(null);

  // 創建狀態回調
  const callbacks: ChartStateCallbacks = useMemo(() => ({
    onError: (err: Error) => {
      setError(err);
      options.onError?.(err);
    },
    onLoadingChange: (loading: boolean) => {
      setIsLoading(loading);
      options.onLoadingChange?.(loading);
    },
    onTooltipShow: (x: number, y: number, content: any) => {
      setTooltip({ x, y, content, visible: true });
      options.onTooltipShow?.(x, y, content);
    },
    onTooltipHide: () => {
      setTooltip(null);
      options.onTooltipHide?.();
    }
  }), [
    options.onError,
    options.onLoadingChange, 
    options.onTooltipShow,
    options.onTooltipHide
  ]);

  // 創建圖表核心實例
  const chartInstance = useMemo(() => {
    try {
      return new ChartCoreClass(options, callbacks);
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [ChartCoreClass, callbacks]);

  // 初始化圖表
  useEffect(() => {
    if (chartInstance && containerRef.current && svgRef.current) {
      try {
        chartInstance.initialize(containerRef.current, svgRef.current);
      } catch (err) {
        setError(err as Error);
      }
    }
  }, [chartInstance]);

  // 響應配置變化
  useEffect(() => {
    if (chartInstance) {
      try {
        chartInstance.updateConfig(options);
      } catch (err) {
        setError(err as Error);
      }
    }
  }, [chartInstance, options]);

  // 清理
  useEffect(() => {
    return () => {
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (err) {
          console.warn('Error during chart cleanup:', err);
        }
      }
    };
  }, [chartInstance]);

  return {
    containerRef,
    svgRef,
    chartInstance,
    isLoading,
    error,
    tooltip
  };
}

/**
 * 專用的 hook 工廠函數
 * 為特定圖表類型創建專用 hook
 */
export function createChartHook<TCore extends BaseChartCore>(
  ChartCoreClass: new (config: BaseChartCoreConfig, callbacks: ChartStateCallbacks) => TCore
) {
  return function useChart(options: UseBaseChartOptions): UseBaseChartReturn<TCore> {
    return useBaseChart(ChartCoreClass, options);
  };
}