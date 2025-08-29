/**
 * Virtual List 組件庫統一入口
 * 提供高性能虛擬滾動解決方案
 */

// 核心引擎
export {
  VirtualScrollEngine,
  AdaptiveVirtualScrollEngine,
  createVirtualScrollEngine,
  type VirtualScrollConfig,
  type VirtualScrollState,
  type VirtualScrollItem
} from '../../core/performance/virtual-scrolling';

// React 組件
export {
  VirtualList,
  VirtualGrid,
  VirtualTable,
  type VirtualListProps,
  type VirtualGridProps,
  type VirtualTableProps,
  type VirtualTableColumn
} from './virtual-list';

// 工具函數
export * from './virtual-utils';

// 預設配置
export const VIRTUAL_LIST_DEFAULTS = {
  itemHeight: 40,
  overscan: 5,
  throttleMs: 16
} as const;

export const VIRTUAL_GRID_DEFAULTS = {
  itemHeight: 120,
  itemWidth: 120,
  columns: 4,
  gap: 8,
  overscan: 2
} as const;

export const VIRTUAL_TABLE_DEFAULTS = {
  rowHeight: 40,
  overscan: 10
} as const;