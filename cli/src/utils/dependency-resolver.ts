import { fetchComponentConfig } from './registry'

/**
 * 依賴樹節點
 */
export interface DependencyNode {
  name: string
  path: string
  depth: number
  dependencies: string[]
}

/**
 * 解析組件的所有依賴（遞迴深度優先搜尋）
 * @param componentName 組件名稱
 * @returns 按依賴順序排列的組件名稱列表（依賴在前，組件在後）
 */
export async function resolveDependencies(componentName: string): Promise<string[]> {
  const visited = new Set<string>()
  const result: string[] = []

  async function visit(name: string) {
    // 避免循環依賴
    if (visited.has(name)) {
      return
    }

    visited.add(name)

    // 獲取組件配置
    const config = await fetchComponentConfig(name)
    if (!config) {
      throw new Error(`組件不存在: ${name}`)
    }

    // 先遞迴處理所有依賴
    const registryDeps = (config as any).registryDependencies || []
    for (const dep of registryDeps) {
      await visit(dep)
    }

    // 最後添加當前組件（確保依賴在前）
    result.push(name)
  }

  await visit(componentName)
  return result
}

/**
 * 獲取依賴樹結構（用於顯示）
 * @param componentName 組件名稱
 * @returns 依賴樹節點數組
 */
export async function getDependencyTree(componentName: string): Promise<DependencyNode[]> {
  const tree: DependencyNode[] = []
  const visited = new Set<string>()

  async function buildTree(name: string, depth: number = 0) {
    if (visited.has(name)) {
      return
    }

    visited.add(name)

    const config = await fetchComponentConfig(name)
    if (!config) {
      throw new Error(`組件不存在: ${name}`)
    }

    const registryDeps = (config as any).registryDependencies || []
    const componentPath = (config as any).path || name

    tree.push({
      name,
      path: componentPath,
      depth,
      dependencies: registryDeps
    })

    // 遞迴處理依賴
    for (const dep of registryDeps) {
      await buildTree(dep, depth + 1)
    }
  }

  await buildTree(componentName)
  return tree
}

/**
 * 檢查循環依賴
 * @param componentName 組件名稱
 * @returns 如果存在循環依賴，返回循環路徑；否則返回 null
 */
export async function detectCircularDependency(
  componentName: string
): Promise<string[] | null> {
  const visiting = new Set<string>()
  const visited = new Set<string>()

  async function dfs(name: string, path: string[]): Promise<string[] | null> {
    if (visiting.has(name)) {
      // 找到循環依賴
      return [...path, name]
    }

    if (visited.has(name)) {
      return null
    }

    visiting.add(name)
    path.push(name)

    const config = await fetchComponentConfig(name)
    if (config) {
      const registryDeps = (config as any).registryDependencies || []
      for (const dep of registryDeps) {
        const cycle = await dfs(dep, [...path])
        if (cycle) {
          return cycle
        }
      }
    }

    visiting.delete(name)
    visited.add(name)
    return null
  }

  return await dfs(componentName, [])
}

/**
 * 格式化依賴樹顯示
 * @param tree 依賴樹節點數組
 * @returns 格式化的字串
 */
export function formatDependencyTree(tree: DependencyNode[]): string {
  const lines: string[] = []

  // 按深度分組
  const byDepth = new Map<number, DependencyNode[]>()
  tree.forEach(node => {
    if (!byDepth.has(node.depth)) {
      byDepth.set(node.depth, [])
    }
    byDepth.get(node.depth)!.push(node)
  })

  // 格式化輸出
  tree.forEach((node, index) => {
    const isLast = index === tree.length - 1
    const prefix = node.depth === 0 ? '' : '  '.repeat(node.depth - 1) + (isLast ? '└─' : '├─')
    lines.push(`${prefix} ${node.path}`)
  })

  return lines.join('\n')
}

/**
 * 統計依賴信息
 * @param dependencies 依賴組件列表
 * @returns 統計信息
 */
export interface DependencyStats {
  total: number
  core: number
  ui: number
  primitives: number
}

export async function getDependencyStats(
  dependencies: string[]
): Promise<DependencyStats> {
  const stats: DependencyStats = {
    total: dependencies.length,
    core: 0,
    ui: 0,
    primitives: 0
  }

  for (const dep of dependencies) {
    if (dep.startsWith('core/')) {
      stats.core++
    } else if (dep.startsWith('primitives/')) {
      stats.primitives++
    } else {
      stats.ui++
    }
  }

  return stats
}
