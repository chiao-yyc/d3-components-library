/**
 * CorrelogramCore - 純 JS/TS 的相關性矩陣圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core/base-chart-core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  ChartStateCallbacks
} from '../../../core/types';
import { createColorScale, ColorScale } from '../../../core/color-scheme/color-manager';

// Correlogram 專用數據接口
export interface CorrelogramData extends BaseChartData {
  x?: string | number;
  y?: string | number;
  value?: number;
  correlation?: number;
  [key: string]: any;
}

// 處理後的相關性數據點
export interface ProcessedCorrelogramDataPoint extends BaseChartData {
  xVar: string;
  yVar: string;
  correlation: number;
  absCorrelation: number;
  originalData: ChartData<CorrelogramData>;
  x: number;
  y: number;
  color: string;
  size: number;
  positionType?: 'diagonal' | 'upper' | 'lower'; // 位置類型
  [key: string]: any;
}

// 相關性矩陣類型
export type CorrelogramMatrix = number[][];

// Correlogram 專用配置接口
export interface CorrelogramCoreConfig extends BaseChartCoreConfig<CorrelogramData> {
  // 數據映射選項
  correlationMatrix?: CorrelogramMatrix;
  variables?: string[];
  xAccessor?: DataKeyOrAccessor<CorrelogramData, string>;
  yAccessor?: DataKeyOrAccessor<CorrelogramData, string>;
  valueAccessor?: DataKeyOrAccessor<CorrelogramData, number>;
  
  // 顯示配置
  visualizationType?: 'circle' | 'square' | 'ellipse' | 'color' | 'number';
  displayType?: 'circle' | 'square' | 'ellipse' | 'color' | 'number'; // 保留向後兼容
  threshold?: number;
  showDiagonal?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  
  // 三角區域配置
  showUpperTriangle?: boolean;
  showLowerTriangle?: boolean;
  upperTriangleType?: 'visual' | 'text' | 'both';  // 上三角顯示類型
  lowerTriangleType?: 'visual' | 'text' | 'both';  // 下三角顯示類型
  
  // 顏色配置
  colors?: string[];
  colorScheme?: 'diverging' | 'sequential' | 'custom';
  colorRange?: [string, string] | [string, string, string];
  
  // 尺寸配置
  minRadius?: number; // 統一命名  
  maxRadius?: number; // 統一命名
  minSize?: number;   // 保留向後兼容
  maxSize?: number;   // 保留向後兼容
  cellPadding?: number;
  
  // 軸線配置
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  
  // 格式化
  valueFormat?: (value: number) => string;
  
  // 動畫
  animate?: boolean;
  animationDuration?: number;
  
  // 事件處理
  onDataClick?: (data: ProcessedCorrelogramDataPoint, event: Event) => void;
  onDataHover?: (data: ProcessedCorrelogramDataPoint | null, event: Event) => void;
}

// 主要的 Correlogram 核心類
export class CorrelogramCore extends BaseChartCore<CorrelogramData> {
  private processedData: ProcessedCorrelogramDataPoint[] = [];
  private variables: string[] = [];
  private colorScale: ColorScale | null = null;
  private sizeScale: d3.ScaleLinear<number, number> | null = null;
  private xScale: d3.ScaleBand<string> | null = null;
  private yScale: d3.ScaleBand<string> | null = null;

  constructor(
    config: CorrelogramCoreConfig,
    callbacks: ChartStateCallbacks<CorrelogramData> = {}
  ) {
    super(config, callbacks);
  }

  protected processData(): ChartData<CorrelogramData>[] {
    const config = this.config as CorrelogramCoreConfig;
    const { 
      data, 
      correlationMatrix, 
      variables, 
      xAccessor, 
      yAccessor, 
      valueAccessor,
      threshold = 0
    } = config;

    try {
      // 情況 1: 直接提供相關係數矩陣
      if (correlationMatrix && variables) {
        console.log('📊 Processing matrix data:', { matrix: correlationMatrix.length, variables: variables.length });
        this.variables = variables;
        this.processedData = this.processMatrixData(correlationMatrix, variables, threshold);
        console.log('✅ Matrix processing complete:', this.processedData.length, 'data points');
        return this.processedData;
      }

      // 情況 2: 提供寬格式資料
      if (data?.length) {
        if (this.isWideFormatData(data)) {
          console.log('📊 Processing wide format data:', data.length, 'rows');
          this.processedData = this.processWideFormatData(data, threshold);
          console.log('✅ Wide format processing complete:', this.processedData.length, 'data points');
          return this.processedData;
        } else {
          console.warn('⚠️ Invalid data format. Expected matrix or wide format.');
          this.handleError(new Error('資料格式不正確。請使用矩陣格式 (correlationMatrix + variables) 或寬格式資料。'));
          return [];
        }
      }

      // 情況 3: 長格式資料 (x, y, value)
      if (data?.length && xAccessor && yAccessor && valueAccessor) {
        console.log('📊 Processing long format data:', data.length, 'rows');
        this.processedData = this.processLongFormatData(data, xAccessor, yAccessor, valueAccessor, threshold);
        console.log('✅ Long format processing complete:', this.processedData.length, 'data points');
        return this.processedData;
      }

      console.error('❌ No valid data format provided');
      this.handleError(new Error('請提供有效的數據格式'));
      return [];
    } catch (error) {
      console.error('❌ Error processing correlogram data:', error);
      this.handleError(error as Error);
      return [];
    }
  }

  private processMatrixData(
    matrix: CorrelogramMatrix, 
    variables: string[], 
    threshold: number
  ): ProcessedCorrelogramDataPoint[] {
    const processed: ProcessedCorrelogramDataPoint[] = [];
    const config = this.config as CorrelogramCoreConfig;
    
    for (let i = 0; i < variables.length; i++) {
      for (let j = 0; j < variables.length; j++) {
        const correlation = matrix[i][j];
        
        // 判斷位置類型
        let positionType: 'diagonal' | 'upper' | 'lower';
        if (i === j) {
          positionType = 'diagonal';
        } else if (j > i) {
          positionType = 'upper';  // 上三角
        } else {
          positionType = 'lower';  // 下三角
        }
        
        // 根據配置決定是否包含此位置
        let shouldInclude = Math.abs(correlation) >= threshold;
        if (shouldInclude) {
          if (positionType === 'diagonal' && config.showDiagonal === false) {
            shouldInclude = false;
          } else if (positionType === 'upper' && config.showUpperTriangle === false) {
            shouldInclude = false;
          } else if (positionType === 'lower' && config.showLowerTriangle === false) {
            shouldInclude = false;
          }
        }
        
        if (shouldInclude) {
          processed.push({
            xVar: variables[j],
            yVar: variables[i],
            correlation,
            absCorrelation: Math.abs(correlation),
            originalData: { x: variables[j], y: variables[i], value: correlation },
            x: j,
            y: i,
            color: '',
            size: 0,
            positionType  // 新增位置類型
          } as ProcessedCorrelogramDataPoint & { positionType: 'diagonal' | 'upper' | 'lower' });
        }
      }
    }
    
    this.variables = variables;
    return processed;
  }

  private processWideFormatData(data: CorrelogramData[], threshold: number): ProcessedCorrelogramDataPoint[] {
    // 從寬格式數據中提取變數名稱（排除非數值列）
    const firstRow = data[0];
    const variableNames = Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return typeof value === 'number' || !isNaN(Number(value));
    });

    // 計算相關係數矩陣
    const matrix = this.calculateCorrelationMatrix(data, variableNames);
    
    return this.processMatrixData(matrix, variableNames, threshold);
  }

  private processLongFormatData(
    data: CorrelogramData[],
    xAccessor: DataKeyOrAccessor<CorrelogramData, string>,
    yAccessor: DataKeyOrAccessor<CorrelogramData, string>,
    valueAccessor: DataKeyOrAccessor<CorrelogramData, number>,
    threshold: number
  ): ProcessedCorrelogramDataPoint[] {
    const processed: ProcessedCorrelogramDataPoint[] = [];
    
    data.forEach((item, index) => {
      let xVar: string, yVar: string, correlation: number;
      
      if (typeof xAccessor === 'function') {
        xVar = xAccessor(item, index, data);
      } else {
        xVar = String(item[xAccessor] || '');
      }
      
      if (typeof yAccessor === 'function') {
        yVar = yAccessor(item, index, data);
      } else {
        yVar = String(item[yAccessor] || '');
      }
      
      if (typeof valueAccessor === 'function') {
        correlation = valueAccessor(item, index, data);
      } else {
        correlation = Number(item[valueAccessor] || 0);
      }
      
      if (Math.abs(correlation) >= threshold) {
        processed.push({
          xVar,
          yVar,
          correlation,
          absCorrelation: Math.abs(correlation),
          originalData: item,
          x: 0, // 將在 createScales 中設置
          y: 0, // 將在 createScales 中設置
          color: '',
          size: 0
        } as ProcessedCorrelogramDataPoint);
      }
    });
    
    // 提取唯一變數
    const uniqueVars = Array.from(new Set([
      ...processed.map(d => d.xVar),
      ...processed.map(d => d.yVar)
    ]));
    
    this.variables = uniqueVars;
    
    // 設置位置索引
    processed.forEach(d => {
      d.x = uniqueVars.indexOf(d.xVar);
      d.y = uniqueVars.indexOf(d.yVar);
    });
    
    return processed;
  }

  private isWideFormatData(data: CorrelogramData[]): boolean {
    if (!data || data.length === 0) return false;
    
    const firstRow = data[0];
    const numericKeys = Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return typeof value === 'number' || !isNaN(Number(value));
    });
    
    return numericKeys.length >= 2; // 至少需要兩個數值欄位
  }

  private calculateCorrelationMatrix(data: CorrelogramData[], variables: string[]): CorrelogramMatrix {
    const matrix: CorrelogramMatrix = [];
    
    for (let i = 0; i < variables.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < variables.length; j++) {
        if (i === j) {
          matrix[i][j] = 1; // 對角線為 1
        } else {
          const values1 = data.map(d => Number(d[variables[i]])).filter(v => !isNaN(v));
          const values2 = data.map(d => Number(d[variables[j]])).filter(v => !isNaN(v));
          matrix[i][j] = this.pearsonCorrelation(values1, values2);
        }
      }
    }
    
    return matrix;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  protected createScales(): Record<string, any> {
    if (this.processedData.length === 0 || this.variables.length === 0) return {};

    const config = this.config as CorrelogramCoreConfig;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // 創建位置比例尺
    this.xScale = d3.scaleBand()
      .domain(this.variables)
      .range([0, chartWidth])
      .padding(config.cellPadding || 0.1);

    this.yScale = d3.scaleBand()
      .domain(this.variables)
      .range([0, chartHeight])
      .padding(config.cellPadding || 0.1);

    // 創建顏色比例尺
    const colorRange = config.colorRange || ['#d73027', '#ffffff', '#1a9850'];
    if (config.colorScheme === 'diverging' || !config.colorScheme) {
      this.colorScale = createColorScale({
        type: 'diverging',
        colors: colorRange,
        domain: [-1, 0, 1]
      });
    } else {
      this.colorScale = createColorScale({
        type: 'custom',
        colors: config.colors || colorRange,
        domain: [0, 1]
      });
    }

    // 創建尺寸比例尺 - 支持新舊參數名稱
    console.log('📏 Creating size scale with config:', { 
      minRadius: config.minRadius, 
      maxRadius: config.maxRadius,
      minSize: config.minSize, 
      maxSize: config.maxSize,
      cellPadding: config.cellPadding
    });

    const minSize = config.minRadius ?? config.minSize ?? 1;
    
    // 優先使用用戶配置的最大半徑，只有在未設定時才使用帶寬限制
    let maxSize: number;
    if (config.maxRadius !== undefined || config.maxSize !== undefined) {
      maxSize = config.maxRadius ?? config.maxSize ?? 20;
    } else {
      // 備用計算：使用帶寬的較大比例以提供更好的視覺差異
      maxSize = Math.min(this.xScale.bandwidth(), this.yScale.bandwidth()) * 0.9;
    }
    
    const maxAbsCorr = Math.max(...this.processedData.map(d => d.absCorrelation));
    this.sizeScale = d3.scaleLinear()
      .domain([0, maxAbsCorr])
      .range([minSize, maxSize]);

    console.log('📐 Size scale created:', { minSize, maxSize, maxAbsCorr });

    // 設置處理後數據的顏色和尺寸
    this.processedData.forEach(d => {
      d.color = this.colorScale!.getColor(d.correlation);
      d.size = this.sizeScale!(d.absCorrelation);
    });

    console.log('🎨 First data point after styling:', this.processedData[0]);

    return {
      xScale: this.xScale,
      yScale: this.yScale,
      colorScale: this.colorScale,
      sizeScale: this.sizeScale
    };
  }

  protected renderChart(): void {
    // 創建 SVG 容器
    const chartGroup = this.createSVGContainer();

    // 使用已處理的數據
    if (!this.processedData || this.processedData.length === 0) {
      chartGroup.selectAll('*').remove();
      return;
    }

    // 渲染相關性圖
    this.renderCorrelations(chartGroup);

    // 渲染軸線
    this.renderUnifiedAxes();
  }

  private renderCorrelations(chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const config = this.config as CorrelogramCoreConfig;
    // 支持新舊參數名稱
    const visualType = config.visualizationType || config.displayType || 'circle';
    const animate = config.animate !== false;
    const animationDuration = config.animationDuration || 1000;

    console.log('🎨 Rendering correlations:', { 
      visualType, 
      animate, 
      duration: animationDuration,
      dataCount: this.processedData.length,
      hasScales: !!this.xScale && !!this.yScale
    });

    if (!this.xScale || !this.yScale) {
      console.error('❌ Missing scales for rendering');
      return;
    }

    if (this.processedData.length === 0) {
      console.warn('⚠️ No data to render');
      return;
    }

    // 創建相關性圖形
    const correlations = chartGroup
      .selectAll('.correlation-cell')
      .data(this.processedData)
      .enter()
      .append('g')
      .attr('class', 'correlation-cell')
      .attr('transform', d => {
        const x = (this.xScale!(d.xVar) || 0) + this.xScale!.bandwidth() / 2;
        const y = (this.yScale!(d.yVar) || 0) + this.yScale!.bandwidth() / 2;
        return `translate(${x}, ${y})`;
      });

    console.log('📍 Correlation groups created:', correlations.size());

    // 根據位置類型和配置分別渲染
    this.renderByPositionType(correlations, config, visualType, animate, animationDuration);

    // 添加交互事件
    this.addInteractionEvents(correlations);
  }

  private renderByPositionType(
    correlations: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>,
    config: CorrelogramCoreConfig,
    visualType: string,
    animate: boolean,
    animationDuration: number
  ): void {
    // 分離不同位置的數據點
    const upperTriangle = correlations.filter(d => d.positionType === 'upper');
    const lowerTriangle = correlations.filter(d => d.positionType === 'lower');
    const diagonal = correlations.filter(d => d.positionType === 'diagonal');

    // 渲染上三角（通常顯示視覺化）
    const upperTriangleType = config.upperTriangleType || 'visual';
    if (upperTriangleType === 'visual' || upperTriangleType === 'both') {
      this.renderVisualElements(upperTriangle, visualType, animate, animationDuration);
    }
    if (upperTriangleType === 'text' || upperTriangleType === 'both') {
      this.renderTextValues(upperTriangle);
    }

    // 渲染下三角（通常顯示數值）
    const lowerTriangleType = config.lowerTriangleType || 'text';
    if (lowerTriangleType === 'visual' || lowerTriangleType === 'both') {
      this.renderVisualElements(lowerTriangle, visualType, animate, animationDuration);
    }
    if (lowerTriangleType === 'text' || lowerTriangleType === 'both') {
      this.renderTextValues(lowerTriangle);
    }

    // 渲染對角線（通常顯示變數名稱或1.0）
    if (config.showDiagonal !== false) {
      this.renderDiagonalElements(diagonal);
    }
  }

  private renderVisualElements(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>,
    visualType: string,
    animate: boolean,
    animationDuration: number
  ): void {
    if (visualType === 'circle') {
      this.renderCircles(selection, animate, animationDuration);
    } else if (visualType === 'square') {
      this.renderSquares(selection, animate, animationDuration);
    } else if (visualType === 'color') {
      this.renderColorCells(selection);
    }
  }

  private renderTextValues(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>
  ): void {
    console.log('📝 Rendering text values, selection size:', selection.size());

    selection
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', '11px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text(d => {
        const value = d.correlation;
        if (Math.abs(value) < 0.005) return '0.00';
        return value.toFixed(2);
      });
  }

  private renderDiagonalElements(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>
  ): void {
    console.log('⚡ Rendering diagonal elements, selection size:', selection.size());

    // 對角線通常顯示變數名稱
    selection
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', '12px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('fill', '#1f2937')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => d.xVar);
  }

  private renderCircles(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>,
    animate: boolean,
    duration: number
  ): void {
    console.log('🔵 Rendering circles, selection size:', selection.size());

    const circles = selection
      .append('circle')
      .attr('fill', d => {
        console.log('🎨 Circle color:', d.color, 'size:', d.size, 'correlation:', d.correlation);
        return d.color || '#666';
      })
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .style('opacity', d => {
        // 添加透明度變化：相關性越強，透明度越高
        const minOpacity = 0.6;
        const maxOpacity = 0.95;
        return minOpacity + (d.absCorrelation * (maxOpacity - minOpacity));
      });

    if (animate) {
      circles
        .attr('r', 0)
        .transition()
        .duration(duration)
        .delay((_d, i) => i * 50)
        .attr('r', d => Math.max(1, d.size / 2)); // 確保至少有 1px 半徑
    } else {
      circles.attr('r', d => Math.max(1, d.size / 2));
    }

    console.log('✅ Circles rendered:', circles.size());
  }

  private renderSquares(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>,
    animate: boolean,
    duration: number
  ): void {
    const squares = selection
      .append('rect')
      .attr('fill', d => d.color)
      .attr('stroke', 'none')
      .attr('x', d => -d.size / 2)
      .attr('y', d => -d.size / 2);

    if (animate) {
      squares
        .attr('width', 0)
        .attr('height', 0)
        .transition()
        .duration(duration)
        .delay((_d, i) => i * 50)
        .attr('width', d => d.size)
        .attr('height', d => d.size);
    } else {
      squares
        .attr('width', d => d.size)
        .attr('height', d => d.size);
    }
  }

  private renderColorCells(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>
  ): void {
    if (!this.xScale || !this.yScale) return;

    selection
      .append('rect')
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('x', -this.xScale.bandwidth() / 2)
      .attr('y', -this.yScale.bandwidth() / 2)
      .attr('width', this.xScale.bandwidth())
      .attr('height', this.yScale.bandwidth());
  }

  private addInteractionEvents(
    selection: d3.Selection<SVGGElement, ProcessedCorrelogramDataPoint, SVGGElement, unknown>
  ): void {
    const config = this.config as CorrelogramCoreConfig;
    
    selection
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        config.onDataClick?.(d, event);
      })
      .on('mouseenter', (event, d) => {
        // 顯示工具提示
        const [x, y] = d3.pointer(event, this.containerElement);
        const tooltipContent = `${d.xVar} vs ${d.yVar}: ${d.correlation.toFixed(3)}`;
        this.showTooltip(x, y, tooltipContent);
        config.onDataHover?.(d, event);
      })
      .on('mouseleave', (event, __d) => {
        this.hideTooltip();
        config.onDataHover?.(null, event);
      });
  }

  private renderUnifiedAxes(): void {
    const config = this.config as CorrelogramCoreConfig;

    // 使用統一軸線系統
    if (config.showXAxis !== false && this.xScale) {
      this.renderXAxis(this.xScale, {
        showGrid: config.showGrid
      });
    }

    if (config.showYAxis !== false && this.yScale) {
      this.renderYAxis(this.yScale, {
        showGrid: config.showGrid
      });
    }
  }

  public getChartType(): string {
    return 'correlogram';
  }

  // 公共方法：更新配置
  public updateConfig(newConfig: Partial<CorrelogramCoreConfig>): void {
    super.updateConfig(newConfig);
  }

  // 公共方法：獲取處理後的數據
  public getProcessedData(): ChartData<CorrelogramData>[] {
    return this.processedData;
  }

  // 公共方法：獲取變數列表
  public getVariables(): string[] {
    return this.variables;
  }
}