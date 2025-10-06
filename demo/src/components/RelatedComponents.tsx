import { Link } from 'react-router-dom'
import { ReactNode } from 'react'
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  FireIcon,
  PuzzlePieceIcon,
  RectangleGroupIcon,
  CircleStackIcon,
  CubeIcon,
  ChartBarIcon,
  ChartPieIcon,
  FunnelIcon,
  ArrowsPointingOutIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
  DevicePhoneMobileIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface RelatedComponent {
  path: string
  name: string
  icon: ReactNode
  description: string
  category: 'basic' | 'advanced' | 'combo' | 'system'
}

interface RelatedComponentsProps {
  currentPath: string
}

// 組件關聯映射
const componentRelations: Record<string, RelatedComponent[]> = {
  '/bar-chart': [
    { path: '/line-chart', name: '折線圖', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, description: '時間序列數據展示', category: 'basic' },
    { path: '/combo-chart', name: '組合圖表', icon: <BoltIcon className="w-5 h-5" />, description: '結合長條圖與其他圖表', category: 'combo' },
    { path: '/heatmap', name: '熱力圖', icon: <FireIcon className="w-5 h-5" />, description: '類別數據的另一種視覺化', category: 'advanced' },
    { path: '/modular-test', name: '組件測試', icon: <PuzzlePieceIcon className="w-5 h-5" />, description: '測試長條圖組件', category: 'system' }
  ],
  '/line-chart': [
    { path: '/area-chart', name: '區域圖', icon: <RectangleGroupIcon className="w-5 h-5" />, description: '填充面積的線條圖', category: 'basic' },
    { path: '/scatter-plot', name: '散點圖', icon: <CircleStackIcon className="w-5 h-5" />, description: '點狀數據分佈', category: 'basic' },
    { path: '/area-line-combo', name: '面積線條組合', icon: <RectangleGroupIcon className="w-5 h-5" />, description: '結合面積圖與線條圖', category: 'combo' },
    { path: '/responsive-chart', name: '響應式圖表', icon: <DevicePhoneMobileIcon className="w-5 h-5" />, description: '響應式線條圖實例', category: 'system' }
  ],
  '/scatter-plot': [
    { path: '/line-chart', name: '折線圖', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, description: '連接散點的趨勢線', category: 'basic' },
    { path: '/box-plot', name: '箱形圖', icon: <CubeIcon className="w-5 h-5" />, description: '統計分佈視覺化', category: 'advanced' },
    { path: '/scatter-regression-combo', name: '散點回歸組合', icon: <CircleStackIcon className="w-5 h-5" />, description: '散點圖與回歸線', category: 'combo' }
  ],
  '/pie-chart': [
    { path: '/bar-chart', name: '長條圖', icon: <ChartBarIcon className="w-5 h-5" />, description: '比例數據的替代展示', category: 'basic' },
    { path: '/funnel-chart', name: '漏斗圖', icon: <FunnelIcon className="w-5 h-5" />, description: '流程轉化視覺化', category: 'advanced' },
    { path: '/tree-map', name: '樹狀結構', icon: <ArrowsPointingOutIcon className="w-5 h-5" />, description: '層級比例視覺化', category: 'advanced' }
  ],
  '/area-chart': [
    { path: '/line-chart', name: '折線圖', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, description: '面積圖的基礎形式', category: 'basic' },
    { path: '/bar-chart', name: '長條圖', icon: <ChartBarIcon className="w-5 h-5" />, description: '類似的數值比較', category: 'basic' },
    { path: '/area-line-combo', name: '面積線條組合', icon: <RectangleGroupIcon className="w-5 h-5" />, description: '組合不同數據系列', category: 'combo' }
  ],
  '/combo-chart': [
    { path: '/enhanced-combo-chart', name: '增強組合圖表', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, description: '更多功能的組合圖', category: 'combo' },
    { path: '/area-line-combo', name: '面積線條組合', icon: <RectangleGroupIcon className="w-5 h-5" />, description: '特定類型組合', category: 'combo' },
    { path: '/simple-components', name: '簡化組件模式', icon: <RocketLaunchIcon className="w-5 h-5" />, description: '了解組合原理', category: 'system' }
  ],
  '/simple-components': [
    { path: '/composable-primitives', name: '完全組合模式', icon: <PuzzlePieceIcon className="w-5 h-5" />, description: '進階組合架構', category: 'system' },
    { path: '/combo-chart', name: '組合圖表展示', icon: <BoltIcon className="w-5 h-5" />, description: '實際組合應用', category: 'combo' },
    { path: '/modular-test', name: '組件測試', icon: <PuzzlePieceIcon className="w-5 h-5" />, description: '測試組合式組件', category: 'system' }
  ]
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'basic': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'advanced': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'combo': return 'bg-green-50 text-green-700 border-green-200'
    case 'system': return 'bg-orange-50 text-orange-700 border-orange-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'basic': return '基礎'
    case 'advanced': return '進階'
    case 'combo': return '組合'
    case 'system': return '系統'
    default: return '其他'
  }
}

export default function RelatedComponents({ currentPath }: RelatedComponentsProps) {
  const relatedComponents = componentRelations[currentPath] || []
  
  if (relatedComponents.length === 0) {
    return null
  }
  
  return (
    <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <LinkIcon className="w-6 h-6 text-gray-700" />
        相關組件推薦
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedComponents.map((component) => (
          <Link
            key={component.path}
            to={component.path}
            className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 group-hover:text-blue-600 transition-colors">{component.icon}</span>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {component.name}
                </h4>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(component.category)}`}>
                {getCategoryLabel(component.category)}
              </span>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
              {component.description}
            </p>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link 
          to="/gallery" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          查看所有組件 
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}