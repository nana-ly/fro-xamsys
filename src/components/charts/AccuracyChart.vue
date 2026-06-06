<template>
  <div ref="chartRef" style="width: 100%; height: 400px"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chartInstance = null

const buildOption = () => {
  const xData = props.data.map(item => `第${item.questionNum}题`)
  const yData = props.data.map(item => item.accuracy)
  const dataCount = xData.length

  const showLabel = dataCount <= 15
  const labelRotate = dataCount > 20 ? 90 : 45
  const needZoom = dataCount > 15
  const barW = dataCount > 25 ? 14 : dataCount > 12 ? 20 : undefined

  return {
    title: { text: '各题正确率统计', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}<br/>正确率: <b>${params[0].value}%</b>`
    },
    grid: {
      left: '3%', right: '4%',
      bottom: needZoom ? '14%' : '8%',
      top: '15%',
      containLabel: true
    },
    dataZoom: needZoom ? [{
      type: 'slider',
      start: 0,
      end: dataCount > 30 ? 30 : 60,
      height: 20,
      bottom: '2%'
    }] : [],
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        interval: dataCount > 25 ? 'auto' : 0,
        rotate: labelRotate,
        fontSize: dataCount > 20 ? 9 : 11
      }
    },
    yAxis: {
      type: 'value',
      name: '正确率(%)',
      min: 0, max: 100
    },
    series: [{
      name: '正确率',
      type: 'bar',
      data: yData,
      barWidth: barW,
      barMaxWidth: 40,
      barMinWidth: 6,
      itemStyle: {
        borderRadius: [3, 3, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#a0cfff' },
          { offset: 0.5, color: '#409eff' },
          { offset: 1, color: '#409eff' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#337ecc' },
            { offset: 0.7, color: '#337ecc' },
            { offset: 1, color: '#a0cfff' }
          ])
        }
      },
      label: {
        show: showLabel,
        position: 'top',
        formatter: '{c}%',
        fontSize: 10
      }
    }]
  }
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(buildOption())
}

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption(buildOption(), true)
}

watch(() => props.data, () => updateChart(), { deep: true })

const handleResize = () => { if (chartInstance) chartInstance.resize() }

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
