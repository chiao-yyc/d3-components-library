/**
 * ThemeCore - 框架無關的主題管理核心邏輯
 * 提供企業級主題系統和設計令牌管理
 */

import { DesignTokens, ColorPalette, Typography, Spacing, Animation } from './design-tokens';

// === 主題類型定義 ===

export interface ThemeCoreConfig {
  name: string;
  displayName: string;
  version: string;
  description?: string;
  author?: string;
  tokens: DesignTokens;
  dark?: boolean;
  extends?: string; // 繼承自哪個主題
}

export interface ThemeVariant {
  name: string;
  overrides: Partial<DesignTokens>;
}

export interface ThemeTransition {
  property: string;
  duration: string;
  easing: string;
}

// === 主題核心實現 ===

export class ThemeCore {
  private config: ThemeCoreConfig;
  private variants: Map<string, ThemeVariant> = new Map();
  private currentVariant: string | null = null;

  constructor(config: ThemeCoreConfig) {
    this.config = config;
  }

  // === 主題基本操作 ===

  public getName(): string {
    return this.config.name;
  }

  public getDisplayName(): string {
    return this.config.displayName;
  }

  public getVersion(): string {
    return this.config.version;
  }

  public isDark(): boolean {
    return this.config.dark || false;
  }

  public getTokens(): DesignTokens {
    const baseTokens = this.config.tokens;
    
    if (this.currentVariant) {
      const variant = this.variants.get(this.currentVariant);
      if (variant) {
        return this.mergeTokens(baseTokens, variant.overrides);
      }
    }
    
    return baseTokens;
  }

  // === 設計令牌訪問器 ===

  public getColor(path: string): string {
    const tokens = this.getTokens();
    return this.getNestedValue(tokens.colors, path) || '#000000';
  }

  public getColors(): ColorPalette {
    return this.getTokens().colors;
  }

  public getTypography(): Typography {
    return this.getTokens().typography;
  }

  public getSpacing(key: string): string {
    const spacing = this.getTokens().spacing;
    return spacing[key as unknown as keyof Spacing] || '0px';
  }

  public getAnimation(): Animation {
    return this.getTokens().animation;
  }

  public getBorderRadius(size: string): string {
    const borderRadius = this.getTokens().borderRadius;
    return borderRadius[size as keyof typeof borderRadius] || '0px';
  }

  public getShadow(level: string): string {
    const shadows = this.getTokens().shadows;
    return shadows[level as keyof typeof shadows] || 'none';
  }

  // === 變體管理 ===

  public addVariant(variant: ThemeVariant): void {
    this.variants.set(variant.name, variant);
  }

  public removeVariant(name: string): void {
    this.variants.delete(name);
    if (this.currentVariant === name) {
      this.currentVariant = null;
    }
  }

  public setVariant(name: string): boolean {
    if (this.variants.has(name)) {
      this.currentVariant = name;
      return true;
    }
    return false;
  }

  public getCurrentVariant(): string | null {
    return this.currentVariant;
  }

  public getVariants(): string[] {
    return Array.from(this.variants.keys());
  }

  // === 組件特定令牌 ===

  public getChartColors(): string[] {
    const colors = this.getTokens().colors;
    return [
      colors.primary.main,
      colors.secondary.main,
      colors.success.main,
      colors.warning.main,
      colors.error.main,
      colors.info.main
    ];
  }

  public getChartTheme(): {
    background: string;
    text: string;
    grid: string;
    axis: string;
    tooltip: {
      background: string;
      text: string;
      border: string;
    };
  } {
    const tokens = this.getTokens();
    
    return {
      background: tokens.colors.background.default,
      text: tokens.colors.text.primary,
      grid: tokens.colors.divider,
      axis: tokens.colors.text.secondary,
      tooltip: {
        background: tokens.colors.background.paper,
        text: tokens.colors.text.primary,
        border: tokens.colors.divider
      }
    };
  }

  // === CSS 變數生成 ===

  public generateCSSVariables(prefix: string = '--theme'): Record<string, string> {
    const tokens = this.getTokens();
    const cssVars: Record<string, string> = {};

    // 顏色變數
    this.flattenObject(tokens.colors, `${prefix}-color`, cssVars);
    
    // 字體變數
    this.flattenObject(tokens.typography, `${prefix}-typography`, cssVars);
    
    // 間距變數
    this.flattenObject(tokens.spacing, `${prefix}-spacing`, cssVars);
    
    // 動畫變數
    this.flattenObject(tokens.animation, `${prefix}-animation`, cssVars);
    
    // 邊框圓角變數
    this.flattenObject(tokens.borderRadius, `${prefix}-border-radius`, cssVars);
    
    // 陰影變數
    this.flattenObject(tokens.shadows, `${prefix}-shadow`, cssVars);

    return cssVars;
  }

