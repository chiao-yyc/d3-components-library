/**
 * Virtual Scrolling 核心實現
 * 用於高效處理大數據集的渲染優化
 */

export interface VirtualScrollConfig {
  itemHeight: number;          // 每個項目的固定高度
  containerHeight: number;     // 容器高度
  overscan?: number;          // 預渲染額外項目數量
  throttleMs?: number;        // 滾動事件節流時間
}

export interface VirtualScrollState {
  scrollTop: number;          // 當前滾動位置
  startIndex: number;         // 可見區域開始索引
  endIndex: number;          // 可見區域結束索引
  visibleItems: number;      // 可見項目數量
  totalHeight: number;       // 總內容高度
  offsetY: number;           // 可見內容偏移量
}

export interface VirtualScrollItem<T = any> {
  index: number;
  data: T;
  offsetTop: number;
  height: number;
}

/**
 * Virtual Scrolling 核心引擎
 */
export class VirtualScrollEngine<T = any> {
  private config: Required<VirtualScrollConfig>;
  private state: VirtualScrollState;
  private data: T[] = [];
  private listeners: Set<(state: VirtualScrollState) => void> = new Set();

  constructor(config: VirtualScrollConfig) {
    this.config = {
      overscan: 5,
      throttleMs: 16,
      ...config
    };

    this.state = {
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      visibleItems: 0,
      totalHeight: 0,
      offsetY: 0
    };

    this.updateVisibleItems();
  }

  /**
   * 設置數據源
   */
  setData(data: T[]): void {
    this.data = data;
    this.state.totalHeight = data.length * this.config.itemHeight;
    this.updateVisibleItems();
    this.notifyListeners();
  }

  /**
   * 更新滾動位置
   */
  setScrollTop(scrollTop: number): void {
    const maxScrollTop = Math.max(0, this.state.totalHeight - this.config.containerHeight);
    this.state.scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
    this.updateVisibleItems();
    this.notifyListeners();
  }

  /**
   * 更新容器高度
   */
  setContainerHeight(height: number): void {
    this.config.containerHeight = height;
    this.updateVisibleItems();
    this.notifyListeners();
  }

  /**
   * 計算可見項目範圍
   */
  private updateVisibleItems(): void {
    const { itemHeight, containerHeight, overscan } = this.config;
    const { scrollTop } = this.state;

    // 計算可見區域
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      this.data.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    // 添加 overscan 緩衝區
    this.state.startIndex = Math.max(0, visibleStart - overscan);
    this.state.endIndex = Math.min(this.data.length - 1, visibleEnd + overscan);
    this.state.visibleItems = this.state.endIndex - this.state.startIndex + 1;
    this.state.offsetY = this.state.startIndex * itemHeight;
  }

  /**
   * 獲取當前可見項目
   */
  getVisibleItems(): VirtualScrollItem<T>[] {
    const items: VirtualScrollItem<T>[] = [];
    
    for (let i = this.state.startIndex; i <= this.state.endIndex; i++) {
      if (i < this.data.length) {
        items.push({
          index: i,
          data: this.data[i],
          offsetTop: i * this.config.itemHeight,
          height: this.config.itemHeight
        });
      }
    }

    return items;
  }

  /**
   * 滾動到指定項目
   */
  scrollToItem(index: number, align: 'start' | 'center' | 'end' = 'start'): void {
    const { itemHeight, containerHeight } = this.config;
    let scrollTop: number;

    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
    }

    this.setScrollTop(scrollTop);
  }

  /**
   * 獲取當前狀態
   */
  getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * 監聽狀態變化
   */
  subscribe(listener: (state: VirtualScrollState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知監聽者
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * 創建節流滾動處理器
   */
  createScrollHandler(): (event: Event) => void {
    let lastTime = 0;
    
    return (event: Event) => {
      const now = Date.now();
      if (now - lastTime < this.config.throttleMs) {
        return;
      }
      
      lastTime = now;
      const target = event.target as HTMLElement;
      this.setScrollTop(target.scrollTop);
    };
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.listeners.clear();
  }
}

/**
 * Virtual Scrolling Hook 工具函數
 */
export function createVirtualScrollEngine<T>(
  config: VirtualScrollConfig,
  data: T[]
): VirtualScrollEngine<T> {
  const engine = new VirtualScrollEngine<T>(config);
  engine.setData(data);
  return engine;
}

/**
 * 自適應項目高度的 Virtual Scrolling
 * 用於處理不同高度的項目
 */
export class AdaptiveVirtualScrollEngine<T = any> {
  private itemHeights: Map<number, number> = new Map();
  private estimatedItemHeight: number;
  private data: T[] = [];
  private containerHeight: number;
  private scrollTop: number = 0;
  private listeners: Set<(state: VirtualScrollState) => void> = new Set();

  constructor(estimatedItemHeight: number, containerHeight: number) {
    this.estimatedItemHeight = estimatedItemHeight;
    this.containerHeight = containerHeight;
  }

  /**
   * 設置項目實際高度
   */
  setItemHeight(index: number, height: number): void {
    this.itemHeights.set(index, height);
    this.notifyListeners();
  }

  /**
   * 獲取項目高度
   */
  getItemHeight(index: number): number {
    return this.itemHeights.get(index) || this.estimatedItemHeight;
  }

  /**
   * 計算項目偏移量
   */
  getItemOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }

  /**
   * 計算總高度
   */
  getTotalHeight(): number {
    let totalHeight = 0;
    for (let i = 0; i < this.data.length; i++) {
      totalHeight += this.getItemHeight(i);
    }
    return totalHeight;
  }

  /**
   * 查找可見項目範圍
   */
  findVisibleRange(overscan: number = 3): { startIndex: number; endIndex: number } {
    const { scrollTop, containerHeight } = this;
    const scrollBottom = scrollTop + containerHeight;
    
    let startIndex = 0;
    let endIndex = this.data.length - 1;
    
    // 查找開始索引
    let currentOffset = 0;
    for (let i = 0; i < this.data.length; i++) {
      const itemHeight = this.getItemHeight(i);
      if (currentOffset + itemHeight >= scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentOffset += itemHeight;
    }
    
    // 查找結束索引
    currentOffset = this.getItemOffset(startIndex);
    for (let i = startIndex; i < this.data.length; i++) {
      const itemHeight = this.getItemHeight(i);
      if (currentOffset > scrollBottom) {
        endIndex = Math.min(this.data.length - 1, i + overscan);
        break;
      }
      currentOffset += itemHeight;
    }

    return { startIndex, endIndex };
  }

  setData(data: T[]): void {
    this.data = data;
    this.notifyListeners();
  }

  setScrollTop(scrollTop: number): void {
    this.scrollTop = Math.max(0, scrollTop);
    this.notifyListeners();
  }

  subscribe(listener: (state: VirtualScrollState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const { startIndex, endIndex } = this.findVisibleRange();
    const state: VirtualScrollState = {
      scrollTop: this.scrollTop,
      startIndex,
      endIndex,
      visibleItems: endIndex - startIndex + 1,
      totalHeight: this.getTotalHeight(),
      offsetY: this.getItemOffset(startIndex)
    };
    
    this.listeners.forEach(listener => listener(state));
  }
}