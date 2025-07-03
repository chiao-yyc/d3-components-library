# 文件系統建置任務

## 任務概述
建立完整的文件系統，包括 API 文件、使用指南、架構文件和範例程式碼，確保專案的可維護性和使用者體驗。

## 主要目標
1. 建立結構化的文件系統
2. 實作自動化 API 文件生成
3. 建立互動式範例和 Demo
4. 實作文件版本管理和同步更新

## 執行階段

### Phase 1: 文件架構建置 (優先級: 高)

#### 任務 1.1: 文件目錄結構
- **目標**: 建立標準化的文件目錄結構
- **位置**: `docs/` 根目錄
- **需求**:

```
docs/
├── README.md                   # 專案主文件
├── guides/                     # 使用指南
│   ├── getting-started.md      # 快速開始
│   ├── installation.md         # 安裝指南
│   ├── basic-usage.md         # 基本使用
│   ├── advanced-usage.md      # 進階使用
│   ├── customization.md       # 客製化指南
│   ├── data-processing.md     # 資料處理指南
│   ├── troubleshooting.md     # 疑難排解
│   └── migration.md           # 遷移指南
├── api/                       # API 文件
│   ├── cli/                   # CLI API
│   │   ├── commands.md        # 命令參考
│   │   ├── options.md         # 選項參考
│   │   └── examples.md        # 使用範例
│   ├── components/            # 組件 API
│   │   ├── bar-chart.md       # BarChart API
│   │   ├── line-chart.md      # LineChart API
│   │   └── common-props.md    # 共用屬性
│   └── utils/                 # 工具函數 API
│       ├── data-detector.md   # 資料偵測 API
│       ├── adapters.md        # 適配器 API
│       └── helpers.md         # 輔助函數 API
├── examples/                  # 範例程式碼
│   ├── basic/                 # 基礎範例
│   ├── advanced/              # 進階範例
│   ├── integration/           # 整合範例
│   └── playground/            # 線上 Playground
├── architecture/              # 架構文件
│   ├── overview.md            # 架構概覽
│   ├── design-decisions.md    # 設計決策
│   ├── data-flow.md          # 資料流程
│   └── extensibility.md      # 可擴展性
├── contributing/              # 貢獻指南
│   ├── development.md         # 開發指南
│   ├── code-style.md         # 程式碼風格
│   ├── testing.md            # 測試指南
│   └── release.md            # 發布流程
└── assets/                   # 文件資源
    ├── images/               # 圖片
    ├── diagrams/             # 圖表
    └── videos/               # 影片
```

#### 任務 1.2: 主要文件撰寫
- **目標**: 撰寫核心使用指南
- **檔案**: `docs/guides/getting-started.md`
- **需求**:

```markdown
# 快速開始

## 什麼是 D3 Components？

D3 Components 是一個基於 Shadcn/ui 理念的 D3.js 組件庫，提供：

- 🎯 **完全透明**：獲得完整的組件原始碼
- 📋 **Copy & Paste**：直接複製到你的專案中
- 🔧 **完全可客製化**：修改任何你需要的部分
- 📊 **智慧資料處理**：自動偵測和建議最佳配置

## 5 分鐘快速體驗

### 1. 初始化專案

如果你已經有 React 專案，可以直接跳到步驟 2。

```bash
# 建立新的 React 專案
npx create-react-app my-charts --template typescript
cd my-charts

# 安裝必要依賴
npm install d3 @types/d3
```

### 2. 添加你的第一個圖表

```bash
# 使用 CLI 工具添加 BarChart 組件
npx d3-components add bar-chart

# 查看可用組件
npx d3-components list
```

### 3. 使用組件

```tsx
// src/App.tsx
import React from 'react'
import { BarChart } from './components/ui/bar-chart'

const data = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 15 },
  { category: 'D', value: 25 }
]

