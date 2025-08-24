/**
 * DemoPageTemplate - 現代化 Demo 頁面模板
 * 提供統一的頁面結構、動畫和視覺設計
 */

import React from 'react'
import { motion } from 'framer-motion'
import { designTokens, commonStyles } from '../../design/design-tokens'
import { animationConfig } from '../../design/theme'

export interface DemoPageTemplateProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export const DemoPageTemplate: React.FC<DemoPageTemplateProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <motion.div
      initial={animationConfig.pageTransition.initial}
      animate={animationConfig.pageTransition.animate}
      exit={animationConfig.pageTransition.exit}
      transition={animationConfig.pageTransition.transition}
      className={`min-h-screen bg-gradient-to-br ${designTokens.colors.gradients.primary} ${className}`}
    >
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <PageHeader title={title} description={description} />
        {children}
      </div>
    </motion.div>
  )
}

interface PageHeaderProps {
  title: string
  description: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: designTokens.animation.easing.easeOut }}
      className="text-center space-y-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
      >
        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-700">Demo Playground</span>
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={`${designTokens.typography.heading1} bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent`}
      >
        {title}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className={`${designTokens.typography.bodyLarge} max-w-2xl mx-auto leading-relaxed`}
      >
        {description}
      </motion.p>
    </motion.header>
  )
}

// 子組件：內容區塊
export interface ContentSectionProps {
  title?: string
  className?: string
  children: React.ReactNode
  delay?: number
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  className = '',
  children,
  delay = 0
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.1 + delay,
        ease: designTokens.animation.easing.easeOut 
      }}
      className={`${commonStyles.glassCard} rounded-2xl p-6 ${className}`}
    >
      {title && (
        <h2 className={`${designTokens.typography.heading2} mb-6`}>
          {title}
        </h2>
      )}
      {children}
    </motion.section>
  )
}

// 子組件：網格容器
export interface GridContainerProps {
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export const GridContainer: React.FC<GridContainerProps> = ({
  cols = 3,
  gap = 'md',
  children,
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8'
  }

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

export default DemoPageTemplate