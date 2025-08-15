import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3ObservableFunnelChart } from './core/observable-funnel-chart';
import { ObservableFunnelChartProps } from './types';

export const ObservableFunnelChart = createChartComponent<ObservableFunnelChartProps>(D3ObservableFunnelChart);