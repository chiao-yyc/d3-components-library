import fs from 'fs-extra'
import path from 'path'
import { CacheItem } from '../types'

const CACHE_DIR = path.join(process.cwd(), '.d3-components-cache')

export async function getCachedComponent(name: string): Promise<CacheItem | null> {
  try {
    const cachePath = path.join(CACHE_DIR, `${name}.json`)
    
    if (await fs.pathExists(cachePath)) {
      const cached = await fs.readJSON(cachePath)
      return cached
    }
    
    return null
  } catch {
    return null
  }
}

export async function setCachedComponent(name: string, data: CacheItem): Promise<void> {
  try {
    await fs.ensureDir(CACHE_DIR)
    const cachePath = path.join(CACHE_DIR, `${name}.json`)
    await fs.writeJSON(cachePath, data)
  } catch {
    // ýeëÖ/¤
  }
}

export async function clearCache(): Promise<void> {
  try {
    if (await fs.pathExists(CACHE_DIR)) {
      await fs.remove(CACHE_DIR)
    }
  } catch {
    // ýe/¤
  }
}