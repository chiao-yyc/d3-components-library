import React from 'react';
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3TreeMap } from './core/tree-map';
import { TreeMapProps } from './types';

/**
 * TreeMap - 專業階層樹狀圖組件
 * 
 * 功能特點：
 * - 支援階層和平面化數據格式
 * - 多種瓦片分割算法
 * - 彈性的顏色映射策略
 * - 智能標籤和數值顯示
 * - 工具提示和互動功能
 * - 縮放和下鑽支援
 * - 豐富的動畫效果
 * 
 * 使用場景：
 * - 組織架構可視化
 * - 檔案系統結構展示
 * - 市場佔有率分析
 * - 預算分配展示
 * - 產品類別比例分析
 * 
 * @example
 * // 基本階層數據樹狀圖
 * <TreeMap 
 *   data={hierarchyData}
 *   valueKey="value"
 *   nameKey="name"
 *   width={800}
 *   height={600}
 * />
 * 
 * @example
 * // 平面化數據樹狀圖
 * <TreeMap 
 *   data={flatData}
 *   dataFormat="stratified"
 *   idKey="id"
 *   parentKey="parent"
 *   colorStrategy="depth"
 *   colorDepth={2}
 * />
 * 
 * @example
 * // 互動式樹狀圖
 * <TreeMap 
 *   data={data}
 *   enableZoom={true}
 *   enableDrill={true}
 *   showTooltip={true}
 *   showLabels={true}
 *   showValues={true}
 *   onNodeClick={(node, event) => console.log('Clicked:', node)}
 * />
 */
const TreeMap = createChartComponent<TreeMapProps>(D3TreeMap);

export { TreeMap };
export type { TreeMapProps } from './types';