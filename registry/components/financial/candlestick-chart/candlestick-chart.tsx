import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3CandlestickChart } from './core/candlestick-chart-core';
import { CandlestickChartProps } from './types';

// 目前先使用原始版本，稍後再整合新的交互功能
export const CandlestickChart = createChartComponent<CandlestickChartProps>(D3CandlestickChart);