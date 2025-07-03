import chalk from 'chalk'

interface ImportOptions {
  chart?: string
  autoDetect?: boolean
  interactive?: boolean
}

export async function importCommand(file: string, options: ImportOptions) {
  console.log(chalk.blue(`📊 正在匯入 ${file}...`))
  console.log(chalk.yellow('⚠️  此功能尚未實作'))
  console.log(chalk.gray(`選項: ${JSON.stringify(options)}`))
}