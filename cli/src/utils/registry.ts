import fs from 'fs-extra'
import path from 'path'

// Registry 配置
// const REGISTRY_URL = process.env.D3_COMPONENTS_REGISTRY || 'https://registry.d3-components.com'
const LOCAL_REGISTRY_PATH = path.resolve(process.cwd(), 'registry')

export interface ComponentConfig {
  name: string
  description: string
  version: string
  tags: string[]
  variants: string[]
  dependencies: string[]
  category: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  lastUpdated: string
  files: string[]
  demo?: string
  docs?: string
  // Extended configuration from component config.json
  displayName?: string
  peerDependencies?: Record<string, string>
  props?: Record<string, ComponentProp>
  examples?: ComponentExample[]
  customization?: ComponentCustomization
  installation?: ComponentInstallation
}

interface ComponentProp {
  type: string
  required?: boolean
  default?: any
  description: string
}

interface ComponentExample {
  name: string
  description: string
  code: string
}

interface ComponentCustomization {
  cssVariables?: string[]
  themes?: string[]
  responsive?: boolean
  accessibility?: boolean
}

interface ComponentInstallation {
  command: string
  manualSteps: string[]
}

export async function listAllComponents(): Promise<ComponentConfig[]> {
  try {
    // 優先使用本地 registry（開發模式）
    const localIndexPath = path.join(LOCAL_REGISTRY_PATH, 'index.json')
    
    
    if (await fs.pathExists(localIndexPath)) {
      const indexData = await fs.readJSON(localIndexPath)
      return indexData.components || []
    }
    
    // 如果沒有本地 registry，嘗試從遠端獲取
    // TODO: 實作遠端 registry 獲取
    throw new Error('遠端 registry 功能尚未實作')
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`無法獲取組件列表: ${error.message}`)
    }
    throw error
  }
}

export async function fetchComponentConfig(name: string): Promise<ComponentConfig | null> {
  try {
    // 1. 檢查本地 Registry
    if (await fs.pathExists(LOCAL_REGISTRY_PATH)) {
      return await fetchFromLocal(name)
    }
    
    // 2. 回退到遠端 Registry (未來功能)
    console.warn('⚠️  遠端 Registry 功能尚未實作')
    return null
    
  } catch (error) {
    throw new Error(`無法獲取組件配置 ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function fetchFromLocal(name: string): Promise<ComponentConfig | null> {
  const indexPath = path.join(LOCAL_REGISTRY_PATH, 'index.json')
  
  if (!await fs.pathExists(indexPath)) {
    throw new Error('無法獲取組件列表: 本地 registry/index.json 不存在')
  }
  
  const index = await fs.readJSON(indexPath)
  const component = index.components.find((c: any) => c.name === name)
  
  if (!component) {
    return null
  }
  
  // 讀取詳細配置
  const configPath = path.join(LOCAL_REGISTRY_PATH, 'components', name, 'config.json')
  if (await fs.pathExists(configPath)) {
    const detailedConfig = await fs.readJSON(configPath)
    return { ...component, ...detailedConfig }
  }
  
  return component
}

export async function downloadComponentFiles(
  componentName: string,
  variant: string,
  targetDir: string
): Promise<string[]> {
  const sourceDir = path.join(LOCAL_REGISTRY_PATH, 'components', componentName)
  const copiedFiles: string[] = []
  
  try {
    // 獲取組件配置
    const config = await fetchComponentConfig(componentName)
    if (!config) {
      throw new Error(`組件不存在: ${componentName}`)
    }
    
    // 確保目標目錄存在
    await fs.ensureDir(targetDir)
    
    // 獲取要複製的檔案清單 (根據 variant 決定或使用預設檔案列表)
    let filesToCopy = config.files
    
    if (config.variants && Array.isArray(config.variants)) {
      // 檢查是否有詳細的 variant 配置
      const detailedConfig = await fs.readJSON(path.join(sourceDir, 'config.json'))
      if (detailedConfig.variants && typeof detailedConfig.variants === 'object') {
        const variantConfig = detailedConfig.variants[variant]
        if (variantConfig && variantConfig.files) {
          filesToCopy = variantConfig.files
        }
      }
    }
    
    // 複製組件檔案
    for (const fileName of filesToCopy) {
      const sourcePath = path.join(sourceDir, fileName)
      const targetPath = path.join(targetDir, fileName)
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath)
        copiedFiles.push(targetPath)
      } else {
        console.warn(`⚠️  檔案不存在，跳過: ${fileName}`)
      }
    }
    
    // 複製工具函數 (如果需要)
    await copyUtilFiles(targetDir, config)
    
    return copiedFiles
    
  } catch (error) {
    throw new Error(`下載組件檔案失敗: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function copyUtilFiles(targetDir: string, config: ComponentConfig) {
  // 檢查是否需要複製 utils 檔案，根據組件依賴決定
  let utilsNeeded = ['cn.ts']
  
  // 如果組件有資料處理需求，也複製 data-detector
  if (config.dependencies?.includes('d3') || config.tags?.includes('chart')) {
    utilsNeeded.push('data-detector.ts')
  }
  
  for (const utilFile of utilsNeeded) {
    const sourcePath = path.join(LOCAL_REGISTRY_PATH, 'utils', utilFile)
    const targetPath = path.join(path.dirname(targetDir), 'utils', utilFile)
    
    if (await fs.pathExists(sourcePath)) {
      await fs.ensureDir(path.dirname(targetPath))
      
      // 只有在目標檔案不存在時才複製
      if (!await fs.pathExists(targetPath)) {
        await fs.copy(sourcePath, targetPath)
        console.log(`📄 已複製工具函數: ${utilFile}`)
      }
    }
  }
}