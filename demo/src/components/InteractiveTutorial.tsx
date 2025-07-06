import React, { useState } from 'react'

interface TutorialStep {
  title: string
  content: string
  code?: string
  highlight?: string
}

interface InteractiveTutorialProps {
  title: string
  steps: TutorialStep[]
  children: React.ReactNode
}

export default function InteractiveTutorial({ title, steps, children }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 標題欄 */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-90">
              互動教學 ({currentStep + 1}/{steps.length})
            </span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* 教學內容 */}
      {isExpanded && (
        <div className="border-b border-gray-200">
          <div className="p-4">
            {/* 步驟導航 */}
            <div className="flex space-x-2 mb-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* 當前步驟內容 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {steps[currentStep]?.title}
              </h4>
              
              <div className="text-gray-700 leading-relaxed">
                {steps[currentStep]?.content}
              </div>

              {/* 代碼示例 */}
              {steps[currentStep]?.code && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    <code>{steps[currentStep].code}</code>
                  </pre>
                </div>
              )}

              {/* 重點提示 */}
              {steps[currentStep]?.highlight && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>重點提示：</strong> {steps[currentStep].highlight}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 導航按鈕 */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                上一步
              </button>
              
              <div className="text-sm text-gray-500 self-center">
                步驟 {currentStep + 1} / {steps.length}
              </div>
              
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentStep === steps.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 圖表內容 */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}