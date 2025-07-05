import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { fetchComponentConfig, downloadComponentFiles } from '../utils/registry'
import { validateProject, updateProjectConfig } from '../utils/project'
import { ComponentConfig, AddOptions } from '../types'

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
    
    // 5. 檢查依賴
    await checkDependencies(component.dependencies)
    
    // 6. 確認目標目錄
    const targetDir = path.resolve(options.dir || './src/components/ui', componentName)
    
    // 7. 預覽模式
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 預覽模式 - 不會實際建立檔案'))
      previewChanges(component, variant, targetDir)
      return
    }
    
    // 8. 檢查目標目錄是否已存在
    if (await fs.pathExists(targetDir)) {
      console.log(chalk.yellow(`目錄 ${targetDir} 已存在，將會覆蓋`))
    }
    
    // 9. 下載並安裝組件
    spinner.text = '下載組件檔案...'
    spinner.start()
    const copiedFiles = await downloadComponentFiles(componentName, variant, targetDir)
    spinner.succeed(`組件檔案下載完成 (${copiedFiles.length} 個檔案)`)
    
    // 10. 更新專案配置
    await updateProjectConfig(component, variant)
    
    // 11. 顯示成功訊息和使用說明
    showSuccessMessage(component, targetDir, copiedFiles)
    
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
  targetDir: string
) {
  console.log(chalk.blue('\n📋 預覽變更:'))
  console.log(`組件: ${component.name}`)
  console.log(`變體: ${variant}`)
  console.log(`目標目錄: ${targetDir}`)
  console.log('\n將會建立的檔案:')
  
  component.files.forEach(fileName => {
    const filePath = path.join(targetDir, fileName)
    console.log(chalk.green(`  + ${filePath}`))
  })
  
  if (component.dependencies.length > 0) {
    console.log('\n需要的依賴:')
    component.dependencies.forEach(dep => {
      console.log(chalk.yellow(`  • ${dep}`))
    })
  }
}

function showSuccessMessage(
  component: ComponentConfig, 
  targetDir: string,
  copiedFiles: string[]
) {
  console.log(chalk.green('\n✅ 組件添加成功!'))
  console.log()
  console.log(chalk.blue('📁 已複製的檔案:'))
  copiedFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file)
    console.log(chalk.gray(`  ${relativePath}`))
  })
  
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
    
    const relativePath = path.relative('./src', targetDir)
    console.log(chalk.gray(`import { ${componentClassName} } from './${relativePath}'`))
  }
  
  console.log()
  console.log(chalk.green('🎉 現在可以開始使用組件了！'))
}