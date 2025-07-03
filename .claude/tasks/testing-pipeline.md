# 測試管道建置任務

## 任務概述
建立完整的測試管道，確保 D3 Components 專案的程式碼品質、功能正確性和效能標準。

## 主要目標
1. 建立完整的測試框架和配置
2. 實作各層級的測試策略
3. 建立 CI/CD 自動化測試流程
4. 實作測試覆蓋率監控和報告

## 執行階段

### Phase 1: 測試框架建置 (優先級: 高)

#### 任務 1.1: CLI 工具測試配置
- **目標**: 為 CLI 工具建立 Vitest 測試環境
- **位置**: `cli/`
- **需求**:

```typescript
// cli/vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

```typescript
// cli/src/test/setup.ts
import fs from 'fs-extra'
import path from 'path'
import { beforeEach, afterEach } from 'vitest'

// 全域測試設置
beforeEach(async () => {
  // 設定測試環境變數
  process.env.NODE_ENV = 'test'
  process.env.DEBUG = '0'
})

afterEach(async () => {
  // 清理測試資料
  await cleanupTestFiles()
})

async function cleanupTestFiles() {
  const testDirs = [
    '/tmp/d3-components-test',
    './test-output'
  ]
  
  for (const dir of testDirs) {
    if (await fs.pathExists(dir)) {
      await fs.remove(dir)
    }
  }
}
```

#### 任務 1.2: 組件測試配置
- **目標**: 為 React 組件建立測試環境
- **位置**: `registry/components/`
- **需求**:

```typescript
// vitest.config.components.ts (根目錄)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup-components.ts'],
    coverage: {
      provider: 'v8',
      include: ['registry/components/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 75,
          statements: 75
        }
      }
    }
  }
})
```

```typescript
// tests/setup-components.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// React Testing Library 清理
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver for chart components
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  // Mock SVG methods
  global.SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  })
})
```

#### 任務 1.3: 測試工具函數
- **目標**: 建立測試輔助工具和 Mock 函數
- **位置**: `tests/utils/`
- **需求**:

```typescript
// tests/utils/test-helpers.ts
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Chart 組件測試包裝器
export function renderChart(
  ui: ReactElement,
  options?: RenderOptions
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ width: 800, height: 400 }}>
      {children}
    </div>
  )
  
  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock 資料生成器
