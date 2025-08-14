
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3Heatmap } from './core/heatmap';
import { HeatmapProps } from './types';
import './heatmap.css';

export const Heatmap = createChartComponent<HeatmapProps>(D3Heatmap);
