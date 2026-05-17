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

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const xData = props.data.map(item => `第${item.questionNum}题`)
  const yData = props.data.map(item => item.accuracy)

  const option = {
    title: {
      text: '各题正确率统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}<br/>正确率: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '正确率(%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        data: yData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67e8f9' },
            { offset: 0.5, color: '#0ea5e9' },
            { offset: 1, color: '#0ea5e9' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#0284c7' },
              { offset: 0.7, color: '#0284c7' },
              { offset: 1, color: '#67e8f9' }
            ])
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const xData = props.data.map(item => `第${item.questionNum}题`)
  const yData = props.data.map(item => item.accuracy)

  chartInstance.setOption({
    xAxis: {
      data: xData
    },
    series: [
      {
        data: yData
      }
    ]
  })
}

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>