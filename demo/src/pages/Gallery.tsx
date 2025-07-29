import { BarChart } from '@registry/components/basic/bar-chart/bar-chart'
import { LineChart } from '@registry/components/basic/line-chart/line-chart'
import { ScatterPlot } from '@registry/components/statistical/scatter-plot/scatter-plot'
import { PieChart } from '@registry/components/basic/pie-chart/pie-chart'
import { AreaChart } from '@registry/components/basic/area-chart/area-chart'
import { Heatmap } from '@registry/components/basic/heatmap/heatmap'
import { basicBarData } from '../data/sample-data'

// 生成範例資料
const timeSeriesData = [
  { date: '2024-01-01', value: 120 },
  { date: '2024-01-02', value: 150 },
  { date: '2024-01-03', value: 110 },
  { date: '2024-01-04', value: 180 },
  { date: '2024-01-05', value: 140 },
  { date: '2024-01-06', value: 160 },
  { date: '2024-01-07', value: 170 },
]

const scatterData = [
  { x: 10, y: 20, category: 'A' },
  { x: 15, y: 35, category: 'B' },
  { x: 20, y: 25, category: 'A' },
  { x: 25, y: 45, category: 'C' },
  { x: 30, y: 40, category: 'B' },
  { x: 35, y: 55, category: 'A' },
  { x: 40, y: 50, category: 'C' },
]

const pieData = [
  { category: '產品A', value: 45, region: '北部' },
  { category: '產品B', value: 32, region: '中部' },
  { category: '產品C', value: 28, region: '南部' },
  { category: '產品D', value: 21, region: '東部' },
]

const areaData = [
  { month: '1月', desktop: 45, mobile: 32 },
  { month: '2月', desktop: 48, mobile: 35 },
  { month: '3月', desktop: 52, mobile: 38 },
  { month: '4月', desktop: 49, mobile: 41 },
  { month: '5月', desktop: 55, mobile: 44 },
  { month: '6月', desktop: 58, mobile: 47 },
].flatMap(d => [
  { month: d.month, users: d.desktop, device: 'Desktop' },
  { month: d.month, users: d.mobile, device: 'Mobile' }
])

const heatmapData = [
  { x: 'Mon', y: 'A', value: 1 },
  { x: 'Mon', y: 'B', value: 3 },
  { x: 'Mon', y: 'C', value: 2 },
  { x: 'Tue', y: 'A', value: 4 },
  { x: 'Tue', y: 'B', value: 2 },
  { x: 'Tue', y: 'C', value: 5 },
  { x: 'Wed', y: 'A', value: 3 },
  { x: 'Wed', y: 'B', value: 1 },
  { x: 'Wed', y: 'C', value: 4 },
  { x: 'Thu', y: 'A', value: 5 },
  { x: 'Thu', y: 'B', value: 4 },
  { x: 'Thu', y: 'C', value: 2 },
  { x: 'Fri', y: 'A', value: 2 },
  { x: 'Fri', y: 'B', value: 5 },
  { x: 'Fri', y: 'C', value: 3 },
]

