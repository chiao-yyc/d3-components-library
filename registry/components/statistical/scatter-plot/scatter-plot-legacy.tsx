
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3ScatterPlot } from './core/scatter-plot-legacy';
import { ScatterPlotProps } from './types';

console.log('🎯 Creating ScatterPlot component with D3ScatterPlot core:', D3ScatterPlot);
console.log('📦 Using createChartComponent from:', createChartComponent);
export const ScatterPlot = createChartComponent<ScatterPlotProps>(D3ScatterPlot);
console.log('✅ ScatterPlot component created:', ScatterPlot);
