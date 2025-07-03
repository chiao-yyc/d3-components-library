# 部署自動化任務

## 任務概述
建立完整的 CI/CD 自動化部署流程，確保程式碼品質、自動化測試、版本管理和發布流程。

## 主要目標
1. 建立 GitHub Actions CI/CD 流程
2. 實作自動化測試和品質檢查
3. 建立自動化發布和版本管理
4. 實作文件自動部署

## 執行階段

### Phase 1: CI/CD 基礎設置 (優先級: 高)

#### 任務 1.1: GitHub Actions 工作流程
- **目標**: 建立基本的 CI/CD 工作流程
- **位置**: `.github/workflows/`
- **需求**:

```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20.x'

jobs:
  # 程式碼品質檢查
  lint-and-format:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install root dependencies
      run: npm ci
    
    - name: Install CLI dependencies
      run: |
        cd cli
        npm ci
    
    - name: Run ESLint (Root)
      run: npm run lint
    
    - name: Run ESLint (CLI)
      run: |
        cd cli
        npm run lint
    
    - name: Check TypeScript types (Root)
      run: npm run type-check
    
    - name: Check TypeScript types (CLI)
      run: |
        cd cli
        npm run type-check
    
    - name: Check Prettier formatting
      run: |
        npm run format:check
        cd cli && npm run format:check

  # Registry 驗證
  validate-registry:
    name: Validate Registry
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate registry structure
      run: npm run registry:validate
    
    - name: Check registry consistency
      run: npm run registry:check

  # CLI 工具測試
  test-cli:
    name: Test CLI
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: cli/package-lock.json
    
    - name: Install CLI dependencies
      run: |
        cd cli
        npm ci
    
    - name: Run unit tests
      run: |
        cd cli
        npm run test:unit
    
    - name: Build CLI
      run: |
        cd cli
        npm run build
    
    - name: Run integration tests
      run: |
        cd cli
        npm run test:integration
    
    - name: Upload CLI coverage
      uses: codecov/codecov-action@v4
      with:
        file: cli/coverage/lcov.info
        flags: cli
        token: ${{ secrets.CODECOV_TOKEN }}

  # 組件測試
  test-components:
    name: Test Components
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run component tests
      run: npm run test:components
    
    - name: Upload component coverage
      uses: codecov/codecov-action@v4
      with:
        file: coverage/lcov.info
        flags: components
        token: ${{ secrets.CODECOV_TOKEN }}

  # 文件同步檢查
  check-docs:
    name: Check Documentation
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check docs sync
      run: npm run docs:check
    
    - name: Generate docs
      run: npm run docs:generate
    
    - name: Check for doc changes
      run: |
        if [ -n "$(git status --porcelain docs/)" ]; then
          echo "❌ 文件不是最新的，請執行 npm run docs:generate"
          git status --porcelain docs/
          exit 1
        else
          echo "✅ 文件是最新的"
        fi

  # 安全性掃描
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run npm audit (Root)
      run: npm audit --audit-level moderate
    
    - name: Run npm audit (CLI)
      run: |
        cd cli
        npm audit --audit-level moderate
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v3
      with:
        languages: typescript
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

#### 任務 1.2: Pull Request 檢查
- **目標**: 為 PR 建立專門的檢查流程
- **位置**: `.github/workflows/pr-check.yml`
- **需求**:

```yaml
# .github/workflows/pr-check.yml
name: Pull Request Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  # 基礎檢查
  basic-checks:
    name: Basic Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # 需要完整歷史來比較變更
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd cli && npm ci
    
    # 檢查 commit 訊息格式
    - name: Check commit messages
      run: |
        # 檢查 conventional commits 格式
        npx commitlint --from ${{ github.event.pull_request.base.sha }} --to HEAD

    # 檢查檔案變更
    - name: Check changed files
      run: |
        # 獲取變更的檔案
        git diff --name-only ${{ github.event.pull_request.base.sha }}..HEAD > changed_files.txt
        
        # 檢查是否有敏感檔案變更
        if grep -E "\.(env|key|pem|p12)$" changed_files.txt; then
          echo "❌ 偵測到敏感檔案變更"
          exit 1
        fi
        
        # 檢查大檔案
        find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" > large_files.txt
        if [ -s large_files.txt ]; then
          echo "⚠️ 偵測到大檔案:"
          cat large_files.txt
        fi

  # 變更影響分析
  impact-analysis:
    name: Change Impact Analysis
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Analyze changes
      id: changes
      uses: dorny/paths-filter@v3
      with:
        filters: |
          cli:
            - 'cli/**'
          registry:
            - 'registry/**'
          docs:
            - 'docs/**'
          workflows:
            - '.github/workflows/**'
          root:
            - 'package.json'
            - 'package-lock.json'
    
    - name: Comment PR with impact
      uses: actions/github-script@v7
      with:
        script: |
          const changes = {
            cli: ${{ steps.changes.outputs.cli }},
            registry: ${{ steps.changes.outputs.registry }},
            docs: ${{ steps.changes.outputs.docs }},
            workflows: ${{ steps.changes.outputs.workflows }},
            root: ${{ steps.changes.outputs.root }}
          }
          
          let comment = "## 🔍 變更影響分析\n\n"
          
          if (changes.cli === 'true') {
            comment += "- 🔧 **CLI 工具**: 需要測試 CLI 功能\n"
          }
          if (changes.registry === 'true') {
            comment += "- 📦 **Registry**: 需要驗證組件完整性\n"
          }
          if (changes.docs === 'true') {
            comment += "- 📚 **文件**: 需要檢查文件同步\n"
          }
          if (changes.workflows === 'true') {
            comment += "- ⚙️ **工作流程**: 需要額外注意 CI/CD 變更\n"
          }
          if (changes.root === 'true') {
            comment += "- 🌳 **根目錄**: 需要檢查依賴變更\n"
          }
          
          if (Object.values(changes).every(v => v === 'false')) {
            comment += "- ✅ 僅影響非關鍵檔案\n"
          }
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          })

  # 效能測試
  performance-test:
    name: Performance Test
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'performance')
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Upload performance results
      uses: actions/upload-artifact@v4
      with:
        name: performance-results
        path: performance-results.json
