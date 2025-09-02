// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { CorrelogramCore, CorrelogramCoreConfig } from './core/correlogram-core';

// 新的 props 介面
export interface CorrelogramProps extends ReactChartWrapperProps, CorrelogramCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const CorrelogramComponent = createReactChartWrapper(CorrelogramCore);

// 主要導出
export const Correlogram = React.forwardRef<CorrelogramCore, CorrelogramProps>((props, ref) => {
  return <CorrelogramComponent ref={ref} {...props} />;
});

Correlogram.displayName = 'Correlogram';

export default Correlogram;