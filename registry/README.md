# 📊 D3 Components Registry

一個基於 D3.js 和 React 的現代化圖表組件庫，採用統一的數據存取模式和模組化架構設計。

## 🚀 快速開始

### 安裝
```bash
npm install @d3-components/registry
```

### 基本使用
```typescript
import { BarChart, LineChart, ScatterPlot } from '@d3-components/registry';

// 使用統一的 mapping 配置（推薦方式）
<BarChart 
  data={salesData}
  mapping={{
    x: "month",
    y: "revenue",
    color: "region"
  }}
  width={600}
  height={400}
/>
```

## 📈 支援的圖表類型

### 基礎圖表 (Basic Charts)
- **BarChart** - 長條圖/直方圖
- **LineChart** - 折線圖
- **AreaChart** - 區域圖
- **PieChart** - 圓餅圖/環形圖

### 統計圖表 (Statistical Charts)
- **ScatterPlot** - 散點圖/氣泡圖
- **BoxPlot** - 箱形圖
- **ViolinPlot** - 小提琴圖
- **RadarChart** - 雷達圖/蜘蛛圖
- **TreeMap** - 樹狀圖

### 金融圖表 (Financial Charts)
- **CandlestickChart** - K線圖/蠟燭圖

### 複合圖表 (Composite Charts)
- **ComboChart** - 複合圖表
- **EnhancedComboChart** - 增強型複合圖表

## 🎯 統一數據存取模式

### ✅ 推薦：使用 Mapping 配置

我們強烈建議使用統一的 `mapping` 配置來指定數據欄位映射：

```typescript
// ✅ 統一且靈活的方式
<ScatterPlot 
  data={data}
  mapping={{
    x: "revenue",                        // 簡單欄位映射
    y: (d) => d.profit / d.revenue,      // 計算欄位
    size: "employees",                   // 氣泡大小
    color: (d) => d.region               // 分類著色
  }}
/>
```

### ⚠️ 向下兼容：舊有方式

以下方式仍然支援但已標記為 deprecated，將在 v1.0.0 版本中移除：

```typescript
// ❌ 即將廢棄：Key-based 模式
<BarChart xKey="year" yKey="revenue" />

// ❌ 即將廢棄：Accessor-based 模式  
<LineChart 
  xAccessor={(d) => d.date}
  yAccessor={(d) => d.value}
/>
```

### 🔄 遷移指南

**從 Key-based 遷移：**
```typescript
// Before
<BarChart xKey="year" yKey="revenue" />

// After
<BarChart mapping={{ x: "year", y: "revenue" }} />
```

**從 Accessor-based 遷移：**
```typescript
// Before
<LineChart 
  xAccessor={(d) => d.date}
  yAccessor={(d) => d.value * 100}
/>

// After
<LineChart 
  mapping={{
    x: (d) => d.date,
    y: (d) => d.value * 100
  }}
/>
```

## 🎨 主要特性

### 🔧 統一的 API 設計
所有組件都遵循一致的 props 介面和命名規範：
- `mapping` - 統一的數據映射配置
- `onDataClick` / `onDataHover` - 標準化的事件處理
- `animate` - 統一的動畫控制
- `colors` - 一致的顏色配置

### 📱 響應式設計
所有圖表都支援響應式布局：
```typescript
<BarChart 
  data={data}
  mapping={{ x: "category", y: "value" }}
  width="100%"  // 自動適應容器寬度
  height={400}
/>
```

### 🎯 交互功能
內建豐富的交互功能：
```typescript
<ScatterPlot 
  data={data}
  mapping={{ x: "x", y: "y" }}
  
  // 筆刷縮放
  enableBrushZoom={true}
  onZoom={(domain) => console.log('Zoomed:', domain)}
  
  // 十字游標
  enableCrosshair={true}
  
  // 事件處理
  onDataClick={(point) => console.log('Clicked:', point)}
  onDataHover={(point) => showTooltip(point)}
/>
```

### 🎨 主題化支援
支援完整的主題化配置：
```typescript
<LineChart 
  data={data}
  mapping={{ x: "date", y: "value" }}
  colors={["#3b82f6", "#ef4444", "#10b981"]}
  animate={true}
  animationDuration={1000}
/>
```

