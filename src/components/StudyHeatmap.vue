<template>
  <div class="study-heatmap card">
    <div class="heatmap-header">
      <h3>📊 学习活跃度热力图</h3>
      <p class="heatmap-subtitle">最近{{ totalDays }}天学习记录</p>
    </div>
    <div ref="heatmapChart" class="heatmap-chart"></div>
    <div v-if="isEmpty" class="heatmap-empty">
      <p>暂无学习记录，快去刷题吧！📚</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance, watch, nextTick, computed } from 'vue'

const props = defineProps({
  studyData: {
    type: Array,
    default: () => []
  }
})

const { proxy } = getCurrentInstance()
const heatmapChart = ref(null)
let chartInstance = null

const totalDays = computed(() => {
  // 默认展示最近91天（约3个月）
  return 91
})

const isEmpty = computed(() => {
  return !props.studyData || props.studyData.length === 0
})

// 生成日期范围
function getDateRange() {
  const dates = []
  const today = new Date()
  for (let i = totalDays.value - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date)
  }
  return dates
}

// 组织热力图数据
function buildHeatmapData() {
  const dateRange = getDateRange()
  const dataMap = {}
  
  // 将传入的学习数据转为 Map { 'YYYY-MM-DD': count }
  if (props.studyData && props.studyData.length > 0) {
    props.studyData.forEach(item => {
      const dateStr = item.date || item.study_date || ''
      const count = item.count || item.question_count || 0
      if (dateStr) {
        dataMap[dateStr] = (dataMap[dateStr] || 0) + count
      }
    })
  }

  // 生成热力图所需数据格式 [date, count]
  const seriesData = dateRange.map(date => {
    const dateStr = formatDate(date)
    return [dateStr, dataMap[dateStr] || 0]
  })

  return {
    dateRange,
    seriesData
  }
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function initChart() {
  if (!heatmapChart.value) return
  
  const echarts = proxy.$echarts
  if (!echarts) return

  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(heatmapChart.value)
  
  const { seriesData, dateRange } = buildHeatmapData()
  
  // 按周分组日期
  const weeksData = []
  let currentWeek = []
  
  dateRange.forEach((date, index) => {
    const dayOfWeek = date.getDay()
    // 以周日(0)为每周第一天
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeksData.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push({
      date: formatDate(date),
      dayOfWeek: dayOfWeek
    })
    // 如果今天是一周的最后一天
    if (index === dateRange.length - 1 && currentWeek.length > 0) {
      weeksData.push(currentWeek)
    }
  })
  
  // 生成x轴数据（月份周标签）
  const monthLabels = []
  weeksData.forEach((week, weekIndex) => {
    const firstDate = week[0]?.date || ''
    const lastDate = week[week.length - 1]?.date || ''
    if (firstDate) {
      const month = firstDate.substring(5, 7)
      const prevMonth = weekIndex > 0 
        ? weeksData[weekIndex - 1][weeksData[weekIndex - 1].length - 1]?.date?.substring(5, 7) 
        : ''
      // 每周显示一个标签
      monthLabels.push(`${month}月`)
    }
  })

  // 构建数据：每行是一周中的一天(0-6)，每列是一周
  const heatmapSeriesData = []
  weeksData.forEach((week, weekIndex) => {
    week.forEach(day => {
      const count = seriesData.find(item => item[0] === day.date)?.[1] || 0
      heatmapSeriesData.push([weekIndex, day.dayOfWeek, count])
    })
  })

  const option = {
    tooltip: {
      position: 'top',
      formatter: function(params) {
        const data = params.data
        if (!data || data.length < 3) return ''
        const weekIndex = data[0]
        const dayIndex = data[1]
        const count = data[2]
        const week = weeksData[weekIndex]
        const day = week?.find(d => d.dayOfWeek === dayIndex)
        const dateStr = day?.date || ''
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return `${dateStr} ${dayNames[dayIndex]}<br/>做题数量: <strong>${count}</strong>`
      }
    },
    grid: {
      left: 60,
      right: 20,
      top: 30,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: weeksData.map((_, i) => {
        // 取每周第一天的月份作为标签
        const firstDay = weeksData[i][0]
        if (!firstDay) return ''
        const dateStr = firstDay.date
        // 每个月第一周显示月份
        if (i === 0) return dateStr.substring(5)
        const prevWeek = weeksData[i - 1]
        if (!prevWeek[0]) return ''
        const prevMonth = prevWeek[0].date.substring(5, 7)
        const curMonth = dateStr.substring(5, 7)
        if (prevMonth !== curMonth) return dateStr.substring(5)
        return ''
      }),
      axisLabel: {
        fontSize: 10,
        interval: 0
      },
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      axisLabel: {
        fontSize: 11
      },
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(10, ...heatmapSeriesData.map(d => d[2] || 0)),
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      pieces: [
        { min: 0, max: 0, label: '无', color: '#ebedf0' },
        { min: 1, max: 1, label: '1题', color: '#c6e48b' },
        { min: 2, max: 3, label: '2-3题', color: '#7bc96f' },
        { min: 4, max: 6, label: '4-6题', color: '#239a3b' },
        { min: 7, max: 999, label: '7+题', color: '#196127' }
      ],
      textStyle: {
        fontSize: 10
      }
    },
    series: [{
      name: '做题数量',
      type: 'heatmap',
      data: heatmapSeriesData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.studyData, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

// 监听窗口大小变化
function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.study-heatmap {
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.heatmap-header {
  margin-bottom: 16px;
}

.heatmap-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  color: #333;
}

.heatmap-subtitle {
  margin: 0;
  font-size: 0.85em;
  color: #999;
}

.heatmap-chart {
  width: 100%;
  height: 220px;
}

.heatmap-empty {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 0.95em;
}

@media (max-width: 768px) {
  .study-heatmap {
    padding: 12px;
  }
  
  .heatmap-chart {
    height: 180px;
  }
  
  .heatmap-header h3 {
    font-size: 1em;
  }
}
</style>