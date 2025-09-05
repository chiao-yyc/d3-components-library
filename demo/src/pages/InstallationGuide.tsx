/**
 * InstallationGuide - D3 Components 完整安裝指南
 * 提供詳細的安裝步驟、配置和使用說明
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DemoPageTemplate,
  ContentSection,
  ModernControlPanel,
  ControlGroup,
  SelectControl,
  CodeExample,
  StatusDisplay
} from '../components/ui'
import { 
  CommandLineIcon, 
  DocumentIcon, 
  CheckCircleIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline'

export default function InstallationGuide() {
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm'>('npm')
  const [framework, setFramework] = useState<'react' | 'next' | 'vite' | 'create-react-app'>('react')
  const [installMethod, setInstallMethod] = useState<'cli' | 'manual'>('cli')

  const getInstallCommand = () => {
    const commands = {
      npm: 'npm install -g d3-components-cli',
      yarn: 'yarn global add d3-components-cli', 
      pnpm: 'pnpm add -g d3-components-cli'
    }
    return commands[packageManager]
  }

  const getInitCommand = () => {
    const base = 'd3-components init'
    const templateFlag = framework !== 'react' ? ` --template ${framework}` : ''
    return `npx ${base}${templateFlag}`
  }

  const getDependencyInstall = () => {
    const commands = {
      npm: 'npm install d3 @types/d3',
      yarn: 'yarn add d3 @types/d3',
      pnpm: 'pnpm add d3 @types/d3'
    }
    return commands[packageManager]
  }

  return (
    <DemoPageTemplate
      title="安裝指南"
      description="完整的 D3 Components 安裝和設置教學"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="配置選項">
            <ControlGroup title="套件管理器" icon={<CommandLineIcon className="w-5 h-5" />}>
              <SelectControl
                label="選擇套件管理器"
                value={packageManager}
                onChange={(value) => setPackageManager(value as typeof packageManager)}
                options={[
                  { value: 'npm', label: 'npm' },
                  { value: 'yarn', label: 'Yarn' },
                  { value: 'pnpm', label: 'pnpm' }
                ]}
              />
            </ControlGroup>

            <ControlGroup title="專案框架" icon={<DocumentIcon className="w-5 h-5" />}>
              <SelectControl
                label="選擇專案框架"
                value={framework}
                onChange={(value) => setFramework(value as typeof framework)}
                options={[
                  { value: 'react', label: 'React' },
                  { value: 'next', label: 'Next.js' },
                  { value: 'vite', label: 'Vite' },
                  { value: 'create-react-app', label: 'Create React App' }
                ]}
              />
            </ControlGroup>

            <ControlGroup title="安裝方式" icon={<CheckCircleIcon className="w-5 h-5" />}>
              <SelectControl
                label="選擇安裝方式"
                value={installMethod}
                onChange={(value) => setInstallMethod(value as typeof installMethod)}
                options={[
                  { value: 'cli', label: 'CLI 工具 (推薦)' },
                  { value: 'manual', label: '手動安裝' }
                ]}
              />
            </ControlGroup>
          </ModernControlPanel>
        </div>

        {/* 主要內容 */}
        <div className="lg:col-span-3 space-y-8">
          {installMethod === 'cli' ? (
            <>
              {/* CLI 安裝流程 */}
              <ContentSection title="Step 1: 安裝 CLI 工具">
                <div className="space-y-4">
                  <CodeExample
                    language="bash"
                    code={`# 全域安裝 CLI 工具
${getInstallCommand()}

# 或直接使用 (無需安裝)
npx d3-components --help`}
                  />
                  
                  <StatusDisplay
                    items={[
                      { label: "為什麼選擇 CLI？", value: "CLI 工具提供自動化安裝、組件管理和配置功能，大幅簡化使用流程。" }
                    ]}
                  />
                </div>
              </ContentSection>

              <ContentSection title="Step 2: 初始化專案">
                <div className="space-y-4">
                  <CodeExample
                    language="bash"
                    code={`# 進入你的專案目錄
cd my-project

# 初始化 D3 Components
${getInitCommand()}`}
                  />
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      初始化後將建立：
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• <code>d3-components.json</code> - 配置文件</li>
                      <li>• <code>src/components/ui/</code> - 組件目錄</li>
                      <li>• <code>src/lib/utils.ts</code> - 工具函數</li>
                      <li>• 自動安裝 d3 相關依賴</li>
                    </ul>
                  </div>
                </div>
              </ContentSection>

              <ContentSection title="Step 3: 添加圖表組件">
                <div className="space-y-4">
                  <CodeExample
                    language="bash"
                    code={`# 添加長條圖組件
npx d3-components add bar-chart

# 查看所有可用組件
npx d3-components list

# 添加特定變體
npx d3-components add area-chart --variant stacked`}
                  />
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      💡 提示
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      組件會自動複製到 <code>src/components/ui/</code> 目錄，並可以直接使用。
                    </p>
                  </div>
                </div>
              </ContentSection>

              <ContentSection title="Step 4: 開始使用">
                <div className="space-y-4">
                  <CodeExample
                    title="基本使用範例"
                    language="tsx"
                    code={`import { BarChart } from '@/components/ui/bar-chart'

const data = [
  { category: 'A', value: 100 },
  { category: 'B', value: 200 },
  { category: 'C', value: 150 }
]

function MyChart() {
  return (
    <div className="p-4">
      <h2>我的第一個圖表</h2>
      <BarChart 
        data={data}
        xKey="category"
        yKey="value"
        width={600}
        height={400}
      />
    </div>
  )
}`}
                  />

                  <StatusDisplay
                    items={[
                      { label: "狀態", value: "安裝完成！" },
                      { label: "訊息", value: "組件已成功添加到你的專案中" }
                    ]}
                  />
                </div>
              </ContentSection>
            </>
          ) : (
            <>
              {/* 手動安裝流程 */}
              <ContentSection title="手動安裝">
                <div className="space-y-4">
                  <CodeExample
                    language="bash"
                    code={`# 安裝核心依賴
${getDependencyInstall()}

# 安裝 Tailwind CSS (如果尚未安裝)
${packageManager} install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`}
                  />

                  <StatusDisplay
                    items={[
                      { label: "注意事項", value: "手動安裝需要額外配置 Tailwind CSS 和路徑映射" }
                    ]}
                  />
                </div>
              </ContentSection>

              <ContentSection title="配置路徑映射">
                <div className="space-y-4">
                  <CodeExample
                    title="tsconfig.json"
                    language="json"
                    code={`{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`}
                  />
                </div>
              </ContentSection>
            </>
          )}

          <ContentSection title="在代碼中使用">
            <div className="space-y-4">
              <CodeExample
                title="完整範例"
                language="tsx"
                code={`import { BarChart } from '@/components/ui/bar-chart'
import { LineChart } from '@/components/ui/line-chart'

const salesData = [
  { month: 'Jan', revenue: 4000, profit: 2400 },
  { month: 'Feb', revenue: 3000, profit: 1398 },
  { month: 'Mar', revenue: 2000, profit: 9800 },
  { month: 'Apr', revenue: 2780, profit: 3908 }
]

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">月營收</h3>
        <BarChart
          data={salesData}
          xKey="month"
          yKey="revenue"
          width={400}
          height={300}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">利潤趨勢</h3>
        <LineChart
          data={salesData}
          xKey="month"
          yKey="profit"
          width={400}
          height={300}
        />
      </div>
    </div>
  )
}`}
              />
            </div>
          </ContentSection>

          <ContentSection title="故障排除">
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Q: 安裝時出現權限錯誤？
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  A: 檢查 Node.js 版本是否 &gt;= 18，並確保網路連線正常。
                </p>
                <CodeExample
                  language="bash"
                  code={`# 檢查 Node 版本
node --version

# 使用 sudo (macOS/Linux)
sudo ${getInstallCommand()}

# 或使用 npx 避免全域安裝
npx d3-components init`}
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Q: TypeScript 報錯找不到模組？
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  A: 確保已正確配置路徑映射和安裝類型定義。
                </p>
                <CodeExample
                  language="bash"
                  code={`# 安裝類型定義
${packageManager} install --save-dev @types/d3

# 檢查 tsconfig.json 路徑映射
cat tsconfig.json | grep -A 5 paths`}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Q: 圖表樣式不正確？
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  A: 檢查 Tailwind CSS 配置是否正確載入。
                </p>
                <CodeExample
                  language="bash"
                  code={`# 重新建構 Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# 檢查 tailwind.config.js
cat tailwind.config.js`}
                />
              </div>
            </div>
          </ContentSection>
        </div>
      </div>

      <div className="mt-12">
        <ContentSection title="下一步">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 cursor-pointer border border-blue-200 dark:border-blue-700"
              onClick={() => window.location.href = '/gallery'}
            >
              <div className="text-blue-600 dark:text-blue-400 mb-3">
                <RocketLaunchIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                探索圖表庫
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                查看各種圖表的互動式範例和使用方法
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 cursor-pointer border border-green-200 dark:border-green-700"
              onClick={() => window.open('https://github.com/yangyachiao/d3-components/tree/main/docs', '_blank')}
            >
              <div className="text-green-600 dark:text-green-400 mb-3">
                <DocumentIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                完整文檔
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                查閱 docs/ 目錄中的 API 參考、最佳實踐和詳細指南
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 cursor-pointer border border-purple-200 dark:border-purple-700"
              onClick={() => window.open('https://github.com/yangyachiao/d3-components/blob/main/docs/BEST_PRACTICES.md', '_blank')}
            >
              <div className="text-purple-600 dark:text-purple-400 mb-3">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                最佳實踐
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                了解如何高效使用 D3 Components 的最佳做法
              </p>
            </motion.div>
          </div>
        </ContentSection>
      </div>
    </DemoPageTemplate>
  )
}