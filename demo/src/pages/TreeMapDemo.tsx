/**
 * TreeMapDemo - 現代化樹狀圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TreeMap } from '../../../registry/components/statistical/tree-map'
import type { HierarchyDataItem, StratifiedDataItem } from '../../../registry/components/statistical/tree-map/types'
import { 
  DemoPageTemplate,
  ContentSection,
  ModernControlPanel,
  ControlGroup,
  RangeSlider,
  SelectControl,
  ToggleControl,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, Squares2X2Icon, BuildingOffice2Icon } from '@heroicons/react/24/outline'

// 公司組織架構數據
const companyData: HierarchyDataItem = {
  name: "公司",
  children: [
    {
      name: "技術部",
      children: [
        { name: "前端開發", value: 50 },
        { name: "後端開發", value: 80 },
        { name: "移動開發", value: 30 },
        { name: "測試QA", value: 25 }
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
        { name: "客戶服務", value: 15 }
      ]
    },
    {
      name: "管理部",
      children: [
        { name: "人力資源", value: 8 },
        { name: "財務會計", value: 6 },
        { name: "行政管理", value: 5 }
      ]
    }
  ]
}

// 全球市場份額數據
const marketShareData: HierarchyDataItem = {
  name: "全球智慧手機市場",
  children: [
    {
      name: "蘋果",
      children: [
        { name: "iPhone 15", value: 15.2 },
        { name: "iPhone 14", value: 12.8 },
        { name: "iPhone 13", value: 8.5 },
        { name: "其他型號", value: 3.5 }
      ]
    },
    {
      name: "三星",
      children: [
        { name: "Galaxy S24", value: 8.2 },
        { name: "Galaxy A系列", value: 12.5 },
        { name: "Galaxy Note", value: 4.3 },
        { name: "其他型號", value: 5.0 }
      ]
    },
    {
      name: "小米",
      children: [
        { name: "Redmi系列", value: 6.8 },
        { name: "Mi系列", value: 4.2 },
        { name: "其他型號", value: 2.0 }
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
}

// 投資組合數據
const portfolioData: HierarchyDataItem = {
  name: "投資組合",
  children: [
    {
      name: "股票",
      children: [
        { name: "科技股", value: 35.5 },
        { name: "金融股", value: 28.2 },
        { name: "醫療股", value: 15.8 },
        { name: "能源股", value: 12.3 }
      ]
    },
    {
      name: "債券",
      children: [
        { name: "政府債券", value: 18.5 },
        { name: "公司債券", value: 12.8 },
        { name: "市政債券", value: 8.7 }
      ]
    },
    {
      name: "另類投資",
      children: [
        { name: "房地產", value: 15.2 },
        { name: "商品期貨", value: 8.5 },
        { name: "私募股權", value: 6.3 }
      ]
    },
    {
      name: "現金等價物",
      children: [
        { name: "貨幣基金", value: 8.5 },
        { name: "定期存款", value: 5.2 }
      ]
    }
  ]
}

// 平面化數據（Stratified 格式）
const stratifiedData: StratifiedDataItem[] = [
  { id: "root", value: 0 },
  { id: "tech", parent: "root", value: 0 },
  { id: "business", parent: "root", value: 0 },
  { id: "support", parent: "root", value: 0 },
  
  { id: "frontend", parent: "tech", value: 45 },
  { id: "backend", parent: "tech", value: 60 },
  { id: "mobile", parent: "tech", value: 35 },
  { id: "devops", parent: "tech", value: 25 },
  
  { id: "sales", parent: "business", value: 40 },
  { id: "marketing", parent: "business", value: 30 },
  { id: "product", parent: "business", value: 25 },
  
  { id: "hr", parent: "support", value: 15 },
  { id: "finance", parent: "support", value: 12 },
  { id: "legal", parent: "support", value: 8 }
]

// 資料集選項
const datasetOptions = [
  { value: 'company', label: '公司組織架構', description: '展示企業部門人力資源分佈' },
  { value: 'market', label: '市場份額分析', description: '全球智慧手機市場佔有率' },
  { value: 'portfolio', label: '投資組合配置', description: '資產配置和投資比例' },
  { value: 'stratified', label: '平面化結構', description: '使用 Stratified 數據格式' }
]

// 顏色策略選項
const colorStrategyOptions = [
  { value: 'custom', label: '按索引（預設）', description: '使用固定顏色序列' },
  { value: 'depth', label: '按層級深度', description: '不同層級使用不同顏色' },
  { value: 'parent', label: '按父節點', description: '相同父節點使用相似顏色' },
  { value: 'value', label: '按數值大小', description: '數值越大顏色越深' }
]

// 瓦片算法選項
const tileAlgorithmOptions = [
  { value: 'squarify', label: 'Squarify', description: '最佳長寬比，預設推薦' },
  { value: 'binary', label: 'Binary', description: '二分法分割' },
  { value: 'dice', label: 'Dice', description: '垂直分割' },
  { value: 'slice', label: 'Slice', description: '水平分割' }
]

// 標籤對齊選項
const labelAlignmentOptions = [
  { value: 'center', label: '中央對齊' },
  { value: 'top-left', label: '左上角' },
  { value: 'top-right', label: '右上角' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'bottom-right', label: '右下角' }
]

export default function TreeMapDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState<'company' | 'market' | 'portfolio' | 'stratified'>('company')
  const [colorStrategy, setColorStrategy] = useState<'depth' | 'parent' | 'value' | 'custom'>('custom')
  const [tileAlgorithm, setTileAlgorithm] = useState<'squarify' | 'binary' | 'dice' | 'slice'>('squarify')
  
  // 響應式設定
  const aspectRatio = 16/9
  const [responsive, setResponsive] = useState(true)
  const [aspect, setAspect] = useState(16/9)
  
  // 圖表尺寸設定
  const [chartWidth, setChartWidth] = useState(800)
  const [chartHeight, setChartHeight] = useState(600)
  
  const [padding, setPadding] = useState(2)
  const [strokeWidth, setStrokeWidth] = useState(1)
  
  // 樣式設定
  const [strokeColor, setStrokeColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(0.8)
  const [fontSize, setFontSize] = useState(12)
  const [labelAlignment, setLabelAlignment] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center')
  
  // 顯示選項
  const [showLabels, setShowLabels] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config, analysis } = useMemo(() => {
    let data, format, title, description, totalValue = 0
    
    switch (selectedDataset) {
      case 'company':
        data = [companyData]
        format = 'hierarchy' as const
        title = '公司組織架構'
        description = '展示各部門人力資源配置和規模'
        break
      case 'market':
        data = [marketShareData]
        format = 'hierarchy' as const
        title = '全球智慧手機市場'
        description = '各品牌市場份額分佈情況'
        break
      case 'portfolio':
        data = [portfolioData]
        format = 'hierarchy' as const
        title = '投資組合配置'
        description = '資產配置比例和投資分佈'
        break
      case 'stratified':
        data = stratifiedData
        format = 'stratified' as const
        title = '平面化數據結構'
        description = '使用 Stratified 格式的層級數據'
        break
      default:
        data = [companyData]
        format = 'hierarchy' as const
        title = '公司組織架構'
        description = '展示各部門人力資源配置和規模'
    }

    // 計算統計數據
    const calculateHierarchyStats = (node: any): { leafCount: number, maxDepth: number, totalValue: number } => {
      if (node.children) {
        let leafCount = 0
        let maxDepth = 0
        let totalValue = 0
        
        node.children.forEach((child: any) => {
          const childStats = calculateHierarchyStats(child)
          leafCount += childStats.leafCount
          maxDepth = Math.max(maxDepth, childStats.maxDepth)
          totalValue += childStats.totalValue
        })
        
        return { leafCount, maxDepth: maxDepth + 1, totalValue }
      } else {
        return { leafCount: 1, maxDepth: 0, totalValue: node.value || 0 }
      }
    }

    let leafCount = 0, maxDepth = 0
    if (format === 'hierarchy' && Array.isArray(data)) {
      const stats = calculateHierarchyStats(data[0])
      leafCount = stats.leafCount
      maxDepth = stats.maxDepth
      totalValue = stats.totalValue
    } else if (format === 'stratified') {
      leafCount = (data as StratifiedDataItem[]).filter(d => d.value && d.value > 0).length
      totalValue = (data as StratifiedDataItem[]).reduce((sum, d) => sum + (d.value || 0), 0)
      const depths = (data as StratifiedDataItem[]).map(d => (d.id.split('.').length - 1))
      maxDepth = Math.max(...depths)
    }
    
    return {
      currentData: data,
      config: { title, description, format },
      analysis: {
        dataset: datasetOptions.find(d => d.value === selectedDataset)!,
        leafNodes: leafCount,
        maxDepth,
        totalValue,
        algorithm: tileAlgorithmOptions.find(t => t.value === tileAlgorithm)!,
        colorStrategy: colorStrategyOptions.find(c => c.value === colorStrategy)!
      }
    }
  }, [selectedDataset, tileAlgorithm, colorStrategy])

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: config.title },
    { label: '葉節點數', value: analysis.leafNodes },
    { label: '最大深度', value: analysis.maxDepth },
    { label: '圖表模式', value: '響應式', color: '#10b981' },
    { label: '圖表尺寸', value: `比例 ${aspectRatio.toFixed(2)}:1` },
    { label: '瓦片算法', value: analysis.algorithm.label },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格（展示葉節點數據）
  const tableData = useMemo(() => {
    const extractLeafNodes = (node: any, parentName = ''): any[] => {
      if (node.children) {
        return node.children.flatMap((child: any) => 
          extractLeafNodes(child, node.name ? `${parentName} > ${node.name}` : parentName)
        )
      } else {
        return [{
          name: node.name,
          parent: parentName,
          value: node.value,
          percentage: analysis.totalValue > 0 ? ((node.value / analysis.totalValue) * 100).toFixed(1) + '%' : '0%'
        }]
      }
    }

    if (config.format === 'hierarchy' && Array.isArray(currentData)) {
      return extractLeafNodes(currentData[0])
    } else if (config.format === 'stratified') {
      return (currentData as StratifiedDataItem[])
        .filter(d => d.value && d.value > 0)
        .map(d => ({
          name: d.id.split('.').pop() || d.id,
          parent: d.parent || 'root',
          value: d.value,
          percentage: analysis.totalValue > 0 ? ((d.value / analysis.totalValue) * 100).toFixed(1) + '%' : '0%'
        }))
    }
    return []
  }, [currentData, config.format, analysis.totalValue])

  const tableColumns: DataTableColumn[] = [
    { key: 'name', title: '節點名稱', sortable: true },
    { key: 'parent', title: '父節點', sortable: true },
    { 
      key: 'value', 
      title: '數值', 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { 
      key: 'percentage', 
      title: '佔比', 
      sortable: true,
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="TreeMap Demo"
      description="階層樹狀圖組件展示 - 支援多種數據格式、瓦片算法和視覺化選項"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 - 左側 1/4 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
          title="控制面板" 
          icon={<CogIcon className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* 基本設定 */}
            <ControlGroup title="基本設定" icon="⚙️" cols={1}>
              <SelectControl
                label="數據集"
                value={selectedDataset}
                onChange={(value) => setSelectedDataset(value as any)}
                options={datasetOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                description={datasetOptions.find(d => d.value === selectedDataset)?.description}
              />
              
              <SelectControl
                label="顏色策略"
                value={colorStrategy}
                onChange={(value) => setColorStrategy(value as any)}
                options={colorStrategyOptions}
                description={colorStrategyOptions.find(c => c.value === colorStrategy)?.description}
              />
              
              <SelectControl
                label="瓦片算法"
                value={tileAlgorithm}
                onChange={(value) => setTileAlgorithm(value as any)}
                options={tileAlgorithmOptions}
                description={tileAlgorithmOptions.find(t => t.value === tileAlgorithm)?.description}
              />
            </ControlGroup>


            {/* 佈局配置 */}
            <ControlGroup title="佈局配置" icon="📊" cols={1}>
              <RangeSlider
                label="內邊距"
                value={padding}
                min={0}
                max={10}
                step={1}
                onChange={setPadding}
                suffix="px"
              />
            </ControlGroup>

            {/* 樣式配置 */}
            <ControlGroup title="樣式配置" icon="🎨" cols={3}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邊框顏色
                </label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              
              <RangeSlider
                label="邊框寬度"
                value={strokeWidth}
                min={0}
                max={5}
                step={0.5}
                onChange={setStrokeWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="透明度"
                value={opacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={setOpacity}
                formatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
            </ControlGroup>

            {/* 標籤配置 */}
            <ControlGroup title="標籤配置" icon="🏷️" cols={3}>
              <RangeSlider
                label="字體大小"
                value={fontSize}
                min={8}
                max={20}
                step={1}
                onChange={setFontSize}
                suffix="px"
              />
              
              <SelectControl
                label="標籤對齊"
                value={labelAlignment}
                onChange={(value) => setLabelAlignment(value as any)}
                options={labelAlignmentOptions}
              />
              
              <div className="flex flex-col gap-2">
                <ToggleControl
                  label="顯示標籤"
                  checked={showLabels}
                  onChange={setShowLabels}
                />
                <ToggleControl
                  label="顯示數值"
                  checked={showValues}
                  onChange={setShowValues}
                />
              </div>
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={2}>
              <ToggleControl
                label="工具提示"
                checked={showTooltip}
                onChange={setShowTooltip}
                description="懸停時顯示詳細信息"
              />
              
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="樹狀圖載入和變換動畫"
              />
              
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="點擊和懸停交互"
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 右側 3/4 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 圖表展示 */}
        <ChartContainer
          title="圖表預覽"
          subtitle={config.description}
          actions={
            <div className="flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-gray-600">樹狀圖</span>
            </div>
          }
        >
          <div className={responsive ? 'w-full' : 'flex justify-center overflow-x-auto'}>
            <motion.div
              key={`${responsive ? 'responsive' : 'fixed'}-${chartWidth}-${chartHeight}-${aspect}-${selectedDataset}-${tileAlgorithm}-${colorStrategy}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={responsive ? 'w-full' : ''}
            >
              <TreeMap
                data={currentData}
                dataFormat={config.format}
                width={responsive ? undefined : chartWidth}
                height={responsive ? undefined : chartHeight}
                responsive={responsive}
                aspect={responsive ? aspect : undefined}
                minWidth={300}
                maxWidth={1200}
                minHeight={200}
                colorStrategy={colorStrategy}
                tile={tileAlgorithm}
                showLabels={showLabels}
                showValues={showValues}
                labelAlignment={labelAlignment}
                fontSize={fontSize}
                padding={padding}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                showTooltip={showTooltip}
                animate={animate}
                interactive={interactive}
                onNodeClick={(node, event) => {
                  if (interactive) {
                    console.log('TreeMap 節點點擊:', node)
                  }
                }}
                onNodeHover={(node, event) => {
                  if (interactive) {
                    console.log('TreeMap 節點懸停:', node)
                  }
                }}
              />
            </motion.div>
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>

          {/* 統計分析 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">層級結構分析</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 數據統計 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">數據統計</h4>
              <div className="space-y-2 text-sm">
                <div>葉節點: <span className="font-medium text-indigo-600">{analysis.leafNodes}</span></div>
                <div>最大層級: <span className="font-medium text-blue-600">{analysis.maxDepth}</span></div>
                <div>總數值: <span className="font-medium">{analysis.totalValue.toLocaleString()}</span></div>
              </div>
            </motion.div>

            {/* 算法信息 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">算法配置</h4>
              <div className="space-y-2 text-sm">
                <div>瓦片算法: <span className="font-medium">{analysis.algorithm.label}</span></div>
                <div>顏色策略: <span className="font-medium">{analysis.colorStrategy.label}</span></div>
                <div>數據格式: <span className="font-medium">{config.format === 'hierarchy' ? '階層' : '平面化'}</span></div>
              </div>
            </motion.div>

            {/* 視覺配置 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">視覺設定</h4>
              <div className="space-y-2 text-sm">
                <div>尺寸: <span className="font-medium">{chartWidth} × {chartHeight}</span></div>
                <div>字體: <span className="font-medium">{fontSize}px</span></div>
                <div>透明度: <span className="font-medium">{(opacity * 100).toFixed(0)}%</span></div>
              </div>
            </motion.div>

            {/* 功能狀態 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">功能狀態</h4>
              <div className="space-y-2 text-sm">
                <div>標籤: <span className={`font-medium ${showLabels ? 'text-green-600' : 'text-gray-500'}`}>{showLabels ? '開啟' : '關閉'}</span></div>
                <div>數值: <span className={`font-medium ${showValues ? 'text-green-600' : 'text-gray-500'}`}>{showValues ? '開啟' : '關閉'}</span></div>
                <div>交互: <span className={`font-medium ${interactive ? 'text-green-600' : 'text-gray-500'}`}>{interactive ? '開啟' : '關閉'}</span></div>
              </div>
            </motion.div>
          </div>
        </div>

          {/* 數據詳情 */}
        <DataTable
          title="節點數據詳情"
          data={tableData.slice(0, 12)}
          columns={tableColumns}
          maxRows={12}
          showIndex
        />

          {/* 比較展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="不同算法比較"
            subtitle="Squarify vs Binary 算法效果"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Squarify 算法</h5>
                <TreeMap
                  data={[companyData]}
                  width={200}
                  height={140}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  tile="squarify"
                  colorStrategy="depth"
                  showLabels={false}
                  showValues={false}
                  fontSize={8}
                  padding={1}
                />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Binary 算法</h5>
                <TreeMap
                  data={[companyData]}
                  width={200}
                  height={140}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  tile="binary"
                  colorStrategy="depth"
                  showLabels={false}
                  showValues={false}
                  fontSize={8}
                  padding={1}
                />
              </div>
            </div>
          </ChartContainer>

          <ChartContainer
            title="顏色策略比較"
            subtitle="按深度 vs 按數值的顏色映射"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">按層級深度</h5>
                <TreeMap
                  data={[marketShareData]}
                  width={200}
                  height={140}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  colorStrategy="depth"
                  showLabels={false}
                  showValues={true}
                  fontSize={8}
                  padding={1}
                />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">按數值大小</h5>
                <TreeMap
                  data={[marketShareData]}
                  width={200}
                  height={140}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  colorStrategy="value"
                  showLabels={false}
                  showValues={true}
                  fontSize={8}
                  padding={1}
                />
              </div>
            </div>
          </ChartContainer>
        </div>

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { TreeMap } from '@registry/components/statistical/tree-map'

const data = [{
  name: "公司",
  children: [
    {
      name: "技術部", 
      children: [
        { name: "前端開發", value: 50 },
        { name: "後端開發", value: 80 }
      ]
    }
    // ... more data
  ]
}]

${responsive ? `// 響應式模式 - 自動適應容器大小
<TreeMap
  data={data}
  dataFormat="${config.format}"
  responsive={true}
  aspect={${aspect}}
  minWidth={300}
  maxWidth={1200}
  minHeight={200}
  colorStrategy="${colorStrategy}"
  tile="${tileAlgorithm}"
  showLabels={${showLabels}}` : `// 固定尺寸模式
<TreeMap
  data={data}
  dataFormat="${config.format}"
  width={${chartWidth}}
  height={${chartHeight}}
  colorStrategy="${colorStrategy}"
  tile="${tileAlgorithm}"
  showLabels={${showLabels}}`}
  showValues={${showValues}}
  labelAlignment="${labelAlignment}"
  fontSize={${fontSize}}
  padding={${padding}}
  strokeColor="${strokeColor}"
  strokeWidth={${strokeWidth}}
  opacity={${opacity}}
  animate={${animate}}
  interactive={${interactive}}
  onNodeClick={(node) => console.log('點擊節點:', node)}
/>`}
        />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">TreeMap 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">數據支援</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  階層式數據結構
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  平面化 Stratified 格式
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  自動數據驗證
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  動態數據更新
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">算法特性</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  四種瓦片分割算法
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  智能顏色映射策略
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  最佳長寬比優化
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  高效能空間劃分
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  組織架構分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  市場份額展示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full" />
                  資產配置視覺化
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  文件系統結構
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}