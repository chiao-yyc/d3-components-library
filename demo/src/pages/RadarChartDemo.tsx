import { useState, useMemo } from 'react'
import { RadarChart } from '@registry/components/statistical/radar-chart/radar-chart'

// 員工技能評估數據
const skillAssessmentData = [
  {
    name: '張小明',
    技術能力: 85,
    溝通能力: 75,
    領導力: 60,
    創新思維: 90,
    團隊合作: 80,
    問題解決: 88
  },
  {
    name: '李小華',
    技術能力: 70,
    溝通能力: 95,
    領導力: 85,
    創新思維: 75,
    團隊合作: 90,
    問題解決: 80
  },
  {
    name: '王小美',
    技術能力: 95,
    溝通能力: 65,
    領導力: 70,
    創新思維: 85,
    團隊合作: 75,
    問題解決: 92
  }
]

// 產品特性比較數據
const productComparisonData = [
  {
    product: 'iPhone 15',
    效能: 95,
    相機: 90,
    電池: 80,
    設計: 95,
    價格: 60,
    生態系統: 95
  },
  {
    product: 'Samsung S24',
    效能: 90,
    相機: 95,
    電池: 85,
    設計: 85,
    價格: 70,
    生態系統: 80
  },
  {
    product: 'Google Pixel 8',
    效能: 85,
    相機: 100,
    電池: 75,
    設計: 80,
    價格: 80,
    生態系統: 85
  }
]

// 學科成績數據
const academicPerformanceData = [
  {
    student: '學生A',
    數學: 88,
    物理: 92,
    化學: 85,
    英文: 78,
    國文: 82,
    歷史: 75,
    地理: 80
  },
  {
    student: '學生B',
    數學: 75,
    物理: 80,
    化學: 78,
    英文: 95,
    國文: 90,
    歷史: 88,
    地理: 85
  },
  {
    student: '學生C',
    數學: 95,
    物理: 88,
    化學: 90,
    英文: 85,
    國文: 80,
    歷史: 70,
    地理: 75
  }
]

// 市場分析數據
const marketAnalysisData = [
  {
    company: '公司A',
    市場佔有率: 85,
    品牌知名度: 90,
    產品品質: 88,
    客戶滿意度: 82,
    創新能力: 75,
    財務狀況: 80,
    競爭優勢: 85
  },
  {
    company: '公司B',
    市場佔有率: 70,
    品牌知名度: 85,
    產品品質: 95,
    客戶滿意度: 90,
    創新能力: 88,
    財務狀況: 85,
    競爭優勢: 80
  },
  {
    company: '公司C',
    市場佔有率: 60,
    品牌知名度: 70,
    產品品質: 92,
    客戶滿意度: 88,
    創新能力: 95,
    財務狀況: 75,
    競爭優勢: 78
  }
]

