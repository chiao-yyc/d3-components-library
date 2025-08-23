/**
 * LayoutCore - 純 JS/TS 圖層管理核心邏輯
 * 框架無關的圖層排序和管理系統
 */

export interface LayerConfig {
  name: string;
  zIndex: number;
  visible: boolean;
  opacity?: number;
  clipPath?: string;
}

export class LayoutCore {
  private layers: Map<string, LayerConfig> = new Map();

  public registerLayer(config: LayerConfig): void {
    this.layers.set(config.name, config);
  }

  public getLayer(name: string): LayerConfig | undefined {
    return this.layers.get(name);
  }

  public getAllLayers(): LayerConfig[] {
    return Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  public updateLayer(name: string, updates: Partial<LayerConfig>): void {
    const layer = this.layers.get(name);
    if (layer) {
      this.layers.set(name, { ...layer, ...updates });
    }
  }

  public removeLayer(name: string): void {
    this.layers.delete(name);
  }

  public setLayerVisibility(name: string, visible: boolean): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.visible = visible;
    }
  }

  public getLayersByZIndex(): LayerConfig[] {
    return this.getAllLayers();
  }

  public moveLayer(name: string, newZIndex: number): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.zIndex = newZIndex;
    }
  }

  public clear(): void {
    this.layers.clear();
  }
}