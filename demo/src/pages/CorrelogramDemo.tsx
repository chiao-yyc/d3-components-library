import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Correlogram } from '../../../registry/components/statistical/correlogram';
import { 
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui';
import { designTokens } from '../design/design-tokens';
import {
  BeakerIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  SwatchIcon,
  SparklesIcon,
  CursorArrowRippleIcon,
  DocumentTextIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';

// 生成豐富的數據集
const datasets = {
  economic: {
    name: '經濟指標相關性',
    description: '6個主要經濟指標的相關性分析',
    variables: ['GDP', 'Inflation', 'Employment', 'InterestRate', 'Export', 'Import'],
    matrix: [
      [1.00,  0.75, -0.82,  0.64, -0.55,  0.43],
      [0.75,  1.00, -0.68,  0.83, -0.49,  0.37],
      [-0.82, -0.68, 1.00, -0.71,  0.62, -0.38],
      [0.64,  0.83, -0.71,  1.00, -0.44,  0.29],
      [-0.55, -0.49,  0.62, -0.44,  1.00, -0.67],
      [0.43,  0.37, -0.38,  0.29, -0.67,  1.00]
    ]
  },
  stock: {
    name: '股票投資組合',
    description: '4檔主要股票的收益相關性',
    data: [
      { "": "TSMC", "TSMC": 1.00, "Apple": 0.78, "Google": -0.42, "Tesla": 0.33 },
      { "": "Apple", "TSMC": 0.78, "Apple": 1.00, "Google": -0.61, "Tesla": 0.45 },
      { "": "Google", "TSMC": -0.42, "Apple": -0.61, "Google": 1.00, "Tesla": -0.29 },
      { "": "Tesla", "TSMC": 0.33, "Apple": 0.45, "Google": -0.29, "Tesla": 1.00 }
    ]
  },
  environmental: {
    name: '環境指標相關性',
    description: '環境因子與氣候變化指標',
    variables: ['Temperature', 'Humidity', 'CO2', 'AirQuality', 'Rainfall'],
    matrix: [
      [1.00,  0.62, 0.84, -0.73,  0.45],
      [0.62,  1.00, 0.33, -0.51,  0.78],
      [0.84,  0.33, 1.00, -0.88,  0.12],
      [-0.73, -0.51, -0.88, 1.00, -0.29],
      [0.45,  0.78, 0.12, -0.29,  1.00]
    ]
  },
  portfolio: {
    name: '投資策略組合',
    description: '8種投資策略的績效相關性',
    variables: ['Growth', 'Value', 'Dividend', 'Small-Cap', 'Large-Cap', 'REIT', 'Bond', 'Commodity'],
    matrix: [
      [1.00,  0.45, -0.23,  0.78, 0.34, 0.12, -0.56,  0.67],
      [0.45,  1.00,  0.67, -0.32, 0.89, 0.43, -0.21, -0.15],
      [-0.23, 0.67,  1.00, -0.54, 0.72, 0.56,  0.34, -0.78],
      [0.78, -0.32, -0.54,  1.00, 0.12, -0.23, -0.67, 0.89],
      [0.34,  0.89,  0.72,  0.12, 1.00, 0.45, -0.12, -0.34],
      [0.12,  0.43,  0.56, -0.23, 0.45, 1.00,  0.78, -0.45],
      [-0.56, -0.21, 0.34, -0.67, -0.12, 0.78, 1.00, -0.89],
      [0.67, -0.15, -0.78,  0.89, -0.34, -0.45, -0.89, 1.00]
    ]
  }
};

// 計算相關性統計
const calculateCorrelationStats = (matrix: number[][]) => {
  const flatCorrelations = [];
  const size = matrix.length;
  
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      flatCorrelations.push(Math.abs(matrix[i][j]));
    }
  }
  
  const strongCorr = flatCorrelations.filter(c => c >= 0.7).length;
  const moderateCorr = flatCorrelations.filter(c => c >= 0.3 && c < 0.7).length;
  const weakCorr = flatCorrelations.filter(c => c < 0.3).length;
  const avgCorrelation = flatCorrelations.reduce((a, b) => a + b, 0) / flatCorrelations.length;
  const maxCorrelation = Math.max(...flatCorrelations);
  
  return {
    total: flatCorrelations.length,
    strong: strongCorr,
    moderate: moderateCorr,
    weak: weakCorr,
    avgCorrelation,
    maxCorrelation
  };
};