```

### Phase 2: 自動化發布流程 (優先級: 高)

#### 任務 2.1: 版本管理和發布
- **目標**: 建立自動化版本管理和發布流程
- **位置**: `.github/workflows/release.yml`
- **需求**:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  # 檢查是否需要發布
  check-release:
    name: Check Release
    runs-on: ubuntu-latest
    outputs:
      should-release: ${{ steps.check.outputs.should-release }}
      version: ${{ steps.check.outputs.version }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Check if release needed
      id: check
      run: |
        # 檢查是否有 release 相關的 commit
        if git log --oneline -1 | grep -E "(release|version|bump):"; then
          echo "should-release=true" >> $GITHUB_OUTPUT
          
          # 從 CLI package.json 讀取版本
          cd cli
          VERSION=$(node -p "require('./package.json').version")
          echo "version=v$VERSION" >> $GITHUB_OUTPUT
        else
          echo "should-release=false" >> $GITHUB_OUTPUT
        fi

  # 執行完整測試
  full-test:
    name: Full Test Suite
    needs: check-release
    if: needs.check-release.outputs.should-release == 'true'
    uses: ./.github/workflows/ci.yml

  # 發布 CLI 到 NPM
  publish-cli:
    name: Publish CLI to NPM
    needs: [check-release, full-test]
    if: needs.check-release.outputs.should-release == 'true'
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        registry-url: 'https://registry.npmjs.org'
        cache: 'npm'
        cache-dependency-path: cli/package-lock.json
    
    - name: Install CLI dependencies
      run: |
        cd cli
        npm ci
    
    - name: Build CLI
      run: |
        cd cli
        npm run build
    
    - name: Run final tests
      run: |
        cd cli
        npm run test
    
    - name: Publish to NPM
      run: |
        cd cli
        npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    
    - name: Create npm package artifact
      run: |
        cd cli
        npm pack
        mv *.tgz ../d3-components-cli.tgz
    
    - name: Upload package artifact
      uses: actions/upload-artifact@v4
      with:
        name: npm-package
        path: d3-components-cli.tgz

  # 創建 GitHub Release
  create-release:
    name: Create GitHub Release
    needs: [check-release, publish-cli]
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Generate changelog
      id: changelog
      run: |
        # 生成更新日誌
        LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
        
        if [ -z "$LAST_TAG" ]; then
          COMMITS=$(git log --oneline --pretty=format:"- %s" HEAD)
        else
          COMMITS=$(git log --oneline --pretty=format:"- %s" $LAST_TAG..HEAD)
        fi
        
        # 分類 commits
        FEATURES=$(echo "$COMMITS" | grep -E "^- (feat|feature)" || echo "")
        FIXES=$(echo "$COMMITS" | grep -E "^- (fix|bugfix)" || echo "")
        OTHERS=$(echo "$COMMITS" | grep -vE "^- (feat|feature|fix|bugfix)" || echo "")
        
        # 構建 changelog
        CHANGELOG="## What's Changed\n\n"
        
        if [ -n "$FEATURES" ]; then
          CHANGELOG="${CHANGELOG}### ✨ New Features\n$FEATURES\n\n"
        fi
        
        if [ -n "$FIXES" ]; then
          CHANGELOG="${CHANGELOG}### 🐛 Bug Fixes\n$FIXES\n\n"
        fi
        
        if [ -n "$OTHERS" ]; then
          CHANGELOG="${CHANGELOG}### 📝 Other Changes\n$OTHERS\n\n"
        fi
        
        # 保存到檔案
        echo -e "$CHANGELOG" > changelog.md
        
        # 輸出給 GitHub Actions
        EOF=$(dd if=/dev/urandom bs=15 count=1 status=none | base64)
        echo "changelog<<$EOF" >> $GITHUB_OUTPUT
        cat changelog.md >> $GITHUB_OUTPUT
        echo "$EOF" >> $GITHUB_OUTPUT
    
    - name: Download npm package
      uses: actions/download-artifact@v4
      with:
        name: npm-package
    
    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ needs.check-release.outputs.version }}
        release_name: Release ${{ needs.check-release.outputs.version }}
        body: ${{ steps.changelog.outputs.changelog }}
        draft: false
        prerelease: false
    
    - name: Upload Release Asset
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ steps.create-release.outputs.upload_url }}
        asset_path: ./d3-components-cli.tgz
        asset_name: d3-components-cli-${{ needs.check-release.outputs.version }}.tgz
        asset_content_type: application/gzip
```

