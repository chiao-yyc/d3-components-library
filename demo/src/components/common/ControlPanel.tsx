import React, { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ControlPanelProps {
  title?: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface ControlGroupProps {
  title?: string
  children: ReactNode
  className?: string
}

interface ControlItemProps {
  label: string
  children: ReactNode
  className?: string
  description?: string
}

// 主控制面板組件
export function ControlPanel({ 
  title = "圖表配置", 
  children, 
  className,
  collapsible = false,
  defaultCollapsed = false
}: ControlPanelProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <div className={cn('bg-gray-50 rounded-lg border border-gray-200', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg 
                className={cn('w-4 h-4 transition-transform', collapsed ? 'rotate-90' : '')}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

// 控制組件群組
export function ControlGroup({ title, children, className }: ControlGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider">{title}</h4>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

// 單個控制項
export function ControlItem({ label, children, className, description }: ControlItemProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <span className="text-xs text-gray-500" title={description}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// 預設的控制組件
export function SelectControl({
  value,
  onChange,
  options,
  placeholder = "請選擇...",
  className
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-300 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'bg-white',
        className
      )}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function CheckboxControl({
  checked,
  onChange,
  label,
  className
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}) {
  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

export function SliderControl({
  value,
  onChange,
  min,
  max,
  step = 1,
  className
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span className="font-medium">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function InputControl({
  value,
  onChange,
  type = 'text',
  placeholder,
  className
}: {
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'email' | 'url'
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-300 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'bg-white',
        className
      )}
    />
  )
}