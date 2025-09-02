// 舊版本 (向下兼容)
export { TreeMap } from './tree-map';
export type { 
  TreeMapProps, 
  TreeMapNode, 
  TreeMapSpecificState,
  HierarchyDataItem,
  StratifiedDataItem
} from './types';
export { D3TreeMap } from './core/tree-map';

// 新版本 (推薦使用)
export { 
  TreeMapV2, 
  TreeMapWithLegacySupport,
  HierarchyTreeMapV2,
  StratifiedTreeMapV2,
  ZoomableTreeMapV2,
  DrillableTreeMapV2,
  defaultTreeMapProps 
} from './tree-map-v2';
export type { TreeMapV2Props } from './tree-map-v2';
export { TreeMapCore } from './core/tree-map-core';
export type { 
  TreeMapCoreConfig, 
  TreeMapData, 
  TreeMapDataPoint
} from './core/tree-map-core';