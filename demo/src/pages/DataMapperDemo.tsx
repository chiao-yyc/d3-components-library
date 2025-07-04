import { useState } from 'react'
import { DataUpload, DataMapper, MappingPreview, DataMapping } from '../components/ui/data-mapper'

function DataMapperDemo() {
  const [data, setData] = useState<any[]>([])
  const [mapping, setMapping] = useState<DataMapping>({ x: '', y: '' })
  const [error, setError] = useState<string>('')

  const handleDataLoad = (newData: any[]) => {
    setData(newData)
    setError('')
    console.log('載入資料:', newData.length, '筆')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    console.error('資料載入錯誤:', errorMessage)
  }

  const handleMappingChange = (newMapping: DataMapping) => {
    setMapping(newMapping)
    console.log('映射變更:', newMapping)
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            資料映射器 Demo
          </h1>
          <p className="text-gray-600">
            體驗智慧資料偵測、欄位映射和即時圖表預覽功能
          </p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">載入失敗</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* 步驟 1: 資料上傳 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📁 步驟 1: 上傳資料
            </h2>
            <div className="bg-white rounded-lg p-6 border">
              <DataUpload
                onDataLoad={handleDataLoad}
                onError={handleError}
                acceptedFormats={['.csv', '.json']}
                maxFileSize={5 * 1024 * 1024}
              />
            </div>
          </section>

          {/* 步驟 2: 欄位映射 */}
          {data.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 步驟 2: 配置欄位映射
              </h2>
              <div className="bg-white rounded-lg p-6 border">
                <DataMapper
                  data={data}
                  chartType="bar-chart"
                  onMappingChange={handleMappingChange}
                  autoSuggest={true}
                />
              </div>
            </section>
          )}

          {/* 步驟 3: 即時預覽 */}
          {data.length > 0 && (mapping.x || mapping.y) && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 步驟 3: 即時圖表預覽
              </h2>
              <div className="bg-white rounded-lg p-6 border">
                <MappingPreview
                  data={data}
                  mapping={mapping}
                  chartType="bar-chart"
                  width={600}
                  height={400}
                />
              </div>
            </section>
          )}

          {/* 功能說明 */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✨ 功能特色
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🧠 智慧偵測
                </h3>
                <p className="text-sm text-gray-600">
                  自動分析資料類型，包含數值、文字、日期、布林等，並提供最佳欄位映射建議
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📊 即時預覽
                </h3>
                <p className="text-sm text-gray-600">
                  調整映射配置時立即更新圖表，包含統計資訊、顏色圖例和資料表格
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🎨 彈性映射
                </h3>
                <p className="text-sm text-gray-600">
                  支援 X/Y 軸、顏色分組、大小映射等多維度資料視覺化
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📁 多格式支援
                </h3>
                <p className="text-sm text-gray-600">
                  支援 CSV、JSON 等格式，並提供專業的資料解析和清理功能
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🔍 資料分析
                </h3>
                <p className="text-sm text-gray-600">
                  提供欄位統計、信心度評分、樣本預覽等詳細分析資訊
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  ⚡ 高效能
                </h3>
                <p className="text-sm text-gray-600">
                  採用智慧快取和增量處理，即使大型資料集也能流暢操作
                </p>
              </div>
            </div>
          </section>

          {/* 使用範例 */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              📝 使用範例
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  範例 CSV 檔案格式：
                </h3>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <div>month,sales,category,region</div>
                  <div>1月,12000,A,北部</div>
                  <div>2月,15000,B,中部</div>
                  <div>3月,18000,C,南部</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  範例 JSON 檔案格式：
                </h3>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <div>{'[{'}</div>
                  <div>&nbsp;&nbsp;"month": "1月",</div>
                  <div>&nbsp;&nbsp;"sales": 12000,</div>
                  <div>&nbsp;&nbsp;"category": "A",</div>
                  <div>&nbsp;&nbsp;"region": "北部"</div>
                  <div>{'}, ...]'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DataMapperDemo