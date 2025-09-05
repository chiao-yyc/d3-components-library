#!/usr/bin/env node

/**
 * Demo Page Compliance Checker
 * 
 * Automatically scans all demo pages and reports compliance status
 * against the standardized architecture guidelines.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(__dirname, '../src/pages');

// Compliance criteria
const REQUIRED_COMPONENTS = {
  'DemoPageTemplate': {
    required: true,
    exemptions: ['Home.tsx', 'Gallery.tsx', 'ChartsShowcase.tsx'],
    severity: 'error'
  },
  'ModernControlPanel': {
    required: false,
    severity: 'warning'
  },
  'ChartContainer': {
    required: false,
    severity: 'info'
  }
};

const LAYOUT_PATTERNS = {
  'lg:grid-cols-4': {
    description: 'Standard 4-column grid layout',
    severity: 'warning'
  }
};

class ComplianceChecker {
  constructor() {
    this.results = {
      totalPages: 0,
      compliant: 0,
      partiallyCompliant: 0,
      nonCompliant: 0,
      issues: []
    };
  }

  checkFile(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const pageResult = {
      fileName,
      issues: [],
      score: 100
    };

    // Check required components
    Object.entries(REQUIRED_COMPONENTS).forEach(([component, config]) => {
      if (config.exemptions?.includes(fileName)) return;
      
      const hasImport = content.includes(component);
      const hasUsage = new RegExp(`<${component}[\\s>]`).test(content);
      
      if (config.required && (!hasImport || !hasUsage)) {
        pageResult.issues.push({
          type: config.severity,
          component,
          message: `Missing required component: ${component}`
        });
        pageResult.score -= (config.severity === 'error' ? 30 : 10);
      }
    });

    // Check layout patterns
    Object.entries(LAYOUT_PATTERNS).forEach(([pattern, config]) => {
      if (!content.includes(pattern) && content.includes('grid') && content.includes('grid-cols')) {
        pageResult.issues.push({
          type: config.severity,
          component: 'Layout',
          message: `Consider using standard layout pattern: ${pattern}`
        });
        pageResult.score -= 5;
      }
    });

    // Determine compliance level
    if (pageResult.score >= 90) {
      this.results.compliant++;
    } else if (pageResult.score >= 70) {
      this.results.partiallyCompliant++;
    } else {
      this.results.nonCompliant++;
    }

    return pageResult;
  }

  run() {
    console.log('🔍 Demo Page Compliance Report');
    console.log('================================\n');

    const files = fs.readdirSync(PAGES_DIR)
      .filter(file => file.endsWith('.tsx'))
      .sort();

    this.results.totalPages = files.length;

    files.forEach(file => {
      const filePath = path.join(PAGES_DIR, file);
      const result = this.checkFile(filePath);
      
      // Console output with colors
      const statusIcon = result.score >= 90 ? '✅' : result.score >= 70 ? '⚠️' : '❌';
      const scoreColor = result.score >= 90 ? '\x1b[32m' : result.score >= 70 ? '\x1b[33m' : '\x1b[31m';
      
      console.log(`${statusIcon} ${file}: ${scoreColor}${result.score}%\x1b[0m`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          const icon = issue.type === 'error' ? '  🚫' : issue.type === 'warning' ? '  ⚠️' : '  💡';
          console.log(`${icon} ${issue.message}`);
        });
        console.log();
      }

      this.results.issues.push({
        fileName: file,
        ...result
      });
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Summary');
    console.log('===========');
    console.log(`Total Pages: ${this.results.totalPages}`);
    console.log(`✅ Fully Compliant: ${this.results.compliant} (${(this.results.compliant/this.results.totalPages*100).toFixed(1)}%)`);
    console.log(`⚠️  Partially Compliant: ${this.results.partiallyCompliant} (${(this.results.partiallyCompliant/this.results.totalPages*100).toFixed(1)}%)`);
    console.log(`❌ Non-Compliant: ${this.results.nonCompliant} (${(this.results.nonCompliant/this.results.totalPages*100).toFixed(1)}%)`);

    const overallScore = this.results.issues.reduce((sum, item) => sum + item.score, 0) / this.results.totalPages;
    console.log(`\n🎯 Overall Compliance Score: ${overallScore.toFixed(1)}%`);

    if (this.results.nonCompliant > 0) {
      console.log('\n📚 For compliance guidelines, see: DEMO_ARCHITECTURE.md');
      process.exit(1);
    }
  }
}

// Run the checker
const checker = new ComplianceChecker();
checker.run();