/**
 * ChartContainer - 現代化圖表容器
 * 提供統一的圖表展示區域，包含載入狀態和錯誤處理
 */

import React from 'react'
import { motion } from 'framer-motion'
import { designTokens, commonStyles } from '../../design/design-tokens'
import { ResponsiveChart } from './ResponsiveChart'

export interface ChartContainerProps {
  title?: string
  children: React.ReactNode | ((dimensions: { width: number; height: number }) => React.ReactNode)
  loading?: boolean
  error?: string
  className?: string
  actions?: React.ReactNode
  subtitle?: string
  // 響應式選項
  responsive?: boolean
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading = false,
  error,
  className = '',
  actions,
  subtitle,
  responsive = true,
  aspectRatio = 4 / 3,
  minWidth = 300,
  minHeight = 200,
  maxWidth = 1200,
  maxHeight = 800
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${commonStyles.chartContainer} ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`${designTokens.typography.body} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {loading && <ChartSkeleton />}
        {error && <ErrorDisplay error={error} />}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {responsive && typeof children === 'function' ? (
              <ResponsiveChart
                aspectRatio={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
              >
                {children}
              </ResponsiveChart>
            ) : (
              typeof children === 'function' ? 
                children({ width: 800, height: 500 }) : 
                children
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// 圖表骨架屏
const ChartSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
        <div className="space-y-4 w-full max-w-md">
          {/* 模擬圖表結構 */}
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="flex space-x-2">
              <div className="h-4 bg-gray-300 rounded flex-1"></div>
              <div className="h-4 bg-gray-300 rounded flex-1"></div>
              <div className="h-4 bg-gray-300 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 錯誤顯示組件
interface ErrorDisplayProps {
  error: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">圖表載入失敗</h3>
      <p className="text-red-600 text-center max-w-md">{error}</p>
    </div>
  )
}

// 狀態顯示組件 (用於顯示當前圖表狀態)
export interface StatusDisplayProps {
  items: Array<{
    label: string
    value: string | number
    color?: string
  }>
  className?: string
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className={`${designTokens.typography.label} text-blue-800`}>
          當前狀態
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex justify-between items-center"
          >
            <span className={`${designTokens.typography.caption} text-gray-600`}>
              {item.label}:
            </span>
            <span 
              className={`${designTokens.typography.label} text-gray-800`}
              style={{ color: item.color }}
            >
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default ChartContainer