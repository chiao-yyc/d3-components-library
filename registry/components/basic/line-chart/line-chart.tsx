
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3LineChart } from './core/line-chart'; // 確保導入 D3LineChart
import { LineChartProps } from './types'; // 確保導入 LineChartProps
import './line-chart.css'; // Keep CSS import if needed

export const LineChart = createChartComponent<LineChartProps>(D3LineChart);
