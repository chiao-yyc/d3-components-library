/**
 * 現代化的圖表組件創建器
 * 基於 hooks 和組合模式，取代類別繼承模式
 */

import React, { ReactNode } from 'react';
import { BaseChartCore } from './core/base-chart-core';
import { useBaseChart, UseBaseChartOptions } from './use-base-chart';
import type { BaseChartCoreConfig, ChartStateCallbacks } from './core';
import { cn } from '../../../utils/cn';

// 現代化圖表組件的 props 介面
export interface ModernChartProps extends UseBaseChartOptions {
  className?: string;
  style?: React.CSSProperties;
  showTooltip?: boolean;
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

/**
 * 創建現代化圖表組件的工廠函數
 * 使用 hooks 模式取代類別繼承
 */
export function createModernChart<
  TCore extends BaseChartCore,
  TProps extends ModernChartProps
>(
  ChartCoreClass: new (config: BaseChartCoreConfig, callbacks: ChartStateCallbacks) => TCore,
  displayName?: string
) {
  const ChartComponent = React.forwardRef<TCore, TProps>((props, ref) => {
    const {
      className,
      style,
      width = 800,
      height = 400,
      interactive,
      showTooltip = true,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      ...chartOptions
    } = props;

    // 使用統一的 useBaseChart hook
    const {
      containerRef,
      svgRef,
      chartInstance,
      isLoading,
      error,
      tooltip
    } = useBaseChart(ChartCoreClass, chartOptions);

    // 暴露圖表實例給 ref
    React.useImperativeHandle(ref, () => chartInstance!, [chartInstance]);

    // 數據驗證
    const hasValidData = () => {
      return Array.isArray(props.data) && props.data.length > 0;
    };

    // 錯誤狀態渲染
    if (error) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-red-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">圖表錯誤</div>
            <div className="text-sm text-gray-600">{error.message}</div>
          </div>
        </div>
      );
    }

    // 無數據狀態渲染
    if (!hasValidData()) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-gray-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">無數據</div>
            <div className="text-sm">請提供有效的數據來渲染圖表</div>
          </div>
        </div>
      );
    }

    const chartType = chartInstance?.getChartType() || 'chart';

    return (
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel || `${chartType} 圖表`}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          tabIndex={interactive ? 0 : undefined}
          className={cn(`${chartType}-svg`, 'overflow-visible')}
        >
          {/* SVG 內容由 chartInstance 管理 */}
        </svg>

        {/* 載入狀態 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-pulse text-gray-500">載入中...</div>
          </div>
        )}

        {/* 工具提示 */}
        {showTooltip && tooltip && tooltip.visible && (
          <div
            className="absolute z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translate(0, -100%)',
              maxWidth: '300px'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    );
  });

  // 設置顯示名稱
  ChartComponent.displayName = displayName || `ModernChart(${ChartCoreClass.name})`;

  return ChartComponent;
}

/**
 * 創建基於 hooks 的圖表組件（無 forwardRef）
 * 適用於不需要暴露實例方法的場景
 */
export function createSimpleChart<
  TCore extends BaseChartCore,
  TProps extends ModernChartProps
>(
  ChartCoreClass: new (config: BaseChartCoreConfig, callbacks: ChartStateCallbacks) => TCore,
  displayName?: string
) {
  const ChartComponent: React.FC<TProps> = (props) => {
    const {
      className,
      style,
      width = 800,
      height = 400,
      interactive,
      showTooltip = true,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      ...chartOptions
    } = props;

    // 使用統一的 useBaseChart hook
    const {
      containerRef,
      svgRef,
      chartInstance,
      isLoading,
      error,
      tooltip
    } = useBaseChart(ChartCoreClass, chartOptions);

    // 數據驗證
    const hasValidData = () => {
      return Array.isArray(props.data) && props.data.length > 0;
    };

    // 錯誤狀態渲染
    if (error) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-red-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">圖表錯誤</div>
            <div className="text-sm text-gray-600">{error.message}</div>
          </div>
        </div>
      );
    }

    // 無數據狀態渲染
    if (!hasValidData()) {
      return (
        <div className={cn('flex items-center justify-center p-8 text-gray-500', className)} style={style}>
          <div className="text-center">
            <div className="text-lg font-medium mb-2">無數據</div>
            <div className="text-sm">請提供有效的數據來渲染圖表</div>
          </div>
        </div>
      );
    }

    const chartType = chartInstance?.getChartType() || 'chart';

    return (
      <div ref={containerRef} className={cn('relative', className)} style={style}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel || `${chartType} 圖表`}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          tabIndex={interactive ? 0 : undefined}
          className={cn(`${chartType}-svg`, 'overflow-visible')}
        >
          {/* SVG 內容由 chartInstance 管理 */}
        </svg>

        {/* 載入狀態 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-pulse text-gray-500">載入中...</div>
          </div>
        )}

        {/* 工具提示 */}
        {showTooltip && tooltip && tooltip.visible && (
          <div
            className="absolute z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translate(0, -100%)',
              maxWidth: '300px'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    );
  };

  // 設置顯示名稱
  ChartComponent.displayName = displayName || `SimpleChart(${ChartCoreClass.name})`;

  return ChartComponent;
}

// 類型輔助
export type ModernChartComponent<TCore extends BaseChartCore, TProps extends ModernChartProps> = 
  React.ForwardRefExoticComponent<TProps & React.RefAttributes<TCore>>;

export type SimpleChartComponent<TProps extends ModernChartProps> = React.FC<TProps>;