/**
 * Virtual List React 組件
 * 基於 Virtual Scrolling 引擎的高性能列表組件
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { VirtualScrollEngine, VirtualScrollConfig, VirtualScrollState, VirtualScrollItem } from '../../core/performance/virtual-scrolling';

export interface VirtualListProps<T = any> {
  /** 數據源 */
  data: T[];
  /** 項目高度 */
  itemHeight: number;
  /** 容器高度 */
  height: number;
  /** 項目渲染函數 */
  renderItem: (item: VirtualScrollItem<T>) => React.ReactNode;
  /** 容器樣式 */
  className?: string;
  /** 預渲染緩衝區大小 */
  overscan?: number;
  /** 滾動事件節流時間 */
  throttleMs?: number;
  /** 滾動事件回調 */
  onScroll?: (state: VirtualScrollState) => void;
  /** 空數據時的占位內容 */
  emptyContent?: React.ReactNode;
  /** 加載中狀態 */
  loading?: boolean;
  /** 加載中內容 */
  loadingContent?: React.ReactNode;
}

/**
 * Virtual List 組件
 * 高效渲染大量數據的虛擬列表
 */
export function VirtualList<T = any>({
  data,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5,
  throttleMs = 16,
  onScroll,
  emptyContent,
  loading = false,
  loadingContent
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<VirtualScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    totalHeight: 0,
    offsetY: 0
  });

  // 創建 Virtual Scrolling 引擎
  const engine = useMemo(() => {
    const config: VirtualScrollConfig = {
      itemHeight,
      containerHeight: height,
      overscan,
      throttleMs
    };
    
    const scrollEngine = new VirtualScrollEngine<T>(config);
    scrollEngine.setData(data);
    
    return scrollEngine;
  }, [itemHeight, height, overscan, throttleMs]);

  // 監聽引擎狀態變化
  useEffect(() => {
    const unsubscribe = engine.subscribe((state) => {
      setScrollState(state);
      onScroll?.(state);
    });

    return unsubscribe;
  }, [engine, onScroll]);

  // 數據變化時更新引擎
  useEffect(() => {
    engine.setData(data);
  }, [data, engine]);

  // 容器高度變化時更新引擎
  useEffect(() => {
    engine.setContainerHeight(height);
  }, [height, engine]);

  // 滾動事件處理
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    engine.setScrollTop(scrollTop);
  }, [engine]);

  // 獲取可見項目
  const visibleItems = useMemo(() => {
    return engine.getVisibleItems();
  }, [engine, scrollState]);

  // 清理引擎
  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  // 加載中狀態
  if (loading) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ height }}
      >
        {loadingContent || (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  // 空數據狀態
  if (!data || data.length === 0) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ height }}
      >
        {emptyContent || (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <div>No data available</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      {/* 總高度占位元素 */}
      <div 
        style={{ 
          height: scrollState.totalHeight,
          position: 'relative'
        }}
      >
        {/* 可見項目容器 */}
        <div
          style={{
            transform: `translateY(${scrollState.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item) => (
            <div
              key={item.index}
              style={{
                height: itemHeight,
                position: 'relative'
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Virtual Grid 組件
 * 支援網格佈局的虛擬滾動
 */
export interface VirtualGridProps<T = any> {
  data: T[];
  itemHeight: number;
  itemWidth: number;
  height: number;
  width: number;
  columns: number;
  renderItem: (item: VirtualScrollItem<T>, columnIndex: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  onScroll?: (state: VirtualScrollState) => void;
}

export function VirtualGrid<T = any>({
  data,
  itemHeight,
  itemWidth,
  height,
  _width: __width,
  columns,
  renderItem,
  className = '',
  gap = 0,
  overscan = 5,
  onScroll
}: VirtualGridProps<T>) {
  // 將數據重組為行數據
  const rowData = useMemo(() => {
    const rows = [];
    for (let i = 0; i < data.length; i += columns) {
      rows.push(data.slice(i, i + columns));
    }
    return rows;
  }, [data, columns]);

  const renderRow = useCallback((item: VirtualScrollItem<T[]>) => {
    const rowItems = item.data;
    
    return (
      <div 
        className="flex"
        style={{ gap }}
      >
        {rowItems.map((cellData, columnIndex) => (
          <div
            key={`${item.index}-${columnIndex}`}
            style={{
              width: itemWidth,
              height: itemHeight,
              flexShrink: 0
            }}
          >
            {renderItem(
              {
                index: item.index * columns + columnIndex,
                data: cellData,
                offsetTop: item.offsetTop,
                height: itemHeight
              },
              columnIndex
            )}
          </div>
        ))}
      </div>
    );
  }, [columns, itemHeight, itemWidth, gap, renderItem]);

  return (
    <VirtualList
      data={rowData}
      itemHeight={itemHeight + gap}
      height={height}
      renderItem={renderRow}
      className={className}
      overscan={overscan}
      onScroll={onScroll}
    />
  );
}

/**
 * Virtual Table 組件
 * 高性能表格組件
 */
export interface VirtualTableColumn<T = any> {
  key: string;
  title: string;
  width: number;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface VirtualTableProps<T = any> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  height: number;
  className?: string;
  overscan?: number;
  onScroll?: (state: VirtualScrollState) => void;
  onRowClick?: (record: T, index: number) => void;
}

export function VirtualTable<T = any>({
  data,
  columns,
  rowHeight = 40,
  height,
  className = '',
  overscan = 5,
  onScroll,
  onRowClick
}: VirtualTableProps<T>) {
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + col._width, 0);
  }, [columns]);

  const renderRow = useCallback((item: VirtualScrollItem<T>) => {
    const record = item.data;
    
    return (
      <div 
        className={`flex border-b border-gray-200 hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
        style={{ width: totalWidth }}
        onClick={onRowClick ? () => onRowClick(record, item.index) : undefined}
      >
        {columns.map((column) => {
          const value = (record as any)[column.key];
          const content = column.render ? column.render(value, record, item.index) : value;
          
          return (
            <div
              key={column.key}
              className={`flex-shrink-0 px-4 py-2 flex items-center text-${column.align || 'left'}`}
              style={{ width: column.width }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  }, [columns, totalWidth, onRowClick]);

  const headerElement = useMemo(() => (
    <div className="flex bg-gray-100 border-b-2 border-gray-300 font-medium sticky top-0 z-10">
      {columns.map((column) => (
        <div
          key={column.key}
          className={`flex-shrink-0 px-4 py-3 text-${column.align || 'left'}`}
          style={{ width: column.width }}
        >
          {column.title}
        </div>
      ))}
    </div>
  ), [columns]);

  return (
    <div className={className}>
      {headerElement}
      <VirtualList
        data={data}
        itemHeight={rowHeight}
        height={height - 48} // 扣除標題高度
        renderItem={renderRow}
        overscan={overscan}
        onScroll={onScroll}
      />
    </div>
  );
}