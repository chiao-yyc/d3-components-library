# 快速開始指南

D3 Components 是一個基於 shadcn/ui 理念的 D3.js 組件庫，提供 Copy & Paste 的透明化圖表組件。

## 🚀 5 分鐘快速上手

### 1. 安裝 CLI 工具

```bash
# 使用 npm
npm install -g d3-components-cli

# 使用 yarn
yarn global add d3-components-cli

# 或直接使用 npx（無需安裝）
npx d3-components --help
```

### 2. 初始化專案

在你的 React 專案中執行：

```bash
npx d3-components init
```

這將在你的專案中創建：
- `d3-components.json` - 配置文件
- `src/components/ui/` - 組件目錄
- `src/utils/` - 工具函數

### 3. 添加你的第一個圖表

```bash
# 添加長條圖組件
npx d3-components add bar-chart

# 添加簡化版本
npx d3-components add bar-chart --variant simple
```

### 4. 在代碼中使用

```tsx
import { BarChart } from '@/components/ui/bar-chart'

const data = [
  { category: 'A', value: 100 },
  { category: 'B', value: 200 },
  { category: 'C', value: 150 }
]

function App() {
  return (
    <div>
      <h1>我的圖表</h1>
      <BarChart 
        data={data} 
        xKey="category" 
        yKey="value"
        width={600}
        height={400}
      />
    </div>
  )
}
```

## 📋 可用組件

### 基礎圖表
- `bar-chart` - 長條圖
- `line-chart` - 折線圖
- `area-chart` - 區域圖
- `pie-chart` - 圓餅圖
- `scatter-plot` - 散點圖
- `heatmap` - 熱力圖

### 進階圖表
- `candlestick-chart` - K線圖
- `gauge-chart` - 儀表盤
- `funnel-chart` - 漏斗圖
- `box-plot` - 箱形圖
- `radar-chart` - 雷達圖

### 組合圖表
- `combo-chart` - 組合圖表
- `enhanced-combo-chart` - 增強組合圖表

## 🔧 常用配置

### 組件變體

每個組件都支援多種變體：

```bash
# 完整功能版本
npx d3-components add area-chart

# 簡化版本
npx d3-components add area-chart --variant simple

# 堆疊版本
npx d3-components add area-chart --variant stacked
```

### 自動數據映射

組件會自動檢測數據類型並建議最佳映射：

```tsx
// 自動映射：第一個欄位作為 x 軸，第二個作為 y 軸
<BarChart data={data} />

// 手動指定映射
<BarChart 
  data={data} 
  xKey="category" 
  yKey="value" 
/>

// 使用函數映射
<BarChart 
  data={data}
  xAccessor={(d) => d.name}
  yAccessor={(d) => d.count}
/>
```

### 樣式客製化

```tsx
<BarChart 
  data={data}
  width={800}
  height={400}
  colors={['#3b82f6', '#ef4444', '#10b981']}
  showGrid={true}
  animate={true}
  className="my-chart"
/>
```

## 🎯 進階使用

### 組合圖表

```tsx
import { EnhancedComboChart } from '@/components/ui/enhanced-combo-chart'

const series = [
  { type: 'bar', dataKey: 'sales', name: '銷售額' },
  { type: 'line', dataKey: 'growth', name: '成長率' }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="month"
/>
```

### 互動功能

```tsx
<BarChart 
  data={data}
  onDataClick={(data) => console.log('點擊:', data)}
  onDataHover={(data) => console.log('懸停:', data)}
  showTooltip={true}
  tooltipFormat={(d) => `${d.category}: ${d.value}`}
/>
```

## 📖 更多資源

- [完整 API 文檔](./API_REFERENCE.md)
- [最佳實踐](./BEST_PRACTICES.md)
- [範例集合](../demo/)
- [常見問題](./FAQ.md)

## 🆘 需要幫助？

- 查看 [常見問題](./FAQ.md)
- 瀏覽 [GitHub Issues](https://github.com/yangyachiao/d3-components/issues)
- 參考 [最佳實踐指南](./BEST_PRACTICES.md)

---

恭喜！你已經成功設置了 D3 Components。現在可以開始創建美觀的數據可視化了！