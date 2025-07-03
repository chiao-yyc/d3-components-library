import chalk from 'chalk'

interface InitOptions {
  template?: string
}

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue('🚀 初始化 D3 Components 專案...'))
  console.log(chalk.yellow('⚠️  此功能尚未實作'))
  console.log(chalk.gray(`選項: ${JSON.stringify(options)}`))
}