import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { validateProject, getProjectConfig } from '../utils/project'
import { RemoveOptions } from '../types'

export async function removeCommand(componentName: string, options: RemoveOptions = {}) {
  try {
    console.log(chalk.blue(`🗑️  正在移除組件 ${componentName}...`))
    console.log()
    
    // 1. 驗證專案環境
    const spinner = ora('檢查專案環境...').start()
    await validateProject()
    spinner.succeed('專案環境檢查完成')
    
    // 2. 獲取專案配置
    const projectConfig = await getProjectConfig()
    if (!projectConfig.components || !projectConfig.components[componentName]) {
      console.log(chalk.yellow(`⚠️  組件 "${componentName}" 未安裝`))
      console.log(chalk.gray('執行 d3-components list --installed 查看已安裝組件'))
      return
    }
    
    const componentInfo = projectConfig.components[componentName]
    const componentPath = componentInfo.path || path.resolve('./src/components/ui', componentName)
    
    // 3. 檢查組件路徑是否存在
    if (!await fs.pathExists(componentPath)) {
      console.log(chalk.yellow(`⚠️  組件路徑不存在: ${componentPath}`))
      
      // 仍然從配置中移除
      await removeFromConfig(componentName, projectConfig)
      console.log(chalk.green('✅ 已從配置中移除'))
      return
    }
    
    // 4. 預覽模式
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 預覽模式 - 不會實際刪除檔案'))
      await previewRemoval(componentName, componentPath, componentInfo)
      return
    }
    
    // 5. 備份檔案 (如果指定)
    if (options.backup) {
      await backupComponent(componentName, componentPath)
    }
    
    // 6. 顯示要刪除的內容
    const filesToDelete = await getFilesToDelete(componentPath)
    
    if (!options.force) {
      console.log(chalk.yellow('⚠️  即將刪除以下檔案:'))
      filesToDelete.forEach(file => {
        console.log(chalk.gray(`  • ${path.relative(process.cwd(), file)}`))
      })
      console.log()
      
      // 這裡應該有確認提示，暫時跳過
      console.log(chalk.blue('如需確認刪除，請加上 --force 參數'))
      return
    }
    
    // 7. 刪除檔案
    spinner.text = '正在刪除檔案...'
    spinner.start()
    
    if (options.filesOnly) {
      // 只刪除檔案，保留目錄結構
      await deleteFiles(filesToDelete)
    } else {
      // 刪除整個目錄
      await fs.remove(componentPath)
    }
    
    spinner.succeed('檔案刪除完成')
    
    // 8. 從配置中移除
    await removeFromConfig(componentName, projectConfig)
    
    // 9. 顯示成功訊息
    console.log(chalk.green('✅ 組件移除成功!'))
    console.log()
    console.log(chalk.blue('📁 已刪除:'))
    console.log(chalk.gray(`  ${path.relative(process.cwd(), componentPath)}`))
    
    if (options.backup) {
      console.log(chalk.blue('📦 備份位置:'))
      console.log(chalk.gray(`  ./.d3-components/backups/${componentName}/`))
    }
    
  } catch (error) {
    const errorSpinner = ora().start()
    errorSpinner.fail('移除組件失敗')
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}

async function previewRemoval(componentName: string, componentPath: string, componentInfo: any) {
  console.log(chalk.blue('\n📋 預覽刪除:'))
  console.log(`組件: ${componentName}`)
  console.log(`路徑: ${componentPath}`)
  console.log(`變體: ${componentInfo.variant || 'default'}`)
  
  const filesToDelete = await getFilesToDelete(componentPath)
  
  if (filesToDelete.length > 0) {
    console.log('\n將會刪除的檔案:')
    filesToDelete.forEach(file => {
      console.log(chalk.red(`  - ${path.relative(process.cwd(), file)}`))
    })
  }
  
  console.log('\n將會從配置中移除:')
  console.log(chalk.red(`  - d3-components.json 中的 ${componentName} 項目`))
}

async function getFilesToDelete(componentPath: string): Promise<string[]> {
  const files: string[] = []
  
  if (await fs.pathExists(componentPath)) {
    const stats = await fs.stat(componentPath)
    
    if (stats.isDirectory()) {
      const dirFiles = await fs.readdir(componentPath, { withFileTypes: true })
      for (const file of dirFiles) {
        const filePath = path.join(componentPath, file.name)
        if (file.isDirectory()) {
          const subFiles = await getFilesToDelete(filePath)
          files.push(...subFiles)
        } else {
          files.push(filePath)
        }
      }
    } else {
      files.push(componentPath)
    }
  }
  
  return files
}

async function deleteFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    await fs.remove(filePath)
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

async function removeFromConfig(componentName: string, projectConfig: any) {
  // 從配置中移除組件
  delete projectConfig.components[componentName]
  
  // 更新配置文件
  const configPath = path.resolve('./d3-components.json')
  await fs.writeJSON(configPath, projectConfig, { spaces: 2 })
  
  console.log(chalk.gray('📝 已從配置中移除'))
}