import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
// import { DataProcessor } from '../../../core/data-processor/data-processor';
// import { createColorScale } from '../../../core/color-scheme/color-manager';
import {
  ProcessedCorrelogramDataPoint,
  CorrelogramProps,
  CorrelogramScales,
  // CorrelogramMatrix
} from './types';

export class D3Correlogram extends BaseChart<CorrelogramProps> {
  private processedData: ProcessedCorrelogramDataPoint[] = [];
  private variables: string[] = [];
  private scales: CorrelogramScales = {} as CorrelogramScales;
  private colorScale: any;
  private sizeScale: any;

  constructor(props: CorrelogramProps) {
    super(props);
  }

  protected processData(): ProcessedCorrelogramDataPoint[] {
    const {
      data,
      correlationMatrix,
      variables,
      // mapping,
      // xKey,
      // yKey,
      // valueKey,
      // xAccessor,
      // yAccessor,
      // valueAccessor,
      threshold = 0
    } = this.props;


    // 情況 1: 直接提供相關係數矩陣
    if (correlationMatrix && variables) {
      return this.processMatrixData(correlationMatrix, variables, threshold);
    }

    // 情況 2: 提供寬格式資料 (類似 CSV)
    if (data?.length) {
      // 只支援寬格式資料
      if (this.isWideFormatData(data)) {
        return this.processWideFormatData(data, threshold);
      } else {
        this.handleError(new Error('資料格式不正確。請使用矩陣格式 (correlationMatrix + variables) 或寬格式資料。'));
        return [];
      }
    }

    this.handleError(new Error('請提供相關係數矩陣或原始資料'));
    return [];
  }

  private processMatrixData(matrix: number[][], variables: string[], threshold: number): ProcessedCorrelogramDataPoint[] {
    this.variables = [...variables];
    const data: ProcessedCorrelogramDataPoint[] = [];
    // const extent = d3.extent(matrix.flat()) as [number, number];


    matrix.forEach((row, yIndex) => {
      row.forEach((value, xIndex) => {
        if (Math.abs(value) >= threshold) {
          let position: 'upper' | 'lower' | 'diagonal';
          if (xIndex === yIndex) {
            position = 'diagonal';
          } else if (xIndex > yIndex) {
            position = 'upper';
          } else {
            position = 'lower';
          }

          data.push({
            x: variables[xIndex],
            y: variables[yIndex],
            value: value,
            xIndex,
            yIndex,
            normalizedValue: Math.abs(value),
            position,
            originalData: { x: variables[xIndex], y: variables[yIndex], value }
          });
        }
      });
    });


    this.processedData = data;
    return data;
  }

  private processWideFormatData(data: any[], threshold: number): ProcessedCorrelogramDataPoint[] {
    // 類似 correlogram_basic.js 的轉換邏輯
    const result: ProcessedCorrelogramDataPoint[] = [];
    
    // 先收集所有變數名稱
    const allVariables = new Set<string>();
    
    data.forEach(row => {
      const x = row[""] || row.variable || Object.keys(row)[0]; // 第一列作為變數名
      allVariables.add(x);
      
      // 複製 row 以避免修改原始資料
      const rowCopy = { ...row };
      delete rowCopy[""];
      delete rowCopy.variable;
      
      Object.keys(rowCopy).forEach(y => {
        allVariables.add(y);
      });
    });

    this.variables = Array.from(allVariables).sort();
    
    data.forEach(row => {
      const x = row[""] || row.variable || Object.keys(row)[0]; // 第一列作為變數名
      
      // 複製 row 以避免修改原始資料
      const rowCopy = { ...row };
      delete rowCopy[""];
      delete rowCopy.variable;

      Object.keys(rowCopy).forEach(y => {
        const value = Number(rowCopy[y]);
        if (!isNaN(value) && Math.abs(value) >= threshold) {
          const xIndex = this.variables.indexOf(x);
          const yIndex = this.variables.indexOf(y);
          
          let position: 'upper' | 'lower' | 'diagonal';
          if (x === y) {
            position = 'diagonal';
          } else if (xIndex > yIndex) {
            position = 'upper';
          } else {
            position = 'lower';
          }

          result.push({
            x,
            y,
            value,
            xIndex,
            yIndex,
            normalizedValue: Math.abs(value),
            position,
            originalData: { x, y, value }
          });
        }
      });
    });

    this.processedData = result;
    return result;
  }


