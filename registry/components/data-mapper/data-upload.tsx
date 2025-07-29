import React, { useCallback, useState, useRef } from 'react'
import { cn } from '../../utils/cn'
// Simple CSV parser
function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index] || ''
      // Try to parse as number
      const numValue = parseFloat(value)
      row[header] = isNaN(numValue) ? value : numValue
    })
    
    data.push(row)
  }
  
  return data
}
import { DataUploadProps } from './types'

export function DataUpload({
  onDataLoad,
  onError,
  acceptedFormats = ['.csv', '.json'],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className
}: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcessing = useCallback(async (file: File) => {
    if (file.size > maxFileSize) {
      onError?.(`檔案大小超過限制 (${Math.round(maxFileSize / 1024 / 1024)}MB)`)
      return
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(extension)) {
      onError?.(`不支援的檔案格式: ${extension}`)
      return
    }

    setIsLoading(true)
    
    try {
      const content = await readFileContent(file)
      let data: any[] = []

      switch (extension) {
        case '.csv':
          data = parseCSV(content)
          break
        case '.json':
          const jsonData = JSON.parse(content)
          data = Array.isArray(jsonData) ? jsonData : [jsonData]
          break
        default:
          throw new Error(`不支援的檔案格式: ${extension}`)
      }

      if (data.length === 0) {
        onError?.('檔案中沒有找到有效資料')
        return
      }

      onDataLoad(data)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '檔案解析失敗')
    } finally {
      setIsLoading(false)
    }
  }, [acceptedFormats, maxFileSize, onDataLoad, onError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileProcessing(files[0])
    }
  }, [handleFileProcessing])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileProcessing(files[0])
    }
  }, [handleFileProcessing])

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">正在處理檔案...</span>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="text-lg font-medium text-gray-900 mb-2">
              拖放檔案到這裡或點擊上傳
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              支援格式: {acceptedFormats.join(', ')}
            </div>
            
            <div className="text-xs text-gray-400">
              最大檔案大小: {Math.round(maxFileSize / 1024 / 1024)}MB
            </div>
          </>
        )}
      </div>

      {/* 範例資料按鈕 */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            const sampleData = generateSampleData()
            onDataLoad(sampleData)
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          使用範例資料
        </button>
      </div>
    </div>
  )
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('無法讀取檔案內容'))
      }
    }
    reader.onerror = () => reject(new Error('檔案讀取失敗'))
    reader.readAsText(file)
  })
}

function generateSampleData() {
  return [
    { month: '1月', sales: 12000, category: 'A', region: '北部' },
    { month: '2月', sales: 15000, category: 'A', region: '北部' },
    { month: '3月', sales: 18000, category: 'B', region: '中部' },
    { month: '4月', sales: 22000, category: 'B', region: '中部' },
    { month: '5月', sales: 19000, category: 'A', region: '南部' },
    { month: '6月', sales: 25000, category: 'C', region: '南部' },
    { month: '7月', sales: 28000, category: 'C', region: '北部' },
    { month: '8月', sales: 26000, category: 'A', region: '中部' },
    { month: '9月', sales: 30000, category: 'B', region: '南部' },
    { month: '10月', sales: 32000, category: 'C', region: '北部' },
    { month: '11月', sales: 29000, category: 'A', region: '中部' },
    { month: '12月', sales: 35000, category: 'B', region: '南部' }
  ]
}