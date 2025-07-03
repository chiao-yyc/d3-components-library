# Registry 系統建置任務

## 任務概述
建立和完善 D3 Components 的 Registry 系統，作為組件的中央倉庫和分發機制。

## 主要目標
1. 建立完整的 Registry 目錄結構
2. 實作組件配置和索引系統
3. 建立 Schema 驗證機制
4. 實作本地 Registry 支援

## 執行階段

### Phase 1: Registry 基礎結構 (優先級: 高)

#### 任務 1.1: 建立目錄結構
- **目標**: 建立標準化的 Registry 目錄結構
- **位置**: `registry/` 根目錄
- **需求**:

```
registry/
├── index.json              # 主索引檔案
├── schema.json             # JSON Schema 驗證
├── components/             # 組件目錄
│   ├── bar-chart/
│   │   ├── bar-chart.tsx   # 組件實作
│   │   ├── bar-chart.css   # 組件樣式
│   │   ├── types.ts        # 型別定義
│   │   ├── index.ts        # 匯出檔案
│   │   └── config.json     # 組件配置
│   └── line-chart/         # 其他組件...
├── utils/                  # 共用工具
│   ├── cn.ts              # CSS 類名工具
│   ├── data-detector.ts   # 資料偵測
│   └── adapters/          # 資料適配器
│       ├── csv-adapter.ts
│       ├── json-adapter.ts
│       └── time-series-adapter.ts
└── types/                  # 全域型別定義
    ├── index.ts
    ├── chart.ts
    └── data.ts
```

#### 任務 1.2: 建立主索引檔案
- **目標**: 建立 `registry/index.json` 主索引
- **檔案**: `registry/index.json`
- **需求**:
  - 列出所有可用組件
  - 包含組件基本資訊
  - 支援版本管理
  - 支援標籤分類

```json
{
  "$schema": "./schema.json",
  "version": "1.0.0",
  "lastUpdated": "2025-01-15T10:30:00Z",
  "components": [
    {
      "name": "bar-chart",
      "description": "可客製化的長條圖組件，支援互動和動畫",
      "version": "1.0.0",
      "tags": ["chart", "bar", "basic"],
      "variants": ["default", "animated", "interactive"],
      "dependencies": ["react", "d3", "@types/d3"],
      "category": "basic-charts",
      "complexity": "beginner",
      "lastUpdated": "2025-01-15T10:30:00Z",
      "files": ["bar-chart.tsx", "bar-chart.css", "types.ts", "index.ts"],
      "demo": "https://d3-components.com/demo/bar-chart",
      "docs": "https://d3-components.com/docs/bar-chart"
    }
  ],
  "categories": {
    "basic-charts": {
      "name": "基礎圖表",
      "description": "常用的基本圖表類型",
      "icon": "📊"
    },
    "advanced-charts": {
      "name": "進階圖表",
      "description": "複雜的客製化圖表",
      "icon": "📈"
    },
    "utilities": {
      "name": "工具函數",
      "description": "資料處理和輔助工具",
      "icon": "🔧"
    }
  },
  "stats": {
    "totalComponents": 1,
    "totalDownloads": 0,
    "averageRating": 0
  }
}
```

