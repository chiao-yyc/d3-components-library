#!/usr/bin/env node

/**
 * Documentation Generator
 * 為所有組件批次生成基本 README 文檔
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../components');
const TEMPLATE_PATH = path.join(__dirname, '../../templates/README-template.md');

class DocumentationGenerator {
  constructor() {
    this.componentInfo = {
      // Basic Charts
      'basic/area-chart': { 
        name: 'AreaChart 區域圖', 
        description: '可堆疊的區域圖組件，適合顯示時間序列數據和數量變化趨勢',
        features: ['時間序列顯示', '堆疊模式', '漸變填充', '平滑曲線']
      },
      'basic/bar-chart': { 
        name: 'BarChart 長條圖', 
        description: '經典長條圖組件，支援橫向和縱向顯示，適合類別數據比較',
        features: ['水平/垂直方向', '分組長條', '顏色映射', '動畫效果']
      },
      'basic/line-chart': { 
        name: 'LineChart 折線圖', 
        description: '多系列折線圖組件，適合顯示趨勢變化和數據連續性',
        features: ['多系列顯示', '平滑曲線', '數據點標記', '趨勢分析']
      },
      'basic/pie-chart': { 
        name: 'PieChart 圓餅圖', 
        description: '圓餅圖和甜甜圈圖組件，適合顯示比例關係和佔比數據',
        features: ['甜甜圈模式', '標籤顯示', '互動選擇', '動畫效果']
      },
      'basic/gauge-chart': { 
        name: 'GaugeChart 儀表板', 
        description: '儀表板圖表組件，適合顯示 KPI 指標和進度狀態',
        features: ['扇形顯示', 'KPI 指標', '閾值設定', '彩色分段']
      },
      'basic/heatmap': { 
        name: 'Heatmap 熱力圖', 
        description: '熱力圖組件，適合顯示矩陣數據和相關性分析',
        features: ['顏色映射', '數值範圍', '格式化顯示', '互動懸停']
      },
      
      // Statistical Charts  
      'statistical/box-plot': { 
        name: 'BoxPlot 盒型圖', 
        description: '盒型圖組件，適合顯示數據分佈和統計摘要信息',
        features: ['四分位數', '異常值檢測', '分組比較', '統計摘要']
      },
      'statistical/radar-chart': { 
        name: 'RadarChart 雷達圖', 
        description: '多維度雷達圖組件，適合顯示多指標綜合評估',
        features: ['多維評估', '極坐標系', '指標比較', '填充區域']
      },
      'statistical/tree-map': { 
        name: 'TreeMap 樹狀圖', 
        description: '層次化樹狀圖組件，適合顯示層次結構和比例關係',
        features: ['層次結構', '面積映射', '顏色編碼', '鑽取導覽']
      },
      'statistical/violin-plot': { 
        name: 'ViolinPlot 小提琴圖', 
        description: '小提琴圖組件，結合盒型圖和密度圖的統計視覺化',
        features: ['分佈形狀', '密度顯示', '四分位數', '統計比較']
      },
      'statistical/correlogram': { 
        name: 'Correlogram 相關性矩陣', 
        description: '相關性矩陣視覺化組件，適合顯示變數間相關係數',
        features: ['相關係數', '矩陣顯示', '色彩映射', '三角模式']
      },
      
      // Financial Charts
      'financial/candlestick-chart': { 
        name: 'CandlestickChart K線圖', 
        description: '專業股市 K 線圖組件，適合金融數據分析和技術分析',
        features: ['OHLC 數據', '成交量', '技術指標', '時間軸縮放']
      }
    };
  }

  /**
   * 讀取模板文件
   */
  loadTemplate() {
    if (!fs.existsSync(TEMPLATE_PATH)) {
      throw new Error(`模板文件不存在: ${TEMPLATE_PATH}`);
    }
    return fs.readFileSync(TEMPLATE_PATH, 'utf8');
  }

  /**
   * 生成組件文檔
   */
  generateComponentDoc(componentPath, template) {
    const componentKey = path.relative(COMPONENTS_DIR, componentPath);
    const componentName = path.basename(componentPath);
    const category = path.dirname(componentKey);
    
    // 獲取組件信息
    const info = this.componentInfo[componentKey] || {
      name: `${componentName} 組件`,
      description: '此組件的描述待補充',
      features: ['基本功能', '數據顯示', '互動支援']
    };

    // 替換模板變數
    let doc = template
      .replace(/ComponentName/g, componentName.charAt(0).toUpperCase() + componentName.slice(1))
      .replace(/組件名稱/g, info.name)
      .replace(/簡要描述組件的功能和用途。/g, info.description);

    // 替換功能特色
    const featuresText = info.features.map(feature => `- ✅ **${feature}** - ${feature}相關功能`).join('\n');
    doc = doc.replace(/- ✅ \*\*主要功能 1\*\* - 功能描述\n- ✅ \*\*主要功能 2\*\* - 功能描述/g, featuresText);

    // 更新 import 路徑
    const importPath = category === 'basic' ? 'basic' : 
                      category === 'statistical' ? 'statistical' : 
                      category === 'financial' ? 'financial' : category;
    
    doc = doc.replace(/@d3-components\/registry/g, `@d3-components/${importPath}`);
    
    // 更新相對路徑
    const backPath = category.includes('/') ? '../../../..' : '../../..';
    doc = doc.replace(/\.\.\/\.\.\/\.\.\/\.\./g, backPath);

    return doc;
  }

  /**
   * 獲取所有需要生成文檔的組件
   */
  getComponentsToDocument() {
    const components = [];
    const categories = ['basic', 'statistical', 'financial'];
    
    categories.forEach(category => {
      const categoryPath = path.join(COMPONENTS_DIR, category);
      
      if (fs.existsSync(categoryPath)) {
        const items = fs.readdirSync(categoryPath).filter(item => {
          const itemPath = path.join(categoryPath, item);
          const isDirectory = fs.statSync(itemPath).isDirectory();
          const hasReadme = fs.existsSync(path.join(itemPath, 'README.md'));
          
          // 只為沒有 README 的組件生成文檔
          return isDirectory && !hasReadme;
        });
        
        items.forEach(item => {
          components.push(path.join(categoryPath, item));
        });
      }
    });
    
    return components;
  }

  /**
   * 運行文檔生成
   */
  run() {
    console.log('📚 開始批次生成組件文檔...\\n');
    
    const template = this.loadTemplate();
    const components = this.getComponentsToDocument();
    
    if (components.length === 0) {
      console.log('✅ 所有組件都已有 README 文檔！');
      return;
    }
    
    console.log(`🔍 找到 ${components.length} 個需要生成文檔的組件:\\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    components.forEach(componentPath => {
      const componentName = path.basename(componentPath);
      const relativePath = path.relative(COMPONENTS_DIR, componentPath);
      
      try {
        console.log(`📝 生成 ${relativePath}...`);
        
        const doc = this.generateComponentDoc(componentPath, template);
        const readmePath = path.join(componentPath, 'README.md');
        
        fs.writeFileSync(readmePath, doc, 'utf8');
        
        console.log(`   ✅ 已生成: ${readmePath}`);
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ 失敗: ${error.message}`);
        errorCount++;
      }
    });
    
    console.log(`\\n📊 生成統計:`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失敗: ${errorCount}`);
    console.log(`📁 總計: ${components.length}`);
    
    if (successCount > 0) {
      console.log('\\n🎉 文檔生成完成！建議檢查生成的文檔並進行個別調整。');
    }
  }
}

// 運行文檔生成器
const generator = new DocumentationGenerator();
generator.run();