  public generateCSSString(prefix: string = '--theme'): string {
    const vars = this.generateCSSVariables(prefix);
    
    return `:root {\n${Object.entries(vars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
  }

  // === 工具方法 ===

  private mergeTokens(base: DesignTokens, overrides: Partial<DesignTokens>): DesignTokens {
    return {
      colors: { ...base.colors, ...overrides.colors },
      typography: { ...base.typography, ...overrides.typography },
      spacing: { ...base.spacing, ...overrides.spacing },
      animation: { ...base.animation, ...overrides.animation },
      borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
      shadows: { ...base.shadows, ...overrides.shadows },
      breakpoints: { ...base.breakpoints, ...overrides.breakpoints }
    };
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private flattenObject(
    obj: any, 
    prefix: string, 
    result: Record<string, string>
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = `${prefix}-${this.kebabCase(key)}`;
      
      if (typeof value === 'object' && value !== null) {
        this.flattenObject(value, newKey, result);
      } else {
        result[newKey] = String(value);
      }
    }
  }

  private kebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  // === 主題驗證 ===

  public validate(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 檢查必需屬性
    if (!this.config.name) {
      errors.push('Theme name is required');
    }

    if (!this.config.tokens) {
      errors.push('Theme tokens are required');
    } else {
      // 檢查令牌結構
      const { tokens } = this.config;
      
      if (!tokens.colors) {
        errors.push('Colors tokens are required');
      }
      
      if (!tokens.typography) {
        warnings.push('Typography tokens are recommended');
      }
      
      if (!tokens.spacing) {
        warnings.push('Spacing tokens are recommended');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // === 主題序列化 ===

  public serialize(): string {
    return JSON.stringify({
      config: this.config,
      variants: Array.from(this.variants.entries()),
      currentVariant: this.currentVariant
    }, null, 2);
  }

  public static deserialize(data: string): ThemeCore {
    const parsed = JSON.parse(data);
    const theme = new ThemeCore(parsed.config);
    
    if (parsed.variants) {
      parsed.variants.forEach(([_name, variant]: [string, ThemeVariant]) => {
        theme.addVariant(variant);
      });
    }
    
    if (parsed.currentVariant) {
      theme.setVariant(parsed.currentVariant);
    }
    
    return theme;
  }

  // === 主題克隆 ===

  public clone(newName?: string): ThemeCore {
    const newConfig: ThemeCoreConfig = {
      ...this.config,
      name: newName || `${this.config.name}-copy`
    };
    
    const clonedTheme = new ThemeCore(newConfig);
    
    // 複製變體
    this.variants.forEach((variant, _name) => {
      clonedTheme.addVariant({ ...variant });
    });
    
    if (this.currentVariant) {
      clonedTheme.setVariant(this.currentVariant);
    }
    
    return clonedTheme;
  }

  // === 主題混合 ===

  public mix(otherTheme: ThemeCore, ratio: number = 0.5): ThemeCore {
    // 簡化的主題混合邏輯
    const mixedTokens = this.mixTokens(
      this.config.tokens,
      otherTheme.config.tokens,
      ratio
    );

    return new ThemeCore({
      name: `${this.config.name}-mixed`,
      displayName: `Mixed Theme`,
      version: '1.0.0',
      tokens: mixedTokens
    });
  }

  private mixTokens(
    tokens1: DesignTokens,
    tokens2: DesignTokens,
    ratio: number
  ): DesignTokens {
    // 這裡實現簡化的令牌混合邏輯
    // 實際實現會更複雜，需要處理顏色插值等
    return ratio > 0.5 ? tokens2 : tokens1;
  }
}

// === 主題工廠 ===

export class ThemeFactory {
  private static themes: Map<string, ThemeCore> = new Map();

  public static register(theme: ThemeCore): void {
    this.themes.set(theme.getName(), theme);
  }

  public static get(name: string): ThemeCore | undefined {
    return this.themes.get(name);
  }

  public static getAll(): ThemeCore[] {
    return Array.from(this.themes.values());
  }

  public static remove(name: string): boolean {
    return this.themes.delete(name);
  }

  public static createFrom(
    name: string,
    baseTheme: string,
    overrides: Partial<DesignTokens>
  ): ThemeCore {
    const base = this.get(baseTheme);
    if (!base) {
      throw new Error(`Base theme '${baseTheme}' not found`);
    }

    const newConfig: ThemeCoreConfig = {
      name,
      displayName: name,
      version: '1.0.0',
      tokens: base.getTokens(),
      extends: baseTheme
    };

    const theme = new ThemeCore(newConfig);
    
    // 添加覆蓋變體
    if (Object.keys(overrides).length > 0) {
      theme.addVariant({
        name: 'custom',
        overrides
      });
      theme.setVariant('custom');
    }

    return theme;
  }
}

// === 主題事件系統 ===

export interface ThemeChangeEvent {
  type: 'theme-change' | 'variant-change';
  oldTheme?: string;
  newTheme: string;
  oldVariant?: string | null;
  newVariant?: string | null;
}

export type ThemeChangeListener = (event: ThemeChangeEvent) => void;

export class ThemeEventEmitter {
  private listeners: Set<ThemeChangeListener> = new Set();

  public addEventListener(listener: ThemeChangeListener): void {
    this.listeners.add(listener);
  }

  public removeEventListener(listener: ThemeChangeListener): void {
    this.listeners.delete(listener);
  }

  public emit(event: ThemeChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }
}