import * as d3 from 'd3';
import { TreeMapNode } from '../tree-map/types';

interface HierarchyDataItem {
  id?: string;
  name?: string;
  value?: number;
  children?: HierarchyDataItem[];
  parent?: string;
}

interface StratifiedDataItem {
  id: string;
  value: number;
  parent?: string;
}

export interface TreeMapOptions {
  width: number;
  height: number;
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  tile?: any; // D3 treemap tiling function
  round?: boolean;
}

export interface HierarchyProcessOptions {
  valueAccessor?: (d: any) => number;
  sortOptions?: {
    sortBy?: 'value' | 'name' | 'custom';
    sortDirection?: 'asc' | 'desc';
    customComparator?: (a: d3.HierarchyNode<any>, b: d3.HierarchyNode<any>) => number;
  };
}

export interface StratifyOptions {
  idAccessor?: (d: any) => string;
  parentIdAccessor?: (d: any) => string | null;
  valueAccessor?: (d: any) => number;
}

/**
 * TreeMapUtils - 階層數據處理工具類
 * 提供 TreeMap 組件所需的數據處理、階層計算和佈局算法
 */
export class TreeMapUtils {
  /**
   * 處理階層式數據格式 (JSON hierarchy data)
   * @param data 階層式數據
   * @param options 處理選項
   * @returns 處理後的階層節點
   */
  static processHierarchyData(
    data: HierarchyDataItem,
    options: HierarchyProcessOptions = {}
  ): d3.HierarchyNode<HierarchyDataItem> {
    const {
      valueAccessor = (d: any) => d.value || 0,
      sortOptions = {}
    } = options;

    const root = d3.hierarchy(data);
    
    // 計算節點值
    root.sum(valueAccessor);

    // 應用排序
    if (sortOptions.sortBy || sortOptions.customComparator) {
      root.sort(this.createSortComparator(sortOptions));
    }

    return root;
  }

  /**
   * 處理分層數據格式 (CSV stratified data)
   * @param data 平面化的分層數據
   * @param options 分層選項
   * @returns 處理後的階層節點
   */
  static processStratifiedData(
    data: StratifiedDataItem[],
    options: StratifyOptions = {}
  ): d3.HierarchyNode<StratifiedDataItem> {
    const {
      idAccessor = (d: any) => d.id,
      parentIdAccessor = (d: any) => {
        const id = d.id || '';
        const lastDot = id.lastIndexOf('.');
        return lastDot >= 0 ? id.substring(0, lastDot) : null;
      },
      valueAccessor = (d: any) => d.value || 0
    } = options;

    const stratify = d3.stratify<StratifiedDataItem>()
      .id(idAccessor)
      .parentId(parentIdAccessor);

    const root = stratify(data);
    
    // 計算節點值並排序
    root.sum(valueAccessor)
      .sort((a, b) => b.height - a.height || (b.value || 0) - (a.value || 0));

    return root;
  }

  /**
   * 計算階層佈局
   * @param root 階層根節點
   * @param options TreeMap 佈局選項
   * @returns TreeMap 節點陣列
   */
  static calculateTreemapLayout(
    root: d3.HierarchyNode<any>,
    options: TreeMapOptions
  ): TreeMapNode[] {
    const {
      width,
      height,
      padding = 1,
      paddingInner,
      paddingOuter,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      tile = d3.treemapSquarify,
      round = true
    } = options;

    const treemap = d3.treemap<any>()
      .size([width, height])
      .round(round)
      .tile(tile);

    // 設置內邊距
    if (paddingInner !== undefined) {
      treemap.paddingInner(paddingInner);
    }
    if (paddingOuter !== undefined) {
      treemap.paddingOuter(paddingOuter);
    }
    if (paddingTop !== undefined) {
      treemap.paddingTop(paddingTop);
    }
    if (paddingRight !== undefined) {
      treemap.paddingRight(paddingRight);
    }
    if (paddingBottom !== undefined) {
      treemap.paddingBottom(paddingBottom);
    }
    if (paddingLeft !== undefined) {
      treemap.paddingLeft(paddingLeft);
    }
    
    // 如果沒有設置具體的內邊距，使用通用的 padding
    if (paddingInner === undefined && paddingOuter === undefined &&
        paddingTop === undefined && paddingRight === undefined &&
        paddingBottom === undefined && paddingLeft === undefined) {
      treemap.padding(padding);
    }

    // 計算佈局
    const layoutRoot = treemap(root);
    
    // 返回葉節點（用於渲染的矩形）
    return layoutRoot.leaves() as TreeMapNode[];
  }

