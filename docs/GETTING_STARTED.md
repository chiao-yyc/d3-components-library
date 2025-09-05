# 快速開始指南

D3 Components 是一個基於 shadcn/ui 理念的 D3.js 組件庫，提供 Copy & Paste 的透明化圖表組件。

## 🚀 5 分鐘快速上手

> 💡 **互動式安裝指南**: 查看我們的 [Demo 安裝指南](../demo/) 獲得更詳細的交互式設置體驗

### 1. 安裝 CLI 工具

選擇你偏好的套件管理器：

```bash
# 使用 npm
npm install -g d3-components-cli

# 使用 yarn
yarn global add d3-components-cli

# 使用 pnpm
pnpm add -g d3-components-cli

# 或直接使用 npx（無需全域安裝）
npx d3-components --help
```

### 2. 檢查專案環境

確保你的專案環境符合要求：

```bash
# 檢查 Node.js 版本（需要 ≥ 18）
node --version

# 檢查是否為 React 專案
ls package.json
```

**支援的框架**:
- ✅ Create React App
- ✅ Next.js 13+ (App Router)
- ✅ Vite + React
- ✅ Remix

### 3. 初始化專案

在你的 React 專案根目錄執行：

```bash
npx d3-components init
```

這個指令會：
- 🔍 自動檢測你的專案類型
- 📁 創建 `d3-components.json` 配置文件
- 🏗️ 設置 `src/components/ui/` 組件目錄
- ⚙️ 安裝必要的依賴套件 (d3, @types/d3)
- 🎨 配置 Tailwind CSS (如果尚未安裝)

### 4. 添加你的第一個圖表

```bash
# 添加長條圖組件
npx d3-components add bar-chart

# 查看可用的變體
npx d3-components add bar-chart --help

# 添加特定變體
npx d3-components add bar-chart --variant simple
```

### 5. 在代碼中使用

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

## 🔧 進階配置

### 手動安裝 (不使用 CLI)

如果你偏好手動設置：

```bash
# 安裝核心依賴
npm install d3 @types/d3

# 安裝 Tailwind CSS (如果尚未安裝)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

然後手動複製需要的組件檔案到你的專案中。

### 故障排除

**常見問題**:

1. **TypeScript 報錯**: 確保安裝了 `@types/d3`
2. **樣式問題**: 檢查 Tailwind CSS 配置
3. **路徑解析**: 確保 tsconfig.json 中配置了 `@/*` 路徑映射

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## ⚡ 快速驗證

安裝完成後，執行以下命令驗證：

```bash
# 檢查 CLI 版本
npx d3-components --version

# 列出可用組件
npx d3-components list

# 檢查專案配置
cat d3-components.json
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

### 📚 文檔與指南
- [完整 API 文檔](./API_REFERENCE.md)
- [最佳實踐](./BEST_PRACTICES.md)
- [常見問題](./FAQ.md)
- [架構設計文檔](./ARCHITECTURE.md)

### 🎮 互動式學習
- [**🎯 互動式安裝指南**](../demo/src/pages/InstallationGuide.tsx) - Demo 中的詳細安裝嚮導
- [圖表範例集合](../demo/) - 所有組件的互動式 Demo
- [圖表總覽館](../demo/src/pages/ChartsShowcase.tsx) - 快速瀏覽所有可用圖表
- [圖表實驗室](../demo/src/pages/Gallery.tsx) - 即時測試和實驗功能

### 🔗 線上資源
- [GitHub 儲存庫](https://github.com/yangyachiao/d3-components)
- [Issues 回報](https://github.com/yangyachiao/d3-components/issues)
- [CLI 工具文檔](../cli/README.md)

## 🆘 需要幫助？

1. **安裝問題**: 查看 [互動式安裝指南](../demo/src/pages/InstallationGuide.tsx)
2. **使用疑問**: 瀏覽 [常見問題](./FAQ.md)
3. **錯誤報告**: 提交 [GitHub Issues](https://github.com/yangyachiao/d3-components/issues)
4. **最佳實踐**: 參考 [最佳實踐指南](./BEST_PRACTICES.md)

---

🎉 **恭喜！** 你已經成功設置了 D3 Components。

**下一步建議:**
1. 🎯 前往 [互動式安裝指南](../demo/src/pages/InstallationGuide.tsx) 完成詳細配置
2. 📊 在 [圖表總覽館](../demo/src/pages/ChartsShowcase.tsx) 探索所有可用圖表
3. 🧪 到 [圖表實驗室](../demo/src/pages/Gallery.tsx) 開始你的第一個圖表！