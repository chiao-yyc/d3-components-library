
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3AreaChart } from './core/area-chart';
import { AreaChartProps } from './types';

export const AreaChart = createChartComponent<AreaChartProps>(D3AreaChart);
