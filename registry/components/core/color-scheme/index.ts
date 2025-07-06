export { 
  ChartColorManager, 
  colorManager,
  createColorScale,
  getChartColors,
  getChartColor
} from './color-manager'

export {
  COLOR_PALETTES,
  getPalette,
  getPaletteNames,
  getPalettesByType,
  getColorsFromPalette
} from './color-palettes'

export {
  useColorScheme,
  useSeriesColors,
  useGradientColors
} from './use-color-scheme'

export type {
  ColorSchemeType,
  ColorFormat,
  ColorSchemeConfig,
  ColorScale,
  ColorPalette,
  ColorManager
} from './types'