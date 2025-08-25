
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3GaugeChart } from './core/gauge-chart';
import { GaugeChartProps } from './types';
import './gauge-chart.css';

export const GaugeChart = createChartComponent<GaugeChartProps>(D3GaugeChart);