  /**
   * 獲取瓦片算法方法
   * @param method 瓦片算法名稱
   * @returns D3 瓦片算法函數
   */
  static getTilingMethod(method: string): any {
    switch (method.toLowerCase()) {
      case 'binary':
        return d3.treemapBinary;
      case 'dice':
        return d3.treemapDice;
      case 'slice':
        return d3.treemapSlice;
      case 'slicedice':
        return d3.treemapSliceDice;
      case 'resquarify':
        return d3.treemapResquarify;
      case 'squarify':
      default:
        return d3.treemapSquarify;
    }
  }

  /**
   * 計算節點權重
   * @param node 階層節點
   * @param strategy 權重計算策略
   * @returns 節點權重值
   */
  static calculateNodeWeights(
    node: d3.HierarchyNode<any>,
    strategy: 'sum' | 'count' | 'max' | 'custom' = 'sum'
  ): number {
    switch (strategy) {
      case 'count':
        return node.leaves().length;
      case 'max':
        return d3.max(node.leaves(), d => d.value || 0) || 0;
      case 'custom':
        // 可以在此處實現自定義權重計算邏輯
        return node.value || 0;
      case 'sum':
      default:
        return node.value || 0;
    }
  }

  /**
   * 獲取節點的層級顏色
   * @param node TreeMap 節點
   * @param colorScale 顏色比例尺
   * @param depthLevel 要用於顏色映射的層級深度
   * @returns 節點顏色
   */
  static getNodeColor(
    node: TreeMapNode,
    colorScale: d3.ScaleOrdinal<string, string>,
    depthLevel: number = 1
  ): string {
    // 找到指定深度的祖先節點
    let currentNode = node;
    while (currentNode.depth > depthLevel && currentNode.parent) {
      currentNode = currentNode.parent;
    }
    
    // 使用節點ID或數據作為顏色鍵值
    const colorKey = currentNode.data.id || currentNode.data.name || currentNode.data;
    return colorScale(colorKey);
  }

  /**
   * 檢查節點是否適合顯示標籤
   * @param node TreeMap 節點
   * @param minWidth 最小寬度閾值
   * @param minHeight 最小高度閾值
   * @param minArea 最小面積閾值
   * @returns 是否適合顯示標籤
   */
  static shouldShowLabel(
    node: TreeMapNode,
    minWidth: number = 30,
    minHeight: number = 20,
    minArea: number = 500
  ): boolean {
    const width = node.x1 - node.x0;
    const height = node.y1 - node.y0;
    const area = width * height;
    
    return width >= minWidth && height >= minHeight && area >= minArea;
  }

  /**
   * 創建排序比較器
   * @param sortOptions 排序選項
   * @returns 比較器函數
   */
  private static createSortComparator(sortOptions: any) {
    const { sortBy = 'value', sortDirection = 'desc', customComparator } = sortOptions;
    
    if (customComparator) {
      return customComparator;
    }
    
    return (a: d3.HierarchyNode<any>, b: d3.HierarchyNode<any>) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = a.data.name || a.data.id || '';
          const nameB = b.data.name || b.data.id || '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'value':
        default:
          comparison = (a.value || 0) - (b.value || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    };
  }

  /**
   * 格式化節點標籤文字
   * @param node TreeMap 節點
   * @param options 格式化選項
   * @returns 格式化後的標籤文字
   */
  static formatNodeLabel(
    node: TreeMapNode,
    options: {
      showName?: boolean;
      showValue?: boolean;
      nameFormatter?: (name: string) => string;
      valueFormatter?: (value: number) => string;
      separator?: string;
    } = {}
  ): string {
    const {
      showName = true,
      showValue = true,
      nameFormatter = (name) => name,
      valueFormatter = d3.format(','),
      separator = '\n'
    } = options;

    const parts: string[] = [];
    
    if (showName) {
      const name = node.data.name || node.data.id || '';
      if (name) {
        parts.push(nameFormatter(name));
      }
    }
    
    if (showValue && node.value !== undefined) {
      parts.push(valueFormatter(node.value));
    }
    
    return parts.join(separator);
  }
}