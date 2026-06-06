<template>
  <div class="profile-heatmap card">
    <!-- 月份切换栏 -->
    <div class="heatmap-header">
      <h3>📊 学习活跃度</h3>
      <div class="month-switcher">
        <button class="month-arrow" @click="$emit('prev')">‹</button>
        <span class="month-label">{{ year }}年{{ month }}月</span>
        <button class="month-arrow" :disabled="isCurrentMonth" @click="$emit('next')">›</button>
      </div>
    </div>

    <div v-if="loading" class="heatmap-loading">
      <div class="spinner"></div>
    </div>

    <!-- 日历热力图：行=周一到周日，列=第1~5周 -->
    <div v-else-if="calendarGrid.length" class="calendar-wrap">
      <table class="calendar-table">
        <thead>
          <tr>
            <th class="row-label"></th>
            <th v-for="(col, ci) in weekLabels" :key="ci" class="col-label">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in calendarGrid" :key="ri">
            <td class="row-label">{{ weekDays[ri] }}</td>
            <td
              v-for="(day, ci) in row"
              :key="ci"
              :class="['day-cell', {
                'is-empty': !day,
                'is-today': day && day.isToday
              }]"
              :style="day ? { backgroundColor: getColor(day.count) } : {}"
              :title="day ? `${day.dateStr} — ${day.count || 0}题` : ''"
            >
              <span v-if="day" class="day-num">{{ day.day }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 图例放在下面 -->
      <div class="legend-bar">
        <div v-for="seg in legendSegments" :key="seg.label" class="legend-tag">
          <span class="legend-swatch" :style="{ backgroundColor: seg.color }"></span>
          <span class="legend-text">{{ seg.label }}</span>
        </div>
      </div>
    </div>

    <div v-else class="heatmap-empty">暂无学习记录</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getStudyActivity } from '@/api/student'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true }
})

defineEmits(['prev', 'next'])

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const colors = [
  { min: 0, max: 0, color: '#ebedf0', label: '无' },
  { min: 1, max: 10, color: '#d6e685', label: '1-10' },
  { min: 11, max: 30, color: '#8cc665', label: '11-30' },
  { min: 31, max: 60, color: '#44a340', label: '31-60' },
  { min: 61, max: Infinity, color: '#1e6823', label: '61+' }
]

const legendSegments = colors

const loading = ref(false)
const activityMap = ref({})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return props.year === now.getFullYear() && props.month === now.getMonth() + 1
})

const weekLabels = computed(() => {
  // 列标签：第1周 ~ 第N周
  const count = daysInMonth(props.year, props.month)
  const firstDow = new Date(props.year, props.month - 1, 1).getDay() // 0=Sun
  const totalSlots = count + (firstDow === 0 ? 6 : firstDow - 1)
  const weeks = Math.ceil(totalSlots / 7)
  return Array.from({ length: weeks }, (_, i) => `第${i + 1}周`)
})

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

function getColor(count) {
  if (!count || count === 0) return '#ebedf0'
  if (count <= 10) return '#d6e685'
  if (count <= 30) return '#8cc665'
  if (count <= 60) return '#44a340'
  return '#1e6823'
}

const calendarGrid = computed(() => {
  const map = activityMap.value
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const count = daysInMonth(props.year, props.month)
  const firstDow = new Date(props.year, props.month - 1, 1).getDay() // 0=Sun

  // 构建当月所有日期数组
  const allDays = []
  // 如果1号不是周一，前面补齐空位
  const startCol = firstDow === 0 ? 6 : firstDow - 1 // Mon=0
  for (let j = 0; j < startCol; j++) allDays.push(null)

  for (let d = 1; d <= count; d++) {
    const dateStr = `${props.year}-${String(props.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    allDays.push({
      day: d,
      dateStr,
      count: map[dateStr] || 0,
      isToday: dateStr === todayStr
    })
  }

  // 补齐末尾到整周
  while (allDays.length % 7 !== 0) allDays.push(null)

  // 转置：行=周一到周日(7行)，列=第N周
  const totalCols = allDays.length / 7
  const grid = []
  for (let row = 0; row < 7; row++) {
    const rowData = []
    for (let col = 0; col < totalCols; col++) {
      rowData.push(allDays[col * 7 + row])
    }
    grid.push(rowData)
  }

  return grid
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getStudyActivity({ year: props.year, month: props.month })
    const raw = res.data || {}
    const data = Array.isArray(raw) ? raw : (raw.data || [])
    const map = {}
    data.forEach(item => {
      if (item.date) {
        map[item.date] = item.count || 0
      }
    })
    activityMap.value = map
  } catch {
    activityMap.value = {}
  } finally {
    loading.value = false
  }
}

watch(() => [props.year, props.month], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.profile-heatmap {
  padding: 18px 20px;
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--hairline, #e3dbd0);
}

/* ===== 头部 + 月份切换 ===== */
.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.heatmap-header h3 {
  margin: 0;
  font-size: 1.05em;
  color: var(--ink, #2a2a2a);
  font-weight: 600;
}

.month-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
}

.month-label {
  font-size: 0.9em;
  font-weight: 600;
  color: var(--primary, #d97757);
  min-width: 80px;
  text-align: center;
  user-select: none;
}

.month-arrow {
  border: none;
  background: var(--primary-bg, rgba(217,119,87,0.1));
  color: var(--primary, #d97757);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  line-height: 1;
  transition: background 0.2s;
}

.month-arrow:hover:not(:disabled) {
  background: var(--primary, #d97757);
  color: #fff;
}

.month-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ===== 加载 / 空态 ===== */
.heatmap-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--hairline, #e3dbd0);
  border-top-color: var(--primary, #d97757);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.heatmap-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--muted, #6b655c);
  font-size: 13px;
}

/* ===== 日历表格 ===== */
.calendar-wrap { }

.calendar-table {
  border-collapse: separate;
  border-spacing: 4px;
  margin: 0 auto;
}

.row-label,
.col-label {
  font-size: 11px;
  color: var(--muted-soft, #9f988e);
  font-weight: 500;
  white-space: nowrap;
  text-align: center;
}

.row-label {
  padding-right: 8px;
  width: 32px;
}

.col-label {
  padding-bottom: 4px;
}

.day-cell {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.day-cell:not(.is-empty):hover {
  border-color: var(--ink, #2a2a2a);
}

.day-cell.is-empty {
  background: transparent !important;
}

.day-cell.is-today {
  border-color: var(--primary, #d97757) !important;
  box-shadow: 0 0 0 1px var(--primary, #d97757);
}

.day-num {
  font-size: 12px;
  color: var(--ink, #2a2a2a);
  font-weight: 500;
  line-height: 1;
}

/* ===== 图例 ===== */
.legend-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--hairline, #e3dbd0);
  flex-wrap: wrap;
}

.legend-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 11px;
  color: var(--muted, #6b655c);
  white-space: nowrap;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .profile-heatmap {
    padding: 14px 12px;
  }

  .calendar-table {
    border-spacing: 2px;
  }

  .day-cell {
    width: 26px;
    height: 26px;
  }

  .day-num {
    font-size: 10px;
  }

  .row-label,
  .col-label {
    font-size: 10px;
  }

  .row-label {
    width: 26px;
    padding-right: 4px;
  }
}
</style>
