
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3PieChart } from './core/pie-chart';
import { PieChartProps } from './types';

export const PieChart = createChartComponent<PieChartProps>(D3PieChart);