function Gallery() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            組件庫
          </h1>
          <p className="text-gray-600">
            瀏覽所有可用的 D3 組件，包含6種圖表類型
          </p>
        </div>

        <div className="space-y-12">
          {/* 長條圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              長條圖組件 (Bar Chart)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本長條圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本長條圖
                </h3>
                <div className="flex justify-center">
                  <BarChart
                    data={basicBarData}
                    xKey="category"
                    yKey="value"
                    width={350}
                    height={200}
                    colors={['#3b82f6']}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>簡單的長條圖，適合展示分類資料</p>
                </div>
              </div>

              {/* 多色長條圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  多色長條圖
                </h3>
                <div className="flex justify-center">
                  <BarChart
                    data={basicBarData}
                    xKey="category"
                    yKey="value"
                    width={350}
                    height={200}
                    colors={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>每根長條使用不同顏色的彩虹配色</p>
                </div>
              </div>
            </div>
          </section>

          {/* 折線圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              折線圖組件 (Line Chart)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本折線圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本時間序列
                </h3>
                <div className="flex justify-center">
                  <LineChart
                    data={timeSeriesData}
                    xKey="date"
                    yKey="value"
                    width={350}
                    height={200}
                    colors={['#3b82f6']}
                    curve="monotone"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>時間序列資料的基本折線圖</p>
                </div>
              </div>

              {/* 區域填充圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  區域填充圖
                </h3>
                <div className="flex justify-center">
                  <LineChart
                    data={timeSeriesData}
                    xKey="date"
                    yKey="value"
                    width={350}
                    height={200}
                    colors={['#10b981']}
                    curve="cardinal"
                    showArea={true}
                    areaOpacity={0.3}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>帶有區域填充的平滑曲線圖</p>
                </div>
              </div>
            </div>
          </section>

          {/* 散點圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              散點圖組件 (Scatter Plot)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本散點圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本散點圖
                </h3>
                <div className="flex justify-center">
                  <ScatterPlot
                    data={scatterData}
                    xKey="x"
                    yKey="y"
                    width={350}
                    height={200}
                    colors={['#3b82f6']}
                    radius={6}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>基本的散點圖，展示兩個變數的關係</p>
                </div>
              </div>

              {/* 分類散點圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  分類散點圖
                </h3>
                <div className="flex justify-center">
                  <ScatterPlot
                    data={scatterData}
                    xKey="x"
                    yKey="y"
                    colorKey="category"
                    width={350}
                    height={200}
                    colors={['#3b82f6', '#ef4444', '#10b981']}
                    radius={7}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>使用顏色區分不同類別的散點圖</p>
                </div>
              </div>
            </div>
          </section>

          {/* 圓餅圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              圓餅圖組件 (Pie Chart)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本圓餅圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本圓餅圖
                </h3>
                <div className="flex justify-center">
                  <PieChart
                    data={pieData}
                    mapping={{ label: 'category', value: 'value' }}
                    width={350}
                    height={250}
                    showLegend={true}
                    legendPosition="bottom"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>基本的圓餅圖，展示資料比例</p>
                </div>
              </div>

              {/* 甜甜圈圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  甜甜圈圖
                </h3>
                <div className="flex justify-center">
                  <PieChart
                    data={pieData}
                    mapping={{ label: 'category', value: 'value', color: 'region' }}
                    width={350}
                    height={250}
                    innerRadius={60}
                    showLegend={true}
                    legendPosition="bottom"
                    showCenterText={true}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>中空的甜甜圈樣式，帶有中心文字</p>
                </div>
              </div>
            </div>
          </section>

          {/* 區域圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              區域圖組件 (Area Chart)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本區域圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  多系列區域圖
                </h3>
                <div className="flex justify-center">
                  <AreaChart
                    data={areaData}
                    mapping={{ x: 'month', y: 'users', category: 'device' }}
                    width={350}
                    height={200}
                    stackMode="none"
                    gradient={true}
                    showLegend={true}
                    legendPosition="top"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>多系列的區域圖，展示不同類別趨勢</p>
                </div>
              </div>

              {/* 堆疊區域圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  堆疊區域圖
                </h3>
                <div className="flex justify-center">
                  <AreaChart
                    data={areaData}
                    mapping={{ x: 'month', y: 'users', category: 'device' }}
                    width={350}
                    height={200}
                    stackMode="stack"
                    gradient={true}
                    showLegend={true}
                    legendPosition="top"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>累積堆疊的區域圖，展示總量變化</p>
                </div>
              </div>
            </div>
          </section>

          {/* 熱力圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              熱力圖組件 (Heatmap)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 基本熱力圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本熱力圖
                </h3>
                <div className="flex justify-center">
                  <Heatmap
                    data={heatmapData}
                    mapping={{ x: 'x', y: 'y', value: 'value' }}
                    width={300}
                    height={200}
                    colorScheme="blues"
                    showLegend={true}
                    legendPosition="right"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>基本的熱力圖，展示矩陣資料</p>
                </div>
              </div>

              {/* 圓角熱力圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  圓角熱力圖
                </h3>
                <div className="flex justify-center">
                  <Heatmap
                    data={heatmapData}
                    mapping={{ x: 'x', y: 'y', value: 'value' }}
                    width={300}
                    height={200}
                    colorScheme="reds"
                    cellRadius={4}
                    showValues={true}
                    showLegend={true}
                    legendPosition="right"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>圓角格子和數值顯示的熱力圖</p>
                </div>
              </div>
            </div>
          </section>

          {/* 組件特性 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              組件特性
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📱 響應式設計
                </h3>
                <p className="text-gray-600">
                  支援自訂寬度和高度，適應不同螢幕尺寸
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🖱️ 互動功能
                </h3>
                <p className="text-gray-600">
                  內建 hover 效果、工具提示和點擊事件
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎨 自訂配色
                </h3>
                <p className="text-gray-600">
                  支援多種顏色主題和自訂配色方案
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ⚡ 動畫效果
                </h3>
                <p className="text-gray-600">
                  平滑的進場動畫和過渡效果
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔧 高度可配置
                </h3>
                <p className="text-gray-600">
                  豐富的配置選項，滿足各種業務需求
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📘 TypeScript 支援
                </h3>
                <p className="text-gray-600">
                  完整的 TypeScript 類型定義和智能提示
                </p>
              </div>
            </div>
          </section>

          {/* 統計資訊 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              組件庫統計
            </h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">圖表組件</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">20+</div>
                  <div className="text-sm text-gray-600">配置選項</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">TypeScript</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">D3.js</div>
                  <div className="text-sm text-gray-600">強力引擎</div>
                </div>
              </div>
            </div>
          </section>

          {/* 使用說明 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              快速開始
            </h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                基本用法範例
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { BarChart } from '@registry/components/basic/bar-chart'

const data = [
  { category: 'A', value: 30 },
  { category: 'B', value: 80 },
  { category: 'C', value: 45 },
]

function MyComponent() {
  return (
    <BarChart
      data={data}
      xKey="category"
      yKey="value"
      width={600}
      height={400}
      colors={['#3b82f6']}
      animate={true}
      interactive={true}
    />
  )
}`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Gallery