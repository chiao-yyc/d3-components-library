import { Link } from 'react-router-dom'
import { ExactFunnelChart } from '@registry/components/basic/exact-funnel-chart'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

// 獨立的 TreeMap 參考實現
function TreeMapReference() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // 清除之前的內容
    d3.select(svgRef.current).selectAll("*").remove()

    // 測試數據 - 基於參考檔案的格式
    const data = {
      name: "root",
      children: [
        {
          name: "技術部",
          children: [
            { name: "前端開發", value: 50 },
            { name: "後端開發", value: 80 },
            { name: "移動開發", value: 30 },
            { name: "測試", value: 25 }
          ]
        },
        {
          name: "產品部",
          children: [
            { name: "產品經理", value: 15 },
            { name: "UI/UX設計", value: 20 },
            { name: "數據分析", value: 12 }
          ]
        },
        {
          name: "市場部", 
          children: [
            { name: "市場營銷", value: 18 },
            { name: "商務拓展", value: 22 },
            { name: "客服", value: 15 }
          ]
        }
      ]
    }

    // 設置尺寸和邊距
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // 創建 SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // 基於參考檔案 treemap.js 的邏輯
    // 創建層次結構
    const root = d3.hierarchy(data)
      .sum(d => d.value || 0) // 計算每個節點的值

    // 創建 treemap 佈局
    d3.treemap()
      .size([width, height])
      .padding(2)
      (root)

    // 創建顏色比例尺
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // 渲染矩形
    g.selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style("stroke", "white")
      .style("stroke-width", 2)
      .style("fill", (d, i) => color(i.toString()))
      .style("opacity", 0.8)

    // 添加文字標籤
    g.selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("x", d => d.x0 + 5)
      .attr("y", d => d.y0 + 20)
      .text(d => d.data.name)
      .attr("font-size", "14px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "white")
      .attr("font-weight", "bold")

    // 添加數值標籤
    g.selectAll(".value-label")
      .data(root.leaves())
      .join("text")
      .attr("class", "value-label")
      .attr("x", d => d.x0 + 5)
      .attr("y", d => d.y0 + 40)
      .text(d => d.data.value)
      .attr("font-size", "12px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "white")

  }, [])

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        🌳 TreeMap 參考實現
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <p className="text-gray-600 text-center mt-4 text-sm">
        基於 D3.js 官方範例的獨立 TreeMap 實現，確認基本功能正常
      </p>
    </div>
  )
}

function Home() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            D3 Components Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            即時開發預覽環境，直接引用 Registry 中的組件
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              長條圖組件
            </h3>
            <p className="text-gray-600 mb-4">
              提供互動式長條圖，支援多種資料格式和自訂配置
            </p>
            <Link
              to="/bar-chart"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              查看範例
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              資料映射器
            </h3>
            <p className="text-gray-600 mb-4">
              智慧資料偵測、欄位映射和即時圖表預覽功能
            </p>
            <Link
              to="/data-mapper"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              體驗功能
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              組件庫
            </h3>
            <p className="text-gray-600 mb-4">
              瀏覽所有可用的 D3 組件，查看完整的組件展示
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              瀏覽組件
            </Link>
          </div>
        </div>

        {/* TreeMap Reference Demo */}
        <div className="mt-16">
          <TreeMapReference />
        </div>


        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            開發預覽環境特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                即時預覽
              </h3>
              <p className="text-gray-600">
                修改 Registry 組件後立即看到效果，支援熱重載
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                互動控制
              </h3>
              <p className="text-gray-600">
                提供 props 控制面板，即時調整參數和配置
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                多資料測試
              </h3>
              <p className="text-gray-600">
                內建多種測試資料集，驗證組件在不同情境下的表現
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home