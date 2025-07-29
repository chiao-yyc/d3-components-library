import { Command } from 'commander'
import chalk from 'chalk'
import { addCommand } from './commands/add'
import { initCommand } from './commands/init'
import { importCommand } from './commands/import'
import { listCommand } from './commands/list'
import { updateCommand } from './commands/update'
import { removeCommand } from './commands/remove'
import { configCommand } from './commands/config'

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
  .option('--installed', '只顯示已安裝的組件')
  .option('-v, --verbose', '顯示詳細資訊')
  .action(listCommand)

program
  .command('update [component]')
  .description('更新組件到最新版本')
  .option('--backup', '更新前備份現有檔案')
  .option('--force', '強制更新，跳過確認')
  .option('--dry-run', '預覽更新但不實際執行')
  .action(updateCommand)

program
  .command('remove <component>')
  .description('移除已安裝的組件')
  .option('--backup', '刪除前備份檔案')
  .option('--force', '強制刪除，跳過確認')
  .option('--dry-run', '預覽刪除但不實際執行')
  .option('--files-only', '只刪除檔案，保留目錄結構')
  .action(removeCommand)

program
  .command('config [action] [key] [value]')
  .description('管理專案配置')
  .option('--json', '以 JSON 格式輸出')
  .option('-v, --verbose', '顯示詳細資訊')
  .action(configCommand)

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