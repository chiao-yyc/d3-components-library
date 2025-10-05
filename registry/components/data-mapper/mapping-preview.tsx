import { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { BarChart } from '../basic/bar-chart'
import { MappingPreviewProps, /* DataMapping */ } from './types'

export function MappingPreview({
  data,
  mapping,
  chartType = 'bar-chart',
  width = 600,
  height = 400,
  className
}: MappingPreviewProps) {
  // 處理資料以匹配映射
  const processedData = useMemo(() => {
    if (!data.length || !mapping.x || !mapping.y) return []
    
    return data.map((row, index) => ({
      x: row[mapping.x],
      y: Number(row[mapping.y]) || 0,
      color: mapping.color ? row[mapping.color] : undefined,
      size: mapping.size ? Number(row[mapping.size]) || 1 : undefined,
      originalData: row,
      index
    })).filter(item => 
      item.x != null && !isNaN(item.y)
    )
  }, [data, mapping])

  // 生成顏色映射
  const colorMapping = useMemo(() => {
    if (!mapping.color || !processedData.length) return {}

    const uniqueColors = [...new Set(processedData.map((d: any) => d.color).filter(Boolean))]
    const colorPalette = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ]
    
    const mapping_obj: Record<string, string> = {}
    uniqueColors.forEach((color, index) => {
      mapping_obj[String(color)] = colorPalette[index % colorPalette.length]
    })
    
    return mapping_obj
  }, [mapping.color, processedData])

  // 獲取顏色陣列
  const colors = useMemo(() => {
    if (!mapping.color || !processedData.length) {
      return ['#3b82f6']
    }

    return processedData.map((d: any) =>
      colorMapping[String(d.color)] || '#3b82f6'
    )
  }, [mapping.color, processedData, colorMapping])

  // 統計資訊
  const statistics = useMemo(() => {
    if (!processedData.length) return null

    const values = processedData.map((d: any) => d.y)
    const sum = values.reduce((a: any, b: any) => a + b, 0)
    const mean = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return {
      count: processedData.length,
      sum: sum.toLocaleString(),
      mean: mean.toFixed(2),
      min: min.toLocaleString(),
      max: max.toLocaleString()
    }
  }, [processedData])

  const isEmpty = !mapping.x || !mapping.y || processedData.length === 0

  if (isEmpty) {
    return (
      <div className={cn('w-full', className)}>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            圖表預覽
          </h3>
          <p className="text-gray-600">
            請選擇 X 軸和 Y 軸欄位以查看圖表預覽
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* 圖表標題和描述 */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            圖表預覽
          </h3>
          <span className="text-sm text-gray-500">
            {chartType}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>📈 X 軸: {mapping.x}</div>
          <div>📊 Y 軸: {mapping.y}</div>
          {mapping.color && <div>🎨 顏色分組: {mapping.color}</div>}
          {mapping.size && <div>📏 大小映射: {mapping.size}</div>}
        </div>
      </div>

      {/* 圖表 */}
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex justify-center">
          {chartType === 'bar-chart' && (
            <BarChart
              data={processedData}
              xKey="x"
              yKey="y"
              width={width}
              height={height}
              colors={colors}
              interactive={true}
              animate={false}
            />
          )}
        </div>
      </div>

      {/* 統計資訊 */}
      {statistics && (
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            資料統計
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.count}
              </div>
              <div className="text-xs text-gray-500">資料點</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.sum}
              </div>
              <div className="text-xs text-gray-500">總和</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.mean}
              </div>
              <div className="text-xs text-gray-500">平均</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statistics.min}
              </div>
              <div className="text-xs text-gray-500">最小值</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {statistics.max}
              </div>
              <div className="text-xs text-gray-500">最大值</div>
            </div>
          </div>
        </div>
      )}

      {/* 顏色圖例 */}
      {mapping.color && Object.keys(colorMapping).length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            顏色圖例
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(colorMapping).map(([label, color]) => (
              <div key={label} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 資料表格預覽 */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            資料預覽
          </h4>
          <span className="text-xs text-gray-500">
            顯示前 5 筆資料
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  {mapping.x}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">
                  {mapping.y}
                </th>
                {mapping.color && (
                  <th className="px-3 py-2 text-left font-medium text-gray-700">
                    {mapping.color}
                  </th>
                )}
                {mapping.size && (
                  <th className="px-3 py-2 text-left font-medium text-gray-700">
                    {mapping.size}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {processedData.slice(0, 5).map((row: any, index: number) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-3 py-2 text-gray-900">
                    {String(row.x)}
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {row.y.toLocaleString()}
                  </td>
                  {mapping.color && (
                    <td className="px-3 py-2 text-gray-900">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: colorMapping[String(row.color)] }}
                        />
                        <span>{String(row.color)}</span>
                      </div>
                    </td>
                  )}
                  {mapping.size && (
                    <td className="px-3 py-2 text-gray-900">
                      {row.size?.toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}