function App() {
  return (
    <div className="App">
      <h1>我的第一個 D3 圖表</h1>
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

export default App
```

### 4. 客製化樣式

複製到你專案中的組件包含 CSS 檔案，你可以直接修改：

```css
/* components/ui/bar-chart/bar-chart.css */
.bar {
  fill: #3b82f6; /* 改變長條顏色 */
  transition: fill 0.2s;
}

.bar:hover {
  fill: #1d4ed8; /* hover 顏色 */
}
```

## 下一步

- 📖 [基本使用指南](./basic-usage.md) - 瞭解更多使用方式
- 🎨 [客製化指南](./customization.md) - 學習如何客製化組件
- 📊 [資料處理指南](./data-processing.md) - 處理複雜資料格式
- 🔧 [進階功能](./advanced-usage.md) - 探索進階功能

## 需要幫助？

- 🐛 [疑難排解](./troubleshooting.md)
- 💬 [GitHub Discussions](https://github.com/d3-components/d3-components/discussions)
- 📚 [API 文件](../api/)
```

#### 任務 1.3: API 文件模板
- **目標**: 建立標準化的 API 文件模板
- **檔案**: `docs/api/components/bar-chart.md`
- **需求**:

```markdown
# BarChart

可客製化的長條圖組件，支援互動和動畫效果。

## 基本使用

```tsx
import { BarChart } from './components/ui/bar-chart'

const data = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 }
]

<BarChart data={data} xKey="category" yKey="value" />
```

## Props

### `data` (必填)

- **型別**: `any[]`
- **描述**: 圖表資料陣列
- **範例**: 
  ```js
  [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 }
  ]
  ```

### `xKey`

- **型別**: `string`
- **預設值**: 自動偵測
- **描述**: X 軸資料欄位名稱
- **範例**: `"category"`

### `yKey`

- **型別**: `string`
- **預設值**: 自動偵測
- **描述**: Y 軸資料欄位名稱
- **範例**: `"value"`

### `width`

- **型別**: `number`
- **預設值**: `800`
- **描述**: 圖表寬度（像素）

### `height`

- **型別**: `number`
- **預設值**: `400`
- **描述**: 圖表高度（像素）

### `margin`

- **型別**: `{ top: number; right: number; bottom: number; left: number }`
- **預設值**: `{ top: 20, right: 30, bottom: 40, left: 40 }`
- **描述**: 圖表邊距

### `className`

- **型別**: `string`
- **預設值**: `undefined`
- **描述**: 自訂 CSS 類名

### `colors`

- **型別**: `string[]`
- **預設值**: `['#3b82f6', '#10b981', '#f59e0b', '#ef4444']`
- **描述**: 顏色配置陣列

### `animate`

- **型別**: `boolean`
- **預設值**: `false`
- **描述**: 是否啟用動畫效果

### `interactive`

- **型別**: `boolean`
- **預設值**: `true`
- **描述**: 是否啟用互動功能

## 事件

### `onDataClick`

- **型別**: `(data: any) => void`
- **描述**: 當點擊長條時觸發
- **參數**: 點擊的資料項目

```tsx
<BarChart 
  data={data}
  onDataClick={(item) => {
    console.log('點擊了:', item)
  }}
/>
```

### `onHover`

- **型別**: `(data: any | null) => void`
- **描述**: 當滑鼠懸停或離開長條時觸發
- **參數**: 懸停的資料項目，離開時為 `null`

## 樣式客製化

### CSS 變數

```css
.bar-chart {
  --bar-color: #3b82f6;
  --bar-hover-color: #1d4ed8;
  --axis-color: #6b7280;
  --text-color: #374151;
}
```

### CSS 類別

- `.bar-chart` - 圖表容器
- `.bar` - 長條元素
- `.x-axis` - X 軸
- `.y-axis` - Y 軸
- `.tooltip` - 提示框

## 範例

### 基本圖表

```tsx
const salesData = [
  { month: '1月', sales: 1200 },
  { month: '2月', sales: 1900 },
  { month: '3月', sales: 3000 },
  { month: '4月', sales: 5000 }
]

<BarChart 
  data={salesData} 
  xKey="month" 
  yKey="sales"
  width={600}
  height={300}
/>
```

### 動畫圖表

```tsx
<BarChart 
  data={data} 
  xKey="category" 
  yKey="value"
  animate={true}
  colors={['#10b981', '#3b82f6', '#f59e0b']}
