# D3 Components 開發指南

## 快速開始

本指南提供 D3 Components 專案的開發標準和最佳實踐，幫助開發者快速上手並維持程式碼品質。

## 📋 新組件開發檢查清單

### Phase 1: 規劃與設計
- [ ] 確認組件類型 (basic/composite/statistical/financial)
- [ ] 檢查是否有類似組件可參考
- [ ] 定義資料結構和 Props 介面
- [ ] 規劃核心功能和可選功能

### Phase 2: 架構實作
- [ ] 建立三層架構結構
  ```
  components/[category]/[chart-name]/
  ├── core/
  │   ├── [chart-name]-core.ts    # 純 TS 核心邏輯
  │   ├── types.ts                 # 型別定義
  │   └── index.ts                 # 核心導出
  ├── [chart-name].tsx             # React 包裝層
  ├── [chart-name].test.tsx       # 測試檔案
  ├── [chart-name].css             # 樣式檔案
  ├── types.ts                     # 組件型別
  └── index.ts                     # 統一導出
  ```

### Phase 3: 核心實作標準

#### 3.1 型別安全 ✅
```typescript
// ✅ Props 介面定義
export interface MyChartProps extends BaseChartProps {
  // 使用 unknown 而非 any
  xAccessor?: (d: unknown) => unknown;
  yAccessor?: (d: unknown) => number;
  
  // 明確的事件處理器
  onDataClick?: (data: unknown, event: MouseEvent) => void;
  onDataHover?: (data: unknown | null, event: MouseEvent) => void;
}
```

#### 3.2 核心類別 ✅
```typescript
// 繼承 BaseChartCore
export class MyChartCore extends BaseChartCore<unknown> {
  // 明確的私有成員型別
  private processedData: ProcessedDataPoint[] = [];
  private scales: {
    xScale?: D3Scale;
    yScale?: D3Scale;
  } = {};
  
  // 必要的抽象方法實作
  public getChartType(): string {
    return 'my-chart';
  }
  
  protected processData(): ProcessedDataPoint[] {
    // 資料處理邏輯
    return this.processedData;
  }
  
  protected createScales(): Record<string, D3Scale> {
    // 建立比例尺
    return this.scales;
  }
  
  protected renderChart(): void {
    // 圖表渲染邏輯
  }
}
```

#### 3.3 React 包裝層 ✅
```typescript
// 使用 createReactChartWrapper
const MyChartComponent = createReactChartWrapper(MyChartCore);

export const MyChart = React.forwardRef<MyChartCore, MyChartProps>(
  (props, ref) => {
    const finalProps = {
      ...defaultMyChartProps,
      ...props
    };
    return <MyChartComponent ref={ref} {...finalProps} />;
  }
);

MyChart.displayName = 'MyChart';
```

### Phase 4: 功能實作檢查

#### 4.1 基礎功能 (必須)
- [ ] 資料處理 (DataProcessor 整合)
- [ ] 比例尺建立 (D3 Scales)
- [ ] 基本渲染 (SVG/Canvas)
- [ ] 響應式支援 (ResizeObserver)
- [ ] 錯誤處理 (try-catch + 錯誤邊界)

#### 4.2 標準功能 (推薦)
- [ ] 動畫效果 (D3 Transition)
- [ ] 工具提示 (Tooltip)
- [ ] 軸線系統 (統一 Axis)
- [ ] 顏色管理 (ColorScale)
- [ ] 事件處理 (Click/Hover)

#### 4.3 進階功能 (選擇性)
- [ ] 圖例顯示 (Legend)
- [ ] 縮放互動 (Brush/Zoom)
- [ ] 十字游標 (Crosshair)
- [ ] 資料標籤 (Labels)
- [ ] 匯出功能 (PNG/SVG)

### Phase 5: 測試要求

#### 5.1 單元測試 ✅
```typescript
describe('MyChart', () => {
  // 基礎渲染測試
  it('should render without errors', () => {
    render(<MyChart data={mockData} />);
    expect(screen.getByTestId('my-chart')).toBeInTheDocument();
  });
  
  // Props 測試
  it('should handle prop changes', () => {
    const { rerender } = render(<MyChart data={data1} />);
    rerender(<MyChart data={data2} />);
    // 驗證更新邏輯
  });
  
  // 事件測試
  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<MyChart data={mockData} onDataClick={handleClick} />);
    // 觸發並驗證事件
  });
});
```

#### 5.2 視覺測試 (選擇性)
- [ ] 基本樣式正確
- [ ] 響應式佈局
- [ ] 深色模式支援

### Phase 6: 文檔與範例

#### 6.1 程式碼文檔 ✅
```typescript
/**
 * MyChart - 自訂圖表組件
 * 
 * @example
 * ```tsx
 * <MyChart
 *   data={data}
 *   xAccessor={d => d.date}
 *   yAccessor={d => d.value}
 *   onDataClick={handleClick}
 * />
 * ```
 */
```

#### 6.2 Demo 頁面 ✅
- [ ] 建立 Demo 頁面 (`demo/src/pages/MyChartDemo.tsx`)
- [ ] 使用 DemoPageTemplate
- [ ] 提供多個使用範例
- [ ] 包含互動控制項

### Phase 7: 品質檢查

#### 7.1 ESLint 檢查 ✅
```bash
# 執行 ESLint 檢查
npm run lint

# 自動修復可修復的問題
npm run lint:fix
```

#### 7.2 TypeScript 檢查 ✅
```bash
# 型別檢查
npm run typecheck
```

