import React from 'react';
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3CandlestickChart } from './core/candlestick-chart-core';
import { CandlestickChartProps } from './types';

export const CandlestickChartV2 = createChartComponent<CandlestickChartProps>(D3CandlestickChart);