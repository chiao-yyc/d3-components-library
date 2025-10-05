/**
 * ThemeProvider - React 主題系統提供者
 * 將 ThemeCore 整合到 React 組件系統中
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { ThemeCore, ThemeFactory, ThemeEventEmitter, type ThemeChangeEvent, type ThemeChangeListener } from './core/theme-core';
import { DesignTokens } from './core/design-tokens';

// React Context 類型定義
export interface ThemeContextValue {
  // 當前主題
  currentTheme: ThemeCore | null;
  themeName: string | null;
  
  // 主題切換
  switchTheme: (themeName: string) => void;
  
  // 變體管理
  currentVariant: string | null;
  switchVariant: (variantName: string | null) => void;
  availableVariants: string[];
  
  // 設計令牌訪問
  tokens: DesignTokens | null;
  getColor: (path: string) => string;
  getSpacing: (key: string) => string;
  getBorderRadius: (size: string) => string;
  getShadow: (level: string) => string;
  
  // CSS 變數
  cssVariables: Record<string, string>;
  
  // 圖表專用令牌
  getChartColors: () => string[];
  getChartTheme: () => {
    background: string;
    text: string;
    grid: string;
    axis: string;
    tooltip: {
      background: string;
      text: string;
      border: string;
    };
  };
  
  // 主題管理
  availableThemes: string[];
  registerTheme: (theme: ThemeCore) => void;
  createCustomTheme: (name: string, baseTheme: string, overrides: Partial<DesignTokens>) => void;
}

// 創建 Context
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Theme Provider Props
export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  initialVariant?: string;
  autoInjectCSS?: boolean;
  cssPrefix?: string;
  onThemeChange?: (event: ThemeChangeEvent) => void;
}

// 全域事件發射器
const globalThemeEmitter = new ThemeEventEmitter();

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'default',
  initialVariant = null,
  autoInjectCSS = true,
  cssPrefix = '--theme',
  onThemeChange
}) => {
  // 狀態管理
  const [currentTheme, setCurrentTheme] = useState<ThemeCore | null>(null);
  const [themeName, setThemeName] = useState<string | null>(null);
  const [currentVariant, setCurrentVariant] = useState<string | null>(initialVariant);
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  // 更新可用主題列表
  const updateAvailableThemes = useCallback(() => {
    const themes = ThemeFactory.getAll().map(theme => theme.getName());
    setAvailableThemes(themes);
  }, []);

  // 初始化時更新主題列表
  useEffect(() => {
    updateAvailableThemes();
  }, [updateAvailableThemes]);

  // 主題切換函數
  const switchTheme = useCallback((newThemeName: string) => {
    const theme = ThemeFactory.get(newThemeName);
    if (!theme) {
      console.warn(`Theme '${newThemeName}' not found`);
      return;
    }

    const oldTheme = themeName;
    const oldVariant = currentVariant;

    setCurrentTheme(theme);
    setThemeName(newThemeName);

    // 重新應用變體（如果存在）
    if (currentVariant && theme.getVariants().includes(currentVariant)) {
      theme.setVariant(currentVariant);
    } else {
      // 清除變體：不呼叫 setVariant(null)，直接更新狀態
      setCurrentVariant(null);
    }

    // 更新 CSS 變數
    const newCssVars = theme.generateCSSVariables(cssPrefix);
    setCssVariables(newCssVars);

    // 觸發事件
    const event: ThemeChangeEvent = {
      type: 'theme-change',
      oldTheme: oldTheme ?? undefined,
      newTheme: newThemeName,
      oldVariant,
      newVariant: theme.getCurrentVariant()
    };

    globalThemeEmitter.emit(event);
    onThemeChange?.(event);
  }, [themeName, currentVariant, cssPrefix, onThemeChange]);

  // 變體切換函數
  const switchVariant = useCallback((variantName: string | null) => {
    if (!currentTheme) return;

    const oldVariant = currentVariant;

    if (variantName && currentTheme.getVariants().includes(variantName)) {
      currentTheme.setVariant(variantName);
      setCurrentVariant(variantName);
    } else {
      // 清除變體：不呼叫 setVariant(null)，直接更新狀態
      setCurrentVariant(null);
    }

    // 更新 CSS 變數
    const newCssVars = currentTheme.generateCSSVariables(cssPrefix);
    setCssVariables(newCssVars);

    // 觸發變體變更事件
    const event: ThemeChangeEvent = {
      type: 'variant-change',
      newTheme: themeName!,
      oldVariant,
      newVariant: currentTheme.getCurrentVariant()
    };

    globalThemeEmitter.emit(event);
    onThemeChange?.(event);
  }, [currentTheme, currentVariant, themeName, cssPrefix, onThemeChange]);

  // 主題註冊函數
  const registerTheme = useCallback((theme: ThemeCore) => {
    ThemeFactory.register(theme);
    updateAvailableThemes();
  }, [updateAvailableThemes]);

  // 自訂主題創建
  const createCustomTheme = useCallback((name: string, baseTheme: string, overrides: Partial<DesignTokens>) => {
    try {
      const customTheme = ThemeFactory.createFrom(name, baseTheme, overrides);
      ThemeFactory.register(customTheme);
      updateAvailableThemes();
    } catch (error) {
      console.error('Failed to create custom theme:', error);
    }
  }, [updateAvailableThemes]);

  // 初始主題載入
  useEffect(() => {
    if (initialTheme && !currentTheme) {
      switchTheme(initialTheme);
    }
  }, [initialTheme, currentTheme, switchTheme]);

  // 自動注入 CSS
  useEffect(() => {
    if (!autoInjectCSS || Object.keys(cssVariables).length === 0) return;

    const styleId = 'theme-provider-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const cssString = `:root {\n${Object.entries(cssVariables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    
    styleElement.textContent = cssString;

    return () => {
      // 清理時移除樣式
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [cssVariables, autoInjectCSS]);

  // 設計令牌訪問函數
  const getColor = useCallback((path: string): string => {
    return currentTheme?.getColor(path) || '#000000';
  }, [currentTheme]);

  const getSpacing = useCallback((key: string): string => {
    return currentTheme?.getSpacing(key) || '0px';
  }, [currentTheme]);

  const getBorderRadius = useCallback((size: string): string => {
    return currentTheme?.getBorderRadius(size) || '0px';
  }, [currentTheme]);

  const getShadow = useCallback((level: string): string => {
    return currentTheme?.getShadow(level) || 'none';
  }, [currentTheme]);

  const getChartColors = useCallback((): string[] => {
    return currentTheme?.getChartColors() || ['#3b82f6'];
  }, [currentTheme]);

  const getChartTheme = useCallback(() => {
    return currentTheme?.getChartTheme() || {
      background: '#ffffff',
      text: '#000000',
      grid: '#e0e0e0',
      axis: '#666666',
      tooltip: {
        background: '#ffffff',
        text: '#000000',
        border: '#cccccc'
      }
    };
  }, [currentTheme]);

  // Context 值
  const contextValue: ThemeContextValue = {
    currentTheme,
    themeName,
    switchTheme,
    currentVariant,
    switchVariant,
    availableVariants: currentTheme?.getVariants() || [],
    tokens: currentTheme?.getTokens() || null,
    getColor,
    getSpacing,
    getBorderRadius,
    getShadow,
    cssVariables,
    getChartColors,
    getChartTheme,
    availableThemes,
    registerTheme,
    createCustomTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for theme change events
export const useThemeChange = (listener: ThemeChangeListener): void => {
  useEffect(() => {
    globalThemeEmitter.addEventListener(listener);
    return () => {
      globalThemeEmitter.removeEventListener(listener);
    };
  }, [listener]);
};

// Higher-order component for theme awareness
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// 預設主題設置 Hook
export const useThemeSetup = (themes: ThemeCore[]) => {
  const { registerTheme } = useTheme();
  
  useEffect(() => {
    themes.forEach(theme => {
      registerTheme(theme);
    });
  }, [themes, registerTheme]);
};

// CSS-in-JS 支援 Hook
export const useThemeStyles = () => {
  const { currentTheme, cssVariables } = useTheme();
  
  return {
    theme: currentTheme,
    cssVariables,
    // 常用樣式生成器
    createStyles: (stylesFn: (theme: ThemeCore) => Record<string, React.CSSProperties>) => {
      return currentTheme ? stylesFn(currentTheme) : {};
    }
  };
};