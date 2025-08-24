import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataUpload, DataMapper, MappingPreview, DataMapping } from '../components/ui/data-mapper';
import {
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui';
import {
  DocumentArrowUpIcon,
  CogIcon,
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function DataMapperDemo() {
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<DataMapping>({ x: '', y: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('bar-chart');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDataLoad = (newData: any[]) => {
    setIsLoading(true);
    setUploadProgress(0);
    
    // 模擬載入進度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setData(newData);
          setError('');
          setIsLoading(false);
          console.log('載入資料:', newData.length, '筆');
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    console.error('資料載入錯誤:', errorMessage)
  }

  const handleMappingChange = (newMapping: DataMapping) => {
    setMapping(newMapping)
    console.log('映射變更:', newMapping)
  }

  // 計算統計數據
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    
    const columns = Object.keys(data[0] || {});
    const rowCount = data.length;
    const hasMapping = mapping.x || mapping.y;
    const completionRate = hasMapping ? 100 : Math.floor((Object.keys(mapping).filter(k => mapping[k as keyof DataMapping]).length / 2) * 100);
    
    return {
      columns: columns.length,
      rows: rowCount,
      hasMapping,
      completionRate,
      mappedFields: Object.keys(mapping).filter(k => mapping[k as keyof DataMapping]).length
    };
  }, [data, mapping]);

  return (
    <DemoPageTemplate
      title="資料映射器 Demo"
      description="體驗智慧資料偵測、欄位映射和即時圖表預覽功能，支援多種數據格式"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div className="lg:col-span-1">
          <ModernControlPanel title="控制面板" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              {/* 圖表類型選擇 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">圖表類型</h3>
                </div>
                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="bar-chart">長條圖</option>
                  <option value="line-chart">折線圖</option>
                  <option value="scatter-plot">散布圖</option>
                  <option value="area-chart">面積圖</option>
                </select>
              </div>

              {/* 狀態顯示 */}
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">數據狀態</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <div className="font-semibold text-blue-700">{stats.rows}</div>
                      <div className="text-blue-600 text-xs">筆資料</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <div className="font-semibold text-green-700">{stats.columns}</div>
                      <div className="text-green-600 text-xs">個欄位</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">映射完成度</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stats.completionRate}%</div>
                  </div>
                </div>
              )}
            </div>
          </ModernControlPanel>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* 錯誤/成功通知 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">載入失敗</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {data.length > 0 && !error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">資料載入成功</h3>
                    <div className="mt-2 text-sm text-green-700">
                      已載入 {data.length} 筆資料，{Object.keys(data[0] || {}).length} 個欄位
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 步驟 1: 資料上傳 */}
          <ChartContainer title="📁 步驟 1: 上傳資料" loading={isLoading}>
            <div className="p-6">
              {isLoading && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">上傳進度: {uploadProgress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <DataUpload
                onDataLoad={handleDataLoad}
                onError={handleError}
                acceptedFormats={['.csv', '.json']}
                maxFileSize={5 * 1024 * 1024}
              />
            </div>
          </ChartContainer>

          {/* 步驟 2: 欄位映射 */}
          {data.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <ChartContainer title="🎯 步驟 2: 配置欄位映射">
                <div className="p-6">
                  <DataMapper
                    data={data}
                    chartType={selectedChartType}
                    onMappingChange={handleMappingChange}
                    autoSuggest={true}
                  />
                </div>
              </ChartContainer>
            </motion.div>
          )}

          {/* 步驟 3: 即時預覽 */}
          {data.length > 0 && (mapping.x || mapping.y) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <ChartContainer title="📊 步驟 3: 即時圖表預覽">
                <div className="h-96 flex items-center justify-center">
                  <MappingPreview
                    data={data}
                    mapping={mapping}
                    chartType={selectedChartType}
                    width={700}
                    height={350}
                  />
                </div>
              </ChartContainer>
            </motion.div>
          )}

          {/* 功能特色 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ✨ 功能特色
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  🧠 智慧偵測
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  自動分析資料類型，包含數值、文字、日期、布林等，並提供最佳欄位映射建議
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  📊 即時預覽
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  調整映射配置時立即更新圖表，包含統計資訊、顏色圖例和資料表格
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  🎨 彈性映射
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  支援 X/Y 軸、顏色分組、大小映射等多維度資料視覺化
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DocumentArrowUpIcon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  📁 多格式支援
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  支援 CSV、JSON 等格式，並提供專業的資料解析和清理功能
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <InformationCircleIcon className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  🔍 資料分析
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  提供欄位統計、信心度評分、樣本預覽等詳細分析資訊
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm"
              >
                <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  ⚡ 高效能
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  採用智慧快取和增量處理，即使大型資料集也能流暢操作
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* 數據表格展示 */}
          {data.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <DataTable
                title="載入的數據預覽"
                description={`共 ${data.length} 筆資料，${Object.keys(data[0] || {}).length} 個欄位`}
                data={data.slice(0, 10)} // 只顯示前10筆作為預覽
                columns={Object.keys(data[0] || {}).map(key => ({
                  key,
                  title: key,
                  sortable: true
                }))}
              />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* 程式碼範例 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <CodeExample
            title="CSV 檔案格式範例"
            language="csv"
            code={`month,sales,category,region
1月,12000,A,北部
2月,15000,B,中部
3月,18000,C,南部
4月,22000,A,東部
5月,19000,B,南部
6月,25000,C,北部`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <CodeExample
            title="JSON 檔案格式範例"
            language="json"
            code={`[
  {
    "month": "1月",
    "sales": 12000,
    "category": "A",
    "region": "北部"
  },
  {
    "month": "2月",
    "sales": 15000,
    "category": "B",
    "region": "中部"
  }
]`}
          />
        </motion.div>
      </div>
    </DemoPageTemplate>
  );
}
