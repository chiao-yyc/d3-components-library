
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3ScatterPlot } from './core/scatter-plot';
import { ScatterPlotProps } from './types';

export const ScatterPlot = createChartComponent<ScatterPlotProps>(D3ScatterPlot);
