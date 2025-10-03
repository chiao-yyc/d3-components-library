# D3 Components 型別安全開發指南

## 目的與原則

本指南定義了 D3 Components 專案的型別安全標準和最佳實踐，確保程式碼的可維護性和執行時安全性。

## 🎯 核心原則

1. **優先使用 `unknown` 而非 `any`** - 強制型別檢查
2. **明確的型別定義** - 避免隱式推斷
3. **漸進式型別改善** - 不追求 100% 完美
4. **實用主義導向** - 平衡型別安全與開發效率

## 📐 標準模式

### 1. 資料存取器 (Data Accessors)

#### ✅ 推薦模式
```typescript
// 統一使用 unknown 強制型別檢查
interface ChartProps {
  xAccessor?: (d: unknown) => number | string | Date;
  yAccessor?: (d: unknown) => number;
  categoryAccessor?: (d: unknown) => string;
}

// 使用時進行型別守衛
const getValue = (d: unknown): number => {
  if (typeof d === 'object' && d !== null && 'value' in d) {
    const value = (d as { value: unknown }).value;
    if (typeof value === 'number') {
      return value;
    }
  }
  return 0;
};
```

#### ❌ 避免模式
```typescript
// 避免使用 any - 失去型別檢查
xAccessor?: (d: any) => any;

// 避免過度複雜的型別 - 難以維護
xAccessor?: <T extends Record<string, unknown>>(d: T) => T[keyof T];
```

### 2. D3.js 型別整合

#### ✅ 標準 D3 型別定義
```typescript
import * as d3 from 'd3';

// Scale 型別聯合
export type D3Scale = 
  | d3.ScaleLinear<number, number>
  | d3.ScaleTime<number, number>
  | d3.ScaleBand<string>
  | d3.ScaleOrdinal<string, unknown>;

// Selection 型別
export type D3Selection = d3.Selection<
  SVGGElement,
  unknown,
  HTMLElement | null,
  undefined
>;

// Axis 型別
export type D3Axis = d3.Axis<d3.AxisDomain>;
```

#### 實際使用範例
```typescript
class ChartCore {
  private scales: {
    xScale?: D3Scale;
    yScale?: D3Scale;
  } = {};

  protected renderAxis(
    scale: D3Scale,
    config: AxisConfig
  ): void {
    // 型別安全的軸線渲染
    if (this.isLinearScale(scale)) {
      // Linear scale specific logic
    } else if (this.isBandScale(scale)) {
      // Band scale specific logic
    }
  }

  // 型別守衛
  private isLinearScale(
    scale: D3Scale
  ): scale is d3.ScaleLinear<number, number> {
    return 'invert' in scale;
  }
}
```

### 3. 事件處理器型別

#### ✅ 統一事件處理器
```typescript
interface ChartEvents<T = unknown> {
  // 資料事件 - 使用泛型提供彈性
  onDataClick?: (data: T, event: MouseEvent) => void;
  onDataHover?: (data: T | null, event: MouseEvent) => void;
  
  // DOM 事件 - 明確事件類型
  onChartClick?: (event: MouseEvent) => void;
  onChartMouseMove?: (event: MouseEvent) => void;
  
  // 圖表特定事件
  onZoom?: (domain: [unknown, unknown]) => void;
  onBrush?: (selection: [number, number] | null) => void;
}
```

### 4. 資料處理型別

#### ✅ 彈性資料結構
```typescript
// 基礎資料介面 - 最小化必要欄位
interface BaseChartData {
  [key: string]: unknown;
}

// 處理後資料 - 明確型別
interface ProcessedDataPoint {
  x: number | Date;
  y: number;
  category?: string;
  originalData: unknown; // 保留原始資料參考
}

// 資料處理器
class DataProcessor<T extends BaseChartData> {
  process(data: T[]): ProcessedDataPoint[] {
    return data.map(d => this.processPoint(d));
  }

  private processPoint(d: T): ProcessedDataPoint {
    // 型別安全的資料轉換
    return {
      x: this.extractX(d),
      y: this.extractY(d),
      originalData: d
    };
  }
}
```

