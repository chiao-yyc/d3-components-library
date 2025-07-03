import chalk from 'chalk'
import { listAllComponents } from '../utils/registry'

interface ListOptions {
  filter?: string
}

export async function listCommand(options: ListOptions) {
  try {
    console.log(chalk.blue('📋 D3 Components 可用組件列表'))
    console.log()
    
    const components = await listAllComponents()
    
    if (components.length === 0) {
      console.log(chalk.yellow('目前沒有可用的組件'))
      console.log(chalk.gray('請檢查 registry 配置或網路連線'))
      return
    }
    
    // 過濾組件
    const filteredComponents = options.filter 
      ? components.filter(comp => 
          comp.name.toLowerCase().includes(options.filter!.toLowerCase()) ||
          comp.description.toLowerCase().includes(options.filter!.toLowerCase()) ||
          comp.tags.some(tag => tag.toLowerCase().includes(options.filter!.toLowerCase()))
        )
      : components
    
    if (filteredComponents.length === 0) {
      console.log(chalk.yellow(`找不到符合 "${options.filter}" 的組件`))
      return
    }
    
    // 顯示組件列表
    filteredComponents.forEach(component => {
      console.log(chalk.green(`📊 ${component.name}`))
      console.log(chalk.gray(`   ${component.description}`))
      
      if (component.variants && component.variants.length > 1) {
        console.log(chalk.cyan(`   變體: ${component.variants.join(', ')}`))
      }
      
      if (component.tags && component.tags.length > 0) {
        console.log(chalk.magenta(`   標籤: ${component.tags.join(', ')}`))
      }
      
      console.log()
    })
    
    console.log(chalk.blue(`總共 ${filteredComponents.length} 個組件`))
    console.log()
    console.log(chalk.gray('使用方式:'))
    console.log(chalk.gray('  npx d3-components add <component-name>'))
    
  } catch (error) {
    console.error(chalk.red('❌ 無法獲取組件列表'))
    if (error instanceof Error) {
      console.error(chalk.gray(error.message))
    }
    
    if (process.env.DEBUG) {
      console.error(error)
    }
    
    process.exit(1)
  }
}