import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { fetchComponentConfig, downloadComponentFiles } from '../utils/registry'
import { validateProject, getProjectConfig } from '../utils/project'
import { ComponentConfig, UpdateOptions } from '../types'

export async function updateCommand(componentName?: string, options: UpdateOptions = {}) {
  try {
    console.log(chalk.blue(`🔄 正在更新組件...`))
    console.log()
    
    // 1. 驗證專案環境
    const spinner = ora('檢查專案環境...').start()
    await validateProject()
    spinner.succeed('專案環境檢查完成')
    
    // 2. 獲取專案配置
    const projectConfig = await getProjectConfig()
    if (!projectConfig.components || Object.keys(projectConfig.components).length === 0) {
      console.log(chalk.yellow('⚠️  沒有找到已安裝的組件'))
      console.log(chalk.gray('執行 d3-components add <component> 添加組件'))
      return
    }
    
    // 3. 決定要更新的組件
    const componentsToUpdate = componentName 
      ? [componentName]
      : Object.keys(projectConfig.components)
    
    // 4. 檢查指定組件是否存在
    if (componentName && !projectConfig.components[componentName]) {
      console.log(chalk.red(`❌ 組件 "${componentName}" 未安裝`))
      console.log(chalk.gray('執行 d3-components list --installed 查看已安裝組件'))
      return
    }
    
    // 5. 更新組件
    const results = []
    
    for (const comp of componentsToUpdate) {
      const result = await updateSingleComponent(comp, projectConfig.components[comp], options)
      results.push(result)
    }
    
    // 6. 顯示結果
    showUpdateResults(results)
    
  } catch (error) {
    const errorSpinner = ora().start()
    errorSpinner.fail('更新組件失敗')
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}

async function updateSingleComponent(
  componentName: string, 
  installedInfo: any, 
  options: UpdateOptions
): Promise<{ name: string; status: 'updated' | 'unchanged' | 'failed'; message?: string }> {
  const spinner = ora(`正在更新 ${componentName}...`).start()
  
  try {
    // 1. 獲取最新組件配置
    const latestComponent = await fetchComponentConfig(componentName)
    if (!latestComponent) {
      spinner.fail(`找不到組件: ${componentName}`)
      return { name: componentName, status: 'failed', message: '組件不存在' }
    }
    
    // 2. 檢查版本 (如果有版本資訊)
    if (installedInfo.version && latestComponent.version) {
      if (installedInfo.version === latestComponent.version) {
        spinner.succeed(`${componentName} 已是最新版本`)
        return { name: componentName, status: 'unchanged' }
      }
    }
    
    // 3. 備份現有檔案 (如果指定)
    if (options.backup) {
      await backupComponent(componentName, installedInfo.path)
    }
    
    // 4. 下載最新版本
    const targetDir = installedInfo.path || path.resolve('./src/components/ui', componentName)
    const variant = installedInfo.variant || 'default'
    
    const copiedFiles = await downloadComponentFiles(componentName, variant, targetDir)
    
    spinner.succeed(`${componentName} 更新完成 (${copiedFiles.length} 個檔案)`)
    
    return { 
      name: componentName, 
      status: 'updated', 
      message: `${copiedFiles.length} 個檔案已更新` 
    }
    
  } catch (error) {
    spinner.fail(`${componentName} 更新失敗`)
    return { 
      name: componentName, 
      status: 'failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function backupComponent(componentName: string, componentPath: string) {
  const backupDir = path.resolve('./.d3-components/backups', componentName)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, timestamp)
  
  await fs.ensureDir(backupPath)
  await fs.copy(componentPath, backupPath)
  
  console.log(chalk.gray(`📦 備份至: ${backupPath}`))
}

function showUpdateResults(results: Array<{ name: string; status: string; message?: string }>) {
  console.log()
  console.log(chalk.blue('📊 更新結果:'))
  
  const updated = results.filter(r => r.status === 'updated')
  const unchanged = results.filter(r => r.status === 'unchanged')
  const failed = results.filter(r => r.status === 'failed')
  
  if (updated.length > 0) {
    console.log(chalk.green(`✅ 已更新 (${updated.length})`))
    updated.forEach(result => {
      console.log(chalk.gray(`  • ${result.name} - ${result.message}`))
    })
  }
  
  if (unchanged.length > 0) {
    console.log(chalk.yellow(`ℹ️  未變更 (${unchanged.length})`))
    unchanged.forEach(result => {
      console.log(chalk.gray(`  • ${result.name}`))
    })
  }
  
  if (failed.length > 0) {
    console.log(chalk.red(`❌ 失敗 (${failed.length})`))
    failed.forEach(result => {
      console.log(chalk.gray(`  • ${result.name} - ${result.message}`))
    })
  }
  
  console.log()
  if (updated.length > 0) {
    console.log(chalk.green('🎉 組件更新完成！'))
  }
}