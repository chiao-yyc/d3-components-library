import { BarChart } from '@registry/components/bar-chart/bar-chart'
import { basicBarData, salesData, populationData } from '../data/sample-data'

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