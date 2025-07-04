import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { CsvAdapter, TimeSeriesAdapter, NestedAdapter, PivotAdapter } from '../../../registry/adapters'
import { suggestMapping, suggestChartType } from '../../../registry/utils/data-detector'
import { SuggestedMapping, ChartSuggestion } from '../../../registry/types'

interface ImportOptions {
  chart?: string
  autoDetect?: boolean
  interactive?: boolean
  output?: string
}

interface ParsedData {
  data: any[]
  adapter: string
  suggestions: {
    mapping: SuggestedMapping[]
    charts: ChartSuggestion[]
  }
}

export async function importCommand(file: string, options: ImportOptions) {
  console.log(chalk.blue(`📊 正在匯入 ${file}...`))
  
  try {
    // 1. 檢查檔案是否存在
    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ 檔案不存在: ${file}`))
      return
    }
    
    // 2. 解析資料
    const parsedData = await parseDataFile(file)
    
    if (!parsedData) {
      console.log(chalk.red('❌ 無法解析資料檔案'))
      return
    }
    
    console.log(chalk.green(`✅ 成功載入 ${parsedData.data.length} 筆資料`))
    console.log(chalk.gray(`使用適配器: ${parsedData.adapter}`))
    
    // 3. 自動偵測模式
    if (options.autoDetect) {
      await handleAutoDetectMode(parsedData, options)
      return
    }
    
    // 4. 互動模式
    if (options.interactive) {
      await handleInteractiveMode(parsedData, options)
      return
    }
    
    // 5. 基本模式：顯示建議
    displaySuggestions(parsedData)
    
  } catch (error) {
    console.log(chalk.red(`❌ 處理檔案時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`))
  }
}

/**
 * 解析資料檔案
 */
async function parseDataFile(filePath: string): Promise<ParsedData | null> {
  const ext = path.extname(filePath).toLowerCase()
  const content = fs.readFileSync(filePath, 'utf-8')
  
  let data: any[] = []
  let adapter = 'unknown'
  
  try {
    switch (ext) {
      case '.csv':
        data = CsvAdapter.parseCSV(content)
        adapter = 'CSV'
        break
        
      case '.json':
        const jsonData = JSON.parse(content)
        data = Array.isArray(jsonData) ? jsonData : [jsonData]
        
        // 選擇最佳適配器
        if (hasNestedStructure(data)) {
          adapter = 'Nested'
        } else if (hasTimeSeriesData(data)) {
          adapter = 'TimeSeries'
        } else if (isWideFormat(data)) {
          adapter = 'Pivot'
        } else {
          adapter = 'JSON'
        }
        break
        
      default:
        console.log(chalk.yellow(`⚠️  不支援的檔案格式: ${ext}`))
        return null
    }
    
    // 生成建議
    const mapping = suggestMapping(data)
    const charts = suggestChartType(data)
    
    return {
      data,
      adapter,
      suggestions: { mapping, charts }
    }
    
  } catch (error) {
    console.log(chalk.red(`❌ 解析檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`))
    return null
  }
}

/**
 * 自動偵測模式
 */
async function handleAutoDetectMode(parsedData: ParsedData, options: ImportOptions) {
  console.log(chalk.blue('\n🔍 自動偵測模式'))
  
  const { mapping, charts } = parsedData.suggestions
  
  if (mapping.length === 0) {
    console.log(chalk.yellow('⚠️  無法自動偵測適合的欄位映射'))
    return
  }
  
  // 選擇最佳映射
  const xField = mapping.find(m => m.suggested === 'x')
  const yField = mapping.find(m => m.suggested === 'y')
  
  if (!xField || !yField) {
    console.log(chalk.yellow('⚠️  無法找到適合的 X/Y 軸映射'))
    return
  }
  
  // 選擇圖表類型
  const chartType = options.chart || (charts.length > 0 ? charts[0].type : 'bar-chart')
  
  console.log(chalk.green('✅ 自動偵測結果:'))
  console.log(`  📊 圖表類型: ${chartType}`)
  console.log(`  📈 X 軸: ${xField.field} (${xField.type}, 信心度: ${Math.round(xField.confidence * 100)}%)`)
  console.log(`  📊 Y 軸: ${yField.field} (${yField.type}, 信心度: ${Math.round(yField.confidence * 100)}%)`)
  
  // 生成組件代碼
  const componentCode = generateComponentCode(chartType, {
    xKey: xField.field,
    yKey: yField.field,
    data: parsedData.data.slice(0, 5) // 只顯示前5筆作為範例
  })
  
  if (options.output) {
    fs.writeFileSync(options.output, componentCode)
    console.log(chalk.green(`✅ 組件代碼已保存到: ${options.output}`))
  } else {
    console.log(chalk.blue('\n📝 生成的組件代碼:'))
    console.log(chalk.gray(componentCode))
  }
}

/**
 * 互動模式
 */
async function handleInteractiveMode(parsedData: ParsedData, options: ImportOptions) {
  console.log(chalk.blue('\n🎯 互動模式'))
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  try {
    // 顯示建議
    displaySuggestions(parsedData)
    
    // 選擇圖表類型
    const chartType = await askQuestion(rl, `\n請選擇圖表類型 [${parsedData.suggestions.charts.map(c => c.type).join('/')}]: `) || 
                     (parsedData.suggestions.charts[0]?.type) || 'bar-chart'
    
    // 選擇 X 軸
    const xOptions = parsedData.suggestions.mapping.filter(m => m.suggested === 'x' || m.type === 'date' || m.type === 'string')
    const xField = await selectField(rl, 'X 軸', xOptions) || xOptions[0]?.field
    
    // 選擇 Y 軸  
    const yOptions = parsedData.suggestions.mapping.filter(m => m.suggested === 'y' || m.type === 'number')
    const yField = await selectField(rl, 'Y 軸', yOptions) || yOptions[0]?.field
    
    if (!xField || !yField) {
      console.log(chalk.red('❌ 必須選擇 X 軸和 Y 軸'))
      return
    }
    
    console.log(chalk.green('\n✅ 配置完成:'))
    console.log(`  📊 圖表類型: ${chartType}`)
    console.log(`  📈 X 軸: ${xField}`)
    console.log(`  📊 Y 軸: ${yField}`)
    
    // 生成組件代碼
    const componentCode = generateComponentCode(chartType, {
      xKey: xField,
      yKey: yField,
      data: parsedData.data.slice(0, 5) // 只顯示前5筆作為範例
    })
    
    if (options.output) {
      fs.writeFileSync(options.output, componentCode)
      console.log(chalk.green(`✅ 組件代碼已保存到: ${options.output}`))
    } else {
      console.log(chalk.blue('\n📝 生成的組件代碼:'))
      console.log(chalk.gray(componentCode))
    }
    
  } finally {
    rl.close()
  }
}

/**
 * 顯示建議
 */
function displaySuggestions(parsedData: ParsedData) {
  const { mapping, charts } = parsedData.suggestions
  
  console.log(chalk.blue('\n💡 建議的欄位映射:'))
  mapping.slice(0, 5).forEach(m => {
    const confidence = Math.round(m.confidence * 100)
    const icon = getFieldIcon(m.suggested)
    console.log(`  ${icon} ${m.field} → ${m.suggested} (${m.type}, ${confidence}%)`)
  })
  
  if (charts.length > 0) {
    console.log(chalk.blue('\n📊 建議的圖表類型:'))
    charts.slice(0, 3).forEach(c => {
      const confidence = Math.round(c.confidence * 100)
      console.log(`  📈 ${c.type} (${confidence}%) - ${c.reason}`)
    })
  }
}

/**
 * 輔助函數
 */
function getFieldIcon(suggested: string): string {
  switch (suggested) {
    case 'x': return '📈'
    case 'y': return '📊'
    case 'color': return '🎨'
    case 'size': return '📏'
    default: return '📝'
  }
}

function hasNestedStructure(data: any[]): boolean {
  if (data.length === 0) return false
  const firstRow = data[0]
  return Object.values(firstRow).some(value => 
    value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)
  )
}

function hasTimeSeriesData(data: any[]): boolean {
  if (data.length === 0) return false
  const firstRow = data[0]
  return Object.keys(firstRow).some(key => {
    const values = data.slice(0, 10).map(row => row[key])
    return values.some(value => 
      value instanceof Date || 
      (typeof value === 'string' && !isNaN(Date.parse(value)))
    )
  })
}

function isWideFormat(data: any[]): boolean {
  if (data.length === 0) return false
  const firstRow = data[0]
  const fields = Object.keys(firstRow)
  const numericFields = fields.filter(field => {
    const values = data.slice(0, 5).map(row => row[field])
    return values.every(v => typeof v === 'number' || !isNaN(Number(v)))
  })
  return numericFields.length > fields.length * 0.5 && numericFields.length > 3
}

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve)
  })
}

async function selectField(rl: readline.Interface, axisName: string, options: SuggestedMapping[]): Promise<string | null> {
  if (options.length === 0) return null
  
  console.log(`\n${axisName} 軸候選欄位:`)
  options.forEach((option, index) => {
    const confidence = Math.round(option.confidence * 100)
    console.log(`  ${index + 1}. ${option.field} (${option.type}, ${confidence}%)`)
  })
  
  const answer = await askQuestion(rl, `請選擇 ${axisName} 軸欄位 [1-${options.length}]: `)
  const index = parseInt(answer) - 1
  
  if (index >= 0 && index < options.length) {
    return options[index].field
  }
  
  return options[0]?.field || null
}

function generateComponentCode(chartType: string, config: any): string {
  const componentName = chartType.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('')
  
  return `import { ${componentName} } from '@/components/ui/${chartType}'

const sampleData = ${JSON.stringify(config.data, null, 2)}

export function MyChart() {
  return (
    <${componentName}
      data={sampleData}
      xKey="${config.xKey}"
      yKey="${config.yKey}"
      width={600}
      height={400}
    />
  )
}`
}