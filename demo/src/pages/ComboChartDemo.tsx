import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, LineChart } from '../components/ui';
import { 
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui';
import { designTokens } from '../design/design-tokens';
import {
  ChartBarIcon,
  CubeTransparentIcon,
  SwatchIcon,
  SparklesIcon,
  CursorArrowRippleIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SampleData {
  category: string;
  date: string;
  sales: number;
  growth: number;
  profit: number;
  conversion: number;
}

interface DatasetConfig {
  name: string;
  description: string;
  generator: () => SampleData[];
  barConfig: {
    key: keyof SampleData;
    label: string;
    color: string;
  };
  lineConfig: {
    key: keyof SampleData;
    label: string;
    color: string;
  };
}

// 多種數據集配置
const datasets: Record<string, DatasetConfig> = {
  sales: {
    name: '銷售與成長分析',
    description: '月度銷售數據與成長率對比分析',
    generator: () => {
      const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const months = [
        '2024-01-01', '2024-02-01', '2024-03-01',
        '2024-04-01', '2024-05-01', '2024-06-01'
      ];
      return categories.map((cat, index) => ({
        category: cat,
        date: months[index],
        sales: Math.floor(Math.random() * 100) + 50,
        growth: Math.floor(Math.random() * 30) + 5,
        profit: Math.floor(Math.random() * 40) + 10,
        conversion: Math.random() * 15 + 2
      }));
    },
    barConfig: { key: 'sales', label: '銷售額', color: '#3b82f6' },
    lineConfig: { key: 'growth', label: '成長率 (%)', color: '#ef4444' }
  },
  profit: {
    name: '營收與獲利分析',
    description: '營收規模與獲利能力雙軸對比',
    generator: () => {
      const categories = ['Q1', 'Q2', 'Q3', 'Q4'];
      const quarters = ['2024-03-31', '2024-06-30', '2024-09-30', '2024-12-31'];
      return categories.map((cat, index) => ({
        category: cat,
        date: quarters[index],
        sales: Math.floor(Math.random() * 200) + 100,
        growth: Math.floor(Math.random() * 25) + 8,
        profit: Math.floor(Math.random() * 60) + 20,
        conversion: Math.random() * 20 + 5
      }));
    },
    barConfig: { key: 'sales', label: '營收', color: '#059669' },
    lineConfig: { key: 'profit', label: '獲利 (%)', color: '#dc2626' }
  },
  conversion: {
    name: '流量與轉換分析',
    description: '網站流量與轉換率趨勢分析',
    generator: () => {
      const categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weeks = ['2024-01-07', '2024-01-14', '2024-01-21', '2024-01-28'];
      return categories.map((cat, index) => ({
        category: cat,
        date: weeks[index],
        sales: Math.floor(Math.random() * 5000) + 2000,
        growth: Math.floor(Math.random() * 40) + 10,
        profit: Math.floor(Math.random() * 30) + 15,
        conversion: Math.random() * 8 + 2
      }));
    },
    barConfig: { key: 'sales', label: '訪客數', color: '#7c3aed' },
    lineConfig: { key: 'conversion', label: '轉換率 (%)', color: '#f59e0b' }
  }
};

// 計算統計數據
const calculateStats = (data: SampleData[], barKey: keyof SampleData, lineKey: keyof SampleData) => {
  const barValues = data.map(d => Number(d[barKey]));
  const lineValues = data.map(d => Number(d[lineKey]));
  
  return {
    barTotal: barValues.reduce((a, b) => a + b, 0),
    barAvg: barValues.reduce((a, b) => a + b, 0) / barValues.length,
    barMax: Math.max(...barValues),
    lineAvg: lineValues.reduce((a, b) => a + b, 0) / lineValues.length,
    lineMax: Math.max(...lineValues),
    dataPoints: data.length
  };
};

export const ComboChartDemo: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState('sales');
  const [data, setData] = useState<SampleData[]>(datasets.sales.generator());
  const [showBarChart, setShowBarChart] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [barColor, setBarColor] = useState(datasets.sales.barConfig.color);
  const [lineColor, setLineColor] = useState(datasets.sales.lineConfig.color);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  
  const currentDataset = datasets[selectedDataset];
  const stats = calculateStats(data, currentDataset.barConfig.key, currentDataset.lineConfig.key);

  const handleDatasetChange = (datasetKey: string) => {
    setIsLoading(true);
    const dataset = datasets[datasetKey];
    
    setTimeout(() => {
      setSelectedDataset(datasetKey);
      setData(dataset.generator());
      setBarColor(dataset.barConfig.color);
      setLineColor(dataset.lineConfig.color);
      setIsLoading(false);
    }, 300);
  };

  const regenerateData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(currentDataset.generator());
      setIsLoading(false);
    }, 300);
  };

  const barData = data.map(d => ({
    label: d.category,
    value: Number(d[currentDataset.barConfig.key])
  }));

  const lineData = data.map(d => ({
    [currentDataset.lineConfig.key]: Number(d[currentDataset.lineConfig.key]),
    category: d.category,
    date: d.date
  }));
  
  const tableData = data.map(d => ({
    category: d.category,
    [currentDataset.barConfig.label.toLowerCase()]: Number(d[currentDataset.barConfig.key]),
    [currentDataset.lineConfig.label.toLowerCase()]: Number(d[currentDataset.lineConfig.key]).toFixed(2),
    efficiency: (Number(d[currentDataset.lineConfig.key]) / Number(d[currentDataset.barConfig.key]) * 100).toFixed(2) + '%'
  }));

  return (
    <DemoPageTemplate
      title="模組化組合圖表演示"
      description="展示模組化組件系統的概念：將獨立的圖表組件靈活組合使用"
    >

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ModernControlPanel title="控制面板" icon={<CubeTransparentIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              {/* 數據來源 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">數據來源</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">數據集</label>
                  <select
                    value={selectedDataset}
                    onChange={(e) => handleDatasetChange(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="sales">銷售與成長</option>
                    <option value="profit">營收與獲利</option>
                    <option value="conversion">流量與轉換</option>
                  </select>
                  <p className="text-xs text-gray-500">{currentDataset.description}</p>
                </div>
              </div>

              {/* 顯示設定 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">顯示設定</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBarChart}
                      onChange={(e) => setShowBarChart(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">顯示 {currentDataset.barConfig.label} (Bar)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLineChart}
                      onChange={(e) => setShowLineChart(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">顯示 {currentDataset.lineConfig.label} (Line)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={animationEnabled}
                      onChange={(e) => setAnimationEnabled(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">動畫效果</span>
                  </label>
                </div>
              </div>

              {/* 色彩配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SwatchIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">色彩配置</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">長條圖</label>
                    <input
                      type="color"
                      value={barColor}
                      onChange={(e) => setBarColor(e.target.value)}
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">折線圖</label>
                    <input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <button
                onClick={regenerateData}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                          text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl 
                          transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                重新生成資料
              </button>
            </div>
          </ModernControlPanel>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* 統計卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm 
                        border border-blue-200/50 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-blue-600">{stats.dataPoints}</div>
              <div className="text-sm text-blue-700 font-medium">數據點</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-sm 
                        border border-green-200/50 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-green-600">{stats.barTotal.toFixed(0)}</div>
              <div className="text-sm text-green-700 font-medium">{currentDataset.barConfig.label} 總計</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm 
                        border border-purple-200/50 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-purple-600">{stats.barAvg.toFixed(1)}</div>
              <div className="text-sm text-purple-700 font-medium">{currentDataset.barConfig.label} 平均</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm 
                        border border-amber-200/50 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-amber-600">{stats.lineAvg.toFixed(2)}</div>
              <div className="text-sm text-amber-700 font-medium">{currentDataset.lineConfig.label} 平均</div>
            </motion.div>
          </motion.div>

          {/* 長條圖區域 */}
          {showBarChart && (
            <ChartContainer 
              title={`${currentDataset.barConfig.label} (Bar Chart)`}
              loading={isLoading}
            >
              <AnimatePresence mode="wait">
                {!isLoading && (
                  <motion.div
                    key={`bar-${selectedDataset}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-80"
                  >
                    <BarChart
                      data={barData}
                      animate={animationEnabled}
                      interactive={true}
                      colors={[barColor]}
                      className="w-full h-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ChartContainer>
          )}

          {/* 折線圖區域 */}
          {showLineChart && (
            <ChartContainer 
              title={`${currentDataset.lineConfig.label} (Line Chart)`}
              loading={isLoading}
            >
              <AnimatePresence mode="wait">
                {!isLoading && (
                  <motion.div
                    key={`line-${selectedDataset}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="h-80"
                  >
                    <LineChart
                      data={lineData}
                      xKey="category"
                      yKey={currentDataset.lineConfig.key}
                      animate={animationEnabled}
                      interactive={true}
                      colors={[lineColor]}
                      strokeWidth={3}
                      showDots={true}
                      width={600}
                      height={320}
                      className="w-full h-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ChartContainer>
          )}

          {/* 組合數據表格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <DataTable
              title={`${currentDataset.name} - 組合數據表`}
              description="完整的雙軸數據對比分析"
              data={tableData}
              columns={[
                { key: 'category', title: '類別', sortable: true },
                { 
                  key: currentDataset.barConfig.label.toLowerCase(), 
                  title: currentDataset.barConfig.label, 
                  sortable: true,
                  formatter: (value: number) => (
                    <span className="font-semibold" style={{ color: barColor }}>
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  )
                },
                { 
                  key: currentDataset.lineConfig.label.toLowerCase(), 
                  title: currentDataset.lineConfig.label, 
                  sortable: true,
                  formatter: (value: string) => (
                    <span className="font-semibold" style={{ color: lineColor }}>
                      {value}
                    </span>
                  )
                },
                {
                  key: 'efficiency',
                  title: '效率比',
                  sortable: true,
                  formatter: (value: string) => {
                    const numValue = parseFloat(value);
                    let colorClass = 'text-gray-600';
                    if (numValue > 50) colorClass = 'text-green-600 font-bold';
                    else if (numValue > 20) colorClass = 'text-amber-600 font-semibold';
                    else if (numValue > 10) colorClass = 'text-orange-600';
                    return <span className={colorClass}>{value}</span>;
                  }
                }
              ]}
            />
          </motion.div>
        </div>

      </div>

      {/* 程式碼範例和架構說明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <CodeExample
            title="模組化組件使用範例"
            language="tsx"
            code={`// 獨立組件組合使用
const ComboChart = () => {
  const [showBar, setShowBar] = useState(true);
  const [showLine, setShowLine] = useState(true);
  
  return (
    <div className="space-y-6">
      {showBar && (
        <BarChart
          data={barData}
          animate={true}
          color="#3b82f6"
          interactive={true}
        />
      )}
      
      {showLine && (
        <LineChart
          data={lineData}
          animate={true}
          colors={["#ef4444"]}
          strokeWidth={3}
          showDots={true}
        />
      )}
    </div>
  );
};`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <CodeExample
            title="Primitives 系統組合"
            language="tsx"
            code={`// 原子級組件組合 (進階用法)
import { 
  ChartCanvas, 
  LayerManager, 
  XAxis, 
  DualAxis, 
  Bar, 
  Line 
} from '@/components/primitives';

<ChartCanvas width={800} height={400}>
  <LayerManager>
    <XAxis scale={xScale} label="時間軸" />
    <DualAxis 
      leftAxis={{ scale: barScale, label: "銷售額" }}
      rightAxis={{ scale: lineScale, label: "成長率" }}
    />
    <Bar data={barData} xScale={xScale} yScale={barScale} />
    <Line data={lineData} xScale={xScale} yScale={lineScale} />
  </LayerManager>
</ChartCanvas>`}
          />
        </motion.div>
      </div>

      {/* 架構概念說明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-8"
      >
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CubeTransparentIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">模組化設計</h4>
              <p className="text-sm text-blue-700">
                每個圖表都是獨立的可重用組件，支援靈活組合
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SwatchIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-900 mb-2">統一介面</h4>
              <p className="text-sm text-purple-700">
                所有圖表組件都有一致的 API 和配置方式
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-6 w-6 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-cyan-900 mb-2">數據分離</h4>
              <p className="text-sm text-cyan-700">
                相同數據源可用於不同視覺化，支援多視角分析
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CursorArrowRippleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 mb-2">靈活控制</h4>
              <p className="text-sm text-green-700">
                支援動態顯示/隱藏，即時配色和數據切換
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </DemoPageTemplate>
  );
}

export default ComboChartDemo;