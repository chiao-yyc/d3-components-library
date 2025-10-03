# D3 Components 快速參考指南

## 🚀 常用指令

```bash
# 開發
npm run dev              # 啟動開發伺服器
npm run build            # 建構專案
npm run test             # 執行測試
npm run lint             # ESLint 檢查
npm run typecheck        # TypeScript 檢查

# 品質檢查
npm run check:compliance # Demo 頁面合規性檢查
npm run check:full       # 完整合規性檢查

# Git (跳過 hooks)
git commit -m "message" --no-verify
```

## 🎯 型別安全快速修復

### 問題 1: `any` 類型錯誤
```typescript
// ❌ 錯誤
xAccessor?: (d: any) => any;

// ✅ 修復
xAccessor?: (d: unknown) => unknown;
```

### 問題 2: 未使用的 import
```typescript
// ❌ 錯誤
import { render, fireEvent } from '@testing-library/react';
// fireEvent 未使用

// ✅ 修復
import { render } from '@testing-library/react';
```

### 問題 3: React Hook 違規
```typescript
// ❌ 錯誤 - Hook 在條件後
if (!data) return null;
const memoized = useMemo(() => data, [data]);

// ✅ 修復 - Hook 在條件前
const memoized = useMemo(() => data || [], [data]);
if (!data) return null;
```

### 問題 4: D3 類型
```typescript
// ❌ 錯誤
const scale: any = d3.scaleLinear();

// ✅ 修復
const scale: d3.ScaleLinear<number, number> = d3.scaleLinear();
```

## 📁 目錄結構模板

### 新圖表組件
```
components/basic/my-chart/
├── core/
│   ├── my-chart-core.ts    # 純 TS 邏輯
│   └── types.ts             # 型別定義
├── my-chart.tsx             # React 包裝
├── my-chart.test.tsx        # 測試
├── types.ts                 # Props 型別
└── index.ts                 # 導出
```

## 🔧 程式碼片段

### 1. 新組件 Props
```typescript
export interface MyChartProps extends BaseChartProps {
  // 數據存取
  xAccessor?: (d: unknown) => unknown;
  yAccessor?: (d: unknown) => number;
  
  // 事件處理
  onDataClick?: (data: unknown, event: MouseEvent) => void;
  onDataHover?: (data: unknown | null, event: MouseEvent) => void;
  
  // 樣式配置
  colors?: string[];
  animate?: boolean;
  interactive?: boolean;
}
```

### 2. 核心類別模板
```typescript
export class MyChartCore extends BaseChartCore<unknown> {
  private processedData: ProcessedDataPoint[] = [];
  
  public getChartType(): string {
    return 'my-chart';
  }
  
  protected processData(): ProcessedDataPoint[] {
    // 使用 DataProcessor
    const processor = new DataProcessor({
      mapping: this.config.mapping,
      autoDetect: true
    });
    return processor.process(this.config.data).data;
  }
  
  protected renderChart(): void {
    const container = this.createSVGContainer();
    // D3 渲染邏輯
  }
}
```

### 3. React 包裝層
```typescript
const MyChartComponent = createReactChartWrapper(MyChartCore);

export const MyChart = React.forwardRef<MyChartCore, MyChartProps>(
  (props, ref) => {
    return <MyChartComponent ref={ref} {...props} />;
  }
);
```

### 4. 測試模板
```typescript
describe('MyChart', () => {
  it('should render', () => {
    render(<MyChart data={mockData} />);
    expect(screen.getByTestId('my-chart')).toBeInTheDocument();
  });
  
  it('should handle clicks', async () => {
    const handleClick = vi.fn();
    render(<MyChart data={mockData} onDataClick={handleClick} />);
    // 測試邏輯
  });
});
```

## 📊 資料處理模式

### 使用 DataProcessor
```typescript
const processor = new DataProcessor({
  mapping: { 
    x: 'date', 
    y: 'value',
    category: 'type'
  },
  autoDetect: true
});

const result = processor.process(rawData);
if (result.errors.length > 0) {
  console.error('Data processing errors:', result.errors);
}
```

### 手動處理 (簡單案例)
```typescript
const processedData = data.map(d => ({
  x: parseDate(d.date),
  y: Number(d.value),
  originalData: d
}));
```

## 🎨 顏色和樣式

### 使用 ColorScale
```typescript
import { createColorScale } from '@/core/color-scheme';

// 預設調色板
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
const colorScale = createColorScale(colors, 'ordinal');

// 使用
const color = colorScale.getColor(index);
```

### 主題顏色常數
```typescript
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6'
};
```

## 🐛 除錯技巧

### 1. 資料流追蹤
```typescript
console.log('[Chart] Input:', this.config.data);
console.log('[Chart] Processed:', this.processedData);
console.log('[Chart] Scales:', this.scales);
```

### 2. D3 選擇器檢查
```typescript
const selection = d3.select(this.element);
console.log('[Chart] Selection empty?', selection.empty());
console.log('[Chart] Selection size:', selection.size());
```

### 3. 效能監控
```typescript
console.time('[Chart] Render');
this.renderChart();
console.timeEnd('[Chart] Render');
```

## ⚡ 效能優化

### 大數據集處理
```typescript
// 1. 資料取樣
const sampled = data.filter((_, i) => i % 10 === 0);

// 2. 虛擬化渲染
if (data.length > 1000) {
  // 使用 Canvas 或虛擬列表
}

// 3. Debounce 更新
const debouncedUpdate = debounce(() => {
  this.update(newData);
}, 300);
```

## 🔍 ESLint 問題優先級

### 必須修復 (錯誤)
1. React Hook 違規
2. 未使用的變數
3. 公開 API 的 `any` 類型

### 建議修復 (警告)
1. 複雜度過高
2. 魔數
3. 缺少函數回傳型別

### 可忽略
1. 內部實作的 `any`
2. Console.log (開發中)
3. 行數過長 (如 URL)

## 📝 Git Commit 格式

```bash
feat: 新功能
fix: 錯誤修復
docs: 文檔更新
style: 格式調整
refactor: 重構
test: 測試相關
chore: 維護工作
```

## 🔗 相關連結

- [完整開發指南](./DEVELOPMENT_GUIDE.md)
- [型別安全指南](./TYPE_SAFETY_GUIDE.md)
- [品質報告](./QUALITY_REPORT.md)
- [ESLint 策略](./ESLINT_STRATEGY.md)

---
**快速參考卡 v1.0** | 2025-09-05