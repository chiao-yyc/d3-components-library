import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '../../utils/cn'
import { suggestMapping, detectColumnType } from '../../utils/data-detector'
import { DataMapperProps, DataMapping, FieldInfo } from './types'

export function DataMapper({
  data,
  chartType = 'bar-chart',
  onMappingChange,
  autoSuggest = true,
  className
}: DataMapperProps) {
  const [mapping, setMapping] = useState<DataMapping>({ x: '', y: '' })
  const [selectedField, setSelectedField] = useState<string | null>(null)

  // 分析資料欄位
  const fieldInfos = useMemo(() => {
    if (!data.length) return []

    const fields: FieldInfo[] = []
    const firstRow = data[0]
    
    Object.keys(firstRow).forEach(fieldName => {
      const values = data.map(row => row[fieldName]).filter(v => v != null)
      const typeInfo = detectColumnType(values)
      const uniqueValues = new Set(values)
      
      fields.push({
        name: fieldName,
        type: typeInfo.type,
        subType: typeInfo.subType,
        format: typeInfo.format,
        confidence: typeInfo.confidence,
        samples: typeInfo.samples,
        nullCount: typeInfo.nullCount,
        uniqueCount: uniqueValues.size,
        suggested: 'x' // 預設值，會在下面更新
      })
    })

    // 獲取建議映射
    if (autoSuggest) {
      const suggestions = suggestMapping(data)
      suggestions.forEach(suggestion => {
        const field = fields.find(f => f.name === suggestion.field)
        if (field) {
          field.suggested = suggestion.suggested
        }
      })
    }

    return fields.sort((a, b) => {
      // 按建議順序排序：x, y, color, size
      const order = { x: 0, y: 1, color: 2, size: 3 }
      return order[a.suggested] - order[b.suggested]
    })
  }, [data, autoSuggest])

  // 自動設定初始映射
  useEffect(() => {
    if (fieldInfos.length > 0 && autoSuggest) {
      const xField = fieldInfos.find(f => f.suggested === 'x')
      const yField = fieldInfos.find(f => f.suggested === 'y')
      
      if (xField && yField) {
        const newMapping = { x: xField.name, y: yField.name }
        setMapping(newMapping)
        onMappingChange(newMapping)
      }
    }
  }, [fieldInfos, autoSuggest, onMappingChange])

  const handleMappingChange = (axis: keyof DataMapping, fieldName: string) => {
    const newMapping = { ...mapping, [axis]: fieldName }
    setMapping(newMapping)
    onMappingChange(newMapping)
  }

  const getFieldsByType = (targetAxis: 'x' | 'y' | 'color' | 'size') => {
    switch (targetAxis) {
      case 'x':
        return fieldInfos.filter(f => 
          f.type === 'string' || f.type === 'date' || f.suggested === 'x'
        )
      case 'y':
        return fieldInfos.filter(f => 
          f.type === 'number' || f.suggested === 'y'
        )
      case 'color':
        return fieldInfos.filter(f => 
          f.type === 'string' || f.type === 'boolean' || 
          (f.type === 'number' && f.uniqueCount <= 10)
        )
      case 'size':
        return fieldInfos.filter(f => f.type === 'number')
      default:
        return fieldInfos
    }
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'number': return '🔢'
      case 'string': return '📝'
      case 'date': return '📅'
      case 'boolean': return '✅'
      default: return '❓'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* 欄位映射控制 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* X 軸選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X 軸欄位
          </label>
          <select
            value={mapping.x}
            onChange={(e) => handleMappingChange('x', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選擇 X 軸欄位</option>
            {getFieldsByType('x').map(field => (
              <option key={field.name} value={field.name}>
                {getFieldIcon(field.type)} {field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>

        {/* Y 軸選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Y 軸欄位
          </label>
          <select
            value={mapping.y}
            onChange={(e) => handleMappingChange('y', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選擇 Y 軸欄位</option>
            {getFieldsByType('y').map(field => (
              <option key={field.name} value={field.name}>
                {getFieldIcon(field.type)} {field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>

        {/* 顏色映射（選用） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            顏色分組 (選用)
          </label>
          <select
            value={mapping.color || ''}
            onChange={(e) => handleMappingChange('color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">無分組</option>
            {getFieldsByType('color').map(field => (
              <option key={field.name} value={field.name}>
                {getFieldIcon(field.type)} {field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>

        {/* 大小映射（選用） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            大小映射 (選用)
          </label>
          <select
            value={mapping.size || ''}
            onChange={(e) => handleMappingChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">固定大小</option>
            {getFieldsByType('size').map(field => (
              <option key={field.name} value={field.name}>
                {getFieldIcon(field.type)} {field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 欄位分析面板 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          欄位分析
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fieldInfos.map(field => (
            <div
              key={field.name}
              className={cn(
                'bg-white rounded-lg p-3 border cursor-pointer transition-colors',
                selectedField === field.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => setSelectedField(
                selectedField === field.name ? null : field.name
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">
                  {getFieldIcon(field.type)} {field.name}
                </span>
                <span className={cn('text-xs', getConfidenceColor(field.confidence))}>
                  {Math.round(field.confidence * 100)}%
                </span>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>類型: {field.type}</div>
                <div>唯一值: {field.uniqueCount}</div>
                {field.nullCount > 0 && (
                  <div>空值: {field.nullCount}</div>
                )}
                <div className="text-blue-600">
                  建議: {field.suggested}
                </div>
              </div>
              
              {selectedField === field.name && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    <div className="font-medium mb-1">樣本資料:</div>
                    {field.samples.slice(0, 3).map((sample, i) => (
                      <div key={i} className="truncate">
                        {String(sample)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 映射總結 */}
      {(mapping.x || mapping.y) && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            當前映射配置
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            {mapping.x && <div>📈 X 軸: {mapping.x}</div>}
            {mapping.y && <div>📊 Y 軸: {mapping.y}</div>}
            {mapping.color && <div>🎨 顏色: {mapping.color}</div>}
            {mapping.size && <div>📏 大小: {mapping.size}</div>}
          </div>
        </div>
      )}
    </div>
  )
}