// src/index.ts
#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { addCommand } from '@/commands/add.js'  // 注意 .js 副檔名
import { initCommand } from '@/commands/init.js'
import { importCommand } from '@/commands/import.js'
import { listCommand } from '@/commands/list.js'

const program = new Command()

program
  .name('d3-components')
  .description('D3 Components CLI - 透明化的 D3 組件庫')
  .version('1.0.0')

// 註冊命令
program
  .command('add <component>')
  .description('添加組件到專案中')
  .option('-v, --variant <variant>', '選擇組件變體')
  .option('-d, --dir <directory>', '目標目錄', './src/components/ui')
  .option('--dry-run', '預覽變更但不實際執行')
  .action(addCommand)

// ... 其他命令

program.parse()