  private isWideFormatData(data: any[]): boolean {
    if (!data?.length) return false;
    const sample = data[0];
    
    // 檢查是否包含空字串鍵或 variable 鍵 (寬格式特徵)
    return sample.hasOwnProperty("") || sample.hasOwnProperty("variable") ||
           Object.keys(sample).length > 3; // 多於3個屬性通常是寬格式
  }

  protected createScales(): void {
    const { 
      maxCircleRadius = 9, 
      minCircleRadius = 0, 
      colorScheme = 'default',
      customColors 
    } = this.props;
    const { chartWidth, chartHeight } = this.getChartDimensions();

    // X, Y 軸比例尺 (點狀比例尺用於分類資料)
    const xScale = d3.scalePoint()
      .domain(this.variables)
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scalePoint()
      .domain(this.variables)
      .range([0, chartHeight])
      .padding(0.1);

    // 顏色比例尺 (雙向: 負相關 -> 零 -> 正相關)
    const colorDomain = [-1, 0, 1];
    let colorRange: string[];
    
    if (colorScheme === 'custom' && customColors) {
      colorRange = customColors;
    } else {
      colorRange = ["#B22222", "#fff", "#000080"]; // 紅 -> 白 -> 藍
    }

    this.colorScale = d3.scaleLinear<string>()
      .domain(colorDomain)
      .range(colorRange);

    // 尺寸比例尺 (平方根比例尺，用於圓圈大小)
    this.sizeScale = d3.scaleSqrt()
      .domain([0, 1])
      .range([minCircleRadius, maxCircleRadius]);

    this.scales = {
      xScale,
      yScale,
      colorScale: this.colorScale,
      sizeScale: this.sizeScale,
      chartWidth,
      chartHeight
    };
  }

