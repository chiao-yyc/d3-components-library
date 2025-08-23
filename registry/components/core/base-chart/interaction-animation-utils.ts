import * as d3 from 'd3'

export interface AnimationConfig {
  duration?: number
  delay?: number
  ease?: d3.EasingFunction
}

export interface HighlightAnimationConfig extends AnimationConfig {
  highlightOpacity?: number
  dimOpacity?: number
  highlightScale?: number
  normalScale?: number
}

export interface TransitionManager {
  animate: (selection: d3.Selection<any, any, any, any>, config?: AnimationConfig) => d3.Transition<any, any, any, any>
  highlightElements: (selection: d3.Selection<any, any, any, any>, predicate: (d: any) => boolean, config?: HighlightAnimationConfig) => void
  resetHighlight: (selection: d3.Selection<any, any, any, any>, config?: AnimationConfig) => void
  fadeIn: (selection: d3.Selection<any, any, any, any>, config?: AnimationConfig) => void
  fadeOut: (selection: d3.Selection<any, any, any, any>, config?: AnimationConfig) => void
}

export function createTransitionManager(defaultConfig: AnimationConfig = {}): TransitionManager {
  const {
    duration: defaultDuration = 200,
    delay: defaultDelay = 0,
    ease: defaultEase = d3.easeQuadOut
  } = defaultConfig

  const animate = (
    selection: d3.Selection<any, any, any, any>, 
    config: AnimationConfig = {}
  ): d3.Transition<any, any, any, any> => {
    const {
      duration = defaultDuration,
      delay = defaultDelay,
      ease = defaultEase
    } = config

    return selection
      .transition()
      .duration(duration)
      .delay(delay)
      .ease(ease)
  }

  const highlightElements = (
    selection: d3.Selection<any, any, any, any>,
    predicate: (d: any) => boolean,
    config: HighlightAnimationConfig = {}
  ): void => {
    const {
      highlightOpacity = 1,
      dimOpacity = 0.3,
      highlightScale = 1.4,
      normalScale = 1,
      ...animationConfig
    } = config

    const transition = animate(selection, animationConfig)

    transition
      .style('opacity', (d: any) => predicate(d) ? highlightOpacity : dimOpacity)
      .attr('transform', function(d: any) {
        const currentTransform = d3.select(this).attr('transform') || ''
        const scale = predicate(d) ? highlightScale : normalScale
        
        const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
        if (scaleMatch) {
          return currentTransform.replace(/scale\([^)]+\)/, `scale(${scale})`)
        } else {
          return `${currentTransform} scale(${scale})`
        }
      })
  }

  const resetHighlight = (
    selection: d3.Selection<any, any, any, any>,
    config: AnimationConfig = {}
  ): void => {
    const transition = animate(selection, config)

    transition
      .style('opacity', 1)
      .attr('transform', function() {
        const currentTransform = d3.select(this).attr('transform') || ''
        return currentTransform.replace(/scale\([^)]+\)/g, '').trim()
      })
  }

  const fadeIn = (
    selection: d3.Selection<any, any, any, any>,
    config: AnimationConfig = {}
  ): void => {
    selection.style('opacity', 0)
    animate(selection, config).style('opacity', 1)
  }

  const fadeOut = (
    selection: d3.Selection<any, any, any, any>,
    config: AnimationConfig = {}
  ): void => {
    animate(selection, config).style('opacity', 0)
  }

  return {
    animate,
    highlightElements,
    resetHighlight,
    fadeIn,
    fadeOut
  }
}

export interface HoverEffectConfig extends HighlightAnimationConfig {
  hoverClass?: string
  activeClass?: string
  groupSelector?: string
  onHover?: (group: string | null, data?: any, element?: Element) => void
  onLeave?: (group: string | null, data?: any, element?: Element) => void
}

export interface HoverEffectManager {
  enableHover: (selection: d3.Selection<any, any, any, any>) => void
  disableHover: (selection: d3.Selection<any, any, any, any>) => void
}

