import { Link } from 'react-router-dom'
import { ExactFunnelChart } from '@registry/components/basic/exact-funnel-chart'

function Home() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            D3 Components Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            即時開發預覽環境，直接引用 Registry 中的組件
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              長條圖組件
            </h3>
            <p className="text-gray-600 mb-4">
              提供互動式長條圖，支援多種資料格式和自訂配置
            </p>
            <Link
              to="/bar-chart"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              查看範例
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              資料映射器
            </h3>
            <p className="text-gray-600 mb-4">
              智慧資料偵測、欄位映射和即時圖表預覽功能
            </p>
            <Link
              to="/data-mapper"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              體驗功能
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              組件庫
            </h3>
            <p className="text-gray-600 mb-4">
              瀏覽所有可用的 D3 組件，查看完整的組件展示
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              瀏覽組件
            </Link>
          </div>
        </div>

        {/* Observable Funnel Chart Demo */}
        <div className="mt-16 bg-white rounded-lg p-8 border shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🎯 Observable Funnel Chart - 完全復刻版本
          </h2>
          <div className="flex justify-center">
            <ExactFunnelChart
              data={[
                { step: 1, value: 62259, label: 'Survey Started' },
                { step: 2, value: 25465, label: 'Completed Survey' },
                { step: 3, value: 405, label: 'Click End Card*' }
              ]}
              width={600}
              height={300}
              background="#2a2a2a"
              gradient1="#FF6B6B"
              gradient2="#4ECDC4"
              values="#ffffff"
              labels="#cccccc"
              percentages="#888888"
            />
          </div>
          <p className="text-gray-600 text-center mt-4">
            完全基於 Observable 範例重新實作的漏斗圖，使用相同的資料和視覺效果
          </p>
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            開發預覽環境特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                即時預覽
              </h3>
              <p className="text-gray-600">
                修改 Registry 組件後立即看到效果，支援熱重載
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                互動控制
              </h3>
              <p className="text-gray-600">
                提供 props 控制面板，即時調整參數和配置
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                多資料測試
              </h3>
              <p className="text-gray-600">
                內建多種測試資料集，驗證組件在不同情境下的表現
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home