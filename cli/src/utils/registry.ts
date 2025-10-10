import fs from 'fs-extra'
import path from 'path'
import {
  ComponentConfig,
  BaseComponentConfig,
  RegistryIndex
} from '../types'
import { resolveDependencies } from './dependency-resolver'

// Registry 配置
// const REGISTRY_URL = process.env.D3_COMPONENTS_REGISTRY || 'https://registry.d3-components.com'

// 動態尋找 registry 目錄
function findRegistryPath(): string {
  let currentDir = process.cwd()
  
  // 最多向上查找 5 層目錄
  for (let i = 0; i < 5; i++) {
    const registryPath = path.join(currentDir, 'registry')
    if (fs.existsSync(registryPath) && fs.existsSync(path.join(registryPath, 'index.json'))) {
      return registryPath
    }
    
    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) break // 已到根目錄
    currentDir = parentDir
  }
  
  // 如果找不到，回退到當前目錄下的 registry
  return path.resolve(process.cwd(), 'registry')
}

const LOCAL_REGISTRY_PATH = findRegistryPath()

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

  const index: RegistryIndex = await fs.readJSON(indexPath)
  const baseComponent = index.components.find((c: BaseComponentConfig) => c.name === name)

  // 如果在 index.json 中找不到，嘗試直接從檔案系統讀取（用於 core 組件）
  if (!baseComponent) {
    // 嘗試直接讀取組件的 config.json
    const directConfigPath = path.join(LOCAL_REGISTRY_PATH, 'components', name, 'config.json')
    if (await fs.pathExists(directConfigPath)) {
      const detailedConfig: any = await fs.readJSON(directConfigPath)

      // 處理 files 欄位：可能是字串數組或對象數組
      let filesArray: string[] = []
      if (detailedConfig.files) {
        if (typeof detailedConfig.files[0] === 'string') {
          // 已經是字串數組
          filesArray = detailedConfig.files
        } else {
          // 是對象數組，提取 name 屬性
          filesArray = detailedConfig.files.map((f: any) => f.name)
        }
      }

      // 處理 variants 欄位：可能是字串數組或對象數組
      let variantsArray: string[] = ['default']
      if (detailedConfig.variants) {
        if (typeof detailedConfig.variants[0] === 'string') {
          variantsArray = detailedConfig.variants
        } else {
          variantsArray = detailedConfig.variants.map((v: any) => v.name)
        }
      }

      // 構建基本配置
      const config: ComponentConfig = {
        name: detailedConfig.name,
        path: name, // 使用傳入的 name 作為 path
        displayName: detailedConfig.displayName,
        description: detailedConfig.description,
        version: detailedConfig.version,
        tags: detailedConfig.tags || [],
        variants: variantsArray,
        dependencies: detailedConfig.dependencies || [],
        registryDependencies: detailedConfig.registryDependencies,
        category: detailedConfig.category,
        files: filesArray,
        peerDependencies: detailedConfig.peerDependencies,
        props: detailedConfig.props,
        examples: detailedConfig.examples,
        customization: detailedConfig.customization,
        installation: detailedConfig.installation,
        changelog: detailedConfig.changelog
      }

      return config
    }

    return null
  }

  // 使用組件的 path 欄位（如果存在），否則回退到使用 name
  const componentPath = (baseComponent as any).path || name

  // 讀取詳細配置
  const configPath = path.join(LOCAL_REGISTRY_PATH, 'components', componentPath, 'config.json')
  if (await fs.pathExists(configPath)) {
    const detailedConfig: any = await fs.readJSON(configPath)

    // 處理 files 欄位：可能是字串數組或對象數組
    let filesArray: string[] = baseComponent.files
    if (detailedConfig.files) {
      if (typeof detailedConfig.files[0] === 'string') {
        filesArray = detailedConfig.files
      } else {
        filesArray = detailedConfig.files.map((f: any) => f.name)
      }
    }

    // 處理 variants 欄位：可能是字串數組或對象數組
    let variantsArray: string[] = baseComponent.variants
    if (detailedConfig.variants) {
      if (typeof detailedConfig.variants[0] === 'string') {
        variantsArray = detailedConfig.variants
      } else {
        variantsArray = detailedConfig.variants.map((v: any) => v.name)
      }
    }

    // 合併配置
    const mergedConfig: ComponentConfig = {
      ...baseComponent,
      ...detailedConfig,
      path: componentPath, // 確保 path 欄位正確
      files: filesArray,
      variants: variantsArray,
      registryDependencies: detailedConfig.registryDependencies
    }

    return mergedConfig
  }

  return baseComponent
}

