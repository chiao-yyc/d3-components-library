/**
 * ESLint Rule: require-demo-page-template
 * 
 * Ensures all demo pages use the standardized DemoPageTemplate component
 * for consistent layout and user experience.
 * 
 * @fileoverview Demo pages must use DemoPageTemplate component
 * @author D3 Components Team
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Demo pages must use DemoPageTemplate component',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      missingDemoPageTemplate: 'Demo page "{{pageName}}" must use DemoPageTemplate as root component for standardized layout',
      missingModernControlPanel: 'Demo page "{{pageName}}" should use ModernControlPanel for consistent control UI',
      missingChartContainer: 'Demo page "{{pageName}}" should use ChartContainer for chart display area',
    },
  },

  create(context) {
    const filename = context.getFilename();
    const isPageFile = /\/pages\/.*\.tsx$/.test(filename);
    
    // Only check files in pages directory
    if (!isPageFile) return {};

    const pageName = filename.split('/').pop()?.replace('.tsx', '') || 'Unknown';
    let hasDemoPageTemplate = false;
    let hasModernControlPanel = false;
    let hasChartContainer = false;
    let imports = [];

    // Pages exempt from this rule
    const exemptPages = ['Home.tsx', 'Gallery.tsx', 'ChartsShowcase.tsx', 'BarChartDemoV2.tsx', 'DataProcessorTestDemo.tsx'];
    const currentPageFile = filename.split('/').pop();

    return {
      // Track imports of required components
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string') {
          if (source.includes('DemoPageTemplate')) {
            imports.push('DemoPageTemplate');
          }
          if (source.includes('ModernControlPanel')) {
            imports.push('ModernControlPanel');
          }
          if (source.includes('ChartContainer')) {
            imports.push('ChartContainer');
          }
        }
      },

      // Track usage of required components
      JSXElement(node) {
        const elementName = node.openingElement.name?.name;
        
        if (elementName === 'DemoPageTemplate') {
          hasDemoPageTemplate = true;
        }
        if (elementName === 'ModernControlPanel') {
          hasModernControlPanel = true;
        }
        if (elementName === 'ChartContainer') {
          hasChartContainer = true;
        }
      },

      // Check compliance at end of file processing
      'Program:exit'() {
        // Skip exempt pages
        if (exemptPages.includes(currentPageFile)) return;

        // Check if DemoPageTemplate is imported but not used
        if (imports.includes('DemoPageTemplate') && !hasDemoPageTemplate) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: 'missingDemoPageTemplate',
            data: { pageName },
          });
        }

        // Optional: Check for ModernControlPanel usage (warning level)
        if (!hasModernControlPanel && !exemptPages.includes(currentPageFile)) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: 'missingModernControlPanel',
            data: { pageName },
          });
        }
      }
    };
  }
};