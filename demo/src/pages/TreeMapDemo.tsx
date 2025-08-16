import React, { useState } from 'react';
import { TreeMap } from '../../../registry/components/statistical/tree-map';
import type { HierarchyDataItem, StratifiedDataItem } from '../../../registry/components/statistical/tree-map/types';

// 階層數據示例
const hierarchyData: HierarchyDataItem = {
  name: "公司",
  children: [
    {
      name: "技術部",
      children: [
        { name: "前端開發", value: 50 },
        { name: "後端開發", value: 80 },
        { name: "移動開發", value: 30 },
        { name: "測試", value: 25 }
      ]
    },
    {
      name: "產品部",
      children: [
        { name: "產品經理", value: 15 },
        { name: "UI/UX設計", value: 20 },
        { name: "數據分析", value: 12 }
      ]
    },
    {
      name: "市場部",
      children: [
        { name: "市場營銷", value: 18 },
        { name: "商務拓展", value: 22 },
        { name: "客服", value: 15 }
      ]
    },
    {
      name: "管理部",
      children: [
        { name: "人力資源", value: 8 },
        { name: "財務", value: 6 },
        { name: "行政", value: 5 }
      ]
    }
  ]
};

// 平面化數據示例
const stratifiedData: StratifiedDataItem[] = [
  { id: "company", value: 0 },
  { id: "company.tech", parent: "company", value: 0 },
  { id: "company.product", parent: "company", value: 0 },
  { id: "company.marketing", parent: "company", value: 0 },
  { id: "company.admin", parent: "company", value: 0 },
  
  { id: "company.tech.frontend", parent: "company.tech", value: 50 },
  { id: "company.tech.backend", parent: "company.tech", value: 80 },
  { id: "company.tech.mobile", parent: "company.tech", value: 30 },
  { id: "company.tech.testing", parent: "company.tech", value: 25 },
  
  { id: "company.product.pm", parent: "company.product", value: 15 },
  { id: "company.product.design", parent: "company.product", value: 20 },
  { id: "company.product.analytics", parent: "company.product", value: 12 },
  
  { id: "company.marketing.marketing", parent: "company.marketing", value: 18 },
  { id: "company.marketing.bd", parent: "company.marketing", value: 22 },
  { id: "company.marketing.cs", parent: "company.marketing", value: 15 },
  
  { id: "company.admin.hr", parent: "company.admin", value: 8 },
  { id: "company.admin.finance", parent: "company.admin", value: 6 },
  { id: "company.admin.operations", parent: "company.admin", value: 5 }
];

// 市場佔有率數據
const marketShareData: HierarchyDataItem = {
  name: "全球智慧手機市場",
  children: [
    {
      name: "蘋果",
      children: [
        { name: "iPhone 15", value: 15.2 },
        { name: "iPhone 14", value: 12.8 },
        { name: "iPhone 13", value: 8.5 },
        { name: "其他", value: 3.5 }
      ]
    },
    {
      name: "三星",
      children: [
        { name: "Galaxy S24", value: 8.2 },
        { name: "Galaxy A系列", value: 12.5 },
        { name: "Galaxy Note", value: 4.3 },
        { name: "其他", value: 5.0 }
      ]
    },
    {
      name: "小米",
      children: [
        { name: "Redmi", value: 6.8 },
        { name: "Mi系列", value: 4.2 },
        { name: "其他", value: 2.0 }
      ]
    },
    {
      name: "華為",
      children: [
        { name: "Mate系列", value: 3.5 },
        { name: "P系列", value: 2.8 },
        { name: "nova系列", value: 1.7 }
      ]
    },
    {
      name: "其他品牌",
      children: [
        { name: "OPPO", value: 4.5 },
        { name: "vivo", value: 4.2 },
        { name: "OnePlus", value: 1.8 },
        { name: "其他", value: 2.5 }
      ]
    }
  ]
};

export default function TreeMapDemo() {
  const [selectedDataset, setSelectedDataset] = useState<'company' | 'market' | 'stratified'>('company');
  const [selectedStrategy, setSelectedStrategy] = useState<'depth' | 'parent' | 'value'>('depth');
  const [selectedTile, setSelectedTile] = useState<'squarify' | 'binary' | 'dice' | 'slice'>('squarify');
  
  const getCurrentData = () => {
    switch (selectedDataset) {
      case 'market':
        return { data: [marketShareData], format: 'hierarchy' as const };
      case 'stratified':
        return { data: stratifiedData, format: 'stratified' as const };
      case 'company':
      default:
        return { data: [hierarchyData], format: 'hierarchy' as const };
    }
  };

  const { data, format } = getCurrentData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">TreeMap 階層樹狀圖示例</h1>
        <p className="text-gray-600">
          展示階層數據的比例關係，支援多種數據格式和視覺化選項
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">控制選項</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">數據集</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="company">公司組織架構</option>
              <option value="market">市場佔有率</option>
              <option value="stratified">平面化數據</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">顏色策略</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="depth">按層級深度</option>
              <option value="parent">按父節點</option>
              <option value="value">按數值大小</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">瓦片算法</label>
            <select
              value={selectedTile}
              onChange={(e) => setSelectedTile(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="squarify">Squarify（預設）</option>
              <option value="binary">Binary</option>
              <option value="dice">Dice</option>
              <option value="slice">Slice</option>
            </select>
          </div>
        </div>
      </div>

      {/* TreeMap 圖表 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDataset === 'company' && '公司組織架構 TreeMap'}
          {selectedDataset === 'market' && '智慧手機市場佔有率 TreeMap'}
          {selectedDataset === 'stratified' && '平面化數據 TreeMap'}
        </h3>
        
        <div className="overflow-x-auto">
          <TreeMap
          data={data}
          dataFormat={format}
          width={800}
          height={500}
          colorStrategy={selectedStrategy}
          tile={selectedTile}
          showLabels={true}
          showValues={true}
          labelAlignment="center"
          fontSize={12}
          padding={2}
          strokeColor="#ffffff"
          strokeWidth={1}
          opacity={0.8}
          showTooltip={true}
          animate={true}
          interactive={true}
          onNodeClick={(node, event) => {
            console.log('Clicked node:', node);
          }}
          onNodeHover={(node, event) => {
            console.log('Hovered node:', node);
          }}
          />
        </div>
      </div>

      {/* 功能展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">基本 TreeMap</h3>
          <TreeMap
            data={[hierarchyData]}
            width={350}
            height={250}
            showLabels={true}
            showValues={false}
            colorStrategy="depth"
            tile="squarify"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">數值顏色映射</h3>
          <TreeMap
            data={[marketShareData]}
            width={350}
            height={250}
            showLabels={true}
            showValues={true}
            colorStrategy="value"
            tile="binary"
            labelAlignment="top-left"
            fontSize={10}
          />
        </div>
      </div>

      {/* 說明文字 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">TreeMap 特點</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• 支援階層和平面化兩種數據格式</li>
          <li>• 提供多種瓦片分割算法（Squarify、Binary、Dice、Slice等）</li>
          <li>• 彈性的顏色映射策略（按層級、父節點、數值）</li>
          <li>• 智能標籤顯示和位置調整</li>
          <li>• 工具提示和鼠標交互支援</li>
          <li>• 平滑的動畫過渡效果</li>
          <li>• 完全響應式設計</li>
        </ul>
      </div>
    </div>
  );
}