/**
 * 下載組件及其所有依賴（自動解析 registryDependencies）
 * @param componentName 組件名稱
 * @param variant 變體名稱
 * @param baseTargetDir 基礎目標目錄（例如 ./src/components）
 * @returns 所有複製的檔案列表
 */
export async function downloadComponentWithDependencies(
  componentName: string,
  variant: string,
  baseTargetDir: string
): Promise<{ files: string[]; dependencies: string[] }> {
  const allCopiedFiles: string[] = []

  try {
    // 1. 解析所有依賴（按依賴順序排列）
    const dependencies = await resolveDependencies(componentName)

    // 2. 依序複製每個組件（依賴在前，主組件在後）
    for (const depName of dependencies) {
      const config = await fetchComponentConfig(depName)
      if (!config) {
        console.warn(`⚠️  跳過不存在的依賴: ${depName}`)
        continue
      }

      // 確定組件類型和目標目錄
      const componentPath = (config as any).path || depName

      // 從 componentPath 提取目錄結構
      const pathParts = componentPath.split('/')
      let targetSubDir: string
      let componentName: string

      if (pathParts.length >= 2) {
        const category = pathParts[0] // basic, core, primitives, statistical 等
        componentName = pathParts[pathParts.length - 1]

        // 映射目錄類別
        if (category === 'core') {
          targetSubDir = 'core'
        } else if (category === 'primitives') {
          targetSubDir = 'primitives'
        } else {
          // basic, statistical, financial 等都放到 ui
          targetSubDir = 'ui'
        }
      } else {
        targetSubDir = 'ui'
        componentName = componentPath
      }

      // 計算目標目錄
      const targetDir = path.join(baseTargetDir, targetSubDir, componentName)

      // 複製組件檔案
      const copiedFiles = await downloadComponentFiles(depName, variant, targetDir)
      allCopiedFiles.push(...copiedFiles)
    }

    return {
      files: allCopiedFiles,
      dependencies
    }

  } catch (error) {
    throw new Error(`下載組件及依賴失敗: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 驗證檔案路徑安全性，防止路徑穿越攻擊
 */
function validateFilePath(fileName: string): void {
  // 防止路徑穿越攻擊
  if (fileName.includes('..') || fileName.startsWith('/') || fileName.includes('\\')) {
    throw new Error(`Invalid file path: ${fileName}`)
  }

  // 防止絕對路徑
  if (path.isAbsolute(fileName)) {
    throw new Error(`Absolute paths are not allowed: ${fileName}`)
  }
}

export async function downloadComponentFiles(
  componentName: string,
  variant: string,
  targetDir: string
): Promise<string[]> {
  const copiedFiles: string[] = []

  try {
    // 獲取組件配置
    const config = await fetchComponentConfig(componentName)
    if (!config) {
      throw new Error(`組件不存在: ${componentName}`)
    }

    // 使用組件的 path 欄位（如果存在），否則回退到使用 componentName
    const componentPath = (config as any).path || componentName

    // 驗證組件路徑安全性
    validateFilePath(componentPath)

    const sourceDir = path.join(LOCAL_REGISTRY_PATH, 'components', componentPath)

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
      // 驗證每個檔案路徑
      validateFilePath(fileName)

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
  const utilsNeeded = ['cn.ts']
  
  // 如果組件有資料處理需求，也複製 data-detector
  if (config.dependencies?.includes('d3') || config.tags?.includes('chart')) {
    utilsNeeded.push('data-detector.ts')
  }
  
  for (const utilFile of utilsNeeded) {
    const sourcePath = path.join(LOCAL_REGISTRY_PATH, 'utils', utilFile)
    // targetDir = ./src/components/core/base-chart
    // 往上三層：components -> src -> project root, 然後進入 src/utils
    const targetPath = path.join(path.dirname(path.dirname(path.dirname(targetDir))), 'utils', utilFile)
    
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