/>
```

### 互動圖表

```tsx
const [selectedData, setSelectedData] = useState(null)

<BarChart 
  data={data}
  xKey="category"
  yKey="value"
  onDataClick={setSelectedData}
  onHover={(item) => {
    // 顯示詳細資訊
  }}
/>
```

## 資料要求

### 支援的資料格式

```js
// 物件陣列（推薦）
[
  { category: 'A', value: 10 },
  { category: 'B', value: 20 }
]

// 巢狀物件
[
  { name: 'Product A', metrics: { sales: 100, profit: 20 } },
  { name: 'Product B', metrics: { sales: 150, profit: 30 } }
]
```

### 資料型別

- **X 軸**: 字串、數字、日期
- **Y 軸**: 數字
- **缺失值**: 自動過濾 `null`、`undefined`、`NaN`

## 效能考量

- **建議最大資料點**: 1000 個
- **大資料集**: 考慮使用資料取樣或虛擬化
- **記憶體使用**: 每 100 個資料點約 ~1MB

## 疑難排解

### 常見問題

**Q: 圖表沒有顯示？**
A: 檢查資料格式和 `xKey`、`yKey` 是否正確

**Q: 圖表顯示不完整？**
A: 檢查容器大小和 `margin` 設定

**Q: 動畫不流暢？**
A: 資料量太大時關閉動畫，或減少資料點數量

### 除錯模式

```tsx
// 啟用除錯模式查看內部狀態
<BarChart 
  data={data}
  debug={true}  // 在開發環境下顯示除錯資訊
/>
```
```

### Phase 2: 自動化文件生成 (優先級: 中)

#### 任務 2.1: TypeScript 文件提取
- **目標**: 從 TypeScript 程式碼自動生成 API 文件
- **工具**: TypeDoc + 自訂腳本
- **需求**:

```typescript
// scripts/generate-docs.ts
import { Application } from 'typedoc'
import fs from 'fs-extra'
import path from 'path'

interface ComponentDocumentation {
  name: string
  description: string
  props: PropDocumentation[]
  methods: MethodDocumentation[]
  examples: Example[]
}

interface PropDocumentation {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export async function generateComponentDocs() {
  const app = new Application()
  
  app.options.addReader(new TypeDoc.TSConfigReader())
  app.bootstrap({
    entryPoints: ['registry/components/*/index.ts'],
    plugin: ['typedoc-plugin-markdown'],
    out: 'docs/api/generated'
  })
  
  const project = app.convert()
  
  if (project) {
    // 生成 JSON 格式的文件
    await app.generateJson(project, 'docs/api/typedoc.json')
    
    // 轉換為我們的格式
    const components = await extractComponentDocs(project)
    
    // 生成 Markdown 文件
    for (const component of components) {
      await generateMarkdownDoc(component)
    }
  }
}

async function extractComponentDocs(project: any): Promise<ComponentDocumentation[]> {
  const components: ComponentDocumentation[] = []
  
  // 遍歷專案中的所有模組
  for (const child of project.children || []) {
    if (child.kindString === 'Module') {
      const componentDoc = await parseComponent(child)
      if (componentDoc) {
        components.push(componentDoc)
      }
    }
  }
  
  return components
}

async function parseComponent(module: any): Promise<ComponentDocumentation | null> {
  // 尋找 React 組件函數
  const componentFunction = module.children?.find((child: any) => 
    child.kindString === 'Function' && 
    child.name.endsWith('Chart')
  )
  
  if (!componentFunction) return null
  
  // 解析 Props 介面
  const propsInterface = module.children?.find((child: any) =>
    child.kindString === 'Interface' &&
    child.name.endsWith('Props')
  )
  
  const props = propsInterface?.children?.map((prop: any) => ({
    name: prop.name,
    type: prop.type?.name || 'unknown',
    required: !prop.flags?.isOptional,
    default: prop.defaultValue,
    description: prop.comment?.shortText || ''
  })) || []
  
  return {
    name: componentFunction.name,
    description: componentFunction.comment?.shortText || '',
    props,
    methods: [], // TODO: 解析方法
    examples: [] // TODO: 從測試中提取範例
  }
}

async function generateMarkdownDoc(component: ComponentDocumentation) {
  const template = `# ${component.name}

