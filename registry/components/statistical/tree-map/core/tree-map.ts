import * as d3 from 'd3';
import { BaseChart } from '../../../core/base-chart/base-chart';
import { TreeMapProps, TreeMapNode, TreeMapSpecificState } from '../types';
import { 
  TreeMapUtils, 
  TreeMapRenderer, 
  TreeMapLabelRenderer,
  TreeMapOptions
} from '../../shared';
import { HierarchyDataItem, StratifiedDataItem } from '../types';
import { createColorScale } from '../../../core/color-scheme/color-manager';
import { DataProcessor } from '../../../core/data-processor/data-processor';

export class D3TreeMap extends BaseChart<TreeMapProps> {
  private nodes: TreeMapNode[] = [];
  // private root: d3.HierarchyRectangularNode<any> | null = null;
  private treeMapState: TreeMapSpecificState = {
    nodes: [],
    focusedNode: null,
    zoomLevel: 1,
    hoveredNode: null,
    selectedNodes: []
  };
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  
  // BaseChart integration properties
  protected processedData: any[] = [];
  protected scales: any = {};
  protected colorScale: any;
  protected svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  
  // TreeMap specific data processing
  private treeMapData: HierarchyDataItem | HierarchyDataItem[] | StratifiedDataItem[] | null = null;

  constructor(props: TreeMapProps) {
    super(props);
    this.initializeTreeMap();
  }

  private initializeTreeMap(): void {
    // 設置預設值
    this.props = {
      dataFormat: 'hierarchy',
      valueKey: 'value',
      nameKey: 'name',
      idKey: 'id',
      parentKey: 'parent',
      padding: 1,
      tile: 'squarify',
      round: true,
      colorStrategy: 'depth',
      colorDepth: 1,
      showLabels: true,
      showValues: false,
      labelAlignment: 'center',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      minLabelSize: { width: 30, height: 20, area: 500 },
      maxLabelLength: 20,
      labelEllipsis: '...',
      strokeWidth: 1,
      strokeColor: '#ffffff',
      opacity: 0.8,
      showTooltip: true,
      animate: true,
      animationDuration: 750,
      enableZoom: false,
      enableDrill: false,
      sortBy: 'value',
      sortDirection: 'desc',
      ...this.props
    };

    // 工具提示使用 BaseChart 的標準系統，無需單獨初始化

    // 初始化縮放
    if (this.props.enableZoom) {
      this.initializeZoom();
    }
  }

  protected processData(): any[] {
    const { data, dataFormat } = this.props;
    
    // For BaseChart compatibility, we need to handle the data array
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('TreeMap: No data provided');
      this.processedData = [];
      return [];
    }
    
    // Set processedData for BaseChart validation
    this.processedData = data;
    
    // Store TreeMap specific data format
    this.treeMapData = dataFormat === 'stratified' ? data as StratifiedDataItem[] : 
                      (data.length === 1 && typeof data[0] === 'object' && 'children' in data[0]) ? 
                      data[0] as HierarchyDataItem : data as HierarchyDataItem[];

