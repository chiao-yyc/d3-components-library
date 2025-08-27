import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            D3 Components
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            一個基於 shadcn/ui 理念、可組合的 D3.js 圖表庫。提供完全透明、可客製化的組件，讓您無須從零開始。
          </p>
        </div>

        {/* 主要導航卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/gallery" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 組件庫總覽</h3>
            <p className="text-gray-600">瀏覽所有可用的圖表組件，快速預覽效果。</p>
          </Link>

          <Link to="/simple-components" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 核心架構</h3>
            <p className="text-gray-600">漸進式複雜度設計：簡化組件到完全組合。</p>
          </Link>

          <Link to="/combo-chart" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ 組合圖表</h3>
            <p className="text-gray-600">多種圖表類型組合，實現複雜的數據視覺化。</p>
          </Link>

          <Link to="/data-mapper" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🛠️ 開發者工具</h3>
            <p className="text-gray-600">資料映射、測試工具和除錯助手。</p>
          </Link>
        </div>

        {/* 三層式學習架構 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📚</span>
            三層式學習架構
          </h2>
          
          {/* 第一層：快速開始 */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-green-800">第一層：快速開始</h3>
                <span className="ml-auto text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">新手入門</span>
              </div>
              <p className="text-gray-600 mb-4">從基礎概念開始，快速了解專案架構和組件庫。</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <span className="mr-2">🏠</span>
                  <span className="font-medium">專案概覽</span>
                </Link>
                <Link to="/gallery" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <span className="mr-2">🎨</span>
                  <span className="font-medium">組件庫總覽</span>
                </Link>
              </div>
            </div>

            {/* 第二層：開發指南 */}
            <div className="bg-white rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-800">第二層：開發指南</h3>
                <span className="ml-auto text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">進階開發</span>
              </div>
              <p className="text-gray-600 mb-4">掌握具體圖表實作和組合式架構設計。</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">基礎圖表</h4>
                  <Link to="/bar-chart" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">📊 長條圖</Link>
                  <Link to="/line-chart" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">📈 折線圖</Link>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">進階圖表</h4>
                  <Link to="/box-plot" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">📦 箱形圖</Link>
                  <Link to="/heatmap" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">🔥 熱力圖</Link>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">組合架構</h4>
                  <Link to="/simple-components" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">🚀 簡化組件</Link>
                  <Link to="/combo-chart" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">⚡ 組合圖表</Link>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">響應式系統</h4>
                  <Link to="/responsive-chart" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">📱 響應式圖表</Link>
                  <Link to="/alignment-test" className="block text-sm text-blue-700 hover:text-blue-900 hover:underline">🎯 對齊策略</Link>
                </div>
              </div>
            </div>

            {/* 第三層：開發者工具 */}
            <div className="bg-white rounded-lg p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <h3 className="text-lg font-semibold text-purple-800">第三層：開發者工具</h3>
                <span className="ml-auto text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">專家級</span>
              </div>
              <p className="text-gray-600 mb-4">深入使用測試工具和進階功能，提升開發效率。</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">🧪 測試與除錯</h4>
                  <Link to="/modular-test" className="block text-sm text-purple-700 hover:text-purple-900 hover:underline">🧩 組件測試</Link>
                  <Link to="/combo-debug" className="block text-sm text-purple-700 hover:text-purple-900 hover:underline">🔧 Combo 除錯</Link>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">🛠️ 進階工具</h4>
                  <Link to="/data-mapper" className="block text-sm text-purple-700 hover:text-purple-900 hover:underline">🗂️ 資料映射</Link>
                  <Link to="/tree-map" className="block text-sm text-purple-700 hover:text-purple-900 hover:underline">🌳 樹狀結構</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CLI 快速上手 */}
        <div className="mt-16 bg-gray-800 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">5 分鐘快速上手</h2>
          <p className="text-gray-300 mb-6">使用我們的 CLI 工具，只需一個命令即可將任何圖表組件添加到您的專案中。</p>
          <div className="bg-black rounded-md p-4 font-mono text-sm">
            npx d3-components add bar-chart
          </div>
        </div>

        {/* 環境特色 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Demo 環境特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                即時預覽
              </h3>
              <p className="text-gray-600">
                修改 Registry 組件後立即看到效果，支援熱重載。
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                互動控制
              </h3>
              <p className="text-gray-600">
                提供 props 控制面板，即時調整參數和配置。
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                多資料測試
              </h3>
              <p className="text-gray-600">
                內建多種測試資料集，驗證組件在不同情境下的表現。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
