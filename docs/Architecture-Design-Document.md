# D3 Components 架構設計文檔

## 🎯 系統設計理念

### 核心哲學

```
純 D3.js 核心 + 框架包裝層 = 框架無關的圖表庫
```

本專案採用**水平+垂直雙架構模式**，旨在建立一個高度模組化、可重用且框架無關的圖表組件系統。

## 🏗️ 垂直架構層次

### 四層架構設計

```
┌─────────────────────────────────────┐
│        Framework Layer              │  ← React/Vue/Angular 包裝層
│  ┌─────────────┐ ┌─────────────┐   │
│  │   React     │ │    Vue      │   │
│  │  Wrapper    │ │  Wrapper    │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
                  ↕ Callbacks (狀態通信)
┌─────────────────────────────────────┐
│         Chart Core Layer            │  ← 特化圖表邏輯
│  ┌─────────────┐ ┌─────────────┐   │
│  │ ScatterPlot │ │   BarChart  │   │
│  │    Core     │ │    Core     │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
                  ↕ Inheritance (繼承)
┌─────────────────────────────────────┐
│        Base Core Layer              │  ← 通用圖表基礎
│         BaseChartCore               │
│    (純 JS/TS + D3.js)              │
└─────────────────────────────────────┘
                  ↕ Composition (組合)
┌─────────────────────────────────────┐
│      Primitives Layer               │  ← 基礎元件庫
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │Axis │ │Scale│ │Color│ │Data │   │
│ │Core │ │Core │ │Core │ │Core │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘
```

#### 1. Framework Layer (框架層)
**職責**: 提供框架特定的 API 和狀態管理
- **React Wrapper**: 使用 `createReactChartWrapper` 創建
- **Vue Wrapper**: 計劃中，可重用相同 Core
- **狀態通信**: 純回調函數，無直接依賴

```typescript
// 框架層範例：React 包裝
export const ScatterPlotV2 = createReactChartWrapper(ScatterPlotCore);
```

#### 2. Chart Core Layer (圖表核心層)
**職責**: 實現特定圖表的業務邏輯
- **純 TypeScript**: 完全框架無關
- **D3.js 驅動**: 所有視覺化邏輯
- **繼承模式**: 擴展 BaseChartCore

```typescript
// 圖表核心範例
export class ScatterPlotCore extends BaseChartCore {
  protected processData(): ChartData[] { /* 散點圖特定邏輯 */ }
  protected createScales(): Record<string, any> { /* 比例尺創建 */ }
  protected renderChart(): void { /* D3 渲染邏輯 */ }
}
```

#### 3. Base Core Layer (基礎核心層)
**職責**: 提供所有圖表共用的基礎功能
- **生命週期管理**: 初始化、更新、銷毀
- **狀態通信**: 錯誤處理、載入狀態、Tooltip
- **工具方法**: 尺寸計算、軸線渲染、智能邊距

```typescript
// 基礎核心抽象類
export abstract class BaseChartCore<TData> {
  // 抽象方法：子類必須實現
  protected abstract processData(): ChartData<TData>[];
  protected abstract createScales(): Record<string, any>;
  protected abstract renderChart(): void;
  
  // 共用功能：智能邊距、軸線渲染等
  protected calculateSmartPadding(elementSize: number): number;
  protected renderStandardAxis(scale: any, orientation: string): void;
}
```

#### 4. Primitives Layer (基礎元件層)
**職責**: 提供最底層的可重用組件
- **AxisCore**: 軸線渲染邏輯
- **ScaleCore**: 比例尺管理
- **ColorCore**: 顏色系統
- **DataCore**: 資料處理工具

## 🔄 水平架構共用模式

### 共用工具系統

```
所有圖表核心 → Primitives (AxisCore, ScaleCore, ColorCore...)
所有圖表核心 → Utils (DataProcessor, Visual Effects...)
所有圖表核心 → BaseChartCore (統一介面與生命週期)
```

#### 智能邊距系統 (水平共用範例)