export default function RadarChartDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('skills')
  const [radius, setRadius] = useState(180)
  const [levels, setLevels] = useState(5)
  const [startAngle, setStartAngle] = useState(-90)
  const [clockwise, setClockwise] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showGridLabels, setShowGridLabels] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [showAxisLabels, setShowAxisLabels] = useState(true)
  const [showDots, setShowDots] = useState(true)
  const [showArea, setShowArea] = useState(true)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [areaOpacity, setAreaOpacity] = useState(0.25)
  const [dotRadius, setDotRadius] = useState(4)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, currentAxes, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'skills':
        return {
          currentData: skillAssessmentData,
          currentAxes: ['技術能力', '溝通能力', '領導力', '創新思維', '團隊合作', '問題解決'],
          config: {
            title: '員工技能評估分析',
            description: '多維度技能能力雷達圖比較',
            colors: ['#3b82f6', '#ef4444', '#10b981'],
            labelKey: 'name'
          }
        }
      
      case 'products':
        return {
          currentData: productComparisonData,
          currentAxes: ['效能', '相機', '電池', '設計', '價格', '生態系統'],
          config: {
            title: '智慧手機產品比較',
            description: '多維度產品特性分析',
            colors: ['#374151', '#1f2937', '#6366f1'],
            labelKey: 'product'
          }
        }
      
      case 'academic':
        return {
          currentData: academicPerformanceData,
          currentAxes: ['數學', '物理', '化學', '英文', '國文', '歷史', '地理'],
          config: {
            title: '學科成績表現分析',
            description: '學生各科目成績雷達圖',
            colors: ['#f59e0b', '#8b5cf6', '#06b6d4'],
            labelKey: 'student'
          }
        }
      
      case 'market':
        return {
          currentData: marketAnalysisData,
          currentAxes: ['市場佔有率', '品牌知名度', '產品品質', '客戶滿意度', '創新能力', '財務狀況', '競爭優勢'],
          config: {
            title: '企業市場競爭力分析',
            description: '多維度企業競爭力評估',
            colors: ['#dc2626', '#059669', '#7c2d12'],
            labelKey: 'company'
          }
        }
      
      default:
        return {
          currentData: skillAssessmentData,
          currentAxes: ['技術能力', '溝通能力', '領導力', '創新思維', '團隊合作', '問題解決'],
          config: {
            title: '雷達圖',
            description: '',
            colors: [],
            labelKey: 'name'
          }
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Radar Chart Demo
        </h1>
        <p className="text-gray-600">
          雷達圖組件展示 - 適用於多維數據可視化、能力評估和績效比較
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          圖表設定
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 資料集選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資料集
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="skills">員工技能評估</option>
              <option value="products">產品特性比較</option>
              <option value="academic">學科成績表現</option>
              <option value="market">市場競爭分析</option>
            </select>
          </div>

          {/* 半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              雷達圖半徑 ({radius}px)
            </label>
            <input
              type="range"
              min="100"
              max="250"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 網格層級 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              網格層級數 ({levels})
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={levels}
              onChange={(e) => setLevels(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 起始角度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              起始角度 ({startAngle}°)
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={startAngle}
              onChange={(e) => setStartAngle(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              -90° = 頂部開始，0° = 右側開始
            </p>
          </div>

          {/* 線條寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              線條寬度 ({strokeWidth}px)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 區域透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              區域透明度 ({(areaOpacity * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={areaOpacity}
              onChange={(e) => setAreaOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 數據點半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              數據點半徑 ({dotRadius}px)
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={dotRadius}
              onChange={(e) => setDotRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 圖例位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖例位置
            </label>
            <select
              value={legendPosition}
              onChange={(e) => setLegendPosition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">頂部</option>
              <option value="bottom">底部</option>
              <option value="left">左側</option>
              <option value="right">右側</option>
            </select>
          </div>

          {/* 顏色主題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顏色主題
            </label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">自訂</option>
              <option value="blues">藍色系</option>
              <option value="greens">綠色系</option>
              <option value="oranges">橙色系</option>
              <option value="reds">紅色系</option>
              <option value="purples">紫色系</option>
            </select>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="clockwise"
                checked={clockwise}
                onChange={(e) => setClockwise(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="clockwise" className="text-sm text-gray-700">
                順時針方向
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showGrid" className="text-sm text-gray-700">
                顯示網格
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGridLabels"
                checked={showGridLabels}
                onChange={(e) => setShowGridLabels(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showGridLabels" className="text-sm text-gray-700">
                顯示網格標籤
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAxes"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showAxes" className="text-sm text-gray-700">
                顯示軸線
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAxisLabels"
                checked={showAxisLabels}
                onChange={(e) => setShowAxisLabels(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showAxisLabels" className="text-sm text-gray-700">
                顯示軸標籤
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showDots"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showDots" className="text-sm text-gray-700">
                顯示數據點
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showArea"
                checked={showArea}
                onChange={(e) => setShowArea(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showArea" className="text-sm text-gray-700">
                顯示區域填充
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLegend"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLegend" className="text-sm text-gray-700">
                顯示圖例
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="animate"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="animate" className="text-sm text-gray-700">
                動畫效果
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="interactive"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="interactive" className="text-sm text-gray-700">
                互動功能
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表展示 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {config.title}
        </h2>
        <p className="text-gray-600 mb-6">{config.description}</p>
        
        <div className="flex justify-center">
          <RadarChart
            data={currentData}
            axes={currentAxes}
            labelKey={config.labelKey}
            width={600}
            height={600}
            radius={radius}
            levels={levels}
            startAngle={startAngle}
            clockwise={clockwise}
            showGrid={showGrid}
            showGridLabels={showGridLabels}
            showAxes={showAxes}
            showAxisLabels={showAxisLabels}
            showDots={showDots}
            showArea={showArea}
            strokeWidth={strokeWidth}
            areaOpacity={areaOpacity}
            dotRadius={dotRadius}
            showLegend={showLegend}
            legendPosition={legendPosition}
            colors={colorScheme === 'custom' ? config.colors : undefined}
            colorScheme={colorScheme}
            animate={animate}
            interactive={interactive}
            onSeriesClick={(data) => {
              console.log('Series clicked:', data)
              alert(`點擊了: ${data.label}`)
            }}
            onSeriesHover={(data) => {
              console.log('Series hovered:', data)
            }}
            onDotClick={(value, series) => {
              console.log('Dot clicked:', value, series)
              alert(`${series.label} - ${value.axis}: ${value.originalValue}`)
            }}
            onDotHover={(value, series) => {
              if (value && series) {
                console.log('Dot hovered:', value, series)
              }
            }}
          />
        </div>
      </div>

      {/* 數據詳情表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          資料詳情
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  {config.labelKey === 'name' ? '姓名' : 
                   config.labelKey === 'product' ? '產品' :
                   config.labelKey === 'student' ? '學生' : 
                   config.labelKey === 'company' ? '公司' : '名稱'}
                </th>
                {currentAxes.map((axis, index) => (
                  <th key={index} className="px-4 py-2 text-left font-medium text-gray-700">
                    {axis}
                  </th>
                ))}
                <th className="px-4 py-2 text-left font-medium text-gray-700">平均分</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row: any, index: number) => {
                const values = currentAxes.map(axis => row[axis])
                const average = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
                
                return (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {row[config.labelKey]}
                    </td>
                    {currentAxes.map((axis, axisIndex) => (
                      <td key={axisIndex} className="px-4 py-2 text-gray-900">
                        {row[axis]}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {average.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { RadarChart } from '@registry/components/statistical/radar-chart'

const data = [
  { name: '張小明', 技術能力: 85, 溝通能力: 75, 領導力: 60 },
  { name: '李小華', 技術能力: 70, 溝通能力: 95, 領導力: 85 }
]

const axes = ['技術能力', '溝通能力', '領導力', '創新思維', '團隊合作']

<RadarChart
  data={data}
  axes={axes}
  labelKey="${config.labelKey}"
  width={600}
  height={600}
  radius={${radius}}
  levels={${levels}}
  startAngle={${startAngle}}
  clockwise={${clockwise}}
  showGrid={${showGrid}}
  showGridLabels={${showGridLabels}}
  showAxes={${showAxes}}
  showAxisLabels={${showAxisLabels}}
  showDots={${showDots}}
  showArea={${showArea}}
  strokeWidth={${strokeWidth}}
  areaOpacity={${areaOpacity}}
  dotRadius={${dotRadius}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}
  onSeriesClick={(data) => console.log('Clicked:', data)}
  onDotClick={(value, series) => console.log('Dot:', value, series)}
/>`}</code>
        </pre>
      </div>

      {/* 雷達圖應用指南 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          雷達圖應用指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">適用場景</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>人才評估:</strong> 員工技能、能力評估</li>
              <li><strong>產品比較:</strong> 多維度產品特性分析</li>
              <li><strong>績效分析:</strong> 團隊、部門績效對比</li>
              <li><strong>學習評量:</strong> 學科成績、學習成果</li>
              <li><strong>市場分析:</strong> 企業競爭力評估</li>
              <li><strong>品質控制:</strong> 產品品質多維度評估</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">設計要點</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>軸數量:</strong> 建議 3-8 個維度，避免過於複雜</li>
              <li><strong>數值範圍:</strong> 確保各維度數值在相同範圍內</li>
              <li><strong>顏色選擇:</strong> 使用對比明顯的顏色區分系列</li>
              <li><strong>透明度:</strong> 適當的區域透明度避免重疊遮擋</li>
              <li><strong>標籤清晰:</strong> 軸標籤要簡潔明瞭</li>
              <li><strong>互動性:</strong> 提供詳細的提示信息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}