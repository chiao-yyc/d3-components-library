# Heatmap Heatmap 熱力圖

熱力圖組件，適合顯示矩陣數據和相關性分析

## 📊 功能特色

- ✅ **顏色映射** - 顏色映射相關功能
- ✅ **數值範圍** - 數值範圍相關功能
- ✅ **格式化顯示** - 格式化顯示相關功能
- ✅ **互動懸停** - 互動懸停相關功能
- ✅ **互動功能** - 支援的互動功能
- ✅ **視覺效果** - 支援的視覺效果
- ✅ **無障礙支援** - ARIA 標籤、鍵盤導覽
- ✅ **TypeScript** - 完整類型支援

## 🚀 基本使用

```tsx
import { Heatmap } from '@d3-components/basic';

// 準備資料
const data = [
  // 範例數據
];

// 基本組件
function BasicComponent() {
  return (
    <Heatmap
      data={data}
      width={600}
      height={400}
      // 必要屬性
    />
  );
}
```

## 🎨 進階範例

### 範例 1：功能描述

```tsx
function AdvancedExample() {
  return (
    <Heatmap
      data={data}
      width={800}
      height={600}
      // 進階配置
    />
  );
}
```

### 範例 2：互動功能

```tsx
function InteractiveExample() {
  return (
    <Heatmap
      data={data}
      width={800}
      height={600}
      
      // 互動功能
      interactive={true}
      onDataClick={(data) => console.log('點擊數據:', data)}
      onDataHover={(data) => console.log('懸停數據:', data)}
    />
  );
}
```

## 📝 API 參考

### 基本屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `data` | `T[]` | **必需** | 圖表數據陣列 |
| `width` | `number` | `400` | 圖表寬度 |
| `height` | `number` | `300` | 圖表高度 |
| `margin` | `Margin` | `{top: 20, right: 40, bottom: 40, left: 40}` | 邊距設定 |

### 數據映射

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `xAccessor` | `(d: T) => number \| string` | **必需** | X 軸數據存取器 |
| `yAccessor` | `(d: T) => number` | **必需** | Y 軸數據存取器 |

### 視覺樣式

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `colors` | `string[]` | 預設色彩 | 色彩陣列 |
| `opacity` | `number` | `0.7` | 透明度 |

### 互動功能

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `interactive` | `boolean` | `false` | 啟用基本互動 |

### 事件處理器

| 屬性 | 類型 | 說明 |
|------|------|------|
| `onDataClick` | `(data: ProcessedDataPoint, event: MouseEvent) => void` | 數據點點擊事件 |
| `onDataHover` | `(data: ProcessedDataPoint \| null, event: MouseEvent) => void` | 數據點懸停事件 |

### 無障礙屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `aria-label` | `string` | `'Heatmap 熱力圖'` | ARIA 標籤 |
| `aria-describedby` | `string` | - | ARIA 描述 |

## 🎯 使用場景

### 1. 場景 1
```tsx
// 場景描述
<Heatmap
  data={data}
  // 相關配置
/>
```

### 2. 場景 2
```tsx
// 場景描述
<Heatmap
  data={data}
  // 相關配置
/>
```

## 📐 資料格式

### 基本資料格式
```typescript
interface DataPoint {
  // 必要欄位
  value: number;
  // 其他可選欄位
  [key: string]: any;
}
```

### 完整資料範例
```typescript
const data = [
  {
    id: 1,
    name: "項目 A",
    value: 100,
    category: "類別 1"
  },
  // ... 更多資料
];
```

## 🔧 技術細節

### 繼承架構
```
Heatmap (React Component)
└── D3Heatmap (D3 Logic Class)
    └── BaseChart (Abstract Base)
```

### 核心模組
- **數據處理**: `DataProcessor` - 統一的數據轉換
- **比例尺管理**: `ScaleManager` - 集中式比例尺管理  
- **互動控制**: 相關控制器
- **視覺效果**: 相關視覺效果模組

### 效能優化
- 使用 `useMemo` 進行數據處理緩存
- 智能重渲染：僅更新變化的部分
- 大數據集支援：性能優化策略
- SVG 最佳化：相關優化措施

## 🧪 測試

```bash
# 運行組件測試
npm run test components/category/component-name

# 運行特定測試
npm run test component-name.test.tsx

# 測試覆蓋率
npm run test:coverage
```

### 測試範圍
- ✅ 基本渲染測試
- ✅ 數據更新測試  
- ✅ 事件處理測試
- ✅ 無障礙功能測試
- ✅ 效能測試（如適用）
- ✅ 邊界情況測試

## 🐛 已知問題

目前沒有已知的重大問題。如有問題請提交 Issue。

## 📝 更新日誌

### v1.0.0 (2025-08-23)
- ✨ 初始版本發布
- ✅ 基本功能實現
- ✅ 測試覆蓋完成

---

**相關組件**: [相關組件鏈接]

**參考文檔**: [Architecture Guidelines](../../../docs/ARCHITECTURE_GUIDELINES.md)