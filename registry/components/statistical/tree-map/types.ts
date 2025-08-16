import { BaseChartProps } from '../../core/base-chart/types';
import * as d3 from 'd3';

export interface HierarchyDataItem {
  id?: string;
  name?: string;
  value?: number;
  children?: HierarchyDataItem[];
  [key: string]: any;
}

export interface StratifiedDataItem {
  id: string;
  value: number;
  parent?: string;
  [key: string]: any;
}

export interface TreeMapSpecificProps {
  // 數據相關
  dataFormat?: 'hierarchy' | 'stratified';
  valueKey?: string;
  nameKey?: string;
  idKey?: string;
  parentKey?: string;

  // 佈局相關
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  tile?: 'squarify' | 'binary' | 'dice' | 'slice' | 'slicedice' | 'resquarify';
  round?: boolean;

  // 顏色相關
  colors?: string[];
  colorStrategy?: 'depth' | 'parent' | 'value' | 'custom';
  colorDepth?: number;
  customColorMapper?: (d: any) => string;

  // 標籤相關
  showLabels?: boolean;
  showValues?: boolean;
  labelAlignment?: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize?: number | string | ((d: any) => number | string);
  fontFamily?: string;
  fontWeight?: string | number;
  labelColor?: string | ((d: any) => string);
  minLabelSize?: {
    width: number;
    height: number;
    area?: number;
  };
  maxLabelLength?: number;
  labelEllipsis?: string;

  // 樣式相關
  strokeWidth?: number | ((d: any) => number);
  strokeColor?: string | ((d: any) => string);
  opacity?: number | ((d: any) => number);
  rectRadius?: number;

  // 交互相關
  showTooltip?: boolean;
  tooltipContent?: (d: any) => string;
  enableZoom?: boolean;
  enableDrill?: boolean;
  onNodeClick?: (d: any, event: Event) => void;
  onNodeHover?: (d: any, event: Event) => void;
  onNodeLeave?: (d: any, event: Event) => void;

  // 動畫相關
  animate?: boolean;
  animationDuration?: number;
  animationEase?: string;

  // 排序相關
  sortBy?: 'value' | 'name' | 'custom';
  sortDirection?: 'asc' | 'desc';
  customSortComparator?: (a: any, b: any) => number;

  // 過濾相關
  minNodeValue?: number;
  maxDepth?: number;
  visibleDepths?: number[];

  // 階層標籤相關
  showHierarchicalLabels?: boolean;
  depthColors?: string[];
  depthFontSizes?: number[];
  showParentLabels?: boolean;
  parentLabelOffset?: number;

  // 數值格式化
  valueFormatter?: (value: number) => string;
  valuePrefix?: string;
  valueSuffix?: string;
  showValueBelow?: boolean;

  // 邊框和分隔線
  showBorders?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  hierarchyBorders?: boolean;
  hierarchyLevel?: number;

  // 漸層效果
  enableGradient?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  gradientStops?: Array<{
    offset: string;
    color: string;
    opacity?: number;
  }>;
}

export interface TreeMapProps extends BaseChartProps, TreeMapSpecificProps {}

export interface TreeMapNode {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number;
  parent: TreeMapNode | null;
  children?: TreeMapNode[];
  data: any;
  value?: number;
  id?: string;
  name?: string;
}

export interface TreeMapSpecificState {
  nodes: TreeMapNode[];
  focusedNode: TreeMapNode | null;
  zoomLevel: number;
  hoveredNode: TreeMapNode | null;
  selectedNodes: TreeMapNode[];
}

export interface TreeMapContextType {
  state: TreeMapSpecificState;
  actions: {
    setFocusedNode: (node: TreeMapNode | null) => void;
    setZoomLevel: (level: number) => void;
    setHoveredNode: (node: TreeMapNode | null) => void;
    toggleNodeSelection: (node: TreeMapNode) => void;
    clearSelection: () => void;
    drillDown: (node: TreeMapNode) => void;
    drillUp: () => void;
    resetView: () => void;
  };
}

// 渲染選項類型
export interface TreeMapRenderOptions {
  container: d3.Selection<SVGGElement, unknown, null, undefined>;
  nodes: TreeMapNode[];
  options: TreeMapProps;
  colorScale: d3.ScaleOrdinal<string, string>;
  onNodeClick?: (d: TreeMapNode, event: Event) => void;
  onNodeHover?: (d: TreeMapNode, event: Event) => void;
  onNodeLeave?: (d: TreeMapNode, event: Event) => void;
}

// 工具提示類型
export interface TreeMapTooltipData {
  node: TreeMapNode;
  x: number;
  y: number;
  content: string;
}

// 動畫類型
export interface TreeMapAnimationConfig {
  duration: number;
  ease: d3.EasingFunction;
  delay?: (d: TreeMapNode, i: number) => number;
  onStart?: (d: TreeMapNode) => void;
  onEnd?: (d: TreeMapNode) => void;
}

// 縮放配置
export interface TreeMapZoomConfig {
  enableZoom: boolean;
  zoomScale: [number, number];
  zoomExtent: [[number, number], [number, number]];
  onZoom?: (transform: d3.ZoomTransform) => void;
}

// 下鑽配置
export interface TreeMapDrillConfig {
  enableDrill: boolean;
  drillDepth: number;
  breadcrumbContainer?: string;
  onDrill?: (node: TreeMapNode, path: TreeMapNode[]) => void;
}

// TreeMap utilities are imported directly where needed