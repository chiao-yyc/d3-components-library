import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  title: string
  path?: string
  tier?: 1 | 2 | 3
}

// 路由到導航的映射表
const routeMapping: Record<string, BreadcrumbItem> = {
  '/': { title: '專案概覽', tier: 1 },
  '/gallery': { title: '組件庫總覽', tier: 1 },
  
  // 基礎圖表
  '/bar-chart': { title: '長條圖', tier: 2 },
  '/line-chart': { title: '折線圖', tier: 2 },
  '/scatter-plot': { title: '散點圖', tier: 2 },
  '/pie-chart': { title: '圓餅圖', tier: 2 },
  '/area-chart': { title: '區域圖', tier: 2 },
  
  // 進階圖表
  '/heatmap': { title: '熱力圖', tier: 2 },
  '/box-plot': { title: '箱形圖', tier: 2 },
  '/violin-plot': { title: '小提琴圖', tier: 2 },
  '/radar-chart': { title: '雷達圖', tier: 2 },
  '/funnel-chart': { title: '漏斗圖', tier: 2 },
  '/gauge-chart': { title: '儀表盤', tier: 2 },
  '/candlestick': { title: 'K線圖', tier: 2 },
  
  // 組合式架構
  '/simple-components': { title: '簡化組件模式', tier: 2 },
  '/composable-primitives': { title: '完全組合模式', tier: 2 },
  '/combo-chart': { title: '組合圖表展示', tier: 2 },
  '/enhanced-combo-chart': { title: '增強組合圖表', tier: 2 },
  '/area-line-combo': { title: '面積線條組合', tier: 2 },
  
  // 響應式系統
  '/responsive-chart': { title: '響應式圖表', tier: 2 },
  '/responsive-test': { title: '容器測試', tier: 2 },
  '/alignment-test': { title: '對齊策略', tier: 2 },
  
  // 測試與除錯
  '/modular-test': { title: '組件測試', tier: 3 },
  '/data-processor-test': { title: '數據處理測試', tier: 3 },
  '/combo-debug': { title: 'Combo 圖表除錯', tier: 3 },
  '/layer-debug': { title: '圖層調試', tier: 3 },
  
  // 進階工具
  '/data-mapper': { title: '資料映射器', tier: 3 },
  '/correlogram': { title: '相關性分析', tier: 3 },
  '/tree-map': { title: '樹狀結構', tier: 3 }
}

export default function Breadcrumb() {
  const location = useLocation()
  const currentRoute = routeMapping[location.pathname]
  
  if (!currentRoute || location.pathname === '/') {
    return null // 首頁不顯示面包屑
  }
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { title: '首頁', path: '/' }
    ]
    
    // 根據層級添加中間層
    if (currentRoute.tier === 2) {
      breadcrumbs.push({ title: '開發指南' })
    } else if (currentRoute.tier === 3) {
      breadcrumbs.push({ title: '開發者工具' })
    }
    
    // 添加當前頁面
    breadcrumbs.push({ title: currentRoute.title })
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-blue-600 transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className={`${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500'
            }`}>
              {item.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}