export function createHoverEffectManager(
  config: HoverEffectConfig = {},
  transitionManager: TransitionManager
): HoverEffectManager {
  const {
    hoverClass = 'chart-element-hover',
    activeClass = 'chart-element-active',
    groupSelector = '[data-group]',
    onHover: externalOnHover,
    onLeave: externalOnLeave,
    ...animationConfig
  } = config

  let currentHoveredElement: Element | null = null

  const onHover = (event: MouseEvent, data: any) => {
    const element = event.currentTarget as Element
    const selection = d3.select(element)
    
    currentHoveredElement = element
    
    selection.classed(hoverClass, true)
    
    let group: string | null = null
    if (groupSelector) {
      group = selection.attr('data-group')
      if (group) {
        const allElements = d3.selectAll(groupSelector)
        transitionManager.highlightElements(
          allElements,
          (d: any) => d3.select(allElements.nodes().find(node => 
            d3.select(node).datum() === d
          ) as Element).attr('data-group') === group,
          animationConfig
        )
      }
    }

    if (externalOnHover) {
      externalOnHover(group, data, element)
    }
  }

  const onLeave = (event: MouseEvent, data: any) => {
    const element = event.currentTarget as Element
    const selection = d3.select(element)
    
    currentHoveredElement = null
    
    selection.classed(hoverClass, false)
    
    if (groupSelector) {
      const allElements = d3.selectAll(groupSelector)
      transitionManager.resetHighlight(allElements, animationConfig)
    }

    if (externalOnLeave) {
      externalOnLeave(null, data, element)
    }
  }

  const enableHover = (selection: d3.Selection<any, any, any, any>) => {
    selection
      .on('mouseover', onHover)
      .on('mouseleave', onLeave)
  }

  const disableHover = (selection: d3.Selection<any, any, any, any>) => {
    selection
      .on('mouseover', null)
      .on('mouseleave', null)
      .classed(hoverClass, false)
      .classed(activeClass, false)
  }

  return {
    enableHover,
    disableHover
  }
}

export interface ClickEffectConfig extends AnimationConfig {
  clickClass?: string
  multiSelect?: boolean
  groupSelector?: string
  onSelect?: (group: string, isSelected: boolean, data?: any, element?: Element) => void
}

export interface ClickEffectManager {
  enableClick: (selection: d3.Selection<any, any, any, any>) => void
  disableClick: (selection: d3.Selection<any, any, any, any>) => void
  getSelectedElements: () => Element[]
  clearSelection: () => void
}

export function createClickEffectManager(
  config: ClickEffectConfig = {},
  transitionManager: TransitionManager
): ClickEffectManager {
  const {
    clickClass = 'chart-element-selected',
    multiSelect = false,
    groupSelector = '[data-group]',
    onSelect: externalOnSelect,
    ...animationConfig
  } = config

  const selectedElements = new Set<Element>()

  const onClick = (event: MouseEvent, data: any) => {
    const element = event.currentTarget as Element
    const selection = d3.select(element)
    const isSelected = selectedElements.has(element)

    if (!multiSelect) {
      clearSelection()
    }

    if (isSelected) {
      selectedElements.delete(element)
      selection.classed(clickClass, false)
    } else {
      selectedElements.add(element)
      selection.classed(clickClass, true)
    }

    let group: string | null = null
    if (groupSelector) {
      group = selection.attr('data-group')
      if (group && !isSelected) {
        const allElements = d3.selectAll(groupSelector)
        transitionManager.highlightElements(
          allElements,
          (d: any) => {
            const node = allElements.nodes().find(node => d3.select(node).datum() === d) as Element
            return selectedElements.has(node) || d3.select(node).attr('data-group') === group
          },
          {
            ...animationConfig,
            highlightOpacity: 1,
            dimOpacity: 0.5
          }
        )
      }
    }

    if (externalOnSelect && group) {
      externalOnSelect(group, !isSelected, data, element)
    }

    event.stopPropagation()
  }

  const enableClick = (selection: d3.Selection<any, any, any, any>) => {
    selection
      .style('cursor', 'pointer')
      .on('click', onClick)
  }

  const disableClick = (selection: d3.Selection<any, any, any, any>) => {
    selection
      .style('cursor', null)
      .on('click', null)
      .classed(clickClass, false)
  }

  const getSelectedElements = (): Element[] => {
    return Array.from(selectedElements)
  }

  const clearSelection = () => {
    selectedElements.forEach(element => {
      d3.select(element).classed(clickClass, false)
    })
    selectedElements.clear()

    if (groupSelector) {
      const allElements = d3.selectAll(groupSelector)
      transitionManager.resetHighlight(allElements, animationConfig)
    }
  }

  return {
    enableClick,
    disableClick,
    getSelectedElements,
    clearSelection
  }
}

export interface InteractionComposer {
  hover: HoverEffectManager
  click: ClickEffectManager
  transition: TransitionManager
  enableInteractions: (selection: d3.Selection<any, any, any, any>) => void
  disableInteractions: (selection: d3.Selection<any, any, any, any>) => void
}

export function createInteractionComposer(
  hoverConfig: HoverEffectConfig = {},
  clickConfig: ClickEffectConfig = {},
  transitionConfig: AnimationConfig = {}
): InteractionComposer {
  const transitionManager = createTransitionManager(transitionConfig)
  const hoverManager = createHoverEffectManager(hoverConfig, transitionManager)
  const clickManager = createClickEffectManager(clickConfig, transitionManager)

  const enableInteractions = (selection: d3.Selection<any, any, any, any>) => {
    hoverManager.enableHover(selection)
    clickManager.enableClick(selection)
  }

  const disableInteractions = (selection: d3.Selection<any, any, any, any>) => {
    hoverManager.disableHover(selection)
    clickManager.disableClick(selection)
  }

  return {
    hover: hoverManager,
    click: clickManager,
    transition: transitionManager,
    enableInteractions,
    disableInteractions
  }
}