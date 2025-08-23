#!/usr/bin/env node

/**
 * Component Registry Health Check
 * 全面檢查組件庫健康狀況
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 目錄配置
const COMPONENTS_DIR = path.join(__dirname, '../components');
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

class HealthChecker {
  constructor() {
    this.results = {
      architecture: { score: 0, issues: [], total: 0, passed: 0 },
      apiConsistency: { score: 0, issues: [], total: 0, passed: 0 },
      typeSafety: { score: 0, issues: [], total: 0, passed: 0 },
      performance: { score: 0, issues: [], total: 0, passed: 0 },
      composition: { score: 0, issues: [], total: 0, passed: 0 },
      testing: { score: 0, issues: [], total: 0, passed: 0 },
      documentation: { score: 0, issues: [], total: 0, passed: 0 }
    };
    
    this.componentStats = [];
  }

  /**
   * 1. 架構合規性檢查
   */
  checkArchitecture(componentPath) {
    const issues = [];
    const componentName = path.basename(componentPath);
    
    // 檢查文件結構
    const expectedFiles = [
      'index.ts',
      `${componentName}.tsx`,
      'core/types.ts'
    ];
    
    const coreDir = path.join(componentPath, 'core');
    if (!fs.existsSync(coreDir)) {
      issues.push({
        type: 'missing_core_directory',
        severity: 'high',
        message: '缺少 core 目錄結構'
      });
      return { total: 2, passed: 0, issues };
    }
    
    const coreLogicFiles = fs.readdirSync(coreDir).filter(
      f => f.endsWith('.ts') && !f.endsWith('.test.ts')
    );
    
    if (coreLogicFiles.length === 0) {
      issues.push({
        type: 'missing_core_logic',
        severity: 'high',
        message: `缺少核心邏輯文件 (core/*.ts)`
      });
    }
    
    // 檢查 BaseChart 繼承
    const coreFiles = coreLogicFiles.map(f => 
      path.join(componentPath, 'core', f)
    ).filter(f => fs.existsSync(f));
    
    let extendsBaseChart = false;
    for (const file of coreFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('extends BaseChart') || content.includes('BaseChart<')) {
          extendsBaseChart = true;
          break;
        }
      } catch (error) {
        // 忽略讀取錯誤
      }
    }
    
    if (!extendsBaseChart) {
      issues.push({
        type: 'missing_base_chart',
        severity: 'high',
        message: '核心邏輯未繼承 BaseChart 抽象類'
      });
    }
    
    return {
      total: 2,
      passed: 2 - issues.length,
      issues
    };
  }

  /**
   * 2. API 一致性檢查
   */
  checkApiConsistency(componentPath) {
    const issues = [];
    const typesFile = path.join(componentPath, 'core/types.ts');
    
    if (!fs.existsSync(typesFile)) {
      issues.push({
        type: 'missing_types',
        severity: 'high',
        message: '缺少類型定義文件 (core/types.ts)'
      });
      return { total: 1, passed: 0, issues };
    }
    
    try {
      const content = fs.readFileSync(typesFile, 'utf8');
      
      // 檢查 BaseChartProps 繼承
      if (!content.includes('extends BaseChartProps')) {
        issues.push({
          type: 'missing_base_props',
          severity: 'high',
          message: 'Props 接口未繼承 BaseChartProps'
        });
      }
      
      // 檢查事件處理器命名
      const deprecatedHandlers = ['onCandleClick', 'onValueChange', 'onAreaClick', 'onBarClick'];
      deprecatedHandlers.forEach(handler => {
        if (content.includes(handler)) {
          issues.push({
            type: 'deprecated_event_handler',
            severity: 'medium',
            message: `使用已棄用的事件處理器: ${handler}`
          });
        }
      });
      
    } catch (error) {
      issues.push({
        type: 'types_read_error',
        severity: 'high',
        message: '無法讀取類型定義文件'
      });
    }
    
    return {
      total: 3,
      passed: 3 - issues.length,
      issues
    };
  }

  /**
   * 3. 類型安全檢查
   */
  checkTypeSafety(componentPath) {
    const issues = [];
    
    // 檢查 TypeScript 文件
    const tsFiles = this.getAllTsFiles(componentPath);
    let hasAnyTypes = false;
    let totalTsFiles = tsFiles.length;
    
    tsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // 檢查是否使用了 any 類型 (簡單檢查)
        const anyMatches = content.match(/:\\s*any[\\s;,\\)\\]]/g);
        if (anyMatches && anyMatches.length > 2) { // 允許少量 any 使用
          hasAnyTypes = true;
          issues.push({
            type: 'excessive_any_usage',
            severity: 'medium',
            message: `${path.relative(componentPath, file)} 過度使用 any 類型 (${anyMatches.length} 處)`
          });
        }
      } catch (error) {
        // 忽略讀取錯誤
      }
    });
    
    return {
      total: totalTsFiles > 0 ? 2 : 1,
      passed: totalTsFiles > 0 ? (hasAnyTypes ? 1 : 2) : 1,
      issues
    };
  }

  /**
   * 4. 性能檢查
   */
  checkPerformance(componentPath) {
    const issues = [];
    const reactFile = this.findReactComponent(componentPath);
    
    if (!reactFile) {
      issues.push({
        type: 'missing_react_component',
        severity: 'high',
        message: '找不到 React 組件文件'
      });
      return { total: 1, passed: 0, issues };
    }
    
    try {
      const content = fs.readFileSync(reactFile, 'utf8');
      
      // 檢查記憶化使用
      const hasMemo = content.includes('useMemo') || content.includes('useCallback');
      if (!hasMemo) {
        issues.push({
          type: 'missing_memoization',
          severity: 'medium', 
          message: '未使用 useMemo 或 useCallback 優化性能'
        });
      }
      
      // 檢查 useEffect 清理
      const hasUseEffect = content.includes('useEffect');
      const hasCleanup = content.includes('return () =>') || content.includes('return function');
      
      if (hasUseEffect && !hasCleanup) {
        issues.push({
          type: 'missing_cleanup',
          severity: 'medium',
          message: 'useEffect 可能缺少清理函數'
        });
      }
      
    } catch (error) {
      issues.push({
        type: 'performance_analysis_failed',
        severity: 'low',
        message: '無法分析性能模式'
      });
    }
    
    return {
      total: 3,
      passed: 3 - issues.length,
      issues
    };
  }

  /**
   * 5. 組合能力檢查
   */
  checkComposition(componentPath) {
    const issues = [];
    
    // 檢查是否支援標準 props
    const typesFile = path.join(componentPath, 'core/types.ts');
    if (fs.existsSync(typesFile)) {
      try {
        const content = fs.readFileSync(typesFile, 'utf8');
        
        // 檢查基本組合支援
        const compositionFeatures = [
          'className', 'style', 'width', 'height', 'margin'
        ];
        
        const missingFeatures = compositionFeatures.filter(
          feature => !content.includes(feature)
        );
        
        if (missingFeatures.length > 0) {
          issues.push({
            type: 'missing_composition_props',
            severity: 'medium',
            message: `缺少組合支援屬性: ${missingFeatures.join(', ')}`
          });
        }
        
      } catch (error) {
        // 忽略錯誤
      }
    }
    
    return {
      total: 1,
      passed: 1 - issues.length,
      issues
    };
  }

  /**
   * 6. 測試檢查
   */
  checkTesting(componentPath) {
    const issues = [];
    
    // 檢查測試文件存在
    const testFiles = this.getAllTestFiles(componentPath);
    
    if (testFiles.length === 0) {
      issues.push({
        type: 'no_tests',
        severity: 'critical',
        message: '完全缺少測試文件'
      });
    } else {
      // 檢查測試內容質量
      testFiles.forEach(testFile => {
        try {
          const content = fs.readFileSync(testFile, 'utf8');
          
          // 基本測試檢查
          const hasBasicTests = [
            'render', 'accessibility', 'data update', 'event'
          ].some(testType => 
            content.toLowerCase().includes(testType.toLowerCase())
          );
          
          if (!hasBasicTests) {
            issues.push({
              type: 'insufficient_test_coverage',
              severity: 'high',
              message: `${path.relative(componentPath, testFile)} 測試覆蓋不足`
            });
          }
        } catch (error) {
          // 忽略讀取錯誤
        }
      });
    }
    
    return {
      total: 2,
      passed: Math.max(0, 2 - issues.length),
      issues
    };
  }

  /**
   * 7. 文檔檢查
   */
  checkDocumentation(componentPath) {
    const issues = [];
    
    // 檢查 README
    const readmeFile = path.join(componentPath, 'README.md');
    if (!fs.existsSync(readmeFile)) {
      issues.push({
        type: 'missing_readme',
        severity: 'high',
        message: '缺少 README.md 文檔'
      });
    }
    
    // 檢查類型註釋
    const typesFile = path.join(componentPath, 'core/types.ts');
    if (fs.existsSync(typesFile)) {
      try {
        const content = fs.readFileSync(typesFile, 'utf8');
        
        // 簡單檢查是否有 JSDoc 註釋
        const hasJsdoc = content.includes('/**') || content.includes('*/');
        if (!hasJsdoc) {
          issues.push({
            type: 'missing_jsdoc',
            severity: 'medium',
            message: '缺少 JSDoc 註釋文檔'
          });
        }
      } catch (error) {
        // 忽略錯誤
      }
    }
    
    return {
      total: 2,
      passed: 2 - issues.length,
      issues
    };
  }

  /**
   * 輔助方法：獲取所有 TypeScript 文件
   */
  getAllTsFiles(dirPath) {
    const tsFiles = [];
    
    const scan = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
            scan(fullPath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            tsFiles.push(fullPath);
          }
        });
      } catch (error) {
        // 忽略錯誤
      }
    };
    
    scan(dirPath);
    return tsFiles;
  }

  /**
   * 輔助方法：獲取所有測試文件
   */
  getAllTestFiles(dirPath) {
    const testFiles = [];
    
    const scan = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
            scan(fullPath);
          } else if (file.includes('.test.') || file.includes('.spec.')) {
            testFiles.push(fullPath);
          }
        });
      } catch (error) {
        // 忽略錯誤
      }
    };
    
    scan(dirPath);
    return testFiles;
  }

  /**
   * 輔助方法：找到 React 組件文件
   */
  findReactComponent(componentPath) {
    const componentName = path.basename(componentPath);
    const possibleFiles = [
      `${componentName}.tsx`,
      `${componentName}.jsx`,
      'index.tsx',
      'index.jsx'
    ];
    
    for (const file of possibleFiles) {
      const fullPath = path.join(componentPath, file);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    return null;
  }

  /**
   * 掃描所有組件
   */
  scanAllComponents() {
    const categories = ['basic', 'statistical', 'financial', 'core', 'primitives', 'composite'];
    
    categories.forEach(category => {
      const categoryPath = path.join(COMPONENTS_DIR, category);
      
      if (fs.existsSync(categoryPath)) {
        const components = fs.readdirSync(categoryPath).filter(item => {
          const itemPath = path.join(categoryPath, item);
          return fs.statSync(itemPath).isDirectory();
        });
        
        components.forEach(component => {
          const componentPath = path.join(categoryPath, component);
          this.checkComponent(componentPath, category);
        });
      }
    });
  }

  /**
   * 檢查單個組件
   */
  checkComponent(componentPath, category) {
    const componentName = path.basename(componentPath);
    
    console.log(`🔍 檢查 ${category}/${componentName}...`);
    
    const checks = {
      architecture: this.checkArchitecture(componentPath),
      apiConsistency: this.checkApiConsistency(componentPath),
      typeSafety: this.checkTypeSafety(componentPath),
      performance: this.checkPerformance(componentPath),
      composition: this.checkComposition(componentPath),
      testing: this.checkTesting(componentPath),
      documentation: this.checkDocumentation(componentPath)
    };
    
    // 計算總分
    let totalScore = 0;
    let maxScore = 0;
    
    Object.entries(checks).forEach(([key, result]) => {
      const score = Math.round((result.passed / result.total) * 100);
      totalScore += score;
      maxScore += 100;
      
      // 累加到全域結果
      this.results[key].total += result.total;
      this.results[key].passed += result.passed;
      this.results[key].issues.push(...result.issues.map(issue => ({
        ...issue,
        component: `${category}/${componentName}`
      })));
    });
    
    const overallScore = Math.round(totalScore / 7);
    
    this.componentStats.push({
      category,
      name: componentName,
      score: overallScore,
      checks
    });
  }

  /**
   * 生成最終報告
   */
  generateReport() {
    console.log('\\n📊 D3 Components Registry 健康檢查報告');
    console.log('='.repeat(50));
    
    // 計算各項目分數
    Object.entries(this.results).forEach(([key, result]) => {
      result.score = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 100;
    });
    
    // 總體健康評分
    const overallScore = Math.round(
      Object.values(this.results).reduce((sum, r) => sum + r.score, 0) / 7
    );
    
    console.log(`\\n🎯 總體健康評分: ${overallScore}/100\\n`);
    
    // 各項目分數
    console.log('📋 分項評分:');
    Object.entries(this.results).forEach(([key, result]) => {
      const emoji = result.score >= 90 ? '🟢' : result.score >= 70 ? '🟡' : '🔴';
      const keyName = {
        architecture: '架構合規性',
        apiConsistency: 'API 一致性',
        typeSafety: '類型安全',
        performance: '性能優化',
        composition: '組合能力',
        testing: '測試覆蓋',
        documentation: '文檔完整性'
      }[key];
      
      console.log(`${emoji} ${keyName}: ${result.score}/100 (${result.passed}/${result.total})`);
    });
    
    // 組件排名
    console.log('\\n🏆 組件健康排名:');
    const sortedComponents = this.componentStats.sort((a, b) => b.score - a.score);
    
    sortedComponents.slice(0, 5).forEach((comp, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${comp.category}/${comp.name}: ${comp.score}/100`);
    });
    
    // 需要關注的組件
    const problemComponents = sortedComponents.filter(comp => comp.score < 60);
    if (problemComponents.length > 0) {
      console.log('\\n⚠️  需要立即關注的組件:');
      problemComponents.forEach(comp => {
        console.log(`🔴 ${comp.category}/${comp.name}: ${comp.score}/100`);
      });
    }
    
    // 關鍵問題匯總
    const criticalIssues = Object.values(this.results)
      .flatMap(r => r.issues)
      .filter(issue => issue.severity === 'critical' || issue.severity === 'high');
    
    if (criticalIssues.length > 0) {
      console.log('\\n🚨 關鍵問題匯總:');
      criticalIssues.slice(0, 10).forEach(issue => {
        console.log(`- ${issue.component}: ${issue.message}`);
      });
    }
    
    console.log('\\n📈 建議行動:');
    if (overallScore < 60) {
      console.log('🔴 健康狀況嚴重，需要立即開始全面重構！');
    } else if (overallScore < 80) {
      console.log('🟡 健康狀況尚可，建議重點改善低分項目。');
    } else {
      console.log('🟢 健康狀況良好，繼續保持並持續改進。');
    }
    
    return overallScore;
  }

  /**
   * 運行完整檢查
   */
  run() {
    console.log('🚀 開始 D3 Components Registry 健康檢查...');
    
    this.scanAllComponents();
    const score = this.generateReport();
    
    console.log('\\n✅ 健康檢查完成！');
    
    // 如果評分過低則退出碼為 1
    if (score < 70) {
      process.exit(1);
    }
  }
}

// 運行健康檢查
const checker = new HealthChecker();
checker.run();