#### 任務 1.3: Schema 驗證定義
- **目標**: 建立 JSON Schema 用於驗證組件配置
- **檔案**: `registry/schema.json`
- **需求**:
  - 定義組件配置格式
  - 支援版本驗證
  - 提供錯誤訊息
  - 支援擴展欄位

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "D3 Components Registry Schema",
  "type": "object",
  "properties": {
    "$schema": {
      "type": "string"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "components": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/component"
      }
    },
    "categories": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/category"
      }
    }
  },
  "definitions": {
    "component": {
      "type": "object",
      "required": ["name", "description", "version", "files"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$"
        },
        "description": {
          "type": "string",
          "minLength": 10,
          "maxLength": 200
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "uniqueItems": true
        },
        "variants": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1
        },
        "dependencies": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "files": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1
        }
      }
    }
  }
}
```

### Phase 2: 組件配置系統 (優先級: 高)

#### 任務 2.1: 組件配置模板
- **目標**: 建立標準的組件配置模板
- **檔案**: `registry/components/[component]/config.json`
- **需求**:
  - 標準化配置格式
  - 支援多變體配置
  - 包含範例程式碼
  - 支援依賴管理

```json
{
  "$schema": "../../schema.json",
  "name": "bar-chart",
  "description": "可客製化的長條圖組件，支援互動和動畫效果",
  "version": "1.0.0",
  "author": "D3 Components Team",
  "license": "MIT",
  "tags": ["chart", "bar", "visualization", "d3"],
  "category": "basic-charts",
  "complexity": "beginner",
  "
  "variants": {
    "default": {
      "name": "預設版本",
      "description": "基本的長條圖實作",
      "files": ["bar-chart.tsx", "bar-chart.css", "types.ts", "index.ts"]
    },
    "animated": {
      "name": "動畫版本", 
      "description": "包含進場動畫的長條圖",
      "files": ["bar-chart.tsx", "bar-chart.css", "types.ts", "index.ts", "animations.ts"]
    },
    "interactive": {
      "name": "互動版本",
      "description": "包含 hover、click 等互動功能",
      "files": ["bar-chart.tsx", "bar-chart.css", "types.ts", "index.ts", "interactions.ts"]
    }
  },
  "files": {
    "bar-chart.tsx": {
      "type": "component",
      "description": "主要的 React 組件實作",
      "size": "~8KB"
    },
    "bar-chart.css": {
      "type": "style",
      "description": "組件樣式定義",
      "size": "~2KB"
    },
    "types.ts": {
      "type": "types",
      "description": "TypeScript 型別定義",
      "size": "~1KB"
    },
    "index.ts": {
      "type": "export",
      "description": "組件匯出檔案",
      "size": "<1KB"
    }
  },
  "dependencies": {
    "required": [
      "react@>=18.0.0",
      "d3@>=7.0.0"
    ],
    "optional": [
      "@types/d3@>=3.0.0"
    ],
    "peer": [
      "typescript@>=5.0.0"
    ]
  },
  "props": {
    "data": {
      "type": "any[]",
      "required": true,
      "description": "圖表資料陣列"
    },
    "xKey": {
      "type": "string",
      "required": false,
      "description": "X 軸資料欄位名稱"
    },
    "yKey": {
      "type": "string", 
      "required": false,
      "description": "Y 軸資料欄位名稱"
    },
    "width": {
      "type": "number",
      "default": 800,
      "description": "圖表寬度"
    },
    "height": {
      "type": "number",
      "default": 400,
      "description": "圖表高度"
    }
  },
  "examples": {
    "basic": {
      "title": "基本使用",
      "code": "import { BarChart } from './bar-chart'\\n\\nconst data = [\\n  { category: 'A', value: 10 },\\n  { category: 'B', value: 20 }\\n]\\n\\n<BarChart data={data} xKey=\"category\" yKey=\"value\" />"
    },
    "customized": {
      "title": "客製化樣式",
      "code": "import { BarChart } from './bar-chart'\\n\\n<BarChart \\n  data={data} \\n  xKey=\"category\" \\n  yKey=\"value\"\\n  width={600}\\n  height={300}\\n  className=\"custom-chart\"\\n/>"
    }
  },
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-01-15",
      "changes": ["Initial release", "Basic bar chart implementation"]
    }
  ]
}
```

#### 任務 2.2: 工具函數配置
- **目標**: 建立共用工具函數的配置和組織
- **檔案**: `registry/utils/`
- **需求**:
  - 資料處理工具
  - CSS 類名工具
  - 圖表輔助函數
  - 型別定義

```typescript
// registry/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// registry/utils/data-detector.ts
export interface DataTypeInfo {
  type: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  samples: any[]
  nullCount: number
}

export function detectColumnType(values: any[]): DataTypeInfo {
  // 實作資料型別偵測邏輯
}

export function suggestChartType(data: any[]): ChartSuggestion[] {
  // 實作圖表類型建議邏輯
}
```

### Phase 3: Registry 管理腳本 (優先級: 中)

#### 任務 3.1: Registry 驗證腳本
- **目標**: 建立 Registry 內容驗證腳本
- **檔案**: `scripts/validate-registry.js`
- **需求**:
  - 驗證 JSON 格式
  - 檢查檔案完整性
  - 驗證組件配置
  - 生成驗證報告

```javascript
// scripts/validate-registry.js
const fs = require('fs-extra')
const path = require('path')
const Ajv = require('ajv')

async function validateRegistry() {
  try {
    console.log('🔍 開始驗證 Registry...')
    
    // 1. 載入 Schema
    const schema = await fs.readJSON('./registry/schema.json')
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    
    // 2. 驗證主索引
    const index = await fs.readJSON('./registry/index.json')
    const isValid = validate(index)
    
    if (!isValid) {
      console.error('❌ 主索引驗證失敗:')
      console.error(validate.errors)
      process.exit(1)
    }
    
    // 3. 驗證各組件配置
    for (const component of index.components) {
      await validateComponent(component)
    }
    
    // 4. 檢查檔案完整性
    await checkFileIntegrity(index.components)
    
    console.log('✅ Registry 驗證通過!')
    
  } catch (error) {
    console.error('❌ 驗證過程發生錯誤:', error.message)
    process.exit(1)
  }
}

