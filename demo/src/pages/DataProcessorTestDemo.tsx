import { useState } from 'react'
import { analyzeSingleValue, analyzeBatchValues, SingleValueAnalysis } from '@registry/utils/single-value-detector'
import { 
  DemoPageTemplate,
  ContentSection,
  ModernControlPanel,
  ControlGroup,
  ChartContainer,
  StatusDisplay
} from '../components/ui'

export default function DataProcessorTestDemo() {
  const [singleValue, setSingleValue] = useState('')
  const [batchValues, setBatchValues] = useState('')
  const [singleAnalysis, setSingleAnalysis] = useState<SingleValueAnalysis | null>(null)
  const [batchAnalysis, setBatchAnalysis] = useState<any>(null)

  const handleSingleValueTest = () => {
    if (singleValue.trim() === '') return
    
    // 嘗試轉換為適當的類型
    let processedValue: any = singleValue
    
    // 嘗試轉換為數字
    const numValue = Number(singleValue)
    if (!isNaN(numValue) && singleValue.trim() !== '') {
      processedValue = numValue
    }
    // 嘗試轉換為布林值
    else if (singleValue.toLowerCase() === 'true') {
      processedValue = true
    } else if (singleValue.toLowerCase() === 'false') {
      processedValue = false
    }
    
    const analysis = analyzeSingleValue(processedValue)
    setSingleAnalysis(analysis)
  }

  const handleBatchTest = () => {
    if (batchValues.trim() === '') return
    
    // 解析批次值（以逗號或換行分隔）
    const values = batchValues
      .split(/[,\\n]/)
      .map(v => v.trim())
      .filter(v => v !== '')
      .map(v => {
        // 嘗試轉換類型
        const numValue = Number(v)
        if (!isNaN(numValue) && v.trim() !== '') return numValue
        if (v.toLowerCase() === 'true') return true
        if (v.toLowerCase() === 'false') return false
        return v
      })
    
    const analysis = analyzeBatchValues(values)
    setBatchAnalysis(analysis)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      number: 'bg-blue-100 text-blue-800',
      string: 'bg-gray-100 text-gray-800',
      date: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const exampleValues = [
    { label: '日期範例', values: ['2024-01-01', '2024/01/02', '2024年1月3日', '1704067200'] },
    { label: '數字範例', values: ['123', '$1,234.56', '45.67%', '1.23e-4'] },
    { label: '布林範例', values: ['true', 'false', 'yes', 'no', '1', '0'] },
    { label: '混合範例', values: ['100', '2024-01-01', 'Category A', 'true'] }
  ]

  // 狀態顯示數據
  const statusItems = [
    { label: '單一值狀態', value: singleAnalysis ? `${singleAnalysis.detectedType} (${(singleAnalysis.confidence * 100).toFixed(0)}%)` : '未測試' },
    { label: '批次值狀態', value: batchAnalysis ? `${batchAnalysis.overallType} (${batchAnalysis.analyses?.length || 0} 項)` : '未測試' },
    { label: '測試模式', value: '互動式檢測' }
  ]

  return (
    <DemoPageTemplate
      title="DataProcessor 類型檢測測試"
      description="測試 DataProcessor 如何識別不同類型的資料，了解類型判斷邏輯和準確度評估"
    >
      {/* 快速範例區塊 */}
      <ContentSection>
        <ChartContainer
          title="快速測試範例"
          subtitle="點擊範例值快速測試不同的資料類型檢測"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exampleValues.map((example, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800">{example.label}</h4>
                <div className="space-y-2">
                  {example.values.map((value, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSingleValue(value)
                        // 自動分析
                        setTimeout(() => {
                          let processedValue: any = value
                          const numValue = Number(value)
                          if (!isNaN(numValue) && value.trim() !== '') {
                            processedValue = numValue
                          } else if (value.toLowerCase() === 'true') {
                            processedValue = true
                          } else if (value.toLowerCase() === 'false') {
                            processedValue = false
                          }
                          setSingleAnalysis(analyzeSingleValue(processedValue))
                        }, 100)
                      }}
                      className="text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 text-blue-700 px-3 py-2 rounded-lg block w-full text-left transition-all duration-200 hover:shadow-sm font-medium"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>
      </ContentSection>

      {/* 主測試區塊 */}
      <ContentSection delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 單一值測試 */}
          <ChartContainer
            title="單一值類型檢測"
            subtitle="輸入任意值進行即時類型分析"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                輸入測試值
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  placeholder="輸入任何值：數字、日期、文字..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleSingleValueTest()}
                />
                <button
                  onClick={handleSingleValueTest}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  分析
                </button>
              </div>
            </div>

            {singleAnalysis && (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">檢測結果</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white shadow-sm ${getConfidenceColor(singleAnalysis.confidence)}`}>
                      信心度: {(singleAnalysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${getTypeColor(singleAnalysis.detectedType)}`}>
                      {singleAnalysis.detectedType}
                    </span>
                    {singleAnalysis.subType && (
                      <span className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 shadow-sm">
                        {singleAnalysis.subType}
                      </span>
                    )}
                    {singleAnalysis.format && (
                      <span className="px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">
                        {singleAnalysis.format}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4 bg-blue-50/50 rounded-lg mb-3">
                    <p className="text-sm text-gray-800">
                      <strong className="text-blue-800">推理分析：</strong> {singleAnalysis.reasoning}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-sm text-gray-800 block mb-2">建議用途：</strong>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {singleAnalysis.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </ChartContainer>

          {/* 批次值測試 */}
          <ChartContainer
            title="批次值類型檢測"
            subtitle="一次測試多個值的類型識別能力"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                輸入多個值（用逗號或換行分隔）
              </label>
              <div className="space-y-3">
                <textarea
                  value={batchValues}
                  onChange={(e) => setBatchValues(e.target.value)}
                  placeholder="例如：100, 2024-01-01, Category A, true&#10;或每行一個值"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white/70 backdrop-blur-sm transition-all resize-none"
                />
                <button
                  onClick={handleBatchTest}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  批次分析
                </button>
              </div>
            </div>

            {batchAnalysis && (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">整體分析結果</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white shadow-sm ${getConfidenceColor(batchAnalysis.confidence)}`}>
                      信心度: {(batchAnalysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${getTypeColor(batchAnalysis.overallType)}`}>
                      主要類型: {batchAnalysis.overallType}
                    </span>
                  </div>
                  
                  <div className="p-4 bg-green-50/50 rounded-lg mb-4">
                    <p className="text-sm text-gray-800">
                      <strong className="text-green-800">分析摘要：</strong> {batchAnalysis.summary}
                    </p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">個別項目分析：</h4>
                    <div className="space-y-2">
                      {batchAnalysis.analyses.map((analysis: SingleValueAnalysis, i: number) => (
                        <div key={i} className="bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-gray-100 text-xs shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <code className="bg-gray-100/80 px-2 py-1 rounded font-mono font-medium">{JSON.stringify(analysis.value)}</code>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTypeColor(analysis.detectedType)}`}>
                                {analysis.detectedType}
                              </span>
                              <span className={`text-xs font-bold ${getConfidenceColor(analysis.confidence)}`}>
                                {(analysis.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          {analysis.format && (
                            <div className="text-gray-600 font-medium">格式: <span className="text-gray-800">{analysis.format}</span></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ChartContainer>
        </div>
      </ContentSection>

      {/* 使用說明區域 */}
      <ContentSection delay={0.2}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-3">
            <span className="text-2xl">📖</span>
            使用說明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 text-lg">單一值測試</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  測試 DataProcessor 如何判斷單一值的類型
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  會顯示檢測類型、信心度和格式信息
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  適合理解類型檢測邏輯
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 text-lg">批次值測試</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  模擬 DataProcessor 處理整個欄位的行為
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  基於多個值計算整體類型和信心度
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  更接近實際使用場景
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}