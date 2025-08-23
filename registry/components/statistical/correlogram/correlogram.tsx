import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3Correlogram } from './core/correlogram';
import { CorrelogramProps } from './types';

export const Correlogram = createChartComponent<CorrelogramProps>(D3Correlogram);