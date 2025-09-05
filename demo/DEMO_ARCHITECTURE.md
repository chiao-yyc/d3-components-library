# Demo Page Architecture Standards

## 📋 Overview

This document outlines the standardized architecture for all demo pages in the D3 Components project. Following these guidelines ensures consistency, maintainability, and a better user experience.

## 🏗️ Required Components

### 1. DemoPageTemplate
**Purpose**: Provides consistent page structure, breadcrumbs, and navigation
**Usage**: Must be the root component for all demo pages (except Home, Gallery, ChartsShowcase)

```tsx
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'

export default function MyDemo() {
  return (
    <DemoPageTemplate
      title="My Demo Title"
      description="Brief description of the demo functionality"
    >
      {/* Page content here */}
    </DemoPageTemplate>
  )
}
```

### 2. Grid Layout Standard
**Pattern**: `grid grid-cols-1 lg:grid-cols-4 gap-8`
**Layout**: 1/4 controls + 3/4 chart display on large screens, stacked on mobile

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  <div className="space-y-6">
    {/* Controls sidebar - 1/4 width */}
  </div>
  <div className="lg:col-span-3 space-y-6">
    {/* Main content area - 3/4 width */}
  </div>
</div>
```

### 3. ModernControlPanel
**Purpose**: Standardized control interface with consistent styling
**Features**: Collapsible sections, consistent spacing, responsive design

```tsx
import { ModernControlPanel } from '../components/ui/ModernControlPanel'

<ModernControlPanel>
  <div className="space-y-4">
    <h4 className="font-medium mb-3">Configuration</h4>
    {/* Control elements */}
  </div>
</ModernControlPanel>
```

### 4. ChartContainer
**Purpose**: Responsive chart wrapper with consistent dimensions and styling
**Features**: Auto-sizing, loading states, error boundaries

```tsx
import { ChartContainer } from '../components/ui/ChartContainer'

<ChartContainer>
  <MyChart data={data} {...chartProps} />
</ChartContainer>
```

## 📊 Supporting Components

### StatusDisplay
Shows key metrics and status information

```tsx
import { StatusDisplay } from '../components/ui/ModernControlPanel'

<StatusDisplay items={[
  { label: 'Data Points', value: data.length, color: '#3b82f6' },
  { label: 'Chart Type', value: chartType, color: '#10b981' }
]} />
```

### DataTable
Displays data in a structured table format

```tsx
import { DataTable } from '../components/ui/DataTable'

<DataTable 
  data={data} 
  maxRows={5}
  title="Sample Data"
/>
```

### CodeExample
Shows relevant code snippets with syntax highlighting

```tsx
import { CodeExample } from '../components/ui/CodeExample'

<CodeExample code={`
const chartConfig = {
  width: 800,
  height: 400,
  data: myData
}
`} />
```

## 🔍 ESLint Rules

We've implemented custom ESLint rules to enforce these standards:

### demo-compliance/require-demo-page-template
- **Level**: Error
- **Purpose**: Ensures all demo pages use DemoPageTemplate
- **Exemptions**: Home.tsx, Gallery.tsx, ChartsShowcase.tsx

### demo-compliance/require-standard-grid-layout  
- **Level**: Warning
- **Purpose**: Encourages use of standardized grid layout pattern
- **Pattern**: `grid grid-cols-1 lg:grid-cols-4 gap-8`

## 🎯 Page Types & Compliance

### Fully Compliant Pages (34/34)
✅ Use DemoPageTemplate as root component  
✅ Follow standard grid layout (1/4 + 3/4)  
✅ Use ModernControlPanel for controls  
✅ Use ChartContainer for chart display  
✅ Include supporting components (StatusDisplay, DataTable, CodeExample)

### Special Pages (Exempt from some rules)
- **Home.tsx**: Custom layout for landing page
- **Gallery.tsx**: Interactive chart browser with custom UI
- **ChartsShowcase.tsx**: Grid overview of all chart types

## 🚀 Creating a New Demo Page

1. **Start with Template**:
```tsx
import React, { useState, useMemo } from 'react'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { ModernControlPanel } from '../components/ui/ModernControlPanel'
import { ChartContainer } from '../components/ui/ChartContainer'
import { MyChart } from '../../../registry/components/...'

export default function MyNewDemo() {
  const [config, setConfig] = useState(defaultConfig)
  
  return (
    <DemoPageTemplate
      title="My New Chart Demo"
      description="Demonstration of MyChart functionality"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <ModernControlPanel>
            {/* Controls */}
          </ModernControlPanel>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <ChartContainer>
            <MyChart {...chartProps} />
          </ChartContainer>
        </div>
      </div>
    </DemoPageTemplate>
  )
}
```

2. **Add to Routing**: Update `App.tsx` with new route
3. **Add to Navigation**: Update `Layout.tsx` sidebar
4. **Run Lint Check**: `npm run lint` to verify compliance

## 📝 Development Commands

```bash
# Check compliance
npm run lint

# Type checking
npm run type-check

# Build project
npm run build

# Development server
npm run dev
```

## 🔧 Troubleshooting

### Common Issues

1. **ESLint Error: Missing DemoPageTemplate**
   - Ensure you import and use DemoPageTemplate as root component
   - Check that the import path is correct

2. **Warning: Non-standard grid layout**
   - Use `grid grid-cols-1 lg:grid-cols-4 gap-8` for consistency
   - Exceptions allowed for special layouts with justification

3. **Missing ModernControlPanel**
   - Import and use ModernControlPanel for all control interfaces
   - Wrap control elements in proper spacing containers

### Best Practices

- **Responsive Design**: Always test layouts on different screen sizes
- **Performance**: Use React.memo() for expensive chart components
- **Accessibility**: Include proper ARIA labels and keyboard navigation
- **Data Handling**: Use useMemo() for expensive data transformations
- **Error Handling**: Implement error boundaries for chart components

## 📈 Future Enhancements

- **Automated Testing**: Unit tests for compliance checking
- **Visual Regression**: Screenshot testing for layout consistency
- **Performance Monitoring**: Bundle size and render time tracking
- **Documentation**: Auto-generated component API docs