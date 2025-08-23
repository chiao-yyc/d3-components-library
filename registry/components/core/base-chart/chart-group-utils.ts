import * as d3 from 'd3'

export interface GroupDataItem {
  [key: string]: any
  group?: string
}

export interface GroupConfig {
  groupKey: string
  colorScheme?: string[]
  defaultColors?: string[]
}

export interface GroupProcessorResult<T = any> {
  groups: string[]
  groupedData: Map<string, T[]>
  colorScale: d3.ScaleOrdinal<string, string>
  totalCount: number
}

export class GroupDataProcessor<T extends GroupDataItem = GroupDataItem> {
  private config: GroupConfig
  
  constructor(config: GroupConfig) {
    this.config = config
  }

  processGroupData(data: T[]): GroupProcessorResult<T> {
    const groups = this.extractGroups(data)
    const groupedData = this.groupData(data, groups)
    const colorScale = this.createColorScale(groups)
    
    return {
      groups,
      groupedData,
      colorScale,
      totalCount: data.length
    }
  }

  private extractGroups(data: T[]): string[] {
    const groupSet = new Set<string>()
    
    data.forEach(item => {
      const groupValue = item[this.config.groupKey]
      if (groupValue !== undefined && groupValue !== null) {
        groupSet.add(String(groupValue))
      }
    })
    
    return Array.from(groupSet).sort()
  }

  private groupData(data: T[], groups: string[]): Map<string, T[]> {
    const groupedData = new Map<string, T[]>()
    
    groups.forEach(group => {
      groupedData.set(group, [])
    })
    
    data.forEach(item => {
      const groupValue = String(item[this.config.groupKey] || '')
      if (groupedData.has(groupValue)) {
        groupedData.get(groupValue)!.push(item)
      }
    })
    
    return groupedData
  }

  private createColorScale(groups: string[]): d3.ScaleOrdinal<string, string> {
    const colors = this.config.colorScheme || this.config.defaultColors || [
      "#440154ff", "#21908dff", "#fde725ff", "#31688eff", "#35b779ff",
      "#8e0152ff", "#276419ff", "#762a83ff", "#5aae61ff", "#c51b7dff"
    ]
    
    return d3.scaleOrdinal<string, string>()
      .domain(groups)
      .range(colors)
  }

  getGroupColor(group: string, colorScale: d3.ScaleOrdinal<string, string>): string {
    return colorScale(group)
  }

  getGroupStats(groupedData: Map<string, T[]>): Map<string, { count: number; percentage: number }> {
    const totalCount = Array.from(groupedData.values()).reduce((sum, items) => sum + items.length, 0)
    const stats = new Map<string, { count: number; percentage: number }>()
    
    groupedData.forEach((items, group) => {
      const count = items.length
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0
      stats.set(group, { count, percentage })
    })
    
    return stats
  }
}

export interface GroupHighlightManager {
  highlightGroup: (group: string | null) => void
  resetHighlight: () => void
  isGroupHighlighted: (group: string) => boolean
  getHighlightedGroup: () => string | null
}

export function createGroupHighlightManager(
  container: d3.Selection<any, any, any, any>,
  config: {
    highlightClass?: string
    dimClass?: string
    transitionDuration?: number
  } = {}
): GroupHighlightManager {
  const {
    highlightClass = 'group-highlighted',
    dimClass = 'group-dimmed', 
    transitionDuration = 200
  } = config

  let highlightedGroup: string | null = null

  const highlightGroup = (group: string | null) => {
    highlightedGroup = group
    
    if (group === null) {
      resetHighlight()
      return
    }

    container.selectAll('[data-group]')
      .transition()
      .duration(transitionDuration)
      .style('opacity', (d: any) => {
        const itemGroup = d3.select(d3.event?.target || container.node()).attr('data-group')
        return itemGroup === group ? 1 : 0.3
      })
      .attr('r', (d: any) => {
        const itemGroup = d3.select(d3.event?.target || container.node()).attr('data-group')
        return itemGroup === group ? 7 : 3
      })
  }

  const resetHighlight = () => {
    highlightedGroup = null
    
    container.selectAll('[data-group]')
      .transition()
      .duration(transitionDuration)
      .style('opacity', 1)
      .attr('r', 5)
  }

  const isGroupHighlighted = (group: string): boolean => {
    return highlightedGroup === group
  }

  const getHighlightedGroup = (): string | null => {
    return highlightedGroup
  }

  return {
    highlightGroup,
    resetHighlight,
    isGroupHighlighted,
    getHighlightedGroup
  }
}

export interface GroupFilterManager<T = any> {
  filterByGroups: (groups: string[]) => T[]
  getActiveGroups: () => string[]
  setActiveGroups: (groups: string[]) => void
  toggleGroup: (group: string) => void
  resetFilter: () => void
}

export function createGroupFilterManager<T extends GroupDataItem>(
  originalData: T[],
  groupKey: string
): GroupFilterManager<T> {
  let activeGroups: string[] = []
  const allGroups = Array.from(new Set(originalData.map(item => String(item[groupKey] || ''))))
  
  activeGroups = [...allGroups]

  const filterByGroups = (groups: string[]): T[] => {
    if (groups.length === 0) return []
    
    return originalData.filter(item => {
      const itemGroup = String(item[groupKey] || '')
      return groups.includes(itemGroup)
    })
  }

  const getActiveGroups = (): string[] => {
    return [...activeGroups]
  }

  const setActiveGroups = (groups: string[]): void => {
    activeGroups = groups.filter(group => allGroups.includes(group))
  }

  const toggleGroup = (group: string): void => {
    if (activeGroups.includes(group)) {
      activeGroups = activeGroups.filter(g => g !== group)
    } else {
      activeGroups = [...activeGroups, group]
    }
  }

  const resetFilter = (): void => {
    activeGroups = [...allGroups]
  }

  return {
    filterByGroups,
    getActiveGroups,
    setActiveGroups,
    toggleGroup,
    resetFilter
  }
}

export function createGroupLegend(
  container: d3.Selection<any, any, any, any>,
  groups: string[],
  colorScale: d3.ScaleOrdinal<string, string>,
  config: {
    position?: { x: number; y: number }
    itemSpacing?: number
    itemSize?: number
    fontSize?: number
    onClick?: (group: string) => void
  } = {}
): d3.Selection<any, any, any, any> {
  const {
    position = { x: 10, y: 10 },
    itemSpacing = 20,
    itemSize = 10,
    fontSize = 12,
    onClick
  } = config

  const legend = container
    .append('g')
    .attr('class', 'group-legend')
    .attr('transform', `translate(${position.x}, ${position.y})`)

  const legendItems = legend
    .selectAll('.legend-item')
    .data(groups)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * itemSpacing})`)
    .style('cursor', onClick ? 'pointer' : 'default')

  legendItems
    .append('circle')
    .attr('r', itemSize / 2)
    .attr('cx', itemSize / 2)
    .attr('cy', itemSize / 2)
    .style('fill', d => colorScale(d))

  legendItems
    .append('text')
    .attr('x', itemSize + 5)
    .attr('y', itemSize / 2)
    .attr('dy', '0.35em')
    .style('font-size', `${fontSize}px`)
    .style('fill', 'currentColor')
    .text(d => d)

  if (onClick) {
    legendItems.on('click', (event, d) => onClick(d))
  }

  return legend
}