```typescript
// BaseChartCoreConfig - 所有圖表可用的配置
interface BaseChartCoreConfig {
  // 智能邊距功能（通用配置）
  autoMargin?: boolean;              // 自動邊距，默認 true
  paddingRatio?: number;             // 邊距比例，默認 0.05 (5%)
  minPadding?: number;               // 最小邊距像素，默認 5px
  elementPadding?: {                 // 元素特定邊距設置
    points?: number;                 // 點元素額外邊距
    lines?: number;                  // 線元素額外邊距
    bars?: number;                   // 條形元素額外邊距
  };
}

// BaseChartCore - 通用計算方法
protected calculateSmartPadding(
  elementSize: number, 
  elementType: 'points' | 'lines' | 'bars'
): number {
  // 使用配置計算最適邊距值
  const paddingRatio = this.config.paddingRatio ?? 0.05;
  const minPadding = this.config.minPadding ?? 5;
  const elementPadding = this.config.elementPadding?.[elementType] ?? 0;
  
  return Math.max(minPadding, ratioBasedPadding, elementBasedPadding);
}
```

## 📊 架構實現模式

### 1. 狀態通信模式

**問題**: 框架層如何與純 JS 核心通信？
**解決**: 回調函數依賴注入

```typescript
// 核心層 → 框架層 (通過回調)
interface ChartStateCallbacks {
  onError?: (error: Error) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onTooltipShow?: (x: number, y: number, content: unknown) => void;
  onTooltipHide?: () => void;
}

// 框架層註冊回調
const callbacks: ChartStateCallbacks = {
  onTooltipShow: (x, y, content) => {
    // React 狀態更新
    setTooltip({ x, y, content, visible: true });
  }
};

// 核心層使用回調
this.callbacks.onTooltipShow?.(x, y, content);
```

### 2. 繼承與組合混合模式

**BaseChartCore**: 抽象基類提供結構
**特化核心**: 繼承實現具體邏輯
**Primitives**: 組合提供工具功能

```typescript
// 繼承：獲得標準生命週期
export class ScatterPlotCore extends BaseChartCore {
  // 組合：使用基礎工具
  private axisCore = new AxisCore(config);
  private scaleManager = new ScaleManager();
  
  // 特化：實現特定邏輯
  protected renderChart(): void {
    const scales = this.createScales();  // 特化方法
    this.renderXAxis(scales.x);          // 繼承方法
    this.renderPoints(scales);           // 特化方法
  }
}
```

### 3. 工廠模式包裝

**createReactChartWrapper**: 統一的 React 包裝工廠

```typescript
export function createReactChartWrapper<TCore extends BaseChartCore>(
  CoreClass: new (...args: any[]) => TCore
) {
  return React.forwardRef((props, ref) => {
    // 統一的 React hooks 邏輯
    // 統一的生命週期管理
    // 統一的錯誤處理
    // 統一的狀態同步
  });
}
```

## 🎯 架構優勢與解決問題

### 解決的核心問題

#### 1. 框架耦合問題
**問題**: 圖表邏輯與 React 緊密耦合，難以擴展到其他框架
**解決**: 純 JS/TS 核心 + 框架包裝層分離

#### 2. 狀態同步問題
**問題**: React hooks 與 class 組件狀態不同步
**解決**: 回調函數通信機制，避免直接狀態依賴

#### 3. 程式碼重複問題
**問題**: 每個圖表重複實現軸線、比例尺、顏色等邏輯
**解決**: BaseChartCore + Primitives 提供共用工具

#### 4. 測試困難問題
**問題**: 圖表邏輯與 DOM 渲染混合，難以單元測試
**解決**: 純邏輯核心可獨立測試，不依賴 DOM

### 架構優勢

#### 1. 框架無關性
- **現在**: 支援 React
- **未來**: 可輕鬆擴展到 Vue、Angular
- **核心邏輯**: 完全不需要修改

#### 2. 高度模組化
- **垂直分層**: 職責清晰，易於維護
- **水平共用**: 工具復用，減少重複程式碼
- **組合靈活**: 可按需組合功能

#### 3. 可測試性
- **核心邏輯**: 純函數，易於單元測試
- **框架包裝**: 可模擬核心邏輯測試 UI 層
- **隔離測試**: 各層可獨立測試

#### 4. 效能最佳化
- **Canvas 降級**: 大數據集自動切換到 Canvas 渲染
- **智能邊距**: 避免元素裁切，改善使用體驗
- **記憶體管理**: 完整的生命週期管理

## 🔧 開發指導原則

### 1. 新組件開發流程