#### 任務 2.2: 自動化版本更新
- **目標**: 建立自動化版本更新腳本
- **位置**: `scripts/bump-version.js`
- **需求**:

```javascript
#!/usr/bin/env node
// scripts/bump-version.js

const fs = require('fs-extra')
const path = require('path')
const { execSync } = require('child_process')
const semver = require('semver')

const RELEASE_TYPES = ['major', 'minor', 'patch', 'prerelease']

async function bumpVersion() {
  const args = process.argv.slice(2)
  const releaseType = args[0]
  
  if (!RELEASE_TYPES.includes(releaseType)) {
    console.error('❌ 無效的版本類型。支援的類型:', RELEASE_TYPES.join(', '))
    process.exit(1)
  }
  
  try {
    // 1. 檢查工作目錄是否乾淨
    checkWorkingDirectory()
    
    // 2. 確保在 main 分支
    ensureMainBranch()
    
    // 3. 拉取最新代碼
    console.log('📥 拉取最新代碼...')
    execSync('git pull origin main', { stdio: 'inherit' })
    
    // 4. 執行測試
    console.log('🧪 執行測試...')
    await runTests()
    
    // 5. 更新版本號
    console.log(`📈 更新版本號 (${releaseType})...`)
    const newVersion = await updatePackageVersion(releaseType)
    
    // 6. 更新 CHANGELOG
    console.log('📝 更新 CHANGELOG...')
    await updateChangelog(newVersion)
    
    // 7. 提交變更
    console.log('💾 提交變更...')
    execSync(`git add .`, { stdio: 'inherit' })
    execSync(`git commit -m "release: bump version to v${newVersion}"`, { stdio: 'inherit' })
    
    // 8. 創建標籤
    console.log('🏷️ 創建版本標籤...')
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' })
    
    // 9. 推送到遠端
    console.log('🚀 推送到遠端...')
    execSync('git push origin main', { stdio: 'inherit' })
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' })
    
    console.log(`✅ 版本更新完成！新版本: v${newVersion}`)
    console.log('🔄 GitHub Actions 將自動處理發布流程')
    
  } catch (error) {
    console.error('❌ 版本更新失敗:', error.message)
    process.exit(1)
  }
}

function checkWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' })
    if (status.trim()) {
      throw new Error('工作目錄不乾淨，請先提交或儲存變更')
    }
  } catch (error) {
    throw new Error('無法檢查 Git 狀態')
  }
}

function ensureMainBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    if (branch !== 'main') {
      throw new Error('請切換到 main 分支再執行版本更新')
    }
  } catch (error) {
    throw new Error('無法檢查當前分支')
  }
}

async function runTests() {
  try {
    // 執行 linting
    execSync('npm run lint', { stdio: 'inherit' })
    execSync('cd cli && npm run lint', { stdio: 'inherit' })
    
    // 執行測試
    execSync('cd cli && npm test', { stdio: 'inherit' })
    
    // 驗證 registry
    execSync('npm run registry:validate', { stdio: 'inherit' })
    
  } catch (error) {
    throw new Error('測試失敗，無法繼續版本更新')
  }
}

async function updatePackageVersion(releaseType) {
  const cliPackagePath = path.join(__dirname, '../cli/package.json')
  const packageJson = await fs.readJSON(cliPackagePath)
  
  const currentVersion = packageJson.version
  const newVersion = semver.inc(currentVersion, releaseType)
  
  if (!newVersion) {
    throw new Error(`無法計算新版本號: ${currentVersion} -> ${releaseType}`)
  }
  
  // 更新 CLI package.json
  packageJson.version = newVersion
  await fs.writeJSON(cliPackagePath, packageJson, { spaces: 2 })
  
  // 更新根目錄 package.json（如果存在版本欄位）
  const rootPackagePath = path.join(__dirname, '../package.json')
  if (await fs.pathExists(rootPackagePath)) {
    const rootPackage = await fs.readJSON(rootPackagePath)
    if (rootPackage.version) {
      rootPackage.version = newVersion
      await fs.writeJSON(rootPackagePath, rootPackage, { spaces: 2 })
    }
  }
  
  console.log(`版本更新: ${currentVersion} -> ${newVersion}`)
  return newVersion
}

async function updateChangelog(newVersion) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md')
  
  // 生成變更日誌條目
  const today = new Date().toISOString().split('T')[0]
  const newEntry = `## [${newVersion}] - ${today}