async function validateComponent(component) {
  const configPath = `./registry/components/${component.name}/config.json`
  
  if (!await fs.pathExists(configPath)) {
    throw new Error(`組件配置檔案不存在: ${configPath}`)
  }
  
  const config = await fs.readJSON(configPath)
  
  // 驗證必要欄位
  if (config.name !== component.name) {
    throw new Error(`組件名稱不一致: ${component.name}`)
  }
  
  // 檢查檔案是否存在
  for (const file of config.files) {
    const filePath = `./registry/components/${component.name}/${file}`
    if (!await fs.pathExists(filePath)) {
      throw new Error(`組件檔案不存在: ${filePath}`)
    }
  }
  
  console.log(`✅ 組件 ${component.name} 驗證通過`)
}

if (require.main === module) {
  validateRegistry()
}

module.exports = { validateRegistry }
```

#### 任務 3.2: Registry 更新腳本
- **目標**: 自動更新主索引檔案
- **檔案**: `scripts/update-registry.js`
- **需求**:
  - 掃描組件目錄
  - 更新主索引
  - 計算統計資訊
  - 生成變更日誌

```javascript
// scripts/update-registry.js
async function updateRegistry() {
  console.log('🔄 開始更新 Registry 索引...')
  
  const componentsDir = './registry/components'
  const indexPath = './registry/index.json'
  
  // 1. 掃描組件目錄
  const componentDirs = await fs.readdir(componentsDir)
  const components = []
  
  for (const dir of componentDirs) {
    const configPath = path.join(componentsDir, dir, 'config.json')
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJSON(configPath)
      
      // 提取索引資訊
      components.push({
        name: config.name,
        description: config.description,
        version: config.version,
        tags: config.tags || [],
        variants: Object.keys(config.variants || { default: {} }),
        dependencies: config.dependencies?.required || [],
        category: config.category || 'uncategorized',
        complexity: config.complexity || 'intermediate',
        lastUpdated: new Date().toISOString(),
        files: Object.keys(config.files || {}),
      })
    }
  }
  
  // 2. 生成主索引
  const index = {
    $schema: './schema.json',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    components,
    categories: await loadCategories(),
    stats: {
      totalComponents: components.length,
      totalDownloads: 0, // TODO: 實作下載統計
      averageRating: 0   // TODO: 實作評分系統
    }
  }
  
  // 3. 寫入檔案
  await fs.writeJSON(indexPath, index, { spaces: 2 })
  
  console.log(`✅ Registry 索引已更新 (${components.length} 個組件)`)
}
```

### Phase 4: CLI Registry 整合 (優先級: 中)

#### 任務 4.1: 本地 Registry 支援
- **目標**: 讓 CLI 工具支援本地 Registry
- **檔案**: `cli/src/utils/registry.ts`
- **需求**:
  - 檢測本地 Registry
  - 讀取組件配置
  - 複製檔案到專案
  - 處理相對路徑

```typescript
// cli/src/utils/registry.ts
const LOCAL_REGISTRY_PATH = path.resolve(process.cwd(), 'registry')

export async function fetchComponentConfig(name: string): Promise<ComponentConfig | null> {
  try {
    // 1. 檢查本地 Registry
    if (await fs.pathExists(LOCAL_REGISTRY_PATH)) {
      return await fetchFromLocal(name)
    }
    
    // 2. 回退到遠端 Registry (未來功能)
    console.warn(chalk.yellow('⚠️  遠端 Registry 功能尚未實作'))
    return null
    
  } catch (error) {
    throw new Error(`無法獲取組件配置 ${name}: ${error.message}`)
  }
}

async function fetchFromLocal(name: string): Promise<ComponentConfig | null> {
  const indexPath = path.join(LOCAL_REGISTRY_PATH, 'index.json')
  
  if (!await fs.pathExists(indexPath)) {
    throw new Error('無法獲取組件列表: 本地 registry/index.json 不存在')
  }
  
  const index = await fs.readJSON(indexPath)
  const component = index.components.find((c: any) => c.name === name)
  
  if (!component) {
    return null
  }
  
  // 讀取詳細配置
  const configPath = path.join(LOCAL_REGISTRY_PATH, 'components', name, 'config.json')
  if (await fs.pathExists(configPath)) {
    const detailedConfig = await fs.readJSON(configPath)
    return { ...component, ...detailedConfig }
  }
  
  return component
}

export async function downloadComponentFiles(
  componentName: string,
  variant: string,
  targetDir: string
): Promise<string[]> {
  const sourceDir = path.join(LOCAL_REGISTRY_PATH, 'components', componentName)
  const copiedFiles: string[] = []
  
  // 獲取組件配置
  const config = await fetchComponentConfig(componentName)
  if (!config) {
    throw new Error(`組件不存在: ${componentName}`)
  }
  
  // 獲取要複製的檔案清單
  const files = config.variants?.[variant]?.files || Object.keys(config.files || {})
  
  // 複製檔案
  for (const fileName of files) {
    const sourcePath = path.join(sourceDir, fileName)
    const targetPath = path.join(targetDir, fileName)
    
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath)
      copiedFiles.push(targetPath)
    } else {
      console.warn(chalk.yellow(`⚠️  檔案不存在，跳過: ${fileName}`))
    }
  }
  
  // 複製工具函數 (如果需要)
  await copyUtilFiles(targetDir, config)
  
  return copiedFiles
}