  protected renderChart(): void {
    const {
      showUpperTriangle = true,
      showLowerTriangle = true,
      showDiagonal = true,
      // showValues = true,
      valueFormat,
      textColor,
      fontSize = '11px',
      showXAxis = true,
      showYAxis = true,
      xAxisRotation = 0,
      yAxisRotation = 0,
      animate = true,
      animationDuration = 750,
      onCellClick,
      onCellHover,
      showLegend = true,
      legendPosition = 'right',
      legendTitle = '相關係數'
    } = this.props;


    const { xScale, yScale, sizeScale } = this.scales;
    const g = this.createSVGContainer();

    if (!this.processedData.length) {
      return;
    }

    // 渲染軸線
    if (showXAxis || showYAxis) {
      this.renderAxes(g, { xScale, yScale }, {
        showXAxis,
        showYAxis,
        xAxisConfig: {
          fontSize: '12px',
          fontColor: '#6b7280',
          rotation: xAxisRotation
        },
        yAxisConfig: {
          fontSize: '12px',
          fontColor: '#6b7280',
          rotation: yAxisRotation
        }
      });
    }

    // 創建每個格子的群組
    const cells = g.selectAll('.correlogram-cell')
      .data(this.processedData)
      .join('g')
      .attr('class', 'correlogram-cell')
      .attr('transform', d => `translate(${xScale(d.x)}, ${yScale(d.y)})`);

    // 渲染下三角 - 文字
    if (showLowerTriangle) {
      const lowerCells = cells.filter(d => d.position === 'lower');
      
      lowerCells.append('text')
        .attr('class', 'lower-text')
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', fontSize)
        .style('fill', d => {
          if (typeof textColor === 'function') {
            return textColor(d.value, d.normalizedValue);
          }
          return textColor || this.colorScale(d.value);
        })
        .text(d => {
          if (valueFormat) return valueFormat(d.value);
          return d.value.toFixed(2);
        });

      if (animate) {
        lowerCells.select('text')
          .attr('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay((_d, i) => i * 20)
          .attr('opacity', 1);
      }
    }

    // 渲染上三角 - 圓圈
    if (showUpperTriangle) {
      const upperCells = cells.filter(d => d.position === 'upper');
      
      upperCells.append('circle')
        .attr('class', 'upper-circle')
        .attr('r', d => sizeScale(d.normalizedValue))
        .style('fill', d => this.colorScale(d.value))
        .style('opacity', 0.8);

      if (animate) {
        upperCells.select('circle')
          .attr('r', 0)
          .transition()
          .duration(animationDuration)
          .delay((_d, i) => i * 20)
          .attr('r', d => sizeScale(d.normalizedValue));
      }
    }

    // 渲染對角線 - 變數名稱
    if (showDiagonal) {
      const diagonalCells = cells.filter(d => d.position === 'diagonal');
      
      diagonalCells.append('text')
        .attr('class', 'diagonal-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', fontSize)
        .style('fill', '#000')
        .style('font-weight', 'bold')
        .text(d => d.x);

      if (animate) {
        diagonalCells.select('text')
          .attr('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay(animationDuration / 2)
          .attr('opacity', 1);
      }
    }

    // 添加互動事件
    if (onCellHover || onCellClick) {
      cells
        .style('cursor', 'pointer')
        .on('mouseenter.correlogram', (event, d) => {
          if (onCellHover) {
            onCellHover(d.x, d.y, d.value, event);
          }
          
          // 顯示 tooltip
          const tooltip = `${d.x} ↔ ${d.y}: ${d.value.toFixed(3)}`;
          const [mouseX, mouseY] = d3.pointer(event, g.node());
          this.createTooltip(mouseX, mouseY, tooltip);
        })
        .on('mouseleave.correlogram', () => {
          this.hideTooltip();
        })
        .on('click.correlogram', (event, d) => {
          if (onCellClick) {
            onCellClick(d.x, d.y, d.value, event);
          }
        });
    }

    // 渲染圖例
    if (showLegend) {
      this.renderLegend(g, legendPosition, legendTitle);
    }
  }

  private renderLegend(g: d3.Selection<SVGGElement, unknown, null, undefined>, position: 'top' | 'bottom' | 'left' | 'right', title: string): void {
    const { chartWidth, chartHeight, margin } = this.getChartDimensions();
    
    // 計算實際可用空間 - 使用 margin 空間
    const rightSpaceInContainer = margin.right;
    const bottomSpaceInContainer = margin.bottom;
    
    // 圖例尺寸設定
    const baseHorizontalWidth = Math.min(160, chartWidth * 0.5);
    const baseVerticalHeight = Math.min(100, chartHeight * 0.4);
    
    let legendWidth = position === 'left' || position === 'right' ? 20 : baseHorizontalWidth;
    let legendHeight = position === 'top' || position === 'bottom' ? 20 : baseVerticalHeight;
    
    // 智能位置調整：檢查 margin 空間是否足夠
    let actualPosition = position;
    const minRightSpace = legendWidth + 30;
    const minBottomSpace = 60;
    
    if (position === 'right' && rightSpaceInContainer < minRightSpace) {
      if (bottomSpaceInContainer >= minBottomSpace) {
        actualPosition = 'bottom';
        legendWidth = Math.min(baseHorizontalWidth, chartWidth * 0.8);
        legendHeight = 20;
        console.log('🎯 Correlogram Legend: 右側空間不足，自動切換到底部位置');
      } else {
        legendWidth = Math.max(15, rightSpaceInContainer - 25);
        console.log('🎯 Correlogram Legend: 空間有限，縮小右側Legend尺寸');
      }
    }
    
    // 根據實際位置計算圖例座標
    let legendX: number, legendY: number;
    const isVertical = actualPosition === 'left' || actualPosition === 'right';
    
    switch (actualPosition) {
      case 'top':
        legendX = (chartWidth - legendWidth) / 2;
        legendY = -50;
        break;
      case 'bottom':
        legendX = (chartWidth - legendWidth) / 2;
        legendY = chartHeight + 30;
        break;
      case 'left':
        legendX = -60;
        legendY = (chartHeight - legendHeight) / 2;
        break;
      case 'right':
      default:
        legendX = chartWidth + 15;
        legendY = (chartHeight - legendHeight) / 2;
        break;
    }

    // 創建圖例群組
    const legendGroup = g.append('g')
      .attr('class', 'correlogram-legend')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .style('overflow', 'hidden');

    // 調試信息
    console.log('🎯 Correlogram Legend 佈局:', {
      originalPosition: position,
      actualPosition,
      legendX,
      legendY,
      legendWidth,
      legendHeight,
      rightSpaceInContainer,
      bottomSpaceInContainer,
      margin
    });

    // 創建顏色漸層
    const defs = g.select('svg').select('defs').empty() ? g.select('svg').append('defs') : g.select('svg').select('defs');
    
    const gradientId = `correlogram-gradient-${Math.random().toString(36).substr(2, 9)}`;
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse');

    if (isVertical) {
      gradient.attr('x1', 0).attr('y1', legendHeight).attr('x2', 0).attr('y2', 0);
    } else {
      gradient.attr('x1', 0).attr('y1', 0).attr('x2', legendWidth).attr('y2', 0);
    }

    // 添加顏色停止點 - 從負相關（紅色）到正相關（藍色）
    const colorStops = [
      { offset: '0%', color: '#B22222' }, // 強負相關 - 紅色
      { offset: '50%', color: '#fff' },   // 無相關 - 白色
      { offset: '100%', color: '#000080' } // 強正相關 - 藍色
    ];

    colorStops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color);
    });

