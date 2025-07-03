#!/usr/bin/env node

const fs = require('fs').promises
const fsSync = require('fs')
const path = require('path')

async function validateRegistry() {
  try {
    console.log('🔍 開始驗證 Registry...')
    
    const registryPath = path.join(__dirname, '../registry')
    const indexPath = path.join(registryPath, 'index.json')
    const schemaPath = path.join(registryPath, 'schema.json')
    
    // 1. 載入 Schema (如果有 ajv 的話)
    let validate = null
    try {
      const Ajv = require('ajv')
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'))
      const ajv = new Ajv({ allErrors: true })
      validate = ajv.compile(schema)
      console.log('✅ JSON Schema 載入成功')
    } catch (error) {
      console.log('⚠️  無法載入 AJV，跳過 Schema 驗證 (可執行: npm install ajv)')
    }
    
    // 2. 驗證主索引
    const index = JSON.parse(await fs.readFile(indexPath, 'utf8'))
    
    if (validate) {
      const isValid = validate(index)
      if (!isValid) {
        console.error('❌ 主索引驗證失敗:')
        console.error(validate.errors)
        process.exit(1)
      }
      console.log('✅ 主索引格式驗證通過')
    } else {
      console.log('✅ 主索引 JSON 格式正確')
    }
    
    // 3. 驗證各組件配置
    console.log(`📊 找到 ${index.components.length} 個組件`)
    
    for (const component of index.components) {
      await validateComponent(component, registryPath)
    }
    
    // 4. 檢查檔案完整性
    await checkFileIntegrity(index.components, registryPath)
    
    console.log('✅ Registry 驗證通過!')
    
  } catch (error) {
    console.error('❌ 驗證過程發生錯誤:', error.message)
    process.exit(1)
  }
}

async function validateComponent(component, registryPath) {
  const configPath = path.join(registryPath, 'components', component.name, 'config.json')
  
  if (!fsSync.existsSync(configPath)) {
    throw new Error(`組件配置檔案不存在: ${configPath}`)
  }
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
  
  // 驗證必要欄位
  if (config.name !== component.name) {
    throw new Error(`組件名稱不一致: ${component.name}`)
  }
  
  // 檢查檔案是否存在
  const componentDir = path.join(registryPath, 'components', component.name)
  for (const file of component.files) {
    const filePath = path.join(componentDir, file)
    if (!fsSync.existsSync(filePath)) {
      throw new Error(`組件檔案不存在: ${filePath}`)
    }
  }
  
  console.log(`✅ 組件 ${component.name} 驗證通過`)
}

async function checkFileIntegrity(components, registryPath) {
  console.log('🔍 檢查檔案完整性...')
  
  // 檢查工具函數
  const utilsPath = path.join(registryPath, 'utils')
  const requiredUtils = ['cn.ts', 'data-detector.ts']
  
  for (const utilFile of requiredUtils) {
    const filePath = path.join(utilsPath, utilFile)
    if (!fsSync.existsSync(filePath)) {
      throw new Error(`工具函數檔案不存在: ${filePath}`)
    }
  }
  
  // 檢查型別定義
  const typesPath = path.join(registryPath, 'types', 'index.ts')
  if (!fsSync.existsSync(typesPath)) {
    throw new Error(`型別定義檔案不存在: ${typesPath}`)
  }
  
  console.log('✅ 所有檔案完整性檢查通過')
}

if (require.main === module) {
  validateRegistry()
}

module.exports = { validateRegistry }