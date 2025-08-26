/**
 * 數據格式化工具函式
 * 提供統一的日期、價格、成交量、百分比等格式化功能
 */

/**
 * 日期格式化選項
 */
export interface DateFormatOptions {
  locale?: string
  format?: 'full' | 'short' | 'compact' | 'time' | 'datetime' | 'custom'
  customFormat?: Intl.DateTimeFormatOptions
}

/**
 * 價格格式化選項
 */
export interface PriceFormatOptions {
  decimals?: number
  currency?: string
  showCurrency?: boolean
  showSign?: boolean
  locale?: string
}

/**
 * 成交量格式化選項
 */
export interface VolumeFormatOptions {
  units?: 'auto' | 'none' | '萬' | '億'
  decimals?: number
  locale?: string
}

/**
 * 百分比格式化選項
 */
export interface PercentFormatOptions {
  decimals?: number
  showSign?: boolean
  showPercent?: boolean
  locale?: string
}

/**
 * 日期格式化器
 */
export class DateFormatter {
  private static defaultOptions: DateFormatOptions = {
    locale: 'zh-TW',
    format: 'short'
  }

  static format(date: string | Date | number, options: DateFormatOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options }
    const d = new Date(date)

    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }

    if (opts.format === 'custom' && opts.customFormat) {
      return d.toLocaleDateString(opts.locale, opts.customFormat)
    }

    switch (opts.format) {
      case 'full':
        return d.toLocaleDateString(opts.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      
      case 'short':
        return d.toLocaleDateString(opts.locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      
      case 'compact':
        return d.toLocaleDateString(opts.locale, {
          month: 'short',
          day: 'numeric'
        })
      
      case 'time':
        return d.toLocaleTimeString(opts.locale, {
          hour: '2-digit',
          minute: '2-digit'
        })
      
      case 'datetime':
        return d.toLocaleString(opts.locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      
      default:
        return d.toLocaleDateString(opts.locale)
    }
  }
}

/**
 * 價格格式化器
 */
export class PriceFormatter {
  private static defaultOptions: PriceFormatOptions = {
    decimals: 2,
    currency: 'TWD',
    showCurrency: false,
    showSign: false,
    locale: 'zh-TW'
  }

  static format(price: number, options: PriceFormatOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options }
    
    if (!isFinite(price)) {
      return 'N/A'
    }

    let formatted = price.toFixed(opts.decimals)
    
    // 添加千分位分隔符
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    formatted = parts.join('.')

    // 添加正負號
    if (opts.showSign && price > 0) {
      formatted = '+' + formatted
    }

    // 添加貨幣符號
    if (opts.showCurrency) {
      switch (opts.currency) {
        case 'TWD':
          formatted = 'NT$' + formatted
          break
        case 'USD':
          formatted = '$' + formatted
          break
        case 'CNY':
          formatted = '¥' + formatted
          break
        default:
          formatted = opts.currency + formatted
      }
    }

    return formatted
  }

  /**
   * 格式化價格差異
   */
  static formatChange(change: number, options: PriceFormatOptions = {}): string {
    return this.format(change, { ...options, showSign: true })
  }
}

/**
 * 成交量格式化器
 */
export class VolumeFormatter {
  private static defaultOptions: VolumeFormatOptions = {
    units: 'auto',
    decimals: 1,
    locale: 'zh-TW'
  }

  static format(volume: number, options: VolumeFormatOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options }
    
    if (!isFinite(volume) || volume < 0) {
      return 'N/A'
    }

    let value = volume
    let unit = ''

    if (opts.units === 'auto') {
      if (volume >= 1e8) {
        value = volume / 1e8
        unit = '億'
      } else if (volume >= 1e4) {
        value = volume / 1e4
        unit = '萬'
      }
    } else if (opts.units === '萬') {
      value = volume / 1e4
      unit = '萬'
    } else if (opts.units === '億') {
      value = volume / 1e8
      unit = '億'
    }

    const formatted = value.toFixed(opts.decimals)
    return formatted + unit
  }
}

/**
 * 百分比格式化器
 */
export class PercentFormatter {
  private static defaultOptions: PercentFormatOptions = {
    decimals: 2,
    showSign: true,
    showPercent: true,
    locale: 'zh-TW'
  }