#### 7.3 建構測試 ✅
```bash
# 建構專案
npm run build

# 執行測試
npm run test
```

## 🚀 常見開發任務

### 創建新的基礎圖表
```bash
# 1. 建立目錄結構
mkdir -p registry/components/basic/my-chart/{core,__tests__}

# 2. 建立核心檔案
touch registry/components/basic/my-chart/core/my-chart-core.ts
touch registry/components/basic/my-chart/core/types.ts
touch registry/components/basic/my-chart/my-chart.tsx
touch registry/components/basic/my-chart/index.ts

# 3. 參考現有組件
# 推薦參考: bar-chart, line-chart, pie-chart
```

### 添加新的 Primitive 組件
```bash
# Primitives 是可重用的基礎元件
mkdir -p registry/components/primitives/my-primitive

# 建立純 JS/TS 實作
touch registry/components/primitives/my-primitive/my-primitive.ts
touch registry/components/primitives/my-primitive/types.ts
```

### 建立複合圖表
```bash
# Composite 組件組合多個基礎元件
mkdir -p registry/components/composite/my-combo-chart

# 重用現有 primitives 和 basic 組件
# 參考: enhanced-combo-chart-v2
```

## 🎯 最佳實踐

### 1. 資料處理
```typescript
// 使用統一的 DataProcessor
import { DataProcessor } from '@/core/data-processor';

const processor = new DataProcessor({
  mapping: { x: 'date', y: 'value' },
  autoDetect: true
});

const processed = processor.process(rawData);
```

### 2. 顏色管理
```typescript
// 使用 ColorScale 管理顏色
import { createColorScale } from '@/core/color-scheme';

const colorScale = createColorScale(
  ['#3b82f6', '#ef4444', '#10b981'],
  'ordinal'
);
```

### 3. 響應式設計
```typescript
// 使用 ResizeObserver
protected setupResize(): void {
  if (this.config.responsive) {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.containerElement);
  }
}
```

### 4. 錯誤處理
```typescript
// 統一的錯誤處理模式
try {
  this.renderChart();
} catch (error) {
  this.handleError(error as Error);
  // 顯示錯誤訊息或 fallback UI
}
```

## 📝 命名規範

### 檔案命名
- 組件檔案：`kebab-case` (例：`bar-chart.tsx`)
- 型別檔案：`types.ts`
- 測試檔案：`[name].test.tsx`
- 樣式檔案：`[name].css`

### 類別/介面命名
- 組件類別：`PascalCase` (例：`BarChart`)
- 核心類別：`[Name]Core` (例：`BarChartCore`)
- Props 介面：`[Name]Props` (例：`BarChartProps`)
- 配置介面：`[Name]Config` (例：`BarChartConfig`)

### 函數命名
- 公開方法：`camelCase` (例：`getData`)
- 私有方法：`camelCase` with `private` (例：`private processPoint`)
- 事件處理：`on[Event]` (例：`onDataClick`)
- 型別守衛：`is[Type]` (例：`isValidData`)

## 🔄 Git 工作流程

### 分支策略
```bash
# 功能開發
git checkout -b feature/chart-name

# 錯誤修復
git checkout -b fix/issue-description

# 重構
git checkout -b refactor/component-name
```

### Commit 規範
```bash
# 功能
git commit -m "feat: add new chart type"

# 修復
git commit -m "fix: resolve data processing error"

# 重構
git commit -m "refactor: improve type safety in BarChart"

# 文檔
git commit -m "docs: update API documentation"
```

## 🛠 除錯技巧

### 1. 資料處理除錯
```typescript
// 添加 console.log 在關鍵步驟
console.log('[MyChart] Raw data:', this.data);
console.log('[MyChart] Processed data:', this.processedData);
console.log('[MyChart] Scales:', this.scales);
```

### 2. D3 選擇器除錯
```typescript
// 檢查 DOM 元素
const selection = d3.select(this.element);
console.log('[MyChart] Selection nodes:', selection.nodes());
```

### 3. 事件處理除錯
```typescript
// 追蹤事件觸發
onDataClick={(data, event) => {
  console.log('[Click]', { data, event });
  handleClick(data);
}}
```

## 📚 相關資源

### 內部文檔
- [型別安全指南](./TYPE_SAFETY_GUIDE.md)
- [ESLint 策略](./ESLINT_STRATEGY.md)
- [品質報告](./QUALITY_REPORT.md)
- [架構說明](./CLAUDE.md)

### 外部資源
- [D3.js 官方文檔](https://d3js.org/)
- [React 文檔](https://react.dev/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)
- [Vitest 測試框架](https://vitest.dev/)

## ❓ 常見問題

### Q: 如何選擇繼承 BaseChart 還是 BaseChartCore？
**A:** 優先使用 `BaseChartCore` (框架無關)。只有在需要 React 特定功能時才使用 `BaseChart`。

### Q: 何時使用 `any` vs `unknown`？
**A:** 公開 API 始終使用 `unknown`。內部複雜的 D3 操作可以使用 `any`。

### Q: 如何處理大量資料？
**A:** 
1. 使用資料取樣 (DataProcessor 支援)
2. 實作虛擬化渲染 (參考 VirtualList)
3. 使用 Canvas 而非 SVG

### Q: 如何添加自訂主題？
**A:** 使用 ColorScale 和 CSS 變數組合。參考 `primitives/theme` 系統。

---

**最後更新：** 2025-09-05
**版本：** v1.0
**維護者：** D3 Components Team