${component.description}

## Props

${component.props.map(prop => `
### \`${prop.name}\`${prop.required ? ' (必填)' : ''}

- **型別**: \`${prop.type}\`
${prop.default ? `- **預設值**: \`${prop.default}\`` : ''}
- **描述**: ${prop.description}
`).join('\n')}

## 範例

\`\`\`tsx
import { ${component.name} } from './components/ui/${component.name.toLowerCase()}'

// 基本使用範例
<${component.name} />
\`\`\`
`
  
  const outputPath = `docs/api/components/${component.name.toLowerCase()}.md`
  await fs.ensureDir(path.dirname(outputPath))
  await fs.writeFile(outputPath, template)
}
```

#### 任務 2.2: CLI 文件生成
- **目標**: 從 CLI 程式碼自動生成命令文件
- **位置**: `scripts/generate-cli-docs.ts`
- **需求**:

```typescript
// scripts/generate-cli-docs.ts
import { Command } from 'commander'
import fs from 'fs-extra'

export async function generateCLIDocs() {
  // 載入 CLI 程式
  const program = new Command()
  
  // 重新建立命令結構（不執行）
  program
    .name('d3-components')
    .description('D3 Components CLI - 透明化的 D3 組件庫')
    .version('1.0.0')
  
  program
    .command('add <component>')
    .description('添加組件到專案中')
    .option('-v, --variant <variant>', '選擇組件變體')
    .option('-d, --dir <directory>', '目標目錄', './src/components/ui')
    .option('--dry-run', '預覽變更但不實際執行')
  
  program
    .command('list')
    .description('列出所有可用組件')
    .option('-f, --filter <filter>', '過濾組件')
  
  program
    .command('init')
    .description('初始化 D3 Components 專案')
    .option('-t, --template <template>', '專案模板', 'react')
  
  // 生成文件
  const helpText = program.helpInformation()
  const markdown = convertHelpToMarkdown(helpText, program)
  
  await fs.writeFile('docs/api/cli/commands.md', markdown)
}

function convertHelpToMarkdown(helpText: string, program: Command): string {
  let markdown = `# CLI 命令參考

D3 Components CLI 提供了一系列命令來管理組件。

## 安裝

\`\`\`bash
# 全域安裝
npm install -g d3-components-cli

# 或使用 npx（推薦）
npx d3-components <command>
\`\`\`

## 命令列表

`
  
  // 遍歷所有命令
  program.commands.forEach(command => {
    markdown += `
### \`${command.name()}\`

${command.description()}

**語法**:
\`\`\`bash
d3-components ${command.usage()}
\`\`\`

`
    
    // 添加選項
    if (command.options.length > 0) {
      markdown += `**選項**:\n\n`
      command.options.forEach(option => {
        markdown += `- \`${option.flags}\` - ${option.description}\n`
      })
      markdown += '\n'
    }
    
    // 添加範例
    markdown += generateCommandExamples(command.name())
  })
  
  return markdown
}

function generateCommandExamples(commandName: string): string {
  const examples: Record<string, string[]> = {
    'add': [
      '# 添加基本長條圖',
      'npx d3-components add bar-chart',
      '',
      '# 添加動畫版本到指定目錄',
      'npx d3-components add bar-chart --variant animated --dir ./charts',
      '',
      '# 預覽變更（不實際複製檔案）',
      'npx d3-components add bar-chart --dry-run'
    ],
    'list': [
      '# 列出所有組件',
      'npx d3-components list',
      '',
      '# 只顯示圖表組件',
      'npx d3-components list --filter chart'
    ],
    'init': [
      '# 初始化專案（互動模式）',
      'npx d3-components init',
      '',
      '# 使用 React 模板',
      'npx d3-components init --template react'
    ]
  }
  
  const commandExamples = examples[commandName]
  if (!commandExamples) return ''
  
  return `**範例**:
\`\`\`bash
${commandExamples.join('\n')}
\`\`\`

`
}
```

### Phase 3: 互動式範例系統 (優先級: 中)

#### 任務 3.1: 程式碼範例管理
- **目標**: 建立可執行的程式碼範例系統
- **位置**: `docs/examples/`
- **需求**:

```typescript
// docs/examples/basic/bar-chart-basic.tsx
import React from 'react'
import { BarChart } from '../../../registry/components/bar-chart'

