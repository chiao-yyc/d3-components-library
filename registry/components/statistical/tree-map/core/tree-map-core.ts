/**
 * TreeMapCore - 基於 BaseChartCore 架構的樹狀圖核心實現
 * 繼承自 BaseChartCore，保持框架無關
 */

import * as d3 from 'd3';
import { BaseChartCore } from '../../../core/base-chart/core';
import { 
  BaseChartData, 
  ChartData, 
  BaseChartCoreConfig, 
  DataKeyOrAccessor,
  D3Selection
} from '../../../core/types';
import { 
  TreeMapUtils, 
  TreeMapRenderer, 
  TreeMapLabelRenderer 
} from '../../shared';

export interface TreeMapData extends BaseChartData {
  id?: string;
  name?: string;
  value?: number;
  parent?: string;
  children?: TreeMapData[];
}

export interface TreeMapDataPoint {
  id: string;
  name: string;
  value: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number;
  parent: TreeMapDataPoint | null;
  children?: TreeMapDataPoint[];
  originalData: ChartData<TreeMapData>;
}

export interface TreeMapCoreConfig extends BaseChartCoreConfig<TreeMapData> {
  // 數據存取
  dataFormat?: 'hierarchy' | 'stratified';
  valueKey?: DataKeyOrAccessor<TreeMapData, number>;
  nameKey?: DataKeyOrAccessor<TreeMapData, string>;
  idKey?: DataKeyOrAccessor<TreeMapData, string>;
  parentKey?: DataKeyOrAccessor<TreeMapData, string>;

  // 佈局配置
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  tile?: 'squarify' | 'binary' | 'dice' | 'slice' | 'slicedice' | 'resquarify';
  round?: boolean;

  // 顏色配置
  colors?: string[];
  colorStrategy?: 'depth' | 'parent' | 'value' | 'custom';
  colorDepth?: number;
  customColorMapper?: (d: TreeMapDataPoint) => string;

  // 標籤配置
  showLabels?: boolean;
  showValues?: boolean;
  labelAlignment?: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize?: number | string | ((d: TreeMapDataPoint) => number | string);
  fontFamily?: string;
  fontWeight?: string | number;
  labelColor?: string | ((d: TreeMapDataPoint) => string);
  minLabelSize?: {
    width: number;
    height: number;
    area?: number;
  };
  maxLabelLength?: number;

  // 樣式配置
  strokeWidth?: number | ((d: TreeMapDataPoint) => number);
  strokeColor?: string | ((d: TreeMapDataPoint) => string);
  opacity?: number | ((d: TreeMapDataPoint) => number);
  rectRadius?: number;

  // 交互配置
  enableZoom?: boolean;
  enableDrill?: boolean;
  
  // 事件處理 - 標準命名
  onDataClick?: (data: TreeMapDataPoint, event: MouseEvent) => void;
  onDataHover?: (data: TreeMapDataPoint | null, event: MouseEvent) => void;

  // 動畫配置
  animationDelay?: number;

  // 排序配置
  sortBy?: 'value' | 'name' | 'custom';
  sortDirection?: 'asc' | 'desc';
  customSortComparator?: (a: TreeMapDataPoint, b: TreeMapDataPoint) => number;

  // 過濾配置
  minNodeValue?: number;
  maxDepth?: number;
  visibleDepths?: number[];

