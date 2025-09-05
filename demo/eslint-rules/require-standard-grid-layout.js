/**
 * ESLint Rule: require-standard-grid-layout
 * 
 * Encourages use of standardized grid layout pattern for consistency
 * across all demo pages.
 * 
 * @fileoverview Demo pages should use standardized grid layout pattern
 * @author D3 Components Team
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Demo pages should use standardized grid layout pattern',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      preferStandardGrid: 'Consider using standard grid layout: "grid grid-cols-1 lg:grid-cols-4 gap-8"',
      nonStandardGridDetected: 'Non-standard grid layout detected. Consider using: "grid grid-cols-1 lg:grid-cols-4 gap-8" for consistency',
    },
  },

  create(context) {
    const filename = context.getFilename();
    const isPageFile = /\/pages\/.*\.tsx$/.test(filename);
    
    // Only check files in pages directory
    if (!isPageFile) return {};

    // Standard grid pattern we want to encourage
    const standardGridPattern = 'lg:grid-cols-4';
    
    return {
      // Check all div elements with className attributes
      JSXElement(node) {
        // Only check div elements
        if (node.openingElement.name?.name !== 'div') return;

        // Find className attribute
        const classAttr = node.openingElement.attributes.find(
          attr => attr.name?.name === 'className' && attr.type === 'JSXAttribute'
        );
        
        if (!classAttr || !classAttr.value) return;

        let className = '';

        // Handle different value types
        if (classAttr.value.type === 'Literal') {
          className = classAttr.value.value;
        } else if (classAttr.value.type === 'JSXExpressionContainer') {
          // Handle template literals and string concatenations
          const expression = classAttr.value.expression;
          if (expression.type === 'TemplateLiteral') {
            className = expression.quasis.map(q => q.value.cooked).join('');
          }
          // For more complex expressions, we'll skip analysis
          return;
        }

        if (typeof className !== 'string') return;

        // Check for grid layouts that don't follow standard pattern
        const hasGrid = className.includes('grid');
        const hasGridCols = className.includes('grid-cols');
        const hasStandardPattern = className.includes(standardGridPattern);

        // Report if using grid system but not standard pattern
        if (hasGrid && hasGridCols && !hasStandardPattern) {
          // Additional check: ignore if it's just a nested grid or special case
          const isMainLayoutGrid = className.includes('gap-') && 
                                  (className.includes('grid-cols-1') || className.includes('grid-cols-2') || className.includes('grid-cols-3'));
          
          if (isMainLayoutGrid) {
            context.report({
              node: classAttr,
              messageId: 'preferStandardGrid',
            });
          }
        }
      }
    };
  }
};