// 生成數據表格
const generateCorrelationTable = (data: any) => {
  if (data.correlationMatrix && data.variables) {
    return data.variables.map((var1: string, i: number) => ({
      variable: var1,
      ...Object.fromEntries(
        data.variables.map((var2: string, j: number) => [
          var2.toLowerCase(),
          data.correlationMatrix[i][j].toFixed(3)
        ])
      )
    }));
  } else if (data.data) {
    return data.data.map((row: any) => ({
      variable: row[""],
      ...Object.fromEntries(
        Object.keys(row)
          .filter(key => key !== "")
          .map(key => [key.toLowerCase(), row[key].toFixed(3)])
      )
    }));
  }
  return [];
};

export default function CorrelogramDemo() {
  const [selectedExample, setSelectedExample] = useState('economic');
  const [showUpperTriangle, setShowUpperTriangle] = useState(true);
  const [showLowerTriangle, setShowLowerTriangle] = useState(true);
  const [showDiagonal, setShowDiagonal] = useState(true);
  const [threshold, setThreshold] = useState(0);
  const [maxCircleRadius, setMaxCircleRadius] = useState(18);
  const [colorScheme, setColorScheme] = useState('default');
  const [customColors, setCustomColors] = useState(['#B22222', '#fff', '#000080']);
  const [isLoading, setIsLoading] = useState(false);

  const handleDatasetChange = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedExample(value);
      setIsLoading(false);
    }, 300);
  };

  const currentDataset = datasets[selectedExample as keyof typeof datasets];
  
  // 防禦性檢查，確保 currentDataset 存在
  if (!currentDataset) {
    return (
      <DemoPageTemplate
        title="Correlogram 相關性矩陣圖"
        description="視覺化變數間的相關性係數，支援多種數據格式和自定義配置"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">錯誤：找不到指定的數據集</div>
        </div>
      </DemoPageTemplate>
    );
  }
  
  const correlationData = currentDataset.matrix 
    ? { correlationMatrix: currentDataset.matrix, variables: currentDataset.variables }
    : { data: (currentDataset as any).data };
  
  const correlationStats = currentDataset.matrix 
    ? calculateCorrelationStats(currentDataset.matrix)
    : null;
  
  const correlationTable = generateCorrelationTable(correlationData);

  return (
    <DemoPageTemplate
      title="Correlogram 相關性矩陣圖"
      description="視覺化變數間的相關性係數，支援多種數據格式和自定義配置"
    >

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ModernControlPanel title="控制面板" icon={<ChartBarSquareIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              {/* 資料來源 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BeakerIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">資料來源</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">資料集</label>
                  <select
                    value={selectedExample}
                    onChange={(e) => handleDatasetChange(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="economic">經濟指標 (6x6)</option>
                    <option value="stock">股票組合 (4x4)</option>
                    <option value="environmental">環境指標 (5x5)</option>
                    <option value="portfolio">投資策略 (8x8)</option>
                  </select>
                  <p className="text-xs text-gray-500">{currentDataset.description}</p>
                </div>
              </div>

              {/* 顯示配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">顯示配置</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUpperTriangle}
                      onChange={(e) => setShowUpperTriangle(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">上三角（圓圈）</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLowerTriangle}
                      onChange={(e) => setShowLowerTriangle(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">下三角（數值）</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDiagonal}
                      onChange={(e) => setShowDiagonal(e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">對角線（變數名）</span>
                  </label>
                </div>
              </div>

              {/* 過濾設定 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">過濾設定</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      顯示閾值: {threshold.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.1"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      只顯示絕對值大於 {threshold.toFixed(1)} 的相關性
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      最大圓圈半徑: {maxCircleRadius}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="25"
                      step="1"
                      value={maxCircleRadius}
                      onChange={(e) => setMaxCircleRadius(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 配色方案 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SwatchIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">配色方案</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">色彩主題</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="default">預設（紅-白-藍）</option>
                    <option value="custom">自定義配色</option>
                  </select>
                </div>
                {colorScheme === 'custom' && (
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">負相關色</label>
                      <input
                        type="color"
                        value={customColors[0]}
                        onChange={(e) => setCustomColors([e.target.value, customColors[1], customColors[2]])}
                        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">零相關色</label>
                      <input
                        type="color"
                        value={customColors[1]}
                        onChange={(e) => setCustomColors([customColors[0], e.target.value, customColors[2]])}
                        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">正相關色</label>
                      <input
                        type="color"
                        value={customColors[2]}
                        onChange={(e) => setCustomColors([customColors[0], customColors[1], e.target.value])}
                        className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModernControlPanel>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* 主圖表 */}
          <ChartContainer 
            title={currentDataset.name}
            loading={isLoading}
          >
            <AnimatePresence mode="wait">
              {!isLoading && (
                <motion.div
                  key={selectedExample}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-96 flex items-center justify-center"
                >
                  <Correlogram
                    data={correlationData.correlationMatrix ? 
                      correlationData.variables?.map((variable: string, i: number) => ({
                        variable,
                        correlations: correlationData.correlationMatrix?.[i] || [],
                        index: i
                      })) || [] :
                      (correlationData as any).data || []
                    }
                    dataFormat={correlationData.correlationMatrix ? 'matrix' : 'wide'}
                    variables={correlationData.variables}
                    correlationMatrix={correlationData.correlationMatrix}
                    width={600}
                    height={480}
                    margin={{ top: 50, right: 50, bottom: 70, left: 70 }}
                    visualizationType="circle"
                    colorScheme={colorScheme === 'custom' ? 'custom' : 'RdBu'}
                    customColorRange={colorScheme === 'custom' ? customColors as [string, string, string] : undefined}
                    showLabels={true}
                    showValues={true}
                    cellPadding={0.1}
                    minRadius={1}
                    maxRadius={maxCircleRadius}
                    strokeWidth={1}
                    strokeColor="#333"
                    animate={true}
                    animationDuration={750}
                    interactive={true}
                    showUpperTriangle={showUpperTriangle}
                    showLowerTriangle={showLowerTriangle}
                    showDiagonal={showDiagonal}
                    upperTriangleType="visual"
                    lowerTriangleType="text"
                    threshold={threshold}
                    onHover={(dataPoint) => {
                      console.log(`Hover: ${dataPoint.xVar} ↔ ${dataPoint.yVar} = ${dataPoint.correlation.toFixed(3)}`);
                    }}
                    onClick={(dataPoint) => {
                      const value = dataPoint.correlation;
                      console.log(`Click: ${dataPoint.xVar} ↔ ${dataPoint.yVar} = ${value.toFixed(3)}`);
                      alert(`相關性詳情:\n${dataPoint.xVar} ↔ ${dataPoint.yVar}\n係數: ${value.toFixed(3)}\n強度: ${Math.abs(value) > 0.7 ? '強' : Math.abs(value) > 0.3 ? '中' : '弱'}相關`);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ChartContainer>

          {/* 統計分析 */}
          {correlationStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm 
                          border border-blue-200/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-blue-600">{correlationStats.total}</div>
                <div className="text-sm text-blue-700 font-medium">相關性對數</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-sm 
                          border border-red-200/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-red-600">{correlationStats.strong}</div>
                <div className="text-sm text-red-700 font-medium">強相關 (≥0.7)</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm 
                          border border-amber-200/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-amber-600">{correlationStats.moderate}</div>
                <div className="text-sm text-amber-700 font-medium">中相關 (0.3-0.7)</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm 
                          border border-gray-200/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-gray-600">{correlationStats.weak}</div>
                <div className="text-sm text-gray-700 font-medium">弱相關 (&lt;0.3)</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm 
                          border border-purple-200/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-purple-600">
                  {correlationStats.avgCorrelation.toFixed(3)}
                </div>
                <div className="text-sm text-purple-700 font-medium">平均相關性</div>
              </motion.div>
            </motion.div>
          )}

          {/* 數據表格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <DataTable
              title={`${currentDataset.name} - 相關性矩陣`}
              description="完整的相關性係數數值表格"
              data={correlationTable}
              columns={[
                { key: 'variable', label: '變數', sortable: true },
                ...Object.keys(correlationTable[0] || {})
                  .filter(key => key !== 'variable')
                  .map(key => ({
                    key,
                    label: key.toUpperCase(),
                    sortable: true,
                    formatter: (value: string) => {
                      const num = parseFloat(value);
                      const absNum = Math.abs(num);
                      let colorClass = 'text-gray-600';
                      if (absNum >= 0.7) colorClass = 'text-red-600 font-semibold';
                      else if (absNum >= 0.3) colorClass = 'text-amber-600 font-medium';
                      return <span className={colorClass}>{value}</span>;
                    }
                  }))
              ]}
            />
          </motion.div>
        </div>
      </div>

      {/* 程式碼範例和功能說明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <CodeExample
            title="基本使用範例"
            language="tsx"
            code={`// 相關係數矩陣格式
const correlationData = {
  correlationMatrix: [
    [1.00,  0.75, -0.82],
    [0.75,  1.00, -0.68], 
    [-0.82, -0.68, 1.00]
  ],
  variables: ['GDP', 'Inflation', 'Employment']
};

<Correlogram
  data={correlationData.variables.map((variable, i) => ({
    variable,
    correlations: correlationData.correlationMatrix[i],
    index: i
  }))}
  dataFormat="matrix"
  variables={correlationData.variables}
  correlationMatrix={correlationData.correlationMatrix}
  width={600}
  height={480}
  visualizationType="circle"
  colorScheme="RdBu"
  showLabels={true}
  showValues={true}
  minRadius={2}
  maxRadius={12}
  animate={true}
  onClick={(dataPoint) => {
    console.log(\`\${dataPoint.xVar} ↔ \${dataPoint.yVar}: \${dataPoint.correlation.toFixed(3)}\`);
  }}
/>`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <CodeExample
            title="寬格式資料使用"
            language="tsx"
            code={`// 寬格式（CSV風格）資料
const wideFormatData = [
  { "": "StockA", "StockA": 1.00, "StockB": 0.78, "StockC": -0.42 },
  { "": "StockB", "StockA": 0.78, "StockB": 1.00, "StockC": -0.61 },
  { "": "StockC", "StockA": -0.42, "StockB": -0.61, "StockC": 1.00 }
];

<Correlogram
  data={wideFormatData}
  dataFormat="wide"
  width={600}
  height={480}
  visualizationType="circle"
  colorScheme="custom"
  customColorRange={['#e74c3c', '#ecf0f1', '#3498db']}
  showLabels={true}
  showValues={true}
  animationDuration={1000}
  onHover={(dataPoint) => {
    // 懸停事件處理
    console.log(\`Hover: \${dataPoint.xVar} ↔ \${dataPoint.yVar} = \${dataPoint.correlation}\`);
  }}
/>`}
          />
        </motion.div>
      </div>

      {/* 功能特色說明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-8"
      >
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarSquareIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">多種視覺化</h4>
              <p className="text-sm text-blue-700">
                上三角圓圈、下三角數值、對角線變數名，提供完整資訊
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SwatchIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-900 mb-2">彈性配色</h4>
              <p className="text-sm text-purple-700">
                內建配色方案和自定義色彩，適應不同設計需求
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CursorArrowRippleIcon className="h-6 w-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-pink-900 mb-2">豐富互動</h4>
              <p className="text-sm text-pink-700">
                滑鼠懸停預覽、點擊詳細資訊、閾值過濾等多重互動
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 mb-2">平滑動畫</h4>
              <p className="text-sm text-green-700">
                資料變化和載入過程的優雅動畫效果
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </DemoPageTemplate>
  );
}