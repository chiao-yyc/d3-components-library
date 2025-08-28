#!/usr/bin/env node

/**
 * TypeScript API Documentation Generator
 * 基於 TypeScript 定義自動生成精確的 API 文檔
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../components');
const OUTPUT_DIR = path.join(__dirname, '../../docs/api');

class TypeScriptAPIDocGenerator {
  constructor() {
    this.program = null;
    this.checker = null;
    this.componentDocs = new Map();
  }

  /**
   * 初始化 TypeScript 編譯器
   */
  initializeTypeScript() {
    const configPath = path.join(__dirname, '../tsconfig.json');
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const configParseResult = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(configParseResult.fileNames, configParseResult.options);
    this.checker = this.program.getTypeChecker();
  }

  /**
   * 分析 TypeScript 介面定義
   */
  analyzeInterface(declaration, sourceFile) {
    const symbol = this.checker.getSymbolAtLocation(declaration.name);
    if (!symbol) return null;

    const type = this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    const properties = [];

    // 獲取所有屬性
    for (const prop of type.getProperties()) {
      const propType = this.checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
      const propDeclaration = prop.valueDeclaration;
      
      let propInfo = {
        name: prop.name,
        type: this.checker.typeToString(propType),
        optional: propDeclaration && propDeclaration.questionToken ? true : false,
        description: this.getJSDocDescription(prop),
        defaultValue: this.getDefaultValue(prop)
      };

      // 檢查是否為已廢棄的屬性
      const jsDocTags = prop.getJsDocTags(this.checker);
      propInfo.deprecated = jsDocTags.some(tag => tag.name === 'deprecated');
      if (propInfo.deprecated) {
        propInfo.deprecationNote = jsDocTags
          .find(tag => tag.name === 'deprecated')?.text?.[0]?.text || '';
      }

      properties.push(propInfo);
    }

    return {
      name: declaration.name.text,
      description: this.getJSDocDescription(symbol),
      properties,
      extends: this.getExtendsInfo(declaration),
      sourceFile: path.relative(COMPONENTS_DIR, sourceFile.fileName)
    };
  }

  /**
   * 獲取 JSDoc 註釋描述
   */
  getJSDocDescription(symbol) {
    const docs = symbol.getDocumentationComment(this.checker);
    return docs.map(doc => doc.text).join('');
  }

  /**
   * 獲取預設值
   */
  getDefaultValue(symbol) {
    const jsDocTags = symbol.getJsDocTags(this.checker);
    const defaultTag = jsDocTags.find(tag => tag.name === 'default');
    return defaultTag?.text?.[0]?.text || '';
  }

  /**
   * 獲取繼承資訊
   */
  getExtendsInfo(declaration) {
    if (declaration.heritageClauses) {
      return declaration.heritageClauses
        .filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
        .map(clause => clause.types.map(type => type.expression.text))
        .flat();
    }
    return [];
  }

  /**
   * 分析組件檔案
   */
  analyzeComponentFile(filePath) {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) return null;

    const interfaces = [];
    const types = [];
    const enums = [];

    // 遍歷所有節點
    const visit = (node) => {
      if (ts.isInterfaceDeclaration(node)) {
        // 只處理 Props 相關的介面
        if (node.name.text.includes('Props') || node.name.text.includes('Config')) {
          const interfaceInfo = this.analyzeInterface(node, sourceFile);
          if (interfaceInfo) interfaces.push(interfaceInfo);
        }
      } else if (ts.isTypeAliasDeclaration(node)) {
        types.push({
          name: node.name.text,
          type: node.type ? this.checker.typeToString(this.checker.getTypeFromTypeNode(node.type)) : 'unknown',
          description: this.getJSDocDescription(this.checker.getSymbolAtLocation(node.name))
        });
      } else if (ts.isEnumDeclaration(node)) {
        enums.push({
          name: node.name.text,
          values: node.members.map(member => ({
            name: member.name?.text || '',
            value: member.initializer ? member.initializer.text || member.initializer.getText() : ''
          }))
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
      interfaces,
      types,
      enums,
      sourceFile: path.relative(COMPONENTS_DIR, filePath)
    };
  }

  /**
   * 尋找組件的 types.ts 檔案
   */
  findComponentTypes() {
    const components = [];
    const categories = ['basic', 'statistical', 'financial', 'composite'];

    categories.forEach(category => {
      const categoryPath = path.join(COMPONENTS_DIR, category);
      
      if (fs.existsSync(categoryPath)) {
        const items = fs.readdirSync(categoryPath);
        
        items.forEach(item => {
          const itemPath = path.join(categoryPath, item);
          const isDirectory = fs.lstatSync(itemPath).isDirectory();
          
          if (isDirectory) {
            // 尋找 types.ts 檔案
            const typesPath = path.join(itemPath, 'types.ts');
            const coreTypesPath = path.join(itemPath, 'core', 'types.ts');
            
            if (fs.existsSync(typesPath)) {
              components.push({
                name: item,
                category,
                typesPath,
                coreTypesPath: fs.existsSync(coreTypesPath) ? coreTypesPath : null
              });
            }
          }
        });
      }
    });

    return components;
  }

  /**
   * 生成 Markdown API 文檔
   */
  generateMarkdownDoc(componentInfo, apiData) {
    let markdown = `# ${componentInfo.name} API 參考\n\n`;
    markdown += `> 自動生成於 ${new Date().toISOString().split('T')[0]}\n\n`;
    
    if (apiData.interfaces.length > 0) {
      markdown += `## 🔧 介面定義\n\n`;
      
      apiData.interfaces.forEach(interfaceInfo => {
        markdown += `### ${interfaceInfo.name}\n\n`;
        
        if (interfaceInfo.description) {
          markdown += `${interfaceInfo.description}\n\n`;
        }

        if (interfaceInfo.extends.length > 0) {
          markdown += `**繼承**: \`${interfaceInfo.extends.join(', ')}\`\n\n`;
        }

        markdown += `| 屬性 | 類型 | 必需 | 預設值 | 說明 |\n`;
        markdown += `|------|------|------|--------|------|\n`;

        interfaceInfo.properties.forEach(prop => {
          const required = prop.optional ? '❌' : '✅';
          const deprecated = prop.deprecated ? '⚠️ **已廢棄** ' : '';
          const description = deprecated + (prop.description || '-');
          
          markdown += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | \`${prop.defaultValue || '-'}\` | ${description} |\n`;
        });

        markdown += `\n`;
      });
    }

    if (apiData.types.length > 0) {
      markdown += `## 📝 類型別名\n\n`;
      
      apiData.types.forEach(type => {
        markdown += `### ${type.name}\n\n`;
        markdown += `\`\`\`typescript\n`;
        markdown += `type ${type.name} = ${type.type};\n`;
        markdown += `\`\`\`\n\n`;
        
        if (type.description) {
          markdown += `${type.description}\n\n`;
        }
      });
    }

    if (apiData.enums.length > 0) {
      markdown += `## 🏷️ 枚舉類型\n\n`;
      
      apiData.enums.forEach(enumInfo => {
        markdown += `### ${enumInfo.name}\n\n`;
        markdown += `| 值 | 說明 |\n`;
        markdown += `|----|------|\n`;
        
        enumInfo.values.forEach(value => {
          markdown += `| \`${value.name}\` | ${value.value || '-'} |\n`;
        });
        
        markdown += `\n`;
      });
    }

    markdown += `## 📁 來源檔案\n\n`;
    markdown += `- **類型定義**: \`${apiData.sourceFile}\`\n`;
    markdown += `- **組件位置**: \`${componentInfo.category}/${componentInfo.name}/\`\n\n`;

    return markdown;
  }

  /**
   * 執行文檔生成
   */
  run() {
    console.log('🔧 初始化 TypeScript 編譯器...');
    this.initializeTypeScript();

    console.log('🔍 尋找組件類型定義...');
    const components = this.findComponentTypes();
    
    console.log(`📊 找到 ${components.length} 個組件需要生成 API 文檔\n`);

    // 確保輸出目錄存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let successCount = 0;
    let errorCount = 0;

    components.forEach(component => {
      try {
        console.log(`📝 處理 ${component.category}/${component.name}...`);

        // 分析 types.ts
        const apiData = this.analyzeComponentFile(component.typesPath);
        
        if (apiData && apiData.interfaces.length > 0) {
          // 生成 Markdown 文檔
          const markdown = this.generateMarkdownDoc(component, apiData);
          
          // 寫入文件
          const outputPath = path.join(OUTPUT_DIR, `${component.name}.md`);
          fs.writeFileSync(outputPath, markdown);
          
          console.log(`   ✅ 已生成: ${outputPath}`);
          successCount++;
        } else {
          console.log(`   ⚠️  跳過: 未找到 Props 介面定義`);
        }

      } catch (error) {
        console.log(`   ❌ 錯誤: ${error.message}`);
        errorCount++;
      }
    });

    console.log(`\n📊 生成統計:`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失敗: ${errorCount}`);
    console.log(`📁 總計: ${components.length}`);

    if (successCount > 0) {
      console.log(`\n📚 API 文檔已生成到: ${OUTPUT_DIR}`);
      console.log('🎉 基於 TypeScript 定義的 API 文檔生成完成！');
    }
  }
}

// 執行 API 文檔生成器
const generator = new TypeScriptAPIDocGenerator();
generator.run();