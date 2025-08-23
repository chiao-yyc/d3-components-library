import React, { useState } from 'react';
import { Correlogram } from '../../../registry/components/statistical/correlogram';

// 生成模擬相關係數矩陣資料
const generateCorrelationData = () => {
  const variables = ['GDP', 'Inflation', 'Employment', 'InterestRate', 'Export', 'Import'];
  const matrix = [
    [1.00,  0.75, -0.82,  0.64, -0.55,  0.43],
    [0.75,  1.00, -0.68,  0.83, -0.49,  0.37],
    [-0.82, -0.68, 1.00, -0.71,  0.62, -0.38],
    [0.64,  0.83, -0.71,  1.00, -0.44,  0.29],
    [-0.55, -0.49,  0.62, -0.44,  1.00, -0.67],
    [0.43,  0.37, -0.38,  0.29, -0.67,  1.00]
  ];
  return { variables, matrix };
};


// 生成寬格式資料 (類似 CSV 格式)
const generateWideFormatData = () => {
  return [
    { "": "StockA", "StockA": 1.00, "StockB": 0.78, "StockC": -0.42, "StockD": 0.33 },
    { "": "StockB", "StockA": 0.78, "StockB": 1.00, "StockC": -0.61, "StockD": 0.45 },
    { "": "StockC", "StockA": -0.42, "StockB": -0.61, "StockC": 1.00, "StockD": -0.29 },
    { "": "StockD", "StockA": 0.33, "StockB": 0.45, "StockC": -0.29, "StockD": 1.00 }
  ];
};

export default function CorrelogramDemo() {
  const [selectedExample, setSelectedExample] = useState('matrix');
  const [showUpperTriangle, setShowUpperTriangle] = useState(true);
  const [showLowerTriangle, setShowLowerTriangle] = useState(true);
  const [showDiagonal, setShowDiagonal] = useState(true);
  const [threshold, setThreshold] = useState(0);
  const [maxCircleRadius, setMaxCircleRadius] = useState(9);
  const [colorScheme, setColorScheme] = useState('default');
  const [customColors, setCustomColors] = useState(['#B22222', '#fff', '#000080']);

  const matrixData = generateCorrelationData();
  const wideData = generateWideFormatData();

  const getExampleData = () => {
    switch (selectedExample) {
      case 'matrix':
        return { 
          correlationMatrix: matrixData.matrix, 
          variables: matrixData.variables,
          data: undefined
        };
      case 'wide':
        return { 
          data: wideData,
          correlationMatrix: undefined,
          variables: undefined
        };
      default:
        return { 
          correlationMatrix: matrixData.matrix, 
          variables: matrixData.variables,
          data: undefined
        };
    }
  };

  const data = getExampleData();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Correlogram 相關性矩陣圖</h1>
        <p className="text-gray-600 max-w-3xl">
          Correlogram 用於視覺化變數間的相關性係數。上三角顯示圓圈（大小表示相關性強度），
          下三角顯示數值文字，對角線顯示變數名稱。支援矩陣格式和寬格式（CSV風格）資料。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">控制面板</h3>
            
            {/* 資料來源選擇 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                資料來源
              </label>
              <select
                value={selectedExample}
                onChange={(e) => setSelectedExample(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="matrix">矩陣格式 (經濟指標)</option>
                <option value="wide">寬格式 (股票資料)</option>
              </select>
            </div>

            {/* 顯示選項 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                顯示選項
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showUpperTriangle}
                    onChange={(e) => setShowUpperTriangle(e.target.checked)}
                    className="mr-2"
                  />
                  上三角（圓圈）
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLowerTriangle}
                    onChange={(e) => setShowLowerTriangle(e.target.checked)}
                    className="mr-2"
                  />
                  下三角（文字）
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showDiagonal}
                    onChange={(e) => setShowDiagonal(e.target.checked)}
                    className="mr-2"
                  />
                  對角線（變數名）
                </label>
              </div>
            </div>

            {/* 閾值過濾 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="text-xs text-gray-500 mt-1">
                只顯示絕對值大於 {threshold.toFixed(1)} 的相關性
              </div>
            </div>

            {/* 圓圈大小 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大圓圈半徑: {maxCircleRadius}px
              </label>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={maxCircleRadius}
                onChange={(e) => setMaxCircleRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 配色方案 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配色方案
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              >
                <option value="default">預設（紅-白-藍）</option>
                <option value="custom">自定義</option>
              </select>
              {colorScheme === 'custom' && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">負相關色:</label>
                    <input
                      type="color"
                      value={customColors[0]}
                      onChange={(e) => setCustomColors([e.target.value, customColors[1], customColors[2]])}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">零相關色:</label>
                    <input
                      type="color"
                      value={customColors[1]}
                      onChange={(e) => setCustomColors([customColors[0], e.target.value, customColors[2]])}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">正相關色:</label>
                    <input
                      type="color"
                      value={customColors[2]}
                      onChange={(e) => setCustomColors([customColors[0], customColors[1], e.target.value])}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 圖表區域 */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">
              {selectedExample === 'matrix' ? '經濟指標相關性' : '股票相關性'}
            </h3>
            
            <div className="w-full h-96 flex items-center justify-center">
              <Correlogram
                {...data}
                width={500}
                height={400}
                margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
                showUpperTriangle={showUpperTriangle}
                showLowerTriangle={showLowerTriangle}
                showDiagonal={showDiagonal}
                threshold={threshold}
                maxCircleRadius={maxCircleRadius}
                colorScheme={colorScheme as 'default' | 'custom'}
                customColors={colorScheme === 'custom' ? customColors as [string, string, string] : undefined}
                showValues={true}
                animate={true}
                animationDuration={750}
                onCellHover={(x, y, value) => {
                  console.log(`Hover: ${x} ↔ ${y} = ${value.toFixed(3)}`);
                }}
                onCellClick={(x, y, value) => {
                  console.log(`Click: ${x} ↔ ${y} = ${value.toFixed(3)}`);
                  alert(`相關性詳情:\n${x} ↔ ${y}\n係數: ${value.toFixed(3)}\n強度: ${Math.abs(value) > 0.7 ? '強' : Math.abs(value) > 0.3 ? '中' : '弱'}相關`);
                }}
              />
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">說明:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>上三角圓圈:</strong> 圓圈大小表示相關性強度，顏色表示正負相關</li>
                <li>• <strong>下三角數值:</strong> 顯示精確的相關係數數值</li>
                <li>• <strong>對角線:</strong> 顯示變數名稱（自相關 = 1.0）</li>
                <li>• <strong>互動:</strong> 懸停檢視詳情，點擊獲得更多資訊</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 使用範例 */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">程式碼範例</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// 使用相關係數矩陣
const matrixData = {
  correlationMatrix: [
    [1.00,  0.75, -0.82],
    [0.75,  1.00, -0.68], 
    [-0.82, -0.68, 1.00]
  ],
  variables: ['GDP', 'Inflation', 'Employment']
};

<Correlogram
  correlationMatrix={matrixData.correlationMatrix}
  variables={matrixData.variables}
  width={500}
  height={400}
  showUpperTriangle={true}
  showLowerTriangle={true}
  maxCircleRadius={12}
  threshold={0.3}
  onCellClick={(x, y, value) => {
    console.log(\`\${x} ↔ \${y}: \${value}\`);
  }}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}