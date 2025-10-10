/**
 * InstallationGuide - D3 Components 完整安裝指南
 * 提供詳細的安裝步驟、配置和使用說明
 */

import { motion } from 'framer-motion'
import {
  DemoPageTemplate,
  ContentSection,
  CodeExample,
  StatusDisplay
} from '../components/ui'
import {
  CommandLineIcon,
  DocumentIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

export default function InstallationGuide() {
  return (
    <DemoPageTemplate
      title="安裝指南"
      description="完整的 D3 Components 安裝和設置教學"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* CLI 安裝流程 */}
        <ContentSection title="方法一：使用 CLI 工具（推薦）">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5" />
                為什麼選擇 CLI？
              </h4>
              <p className="text-sm text-blue-700">
                CLI 工具提供自動化安裝、組件管理和配置功能，大幅簡化使用流程。
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">Step 1: 安裝 CLI 工具</h3>
            <CodeExample
              language="bash"
              code={`# === 使用 npm ===
npm install -g d3-components-cli

# === 使用 yarn ===
yarn global add d3-components-cli

# === 使用 pnpm ===
pnpm add -g d3-components-cli

# === 或直接使用 npx (無需安裝) ===
npx d3-components --help`}
            />
          </div>
        </ContentSection>

        <ContentSection title="Step 2: 初始化專案">
          <div className="space-y-4">
            <CodeExample
              language="bash"
              code={`# 進入你的專案目錄
cd my-project

# === React 專案 (預設) ===
npx d3-components init

# === Next.js 專案 ===
npx d3-components init --template next

# === Vite 專案 ===
npx d3-components init --template vite

# === Create React App 專案 ===
npx d3-components init --template create-react-app`}
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                初始化後將建立：
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
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
npx d3-components add area-chart --variant stacked

# 一次添加多個組件
npx d3-components add bar-chart line-chart pie-chart`}
            />

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 組件會自動複製到 <code>src/components/ui/</code> 目錄，並可以直接使用。
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
                { label: "狀態", value: "安裝完成！", color: "#10b981" },
                { label: "訊息", value: "組件已成功添加到你的專案中", color: "#3b82f6" }
              ]}
            />
          </div>
        </ContentSection>

        {/* 手動安裝流程 */}
        <div className="border-t-2 border-gray-200 pt-8">
          <ContentSection title="方法二：手動安裝（進階）">
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-700">
                  ⚠️ 手動安裝需要額外配置 Tailwind CSS 和路徑映射，建議使用 CLI 工具。
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">安裝依賴</h3>
              <CodeExample
                language="bash"
                code={`# === 使用 npm ===
npm install d3 @types/d3
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# === 使用 yarn ===
yarn add d3 @types/d3
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# === 使用 pnpm ===
pnpm add d3 @types/d3
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`}
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

          <ContentSection title="配置 Tailwind CSS">
            <div className="space-y-4">
              <CodeExample
                title="tailwind.config.js"
                language="javascript"
                code={`module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`}
              />
            </div>
          </ContentSection>

          <ContentSection title="複製組件文件">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                從 GitHub registry 目錄複製所需的組件到你的專案 <code>src/components/ui/</code> 目錄。
              </p>
              <CodeExample
                language="bash"
                code={`# 使用 git sparse-checkout 只下載特定組件
git clone --depth 1 --filter=blob:none --sparse \\
  https://github.com/yangyachiao/d3-components.git
cd d3-components
git sparse-checkout set registry/components/basic/bar-chart

# 然後複製到你的專案
cp -r registry/components/basic/bar-chart \\
      /path/to/your-project/src/components/ui/bar-chart`}
              />
            </div>
          </ContentSection>
        </div>

        {/* 使用範例 */}
        <ContentSection title="完整使用範例">
          <div className="space-y-4">
            <CodeExample
              title="Dashboard 範例"
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

        {/* 故障排除 */}
        <ContentSection title="故障排除">
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">
                Q: 安裝時出現權限錯誤？
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                A: 檢查 Node.js 版本是否 &gt;= 18，並確保網路連線正常。
              </p>
              <CodeExample
                language="bash"
                code={`# 檢查 Node 版本
node --version

# === macOS/Linux 使用 sudo ===
sudo npm install -g d3-components-cli

# === 或使用 npx 避免全域安裝 ===
npx d3-components init`}
              />
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">
                Q: TypeScript 報錯找不到模組？
              </h4>
              <p className="text-sm text-red-700 mb-2">
                A: 確保已正確配置路徑映射和安裝類型定義。
              </p>
              <CodeExample
                language="bash"
                code={`# === 使用 npm ===
npm install --save-dev @types/d3

# === 使用 yarn ===
yarn add -D @types/d3

# === 使用 pnpm ===
pnpm add -D @types/d3

# 檢查 tsconfig.json 路徑映射
cat tsconfig.json | grep -A 5 paths`}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Q: 圖表樣式不正確？
              </h4>
              <p className="text-sm text-blue-700 mb-2">
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

        {/* 下一步 */}
        <ContentSection title="下一步">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 cursor-pointer border border-blue-200"
              onClick={() => window.location.href = '/charts-showcase'}
            >
              <div className="text-blue-600 mb-3">
                <RocketLaunchIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">
                圖表總覽館
              </h3>
              <p className="text-sm text-blue-700">
                一頁瀏覽所有圖表類型，快速了解視覺效果
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 cursor-pointer border border-green-200"
              onClick={() => window.location.href = '/gallery'}
            >
              <div className="text-green-600 mb-3">
                <CommandLineIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">
                互動實驗室
              </h3>
              <p className="text-sm text-green-700">
                互動式調整圖表參數，即時預覽效果
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 cursor-pointer border border-purple-200"
              onClick={() => window.open('https://github.com/yangyachiao/d3-components/tree/main/docs', '_blank')}
            >
              <div className="text-purple-600 mb-3">
                <DocumentIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">
                完整文檔
              </h3>
              <p className="text-sm text-purple-700">
                查閱 API 參考、最佳實踐和進階指南
              </p>
            </motion.div>
          </div>
        </ContentSection>
      </div>
    </DemoPageTemplate>
  )
}
