/**
 * RadarChart 核心實現類，繼承 BaseChart
 * 使用 PolarUtils、RadarGridRenderer、RadarDataRenderer 等共用工具
 */

import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { DataProcessor } from '../../../core/data-processor/data-processor';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';
import { PolarUtils, RadarAxisConfig, InterpolationType } from '../../shared/polar-utils';
import { RadarGridRenderer, GridOptions } from '../../shared/radar-grid-renderer';
import { RadarDataRenderer, RadarSeries, DataOptions } from '../../shared/radar-data-renderer';
import { TextUtils } from '../../shared/text-utils';
import { RadarChartProps, ProcessedRadarDataPoint, RadarValue } from './types';

export class D3RadarChart extends BaseChart<RadarChartProps> {
  private processedData: ProcessedRadarDataPoint[] = [];
  private colorScale!: ColorScale;
  private radarAxes: RadarAxisConfig[] = [];
  private radarSeries: RadarSeries[] = [];
  private chartRadius: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;

  constructor(props: RadarChartProps) {
    super(props);
  }

  protected processData(): ProcessedRadarDataPoint[] {
    const { 
      data, 
      axes, 
      labelKey, 
      labelAccessor, 
      valueAccessor, 
      mapping,
      minValue = 0,
      maxValue,
      autoScale = true
    } = this.props;

    if (!data?.length || !axes?.length) {
      this.processedData = [];
      return this.processedData;
    }

    // 使用 DataProcessor 預處理數據（如果需要）
    const processedInput = data;
    
    // 計算數值範圍
    let actualMaxValue = maxValue;
    if (autoScale || actualMaxValue === undefined) {
      const allValues = data.flatMap(d => 
        axes.map(axis => {
          if (mapping) {
            const accessor = mapping.values[axis];
            return typeof accessor === 'function' ? accessor(d) : Number(d[accessor]) || 0;
          } else if (valueAccessor) {
            return valueAccessor(d, axis);
          } else {
            return Number(d[axis]) || 0;
          }
        })
      );
      actualMaxValue = Math.max(...allValues);
    }

    // 處理數據
    this.processedData = processedInput.map((d, index) => {
      let label: string;

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label]);
      } else if (labelAccessor) {
        label = labelAccessor(d);
      } else if (labelKey) {
        label = String(d[labelKey]);
      } else {
        label = `Series ${index + 1}`;
      }

      const values: RadarValue[] = axes.map(axis => {
        let value: number;

        if (mapping) {
          const accessor = mapping.values[axis];
          value = typeof accessor === 'function' ? accessor(d) : Number(d[accessor]) || 0;
        } else if (valueAccessor) {
          value = valueAccessor(d, axis);
        } else {
          value = Number(d[axis]) || 0;
        }

        const normalizedValue = (value - minValue) / (actualMaxValue! - minValue);

        return {
          axis,
          value: normalizedValue,
          normalizedValue,
          originalValue: value
        };
      });