export function generateMockData(count: number = 10) {
  return Array.from({ length: count }, (_, i) => ({
    category: `Category ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 1,
    id: `item-${i}`
  }))
}

// D3 SVG 元素測試工具
export function getSVGElements(container: HTMLElement) {
  return {
    svg: container.querySelector('svg'),
    bars: container.querySelectorAll('rect.bar'),
    xAxis: container.querySelector('.x-axis'),
    yAxis: container.querySelector('.y-axis'),
    tooltip: container.querySelector('.tooltip')
  }
}

// 非同步等待 D3 渲染完成
export function waitForD3Render(timeout: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}
```

```typescript
// tests/utils/cli-helpers.ts
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

export class TestProject {
  constructor(public dir: string) {}
  
  static async create(name: string = 'test-project'): Promise<TestProject> {
    const dir = path.join('/tmp', `d3-components-test-${Date.now()}`)
    await fs.ensureDir(dir)
    
    // 建立基本的 package.json
    await fs.writeJSON(path.join(dir, 'package.json'), {
      name,
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0',
        d3: '^7.0.0'
      }
    })
    
    return new TestProject(dir)
  }
  
  async addFile(filePath: string, content: string) {
    const fullPath = path.join(this.dir, filePath)
    await fs.ensureDir(path.dirname(fullPath))
    await fs.writeFile(fullPath, content)
  }
  
  async hasFile(filePath: string): Promise<boolean> {
    return fs.pathExists(path.join(this.dir, filePath))
  }
  
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(path.join(this.dir, filePath), 'utf8')
  }
  
  async cleanup() {
    await fs.remove(this.dir)
  }
  
  runCLI(command: string): string {
    return execSync(`node ${CLI_PATH} ${command}`, {
      cwd: this.dir,
      encoding: 'utf8'
    })
  }
}

const CLI_PATH = path.resolve(__dirname, '../../cli/dist/index.js')
```

### Phase 2: 單元測試實作 (優先級: 高)

#### 任務 2.1: CLI 工具單元測試
- **目標**: 為所有 CLI 功能建立單元測試
- **位置**: `cli/src/**/*.test.ts`
- **需求**:

```typescript
// cli/src/utils/registry.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import { fetchComponentConfig, downloadComponentFiles } from './registry'
import { TestProject } from '../../tests/utils/cli-helpers'

describe('Registry Utils', () => {
  let testProject: TestProject
  
  beforeEach(async () => {
    testProject = await TestProject.create()
    
    // 建立 mock registry
    await testProject.addFile('registry/index.json', JSON.stringify({
      components: [
        {
          name: 'test-chart',
          description: 'Test chart component',
          version: '1.0.0',
          files: ['test-chart.tsx', 'test-chart.css']
        }
      ]
    }))
    
    await testProject.addFile('registry/components/test-chart/config.json', JSON.stringify({
      name: 'test-chart',
      description: 'Test chart component',
      version: '1.0.0',
      files: {
        'test-chart.tsx': { type: 'component' },
        'test-chart.css': { type: 'style' }
      }
    }))
    
    await testProject.addFile('registry/components/test-chart/test-chart.tsx', 
      'export function TestChart() { return <div>Test Chart</div> }'
    )
    await testProject.addFile('registry/components/test-chart/test-chart.css', 
      '.test-chart { color: blue; }'
    )
  })
  
  afterEach(async () => {
    await testProject.cleanup()
  })
  
  describe('fetchComponentConfig', () => {
    test('should fetch component config from local registry', async () => {
      process.chdir(testProject.dir)
      
      const config = await fetchComponentConfig('test-chart')
      
      expect(config).toBeDefined()
      expect(config?.name).toBe('test-chart')
      expect(config?.version).toBe('1.0.0')
    })
    
    test('should return null for non-existent component', async () => {
      process.chdir(testProject.dir)
      
      const config = await fetchComponentConfig('non-existent-chart')
      
      expect(config).toBeNull()
    })
    
    test('should throw error when registry is missing', async () => {
      const emptyProject = await TestProject.create()
      process.chdir(emptyProject.dir)
      
      await expect(fetchComponentConfig('test-chart'))
        .rejects.toThrow('本地 registry/index.json 不存在')
      
      await emptyProject.cleanup()
    })
  })
  
  describe('downloadComponentFiles', () => {
    test('should copy files to target directory', async () => {
      process.chdir(testProject.dir)
      const targetDir = path.join(testProject.dir, 'src/components/ui/test-chart')
      
      const copiedFiles = await downloadComponentFiles('test-chart', 'default', targetDir)
      
      expect(copiedFiles).toHaveLength(2)
      expect(await testProject.hasFile('src/components/ui/test-chart/test-chart.tsx')).toBe(true)
      expect(await testProject.hasFile('src/components/ui/test-chart/test-chart.css')).toBe(true)
    })
    
    test('should handle missing source files gracefully', async () => {
      process.chdir(testProject.dir)
      
      // 刪除一個檔案來測試錯誤處理
      await fs.remove(path.join(testProject.dir, 'registry/components/test-chart/test-chart.css'))
      
      const targetDir = path.join(testProject.dir, 'src/components/ui/test-chart')
      const copiedFiles = await downloadComponentFiles('test-chart', 'default', targetDir)
      
      // 應該只複製存在的檔案
      expect(copiedFiles).toHaveLength(1)
      expect(copiedFiles[0]).toContain('test-chart.tsx')
    })
  })
})
```

```typescript
// cli/src/commands/add.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { addCommand } from './add'
import { TestProject } from '../../tests/utils/cli-helpers'
import * as registry from '../utils/registry'
import * as project from '../utils/project'

// Mock 外部依賴
vi.mock('../utils/registry')
vi.mock('../utils/project')

describe('Add Command', () => {
  let testProject: TestProject
  
  beforeEach(async () => {
    testProject = await TestProject.create()
    process.chdir(testProject.dir)
    
    // 設定 mock
    vi.mocked(registry.fetchComponentConfig).mockResolvedValue({
      name: 'test-chart',
      description: 'Test chart',
      version: '1.0.0',
      dependencies: [],
      files: { 'test-chart.tsx': { type: 'component' } },
      variants: { default: {} }
    })
    
    vi.mocked(registry.downloadComponentFiles).mockResolvedValue([
      '/test/src/components/ui/test-chart/test-chart.tsx'
    ])
    
    vi.mocked(project.validateProject).mockResolvedValue()
    vi.mocked(project.updateProjectConfig).mockResolvedValue()
  })
  
  afterEach(async () => {
    await testProject.cleanup()
    vi.clearAllMocks()
  })
  
  test('should successfully add component', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await addCommand('test-chart', { dryRun: false })
    
    expect(registry.fetchComponentConfig).toHaveBeenCalledWith('test-chart')
    expect(registry.downloadComponentFiles).toHaveBeenCalled()
    expect(project.updateProjectConfig).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('📦 正在添加 test-chart 組件')
    )
    
    consoleSpy.mockRestore()
  })
  
  test('should handle non-existent component', async () => {
    vi.mocked(registry.fetchComponentConfig).mockResolvedValue(null)
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await addCommand('non-existent-chart', { dryRun: false })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('執行 d3-components list 查看可用組件')
    )
    
    consoleSpy.mockRestore()
  })
  
  test('should preview changes in dry-run mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await addCommand('test-chart', { dryRun: true })
    
    expect(registry.downloadComponentFiles).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🔍 預覽模式')
    )
    
    consoleSpy.mockRestore()
  })
})
```

#### 任務 2.2: 工具函數單元測試
- **目標**: 為資料處理和工具函數建立測試
- **位置**: `registry/utils/**/*.test.ts`
- **需求**:

```typescript
// registry/utils/data-detector.test.ts
import { describe, test, expect } from 'vitest'
import { detectColumnType, suggestMapping } from './data-detector'

describe('Data Detector', () => {
  describe('detectColumnType', () => {
    test('should detect number type correctly', () => {
      const values = [1, 2, 3, 4, 5]
      const result = detectColumnType(values)
      
      expect(result.type).toBe('number')
      expect(result.confidence).toBeGreaterThan(0.9)
      expect(result.nullCount).toBe(0)
    })
    
    test('should detect string type correctly', () => {
      const values = ['A', 'B', 'C', 'D', 'E']
      const result = detectColumnType(values)
      
      expect(result.type).toBe('string')
      expect(result.confidence).toBeGreaterThan(0.9)
    })
    
    test('should detect date type correctly', () => {
      const values = [
        '2023-01-01',
        '2023-01-02', 
        '2023-01-03',
        '2023-01-04'
      ]
      const result = detectColumnType(values)
      
      expect(result.type).toBe('date')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
    
    test('should handle mixed types with confidence scoring', () => {
      const values = [1, 2, 'three', 4, 5]
      const result = detectColumnType(values)
      
      expect(result.type).toBe('number')
      expect(result.confidence).toBeLessThan(0.9)
      expect(result.confidence).toBeGreaterThan(0.5)
    })
    
    test('should handle null values correctly', () => {
      const values = [1, 2, null, 4, 5, null]
      const result = detectColumnType(values)
      
      expect(result.type).toBe('number')
      expect(result.nullCount).toBe(2)
    })
  })
  
  describe('suggestMapping', () => {
    test('should suggest appropriate mappings for chart data', () => {
      const data = [
        { category: 'A', value: 10, date: '2023-01-01' },
        { category: 'B', value: 20, date: '2023-01-02' },
        { category: 'C', value: 15, date: '2023-01-03' }
      ]
      
      const suggestions = suggestMapping(data)
      
      expect(suggestions).toHaveLength(3)
      
      // 應該建議 category 作為 X 軸
      const categorySuggestion = suggestions.find(s => s.field === 'category')
      expect(categorySuggestion?.suggestedAxis).toBe('x')
      expect(categorySuggestion?.chartTypes).toContain('bar')
      
      // 應該建議 value 作為 Y 軸
      const valueSuggestion = suggestions.find(s => s.field === 'value')
      expect(valueSuggestion?.suggestedAxis).toBe('y')
      
      // 應該建議 date 用於時間序列圖
      const dateSuggestion = suggestions.find(s => s.field === 'date')
      expect(dateSuggestion?.chartTypes).toContain('line')
    })
  })
})
```

### Phase 3: 組件測試實作 (優先級: 中)

#### 任務 3.1: BarChart 組件測試
- **目標**: 為 BarChart 組件建立完整測試
- **位置**: `registry/components/bar-chart/bar-chart.test.tsx`
- **需求**:

```typescript
// registry/components/bar-chart/bar-chart.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BarChart } from './bar-chart'
import { renderChart, generateMockData, getSVGElements } from '../../../tests/utils/test-helpers'

describe('BarChart Component', () => {
  const mockData = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 15 }
  ]
  
  beforeEach(() => {
    // Mock D3 methods that might cause issues in test environment
    vi.clearAllMocks()
  })
  
  describe('Rendering', () => {
    test('should render chart with correct dimensions', () => {
      renderChart(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value" 
          width={400} 
          height={300} 
        />
      )
      
      const svg = screen.getByRole('img')
      expect(svg).toHaveAttribute('width', '400')
      expect(svg).toHaveAttribute('height', '300')
    })
    
    test('should render correct number of bars', async () => {
      const { container } = renderChart(
        <BarChart data={mockData} xKey="category" yKey="value" />
      )
      
      await waitFor(() => {
        const bars = container.querySelectorAll('rect.bar')
        expect(bars).toHaveLength(3)
      })
    })
    
    test('should apply custom className', () => {
      const { container } = renderChart(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value"
          className="custom-chart"
        />
      )
      
      const chartContainer = container.querySelector('.chart-container')
      expect(chartContainer).toHaveClass('custom-chart')
    })
    
    test('should handle empty data gracefully', () => {
      const { container } = renderChart(
        <BarChart data={[]} xKey="category" yKey="value" />
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      
      const bars = container.querySelectorAll('rect.bar')
      expect(bars).toHaveLength(0)
    })
  })
  
  describe('Data Processing', () => {
    test('should handle different data key configurations', async () => {
      const data = [
        { name: 'Item 1', count: 5 },
        { name: 'Item 2', count: 10 }
      ]
      
      const { container } = renderChart(
        <BarChart data={data} xKey="name" yKey="count" />
      )
      
      await waitFor(() => {
        const bars = container.querySelectorAll('rect.bar')
        expect(bars).toHaveLength(2)
      })
    })
    
    test('should update when data changes', async () => {
      const { container, rerender } = renderChart(
        <BarChart data={mockData} xKey="category" yKey="value" />
      )
      
      await waitFor(() => {
        expect(container.querySelectorAll('rect.bar')).toHaveLength(3)
      })
      
      const newData = [
        ...mockData,
        { category: 'D', value: 25 }
      ]
      
      rerender(
        <BarChart data={newData} xKey="category" yKey="value" />
      )
      
      await waitFor(() => {
        expect(container.querySelectorAll('rect.bar')).toHaveLength(4)
      })
    })
    
    test('should handle missing or invalid data', async () => {
      const invalidData = [
        { category: 'A', value: 10 },
        { category: 'B', value: null },
        { category: 'C', value: 'invalid' },
        { category: 'D', value: 20 }
      ]
      
      const { container } = renderChart(
        <BarChart data={invalidData} xKey="category" yKey="value" />
      )
      
      await waitFor(() => {
        // 應該只渲染有效的資料
        const bars = container.querySelectorAll('rect.bar')
        expect(bars.length).toBeLessThanOrEqual(2) // A 和 D
      })
    })
  })
  
  describe('Interactions', () => {
    test('should call onDataClick when bar is clicked', async () => {
      const onDataClick = vi.fn()
      
      const { container } = renderChart(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value"
          onDataClick={onDataClick}
        />
      )
      
      await waitFor(() => {
        const firstBar = container.querySelector('rect.bar')
        expect(firstBar).toBeInTheDocument()
      })
      
      const firstBar = container.querySelector('rect.bar')!
      fireEvent.click(firstBar)
      
      expect(onDataClick).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'A',
          value: 10
        })
      )
    })
    
    test('should call onHover when bar is hovered', async () => {
      const onHover = vi.fn()
      
      const { container } = renderChart(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value"
          onHover={onHover}
        />
      )
      
      await waitFor(() => {
        const firstBar = container.querySelector('rect.bar')
        expect(firstBar).toBeInTheDocument()
      })
      
      const firstBar = container.querySelector('rect.bar')!
      fireEvent.mouseEnter(firstBar)
      
      expect(onHover).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'A',
          value: 10
        })
      )
    })
  })
  
  describe('Responsive Behavior', () => {
    test('should recalculate scales when dimensions change', async () => {
      const { container, rerender } = renderChart(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value"
          width={400}
          height={300}
        />
      )
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toHaveAttribute('width', '400')
      })
      
      rerender(
        <BarChart 
          data={mockData} 
          xKey="category" 
          yKey="value"
          width={800}
          height={600}
        />
      )
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toHaveAttribute('width', '800')
        expect(container.querySelector('svg')).toHaveAttribute('height', '600')
      })
    })
  })
  
  describe('Performance', () => {
    test('should handle large datasets efficiently', async () => {
      const largeData = generateMockData(1000)
      const startTime = performance.now()
      
      const { container } = renderChart(
        <BarChart data={largeData} xKey="category" yKey="value" />
      )
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // 渲染時間應該在合理範圍內 (< 500ms)
      expect(renderTime).toBeLessThan(500)
    })
  })
})
```

### Phase 4: 整合測試實作 (優先級: 中)

#### 任務 4.1: CLI 整合測試
- **目標**: 測試完整的 CLI 工作流程
- **位置**: `tests/integration/cli.test.ts`
- **需求**:

```typescript
// tests/integration/cli.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { TestProject } from '../utils/cli-helpers'

describe('CLI Integration Tests', () => {
  let testProject: TestProject
  const CLI_PATH = path.resolve(__dirname, '../../cli/dist/index.js')
  
  beforeEach(async () => {
    testProject = await TestProject.create()
    
    // 建立測試用的 registry
    await setupTestRegistry(testProject)
    
    process.chdir(testProject.dir)
  })
  
  afterEach(async () => {
    await testProject.cleanup()
  })
  
  describe('add command', () => {
    test('should add component successfully', () => {
      const result = execSync(`node ${CLI_PATH} add test-chart --dry-run`, {
        encoding: 'utf8',
        cwd: testProject.dir
      })
      
      expect(result).toContain('📦 正在添加 test-chart 組件')
      expect(result).toContain('🔍 預覽模式')
      expect(result).toContain('test-chart.tsx')
    })
    
    test('should actually copy files when not in dry-run mode', async () => {
      execSync(`node ${CLI_PATH} add test-chart --dir ./components`, {
        cwd: testProject.dir
      })
      
      expect(await testProject.hasFile('components/test-chart/test-chart.tsx')).toBe(true)
      expect(await testProject.hasFile('components/test-chart/test-chart.css')).toBe(true)
    })
    
    test('should create project config file', async () => {
      execSync(`node ${CLI_PATH} add test-chart`, {
        cwd: testProject.dir
      })
      
      expect(await testProject.hasFile('d3-components.json')).toBe(true)
      
      const config = JSON.parse(await testProject.readFile('d3-components.json'))
      expect(config.components).toHaveLength(1)
      expect(config.components[0].name).toBe('test-chart')
    })
    
    test('should handle non-existent component gracefully', () => {
      const result = execSync(`node ${CLI_PATH} add non-existent-chart`, {
        encoding: 'utf8',
        cwd: testProject.dir,
        stdio: 'pipe'
      })
      
      expect(result).toContain('找不到組件')
    })
  })
  
  describe('list command', () => {
    test('should list available components', () => {
      const result = execSync(`node ${CLI_PATH} list`, {
        encoding: 'utf8',
        cwd: testProject.dir
      })
      
      expect(result).toContain('test-chart')
      expect(result).toContain('Test chart component')
    })
    
    test('should filter components by tag', () => {
      const result = execSync(`node ${CLI_PATH} list --filter chart`, {
        encoding: 'utf8',
        cwd: testProject.dir
      })
      
      expect(result).toContain('test-chart')
    })
  })
  
  describe('init command', () => {
    test('should initialize project configuration', async () => {
      // 移除現有的 package.json 來測試完整初始化
      await fs.remove(path.join(testProject.dir, 'package.json'))
      
      const result = execSync(`echo "y\nreact\ny" | node ${CLI_PATH} init`, {
        encoding: 'utf8',
        cwd: testProject.dir,
        stdio: 'pipe'
      })
      
      expect(result).toContain('初始化完成')
      expect(await testProject.hasFile('d3-components.json')).toBe(true)
    })
  })
  
  describe('error handling', () => {
    test('should show help for unknown commands', () => {
      try {
        execSync(`node ${CLI_PATH} unknown-command`, {
          encoding: 'utf8',
          cwd: testProject.dir,
          stdio: 'pipe'
        })
      } catch (error) {
        expect((error as any).stdout || (error as any).stderr).toContain('未知命令')
      }
    })
    
    test('should handle missing registry gracefully', async () => {
      // 移除 registry 來測試錯誤處理
      await fs.remove(path.join(testProject.dir, 'registry'))
      
      try {
        execSync(`node ${CLI_PATH} add test-chart`, {
          encoding: 'utf8',
          cwd: testProject.dir,
          stdio: 'pipe'
        })
      } catch (error) {
        expect((error as any).stdout || (error as any).stderr).toContain('registry')
      }
    })
  })
})

async function setupTestRegistry(project: TestProject) {
  // 建立測試用的 registry 結構
  await project.addFile('registry/index.json', JSON.stringify({
    $schema: './schema.json',
    version: '1.0.0',
    components: [
      {
        name: 'test-chart',
        description: 'Test chart component',
        version: '1.0.0',
        tags: ['chart', 'test'],
        variants: ['default'],
        dependencies: ['react', 'd3'],
        files: ['test-chart.tsx', 'test-chart.css']
      }
    ]
  }))
  
  await project.addFile('registry/components/test-chart/config.json', JSON.stringify({
    name: 'test-chart',
    description: 'Test chart component',
    version: '1.0.0',
    files: {
      'test-chart.tsx': { type: 'component' },
      'test-chart.css': { type: 'style' }
    },
    variants: {
      default: {
        files: ['test-chart.tsx', 'test-chart.css']
      }
    }
  }))
  
  await project.addFile('registry/components/test-chart/test-chart.tsx', `
import React from 'react'
import './test-chart.css'

export interface TestChartProps {
  data: any[]
}

export function TestChart({ data }: TestChartProps) {
  return (
    <div className="test-chart">
      <h3>Test Chart</h3>
      <p>Data points: {data.length}</p>
    </div>
  )
}
`)
  
  await project.addFile('registry/components/test-chart/test-chart.css', `
.test-chart {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
`)
}
```

### Phase 5: CI/CD 整合 (優先級: 低)

#### 任務 5.1: GitHub Actions 設定
- **目標**: 建立自動化測試和部署流程
- **位置**: `.github/workflows/`
- **需求**:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-cli:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: 'cli/package-lock.json'
    
    - name: Install CLI dependencies
      run: |
        cd cli
        npm ci
    
    - name: Run CLI tests
      run: |
        cd cli
        npm run test
    
    - name: Run CLI integration tests
      run: |
        cd cli
        npm run build
        npm run test:integration
    
    - name: Upload CLI coverage
      uses: codecov/codecov-action@v3
      with:
        file: cli/coverage/lcov.info
        flags: cli

  test-components:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run component tests
      run: npm run test:components
    
    - name: Upload component coverage
      uses: codecov/codecov-action@v3
      with:
        file: coverage/lcov.info
        flags: components

  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd cli && npm ci
    
    - name: Run ESLint
      run: |
        npm run lint
        cd cli && npm run lint
    
    - name: Run TypeScript check
      run: |
        npm run type-check
        cd cli && npm run type-check

  validate-registry:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate registry
      run: npm run registry:validate
```

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    uses: ./.github/workflows/test.yml
  
  release-cli:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: |
        cd cli
        npm ci
    
    - name: Build CLI
      run: |
        cd cli
        npm run build
    
    - name: Publish to NPM
      run: |
        cd cli
        npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

## 執行檢查清單

### Phase 1 完成標準
- [ ] Vitest 配置完成並可運行
- [ ] 測試環境設置正確
- [ ] Mock 和輔助工具函數建立
- [ ] 測試覆蓋率門檻設定

### Phase 2 完成標準
- [ ] 所有 CLI 函數都有單元測試
- [ ] 工具函數測試覆蓋率 > 85%
- [ ] 錯誤處理場景都有測試
- [ ] Mock 使用正確且穩定

### Phase 3 完成標準
- [ ] BarChart 組件測試完整
- [ ] 渲染、互動、響應式都有測試
- [ ] 效能測試通過
- [ ] 邊界情況處理正確

### Phase 4 完成標準
- [ ] CLI 整合測試涵蓋主要工作流程
- [ ] 端到端功能測試通過
- [ ] 錯誤情況處理測試完成
- [ ] 測試穩定且可重複

### Phase 5 完成標準
- [ ] CI/CD 流程自動運行
- [ ] 測試覆蓋率報告生成
- [ ] 自動發布流程正常
- [ ] 所有檢查都通過

## 成功指標

### 覆蓋率指標
- **CLI 工具覆蓋率**: > 85%
- **組件覆蓋率**: > 80%
- **工具函數覆蓋率**: > 90%
- **整體覆蓋率**: > 80%

### 品質指標
- **測試穩定性**: 99% 通過率
- **測試執行時間**: < 2 分鐘
- **CI/CD 成功率**: > 95%
- **錯誤檢測率**: > 95%

### 效能指標
- **單元測試**: < 30 秒
- **整合測試**: < 1 分鐘
- **組件測試**: < 45 秒
- **總測試時間**: < 2 分鐘

## 維護策略

1. **測試程式碼品質**: 測試程式碼也要符合相同的品質標準
2. **定期更新**: 隨著功能變更更新測試案例
3. **效能監控**: 監控測試執行時間，避免過慢
4. **覆蓋率維護**: 保持高覆蓋率，但避免為了覆蓋率而寫無意義的測試