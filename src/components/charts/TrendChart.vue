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

  const xData = props.data.map(item => item.examTitle)
  const avgData = props.data.map(item => item.avgScore)
  const maxData = props.data.map(item => item.maxScore)
  const minData = props.data.map(item => item.minScore)

  const option = {
    title: {
      text: '历次考试成绩趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均分', '最高分', '最低分'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '平均分',
        type: 'line',
        data: avgData,
        smooth: true,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' }
          ])
        }
      },
      {
        name: '最高分',
        type: 'line',
        data: maxData,
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '最低分',
        type: 'line',
        data: minData,
        smooth: true,
        itemStyle: {
          color: '#f56c6c'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const xData = props.data.map(item => item.examTitle)
  const avgData = props.data.map(item => item.avgScore)
  const maxData = props.data.map(item => item.maxScore)
  const minData = props.data.map(item => item.minScore)

  chartInstance.setOption({
    xAxis: {
      data: xData
    },
    series: [
      { data: avgData },
      { data: maxData },
      { data: minData }
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