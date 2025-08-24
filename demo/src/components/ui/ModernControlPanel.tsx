/**
 * ModernControlPanel - 現代化控制面板組件
 * 提供玻璃擬態風格的控制面板，支援分組和動畫效果
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { designTokens, commonStyles } from '../../design/design-tokens'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

export interface ModernControlPanelProps {
  title?: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
  icon?: React.ReactNode
}

export const ModernControlPanel: React.FC<ModernControlPanelProps> = ({
  title = "控制面板",
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true,
  icon
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: designTokens.animation.easing.easeOut }}
      className={`${commonStyles.controlPanel} ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* 裝飾性漸變條 */}
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          
          {icon && (
            <div className="text-blue-500">
              {icon}
            </div>
          )}
          
          <h2 className={`${designTokens.typography.heading2} text-gray-800`}>
            {title}
          </h2>
        </div>

        {collapsible && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: designTokens.animation.easing.easeOut }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 控制組件組
export interface ControlGroupProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}

export const ControlGroup: React.FC<ControlGroupProps> = ({
  title,
  children,
  icon,
  className = '',
  cols = 3
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        {icon && <span className="text-blue-500 text-sm">{icon}</span>}
        <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
          {title}
        </h3>
      </div>
      
      <div className={`grid ${colClasses[cols]} gap-4`}>
        {children}
      </div>
    </motion.div>
  )
}

// 控制項容器
export interface ControlItemProps {
  label: string
  children: React.ReactNode
  description?: string
  className?: string
}

export const ControlItem: React.FC<ControlItemProps> = ({
  label,
  children,
  description,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`space-y-2 ${className}`}
    >
      <label className={`block ${designTokens.typography.label}`}>
        {label}
      </label>
      {children}
      {description && (
        <p className={`${designTokens.typography.caption} mt-1`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}

// 範圍滑桿組件
export interface RangeSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  suffix?: string
  className?: string
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
  className = ''
}) => {
  return (
    <ControlItem label={`${label}: ${value}${suffix}`} className={className}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
    </ControlItem>
  )
}

// 選擇框組件
export interface SelectControlProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}

export const SelectControl: React.FC<SelectControlProps> = ({
  label,
  value,
  options,
  onChange,
  className = ''
}) => {
  return (
    <ControlItem label={label} className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${commonStyles.input} ${designTokens.typography.body}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </ControlItem>
  )
}

// 開關組件
export interface ToggleControlProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  className?: string
}

export const ToggleControl: React.FC<ToggleControlProps> = ({
  label,
  checked,
  onChange,
  description,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-start space-x-3 ${className}`}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
      </div>
      <div className="flex-1">
        <label className={`${designTokens.typography.label} cursor-pointer`}>
          {label}
        </label>
        {description && (
          <p className={`${designTokens.typography.caption} mt-1`}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ModernControlPanel