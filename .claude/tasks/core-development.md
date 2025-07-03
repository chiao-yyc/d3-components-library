# 核心開發任務流程

## 任務概述
實作 D3 Components 的核心組件和基礎功能，建立可運作的組件庫基礎。

## 主要目標
1. 完善 CLI 工具的核心命令
2. 建立第一個完整的圖表組件 (BarChart)
3. 實作資料處理和偵測系統
4. 建立組件開發的標準流程

## 執行階段

### Phase 1: CLI 工具完善 (優先級: 高)

#### 任務 1.1: 完善 Registry 系統
- **目標**: 實作完整的本地 Registry 支援
- **檔案**: `cli/src/utils/registry.ts`
- **需求**:
  - 支援本地 Registry 路徑 (`registry/` 目錄)
  - 實作 `fetchComponentConfig()` 從本地檔案讀取
  - 實作 `downloadComponentFiles()` 複製本地檔案
  - 錯誤處理和驗證

```typescript
// 實作重點
export async function fetchComponentConfig(name: string): Promise<ComponentConfig | null> {
  // 1. 檢查本地 registry/index.json
  // 2. 讀取 registry/components/{name}/config.json
  // 3. 驗證配置格式
  // 4. 回傳組件配置或 null
}

export async function downloadComponentFiles(
  componentName: string,
  variant: string,
  targetDir: string
): Promise<string[]> {
  // 1. 從 registry/components/{name}/ 讀取檔案清單
  // 2. 複製檔案到目標目錄
  // 3. 處理模板變數替換
  // 4. 回傳已複製的檔案路徑清單
}
```

#### 任務 1.2: 完善 list 命令
- **目標**: 實作組件列表和搜尋功能
- **檔案**: `cli/src/commands/list.ts`
- **需求**:
  - 讀取本地 Registry 索引
  - 顯示組件名稱、描述、標籤
  - 支援標籤過濾 (`--filter`)
  - 美化輸出格式

```typescript
export async function listCommand(options: ListOptions) {
  // 1. 讀取 registry/index.json
  // 2. 套用過濾條件
  // 3. 格式化輸出 (表格形式)
  // 4. 顯示統計資訊
}
```

#### 任務 1.3: 完善 init 命令
- **目標**: 初始化專案設定
- **檔案**: `cli/src/commands/init.ts`
- **需求**:
  - 建立 `d3-components.json` 配置檔
  - 檢查並安裝基礎依賴
  - 建立目錄結構
  - 提供專案模板選擇

```typescript
export async function initCommand(options: InitOptions) {
  // 1. 檢查專案環境
  // 2. 互動式配置選擇
  // 3. 建立配置檔案和目錄
  // 4. 安裝依賴套件
  // 5. 顯示後續步驟指引
}
```

### Phase 2: 第一個組件開發 (優先級: 高)

#### 任務 2.1: BarChart 組件實作
- **目標**: 建立完整的 BarChart 組件作為範例
- **檔案**: `registry/components/bar-chart/`
- **需求**:
  - React + TypeScript 實作
  - 完整的 D3.js 整合
  - 響應式設計
  - 互動功能 (hover, click)
  - CSS 變數系統

```typescript
// registry/components/bar-chart/bar-chart.tsx
export interface BarChartProps {
  data: any[]
  xKey?: string
  yKey?: string
  width?: number
  height?: number
  margin?: Margin
  className?: string
  colors?: string[]
  animate?: boolean
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

export function BarChart(props: BarChartProps) {
  // 1. 資料處理和驗證
  // 2. 比例尺計算
  // 3. D3 渲染邏輯
  // 4. 事件處理
  // 5. 響應式更新
}
```

#### 任務 2.2: BarChart 配置和樣式
- **目標**: 完善組件的配置和樣式系統
- **檔案**: 
  - `registry/components/bar-chart/config.json`
  - `registry/components/bar-chart/bar-chart.css`
  - `registry/components/bar-chart/types.ts`

```json
// config.json
{
  "name": "bar-chart",
  "description": "可客製化的長條圖組件",
  "version": "1.0.0",
  "dependencies": ["react", "d3", "@types/d3"],
  "files": [
    { "name": "bar-chart.tsx", "type": "component" },
    { "name": "bar-chart.css", "type": "style" },
    { "name": "types.ts", "type": "type" },
    { "name": "index.ts", "type": "export" }
  ],
  "variants": ["default", "animated", "interactive"],
  "tags": ["chart", "bar", "visualization"],
  "example": "import { BarChart } from './bar-chart'\n\n<BarChart data={data} xKey=\"category\" yKey=\"value\" />"
}
```

#### 任務 2.3: 組件測試
- **目標**: 建立完整的測試套件
- **檔案**: `registry/components/bar-chart/bar-chart.test.tsx`
- **需求**:
  - 渲染測試
  - 資料處理測試
  - 互動測試
  - 響應式測試

### Phase 3: 資料處理系統 (優先級: 中)

#### 任務 3.1: 資料偵測器
- **目標**: 實作智慧資料型別偵測
- **檔案**: `registry/utils/data-detector.ts`
- **需求**:
  - 偵測資料型別 (number, string, date, boolean)
  - 建議欄位映射
  - 處理缺失值
  - 資料清理

