import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'

interface DataTableProps {
  data: any[]
  title?: string
  maxRows?: number
  className?: string
  showTypes?: boolean
  excludeColumns?: string[]
  formatters?: { [key: string]: (value: any) => string }
}

export function DataTable({ 
  data, 
  title = "數據預覽", 
  maxRows = 10, 
  className,
  showTypes = true,
  excludeColumns = [],
  formatters = {}
}: DataTableProps) {
  const { columns, rows, types } = useMemo(() => {
    if (!data || !data.length) return { columns: [], rows: [], types: {} }
    
    // 獲取所有列名
    const allColumns = Object.keys(data[0])
    const columns = allColumns.filter(col => !excludeColumns.includes(col))
    
    // 推斷數據類型
    const types: { [key: string]: string } = {}
    if (showTypes) {
      columns.forEach(col => {
        const sample = data.find(d => d[col] !== null && d[col] !== undefined)?.[col]
        if (sample === null || sample === undefined) {
          types[col] = 'null'
        } else if (typeof sample === 'number') {
          types[col] = 'number'
        } else if (typeof sample === 'boolean') {
          types[col] = 'boolean'
        } else if (sample instanceof Date) {
          types[col] = 'date'
        } else if (typeof sample === 'string' && !isNaN(Date.parse(sample))) {
          types[col] = 'date'
        } else {
          types[col] = 'string'
        }
      })
    }
    
    // 限制行數
    const rows = data.slice(0, maxRows)
    
    return { columns, rows, types }
  }, [data, maxRows, excludeColumns, showTypes])

  const formatValue = (value: any, column: string): string => {
    if (value === null || value === undefined) return '-'
    
    // 使用自定義格式器
    if (formatters[column]) {
      return formatters[column](value)
    }
    
    // 根據類型格式化
    const type = types[column]
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString()
    } else if (type === 'date') {
      const date = value instanceof Date ? value : new Date(value)
      return date.toLocaleDateString()
    } else if (type === 'boolean') {
      return value ? '是' : '否'
    }
    
    return String(value)
  }

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'number': '🔢',
      'string': '🔤',
      'date': '📅',
      'boolean': '✓',
      'null': '∅'
    }
    return iconMap[type] || '❓'
  }

  if (!data || !data.length) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-8', className)}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">無數據</div>
          <div className="text-sm">沒有可顯示的數據</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{rows.length} / {data.length} 行</span>
            <span>{columns.length} 列</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-2">
                    <span>{column}</span>
                    {showTypes && (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        title={`類型: ${types[column]}`}
                      >
                        {getTypeIcon(types[column])}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(row[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length > maxRows && (
        <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
          顯示前 {maxRows} 行，共 {data.length} 行數據
        </div>
      )}
    </div>
  )
}