#!/usr/bin/env node

/**
 * API Consistency Validator
 * 檢查所有組件是否遵循統一的 API 規範
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 組件目錄
const COMPONENTS_DIR = path.join(__dirname, '../components');

// API 規範定義
const API_STANDARDS = {
  // 事件處理器命名規範
  eventHandlers: {
    standard: ['onDataClick', 'onDataHover', 'onDataDoubleClick'],
    deprecated: ['onCandleClick', 'onValueChange', 'onAreaClick', 'onBarClick']
  },
  
  // 必須繼承 BaseChartProps
  baseProps: ['data', 'width', 'height', 'margin', 'className', 'style'],
  
  // 數據存取器標準模式
  dataAccessors: {
    preferred: ['xAccessor', 'yAccessor', 'colorAccessor', 'sizeAccessor'],
    legacy: ['xKey', 'yKey', 'colorKey', 'sizeKey']
  },
  
  // 動畫和交互標準
  commonProps: ['animate', 'animationDuration', 'interactive', 'showTooltip']
};

class APIValidator {
  constructor() {
    this.violations = [];
    this.componentCount = 0;
    this.checkedFiles = [];
  }

  /**
   * 分析單個 TypeScript 文件
   */
  analyzeTypeScriptFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      // 檢查是否是類型定義文件
      if (!fileName.endsWith('types.ts')) return null;
      
      const violations = [];
      
      // 檢查事件處理器命名
      const eventHandlerViolations = this.checkEventHandlers(content, filePath);
      violations.push(...eventHandlerViolations);
      
      // 檢查 BaseChartProps 繼承
      const inheritanceViolations = this.checkBasePropsInheritance(content, filePath);
      violations.push(...inheritanceViolations);
      
      // 檢查數據存取器一致性
      const accessorViolations = this.checkDataAccessors(content, filePath);
      violations.push(...accessorViolations);
      
      return {
        file: filePath,
        violations,
        hasProps: content.includes('Props'),
        extendsBase: content.includes('extends BaseChartProps')
      };
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * 檢查事件處理器命名規範
   */
  checkEventHandlers(content, filePath) {
    const violations = [];
    
    // 檢查是否使用了已棄用的事件命名
    API_STANDARDS.eventHandlers.deprecated.forEach(deprecated => {
      const regex = new RegExp(`${deprecated}\\??:\\s*\\(`, 'g');
      const matches = content.match(regex);
      if (matches) {
        violations.push({
          type: 'deprecated_event_handler',
          severity: 'high',
          message: `使用已棄用的事件處理器 "${deprecated}"，應改為標準命名`,
          file: path.relative(COMPONENTS_DIR, filePath),
          suggestion: this.suggestEventHandlerRename(deprecated)
        });
      }
    });
    
    return violations;
  }

  /**
   * 檢查 BaseChartProps 繼承
   */
  checkBasePropsInheritance(content, filePath) {
    const violations = [];
    
    // 找出所有 Props 接口定義
    const propsInterfaceRegex = /interface\\s+(\\w+Props)\\s*\\{[^}]*\\}/gs;
    const propsMatches = content.match(propsInterfaceRegex);
    
    if (propsMatches) {
      propsMatches.forEach(match => {
        const interfaceName = match.match(/interface\\s+(\\w+Props)/)?.[1];
        
        if (interfaceName && !match.includes('extends BaseChartProps')) {
          violations.push({
            type: 'missing_base_inheritance',
            severity: 'high',
            message: `接口 "${interfaceName}" 未繼承 BaseChartProps`,
            file: path.relative(COMPONENTS_DIR, filePath),
            suggestion: `${interfaceName} extends BaseChartProps`
          });
        }
      });
    }
    
    return violations;
  }

  /**
   * 檢查數據存取器一致性
   */
  checkDataAccessors(content, filePath) {
    const violations = [];
    
    // 檢查是否同時使用了 key 和 accessor 模式
    const hasAccessors = API_STANDARDS.dataAccessors.preferred.some(
      accessor => content.includes(`${accessor}?:`)
    );
    const hasKeys = API_STANDARDS.dataAccessors.legacy.some(
      key => content.includes(`${key}?:`)
    );
    
    if (hasAccessors && hasKeys) {
      violations.push({
        type: 'mixed_data_access_patterns',
        severity: 'medium',
        message: '同時使用了 accessor 和 key 模式，建議統一使用 accessor 模式',
        file: path.relative(COMPONENTS_DIR, filePath),
        suggestion: '統一使用 xAccessor, yAccessor 等函數模式'
      });
    }
    
    return violations;
  }

  /**
   * 建議事件處理器重命名
   */
  suggestEventHandlerRename(deprecated) {
    const suggestions = {
      'onCandleClick': 'onDataClick',
      'onValueChange': 'onDataClick', 
      'onAreaClick': 'onDataClick',
      'onBarClick': 'onDataClick'
    };
    return suggestions[deprecated] || 'onDataClick';
  }

  /**
   * 遞歸掃描目錄
   */
  scanDirectory(dirPath) {
    const results = [];
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳過 node_modules 等目錄
          if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
            results.push(...this.scanDirectory(fullPath));
          }
        } else if (file.endsWith('types.ts')) {
          const analysis = this.analyzeTypeScriptFile(fullPath);
          if (analysis) {
            results.push(analysis);
            this.componentCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dirPath}:`, error.message);
    }
    
    return results;
  }

  /**
   * 生成報告
   */
  generateReport(analyses) {
    const allViolations = analyses.flatMap(a => a.violations);
    
    // 按嚴重程度分類
    const highSeverity = allViolations.filter(v => v.severity === 'high');
    const mediumSeverity = allViolations.filter(v => v.severity === 'medium');
    const lowSeverity = allViolations.filter(v => v.severity === 'low');
    
    console.log('\\n🔍 API 一致性檢查報告');
    console.log('====================================\\n');
    
    console.log(`📊 掃描統計:`);
    console.log(`- 檢查組件數: ${this.componentCount}`);
    console.log(`- 總違規數: ${allViolations.length}`);
    console.log(`- 高嚴重度: ${highSeverity.length}`);
    console.log(`- 中嚴重度: ${mediumSeverity.length}`);
    console.log(`- 低嚴重度: ${lowSeverity.length}\\n`);
    
    // 按文件顯示違規詳情
    if (allViolations.length > 0) {
      console.log('🚨 API 違規詳情:\\n');
      
      analyses.forEach(analysis => {
        if (analysis.violations.length > 0) {
          console.log(`📄 ${analysis.file}:`);
          
          analysis.violations.forEach(violation => {
            const emoji = violation.severity === 'high' ? '🔴' : 
                         violation.severity === 'medium' ? '🟡' : '🟢';
            
            console.log(`   ${emoji} [${violation.type}] ${violation.message}`);
            if (violation.suggestion) {
              console.log(`      💡 建議: ${violation.suggestion}`);
            }
          });
          console.log('');
        }
      });
    }
    
    // 計算合規分數
    const totalChecks = this.componentCount * 3; // 三個主要檢查項目
    const complianceScore = Math.round((1 - allViolations.length / totalChecks) * 100);
    
    console.log(`📈 API 一致性評分: ${complianceScore}/100\\n`);
    
    if (complianceScore < 80) {
      console.log('⚠️  API 一致性評分低於 80%，建議立即修復高嚴重度問題。\\n');
      process.exit(1);
    } else if (complianceScore < 95) {
      console.log('✅ API 一致性良好，但仍有改善空間。\\n');
    } else {
      console.log('🎉 API 一致性優秀！\\n');
    }
    
    // 生成修復指導
    this.generateFixGuidance(allViolations);
  }

  /**
   * 生成修復指導
   */
  generateFixGuidance(violations) {
    if (violations.length === 0) return;
    
    console.log('🔧 修復指導:\\n');
    
    const groupedByType = violations.reduce((acc, violation) => {
      if (!acc[violation.type]) acc[violation.type] = [];
      acc[violation.type].push(violation);
      return acc;
    }, {});
    
    Object.entries(groupedByType).forEach(([type, typeViolations]) => {
      console.log(`📌 ${type} (${typeViolations.length} 項):`);
      
      switch (type) {
        case 'deprecated_event_handler':
          console.log('   1. 找到使用已棄用事件處理器的文件');
          console.log('   2. 將舊的命名替換為標準命名 (onDataClick, onDataHover)');
          console.log('   3. 更新相關的實現代碼');
          break;
          
        case 'missing_base_inheritance':
          console.log('   1. 確保所有 Props 接口都繼承 BaseChartProps');
          console.log('   2. 添加 "extends BaseChartProps" 到接口定義');
          console.log('   3. 移除重複的基礎屬性定義');
          break;
          
        case 'mixed_data_access_patterns':
          console.log('   1. 選擇統一的數據存取模式 (推薦 accessor 函數)');
          console.log('   2. 移除不一致的 key/accessor 混用');
          console.log('   3. 更新文檔說明推薦的使用方式');
          break;
      }
      console.log('');
    });
  }

  /**
   * 運行驗證
   */
  run() {
    console.log('🚀 開始 API 一致性檢查...\\n');
    
    const analyses = this.scanDirectory(COMPONENTS_DIR);
    this.generateReport(analyses);
  }
}

// 運行檢查
const validator = new APIValidator();
validator.run();