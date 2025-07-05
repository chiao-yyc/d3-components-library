import fs from 'fs-extra'
import path from 'path'
import { TemplateContext } from '../types'

/**
 * U!ŠxÿÛ
 */
export async function processTemplateFiles(targetDir: string, context: TemplateContext): Promise<void> {
  try {
    const files = await fs.readdir(targetDir, { recursive: true })
    
    for (const file of files) {
      const filePath = path.join(targetDir, file as string)
      const stat = await fs.stat(filePath)
      
      if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
        let content = await fs.readFile(filePath, 'utf8')
        
        // ÿÛ!Šx
        Object.entries(context).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g')
          content = content.replace(regex, String(value))
        })
        
        await fs.writeFile(filePath, content, 'utf8')
      }
    }
  } catch (error) {
    console.warn('!U1W:', error)
  }
}

/**
 * Dö!g¹
 */
export function generateComponentTemplate(componentName: string, variant: string): string {
  const className = componentName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
  
  return `import React from 'react'
import { ${className}Props } from './types'

export function ${className}({ ...props }: ${className}Props) {
  // Döæ\
  return <div>{{componentName}} - {{variant}}</div>
}

export default ${className}
`
}