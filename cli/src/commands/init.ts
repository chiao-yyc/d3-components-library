import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { validateProject } from '../utils/project'
import { InitOptions, ProjectConfig } from '../types'

export async function initCommand(options: InitOptions) {
  const spinner = ora()
  
  try {
    console.log(chalk.blue('🚀 初始化 D3 Components 專案...'))
    console.log()
    
    // 1. 檢查當前目錄
    const currentDir = process.cwd()
    const configPath = path.join(currentDir, 'd3-components.json')
    
    // 2. 檢查是否已經初始化
    if (await fs.pathExists(configPath) && !options.force) {
      console.log(chalk.yellow('⚠️  專案已經初始化過了'))
      console.log(chalk.gray(`配置檔案: ${configPath}`))
      console.log(chalk.blue('如果要重新初始化，請使用 --force 選項'))
      return
    }
    
    // 3. 驗證專案環境
    spinner.start('檢查專案環境...')
    try {
      await validateProject()
      spinner.succeed('專案環境檢查完成')
    } catch (error) {
      spinner.warn('專案環境檢查發現問題')
      console.log(chalk.yellow(`⚠️  ${error instanceof Error ? error.message : 'Unknown error'}`))
      console.log(chalk.gray('繼續初始化...'))
    }
    
    // 4. 分析專案結構
    spinner.start('分析專案結構...')
    const projectInfo = await analyzeProject(currentDir)
    spinner.succeed('專案結構分析完成')
    
    // 5. 建立目錄結構
    spinner.start('建立目錄結構...')
    await createDirectoryStructure(currentDir, projectInfo)
    spinner.succeed('目錄結構建立完成')
    
    // 6. 建立配置檔案
    spinner.start('建立配置檔案...')
    await createConfigFile(configPath, projectInfo, options)
    spinner.succeed('配置檔案建立完成')
    
    // 7. 複製工具函數
    spinner.start('複製工具函數...')
    await copyUtilityFiles(currentDir, projectInfo)
    spinner.succeed('工具函數複製完成')
    
    // 8. 顯示成功訊息
    showSuccessMessage(projectInfo)
    
  } catch (error) {
    spinner.fail('初始化失敗')
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}

interface ProjectInfo {
  isReact: boolean
  isVue: boolean
  isVanilla: boolean
  hasTypeScript: boolean
  hasTailwind: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm'
  framework: 'react' | 'vue' | 'vanilla'
  srcDir: string
  componentsDir: string
  utilsDir: string
  stylesDir: string
}

async function analyzeProject(projectDir: string): Promise<ProjectInfo> {
  const packageJsonPath = path.join(projectDir, 'package.json')
  
  let packageJson: any = {}
  if (await fs.pathExists(packageJsonPath)) {
    packageJson = await fs.readJSON(packageJsonPath)
  }
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }
  
  // 框架檢測
  const isReact = !!allDeps.react
  const isVue = !!allDeps.vue
  const isVanilla = !isReact && !isVue
  
  // 工具檢測
  const hasTypeScript = !!allDeps.typescript || await fs.pathExists(path.join(projectDir, 'tsconfig.json'))
  const hasTailwind = !!allDeps.tailwindcss || await fs.pathExists(path.join(projectDir, 'tailwind.config.js'))
  
  // 套件管理器檢測
  let packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'
  if (await fs.pathExists(path.join(projectDir, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm'
  } else if (await fs.pathExists(path.join(projectDir, 'yarn.lock'))) {
    packageManager = 'yarn'
  }
  
  // 框架選擇
  let framework: 'react' | 'vue' | 'vanilla' = 'vanilla'
  if (isReact) framework = 'react'
  else if (isVue) framework = 'vue'
  
  // 目錄結構檢測
  let srcDir = './src'
  let componentsDir = './src/components'
  let utilsDir = './src/utils'
  let stylesDir = './src/styles'
  
  // 檢查常見的目錄結構
  if (await fs.pathExists(path.join(projectDir, 'src'))) {
    srcDir = './src'
    if (isReact) {
      componentsDir = './src/components/ui'
      if (await fs.pathExists(path.join(projectDir, 'src/components/ui'))) {
        // 已有 shadcn/ui 結構
      } else if (await fs.pathExists(path.join(projectDir, 'src/components'))) {
        componentsDir = './src/components'
      }
    }
  } else if (await fs.pathExists(path.join(projectDir, 'app'))) {
    // Next.js 13+ app directory
    srcDir = './app'
    componentsDir = './components/ui'
    utilsDir = './lib'
  } else if (await fs.pathExists(path.join(projectDir, 'pages'))) {
    // Next.js pages directory
    srcDir = './pages'
    componentsDir = './components/ui'
    utilsDir = './lib'
  }
  
  return {
    isReact,
    isVue,
    isVanilla,
    hasTypeScript,
    hasTailwind,
    packageManager,
    framework,
    srcDir,
    componentsDir,
    utilsDir,
    stylesDir
  }
}

async function createDirectoryStructure(projectDir: string, info: ProjectInfo) {
  const dirs = [
    info.componentsDir,
    info.utilsDir,
    info.stylesDir
  ]
  
  for (const dir of dirs) {
    const fullPath = path.join(projectDir, dir)
    await fs.ensureDir(fullPath)
  }
}

async function createConfigFile(configPath: string, info: ProjectInfo, options: InitOptions) {
  const config: ProjectConfig = {
    $schema: 'https://registry.d3-components.com/schema.json',
    components: [],
    settings: {
      componentsDir: info.componentsDir,
      utilsDir: info.utilsDir,
      stylesDir: info.stylesDir,
      typescript: info.hasTypeScript,
      framework: info.framework
    }
  }
  
  await fs.writeJSON(configPath, config, { spaces: 2 })
}

async function copyUtilityFiles(projectDir: string, info: ProjectInfo) {
  // 檢查是否有本地 registry（開發模式）
  const registryPath = path.resolve(process.cwd(), 'registry')
  
  if (await fs.pathExists(registryPath)) {
    const utilsSourceDir = path.join(registryPath, 'utils')
    const utilsTargetDir = path.join(projectDir, info.utilsDir)
    
    // 複製基本工具函數
    const utilFiles = ['cn.ts']
    
    for (const file of utilFiles) {
      const sourcePath = path.join(utilsSourceDir, file)
      const targetPath = path.join(utilsTargetDir, file)
      
      if (await fs.pathExists(sourcePath) && !await fs.pathExists(targetPath)) {
        await fs.copy(sourcePath, targetPath)
        console.log(chalk.gray(`  已複製 ${file}`))
      }
    }
  } else {
    console.log(chalk.yellow('⚠️  找不到本地 registry，跳過工具函數複製'))
  }
}

function showSuccessMessage(info: ProjectInfo) {
  console.log(chalk.green('\n✅ D3 Components 初始化完成！'))
  console.log()
  
  console.log(chalk.blue('📋 專案資訊:'))
  console.log(chalk.gray(`  框架: ${info.framework}`))
  console.log(chalk.gray(`  TypeScript: ${info.hasTypeScript ? '✓' : '✗'}`))
  console.log(chalk.gray(`  Tailwind CSS: ${info.hasTailwind ? '✓' : '✗'}`))
  console.log(chalk.gray(`  套件管理器: ${info.packageManager}`))
  
  console.log()
  console.log(chalk.blue('📁 目錄結構:'))
  console.log(chalk.gray(`  組件目錄: ${info.componentsDir}`))
  console.log(chalk.gray(`  工具目錄: ${info.utilsDir}`))
  console.log(chalk.gray(`  樣式目錄: ${info.stylesDir}`))
  
  console.log()
  console.log(chalk.blue('🎉 下一步:'))
  console.log(chalk.gray('  1. 執行 d3-components list 查看可用組件'))
  console.log(chalk.gray('  2. 執行 d3-components add bar-chart 添加第一個組件'))
  console.log(chalk.gray('  3. 開始建立你的 D3 視覺化專案！'))
}