## 🛠 實作指引

### 1. 新組件開發檢查清單

```typescript
// ✅ 新組件模板
export interface MyChartProps extends BaseChartProps {
  // 1. 使用 unknown 而非 any
  dataAccessor?: (d: unknown) => unknown;
  
  // 2. 明確的回傳型別
  formatter?: (value: unknown) => string;
  
  // 3. 可選欄位使用 ?
  customConfig?: ChartConfig;
  
  // 4. 避免索引簽名
  // ❌ [key: string]: any;
}

export class MyChartCore extends BaseChartCore<unknown> {
  // 5. 私有成員明確型別
  private processedData: ProcessedDataPoint[] = [];
  
  // 6. 方法明確回傳型別
  protected processData(): ProcessedDataPoint[] {
    // implementation
    return this.processedData;
  }
  
  // 7. 型別守衛輔助方法
  private isValidData(d: unknown): d is ValidDataType {
    return typeof d === 'object' && d !== null && 'value' in d;
  }
}
```

### 2. 現有程式碼改善策略

#### 階段 1: 介面層級 (高優先)
```typescript
// Before
interface Props {
  onClick?: (d: any) => void;
}

// After
interface Props {
  onClick?: (d: unknown) => void;
}
```

#### 階段 2: 公開方法 (中優先)
```typescript
// Before
public getData(): any {
  return this.data;
}

// After
public getData(): ProcessedDataPoint[] {
  return [...this.processedData];
}
```

#### 階段 3: 內部實現 (低優先)
```typescript
// 可以保留部分 any 在複雜的內部實現
private complexD3Operation(): void {
  // 當 D3 型別過於複雜時，可以使用 any
  const selection = d3.select(this.element) as any;
  // 內部操作...
}
```

## 🚫 反模式與陷阱

### 1. 過度型別化
```typescript
// ❌ 過度複雜 - 難以理解和維護
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// ✅ 簡單實用
interface ChartConfig {
  width?: number;
  height?: number;
  margin?: Margin;
}
```

### 2. 型別斷言濫用
```typescript
// ❌ 危險的型別斷言
const value = (data as any).value as number;

// ✅ 安全的型別檢查
const getValue = (data: unknown): number | null => {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    const val = (data as { value: unknown }).value;
    return typeof val === 'number' ? val : null;
  }
  return null;
};
```

### 3. 忽視 D3 型別
```typescript
// ❌ 使用 any 繞過 D3 型別
const scale: any = d3.scaleLinear();

// ✅ 使用正確的 D3 型別
const scale: d3.ScaleLinear<number, number> = d3.scaleLinear();
```

## 📊 型別安全等級

### Level 1: 基礎 (必須)
- 無 `any` 在公開 API
- 明確的函數回傳型別
- 基本的型別守衛

### Level 2: 標準 (推薦)
- 統一的型別模式
- D3 型別整合
- 錯誤處理型別化

### Level 3: 進階 (選擇性)
- 完整的泛型支援
- 條件型別運用
- 型別推斷優化

## 🔧 工具與設定

### TypeScript 配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint 規則
```javascript
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/no-unused-vars": "error"
}
```

## 📚 參考資源

- [TypeScript 官方文檔](https://www.typescriptlang.org/docs/)
- [D3.js TypeScript 定義](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 🎓 範例程式碼

完整的型別安全圖表組件範例可參考：
- `/registry/components/basic/bar-chart/` - 基礎型別安全實現
- `/registry/components/core/base-chart/` - 核心架構型別定義
- `/registry/components/primitives/axis/` - D3 型別整合範例

---

**最後更新：** 2025-09-05
**版本：** v1.0
**維護者：** D3 Components Team