  static format(percent: number, options: PercentFormatOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options }
    
    if (!isFinite(percent)) {
      return 'N/A'
    }

    let formatted = percent.toFixed(opts.decimals)

    // 添加正負號
    if (opts.showSign && percent > 0) {
      formatted = '+' + formatted
    }

    // 添加百分比符號
    if (opts.showPercent) {
      formatted += '%'
    }

    return formatted
  }
}

/**
 * 數字格式化器（通用）
 */
export class NumberFormatter {
  /**
   * 格式化大數字（自動單位）
   */
  static formatLargeNumber(num: number, decimals: number = 1): string {
    if (!isFinite(num)) return 'N/A'
    
    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''
    
    if (absNum >= 1e12) {
      return sign + (absNum / 1e12).toFixed(decimals) + 'T'
    } else if (absNum >= 1e9) {
      return sign + (absNum / 1e9).toFixed(decimals) + 'B'
    } else if (absNum >= 1e6) {
      return sign + (absNum / 1e6).toFixed(decimals) + 'M'
    } else if (absNum >= 1e3) {
      return sign + (absNum / 1e3).toFixed(decimals) + 'K'
    } else {
      return sign + absNum.toFixed(decimals)
    }
  }

  /**
   * 格式化科學記號
   */
  static formatScientific(num: number, decimals: number = 2): string {
    if (!isFinite(num)) return 'N/A'
    return num.toExponential(decimals)
  }

  /**
   * 格式化千分位分隔符
   */
  static formatThousands(num: number, decimals?: number): string {
    if (!isFinite(num)) return 'N/A'
    
    const formatted = typeof decimals === 'number' ? 
      num.toFixed(decimals) : 
      num.toString()
    
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }
}

/**
 * K線圖專用格式化器組合
 */
export class CandlestickFormatter {
  static date = (date: string | Date | number, compact: boolean = false) => {
    return DateFormatter.format(date, { 
      format: compact ? 'compact' : 'short' 
    })
  }

  static price = (price: number, decimals: number = 2) => {
    return PriceFormatter.format(price, { decimals })
  }

  static priceChange = (change: number, decimals: number = 2) => {
    return PriceFormatter.formatChange(change, { decimals })
  }

  static volume = (volume: number) => {
    return VolumeFormatter.format(volume, { units: 'auto' })
  }

  static percent = (percent: number) => {
    return PercentFormatter.format(percent, { decimals: 2, showSign: true })
  }

  /**
   * 格式化完整的 OHLC 數據
   */
  static formatOHLC(data: {
    date: string | Date
    open: number
    high: number
    low: number
    close: number
    volume?: number
  }) {
    const change = data.close - data.open
    const changePercent = (change / data.open) * 100

    return {
      date: this.date(data.date),
      open: this.price(data.open),
      high: this.price(data.high),
      low: this.price(data.low),
      close: this.price(data.close),
      change: this.priceChange(change),
      changePercent: this.percent(changePercent),
      volume: data.volume ? this.volume(data.volume) : undefined
    }
  }
}

/**
 * 預設格式化器實例（便於直接使用）
 */
export const formatDate = DateFormatter.format.bind(DateFormatter)
export const formatPrice = PriceFormatter.format.bind(PriceFormatter)
export const formatPriceChange = PriceFormatter.formatChange.bind(PriceFormatter)
export const formatVolume = VolumeFormatter.format.bind(VolumeFormatter)
export const formatPercent = PercentFormatter.format.bind(PercentFormatter)
export const formatLargeNumber = NumberFormatter.formatLargeNumber.bind(NumberFormatter)
export const formatThousands = NumberFormatter.formatThousands.bind(NumberFormatter)

/**
 * K線圖格式化器實例
 */
export const candlestickFormatter = CandlestickFormatter

/**
 * 創建自定義格式化器
 */
export const createFormatter = {
  date: (options: DateFormatOptions) => (date: string | Date | number) => 
    DateFormatter.format(date, options),
  
  price: (options: PriceFormatOptions) => (price: number) => 
    PriceFormatter.format(price, options),
  
  volume: (options: VolumeFormatOptions) => (volume: number) => 
    VolumeFormatter.format(volume, options),
  
  percent: (options: PercentFormatOptions) => (percent: number) => 
    PercentFormatter.format(percent, options)
}