## 📊 實際使用範例

### 銷售儀表板
```typescript
const SalesDashboard = ({ salesData }) => {
  return (
    <div className="dashboard">
      {/* 月度趨勢 */}
      <LineChart 
        data={salesData}
        mapping={{
          x: (d) => new Date(d.date),
          y: "revenue",
          series: "region"
        }}
        showGrid={true}
        enableCrosshair={true}
      />
      
      {/* 地區分布 */}
      <PieChart 
        data={regionData}
        mapping={{
          label: "region",
          value: "total"
        }}
        showLegend={true}
        innerRadius={50}
      />
      
      {/* 產品表現 */}
      <BarChart 
        data={productData}
        mapping={{
          x: "product",
          y: "sales",
          color: (d) => d.performance > 80 ? "success" : "warning"
        }}
        orientation="horizontal"
      />
    </div>
  );
};
```

### 統計分析
```typescript
const StatisticalAnalysis = ({ experimentData }) => {
  return (
    <div className="analysis">
      {/* 數據分布 */}
      <BoxPlot 
        data={experimentData}
        mapping={{
          label: "group",
          values: (d) => d.measurements
        }}
        showOutliers={true}
        showMean={true}
      />
      
      {/* 相關性分析 */}
      <ScatterPlot 
        data={correlationData}
        mapping={{
          x: "variable1",
          y: "variable2",
          color: "group",
          size: "confidence"
        }}
        showTrendline={true}
        enableBrushZoom={true}
      />
    </div>
  );
};
```

## 🛠️ 開發指南

### 本地開發
```bash
# 克隆專案
git clone [repository-url]

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 運行測試
npm run test

# 類型檢查
npm run type-check

# 程式碼檢查
npm run lint
```

### 測試
```bash
# 運行所有測試
npm run test

# 帶覆蓋率報告
npm run test:coverage

# 互動式測試 UI
npm run test:ui
```

### 建構
```bash
# 建構生產版本
npm run build

# 健康檢查
npm run health-check
```

## 📚 文檔

### 詳細指南
- [📊 數據存取模式指南](../docs/DATA_ACCESS_PATTERNS.md) - 完整的數據映射使用指南
- [🎨 主題化指南](./docs/THEMING.md) - 自訂主題和樣式
- [🔧 架構設計](./docs/ARCHITECTURE.md) - 組件庫架構說明

### API 文檔
每個組件都有完整的 API 文檔：
- [BarChart API](./components/basic/bar-chart/README.md)
- [LineChart API](./components/basic/line-chart/README.md)
- [ScatterPlot API](./components/statistical/scatter-plot/README.md)
- [更多組件...](./components/)

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下指南：

### 程式碼規範
1. **使用 mapping 配置** - 新組件必須支援統一的 mapping 介面
2. **標準化事件命名** - 使用 `onDataClick` / `onDataHover` 等標準命名
3. **完整的 TypeScript 支援** - 提供完整的型別定義
4. **編寫測試** - 新功能必須包含相應的測試

### 提交流程
```bash
# 1. Fork 專案
# 2. 建立功能分支
git checkout -b feature/your-feature-name

# 3. 提交更改
git commit -m "feat: add new chart component"

# 4. 推送到您的 Fork
git push origin feature/your-feature-name

# 5. 建立 Pull Request
```

## 📈 版本規劃

### 當前版本 (v0.1.0)
- ✅ 完整的基礎圖表組件
- ✅ 統計圖表組件
- ✅ 統一的數據存取模式
- ✅ 標準化的事件處理
- ✅ 動畫系統

### 下個版本 (v1.0.0)
- 🔄 移除 deprecated 的 key-based / accessor-based 支援
- 📱 增強響應式支援
- 🎨 完整的主題系統
- 📊 更多圖表類型

## 📄 授權

MIT License - 詳見 [LICENSE](../LICENSE) 文件。

## 🙏 致謝

感謝所有為這個專案貢獻的開發者和社群成員！

---

*最後更新：2025-01-24*
*版本：v0.1.0*