```typescript
export function detectDataTypes(data: any[]): DataTypeMap {
  // 1. 分析每個欄位的值
  // 2. 推斷資料型別
  // 3. 計算信心分數
  // 4. 回傳型別映射
}

export function suggestMapping(data: any[]): SuggestedMapping[] {
  // 1. 偵測可能的 X/Y 軸欄位
  // 2. 分析資料分布
  // 3. 建議適合的圖表類型
  // 4. 回傳建議清單
}
```

#### 任務 3.2: 資料適配器
- **目標**: 實作基礎資料適配器
- **檔案**: `registry/utils/adapters/`
- **需求**:
  - CSV 適配器
  - JSON 適配器
  - 時間序列適配器
  - 統一的適配器介面

```typescript
export interface DataAdapter<T = any> {
  transform(data: T[], config: MappingConfig): ChartDataPoint[]
  validate(data: T[]): ValidationResult
  suggest(data: T[]): SuggestedMapping[]
}

export const csvAdapter: DataAdapter = {
  transform: (data, config) => {
    // CSV 特定的轉換邏輯
  },
  validate: (data) => {
    // CSV 資料驗證
  },
  suggest: (data) => {
    // CSV 映射建議
  }
}
```

### Phase 4: Registry 基礎建設 (優先級: 中)

#### 任務 4.1: Registry 索引系統
- **目標**: 建立組件索引和搜尋系統
- **檔案**: `registry/index.json`, `scripts/update-registry.js`
- **需求**:
  - 自動生成組件索引
  - 支援標籤分類
  - 版本管理
  - 依賴分析

```json
// registry/index.json
{
  "$schema": "./schema.json",
  "version": "1.0.0",
  "components": [
    {
      "name": "bar-chart",
      "description": "可客製化的長條圖組件",
      "tags": ["chart", "bar"],
      "variants": ["default", "animated"],
      "dependencies": ["react", "d3"],
      "lastUpdated": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### 任務 4.2: Schema 驗證
- **目標**: 建立組件配置的驗證機制
- **檔案**: `registry/schema.json`, `scripts/validate-registry.js`
- **需求**:
  - JSON Schema 定義
  - 自動驗證腳本
  - CI/CD 整合
  - 錯誤報告

### Phase 5: 開發工具和流程 (優先級: 低)

#### 任務 5.1: 開發腳本
- **目標**: 建立開發輔助腳本
- **檔案**: `scripts/`
- **需求**:
  - 組件生成器 (`create-component.js`)
  - Registry 驗證器 (`validate-registry.js`)
  - 建構腳本 (`build.js`)
  - 測試腳本 (`test.js`)

#### 任務 5.2: CI/CD 設定
- **目標**: 建立自動化流程
- **檔案**: `.github/workflows/`
- **需求**:
  - 自動測試
  - 程式碼品質檢查
  - CLI 工具發布
  - Registry 驗證

## 執行檢查清單

### Phase 1 完成標準
- [ ] CLI add 命令可以成功添加 bar-chart 組件
- [ ] CLI list 命令可以顯示可用組件
- [ ] CLI init 命令可以初始化專案
- [ ] 所有 CLI 命令都有適當的錯誤處理
- [ ] CLI 工具通過所有單元測試

### Phase 2 完成標準
- [ ] BarChart 組件可以正確渲染資料
- [ ] 組件支援基本的互動功能
- [ ] 組件響應容器大小變化
- [ ] 組件樣式可以透過 CSS 變數客製化
- [ ] 組件通過所有測試案例

### Phase 3 完成標準
- [ ] 資料偵測器可以正確識別資料型別
- [ ] 資料偵測器可以建議合適的映射
- [ ] CSV 適配器可以處理常見的 CSV 格式
- [ ] 資料處理系統有完整的錯誤處理

### Phase 4 完成標準
- [ ] Registry 索引正確反映所有可用組件
- [ ] Schema 驗證可以捕獲配置錯誤
- [ ] Registry 結構通過所有驗證

### Phase 5 完成標準
- [ ] 所有開發腳本正常運作
- [ ] CI/CD 流程可以自動測試和發布
- [ ] 程式碼品質檢查通過

## 成功指標

### 功能指標
- CLI 工具可以在 < 3 秒內添加組件
- BarChart 可以處理 1000+ 個資料點
- 資料偵測準確率 > 90%
- 組件載入時間 < 100ms

### 品質指標
- 測試覆蓋率 > 80%
- ESLint 0 錯誤、0 警告
- TypeScript 嚴格模式通過
- 所有 API 都有文件

### 使用者體驗指標
- 安裝後可立即使用
- 錯誤訊息清晰易懂
- 組件易於客製化
- 文件範例可運作

## 注意事項

1. **保持簡單**: 優先實作核心功能，避免過度設計
2. **測試先行**: 每個功能都要有對應的測試
3. **文件同步**: 程式碼變更時同步更新文件
4. **使用者反饋**: 定期收集和整合使用者反饋
5. **效能監控**: 持續監控和優化效能指標

## 下一步

完成核心開發後，專案將進入 **擴展階段**，重點包括：
- 新增更多圖表類型 (LineChart, ScatterPlot)
- 實作複合圖表系統
- 建立視覺化配置器
- 擴展到其他前端框架