/**
 * React 圖表包裝層
 * 負責將純 JS/TS 的圖表核心包裝成 React 組件
 * 核心邏輯完全在 BaseChartCore 中實現
 */

import React, { ReactNode, useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '../../../utils/cn';
import { BaseChartCore, BaseChartCoreConfig, ChartStateCallbacks } from './core';

// React 專用的擴展 props
export interface ReactChartWrapperProps extends BaseChartCoreConfig {
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  showTooltip?: boolean;
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

// React 狀態接口
interface ReactChartState {
  tooltip: {
    x: number;
    y: number;
    content: ReactNode;
    visible: boolean;
  } | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * 創建 React 圖表組件的工廠函數
 * 接收純 JS/TS 圖表核心類，返回 React 組件
 */
export function createReactChartWrapper<TProps extends ReactChartWrapperProps>(
  ChartCoreClass: new (config: BaseChartCoreConfig, callbacks: ChartStateCallbacks) => BaseChartCore
) {
  return React.forwardRef<BaseChartCore, TProps>((props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [state, setState] = useState<ReactChartState>({
      tooltip: null,
      isLoading: false,
      error: null
    });

    // 創建狀態回調函數
    const callbacks: ChartStateCallbacks = useMemo(() => ({
      onError: (error: Error) => {
        setState(prev => ({ ...prev, error }));
        props.onError?.(error);
      },
      onLoadingChange: (isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
      },
      onTooltipShow: (x: number, y: number, content: any) => {
        setState(prev => ({ ...prev, tooltip: { x, y, content, visible: true } }));
      },
      onTooltipHide: () => {
        setState(prev => ({ ...prev, tooltip: null }));
      }
    }), [props.onError]);

    // 創建圖表核心實例
    const chartInstance = useMemo(() => {
      try {
        return new ChartCoreClass(props, callbacks);
      } catch (error) {
        console.error('Failed to create chart instance:', error);
        return null;
      }
    }, [ChartCoreClass, callbacks]);

    // 暴露實例給 ref
    React.useImperativeHandle(ref, () => chartInstance, [chartInstance]);

    // 初始化邏輯 - 確保 DOM 準備好後才初始化
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (containerRef.current && svgRef.current && chartInstance) {
          try {
            chartInstance.initialize(containerRef.current, svgRef.current);
          } catch (error) {
            console.error('Chart initialization failed:', error);
          }
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }, [chartInstance]);

    // 響應 props 變化
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (containerRef.current && svgRef.current && chartInstance) {
          chartInstance.updateConfig(props);
        }
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }, [props, chartInstance]);

    // 組件卸載時清理
    useEffect(() => {
      return () => {
        if (chartInstance) {
          chartInstance.destroy();
        }
      };
    }, [chartInstance]);

    // 數據驗證
    const validateData = () => {
      const { data } = props;
      return Array.isArray(data) && data.length > 0;
    };

    const { 
      className, 
      style, 
      width = 800, 
      height = 400, 
      interactive, 
      showTooltip = true 
    } = props;

    // 錯誤狀態渲染 
    if (state.error || !chartInstance) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-red-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">圖表錯誤</div>
            <div className="text-sm text-gray-600">
              {state.error?.message || '圖表實例創建失敗'}
            </div>
          </div>
        </div>
      );
    }

    // 無數據狀態渲染
    if (!validateData()) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-gray-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">無數據</div>
            <div className="text-sm">請提供有效的數據來渲染圖表</div>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label={props['aria-label'] || `${chartInstance?.getChartType?.() || 'chart'} 圖表`}
          aria-describedby={props['aria-describedby']}
          aria-labelledby={props['aria-labelledby']}
          tabIndex={interactive ? 0 : undefined}
          className={`${chartInstance?.getChartType?.() || 'chart'}-svg overflow-visible`}
        >
          {/* SVG 內容由 chartInstance 管理 */}
        </svg>

        {/* 載入狀態 */}
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-pulse text-gray-500">載入中...</div>
          </div>
        )}

        {/* 工具提示 */}
        {showTooltip && state.tooltip && state.tooltip.visible && (
          <div
            className="absolute z-[9999] px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none whitespace-pre-line max-w-[200px]"
            style={{
              left: `${(state.tooltip.x ?? 0) + 10}px`,
              top: `${(state.tooltip.y ?? 0) - 10}px`,
            }}
          >
            {typeof state.tooltip.content === 'string' 
              ? state.tooltip.content 
              : JSON.stringify(state.tooltip.content)
            }
          </div>
        )}
      </div>
    );
  });
}