    // 繪製漸層矩形
    legendGroup.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', `url(#${gradientId})`)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // 添加標題
    if (title) {
      legendGroup.append('text')
        .attr('class', 'legend-title')
        .attr('x', isVertical ? -10 : legendWidth / 2)
        .attr('y', isVertical ? -10 : -10)
        .attr('text-anchor', isVertical ? 'end' : 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(title);
    }

    // 添加數值標籤
    const correlationLabels = [
      { value: -1, text: '-1.0' },
      { value: 0, text: '0.0' },
      { value: 1, text: '+1.0' }
    ];

    correlationLabels.forEach((label, i) => {
      const ratio = i / (correlationLabels.length - 1);
      const labelX = isVertical ? legendWidth + 5 : ratio * legendWidth;
      const labelY = isVertical ? legendHeight - ratio * legendHeight + 4 : legendHeight + 15;

      legendGroup.append('text')
        .attr('class', 'legend-label')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', isVertical ? 'start' : 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(label.text);
    });
  }

  protected getChartType(): string {
    return 'correlogram';
  }

  // 重寫 validateData 以支援 correlationMatrix 模式
  protected validateData(): boolean {
    const { data, correlationMatrix, variables } = this.props;
    
    // 情況 1: 使用 correlationMatrix + variables
    if (correlationMatrix && variables) {
      if (Array.isArray(correlationMatrix) && Array.isArray(variables) && 
          correlationMatrix.length > 0 && variables.length > 0) {
        return true;
      }
    }
    
    // 情況 2: 使用 data 陣列
    if (data && Array.isArray(data) && data.length > 0) {
      return true;
    }
    
    return false;
  }
}