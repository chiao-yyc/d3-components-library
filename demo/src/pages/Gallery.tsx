import { BarChart } from '@registry/components/bar-chart/bar-chart'
import { LineChart } from '@registry/components/line-chart/line-chart'
import { ScatterPlot } from '@registry/components/scatter-plot/scatter-plot'
import { basicBarData, salesData, populationData } from '../data/sample-data'

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

function Gallery() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            組件庫
          </h1>
          <p className="text-gray-600">
            瀏覽所有可用的 D3 組件
          </p>
        </div>

        <div className="space-y-12">
          {/* 長條圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              長條圖組件
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
                    width={400}
                    height={250}
                    colors={['#3b82f6']}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>簡單的長條圖，適合展示分類資料</p>
                </div>
              </div>

              {/* 銷售資料長條圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  銷售資料圖表
                </h3>
                <div className="flex justify-center">
                  <BarChart
                    data={salesData}
                    xKey="month"
                    yKey="sales"
                    width={400}
                    height={250}
                    colors={['#10b981']}
                    showGrid={true}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>月度銷售資料展示，包含網格線</p>
                </div>
              </div>

              {/* 人口統計長條圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  人口統計圖表
                </h3>
                <div className="flex justify-center">
                  <BarChart
                    data={populationData}
                    xKey="ageGroup"
                    yKey="population"
                    width={400}
                    height={250}
                    colors={['#8b5cf6']}
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>人口統計資料，調整邊距以容納較長標籤</p>
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
                    width={400}
                    height={250}
                    colors={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6']}
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
              折線圖組件
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
                    width={400}
                    height={250}
                    colors={['#3b82f6']}
                    curve="monotone"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>時間序列資料的基本折線圖</p>
                </div>
              </div>

              {/* 區域圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  區域填充圖
                </h3>
                <div className="flex justify-center">
                  <LineChart
                    data={timeSeriesData}
                    xKey="date"
                    yKey="value"
                    width={400}
                    height={250}
                    colors={['#10b981']}
                    curve="cardinal"
                    showArea={true}
                    areaOpacity={0.2}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>帶有區域填充的平滑曲線圖</p>
                </div>
              </div>

              {/* 點狀折線圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  點狀折線圖
                </h3>
                <div className="flex justify-center">
                  <LineChart
                    data={timeSeriesData}
                    xKey="date"
                    yKey="value"
                    width={400}
                    height={250}
                    colors={['#ef4444']}
                    showDots={true}
                    dotRadius={5}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>顯示資料點的折線圖</p>
                </div>
              </div>

              {/* 階梯圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  階梯圖
                </h3>
                <div className="flex justify-center">
                  <LineChart
                    data={timeSeriesData}
                    xKey="date"
                    yKey="value"
                    width={400}
                    height={250}
                    colors={['#f59e0b']}
                    curve="step"
                    showDots={true}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>階梯式折線圖，適合展示離散資料</p>
                </div>
              </div>
            </div>
          </section>

          {/* 散點圖組件 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              散點圖組件
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
                    width={400}
                    height={250}
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
                    width={400}
                    height={250}
                    colors={['#3b82f6', '#ef4444', '#10b981']}
                    radius={7}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>使用顏色區分不同類別的散點圖</p>
                </div>
              </div>

              {/* 趨勢線散點圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  趨勢線分析
                </h3>
                <div className="flex justify-center">
                  <ScatterPlot
                    data={scatterData}
                    xKey="x"
                    yKey="y"
                    width={400}
                    height={250}
                    colors={['#6366f1']}
                    radius={6}
                    showTrendline={true}
                    trendlineColor="#ef4444"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>包含趨勢線的散點圖，用於相關性分析</p>
                </div>
              </div>

              {/* 大小映射散點圖 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  泡泡圖
                </h3>
                <div className="flex justify-center">
                  <ScatterPlot
                    data={scatterData.map(d => ({ ...d, size: d.y }))}
                    xKey="x"
                    yKey="y"
                    sizeKey="size"
                    colorKey="category"
                    width={400}
                    height={250}
                    colors={['#8b5cf6', '#ec4899', '#f97316']}
                    sizeRange={[4, 12]}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>泡泡大小映射第三個維度的資料</p>
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
                  響應式設計
                </h3>
                <p className="text-gray-600">
                  支援自訂寬度和高度，適應不同螢幕尺寸
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  互動功能
                </h3>
                <p className="text-gray-600">
                  內建 hover 效果和提示框功能
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  自訂配色
                </h3>
                <p className="text-gray-600">
                  支援單色或多色配色方案
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  彈性邊距
                </h3>
                <p className="text-gray-600">
                  可自訂圖表邊距，適應不同標籤長度
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  資料驗證
                </h3>
                <p className="text-gray-600">
                  自動檢測資料格式，確保圖表正確渲染
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  TypeScript 支援
                </h3>
                <p className="text-gray-600">
                  完整的 TypeScript 類型定義
                </p>
              </div>
            </div>
          </section>

          {/* 使用說明 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              使用說明
            </h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                基本用法
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { BarChart } from '@registry/components/bar-chart/bar-chart'

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