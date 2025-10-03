import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import {
  fetchComponentConfig,
  downloadComponentWithDependencies
} from '../utils/registry'
import { validateProject, updateProjectConfig } from '../utils/project'
import { ComponentConfig, AddOptions } from '../types'
import { getDependencyTree, formatDependencyTree } from '../utils/dependency-resolver'

export async function addCommand(componentName: string, options: AddOptions) {
  try {
    // 1. 顯示開始訊息
    console.log(chalk.blue(`📦 正在添加 ${componentName} 組件...`))
    console.log()
    
    // 2. 驗證專案環境
    const spinner = ora('檢查專案環境...').start()
    await validateProject()
    spinner.succeed('專案環境檢查完成')
    
    // 3. 從 registry 獲取組件配置
    spinner.text = '獲取組件資訊...'
    spinner.start()
    const component = await fetchComponentConfig(componentName)
    if (!component) {
      spinner.fail(`找不到組件: ${componentName}`)
      console.log(chalk.yellow('執行 d3-components list 查看可用組件'))
      return
    }
    spinner.succeed('組件資訊獲取成功')
    
    // 4. 選擇變體
    const variant = await selectVariant(component, options.variant)

    // 5. 分析依賴樹
    spinner.text = '分析組件依賴...'
    spinner.start()
    const dependencyTree = await getDependencyTree(componentName)
    const hasDepend = dependencyTree.length > 1
    spinner.succeed(`依賴分析完成${hasDepend ? ` (${dependencyTree.length} 個組件)` : ''}`)

    // 6. 顯示依賴樹
    if (hasDepend) {
      console.log(chalk.blue('\n📦 將安裝以下組件:'))
      console.log(chalk.gray(formatDependencyTree(dependencyTree)))
      console.log()
    }

    // 7. 檢查依賴
    await checkDependencies(component.dependencies)

    // 8. 確認基礎目標目錄
    const baseTargetDir = path.resolve(options.dir || './src/components')

    // 9. 預覽模式
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 預覽模式 - 不會實際建立檔案'))
      previewChanges(component, variant, baseTargetDir, dependencyTree)
      return
    }

    // 10. 下載並安裝組件及依賴
    spinner.text = '下載組件及依賴...'
    spinner.start()
    const result = await downloadComponentWithDependencies(
      componentName,
      variant,
      baseTargetDir
    )
    spinner.succeed(`組件安裝完成 (${result.files.length} 個檔案)`)

    // 11. 更新專案配置
    await updateProjectConfig(component, variant)

    // 12. 顯示成功訊息和使用說明
    showSuccessMessage(component, result)
    
  } catch (error) {
    const errorSpinner = ora().start()
    errorSpinner.fail('添加組件失敗')
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}

async function selectVariant(
  component: ComponentConfig, 
  requestedVariant?: string
): Promise<string> {
  // 如果只有一個變體或已指定變體
  if (component.variants.length === 1 || requestedVariant) {
    const variant = requestedVariant || component.variants[0]
    if (!component.variants.includes(variant)) {
      throw new Error(`變體 "${variant}" 不存在於組件 "${component.name}"`)
    }
    return variant
  }
  
  // 暫時先返回第一個變體，之後修復 inquirer
  console.log(chalk.blue(`使用預設變體: ${component.variants[0]}`))
  return component.variants[0]
}

async function checkDependencies(deps: string[]) {
  if (!deps.length) return
  
  const packageJsonPath = path.resolve('./package.json')
  
  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.yellow('⚠️  找不到 package.json，請在專案根目錄執行'))
    return
  }
  
  const packageJson = await fs.readJSON(packageJsonPath)
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }
  
  const missing = deps.filter(dep => !allDeps[dep])
  
  if (missing.length > 0) {
    console.log(chalk.yellow(`⚠️  缺少依賴: ${missing.join(', ')}`))
    console.log(chalk.yellow('請手動安裝依賴：'))
    console.log(chalk.gray(`npm install ${missing.join(' ')}`))
  }
}



function previewChanges(
  component: ComponentConfig,
  variant: string,
  baseTargetDir: string,
  dependencyTree: any[]
) {
  console.log(chalk.blue('\n📋 預覽變更:'))
  console.log(`組件: ${component.name}`)
  console.log(`變體: ${variant}`)
  console.log(`基礎目錄: ${baseTargetDir}`)

  if (dependencyTree.length > 1) {
    console.log('\n將會安裝的組件:')
    dependencyTree.forEach(dep => {
      console.log(chalk.green(`  + ${dep.path}`))
    })
  }

  if (component.dependencies.length > 0) {
    console.log('\n需要的 npm 依賴:')
    component.dependencies.forEach(dep => {
      console.log(chalk.yellow(`  • ${dep}`))
    })
  }
}

function showSuccessMessage(
  component: ComponentConfig,
  result: { files: string[]; dependencies: string[] }
) {
  console.log(chalk.green('\n✅ 組件添加成功!'))
  console.log()

  // 顯示安裝的組件
  if (result.dependencies.length > 1) {
    console.log(chalk.blue('📦 已安裝的組件:'))
    result.dependencies.forEach(dep => {
      console.log(chalk.gray(`  ✓ ${dep}`))
    })
    console.log()
  }

  console.log(chalk.blue(`📁 已複製 ${result.files.length} 個檔案`))

  console.log()
  console.log(chalk.blue('📖 使用方式:'))

  // 如果有範例，顯示第一個範例
  if (component.examples && component.examples.length > 0) {
    console.log(chalk.gray(component.examples[0].code))
  } else {
    // 生成基本導入範例
    const componentClassName = component.name.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')

    console.log(chalk.gray(`import { ${componentClassName} } from '@/components/ui/${component.name}'`))
  }

  console.log()
  console.log(chalk.green('🎉 現在可以開始使用組件了！'))
}