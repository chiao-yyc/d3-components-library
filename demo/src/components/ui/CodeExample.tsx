/**
 * CodeExample - 現代化代碼展示組件
 * 提供語法高亮的代碼展示，支援複製功能
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { designTokens, commonStyles } from '../../design/design-tokens'
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

export interface CodeExampleProps {
  title?: string
  code: string
  language?: string
  showCopyButton?: boolean
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export const CodeExample: React.FC<CodeExampleProps> = ({
  title = "使用範例",
  code,
  language = "typescript",
  showCopyButton = true,
  className = '',
  collapsible = false,
  defaultExpanded = true
}) => {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: designTokens.animation.easing.easeOut }}
      className={`${commonStyles.glassCard} rounded-2xl overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          
          <h3 className={`${designTokens.typography.heading4} text-gray-800`}>
            {title}
          </h3>
          
          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {language}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {collapsible && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-gray-200/50 hover:bg-gray-200 transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </motion.button>
          )}
          
          {showCopyButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>已複製</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <ClipboardIcon className="w-4 h-4" />
                    <span>複製</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: designTokens.animation.easing.easeOut }}
          >
            <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto text-sm leading-relaxed">
              <code className={`language-${language}`}>
                {code}
              </code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 多個代碼範例的容器
export interface CodeExamplesProps {
  examples: Array<{
    title: string
    code: string
    language?: string
  }>
  className?: string
}

export const CodeExamples: React.FC<CodeExamplesProps> = ({ examples, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {examples.map((example, index) => (
        <CodeExample
          key={index}
          title={example.title}
          code={example.code}
          language={example.language}
        />
      ))}
    </div>
  )
}

export default CodeExample