/**
 * 基本長條圖範例
 * 
 * 展示最簡單的使用方式：
 * - 基本資料格式
 * - 預設配置
 * - 簡單的 X/Y 軸映射
 */
export function BarChartBasicExample() {
  const data = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 15 },
    { category: 'D', value: 25 },
    { category: 'E', value: 18 }
  ]
  
  return (
    <div className="example-container">
      <h3>基本長條圖</h3>
      <p>最簡單的長條圖實現，使用預設配置。</p>
      
      <BarChart 
        data={data} 
        xKey="category" 
        yKey="value"
        width={500}
        height={300}
      />
      
      <details>
        <summary>查看資料格式</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  )
}

// 範例資訊（用於文件生成）
export const exampleInfo = {
  title: '基本長條圖',
  description: '展示最簡單的長條圖使用方式',
  tags: ['basic', 'bar-chart'],
  complexity: 'beginner',
  features: ['基本資料繫結', 'X/Y 軸映射', '預設樣式']
}
```

```typescript
// docs/examples/advanced/bar-chart-interactive.tsx
import React, { useState } from 'react'
import { BarChart } from '../../../registry/components/bar-chart'

/**
 * 互動式長條圖範例
 * 
 * 展示進階功能：
 * - 點擊事件處理
 * - hover 互動
 * - 動態資料更新
 * - 客製化樣式
 */
export function BarChartInteractiveExample() {
  const [data, setData] = useState([
    { product: 'iPhone', sales: 120, profit: 20 },
    { product: 'MacBook', sales: 80, profit: 35 },
    { product: 'iPad', sales: 95, profit: 15 },
    { product: 'Apple Watch', sales: 150, profit: 25 }
  ])
  
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [metric, setMetric] = useState<'sales' | 'profit'>('sales')
  
  return (
    <div className="example-container">
      <h3>互動式長條圖</h3>
      
      <div className="controls">
        <label>
          顯示指標：
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value as 'sales' | 'profit')}
          >
            <option value="sales">銷售額</option>
            <option value="profit">利潤</option>
          </select>
        </label>
      </div>
      
      <BarChart 
        data={data}
        xKey="product"
        yKey={metric}
        width={600}
        height={400}
        animate={true}
        onDataClick={(item) => {
          setSelectedItem(item)
          console.log('點擊了:', item)
        }}
        onHover={(item) => {
          // 可以在這裡顯示 tooltip
        }}
        colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
      />
      
      {selectedItem && (
        <div className="selected-info">
          <h4>選擇的項目：</h4>
          <p>產品: {selectedItem.product}</p>
          <p>銷售額: ${selectedItem.sales}K</p>
          <p>利潤: ${selectedItem.profit}%</p>
        </div>
      )}
      
      <div className="actions">
        <button onClick={() => {
          // 隨機更新資料
          setData(prev => prev.map(item => ({
            ...item,
            sales: Math.floor(Math.random() * 200) + 50,
            profit: Math.floor(Math.random() * 40) + 10
          })))
        }}>
          隨機更新資料
        </button>
      </div>
    </div>
  )
}

export const exampleInfo = {
  title: '互動式長條圖',
  description: '展示點擊、hover 和動態資料更新功能',
  tags: ['advanced', 'interactive', 'bar-chart'],
  complexity: 'intermediate',
  features: ['點擊事件', 'Hover 互動', '動態資料', '動畫效果', '客製化顏色']
}
```

#### 任務 3.2: 範例索引生成
- **目標**: 自動生成範例索引和導覽
- **位置**: `scripts/generate-examples.ts`
- **需求**:

```typescript
// scripts/generate-examples.ts
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

