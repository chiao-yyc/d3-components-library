import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

export async function validateProject() {
  // 檢查專案環境
  const packageJsonPath = path.resolve('./package.json')
  
  if (!await fs.pathExists(packageJsonPath)) {
    throw new Error('當前目錄不是 Node.js 專案目錄')
  }
  
  // 讀取配置
  const packageJson = await fs.readJSON(packageJsonPath)
  
  if (!packageJson.dependencies?.react && !packageJson.devDependencies?.react) {
    console.warn(chalk.yellow('⚠  未找到 React 依賴'))
    console.warn(chalk.yellow('    請確保已安裝 React'))
  }
  
  // 檢查 TypeScript 支援
  const hasTypeScript = 
    packageJson.dependencies?.typescript ||
    packageJson.devDependencies?.typescript ||
    await fs.pathExists('./tsconfig.json')
  
  if (!hasTypeScript) {
    console.warn(chalk.yellow('⚠  未找到 TypeScript'))
    console.warn(chalk.yellow('    建議使用 TypeScript 以獲得更好的開發體驗'))
  }
}

export async function updateProjectConfig(
  component: { name: string; version: string },
  variant: string
) {
  const configPath = path.resolve('./d3-components.json')
  
  let config: {
    $schema: string;
    components: Array<{
      name: string;
      variant: string;
      version: string;
      installedAt: string;
    }>;
  } = {
    $schema: 'https://registry.d3-components.com/schema.json',
    components: []
  }
  
  if (await fs.pathExists(configPath)) {
    config = await fs.readJSON(configPath)
  }
  
  // 檢查是否已存在
  const existingIndex = config.components.findIndex((c) => c.name === component.name)
  
  const componentEntry = {
    name: component.name,
    variant,
    version: component.version,
    installedAt: new Date().toISOString()
  }
  
  if (existingIndex >= 0) {
    config.components[existingIndex] = componentEntry
  } else {
    config.components.push(componentEntry)
  }
  
  await fs.writeJSON(configPath, config, { spaces: 2 })
}

type InstalledComponent = {
  name: string;
  variant: string;
  version: string;
  installedAt: string;
}

export async function getInstalledComponents(): Promise<InstalledComponent[]> {
  const configPath = path.resolve('./d3-components.json')
  
  if (!await fs.pathExists(configPath)) {
    return []
  }
  
  const config = await fs.readJSON(configPath)
  return config.components || []
}

export async function isComponentInstalled(name: string): Promise<boolean> {
  const installed = await getInstalledComponents()
  return installed.some((c) => c.name === name)
}

export async function processTemplateFiles(targetDir: string, variables: Record<string, string>) {
  // 處理模板檔案
  const files = await fs.readdir(targetDir, { recursive: true })
  
  for (const file of files) {
    const filePath = path.join(targetDir, file as string)
    const stat = await fs.stat(filePath)
    
    if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
      let content = await fs.readFile(filePath, 'utf8')
      
      // 替換模板變數
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        content = content.replace(regex, String(value))
      })
      
      await fs.writeFile(filePath, content, 'utf8')
    }
  }
}