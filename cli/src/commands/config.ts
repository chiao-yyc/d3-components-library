import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { validateProject, getProjectConfig } from '../utils/project'
import { ConfigOptions } from '../types'

export async function configCommand(action?: string, key?: string, value?: string, options: ConfigOptions = {}) {
  try {
    // 1. 驗證專案環境
    const spinner = ora('檢查專案環境...').start()
    await validateProject()
    spinner.succeed('專案環境檢查完成')
    
    const configPath = path.resolve('./d3-components.json')
    const config = await getProjectConfig()
    
    // 2. 根據操作執行不同邏輯
    switch (action) {
      case 'get':
        await getConfig(config, key, options)
        break
      case 'set':
        await setConfig(config, key, value, configPath, options)
        break
      case 'unset':
        await unsetConfig(config, key, configPath, options)
        break
      case 'list':
      default:
        await listConfig(config, options)
        break
    }
    
  } catch (error) {
    const errorSpinner = ora().start()
    errorSpinner.fail('配置操作失敗')
    console.error(chalk.red(`錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`))
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}

async function listConfig(config: any, options: ConfigOptions) {
  console.log(chalk.blue('📋 D3 Components 配置:'))
  console.log()
  
  // 基本資訊
  console.log(chalk.yellow('基本資訊:'))
  console.log(`  名稱: ${config.name || 'N/A'}`)
  console.log(`  版本: ${config.version || 'N/A'}`)
  console.log(`  模板: ${config.template || 'react'}`)
  console.log()
  
  // 路徑配置
  console.log(chalk.yellow('路徑配置:'))
  console.log(`  組件目錄: ${config.paths?.components || './src/components/ui'}`)
  console.log(`  工具目錄: ${config.paths?.utils || './src/utils'}`)
  console.log(`  樣式目錄: ${config.paths?.styles || './src/styles'}`)
  console.log()
  
  // 已安裝組件
  if (config.components && Object.keys(config.components).length > 0) {
    console.log(chalk.yellow('已安裝組件:'))
    Object.entries(config.components).forEach(([name, info]: [string, any]) => {
      console.log(`  ${name}:`)
      console.log(`    變體: ${info.variant || 'default'}`)
      console.log(`    路徑: ${info.path || 'N/A'}`)
      console.log(`    版本: ${info.version || 'N/A'}`)
      console.log(`    安裝時間: ${info.installedAt || 'N/A'}`)
    })
  } else {
    console.log(chalk.gray('尚未安裝任何組件'))
  }
  
  // 詳細模式
  if (options.verbose) {
    console.log()
    console.log(chalk.yellow('完整配置:'))
    console.log(chalk.gray(JSON.stringify(config, null, 2)))
  }
}

async function getConfig(config: any, key?: string, options: ConfigOptions) {
  if (!key) {
    console.log(chalk.red('❌ 請指定要獲取的配置鍵'))
    console.log(chalk.gray('例如: d3-components config get paths.components'))
    return
  }
  
  const value = getNestedValue(config, key)
  
  if (value === undefined) {
    console.log(chalk.yellow(`⚠️  配置鍵 "${key}" 不存在`))
    return
  }
  
  if (options.json) {
    console.log(JSON.stringify(value, null, 2))
  } else {
    console.log(chalk.blue(`${key}: ${formatValue(value)}`))
  }
}

async function setConfig(config: any, key: string | undefined, value: string | undefined, configPath: string, _options?: ConfigOptions) {
  if (!key || value === undefined) {
    console.log(chalk.red('❌ 請指定要設置的配置鍵和值'))
    console.log(chalk.gray('例如: d3-components config set paths.components ./components'))
    return
  }
  
  // 解析值
  const parsedValue = parseValue(value)
  
  // 設置嵌套值
  setNestedValue(config, key, parsedValue)
  
  // 保存配置
  await fs.writeJSON(configPath, config, { spaces: 2 })
  
  console.log(chalk.green(`✅ 配置已更新: ${key} = ${formatValue(parsedValue)}`))
}

async function unsetConfig(config: any, key: string | undefined, configPath: string, _options?: ConfigOptions) {
  if (!key) {
    console.log(chalk.red('❌ 請指定要刪除的配置鍵'))
    console.log(chalk.gray('例如: d3-components config unset paths.custom'))
    return
  }
  
  if (getNestedValue(config, key) === undefined) {
    console.log(chalk.yellow(`⚠️  配置鍵 "${key}" 不存在`))
    return
  }
  
  // 刪除嵌套值
  deleteNestedValue(config, key)
  
  // 保存配置
  await fs.writeJSON(configPath, config, { spaces: 2 })
  
  console.log(chalk.green(`✅ 配置已刪除: ${key}`))
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
}

function deleteNestedValue(obj: any, path: string): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  const target = keys.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
  
  if (target && target[lastKey] !== undefined) {
    delete target[lastKey]
  }
}

function parseValue(value: string): any {
  // 嘗試解析為 JSON
  try {
    return JSON.parse(value)
  } catch {
    // 如果不是 JSON，直接返回字符串
    return value
  }
}

function formatValue(value: any): string {
  if (typeof value === 'string') {
    return value
  } else if (typeof value === 'object') {
    return JSON.stringify(value)
  } else {
    return String(value)
  }
}