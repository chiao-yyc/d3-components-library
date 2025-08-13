import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3BarChart } from './core/bar-chart';
import { BarChartProps } from './types';

export const BarChart = createChartComponent<BarChartProps>(D3BarChart);