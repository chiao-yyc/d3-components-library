import { NavLink } from 'react-router-dom'
import { ReactNode, useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const [isChartsDropdownOpen, setIsChartsDropdownOpen] = useState(false)
  const [isAdvancedDropdownOpen, setIsAdvancedDropdownOpen] = useState(false)

  const basicCharts = [
    { path: '/bar-chart', name: '長條圖' },
    { path: '/line-chart', name: '折線圖' },
    { path: '/scatter-plot', name: '散點圖' },
    { path: '/pie-chart', name: '圓餅圖' },
    { path: '/area-chart', name: '區域圖' },
    { path: '/heatmap', name: '熱力圖' }
  ]

  const advancedCharts = [
    { path: '/gauge-chart', name: '儀表盤' },
    { path: '/funnel-chart', name: '漏斗圖' },
    { path: '/box-plot', name: '箱形圖' },
    { path: '/violin-plot', name: '小提琴圖' },
    { path: '/radar-chart', name: '雷達圖' },
    { path: '/candlestick', name: 'K線圖' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  D3 Components Demo
                </h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  首頁
                </NavLink>

                {/* 簡化組件 */}
                <NavLink
                  to="/simple-components"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  🚀 簡化組件
                </NavLink>

                <NavLink
                  to="/combo-chart"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  🔧 組合圖表
                </NavLink>

                <NavLink
                  to="/enhanced-combo-chart"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  ⚡ 增強組合圖表
                </NavLink>

                {/* 基礎圖表下拉 */}
                <div className="relative">
                  <button
                    onClick={() => setIsChartsDropdownOpen(!isChartsDropdownOpen)}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    基礎圖表
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isChartsDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg rounded-md py-1">
                      {basicCharts.map((chart) => (
                        <NavLink
                          key={chart.path}
                          to={chart.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsChartsDropdownOpen(false)}
                        >
                          {chart.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* 進階圖表下拉 */}
                <div className="relative">
                  <button
                    onClick={() => setIsAdvancedDropdownOpen(!isAdvancedDropdownOpen)}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    進階圖表
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isAdvancedDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg rounded-md py-1">
                      {advancedCharts.map((chart) => (
                        <NavLink
                          key={chart.path}
                          to={chart.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAdvancedDropdownOpen(false)}
                        >
                          {chart.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                <NavLink
                  to="/gallery"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  組件庫
                </NavLink>

                <NavLink
                  to="/data-mapper"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  資料映射
                </NavLink>

                <NavLink
                  to="/modular-test"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  模組測試
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-repo/d3-components"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout