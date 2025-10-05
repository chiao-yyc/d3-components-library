/**
 * ShapeComposer - React 包裝層
 * 提供靈活的圖形組件組合功能
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { 
  ShapeComposer as ShapeComposerCore, 
  ShapeComposerConfig,
  ShapeConfig,
  createShapeConfig,
  createComposerConfig
} from './core/shape-composer';

// 擴展 React props 接口
export interface ShapeComposerProps extends ReactChartWrapperProps, ShapeComposerConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 ShapeComposer 組件
const ShapeComposerComponent = createReactChartWrapper(ShapeComposerCore as any);

// 導出最終組件
export const ShapeComposer = React.forwardRef<ShapeComposerCore, ShapeComposerProps>((props, ref) => {
  return <ShapeComposerComponent ref={ref} {...props} />;
});

ShapeComposer.displayName = 'ShapeComposer';

// 導出便利函數和類型
export { 
  createShapeConfig, 
  createComposerConfig,
  type ShapeConfig,
  type ShapeComposerConfig 
};

// 默認配置
const getDefaultShapeComposerProps = (): Partial<ShapeComposerProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 80, bottom: 40, left: 40 },
  
  shapes: [],
  sharedScales: true,
  layerOrder: 'zIndex',
  
  legend: {
    show: true,
    position: 'right',
    orientation: 'vertical',
    itemSpacing: 20,
    showSymbols: true
  }
});

ShapeComposer.defaultProps = getDefaultShapeComposerProps();