    try {
      let hierarchyRoot: d3.HierarchyNode<any>;

      if (dataFormat === 'stratified') {
        // 處理平面化數據
        hierarchyRoot = TreeMapUtils.processStratifiedData(
          this.treeMapData as StratifiedDataItem[],
          {
            idAccessor: (d: any) => d[this.props.idKey!],
            parentIdAccessor: (d: any) => d[this.props.parentKey!] || null,
            valueAccessor: (d: any) => d[this.props.valueKey!] || 0
          }
        );
      } else {
        // 處理階層數據
        const hierarchyData = Array.isArray(this.treeMapData) ? { children: this.treeMapData } : this.treeMapData as HierarchyDataItem;
        hierarchyRoot = TreeMapUtils.processHierarchyData(
          hierarchyData,
          {
            valueAccessor: (d: any) => d[this.props.valueKey!] || 0,
            sortOptions: {
              sortBy: this.props.sortBy,
              sortDirection: this.props.sortDirection,
              customComparator: this.props.customSortComparator
            }
          }
        );
      }

      // 計算 TreeMap 佈局
      const layoutOptions: TreeMapOptions = {
        width: this.props.width || 800,
        height: this.props.height || 600,
        padding: this.props.padding,
        paddingInner: this.props.paddingInner,
        paddingOuter: this.props.paddingOuter,
        paddingTop: this.props.paddingTop,
        paddingRight: this.props.paddingRight,
        paddingBottom: this.props.paddingBottom,
        paddingLeft: this.props.paddingLeft,
        tile: TreeMapUtils.getTilingMethod(this.props.tile!),
        round: this.props.round
      };

      this.nodes = TreeMapUtils.calculateTreemapLayout(hierarchyRoot, layoutOptions);
      // this.root = hierarchyRoot as d3.HierarchyRectangularNode<any>;
      this.treeMapState.nodes = this.nodes;

      return this.nodes;
    } catch (error) {
      console.error('TreeMap: Error processing data:', error);
      return [];
    }
  }

  protected createScales(): void {
    // 創建顏色比例尺 - 使用 d3.schemeCategory10 作為默認顏色
    this.colorScale = createColorScale({
      type: 'custom',
      colors: this.props.colors || [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
      ], // d3.schemeCategory10
      domain: [0, 9], // Updated domain for 10 colors
      interpolate: false
    });
    
    // 根據顏色策略設置域值，但不需要直接調用 getColorScale()
    if (this.props.colorStrategy === 'depth') {
      const depths = [...new Set(this.nodes.map(d => d.depth))];
      // 更新 colorScale 的 domain，會在 getColor 時自動應用
    } else if (this.props.colorStrategy === 'parent') {
      const parents = [...new Set(this.nodes.map(d => d.parent?.data?.id || d.parent?.data?.name || 'root'))];
      // 更新 colorScale 的 domain，會在 getColor 時自動應用
    } else if (this.props.colorStrategy === 'value') {
      // 對於數值映射，重新創建顏色比例尺 - 使用更好閱讀性的顏色
      const valueExtent = d3.extent(this.nodes, (d: TreeMapNode) => d.value || 0) as [number, number];
      this.colorScale = createColorScale({
        type: 'custom',
        colors: ['#fee5d9', '#fb6a4a', '#de2d26', '#a50f15'], // 暖色調漸變，更好的對比度
        domain: valueExtent,
        interpolate: true
      });
    }
    
    // Set scales for compatibility
    this.scales = {
      colorScale: this.colorScale
    };
  }

  protected getChartType(): string {
    return 'treemap';
  }

  protected renderChart(): void {
    if (!this.nodes.length) {
      console.warn('TreeMap: No nodes to render');
      return;
    }
    
    // 確保 SVG 引用可用
    if (!this.svgRef?.current) {
      console.error('TreeMap: SVG ref not available');
      return;
    }
    
    this.svg = d3.select(this.svgRef.current);
    
    // 使用 BaseChart 的 createSVGContainer 方法
    const container = this.createSVGContainer();

    // 渲染矩形
    this.renderRectangles(container);

    // 渲染標籤
    if (this.props.showLabels || this.props.showValues) {
      this.renderLabels(container);
    }

    // 渲染數值
    if (this.props.showValues && this.props.showValueBelow) {
      this.renderValues(container);
    }

    // 設置交互
    if (this.props.interactive) {
      this.setupInteractions(container);
    }

    // 工具提示透過 hover 事件處理器實現，使用 BaseChart 的標準 tooltip 系統
  }

  private renderRectangles(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    // 使用 this.colorScale.getColor() 遵循 BarChart 的模式
    // 創建索引映射
    const nodeIndexMap = new Map();
    this.nodes.forEach((node, index) => {
      nodeIndexMap.set(node, index);
    });
    
    const fillFunction = (d: TreeMapNode): string => {
      if (this.props.customColorMapper) {
        return this.props.customColorMapper(d);
      }
      
      switch (this.props.colorStrategy) {
        case 'depth':
          // 找到指定深度的祖先節點進行顏色映射
          let targetNode = d;
          const colorDepth = this.props.colorDepth || 1;
          while (targetNode.depth > colorDepth && targetNode.parent) {
            targetNode = targetNode.parent;
          }
          const depthKey = targetNode.data.id || targetNode.data.name || `depth-${targetNode.depth}`;
          return this.colorScale.getColor(depthKey);
        case 'parent':
          const parentKey = d.parent?.data?.id || d.parent?.data?.name || 'root';
          return this.colorScale.getColor(parentKey);
        case 'value':
          return this.colorScale.getColor(d.value || 0);
        case 'custom':
        default:
          // 使用索引來分配不同顏色，如同 BarChart 模式
          const index = nodeIndexMap.get(d) || 0;
          return this.colorScale.getColor(index);
      }
    };

    TreeMapRenderer.renderRectangles(container, this.nodes, {
      fill: fillFunction,
      stroke: this.props.strokeColor,
      strokeWidth: this.props.strokeWidth,
      opacity: this.props.opacity,
      rx: this.props.rectRadius,
      ry: this.props.rectRadius,
      className: 'treemap-rect',
      animation: {
        enabled: this.props.animate || false,
        duration: this.props.animationDuration || 750,
        delay: 0
      }
    });
  }

  private renderLabels(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    if (this.props.showHierarchicalLabels) {
      // 渲染階層標籤
      const maxDepth = Math.max(...this.nodes.map(d => d.depth));
      for (let depth = 0; depth <= maxDepth; depth++) {
        TreeMapLabelRenderer.renderHierarchicalLabels(container, this.nodes, depth, {
          showName: this.props.showLabels,
          showValue: this.props.showValues,
          nameProperty: this.props.nameKey,
          fontSize: this.props.fontSize,
          fontFamily: this.props.fontFamily,
          fill: this.props.labelColor,
          minNodeSize: this.props.minLabelSize,
          maxTextLength: this.props.maxLabelLength,
          ellipsis: this.props.labelEllipsis,
          maxDepth: this.props.maxDepth,
          depthColors: this.props.depthColors,
          depthFontSizes: this.props.depthFontSizes,
          showParentLabels: this.props.showParentLabels,
          parentLabelOffset: this.props.parentLabelOffset
        });
      }
    } else {
      // 渲染基本標籤
      TreeMapLabelRenderer.renderLabels(container, this.nodes, {
        showName: this.props.showLabels,
        showValue: this.props.showValues,
        nameProperty: this.props.nameKey,
        valueProperty: this.props.valueKey,
        fontSize: this.props.fontSize,
        fontFamily: this.props.fontFamily,
        fill: this.props.labelColor,
        minNodeSize: this.props.minLabelSize,
        maxTextLength: this.props.maxLabelLength,
        ellipsis: this.props.labelEllipsis
      });

      // 設置標籤位置
      TreeMapLabelRenderer.positionLabels(container, this.nodes, this.props.labelAlignment!);
    }
  }

  private renderValues(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    TreeMapLabelRenderer.renderValues(container, this.nodes, {
      format: this.props.valueFormatter || d3.format(','),
      prefix: this.props.valuePrefix || '',
      suffix: this.props.valueSuffix || '',
      position: 'below-name'
    });
  }

  private setupInteractions(container: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    const rectangles = container.selectAll<SVGRectElement, TreeMapNode>('.treemap-rect');

    rectangles
      .style('cursor', 'pointer')
      .on('click', (event: any, d: TreeMapNode) => {
        this.handleNodeClick(d, event);
      })
      .on('mouseover', (event: any, d: TreeMapNode) => {
        this.handleNodeHover(d, event);
      })
      .on('mouseout', (event: any, d: TreeMapNode) => {
        this.handleNodeLeave(d, event);
      });
  }


  private handleNodeClick(node: TreeMapNode, event: Event): void {
    if (this.props.enableDrill && node.children) {
      this.drillDown(node);
    }

    if (this.props.onNodeClick) {
      this.props.onNodeClick(node, event);
    }

    // 更新選擇狀態
    this.treeMapState.selectedNodes = [node];
    this.updateNodeStyles();
  }

  private handleNodeHover(node: TreeMapNode, event: Event): void {
    this.treeMapState.hoveredNode = node;
    this.updateNodeStyles();

    // 使用 BaseChart 的標準 tooltip 系統
    if (this.props.showTooltip && event instanceof MouseEvent) {
      const name = node.data[this.props.nameKey!] || node.data.id || '';
      const value = this.props.valueFormatter ? 
        this.props.valueFormatter(node.value || 0) : 
        d3.format(',')(node.value || 0);
      const tooltipContent = this.props.tooltipContent ? 
        this.props.tooltipContent(node) : 
        `${name}: ${value}`;
      
      this.createTooltip(event.clientX, event.clientY, tooltipContent);
    }

    if (this.props.onNodeHover) {
      this.props.onNodeHover(node, event);
    }
  }

  private handleNodeLeave(node: TreeMapNode, event: Event): void {
    this.treeMapState.hoveredNode = null;
    this.updateNodeStyles();

    // 使用 BaseChart 的標準 tooltip 隱藏
    if (this.props.showTooltip) {
      this.hideTooltip();
    }

    if (this.props.onNodeLeave) {
      this.props.onNodeLeave(node, event);
    }
  }

  private updateNodeStyles(): void {
    this.svg.selectAll<SVGRectElement, TreeMapNode>('.treemap-rect')
      .style('opacity', (d: TreeMapNode) => {
        if (this.treeMapState.hoveredNode === d) return 1;
        if (this.treeMapState.selectedNodes.includes(d)) return 0.9;
        return this.props.opacity || 0.8;
      })
      .style('stroke-width', (d: TreeMapNode) => {
        if (this.treeMapState.selectedNodes.includes(d)) return 2;
        return this.props.strokeWidth || 1;
      });
  }


  private initializeZoom(): void {
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event: any) => {
        const { transform } = event;
        this.svg.select('.treemap-container')
          .attr('transform', transform);
        this.treeMapState.zoomLevel = transform.k;
      });

    this.svg.call(this.zoom);
  }

  public drillDown(node: TreeMapNode): void {
    if (!node.children || !this.props.enableDrill) return;

    this.treeMapState.focusedNode = node;
    
    // 重新計算佈局以聚焦到特定節點
    // 這裡可以實現更複雜的下鑽邏輯
    this.renderChart();
  }

  public drillUp(): void {
    if (!this.treeMapState.focusedNode?.parent) return;

    this.treeMapState.focusedNode = this.treeMapState.focusedNode.parent;
    this.renderChart();
  }

  public resetView(): void {
    this.treeMapState.focusedNode = null;
    this.treeMapState.selectedNodes = [];
    this.treeMapState.hoveredNode = null;
    this.treeMapState.zoomLevel = 1;

    if (this.zoom) {
      this.svg.transition()
        .duration(this.props.animationDuration || 750)
        .call(this.zoom.transform, d3.zoomIdentity);
    }

    this.renderChart();
  }

  public getTreeMapState(): TreeMapSpecificState {
    return { ...this.treeMapState };
  }

  public update(newProps: Partial<TreeMapProps>): void {
    this.props = { ...this.props, ...newProps };
    
    // 重新處理數據如果數據變更
    if (newProps.data) {
      this.processData();
      this.createScales();
    }
    
    this.renderChart();
  }

  public destroy(): void {
    if (this.zoom) {
      this.svg.on('.zoom', null);
      this.zoom = null;
    }

    // TreeMap specific cleanup only
    // BaseChart 的 tooltip 會自動清理
  }
}