```typescript
// Step 1: 定義核心配置接口
interface NewChartCoreConfig extends BaseChartCoreConfig {
  // 特定配置選項
}

// Step 2: 實現核心類別
class NewChartCore extends BaseChartCore<DataType> {
  protected processData(): ChartData<DataType>[] { /* 實現 */ }
  protected createScales(): Record<string, any> { /* 實現 */ }
  protected renderChart(): void { /* 實現 */ }
  public getChartType(): string { return 'new-chart'; }
}

// Step 3: 創建 React 包裝
export const NewChart = createReactChartWrapper(NewChartCore);

// Step 4: 導出配置
export interface NewChartProps extends ReactChartWrapperProps, NewChartCoreConfig {}
```

### 2. 水平功能擴展指導

```typescript
// Step 1: 在 BaseChartCoreConfig 添加配置
interface BaseChartCoreConfig {
  newFeature?: NewFeatureConfig;
}

// Step 2: 在 BaseChartCore 實現通用方法
protected useNewFeature(): void {
  // 通用實現邏輯
}

// Step 3: 各圖表核心按需使用
class SpecificChartCore extends BaseChartCore {
  protected renderChart(): void {
    if (this.config.newFeature?.enabled) {
      this.useNewFeature();  // 使用共用功能
    }
  }
}
```

### 3. 命名規範

#### 文件結構
```
components/[category]/[chart-name]/
├── core/
│   ├── [chart-name]-core.ts      # 核心邏輯
│   └── index.ts                  # 導出
├── [chart-name]-v2.tsx           # 新架構版本
├── [chart-name]-legacy.tsx       # 舊版本（相容性）
└── types.ts                      # 型別定義
```

#### 介面命名
- **核心配置**: `[ChartName]CoreConfig`
- **React Props**: `[ChartName]Props`
- **核心類別**: `[ChartName]Core`
- **工廠組件**: `[ChartName]V2`

#### 事件命名
- **數據點擊**: `onDataClick`
- **數據懸停**: `onDataHover`  
- **選區變更**: `onSelectionChange`
- **縮放變更**: `onZoomChange`

## 📈 架構健康度指標

### 當前狀態 (64/100)

| 指標 | 分數 | 改善方向 |
|------|------|---------|
| **架構合規性** | 65/100 | 更多組件遷移到新架構 |
| **測試覆蓋率** | 56/100 | 擴展 Core 層單元測試 |
| **API 一致性** | 62/100 | 統一事件處理命名 |
| **文檔完整性** | 60/100 | 完善 API 文檔和範例 |
| **效能表現** | 70/100 | Canvas 降級最佳化 |

### 改善計劃

#### Phase 1: 架構統一 (目標: 80/100)
- [ ] 將剩餘組件遷移到新架構
- [ ] 統一事件處理器命名規範
- [ ] 完善 TypeScript 型別定義

#### Phase 2: 測試完善 (目標: 85/100)  
- [ ] 為所有 Core 類別添加單元測試
- [ ] 建立整合測試套件
- [ ] 效能基準測試

#### Phase 3: 文檔與範例 (目標: 90/100)
- [ ] 完整的 API 參考文檔
- [ ] 詳細的開發指南
- [ ] 豐富的使用範例

## 🔮 未來擴展計劃

### 框架支援擴展

```typescript
// Vue 包裝層 (計劃中)
export function createVueChartWrapper<TCore extends BaseChartCore>(
  CoreClass: new (...args: any[]) => TCore
) {
  // Vue 3 Composition API 包裝邏輯
}

// Angular 包裝層 (計劃中)  
export function createAngularChartWrapper<TCore extends BaseChartCore>(
  CoreClass: new (...args: any[]) => TCore
) {
  // Angular 組件包裝邏輯
}
```

### 功能擴展方向

1. **3D 圖表支援**: 使用 Three.js 或 WebGL
2. **即時數據流**: WebSocket 整合
3. **協作功能**: 多用戶同步編輯
4. **AI 輔助**: 智能圖表推薦和最佳化建議

## 📚 參考資料

- [D3.js 官方文檔](https://d3js.org/)
- [React Wrapper 模式](https://reactjs.org/docs/higher-order-components.html)
- [TypeScript 抽象類別](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members)
- [圖表庫設計模式](https://observablehq.com/@d3/d3-selection)

---

**📌 本文檔將隨著架構演進持續更新，確保與實際實現同步。**