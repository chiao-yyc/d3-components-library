import { ColorPalette } from './types'

// 基礎調色板定義
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  // 藍色系
  blues: {
    name: 'Blues',
    type: 'sequential',
    colors: [
      '#f7fbff',
      '#deebf7', 
      '#c6dbef',
      '#9ecae1',
      '#6baed6',
      '#4292c6',
      '#2171b5',
      '#08519c',
      '#08306b'
    ],
    description: '從淺藍到深藍的漸變色彩'
  },

  // 綠色系
  greens: {
    name: 'Greens',
    type: 'sequential',
    colors: [
      '#f7fcf5',
      '#e5f5e0',
      '#c7e9c0',
      '#a1d99b',
      '#74c476',
      '#41ab5d',
      '#238b45',
      '#006d2c',
      '#00441b'
    ],
    description: '從淺綠到深綠的漸變色彩'
  },

  // 橙色系
  oranges: {
    name: 'Oranges',
    type: 'sequential',
    colors: [
      '#fff5eb',
      '#fee6ce',
      '#fdd0a2',
      '#fdae6b',
      '#fd8d3c',
      '#f16913',
      '#d94801',
      '#a63603',
      '#7f2704'
    ],
    description: '從淺橙到深橙的漸變色彩'
  },

  // 紅色系
  reds: {
    name: 'Reds',
    type: 'sequential',
    colors: [
      '#fff5f0',
      '#fee0d2',
      '#fcbba1',
      '#fc9272',
      '#fb6a4a',
      '#ef3b2c',
      '#cb181d',
      '#a50f15',
      '#67000d'
    ],
    description: '從淺紅到深紅的漸變色彩'
  },

  // 紫色系
  purples: {
    name: 'Purples',
    type: 'sequential',
    colors: [
      '#fcfbfd',
      '#efedf5',
      '#dadaeb',
      '#bcbddc',
      '#9e9ac8',
      '#807dba',
      '#6a51a3',
      '#54278f',
      '#3f007d'
    ],
    description: '從淺紫到深紫的漸變色彩'
  },

  // 灰色系
  greys: {
    name: 'Greys',
    type: 'sequential',
    colors: [
      '#ffffff',
      '#f0f0f0',
      '#d9d9d9',
      '#bdbdbd',
      '#969696',
      '#737373',
      '#525252',
      '#252525',
      '#000000'
    ],
    description: '從白色到黑色的灰階漸變'
  },

  // 彩虹色系
  rainbow: {
    name: 'Rainbow',
    type: 'categorical',
    colors: [
      '#ff0000', // 紅
      '#ff8000', // 橙
      '#ffff00', // 黃
      '#80ff00', // 黃綠
      '#00ff00', // 綠
      '#00ff80', // 青綠
      '#00ffff', // 青
      '#0080ff', // 藍青
      '#0000ff', // 藍
      '#8000ff', // 藍紫
      '#ff00ff', // 紫
      '#ff0080'  // 紫紅
    ],
    description: '彩虹光譜色彩'
  },

  // Viridis 科學色彩
  viridis: {
    name: 'Viridis',
    type: 'sequential',
    colors: [
      '#440154',
      '#482777',
      '#3f4a8a',
      '#31678e',
      '#26838f',
      '#1f9d8a',
      '#6cce5a',
      '#b6de2b',
      '#fee825'
    ],
    description: '感知均勻的科學可視化色彩',
    source: 'Matplotlib'
  },

  // Plasma
  plasma: {
    name: 'Plasma',
    type: 'sequential',
    colors: [
      '#0c0786',
      '#40039c',
      '#6a00a7',
      '#8f0da4',
      '#b12a90',
      '#cc4678',
      '#e16462',
      '#f2844b',
      '#fca636',
      '#fcce25'
    ],
    description: '高對比度的科學可視化色彩',
    source: 'Matplotlib'
  },

  // Inferno
  inferno: {
    name: 'Inferno',
    type: 'sequential',
    colors: [
      '#000003',
      '#1b0c41',
      '#4a0c6b',
      '#781c6d',
      '#a52c60',
      '#cf4446',
      '#ed6925',
      '#fb9b06',
      '#f7d03c',
      '#fcffa4'
    ],
    description: '火焰主題的科學可視化色彩',
    source: 'Matplotlib'
  },

  // Magma
  magma: {
    name: 'Magma',
    type: 'sequential',
    colors: [
      '#000003',
      '#1c1044',
      '#4f1468',
      '#7e1c6e',
      '#a92e5e',
      '#ce4c7d',
      '#e8749a',
      '#f7a1b7',
      '#fdd2d2',
      '#fcfbfd'
    ],
    description: '岩漿主題的科學可視化色彩',
    source: 'Matplotlib'
  },

  // Cividis (色盲友善)
  cividis: {
    name: 'Cividis',
    type: 'sequential',
    colors: [
      '#002051',
      '#003f5c',
      '#2f4b7c',
      '#665191',
      '#a05195',
      '#d45087',
      '#f95d6a',
      '#ff7c43',
      '#ffa600'
    ],
    description: '色盲友善的科學可視化色彩',
    source: 'Matplotlib'
  },

  // Turbo (Google)
  turbo: {
    name: 'Turbo',
    type: 'sequential',
    colors: [
      '#23171b',
      '#271a28',
      '#2d1e35',
      '#333142',
      '#39344f',
      '#3e375c',
      '#433a69',
      '#483e76',
      '#4c4183',
      '#514590'
    ],
    description: 'Google Turbo 高性能可視化色彩',
    source: 'Google'
  },

  // 自定義類別色彩
  custom: {
    name: 'Custom',
    type: 'categorical',
    colors: [
      '#3b82f6', // 藍
      '#ef4444', // 紅
      '#10b981', // 綠
      '#f59e0b', // 橙
      '#8b5cf6', // 紫
      '#06b6d4', // 青
      '#f97316', // 深橙
      '#84cc16', // 萊姆綠
      '#ec4899', // 粉紅
      '#6b7280'  // 灰
    ],
    description: '通用的類別區分色彩'
  }
}

// 獲取調色板
export function getPalette(name: string): ColorPalette | null {
  return COLOR_PALETTES[name] || null
}

// 獲取所有調色板名稱
export function getPaletteNames(): string[] {
  return Object.keys(COLOR_PALETTES)
}

// 按類型獲取調色板
export function getPalettesByType(type: ColorPalette['type']): ColorPalette[] {
  return Object.values(COLOR_PALETTES).filter(palette => palette.type === type)
}

// 獲取指定數量的顏色
export function getColorsFromPalette(name: string, count: number): string[] {
  const palette = getPalette(name)
  if (!palette) return []

  const colors = palette.colors
  
  if (count <= colors.length) {
    // 如果需要的顏色少於調色板中的顏色，均勻選取
    if (count === colors.length) {
      return [...colors]
    }
    
    const step = colors.length / count
    return Array.from({ length: count }, (_, i) => {
      const index = Math.floor(i * step)
      return colors[Math.min(index, colors.length - 1)]
    })
  } else {
    // 如果需要的顏色多於調色板中的顏色，循環使用
    return Array.from({ length: count }, (_, i) => {
      return colors[i % colors.length]
    })
  }
}