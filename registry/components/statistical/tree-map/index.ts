// 主要導出（統一版本）
export { 
  TreeMap,
  TreeMapWithLegacySupport,
  HierarchyTreeMap,
  StratifiedTreeMap,
  ZoomableTreeMap,
  DrillableTreeMap,
  defaultTreeMapProps 
} from './tree-map';
export type { TreeMapProps, TreeMapPropsLegacy } from './tree-map';

// 核心實現導出
export { TreeMapCore } from './core/tree-map-core';
export type { 
  TreeMapCoreConfig, 
  TreeMapData, 
  TreeMapDataPoint
} from './core/tree-map-core';

// 向下兼容類型（舊版本支持）
export type { 
  TreeMapNode, 
  TreeMapSpecificState,
  HierarchyDataItem,
  StratifiedDataItem
} from './types';
export { D3TreeMap } from './core/tree-map';