interface ExampleInfo {
  title: string
  description: string
  tags: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  features: string[]
  filePath: string
  componentName: string
}

export async function generateExamplesIndex() {
  const examplesDir = 'docs/examples'
  const outputPath = 'docs/examples/README.md'
  
  // 掃描所有範例檔案
  const exampleFiles = await glob('**/*.tsx', { cwd: examplesDir })
  const examples: ExampleInfo[] = []
  
  for (const file of exampleFiles) {
    const fullPath = path.join(examplesDir, file)
    const content = await fs.readFile(fullPath, 'utf-8')
    
    // 提取 exampleInfo
    const infoMatch = content.match(/export const exampleInfo = ({[\s\S]*?})/)
    if (infoMatch) {
      try {
        // 簡單的解析（實際上應該使用 AST）
        const infoStr = infoMatch[1]
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":')
          .replace(/,(\s*})/g, '$1')
        
        const info = JSON.parse(infoStr)
        examples.push({
          ...info,
          filePath: file,
          componentName: extractComponentName(file)
        })
      } catch (error) {
        console.warn(`無法解析範例資訊: ${file}`)
      }
    }
  }
  
  // 按複雜度和組件分組
  const groupedExamples = groupExamples(examples)
  
  // 生成 Markdown
  const markdown = generateExamplesMarkdown(groupedExamples)
  
  await fs.writeFile(outputPath, markdown)
  
  // 同時生成 JSON 索引供其他工具使用
  await fs.writeJSON(
    path.join(examplesDir, 'index.json'), 
    groupedExamples, 
    { spaces: 2 }
  )
}

function extractComponentName(filePath: string): string {
  const basename = path.basename(filePath, '.tsx')
  const match = basename.match(/^(\w+)-/)
  return match ? match[1] : 'unknown'
}

function groupExamples(examples: ExampleInfo[]) {
  const groups: Record<string, Record<string, ExampleInfo[]>> = {
    basic: {},
    advanced: {},
    integration: {}
  }
  
  examples.forEach(example => {
    const category = example.tags.includes('basic') ? 'basic' :
                    example.tags.includes('advanced') ? 'advanced' : 
                    'integration'
    
    if (!groups[category][example.componentName]) {
      groups[category][example.componentName] = []
    }
    
    groups[category][example.componentName].push(example)
  })
  
  return groups
}