async function copyUtilFiles(targetDir: string, config: ComponentConfig) {
  // 檢查是否需要複製 utils 檔案
  const utilsNeeded = ['cn.ts', 'data-detector.ts'] // 根據組件需求決定
  
  for (const utilFile of utilsNeeded) {
    const sourcePath = path.join(LOCAL_REGISTRY_PATH, 'utils', utilFile)
    const targetPath = path.join(path.dirname(targetDir), 'utils', utilFile)
    
    if (await fs.pathExists(sourcePath)) {
      await fs.ensureDir(path.dirname(targetPath))
      await fs.copy(sourcePath, targetPath)
    }
  }
}
```

#### 任務 4.2: Registry 狀態檢查
- **目標**: 檢查 Registry 狀態和完整性
- **檔案**: `cli/src/commands/doctor.ts`
- **需求**:
  - 檢查 Registry 結構
  - 驗證組件完整性
  - 診斷常見問題
  - 提供修復建議

```typescript
export async function doctorCommand() {
  console.log(chalk.blue('🔍 開始診斷 D3 Components 環境...\n'))
  
  const issues: string[] = []
  
  // 1. 檢查 Registry 存在
  if (!await fs.pathExists(LOCAL_REGISTRY_PATH)) {
    issues.push('❌ 本地 Registry 不存在')
    console.log(chalk.red('❌ 本地 Registry 不存在'))
    console.log(chalk.gray('   建議: 複製 registry 目錄到專案根目錄'))
  } else {
    console.log(chalk.green('✅ 本地 Registry 存在'))
    
    // 2. 檢查主索引
    const indexPath = path.join(LOCAL_REGISTRY_PATH, 'index.json')
    if (await fs.pathExists(indexPath)) {
      console.log(chalk.green('✅ Registry 索引檔案存在'))
      
      // 3. 驗證組件完整性
      const index = await fs.readJSON(indexPath)
      console.log(chalk.blue(`📊 找到 ${index.components.length} 個組件`))
      
      for (const component of index.components) {
        const isValid = await validateComponentFiles(component)
        if (isValid) {
          console.log(chalk.green(`✅ ${component.name}`))
        } else {
          console.log(chalk.red(`❌ ${component.name} (檔案不完整)`))
          issues.push(`組件 ${component.name} 檔案不完整`)
        }
      }
    } else {
      issues.push('❌ Registry 索引檔案不存在')
      console.log(chalk.red('❌ Registry 索引檔案不存在'))
    }
  }
  
  // 4. 檢查專案環境
  await checkProjectEnvironment()
  
  // 5. 總結
  console.log(chalk.blue('\n📋 診斷總結:'))
  if (issues.length === 0) {
    console.log(chalk.green('🎉 所有檢查都通過了！'))
  } else {
    console.log(chalk.red(`發現 ${issues.length} 個問題:`))
    issues.forEach(issue => console.log(`  ${issue}`))
  }
}
```

## 執行檢查清單

### Phase 1 完成標準
- [ ] Registry 目錄結構建立完成
- [ ] 主索引檔案格式正確
- [ ] Schema 驗證定義完整
- [ ] 目錄結構符合規範

### Phase 2 完成標準  
- [ ] 組件配置模板建立
- [ ] 工具函數組織完成
- [ ] 配置格式統一標準化
- [ ] 範例程式碼可運作

### Phase 3 完成標準
- [ ] Registry 驗證腳本可運作
- [ ] 更新腳本可自動維護索引
- [ ] 所有驗證都通過
- [ ] 錯誤報告清晰明確

### Phase 4 完成標準
- [ ] CLI 可讀取本地 Registry
- [ ] 檔案複製功能正常
- [ ] doctor 命令可診斷問題
- [ ] 錯誤處理完善

## 成功指標

### 功能指標
- Registry 可支援無限組件擴展
- 組件配置完整性 100%
- CLI 工具可正確讀取所有組件
- 驗證腳本可捕獲所有格式錯誤

### 品質指標
- Schema 驗證覆蓋率 100%
- 所有配置檔案格式正確
- 檔案完整性檢查通過
- 無死連結或遺失檔案

### 維護指標
- 新增組件流程標準化
- 自動化驗證和更新
- 錯誤訊息清晰易懂
- 文件和範例同步更新

## 後續擴展

完成 Registry 系統後，可進一步擴展：
- 遠端 Registry 支援
- 組件版本管理
- 社群組件市場
- 組件評分和回饋系統