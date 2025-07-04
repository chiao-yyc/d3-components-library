// 基本長條圖資料
export const basicBarData = [
  { category: 'A', value: 30 },
  { category: 'B', value: 80 },
  { category: 'C', value: 45 },
  { category: 'D', value: 60 },
  { category: 'E', value: 20 },
  { category: 'F', value: 90 },
  { category: 'G', value: 55 },
]

// 銷售資料
export const salesData = [
  { month: '1月', sales: 12000 },
  { month: '2月', sales: 15000 },
  { month: '3月', sales: 18000 },
  { month: '4月', sales: 22000 },
  { month: '5月', sales: 19000 },
  { month: '6月', sales: 25000 },
  { month: '7月', sales: 28000 },
  { month: '8月', sales: 26000 },
  { month: '9月', sales: 30000 },
  { month: '10月', sales: 32000 },
  { month: '11月', sales: 29000 },
  { month: '12月', sales: 35000 },
]

// 人口統計資料
export const populationData = [
  { ageGroup: '0-9', population: 1200000 },
  { ageGroup: '10-19', population: 1500000 },
  { ageGroup: '20-29', population: 1800000 },
  { ageGroup: '30-39', population: 2200000 },
  { ageGroup: '40-49', population: 1900000 },
  { ageGroup: '50-59', population: 1600000 },
  { ageGroup: '60-69', population: 1300000 },
  { ageGroup: '70+', population: 1100000 },
]

// 產品評分資料
export const productRatingData = [
  { product: 'iPhone', rating: 4.5 },
  { product: 'Samsung', rating: 4.2 },
  { product: 'Google Pixel', rating: 4.3 },
  { product: 'OnePlus', rating: 4.0 },
  { product: 'Xiaomi', rating: 3.8 },
  { product: 'Huawei', rating: 3.9 },
]

// 城市溫度資料
export const temperatureData = [
  { city: '台北', temperature: 28 },
  { city: '台中', temperature: 32 },
  { city: '台南', temperature: 35 },
  { city: '高雄', temperature: 33 },
  { city: '花蓮', temperature: 30 },
  { city: '台東', temperature: 34 },
]

// 股票價格資料
export const stockData = [
  { company: 'Apple', price: 150.25 },
  { company: 'Microsoft', price: 280.50 },
  { company: 'Google', price: 2500.75 },
  { company: 'Amazon', price: 3200.00 },
  { company: 'Tesla', price: 800.30 },
  { company: 'Meta', price: 320.45 },
]

// 網站流量資料
export const trafficData = [
  { day: '週一', visitors: 12000 },
  { day: '週二', visitors: 13500 },
  { day: '週三', visitors: 15800 },
  { day: '週四', visitors: 14200 },
  { day: '週五', visitors: 16500 },
  { day: '週六', visitors: 18900 },
  { day: '週日', visitors: 17200 },
]

// 預定義的顏色方案
export const colorSchemes = {
  default: ['#3b82f6'],
  blue: ['#1e40af', '#3b82f6', '#60a5fa'],
  green: ['#059669', '#10b981', '#34d399'],
  red: ['#dc2626', '#ef4444', '#f87171'],
  purple: ['#7c3aed', '#8b5cf6', '#a78bfa'],
  gradient: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6'],
  rainbow: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'],
}

// 資料集選項
export const datasetOptions = [
  { label: '基本資料', value: 'basic', data: basicBarData, xKey: 'category', yKey: 'value' },
  { label: '銷售資料', value: 'sales', data: salesData, xKey: 'month', yKey: 'sales' },
  { label: '人口統計', value: 'population', data: populationData, xKey: 'ageGroup', yKey: 'population' },
  { label: '產品評分', value: 'rating', data: productRatingData, xKey: 'product', yKey: 'rating' },
  { label: '城市溫度', value: 'temperature', data: temperatureData, xKey: 'city', yKey: 'temperature' },
  { label: '股票價格', value: 'stock', data: stockData, xKey: 'company', yKey: 'price' },
  { label: '網站流量', value: 'traffic', data: trafficData, xKey: 'day', yKey: 'visitors' },
]