  // 數值格式化
  valueFormatter?: (value: number) => string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export class TreeMapCore extends BaseChartCore<TreeMapData> {
  private processedDataPoints: TreeMapDataPoint[] = [];
  private root: d3.HierarchyRectangularNode<TreeMapData> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  protected scales: Record<string, any> = {};
  protected config: TreeMapCoreConfig;

  constructor(config: TreeMapCoreConfig, callbacks: any = {}) {
    super(config, callbacks);
    this.config = config;
  }

  public getChartType(): string {
    return 'tree-map';
  }

  protected processData(): ChartData<TreeMapData>[] {
    const config = this.config;
    const { data, dataFormat = 'hierarchy', valueKey, nameKey, idKey, parentKey } = config;

    if (!data?.length) {
      this.processedDataPoints = [];
      return data;
    }

    try {
      // 根據數據格式處理數據
      let hierarchy: d3.HierarchyNode<TreeMapData>;
      
      if (dataFormat === 'hierarchy') {
        // 階層數據格式
        const rootData = Array.isArray(data) ? { children: data } : data[0];
        hierarchy = d3.hierarchy(rootData as TreeMapData);
      } else {
        // 平面數據格式，需要先轉換為階層結構
        const stratifyData = data.map((d, index) => ({
          id: this.getAccessorValue(idKey, d, index) || `node_${index}`,
          parentId: this.getAccessorValue(parentKey, d, index) || null,
          value: this.getAccessorValue(valueKey, d, index) || 0,
          name: this.getAccessorValue(nameKey, d, index) || `Node ${index}`,
          originalData: d
        }));

        const stratify = d3.stratify<any>()
          .id(d => d.id)
          .parentId(d => d.parentId);

        hierarchy = stratify(stratifyData);
      }

      // 設置數值和排序
      hierarchy.sum(d => {
        // 對於階層資料，只有葉子節點才有 value，父節點由 d3 自動累加
        if (dataFormat === 'hierarchy') {
          // 如果有子節點，返回 0 讓 d3 自動累加子節點值
          // 如果沒有子節點（葉子節點），返回實際值
          if (d.children && d.children.length > 0) {
            return 0;
          } else {
            const value = this.getAccessorValue(valueKey || 'value', d, 0);
            return Math.max(0, value || 0);
          }
        } else {
          // 對於平面資料，直接使用指定的值
          const value = this.getAccessorValue(valueKey, d, 0);
          return Math.max(0, value || 0);
        }
      });

      if (config.sortBy === 'value') {
        hierarchy.sort((a, b) => {
          const order = config.sortDirection === 'desc' ? -1 : 1;
          return order * ((b.value || 0) - (a.value || 0));
        });
      } else if (config.sortBy === 'name') {
        hierarchy.sort((a, b) => {
          const order = config.sortDirection === 'desc' ? -1 : 1;
          const aName = this.getAccessorValue(nameKey, a.data, 0) || '';
          const bName = this.getAccessorValue(nameKey, b.data, 0) || '';
          return order * aName.localeCompare(bName);
        });
      } else if (config.sortBy === 'custom' && config.customSortComparator) {
        // 自定義排序需要在處理後的節點上調用
      }

      // 創建樹狀圖佈局
      const { chartWidth, chartHeight } = this.getChartDimensions();
      const treemap = d3.treemap<TreeMapData>()
        .size([chartWidth, chartHeight])
        .padding(config.padding || 1)
        .paddingInner(config.paddingInner || config.padding || 1)
        .paddingOuter(config.paddingOuter || 0)
        .paddingTop(config.paddingTop || config.paddingOuter || 0)
        .paddingRight(config.paddingRight || config.paddingOuter || 0)
        .paddingBottom(config.paddingBottom || config.paddingOuter || 0)
        .paddingLeft(config.paddingLeft || config.paddingOuter || 0)
        .round(config.round !== false);

      // 設置分割算法
      switch (config.tile) {
        case 'binary':
          treemap.tile(d3.treemapBinary);
          break;
        case 'dice':
          treemap.tile(d3.treemapDice);
          break;
        case 'slice':
          treemap.tile(d3.treemapSlice);
          break;
        case 'slicedice':
          treemap.tile(d3.treemapSliceDice);
          break;
        case 'resquarify':
          treemap.tile(d3.treemapResquarify);
          break;
        default:
          treemap.tile(d3.treemapSquarify);
      }

      this.root = treemap(hierarchy);

      // 轉換為處理後的數據點 - 只處理葉節點
      this.processedDataPoints = [];
      if (this.root) {
        this.root.each((node: d3.HierarchyRectangularNode<TreeMapData>) => {
          // 只處理葉節點（沒有子節點的節點）
          if (!node.children || node.children.length === 0) {
            if (node.x0 !== undefined && node.y0 !== undefined && 
                node.x1 !== undefined && node.y1 !== undefined) {
              
              // 獲取節點名稱
              const nameValue = this.getAccessorValue(nameKey || 'name', node.data, 0);
              const nodeName = nameValue || node.data.name || `Node ${this.processedDataPoints.length}`;

              const dataPoint: TreeMapDataPoint = {
                id: this.getAccessorValue(idKey, node.data, 0) || `node_${this.processedDataPoints.length}`,
                name: nodeName,
                value: node.value || 0,
                x0: node.x0,
                y0: node.y0,
                x1: node.x1,
                y1: node.y1,
                depth: node.depth,
                parent: node.parent ? null : null, // 將在第二次遍歷中設置
                children: [],
                originalData: node.data
              };

              // 過濾條件檢查
              if (config.minNodeValue && dataPoint.value < config.minNodeValue) {
                return;
              }
              
              if (config.maxDepth && dataPoint.depth > config.maxDepth) {
                return;
              }

              if (config.visibleDepths && !config.visibleDepths.includes(dataPoint.depth)) {
                return;
              }

              this.processedDataPoints.push(dataPoint);
            }
          }
        });
      }

      // 應用自定義排序（如果有）
      if (config.sortBy === 'custom' && config.customSortComparator) {
        this.processedDataPoints.sort(config.customSortComparator);
      }

      return data;
    } catch (error) {
      console.error('TreeMap data processing error:', error);
      this.processedDataPoints = [];
      return data;
    }
  }

  private getAccessorValue<T>(
    accessor: DataKeyOrAccessor<TreeMapData, T> | undefined,
    data: TreeMapData,
    index: number
  ): T | undefined {
    if (!accessor) return undefined;
    
    if (typeof accessor === 'function') {
      return accessor(data, index, this.config.data || []);
    } else {
      return data[accessor as string] as T;
    }
  }

  protected createScales(): Record<string, any> {
    // TreeMap 不需要傳統的比例尺，位置由 treemap 佈局計算
    // 但我們可以創建顏色比例尺
    const colorScale = this.createColorScale();
    return { colorScale };
  }

  private createColorScale(): d3.ScaleOrdinal<string, string> {
    const { colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'], colorStrategy = 'depth' } = this.config;
    
    const domain = this.processedDataPoints.map(d => {
      switch (colorStrategy) {
        case 'depth':
          return d.depth.toString();
        case 'parent':
          return d.parent?.id || 'root';
        case 'value':
          return d.value.toString();
        default:
          return d.id;
      }
    });

    return d3.scaleOrdinal<string>()
      .domain([...new Set(domain)])
      .range(colors);
  }

  protected renderChart(): void {
    if (!this.validateData()) return;

    // 創建比例尺
    this.scales = this.createScales();
    
    const svg = this.createSVGContainer();
    this.renderTreeMap(svg);
  }

  private renderTreeMap(container: D3Selection<SVGGElement>): void {
    const config = this.config;
    const { 
      animate = true,
      animationDuration = 750,
      strokeWidth = 1,
      strokeColor = '#ffffff',
      opacity = 1,
      rectRadius = 0,
      showLabels = true,
      enableZoom = false,
      enableDrill: _enableDrill = false
    } = config;

    // 創建節點組
    const nodes = container.selectAll('.tree-node')
      .data(this.processedDataPoints, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // 繪製矩形
    const rects = nodes.append('rect')
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', typeof strokeColor === 'function' ? strokeColor : strokeColor)
      .attr('stroke-width', typeof strokeWidth === 'function' ? strokeWidth : strokeWidth)
      .attr('opacity', typeof opacity === 'function' ? opacity : opacity)
      .attr('rx', rectRadius)
      .attr('ry', rectRadius);

    // 添加標籤
    if (showLabels) {
      this.renderLabels(nodes);
    }

    // 添加交互
    this.addInteractivity(nodes);

    // 添加動畫
    if (animate) {
      rects
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((_d, i) => (config.animationDelay || 0) + i * 50)
        .attr('opacity', typeof opacity === 'function' ? opacity : opacity);
    }

    // 添加縮放功能
    if (enableZoom) {
      this.addZoomBehavior(container);
    }
  }

  private getNodeColor(d: TreeMapDataPoint): string {
    const { colorStrategy = 'depth', customColorMapper } = this.config;
    const colorScale = this.scales?.colorScale;

    if (customColorMapper) {
      return customColorMapper(d);
    }

    if (!colorScale) {
      return '#3b82f6';
    }

    switch (colorStrategy) {
      case 'depth':
        return colorScale(d.depth.toString());
      case 'parent':
        return colorScale(d.parent?.id || 'root');
      case 'value':
        return colorScale(d.value.toString());
      default:
        return colorScale(d.id);
    }
  }

  private renderLabels(nodes: D3Selection<SVGGElement>): void {
    const config = this.config;
    const { 
      fontSize = 12,
      fontFamily = 'Inter, system-ui, -apple-system, sans-serif',
      fontWeight = 'normal',
      labelColor = '#000000',
      labelAlignment = 'center',
      showValues = false,
      valueFormatter,
      valuePrefix = '',
      valueSuffix = '',
      minLabelSize = { width: 20, height: 20 },
      maxLabelLength = 20
    } = config;

    // 儲存 positionLabel 方法的引用以避免 this 綁定問題
    const positionLabel = this.positionLabel.bind(this);

    nodes.each(function(d: TreeMapDataPoint) {
      const node = d3.select(this);
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;

      // 檢查最小尺寸要求
      if (width < minLabelSize.width || height < minLabelSize.height) {
        return;
      }

      const labelGroup = node.append('g').attr('class', 'label-group');

      // 處理標籤文字
      let labelText = d.name;
      if (maxLabelLength && labelText.length > maxLabelLength) {
        labelText = labelText.substring(0, maxLabelLength - 3) + '...';
      }

      // 添加名稱標籤
      labelGroup.append('text')
        .attr('class', 'node-name')
        .style('font-size', typeof fontSize === 'function' ? fontSize(d) : fontSize)
        .style('font-family', fontFamily)
        .style('font-weight', fontWeight)
        .style('fill', typeof labelColor === 'function' ? labelColor(d) : labelColor)
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')
        .text(labelText);

      // 添加數值標籤
      if (showValues) {
        const formattedValue = valueFormatter ? 
          valueFormatter(d.value) : 
          `${valuePrefix}${d.value.toLocaleString()}${valueSuffix}`;

        labelGroup.append('text')
          .attr('class', 'node-value')
          .style('font-size', typeof fontSize === 'function' ? 
            Math.max(10, (fontSize(d) as number) - 2) : 
            Math.max(10, (fontSize as number) - 2))
          .style('font-family', fontFamily)
          .style('font-weight', fontWeight)
          .style('fill', typeof labelColor === 'function' ? labelColor(d) : labelColor)
          .style('text-anchor', 'middle')
          .style('dominant-baseline', 'central')
          .attr('dy', '1.2em')
          .text(formattedValue);
      }

      // 設置標籤位置
      positionLabel(labelGroup, d, labelAlignment);
    });
  }

  private positionLabel(
    labelGroup: D3Selection<SVGGElement>, 
    d: TreeMapDataPoint, 
    alignment: string
  ): void {
    const width = d.x1 - d.x0;
    const height = d.y1 - d.y0;

    let x = 0, y = 0;

    switch (alignment) {
      case 'top-left':
        x = 5;
        y = 15;
        break;
      case 'top-center':
        x = width / 2;
        y = 15;
        break;
      case 'top-right':
        x = width - 5;
        y = 15;
        break;
      case 'bottom-left':
        x = 5;
        y = height - 5;
        break;
      case 'bottom-center':
        x = width / 2;
        y = height - 5;
        break;
      case 'bottom-right':
        x = width - 5;
        y = height - 5;
        break;
      default: // center
        x = width / 2;
        y = height / 2;
    }

    labelGroup.attr('transform', `translate(${x}, ${y})`);
  }

  private addInteractivity(nodes: D3Selection<SVGGElement>): void {
    const config = this.config;
    
    if (!config.interactive) return;

    nodes
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: TreeMapDataPoint) => {
        config.onDataClick?.(d, event);
      })
      .on('mouseover', (event: MouseEvent, d: TreeMapDataPoint) => {
        // 添加懸停效果
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .style('filter', 'brightness(1.1)');

        config.onDataHover?.(d, event);
        
        // 計算相對於圖表容器的座標（修復 tooltip 偏移問題）
        const containerRect = this.containerElement.getBoundingClientRect();
        const tooltipX = event.clientX - containerRect.left;
        const tooltipY = event.clientY - containerRect.top;
        
        this.showTooltip(tooltipX, tooltipY, this.formatTooltipContent(d));
      })
      .on('mouseout', (event: MouseEvent, _d: TreeMapDataPoint) => {
        // 移除懸停效果
        d3.select(event.currentTarget as SVGGElement)
          .select('rect')
          .style('filter', null);

        config.onDataHover?.(null, event);
        this.hideTooltip();
      });
  }

  private addZoomBehavior(container: D3Selection<SVGGElement>): void {
    const svg = container.select(function() { return this.ownerSVGElement; });
    
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(this.zoom);
  }

  private formatTooltipContent(data: TreeMapDataPoint): string {
    const { valueFormatter, valuePrefix = '', valueSuffix = '' } = this.config;
    const formattedValue = valueFormatter ? 
      valueFormatter(data.value) : 
      `${valuePrefix}${data.value.toLocaleString()}${valueSuffix}`;

    return `${data.name}: ${formattedValue}`;
  }

  // 公開 API
  public getProcessedDataPoints(): TreeMapDataPoint[] {
    return [...this.processedDataPoints];
  }

  public getRoot(): d3.HierarchyRectangularNode<TreeMapData> | null {
    return this.root;
  }

  public zoomToNode(nodeId: string): void {
    if (!this.zoom) return;

    const node = this.processedDataPoints.find(d => d.id === nodeId);
    if (!node) return;

    const { chartWidth, chartHeight } = this.getChartDimensions();
    const nodeWidth = node.x1 - node.x0;
    const nodeHeight = node.y1 - node.y0;

    const scale = Math.min(chartWidth / nodeWidth, chartHeight / nodeHeight) * 0.9;
    const x = -(node.x0 * scale - (chartWidth - nodeWidth * scale) / 2);
    const y = -(node.y0 * scale - (chartHeight - nodeHeight * scale) / 2);

    const svg = d3.select(this.containerElement).select('svg');
    svg.transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
  }

  public resetZoom(): void {
    if (!this.zoom) return;

    const svg = d3.select(this.containerElement).select('svg');
    svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }
}