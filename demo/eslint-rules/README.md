# Demo Compliance ESLint Rules

Custom ESLint rules for enforcing standardized architecture across D3 Components demo pages.

## 📁 File Structure

```
eslint-rules/
├── index.js                        # Main export file
├── require-demo-page-template.js   # Rule: Enforce DemoPageTemplate usage
├── require-standard-grid-layout.js # Rule: Encourage standard grid layouts
└── README.md                       # This documentation
```

## 🔧 Rules

### 1. `require-demo-page-template`

**Level**: Error  
**Purpose**: Ensures all demo pages use the standardized `DemoPageTemplate` component

**Checks**:
- ✅ `DemoPageTemplate` is imported and used as root component
- ⚠️ `ModernControlPanel` usage (warning level)
- ⚠️ `ChartContainer` usage (warning level)

**Exempt Pages**: `Home.tsx`, `Gallery.tsx`, `ChartsShowcase.tsx`

**Example Violation**:
```tsx
// ❌ Bad: Missing DemoPageTemplate
export default function MyDemo() {
  return <div>My demo content</div>
}

// ✅ Good: Using DemoPageTemplate
export default function MyDemo() {
  return (
    <DemoPageTemplate title="My Demo">
      <div>My demo content</div>
    </DemoPageTemplate>
  )
}
```

### 2. `require-standard-grid-layout`

**Level**: Warning  
**Purpose**: Encourages use of standardized grid layout pattern

**Standard Pattern**: `"grid grid-cols-1 lg:grid-cols-4 gap-8"`

**Detection**: Flags grid layouts that don't use the `lg:grid-cols-4` pattern

**Example**:
```tsx
// ⚠️ Warning: Non-standard grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

// ✅ Preferred: Standard grid
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
```

## 🚀 Usage

The rules are automatically loaded via `eslint.config.js`:

```js
import { demoCompliancePlugin } from './eslint-rules/index.js';

export default [{
  plugins: {
    'demo-compliance': demoCompliancePlugin,
  },
  rules: {
    'demo-compliance/require-demo-page-template': 'error',
    'demo-compliance/require-standard-grid-layout': 'warn',
  }
}];
```

## 📊 Running Checks

```bash
# Run ESLint with compliance rules
npm run lint:compliance

# Run full compliance check (ESLint + architecture)
npm run check:full

# Run architecture-only check
npm run check:compliance
```

## 🔍 How It Works

### Rule Execution Flow

1. **File Detection**: Rules only run on files matching `/\/pages\/.*\.tsx$/`
2. **Import Tracking**: Monitor imports of required components
3. **Usage Validation**: Check JSX elements for component usage
4. **Exemption Handling**: Skip certain pages based on whitelist
5. **Report Generation**: Generate specific error/warning messages

### Integration with Git Hooks

Pre-commit hook automatically runs:
```bash
cd demo
npm run lint:compliance    # Run ESLint rules
npm run check:compliance   # Run architecture check
```

## 📈 Current Compliance Status

As of latest check:
- ✅ **Fully Compliant**: 40/43 pages (93.0%)
- ⚠️ **Partially Compliant**: 1/43 pages (2.3%)
- ❌ **Non-Compliant**: 2/43 pages (4.7%)
- 🎯 **Overall Score**: 96.9%

## 🛠 Development

### Adding New Rules

1. Create new rule file: `new-rule-name.js`
2. Export rule object with `meta` and `create` functions
3. Add to `index.js` exports
4. Update `eslint.config.js` rules section
5. Update this README

### Testing Rules

```bash
# Test specific rule on a file
npx eslint src/pages/MyDemo.tsx --rule 'demo-compliance/require-demo-page-template: error'

# Test all rules
npm run lint:compliance
```

## 📚 Reference

- [ESLint Custom Rules Guide](https://eslint.org/docs/latest/extend/custom-rules)
- [Demo Architecture Standards](../DEMO_ARCHITECTURE.md)
- [Project Documentation](../../../CLAUDE.md)