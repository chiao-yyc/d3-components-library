import { NavLink } from 'react-router-dom'
import { ReactNode, useState } from 'react'
import Breadcrumb from './Breadcrumb'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  path: string
  name: string
  icon: string
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
  tier?: 1 | 2 | 3
  description?: string
}

function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['🚀 快速開始', '📊 基礎圖表']))

  const navigationGroups: NavigationGroup[] = [
    // 第一層：快速開始
    {
      title: '🚀 快速開始',
      tier: 1,
      description: '新手入門必看',
      items: [
        { path: '/', name: '專案概覽', icon: '🏠' },
        { path: '/charts-showcase', name: '圖表總覽館', icon: '🏛️' },
        { path: '/gallery', name: '圖表實驗室', icon: '🧪' },
      ]
    },
    
    // 第二層：開發指南  
    {
      title: '📊 基礎圖表',
      tier: 2,
      description: '常用圖表組件',
      items: [
        { path: '/bar-chart', name: '長條圖', icon: '📊' },
        { path: '/line-chart', name: '折線圖', icon: '📈' },
        { path: '/scatter-plot', name: '散點圖', icon: '🔵' },
        { path: '/pie-chart', name: '圓餅圖', icon: '🥧' },
        { path: '/area-chart', name: '區域圖', icon: '🌊' }
      ]
    },
    {
      title: '📈 進階圖表',
      tier: 2,
      description: '專業數據視覺化',
      items: [
        { path: '/heatmap', name: '熱力圖', icon: '🔥' },
        { path: '/box-plot', name: '箱形圖', icon: '📦' },
        { path: '/violin-plot', name: '小提琴圖', icon: '🎻' },
        { path: '/radar-chart', name: '雷達圖', icon: '🎯' },
        { path: '/funnel-chart', name: '漏斗圖', icon: '🎯' },
        { path: '/gauge-chart', name: '儀表盤', icon: '⏱️' },
        { path: '/candlestick', name: 'K線圖', icon: '📊' },
        { path: '/tree-map', name: '樹狀圖', icon: '🌳' },
        { path: '/correlogram', name: '相關性分析', icon: '🔗' }
      ]
    },
    {
      title: '🔧 組合式架構',
      tier: 2,
      description: '靈活的圖表組合系統',
      items: [
        { path: '/simple-components', name: '簡化組件模式', icon: '🚀' },
        { path: '/combo-chart', name: '基礎組合圖表', icon: '⚡' },
        { path: '/enhanced-combo-chart', name: '商業分析組合', icon: '💼' },
        { path: '/area-line-combo', name: '趨勢分析組合', icon: '🌊' },
        { path: '/scatter-regression-combo', name: '統計分析組合', icon: '📊' },
        { path: '/composable-primitives', name: '架構展示組合', icon: '🧩' }
      ]
    },
    {
      title: '🎯 專業應用場景',
      tier: 2,
      description: '特定領域的圖表組合',
      items: [
        { path: '/advanced-combo', name: '進階組合展示', icon: '🚀' },
        { path: '/special-analysis', name: '特殊分析組合', icon: '🔬' },
        { path: '/financial-combo', name: '金融圖表組合', icon: '💰' },
        { path: '/dynamic-combo', name: '動態配置組合', icon: '⚙️' }
      ]
    },
    {
      title: '📱 響應式系統',
      tier: 2,
      description: '適配各種螢幕',
      items: [
        { path: '/responsive-chart', name: '響應式圖表', icon: '📱' },
        { path: '/responsive-test', name: '容器測試', icon: '🧪' }
      ]
    },

    // 第三層：開發者工具
    {
      title: '🧪 測試與除錯',
      tier: 3,
      description: '開發者專用工具',
      items: [
        { path: '/modular-test', name: '組件測試', icon: '🧩' },
        { path: '/data-processor-test', name: '數據處理測試', icon: '🔬' },
        { path: '/performance-test', name: '性能測試', icon: '⚡' },
        { path: '/virtual-scrolling', name: '虛擬滾動', icon: '🚀' },
        { path: '/combo-debug-tools', name: '組合圖表調試工具', icon: '🔧' }
      ]
    },
    {
      title: '🛠️ 進階工具',
      tier: 3,
      description: '提升開發效率',
      items: [
        { path: '/data-mapper', name: '資料映射器', icon: '🗂️' }
      ]
    }
  ]

  const toggleGroup = (groupTitle: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle)
    } else {
      newExpanded.add(groupTitle)
    }
    setExpandedGroups(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 側邊欄 */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* 頂部標題 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-gray-900 transition-all duration-300 ${
              isSidebarOpen ? 'text-lg' : 'text-sm'
            }`}>
              {isSidebarOpen ? 'D3 Components' : 'D3'}
            </h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {/* 三層式分組渲染 */}
            {[1, 2, 3].map(tier => {
              const tierGroups = navigationGroups.filter(group => group.tier === tier)
              if (tierGroups.length === 0) return null
              
              return (
                <div key={tier} className="space-y-2">
                  {/* 層級標題 */}
                  {isSidebarOpen && (
                    <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${
                      tier === 1 ? 'text-green-600 bg-green-50 rounded-md' :
                      tier === 2 ? 'text-blue-600 bg-blue-50 rounded-md' :
                      'text-purple-600 bg-purple-50 rounded-md'
                    }`}>
                      {tier === 1 ? '第一層：快速開始' :
                       tier === 2 ? '第二層：開發指南' :
                       '第三層：開發者工具'}
                    </div>
                  )}
                  
                  {/* 群組項目 */}
                  {tierGroups.map((group) => (
                    <div key={group.title} className="mb-3">
                      <button
                        onClick={() => toggleGroup(group.title)}
                        className={`w-full flex items-center justify-between p-2 text-left rounded-md transition-colors ${
                          isSidebarOpen ? 'hover:bg-gray-100' : 'hover:bg-gray-100'
                        } ${
                          tier === 1 ? 'bg-green-50/50' :
                          tier === 2 ? 'bg-blue-50/50' :
                          'bg-purple-50/50'
                        }`}
                      >
                        <div className="flex-1">
                          <span className={`font-medium ${
                            tier === 1 ? 'text-green-800' :
                            tier === 2 ? 'text-blue-800' :
                            'text-purple-800'
                          } ${isSidebarOpen ? 'text-sm' : 'text-xs'}`}>
                            {isSidebarOpen ? group.title : group.title.split(' ')[0]}
                          </span>
                          {isSidebarOpen && group.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {group.description}
                            </div>
                          )}
                        </div>
                        {isSidebarOpen && (
                          <svg 
                            className={`w-4 h-4 transform transition-transform ${
                              expandedGroups.has(group.title) ? 'rotate-90' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                      
                      {(expandedGroups.has(group.title) || !isSidebarOpen) && (
                        <div className={`mt-2 space-y-1 ${
                          isSidebarOpen ? 'ml-3 pl-3 border-l-2 border-gray-100' : 'ml-0'
                        }`}>
                          {group.items.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center p-2 rounded-md text-sm transition-colors ${
                                  isActive
                                    ? `${
                                        tier === 1 ? 'bg-green-100 text-green-800 border-r-2 border-green-500' :
                                        tier === 2 ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-500' :
                                        'bg-purple-100 text-purple-800 border-r-2 border-purple-500'
                                      }`
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                              title={!isSidebarOpen ? item.name : undefined}
                            >
                              <span className="mr-3">{item.icon}</span>
                              {isSidebarOpen && (
                                <span className="flex-1 truncate">{item.name}</span>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </nav>

        {/* 底部連結 */}
        <div className="p-4 border-t border-gray-200">
          <a
            href="https://github.com/your-repo/d3-components"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
            title={!isSidebarOpen ? 'GitHub' : undefined}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {isSidebarOpen && (
              <span className="ml-3 text-sm">GitHub</span>
            )}
          </a>
        </div>
      </aside>

      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col">
        {/* 頂部導航欄 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">Demo 展示</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">D3 Components v0.1.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* 主要內容 */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