      return {
        label,
        values,
        originalData: d,
        index
      };
    });

    return this.processedData;
  }

  protected createScales(): void {
    const { 
      colors,
      colorScheme = 'custom',
      startAngle = -90,
      clockwise = true,
      axisLabelOffset = 20,
      minValue = 0,
      maxValue = 1,
      scaleType = 'linear'
    } = this.props;

    const { chartWidth, chartHeight } = this.getChartDimensions();
    
    // 計算圖表尺寸
    this.chartRadius = this.props.radius || Math.min(chartWidth, chartHeight) / 2 - 40;
    this.centerX = chartWidth / 2;
    this.centerY = chartHeight / 2;

    // 創建顏色比例尺
    try {
      this.colorScale = createColorScale({
        type: colorScheme,
        colors: colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        domain: [0, Math.max(1, this.processedData.length - 1)],
        interpolate: colorScheme !== 'custom'
      });
    } catch (error) {
      console.warn('Failed to create color scale, using fallback:', error);
      // 創建簡單的 fallback colorScale
      this.colorScale = {
        getColor: (index: number) => {
          const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
          return defaultColors[index % defaultColors.length];
        },
        getColors: (count?: number) => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        domain: () => [0, this.processedData.length - 1],
        range: () => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
      } as ColorScale;
    }

    // 生成雷達軸配置
    this.radarAxes = PolarUtils.calculateAxisPositions(
      this.props.axes || [],
      this.centerX,
      this.centerY,
      this.chartRadius,
      startAngle,
      clockwise,
      axisLabelOffset
    );

    // 為每個軸設置數值範圍和比例尺
    this.radarAxes.forEach(axis => {
      axis.min = minValue;
      axis.max = maxValue;
      axis.scale = scaleType === 'log' 
        ? d3.scaleLog().domain([minValue || 0.1, maxValue]).range([0, this.chartRadius])
        : d3.scaleLinear().domain([minValue, maxValue]).range([0, this.chartRadius]);
    });
  }

  protected renderChart(): void {
    if (!this.svgRef?.current) return;

    this.processData();
    this.createScales();

    const {
      interpolation = 'linear-closed',
      showGrid = true,
      showGridLabels = true,
      showAxes = true,
      showAxisLabels = true,
      showArea = true,
      showDots = true,
      levels = 5,
      gridStroke = '#e5e7eb',
      gridStrokeWidth = 1,
      gridOpacity = 0.7,
      axisStroke = '#9ca3af',
      axisStrokeWidth = 1,
      strokeWidth = 2,
      areaOpacity = 0.25,
      dotRadius = 4,
      dotStroke = '#fff',
      dotStrokeWidth = 2,
      valueFormat,
      fontSize = 12,
      fontFamily = 'sans-serif',
      animate = true,
      animationDuration = 1000,
      animationDelay = 100,
      interactive = true,
      glowEffect = false,
      onSeriesClick,
      onSeriesHover,
      onDotClick,
      onDotHover
    } = this.props;

    // 創建主要容器
    const chartArea = this.createSVGContainer();

    // 生成雷達數據系列
    this.radarSeries = RadarDataRenderer.generateRadarSeries(
      this.processedData,
      this.radarAxes,
      this.centerX,
      this.centerY,
      this.colorScale,
      interpolation as InterpolationType,
      (d) => d.label,
      (d, axis) => {
        const value = d.values.find(v => v.axis === axis);
        return value ? value.normalizedValue : 0;
      }
    );

    // 渲染網格系統
    const gridOptions: GridOptions = {
      showGrid,
      showGridLabels,
      showAxes,
      showAxisLabels,
      levels,
      gridStyles: {
        stroke: gridStroke,
        strokeWidth: gridStrokeWidth,
        opacity: gridOpacity
      },
      axisStyles: {
        stroke: axisStroke,
        strokeWidth: axisStrokeWidth,
        opacity: gridOpacity
      },
      labelStyles: {
        fontSize,
        fontFamily,
        fill: '#6b7280'
      },
      gridLabelOffset: 10,
      axisLabelOffset: 0,
      valueFormat,
      glowEffect
    };

    RadarGridRenderer.renderGrid(
      chartArea,
      this.centerX,
      this.centerY,
      this.chartRadius,
      this.radarAxes,
      this.radarAxes[0]?.max || 1,
      gridOptions
    );

    // 渲染數據
    const dataOptions: DataOptions = {
      showArea,
      showLine: true,
      showDots,
      interpolation: interpolation as InterpolationType,
      dataStyles: {
        strokeWidth,
        areaOpacity,
        dotRadius,
        dotStroke,
        dotStrokeWidth
      },
      animate,
      animationDuration,
      animationDelay,
      interactive,
      onSeriesClick,
      onSeriesHover,
      onDotClick,
      onDotHover
    };

    RadarDataRenderer.renderData(
      chartArea,
      this.radarSeries,
      this.centerX,
      this.centerY,
      this.radarAxes,
      dataOptions
    );
  }

  protected getChartType(): string {
    return 'radar-chart';
  }

  public update(newConfig: Partial<RadarChartProps>): void {
    this.props = { ...this.props, ...newConfig };
    this.renderChart();
  }

  // 提供公開方法來獲取處理後的數據
  public getProcessedData(): ProcessedRadarDataPoint[] {
    return this.processedData;
  }

  public getRadarSeries(): RadarSeries[] {
    return this.radarSeries;
  }

  public getRadarAxes(): RadarAxisConfig[] {
    return this.radarAxes;
  }

  // 高亮特定系列
  public highlightSeries(seriesIndex: number | null): void {
    if (!this.svgRef?.current) return;
    
    const chartArea = d3.select(this.svgRef.current).select('.chart-area');
    RadarDataRenderer.highlightSeries(chartArea, seriesIndex);
  }

  // 更新樣式
  public updateStyles(styles: {
    strokeWidth?: number;
    areaOpacity?: number;
    dotRadius?: number;
  }): void {
    if (!this.svgRef?.current) return;
    
    const chartArea = d3.select(this.svgRef.current).select('.chart-area');
    RadarDataRenderer.updateDataStyles(chartArea, styles);
  }

  // 切換數據可見性
  public toggleDataVisibility(options: {
    showAreas?: boolean;
    showLines?: boolean;
    showDots?: boolean;
  }): void {
    if (!this.svgRef?.current) return;
    
    const chartArea = d3.select(this.svgRef.current).select('.chart-area');
    RadarDataRenderer.toggleDataVisibility(chartArea, options);
  }
}