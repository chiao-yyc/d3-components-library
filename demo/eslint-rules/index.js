/**
 * Demo Compliance ESLint Rules
 * 
 * Custom ESLint rules to enforce standardized demo page architecture
 * and maintain consistency across the D3 Components project.
 * 
 * @fileoverview Collection of demo page compliance rules
 * @author D3 Components Team
 */

import requireDemoPageTemplate from './require-demo-page-template.js';
import requireStandardGridLayout from './require-standard-grid-layout.js';

/**
 * Demo compliance plugin containing all custom rules
 * for enforcing standardized demo page architecture.
 */
export const demoCompliancePlugin = {
  meta: {
    name: 'demo-compliance',
    version: '1.0.0',
    description: 'ESLint plugin for D3 Components demo page compliance',
  },
  rules: {
    'require-demo-page-template': requireDemoPageTemplate,
    'require-standard-grid-layout': requireStandardGridLayout,
  }
};

/**
 * Individual rule exports for direct usage
 */
export { 
  requireDemoPageTemplate,
  requireStandardGridLayout,
};

/**
 * Default export for convenience
 */
export default demoCompliancePlugin;