import { Command } from 'commander'
import chalk from 'chalk'
import { addCommand } from './commands/add'
import { initCommand } from './commands/init'
import { importCommand } from './commands/import'
import { listCommand } from './commands/list'

const program = new Command()

// 基本資訊
program
  .name('d3-components')
  .description('D3 Components CLI - 透明化的 D3 組件庫')
  .version('0.1.0')

// 註冊命令
program
  .command('add <component>')
  .description('添加組件到專案中')
  .option('-v, --variant <variant>', '選擇組件變體')
  .option('-d, --dir <directory>', '目標目錄', './src/components/ui')
  .option('--dry-run', '預覽變更但不實際執行')
  .action(addCommand)

program
  .command('init')
  .description('初始化 D3 Components 專案')
  .option('-t, --template <template>', '專案模板', 'react')
  .action(initCommand)

program
  .command('import <file>')
  .description('匯入資料並生成圖表')
  .option('-c, --chart <type>', '圖表類型')
  .option('--auto-detect', '自動偵測資料格式')
  .option('--interactive', '互動式配置')
  .action(importCommand)

program
  .command('list')
  .description('列出所有可用組件')
  .option('-f, --filter <filter>', '過濾組件')
  .action(listCommand)

// 錯誤處理
program.on('command:*', () => {
  console.error(chalk.red(`未知命令: ${program.args.join(' ')}`))
  console.log(chalk.yellow('執行 d3-components --help 查看可用命令'))
  process.exit(1)
})

// 解析命令行參數
program.parse()

// 如果沒有提供任何命令，顯示幫助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}