### Added
- 新功能

### Changed
- 變更內容

### Fixed
- 修復問題

`
  
  let changelog = ''
  if (await fs.pathExists(changelogPath)) {
    changelog = await fs.readFile(changelogPath, 'utf-8')
    
    // 在第一個 ## 之前插入新條目
    const lines = changelog.split('\n')
    const firstHeaderIndex = lines.findIndex(line => line.startsWith('## '))
    
    if (firstHeaderIndex !== -1) {
      lines.splice(firstHeaderIndex, 0, newEntry)
      changelog = lines.join('\n')
    } else {
      changelog = newEntry + changelog
    }
  } else {
    changelog = `# Changelog

All notable changes to this project will be documented in this file.

${newEntry}`
  }
  
  await fs.writeFile(changelogPath, changelog)
}

// 處理命令行參數
if (require.main === module) {
  bumpVersion()
}

module.exports = { bumpVersion }
```

### Phase 3: 文件自動部署 (優先級: 中)

#### 任務 3.1: GitHub Pages 部署
- **目標**: 自動部署文件到 GitHub Pages
- **位置**: `.github/workflows/deploy-docs.yml`
- **需求**:

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Documentation

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**', 'registry/**' ]
  workflow_dispatch:

jobs:
  build-docs:
    name: Build Documentation
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate API docs
      run: npm run docs:generate
    
    - name: Build static site
      run: npm run docs:build
    
    - name: Upload docs artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: docs/dist

  deploy-docs:
    name: Deploy to GitHub Pages
    needs: build-docs
    runs-on: ubuntu-latest
    
    permissions:
      pages: write
      id-token: write
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

#### 任務 3.2: 文件建構腳本
- **目標**: 建立文件建構和最佳化腳本
- **位置**: `scripts/build-docs.js`
- **需求**:

```javascript
// scripts/build-docs.js
const fs = require('fs-extra')
const path = require('path')
const { marked } = require('marked')
const hljs = require('highlight.js')

class DocsBuilder {
  constructor() {
    this.sourceDir = path.join(__dirname, '../docs')
    this.outputDir = path.join(__dirname, '../docs/dist')
    this.templateDir = path.join(__dirname, '../docs/templates')
  }
  
  async build() {
    console.log('📚 開始建構文件...')
    
    try {
      // 1. 清理輸出目錄
      await fs.remove(this.outputDir)
      await fs.ensureDir(this.outputDir)
      
      // 2. 複製靜態資源
      await this.copyAssets()
      
      // 3. 處理 Markdown 檔案
      await this.processMarkdownFiles()
      
      // 4. 生成導覽和索引
      await this.generateNavigation()
      
      // 5. 生成搜尋索引
      await this.generateSearchIndex()
      
      // 6. 最佳化資源
      await this.optimizeAssets()
      
      console.log('✅ 文件建構完成！')
      
    } catch (error) {
      console.error('❌ 文件建構失敗:', error)
      process.exit(1)
    }
  }
  
  async copyAssets() {
    console.log('📁 複製靜態資源...')
    
    const assetDirs = ['assets', 'images', 'css', 'js']
    
    for (const dir of assetDirs) {
      const sourcePath = path.join(this.sourceDir, dir)
      const outputPath = path.join(this.outputDir, dir)
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, outputPath)
      }
    }
  }
  
  async processMarkdownFiles() {
    console.log('📝 處理 Markdown 檔案...')
    
    // 配置 marked
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value
        }
        return hljs.highlightAuto(code).value
      }
    })
    
    const markdownFiles = await this.findMarkdownFiles(this.sourceDir)
    
    for (const file of markdownFiles) {
      await this.processMarkdownFile(file)
    }
  }
  
  async findMarkdownFiles(dir) {
    const files = []
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory() && entry.name !== 'dist' && entry.name !== 'templates') {
        const subFiles = await this.findMarkdownFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
    
    return files
  }
  
  async processMarkdownFile(filePath) {
    const relativePath = path.relative(this.sourceDir, filePath)
    const outputPath = path.join(this.outputDir, relativePath.replace('.md', '.html'))
    
    // 確保輸出目錄存在
    await fs.ensureDir(path.dirname(outputPath))
    
    // 讀取 Markdown 內容
    const markdown = await fs.readFile(filePath, 'utf-8')
    
    // 解析前置元數據
    const { content, frontMatter } = this.parseFrontMatter(markdown)
    
    // 轉換為 HTML
    const htmlContent = marked(content)
    
    // 載入模板
    const template = await this.loadTemplate('page.html')
    
    // 替換模板變數
    const html = template
      .replace('{{title}}', frontMatter.title || path.basename(filePath, '.md'))
      .replace('{{content}}', htmlContent)
      .replace('{{navigation}}', await this.generateNavigationHTML())
      .replace('{{breadcrumb}}', this.generateBreadcrumb(relativePath))
    
    // 寫入檔案
    await fs.writeFile(outputPath, html)
  }
  
  parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = markdown.match(frontMatterRegex)
    
    if (match) {
      const frontMatter = {}
      const lines = match[1].split('\n')
      
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          frontMatter[key.trim()] = valueParts.join(':').trim()
        }
      }
      
      return {
        frontMatter,
        content: match[2]
      }
    }
    
    return {
      frontMatter: {},
      content: markdown
    }
  }
  
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templateDir, templateName)
    
    if (await fs.pathExists(templatePath)) {
      return await fs.readFile(templatePath, 'utf-8')
    }
    
    // 預設模板
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - D3 Components</title>
    <link rel="stylesheet" href="/css/docs.css">
    <link rel="stylesheet" href="/css/highlight.css">
</head>
<body>
    <header>
        <h1>D3 Components</h1>
        {{navigation}}
    </header>
    <main>
        {{breadcrumb}}
        {{content}}
    </main>
    <script src="/js/docs.js"></script>
</body>
</html>`
  }
  
  async generateNavigationHTML() {
    // 簡化的導覽生成
    return `<nav>
      <ul>
        <li><a href="/index.html">首頁</a></li>
        <li><a href="/guides/getting-started.html">快速開始</a></li>
        <li><a href="/api/">API 文件</a></li>
        <li><a href="/examples/">範例</a></li>
      </ul>
    </nav>`
  }
  
  generateBreadcrumb(relativePath) {
    const parts = relativePath.split(path.sep)
    const breadcrumbs = ['<a href="/">首頁</a>']
    
    let currentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += parts[i] + '/'
      breadcrumbs.push(`<a href="/${currentPath}">${parts[i]}</a>`)
    }
    
    // 當前頁面
    const currentPage = path.basename(parts[parts.length - 1], '.md')
    breadcrumbs.push(`<span>${currentPage}</span>`)
    
    return `<nav class="breadcrumb">${breadcrumbs.join(' > ')}</nav>`
  }
  
  async generateSearchIndex() {
    console.log('🔍 生成搜尋索引...')
    
    // 這裡可以實作全文搜尋索引
    // 簡化版本先跳過
  }
  
  async optimizeAssets() {
    console.log('⚡ 最佳化資源...')
    
    // 這裡可以實作 CSS/JS 壓縮
    // 圖片最佳化等
  }
}

// 執行建構
if (require.main === module) {
  const builder = new DocsBuilder()
  builder.build()
}

module.exports = DocsBuilder
```

### Phase 4: 監控和通知 (優先級: 低)

#### 任務 4.1: 部署狀態監控
- **目標**: 監控部署狀態並發送通知
- **位置**: `.github/workflows/notify.yml`
- **需求**:

```yaml
# .github/workflows/notify.yml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["Release", "Deploy Documentation"]
    types: [completed]

jobs:
  notify-success:
    name: Notify Success
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    
    steps:
    - name: Send success notification
      uses: actions/github-script@v7
      with:
        script: |
          const workflowName = '${{ github.event.workflow_run.name }}'
          const runUrl = '${{ github.event.workflow_run.html_url }}'
          
          let message = ''
          
          if (workflowName === 'Release') {
            message = `🎉 新版本發布成功！\n\n✅ CLI 工具已發布到 NPM\n✅ GitHub Release 已創建\n\n🔗 [查看詳情](${runUrl})`
          } else if (workflowName === 'Deploy Documentation') {
            message = `📚 文件更新成功！\n\n✅ 文件已部署到 GitHub Pages\n✅ API 文件已更新\n\n🔗 [查看詳情](${runUrl})`
          }
          
          // 發送到 Slack（如果配置了）
          if (process.env.SLACK_WEBHOOK) {
            await fetch(process.env.SLACK_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: message,
                channel: '#deployments',
                username: 'GitHub Actions',
                icon_emoji: ':rocket:'
              })
            })
          }

  notify-failure:
    name: Notify Failure
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    
    steps:
    - name: Send failure notification
      uses: actions/github-script@v7
      with:
        script: |
          const workflowName = '${{ github.event.workflow_run.name }}'
          const runUrl = '${{ github.event.workflow_run.html_url }}'
          
          const message = `❌ ${workflowName} 執行失敗\n\n請檢查工作流程日誌並修復問題。\n\n🔗 [查看詳情](${runUrl})`
          
          // 創建 Issue
          await github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: `🚨 ${workflowName} 執行失敗`,
            body: message,
            labels: ['bug', 'ci/cd']
          })
```

## 執行檢查清單

### Phase 1 完成標準
- [ ] GitHub Actions 工作流程建立完成
- [ ] CI/CD 流程可正常運行
- [ ] 程式碼品質檢查通過
- [ ] 安全性掃描設置完成

### Phase 2 完成標準
- [ ] 自動化發布流程可運作
- [ ] 版本管理腳本可正確執行
- [ ] NPM 發布自動化完成
- [ ] GitHub Release 自動創建

### Phase 3 完成標準
- [ ] 文件自動部署可運作
- [ ] 文件建構腳本完成
- [ ] GitHub Pages 部署成功
- [ ] 文件搜尋和導覽正常

### Phase 4 完成標準
- [ ] 部署狀態監控設置完成
- [ ] 通知機制可正常運作
- [ ] 失敗處理流程完整
- [ ] 監控報告清晰明確

## 成功指標

### 自動化程度
- **CI/CD 覆蓋率**: 100% (所有變更都經過自動化檢查)
- **發布自動化**: 90% (大部分發布流程自動化)
- **文件同步率**: 95% (文件與程式碼自動同步)

### 可靠性指標
- **CI/CD 成功率**: > 95%
- **部署成功率**: > 98%
- **回復時間**: < 15 分鐘
- **平均建構時間**: < 5 分鐘

### 品質指標
- **測試覆蓋率**: 維持在設定門檻以上
- **安全漏洞**: 0 個中高風險漏洞
- **效能回歸**: 自動檢測並報告

## 維護策略

1. **定期更新**: 每月檢查和更新 Actions 版本
2. **監控改進**: 持續優化建構時間和成功率
3. **安全審查**: 定期檢查 secrets 和權限設置
4. **文檔維護**: 保持部署流程文檔最新

## 後續優化

完成基礎自動化後，可進一步優化：
- 實作多環境部署 (staging, production)
- 加入自動化效能測試
- 實作回滾機制
- 加入更詳細的監控和警報系統