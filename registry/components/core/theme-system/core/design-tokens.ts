/**
 * Design Tokens - 設計令牌定義
 * 定義所有視覺設計元素的統一規範
 */

// === 顏色系統 ===

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // main
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface ColorPalette {
  // 主色調
  primary: SemanticColors;
  secondary: SemanticColors;
  
  // 狀態顏色
  success: SemanticColors;
  warning: SemanticColors;
  error: SemanticColors;
  info: SemanticColors;
  
  // 背景顏色
  background: {
    default: string;
    paper: string;
    level1: string;
    level2: string;
  };
  
  // 表面顏色
  surface: {
    default: string;
    variant: string;
  };
  
  // 文字顏色
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  
  // 邊框和分隔線
  divider: string;
  border: string;
  
  // 圖表專用顏色
  chart: {
    series: string[];
    categorical: string[];
    sequential: string[];
    diverging: string[];
    qualitative: string[];
  };
  
  // 完整色階（用於高級定制）
  grey: ColorScale;
  blue: ColorScale;
  green: ColorScale;
  red: ColorScale;
  yellow: ColorScale;
  purple: ColorScale;
  cyan: ColorScale;
  pink: ColorScale;
}

// === 字體系統 ===

export interface FontWeight {
  light: number;
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface FontSize {
  xs: string;    // 12px
  sm: string;    // 14px  
  base: string;  // 16px
  lg: string;    // 18px
  xl: string;    // 20px
  '2xl': string; // 24px
  '3xl': string; // 30px
  '4xl': string; // 36px
  '5xl': string; // 48px
  '6xl': string; // 60px
}

export interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  
  fontSize: FontSize;
  
  fontWeight: FontWeight;
  
  lineHeight: {
    tight: string;   // 1.25
    normal: string;  // 1.5
    relaxed: string; // 1.75
  };
  
  letterSpacing: {
    tight: string;   // -0.025em
    normal: string;  // 0
    wide: string;    // 0.025em
  };
  
  // 預定義文字樣式
  variants: {
    h1: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    h2: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    h3: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    h4: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    h5: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    h6: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    subtitle1: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    subtitle2: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    body1: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    body2: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    caption: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
    };
    overline: {
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      letterSpacing: string;
      textTransform: string;
    };
  };
}

// === 間距系統 ===

export interface Spacing {
  0: string;     // 0px
  1: string;     // 4px
  2: string;     // 8px  
  3: string;     // 12px
  4: string;     // 16px
  5: string;     // 20px
  6: string;     // 24px
  7: string;     // 28px
  8: string;     // 32px
  9: string;     // 36px
  10: string;    // 40px
  11: string;    // 44px
  12: string;    // 48px
  14: string;    // 56px
  16: string;    // 64px
  20: string;    // 80px
  24: string;    // 96px
  28: string;    // 112px
  32: string;    // 128px
  36: string;    // 144px
  40: string;    // 160px
  44: string;    // 176px
  48: string;    // 192px
  52: string;    // 208px
  56: string;    // 224px
  60: string;    // 240px
  64: string;    // 256px
  72: string;    // 288px
  80: string;    // 320px
  96: string;    // 384px
}

// === 邊框圓角 ===

export interface BorderRadius {
  none: string;    // 0px
  sm: string;      // 2px
  base: string;    // 4px
  md: string;      // 6px
  lg: string;      // 8px
  xl: string;      // 12px
  '2xl': string;   // 16px
  '3xl': string;   // 24px
  full: string;    // 9999px
}

// === 陰影系統 ===

export interface Shadows {
  none: string;
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// === 動畫系統 ===

export interface Animation {
  duration: {
    fast: string;     // 150ms
    normal: string;   // 300ms  
    slow: string;     // 500ms
    slower: string;   // 750ms
    slowest: string;  // 1000ms
  };
  
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
  
  // 預定義動畫
  presets: {
    fadeIn: {
      duration: string;
      easing: string;
      keyframes: string;
    };
    slideIn: {
      duration: string;
      easing: string;
      keyframes: string;
    };
    scaleIn: {
      duration: string;
      easing: string;
      keyframes: string;
    };
    bounce: {
      duration: string;
      easing: string;
      keyframes: string;
    };
  };
}

// === 斷點系統 ===

export interface Breakpoints {
  xs: string;    // 0px
  sm: string;    // 640px
  md: string;    // 768px
  lg: string;    // 1024px
  xl: string;    // 1280px
  '2xl': string; // 1536px
}

// === 統一設計令牌 ===

export interface DesignTokens {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  animation: Animation;
  breakpoints: Breakpoints;
}

// === 預設令牌值 ===

export const DEFAULT_COLOR_PALETTE: ColorPalette = {
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#64748b',
    light: '#94a3b8',
    dark: '#334155',
    contrastText: '#ffffff'
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#047857',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  info: {
    main: '#06b6d4',
    light: '#22d3ee',
    dark: '#0891b2',
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    level1: '#f8fafc',
    level2: '#f1f5f9'
  },
  surface: {
    default: '#ffffff',
    variant: '#f8fafc'
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    disabled: '#94a3b8',
    hint: '#cbd5e1'
  },
  divider: '#e2e8f0',
  border: '#d1d5db',
  chart: {
    series: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5'],
    qualitative: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628']
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px'
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em'
  },
  variants: {
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    h2: {
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    h3: {
      fontSize: '30px',
      fontWeight: 600,
      lineHeight: '1.25',
      letterSpacing: '0'
    },
    h4: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '1.25',
      letterSpacing: '0'
    },
    h5: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '1.25',
      letterSpacing: '0'
    },
    h6: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '1.25',
      letterSpacing: '0'
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0'
    },
    overline: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      textTransform: 'uppercase'
    }
  }
};

export const DEFAULT_SPACING: Spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px'
};

export const DEFAULT_BORDER_RADIUS: BorderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
};

export const DEFAULT_SHADOWS: Shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

export const DEFAULT_ANIMATION: Animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms'
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  presets: {
    fadeIn: {
      duration: '300ms',
      easing: 'ease-in-out',
      keyframes: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'
    },
    slideIn: {
      duration: '300ms',
      easing: 'ease-out',
      keyframes: '@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }'
    },
    scaleIn: {
      duration: '300ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      keyframes: '@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }'
    },
    bounce: {
      duration: '600ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      keyframes: '@keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0,-30px,0); } 70% { transform: translate3d(0,-15px,0); } 90% { transform: translate3d(0,-4px,0); } }'
    }
  }
};

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: DEFAULT_COLOR_PALETTE,
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
  borderRadius: DEFAULT_BORDER_RADIUS,
  shadows: DEFAULT_SHADOWS,
  animation: DEFAULT_ANIMATION,
  breakpoints: DEFAULT_BREAKPOINTS
};