function generateExamplesMarkdown(groupedExamples: any): string {
  let markdown = `# 範例程式碼

這裡收集了 D3 Components 的各種使用範例，從基礎到進階，幫助你快速上手。

## 如何使用範例

1. 找到你需要的範例
2. 複製程式碼到你的專案
3. 根據需要調整資料和配置
4. 享受美麗的圖表！

`
  
  Object.entries(groupedExamples).forEach(([category, components]) => {
    const categoryTitle = {
      basic: '🌱 基礎範例',
      advanced: '🚀 進階範例', 
      integration: '🔗 整合範例'
    }[category] || category
    
    markdown += `## ${categoryTitle}\n\n`
    
    Object.entries(components).forEach(([componentName, examples]) => {
      markdown += `### ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} 組件\n\n`
      
      ;(examples as ExampleInfo[]).forEach(example => {
        const complexityIcon = {
          beginner: '🟢',
          intermediate: '🟡',
          advanced: '🔴'
        }[example.complexity]
        
        markdown += `#### ${complexityIcon} [${example.title}](./${example.filePath})

${example.description}

**特色功能**: ${example.features.join(', ')}
**標籤**: ${example.tags.map(tag => `\`${tag}\``).join(', ')}

`
      })
    })
  })
  
  return markdown
}
```

### Phase 4: 文件版本管理 (優先級: 低)

#### 任務 4.1: 文件同步檢查
- **目標**: 確保文件與程式碼同步
- **位置**: `scripts/check-docs-sync.ts`
- **需求**:

```typescript
// scripts/check-docs-sync.ts
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

interface SyncIssue {
  type: 'missing-doc' | 'outdated-doc' | 'orphaned-doc'
  file: string
  message: string
}

export async function checkDocsSync(): Promise<SyncIssue[]> {
  const issues: SyncIssue[] = []
  
  // 檢查組件文件
  await checkComponentDocs(issues)
  
  // 檢查 API 文件
  await checkAPIDocs(issues)
  
  // 檢查範例程式碼
  await checkExamples(issues)
  
  return issues
}

async function checkComponentDocs(issues: SyncIssue[]) {
  // 獲取所有組件
  const componentDirs = await glob('registry/components/*/', { onlyDirectories: true })
  
  for (const dir of componentDirs) {
    const componentName = path.basename(dir)
    const docPath = `docs/api/components/${componentName}.md`
    const configPath = path.join(dir, 'config.json')
    
    // 檢查文件是否存在
    if (!await fs.pathExists(docPath)) {
      issues.push({
        type: 'missing-doc',
        file: docPath,
        message: `組件 ${componentName} 缺少 API 文件`
      })
      continue
    }
    
    // 檢查文件是否過時
    const docStat = await fs.stat(docPath)
    const configStat = await fs.stat(configPath)
    
    if (configStat.mtime > docStat.mtime) {
      issues.push({
        type: 'outdated-doc',
        file: docPath,
        message: `組件 ${componentName} 的文件可能過時（組件配置比文件新）`
      })
    }
    
    // 檢查文件內容一致性
    await checkDocContentSync(componentName, docPath, configPath, issues)
  }
}

async function checkDocContentSync(
  componentName: string, 
  docPath: string, 
  configPath: string, 
  issues: SyncIssue[]
) {
  const docContent = await fs.readFile(docPath, 'utf-8')
  const config = await fs.readJSON(configPath)
  
  // 檢查版本號
  const versionMatch = docContent.match(/版本[：:]\s*`?([^`\n]+)`?/)
  if (versionMatch && versionMatch[1] !== config.version) {
    issues.push({
      type: 'outdated-doc',
      file: docPath,
      message: `組件 ${componentName} 文件版本 (${versionMatch[1]}) 與配置版本 (${config.version}) 不符`
    })
  }
  
  // 檢查 Props 文件
  if (config.props) {
    const missingProps = Object.keys(config.props).filter(propName => {
      return !docContent.includes(`### \`${propName}\``)
    })
    
    if (missingProps.length > 0) {
      issues.push({
        type: 'outdated-doc',
        file: docPath,
        message: `組件 ${componentName} 文件缺少 Props: ${missingProps.join(', ')}`
      })
    }
  }
}

async function checkAPIDocs(issues: SyncIssue[]) {
  // 檢查 CLI 文件
  const cliCommands = await extractCLICommands()
  const cliDocPath = 'docs/api/cli/commands.md'
  
  if (await fs.pathExists(cliDocPath)) {
    const docContent = await fs.readFile(cliDocPath, 'utf-8')
    
    for (const command of cliCommands) {
      if (!docContent.includes(`### \`${command}\``)) {
        issues.push({
          type: 'outdated-doc',
          file: cliDocPath,
          message: `CLI 文件缺少命令: ${command}`
        })
      }
    }
  } else {
    issues.push({
      type: 'missing-doc',
      file: cliDocPath,
      message: 'CLI 命令文件不存在'
    })
  }
}

async function extractCLICommands(): Promise<string[]> {
  // 從 CLI 程式碼中提取命令清單
  const indexPath = 'cli/src/index.ts'
  if (!await fs.pathExists(indexPath)) return []
  
  const content = await fs.readFile(indexPath, 'utf-8')
  const commandMatches = content.matchAll(/\.command\(['"](\w+)/g)
  
  return Array.from(commandMatches, match => match[1])
}

// 主要檢查函數
export async function runDocsSyncCheck() {
  console.log('🔍 檢查文件同步狀態...')
  
  const issues = await checkDocsSync()
  
  if (issues.length === 0) {
    console.log('✅ 所有文件都是最新的！')
    return true
  }
  
  console.log(`❌ 發現 ${issues.length} 個問題：\n`)
  
  const groupedIssues = issues.reduce((groups, issue) => {
    if (!groups[issue.type]) groups[issue.type] = []
    groups[issue.type].push(issue)
    return groups
  }, {} as Record<string, SyncIssue[]>)
  
  Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
    const typeTitle = {
      'missing-doc': '📝 缺少文件',
      'outdated-doc': '⏰ 文件過時',
      'orphaned-doc': '🗑️ 多餘文件'
    }[type] || type
    
    console.log(`${typeTitle}:`)
    typeIssues.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.message}`)
    })
    console.log()
  })
  
  return false
}
```

#### 任務 4.2: 自動化文件更新
- **目標**: 建立自動更新文件的工作流程
- **位置**: `scripts/update-docs.ts`
- **需求**:

```typescript
// scripts/update-docs.ts
import { generateComponentDocs } from './generate-docs'
import { generateCLIDocs } from './generate-cli-docs'
import { generateExamplesIndex } from './generate-examples'
import { runDocsSyncCheck } from './check-docs-sync'

export async function updateAllDocs() {
  console.log('📚 開始更新文件...\n')
  
  try {
    // 1. 生成組件 API 文件
    console.log('1️⃣ 生成組件 API 文件...')
    await generateComponentDocs()
    console.log('✅ 組件文件生成完成\n')
    
    // 2. 生成 CLI 文件
    console.log('2️⃣ 生成 CLI 文件...')
    await generateCLIDocs()
    console.log('✅ CLI 文件生成完成\n')
    
    // 3. 生成範例索引
    console.log('3️⃣ 生成範例索引...')
    await generateExamplesIndex()
    console.log('✅ 範例索引生成完成\n')
    
    // 4. 檢查同步狀態
    console.log('4️⃣ 檢查文件同步狀態...')
    const isSync = await runDocsSyncCheck()
    
    if (isSync) {
      console.log('🎉 文件更新完成！所有文件都是最新的。')
    } else {
      console.log('⚠️ 文件更新完成，但仍有一些同步問題需要手動處理。')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ 文件更新失敗:', error)
    process.exit(1)
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  updateAllDocs()
}
```

## 執行檢查清單

### Phase 1 完成標準
- [ ] 文件目錄結構建立完成
- [ ] 核心使用指南撰寫完成
- [ ] API 文件模板建立
- [ ] 文件格式統一標準化

### Phase 2 完成標準
- [ ] TypeScript 自動文件提取可運作
- [ ] CLI 文件自動生成可運作
- [ ] 生成的文件格式正確
- [ ] 文件內容與程式碼一致

### Phase 3 完成標準
- [ ] 範例程式碼可正常執行
- [ ] 範例涵蓋主要使用情境
- [ ] 自動索引生成可運作
- [ ] 範例分類和導覽清晰

### Phase 4 完成標準
- [ ] 文件同步檢查可運作
- [ ] 自動更新流程完整
- [ ] CI/CD 整合文件檢查
- [ ] 版本控制和變更追蹤

## 成功指標

### 完整性指標
- **API 覆蓋率**: 100% (所有公開 API 都有文件)
- **範例覆蓋率**: > 80% (主要功能都有範例)
- **同步準確率**: > 95% (文件與程式碼同步)

### 品質指標
- **文件可讀性**: 通過可讀性測試
- **範例可執行率**: 100% (所有範例都能執行)
- **錯誤連結率**: < 1% (內部連結都有效)

### 使用者體驗指標
- **搜尋效果**: 關鍵詞可快速找到相關文件
- **導覽便利性**: 3 次點擊內找到任何資訊
- **載入速度**: 文件頁面 < 2 秒載入

## 維護策略

1. **定期更新**: 每次發布前自動更新文件
2. **品質控制**: PR 中包含文件同步檢查
3. **使用者反饋**: 收集文件使用反饋並改進
4. **國際化準備**: 文件結構支援多語言擴展

## 未來擴展

完成基礎文件系統後，可進一步擴展：
- 互動式 API 文件 (類似 Storybook)
- 影片教學和說明
- 社群貢獻的範例和教學
- 多語言文件支援