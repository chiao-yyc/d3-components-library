import { useMemo } from 'react'
import { processOHLCData } from './core/ohlc-processor'
import { UseOHLCProcessorOptions, OHLCProcessorResult } from './core/types'

/**
 * React Hook for OHLC data processing
 * 
 * @param data - Raw data array
 * @param options - Processing configuration options
 * @returns Processed OHLC data with statistics and metadata
 * 
 * @example
 * ```tsx
 * const stockData = [
 *   { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105, volume: 1000 },
 *   { date: '2024-01-02', open: 105, high: 115, low: 100, close: 108, volume: 1200 },
 * ]
 * 
 * const { data, statistics, errors } = useOHLCProcessor(stockData, {
 *   autoDetect: true,
 *   sortByDate: true
 * })
 * ```
 */
export function useOHLCProcessor(
  data: any[],
  options: Omit<UseOHLCProcessorOptions, 'data'> = {}
): OHLCProcessorResult {
  return useMemo(() => {
    return processOHLCData(data, options)
  }, [data, options])
}