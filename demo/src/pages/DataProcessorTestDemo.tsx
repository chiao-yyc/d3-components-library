import { useState } from 'react'
import { analyzeSingleValue, analyzeBatchValues, SingleValueAnalysis } from '@registry/utils/single-value-detector'

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

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DataProcessor 類型檢測測試</h1>
        <p className="text-gray-600">
          測試 DataProcessor 如何識別不同類型的資料，了解類型判斷邏輯
        </p>
      </div>

      {/* 快速範例 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">快速測試範例</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exampleValues.map((example, index) => (
            <div key={index} className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">{example.label}</h4>
              <div className="space-y-1">
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
                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded block w-full text-left"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 單一值測試 */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">單一值類型檢測</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              輸入值
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                placeholder="輸入任何值：數字、日期、文字..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSingleValueTest()}
              />
              <button
                onClick={handleSingleValueTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                分析
              </button>
            </div>
          </div>

          {singleAnalysis && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">檢測結果</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(singleAnalysis.confidence)}`}>
                    信心度: {(singleAnalysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(singleAnalysis.detectedType)}`}>
                    {singleAnalysis.detectedType}
                  </span>
                  {singleAnalysis.subType && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      {singleAnalysis.subType}
                    </span>
                  )}
                  {singleAnalysis.format && (
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {singleAnalysis.format}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  <strong>推理：</strong> {singleAnalysis.reasoning}
                </p>
                
                <div>
                  <strong className="text-sm text-gray-700">建議用途：</strong>
                  <ul className="text-sm text-gray-600 mt-1">
                    {singleAnalysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="ml-2">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 批次值測試 */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">批次值類型檢測</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              輸入多個值（用逗號或換行分隔）
            </label>
            <div className="space-y-2">
              <textarea
                value={batchValues}
                onChange={(e) => setBatchValues(e.target.value)}
                placeholder="例如：100, 2024-01-01, Category A, true&#10;或每行一個值"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleBatchTest}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                批次分析
              </button>
            </div>
          </div>

          {batchAnalysis && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">整體結果</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(batchAnalysis.confidence)}`}>
                    信心度: {(batchAnalysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(batchAnalysis.overallType)}`}>
                    主要類型: {batchAnalysis.overallType}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">
                  {batchAnalysis.summary}
                </p>
                
                <div className="max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">個別分析：</h4>
                  <div className="space-y-2">
                    {batchAnalysis.analyses.map((analysis: SingleValueAnalysis, i: number) => (
                      <div key={i} className="bg-white p-3 rounded border text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <code className="bg-gray-100 px-1 rounded">{JSON.stringify(analysis.value)}</code>
                          <div className="flex items-center gap-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${getTypeColor(analysis.detectedType)}`}>
                              {analysis.detectedType}
                            </span>
                            <span className={`text-xs ${getConfidenceColor(analysis.confidence)}`}>
                              {(analysis.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        {analysis.format && (
                          <div className="text-gray-600">格式: {analysis.format}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 說明區域 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📖 使用說明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">單一值測試</h4>
            <ul className="space-y-1">
              <li>• 測試 DataProcessor 如何判斷單一值的類型</li>
              <li>• 會顯示檢測類型、信心度和格式信息</li>
              <li>• 適合理解類型檢測邏輯</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">批次值測試</h4>
            <ul className="space-y-1">
              <li>• 模擬 DataProcessor 處理整個欄位的行為</li>
              <li>• 基於多個值計算整體類型和信心度</li>
              <li>• 更接近實際使用場景</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}