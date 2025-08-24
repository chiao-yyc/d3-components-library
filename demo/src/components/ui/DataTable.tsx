/**
 * DataTable - 現代化數據表格組件
 * 提供響應式數據表格展示，支援排序和篩選
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { designTokens, commonStyles } from '../../design/design-tokens'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export interface DataTableColumn {
  key: string
  title: string
  sortable?: boolean
  formatter?: (value: any, row?: any) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps {
  title?: string
  data: any[]
  columns: DataTableColumn[]
  maxRows?: number
  className?: string
  showIndex?: boolean
}

export const DataTable: React.FC<DataTableProps> = ({
  title = "數據詳情",
  data,
  columns,
  maxRows = 10,
  className = '',
  showIndex = false
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(0)

  // 排序邏輯
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })
  }, [data, sortColumn, sortDirection])

  // 分頁數據
  const paginatedData = sortedData.slice(
    currentPage * maxRows,
    (currentPage + 1) * maxRows
  )
  
  const totalPages = Math.ceil(sortedData.length / maxRows)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const formatValue = (value: any, column: DataTableColumn, row: any) => {
    if (column.formatter) {
      return column.formatter(value, row)
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    
    return String(value || '-')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: designTokens.animation.easing.easeOut }}
      className={`${commonStyles.glassCard} rounded-2xl overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
            {title}
          </h3>
          <div className={`${designTokens.typography.caption} text-gray-500`}>
            顯示 {Math.min(paginatedData.length, maxRows)} / {data.length} 筆資料
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              {showIndex && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100/50 transition-colors' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUpIcon className="w-3 h-3 text-blue-500" />
                          ) : (
                            <ChevronDownIcon className="w-3 h-3 text-blue-500" />
                          )
                        ) : (
                          <div className="w-3 h-3 opacity-30">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 12h7v8h6v-8h7L12 2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {showIndex && (
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {currentPage * maxRows + index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-900 text-${column.align || 'left'}`}
                  >
                    {formatValue(row[column.key], column, row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <div className={`${designTokens.typography.caption} text-gray-500`}>
            第 {currentPage + 1} 頁，共 {totalPages} 頁
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一頁
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  currentPage === i
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default DataTable