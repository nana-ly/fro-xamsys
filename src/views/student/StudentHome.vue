<template>
  <div class="student-home">
    <div class="container">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <div class="welcome-content">
          <h2>欢迎回来，{{ userName }}！</h2>
          <p>知识聚合考试平台，智能学习新体验</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <span class="stat-number">{{ examList.length }}</span>
            <span class="stat-label">待考试卷</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ wrongCount }}</span>
            <span class="stat-label">错题数量</span>
          </div>
        </div>
        <div class="welcome-nav">
          <button class="btn btn-welcome" @click="$router.push('/student/wrongbook')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            错题本
          </button>
          <button class="btn btn-welcome" @click="showJoinDialog = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            加入班级
          </button>
          <button class="btn btn-welcome" @click="$router.push('/student/profile')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            个人中心
          </button>
        </div>
      </div>

      <!-- 学习活跃趋势（按月） -->
      <div class="month-chart card">
        <div class="month-chart-header">
          <h4>📈 学习活跃趋势</h4>
          <div class="month-switcher">
            <button class="month-arrow" @click="prevMonth">‹</button>
            <span class="month-label">{{ monthLabel }}</span>
            <button class="month-arrow" @click="nextMonth" :disabled="isCurrentMonth">›</button>
          </div>
        </div>
        <div ref="monthChartRef" class="chart-box-month" v-show="dailyData.length"></div>
        <div class="chart-empty" v-if="!dailyData.length && !dailyLoading">暂无数据</div>
      </div>

      <!-- 统计卡片：两列并排 -->
      <div class="stats-row">
        <!-- 卡片1：今日做题统计 -->
        <div class="stats-card card">
          <h4>📋 今日做题统计</h4>
          <div class="stat-metrics">
            <div class="metric">
              <span class="metric-val">{{ todayStats.count || 0 }}</span>
              <span class="metric-label">做题数</span>
            </div>
            <div class="metric">
              <span class="metric-val">{{ todayStats.correctCount || 0 }}</span>
              <span class="metric-label">正确题数</span>
            </div>
            <div class="metric">
              <span class="metric-val">{{ todayStats.correctRate || 0 }}%</span>
              <span class="metric-label">正确率</span>
            </div>
            <div class="metric">
              <span class="metric-val">{{ todayStats.duration || '--' }}</span>
              <span class="metric-label">已学时长</span>
            </div>
          </div>
        </div>

        <!-- 卡片2：知识点掌握分布 -->
        <div class="stats-card card">
          <h4>🎯 知识点掌握分布</h4>
          <div ref="knowledgeChartRef" class="chart-box" v-show="knowledgeData.length"></div>
          <div class="chart-empty" v-if="!knowledgeData.length && !statsLoading">暂无数据</div>
        </div>
      </div>

      <!-- 练习模式入口 -->
      <div class="practice-section">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          练习模式
        </h3>
        <div class="practice-grid">
          <!-- 从题库选题 -->
          <div class="practice-card practice-card-bank" @click="openPracticeDialog">
            <div class="practice-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <div class="practice-card-body">
              <h4>从题库选题</h4>
              <p>按知识点与题型自由筛选，海量题库任你练</p>
              <button class="btn btn-practice-bank" @click.stop="openPracticeDialog">开始选题</button>
            </div>
          </div>
          <!-- AI 智能出题 -->
          <div class="practice-card practice-card-ai" @click="openAIQuestion">
            <div class="practice-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div class="practice-card-body">
              <h4>AI 智能出题</h4>
              <p>输入知识点，AI 自动生成针对性练习题</p>
              <button class="btn btn-practice-ai" @click.stop="openAIQuestion">智能生成</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近做题记录 -->
      <div class="recent-records-section card" v-if="recentRecords.length > 0">
        <h3>📊 最近做题记录</h3>
        <div class="records-list">
          <div v-for="rec in recentRecords" :key="rec.id || Math.random()" class="record-item">
            <span class="record-content">{{ (rec.question_content || '').substring(0, 40) }}{{ (rec.question_content || '').length > 40 ? '...' : '' }}</span>
            <span :class="['record-status', rec.is_correct ? 'correct' : 'wrong']">
              {{ rec.is_correct ? '✓ 正确' : '✗ 错误' }}
            </span>
            <span class="record-time">{{ rec.created_at?.substring(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- 待考试卷列表 -->
      <div class="exam-section">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          待考试卷
        </h3>
        <p class="section-desc" v-if="examList.length === 0 && !examLoading">
          暂无待考的试卷，请等待老师发布
        </p>

        <div v-if="examLoading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div class="exam-grid" v-if="!examLoading && examList.length > 0">
          <div v-for="exam in examList" :key="exam.id" class="exam-card card">
            <div class="exam-card-header">
              <h4>{{ exam.name }}</h4>
              <span class="exam-badge">{{ exam.question_count || 0 }}题</span>
            </div>
            <div class="exam-card-body">
              <div class="exam-info">
                <span>{{ exam.duration || 60 }}分钟</span>
                <span>{{ exam.total_score || 100 }}分</span>
              </div>
              <div class="exam-info">
                <span>{{ exam.creator_name || '未知教师' }}</span>
                <span>{{ formatDate(exam.published_at) }}</span>
              </div>
            </div>
            <div class="exam-card-footer">
              <button class="btn btn-primary btn-block" @click="startExam(exam.id)">
                开始考试
              </button>
            </div>
          </div>
        </div>

        <!-- 从题库选题弹窗 -->
        <div v-if="showPracticeDialog" class="modal-overlay" @click.self="showPracticeDialog = false">
          <div class="modal-dialog">
            <h3>从题库选题练习</h3>
            <div class="form-group">
              <label>知识点（可选）</label>
              <input v-model="practiceParams.knowledgePoint" type="text" placeholder="留空则随机出题" class="form-input" />
            </div>
            <div class="form-group">
              <label>题型（可选）</label>
              <select v-model="practiceParams.questionType" class="form-select">
                <option value="">全部题型</option>
                <option value="choice">单选题</option>
                <option value="multiple_choice">多选题</option>
                <option value="true_false">判断题</option>
                <option value="fill_blank">填空题</option>
                <option value="essay">简答题</option>
              </select>
            </div>
            <div class="form-group">
              <label>题目数量</label>
              <input v-model.number="practiceParams.count" type="number" min="1" max="50" class="form-input" />
            </div>
            <div class="form-error" v-if="practiceError">{{ practiceError }}</div>
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showPracticeDialog = false">取消</button>
              <button class="btn btn-primary" @click="startPracticeFromBank">开始练习</button>
            </div>
          </div>
        </div>

        <!-- AI出题弹窗 -->
        <div v-if="showAIQuestion" class="modal-overlay" @click.self="showAIQuestion = false">
          <div class="modal-dialog">
            <h3>AI 智能出题</h3>
            <div class="form-group">
              <label>知识点</label>
              <input v-model="aiParams.knowledgePoint" type="text" placeholder="如：Python列表推导式" class="form-input" />
            </div>
            <div class="form-group">
              <label>题型</label>
              <select v-model="aiParams.questionType" class="form-select">
                <option value="choice">单选题</option>
                <option value="judge">判断题</option>
                <option value="multiple">多选题</option>
                <option value="fill_blank">填空题</option>
                <option value="essay">简答题</option>
              </select>
            </div>
            <div class="form-group">
              <label>难度</label>
              <select v-model="aiParams.difficulty" class="form-select">
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div class="form-group">
              <label>题目数量</label>
              <input
                v-model.number="aiParams.count"
                type="number"
                min="1"
                max="30"
                placeholder="1-30"
                class="form-input"
              />
            </div>
            <div class="form-error" v-if="aiError">{{ aiError }}</div>
            <div class="modal-actions">
              <button class="btn btn-secondary" @click="showAIQuestion = false">取消</button>
              <button class="btn btn-primary" @click="generateAIQuestion" :disabled="aiLoading">
                {{ aiLoading ? (aiLoadingText || '生成中...') : '生成题目' }}
              </button>
            </div>
            <div v-if="aiResult" class="ai-result">
              <h4>生成成功！</h4>
              <p>{{ aiResult.content }}</p>
              <button class="btn btn-primary ai-practice-btn" @click="goAIPractice">
                去练习这个题目
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加入班级弹窗 -->
    <div v-if="showJoinDialog" class="modal-overlay" @click.self="closeJoinDialog">
      <div class="modal-dialog">
        <h3>加入班级</h3>
        <p class="join-desc">请输入教师提供的班级码</p>
        <div class="form-group">
          <input v-model="joinClassCode" type="text" placeholder="例如：C12022123456" class="form-input join-code-input" @keyup.enter="handleJoinClass" />
        </div>
        <div class="form-error" v-if="joinError">{{ joinError }}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeJoinDialog">取消</button>
          <button class="btn btn-primary" @click="handleJoinClass" :disabled="joinLoading">{{ joinLoading ? '加入中...' : '加入' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getExamList, getWrongCount, aiGenerateQuestion, getPracticeRecords, getStudyActivity, getKnowledgeStats, startSession, endSession, getDailyStats, joinClass } from '@/api/student'
import * as echarts from 'echarts'

const router = useRouter()
const userName = ref(localStorage.getItem('student_userName') || '同学')
const examList = ref([])
const examLoading = ref(true)
const wrongCount = ref(0)
const showJoinDialog = ref(false)
const joinLoading = ref(false)
const joinClassCode = ref('')
const joinError = ref('')
const recentRecords = ref([])
const showAIQuestion = ref(false)
const aiLoading = ref(false)
const aiLoadingText = ref('')
const aiError = ref('')
const aiResult = ref(null)

const aiParams = reactive({
  knowledgePoint: '',
  questionType: 'choice',
  difficulty: 'medium',
  count: 5
})

// ===================== 统计卡片 =====================
const statsLoading = ref(false)
const dailyLoading = ref(false)
const todayStats = reactive({ count: 0, correctCount: 0, correctRate: 0, duration: '--' })
const dailyData = ref([])
const knowledgeData = ref([])
const monthChartRef = ref(null)
const knowledgeChartRef = ref(null)
let monthChart = null
let knowledgeChart = null

// 月份切换
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value}月`)
const isCurrentMonth = computed(() => {
  const n = new Date()
  return currentYear.value === n.getFullYear() && currentMonth.value === n.getMonth() + 1
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  loadMonthChart()
}

function nextMonth() {
  if (isCurrentMonth.value) return
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  loadMonthChart()
}

async function loadMonthChart() {
  dailyLoading.value = true
  try {
    const res = await getStudyActivity({ year: currentYear.value, month: currentMonth.value })
    dailyData.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    await nextTick()
    renderMonthChart()
  } catch (err) {
    console.error('加载月度趋势失败:', err)
    dailyData.value = []
  } finally {
    dailyLoading.value = false
  }
}

// 格式化秒数为 时:分
function fmtDuration(seconds) {
  if (!seconds || seconds <= 0) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m}m`
  return `${m}m`
}

async function loadStatsData() {
  statsLoading.value = true
  try {
    const [dailyRes, knowledgeRes] = await Promise.all([
      getDailyStats(),
      getKnowledgeStats()
    ])

    const daily = dailyRes.data || {}
    todayStats.count = daily.count || 0
    todayStats.correctCount = daily.correct_count || 0
    todayStats.correctRate = daily.correct_rate || 0
    todayStats.duration = fmtDuration(daily.duration || 0)

    // 知识点分布
    knowledgeData.value = knowledgeRes.data || []

    await nextTick()
    renderKnowledgeChart()
  } catch (err) {
    console.error('加载统计数据失败:', err)
  } finally {
    statsLoading.value = false
  }
}

function renderMonthChart() {
  if (!monthChartRef.value || !dailyData.value.length) return
  if (monthChart) monthChart.dispose()
  monthChart = echarts.init(monthChartRef.value)
  monthChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: p => `${currentMonth.value}月${p[0].axisValue}日<br/>做题数：<b>${p[0].value}</b>`
    },
    grid: { left: 12, right: 12, top: 8, bottom: 4 },
    xAxis: {
      type: 'category',
      data: dailyData.value.map(d => {
        const day = d.date ? d.date.split('-').pop().replace(/^0/, '') : ''
        return day
      }),
      axisLabel: { fontSize: 10, color: '#9f988e' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0ede8', type: 'dashed' } },
      axisLabel: { fontSize: 10, color: '#9f988e' },
      minInterval: 1
    },
    series: [{
      type: 'line',
      data: dailyData.value.map(d => d.count || 0),
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: '#8cc665', width: 2 },
      itemStyle: { color: '#44a340' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(140,198,101,0.3)' },
          { offset: 1, color: 'rgba(140,198,101,0.02)' }
        ])
      }
    }]
  })
}

function renderKnowledgeChart() {
  if (!knowledgeChartRef.value || !knowledgeData.value.length) return
  if (knowledgeChart) knowledgeChart.dispose()
  knowledgeChart = echarts.init(knowledgeChartRef.value)

  const data = knowledgeData.value.map(d => ({
    name: d.knowledge_point,
    value: d.total
  }))

  knowledgeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: p => `${p.name}<br/>${p.value}题 · 正确率 ${(knowledgeData.value[p.dataIndex].correct / Math.max(p.value, 1) * 100).toFixed(1)}%`
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold' },
        scaleSize: 8
      },
      data,
      color: ['#44a340', '#8cc665', '#d6e685', '#67b168', '#2d7d2d', '#a8d8a8']
    }]
  })
}

// 响应式重绘
watch(dailyData, async () => { await nextTick(); renderMonthChart() })
watch(knowledgeData, async () => { await nextTick(); renderKnowledgeChart() })

// 从题库选题弹窗
const showPracticeDialog = ref(false)
const practiceError = ref('')
const practiceParams = reactive({
  knowledgePoint: '',
  questionType: '',
  count: 10
})

async function loadRecentRecords() {
  try {
    const res = await getPracticeRecords({ page: 1, page_size: 10 })
    const records = res.data?.results || []
    recentRecords.value = records.filter(r => r.question_content)
  } catch (error) {
    console.error('获取做题记录失败:', error)
    recentRecords.value = []
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadExamList() {
  examLoading.value = true
  try {
    const res = await getExamList()
    examList.value = res.data || []
  } catch (error) {
    console.error('获取试卷列表失败:', error)
    examList.value = []
  } finally {
    examLoading.value = false
  }
}

async function loadWrongCount() {
  try {
    const res = await getWrongCount()
    wrongCount.value = res.data?.total || 0
  } catch (error) {
    console.error('获取错题数量失败:', error)
    wrongCount.value = 0
  }
}

function startExam(examId) {
  router.push(`/student/exam/${examId}`)
}

function openPracticeDialog() {
  practiceError.value = ''
  practiceParams.knowledgePoint = ''
  practiceParams.questionType = ''
  practiceParams.count = 10
  showPracticeDialog.value = true
}

function closeJoinDialog() { showJoinDialog.value = false; joinClassCode.value = ''; joinError.value = '' }

async function handleJoinClass() {
  const code = joinClassCode.value.trim()
  if (!code) { joinError.value = '请输入班级码'; return }
  joinError.value = ''; joinLoading.value = true
  try {
    const res = await joinClass(code)
    const data = res.data || res
    alert(`成功加入班级「${data.data?.class_name || data.class_name || '未知班级'}」！`)
    closeJoinDialog(); loadExamList()
  } catch (error) {
    const detail = error.response?.data
    if (detail?.non_field_errors) {
      const msg = Array.isArray(detail.non_field_errors) ? detail.non_field_errors[0] : detail.non_field_errors
      if (msg.includes('已经加入过该班级')) { alert('您已在该班级中，无需重复加入'); closeJoinDialog(); loadExamList(); joinLoading.value = false; return }
      joinError.value = msg
    } else if (detail?.class_code) {
      joinError.value = detail.class_code[0] || '班级码无效'
    } else {
      joinError.value = detail?.detail || detail?.error || '加入失败，请检查班级码是否正确'
    }
  } finally { joinLoading.value = false }
}

function startPracticeFromBank() {
  const params = new URLSearchParams()
  params.set('mode', 'practice')
  if (practiceParams.knowledgePoint.trim()) params.set('knowledge_point', practiceParams.knowledgePoint.trim())
  if (practiceParams.questionType) params.set('question_type', practiceParams.questionType)
  params.set('count', String(practiceParams.count))
  showPracticeDialog.value = false
  sessionStorage.removeItem('practice_result')  // 清除旧缓存
  router.push(`/student/practice?${params.toString()}`)
}

function openAIQuestion() {
  aiResult.value = null
  aiError.value = ''
  aiParams.knowledgePoint = ''
  showAIQuestion.value = true
}

function goAIPractice() {
  if (aiResult.value) {
    const questions = Array.isArray(aiResult.value) ? aiResult.value : [aiResult.value]
    sessionStorage.removeItem('practice_result')  // 清除旧缓存
    sessionStorage.setItem('aiQuestions', JSON.stringify(questions))
    router.push('/student/practice?source=ai')
  }
  showAIQuestion.value = false
}

async function generateAIQuestion() {
  if (!aiParams.knowledgePoint.trim()) {
    aiError.value = '请输入知识点'
    return
  }
  aiError.value = ''
  aiLoading.value = true
  aiLoadingText.value = '正在生成题目...'
  try {
    const res = await aiGenerateQuestion(
      aiParams.knowledgePoint,
      aiParams.questionType,
      aiParams.difficulty,
      aiParams.count || 1
    )

    const questions = res.data?.questions || []
    aiResult.value = questions
  } catch (error) {
    const errMsg = error.response?.data?.error || 'AI生成失败，请稍后重试'
    aiError.value = errMsg
    aiResult.value = null
  } finally {
    aiLoading.value = false
    aiLoadingText.value = ''
  }
}

function loadAllData() {
  loadExamList()
  loadWrongCount()
  loadStatsData()
  loadMonthChart()
  loadRecentRecords()
}

onMounted(() => {
  loadAllData()
  startSession().catch(err => console.error('开始学习时段失败:', err))
})

onActivated(() => {
  loadAllData()
})

// 页面关闭/刷新时发送结束请求（keepalive 保证请求不丢失）
function handleBeforeUnload() {
  const token = sessionStorage.getItem('student_token') || localStorage.getItem('student_token')
  fetch('/api/student/end_session/', {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token && token !== 'true' ? { 'Authorization': `Token ${token}` } : {})
    }
  }).catch(() => {})
}
window.addEventListener('beforeunload', handleBeforeUnload)

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (monthChart) monthChart.dispose()
  if (knowledgeChart) knowledgeChart.dispose()
  endSession().catch(err => console.error('结束学习时段失败:', err))
})
</script>

<style scoped>
.student-home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 48px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 欢迎横幅 ===== */
.welcome-banner {
  background: var(--primary, #d97757);
  color: #fff;
  border-radius: var(--radius-lg, 12px);
  padding: 28px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-content h2 {
  margin: 0 0 6px 0;
  font-size: 1.4em;
  font-weight: 600;
  color: #fff;
}

.welcome-content p {
  margin: 0;
  font-size: 0.9em;
  color: rgba(240, 198, 153, 0.8);
}

.welcome-stats {
  display: flex;
  gap: 16px;
}

.welcome-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.18);
  padding: 10px 18px;
  border-radius: var(--radius-md, 8px);
  min-width: 80px;
  border: 1px solid rgba(255,255,255,0.25);
}

.welcome-stats .stat-number {
  font-size: 1.5em;
  font-weight: 700;
  color: #fff;
}

.welcome-stats .stat-label {
  font-size: 0.78em;
  color: rgba(225, 183, 147, 0.8);
  margin-top: 2px;
}

.welcome-nav {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-welcome {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
  padding: 8px 18px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.btn-welcome:hover {
  background: rgba(255,255,255,0.35);
  border-color: rgba(255,255,255,0.7);
  transform: translateY(-1px);
}

/* ===== 月度趋势图 ===== */
.month-chart {
  padding: 18px 20px;
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--hairline, #e3dbd0);
}

.month-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.month-chart-header h4 {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
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

.chart-box-month {
  width: 100%;
  height: 200px;
}

/* ===== 统计卡片行 ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stats-card {
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--hairline, #e3dbd0);
}

.stats-card h4 {
  margin: 0 0 12px 0;
  font-size: 0.9em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.stat-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric {
  text-align: center;
  padding: 6px 0;
}

.metric-val {
  display: block;
  font-size: 1.5em;
  font-weight: 700;
  color: var(--ink, #2a2a2a);
  line-height: 1.2;
}

.metric-label {
  display: block;
  font-size: 11px;
  color: var(--muted-soft, #9f988e);
  margin-top: 2px;
}

.chart-box {
  width: 100%;
  height: 180px;
}

.chart-empty {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-soft, #9f988e);
  font-size: 13px;
}

/* ===== 卡片区域 ===== */
/* ===== 练习模式 ===== */
.practice-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.practice-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid var(--hairline, #e8e0d5);
  border-radius: var(--radius-lg, 12px);
  background: var(--card-bg, #ffffff);
}

.practice-card:hover {
  transform: translateY(-2px);
}

.practice-card-bank {
  border-left: 4px solid var(--primary, #d97757);
}

.practice-card-bank:hover {
  box-shadow: 0 6px 24px rgba(217, 119, 87, 0.15);
  border-color: var(--primary, #d97757);
}

.practice-card-ai {
  border-left: 4px solid #e8964a;
}

.practice-card-ai:hover {
  box-shadow: 0 6px 24px rgba(232, 150, 74, 0.15);
  border-color: #e8964a;
}

.practice-card-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.practice-card-bank .practice-card-icon {
  background: linear-gradient(135deg, rgba(217, 119, 87, 0.15), rgba(217, 119, 87, 0.08));
  color: var(--primary, #d97757);
}

.practice-card-ai .practice-card-icon {
  background: linear-gradient(135deg, rgba(232, 150, 74, 0.15), rgba(217, 119, 87, 0.08));
  color: #e8964a;
}

.practice-card-body {
  flex: 1;
  min-width: 0;
}

.practice-card-body h4 {
  margin: 0 0 4px 0;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.practice-card-body p {
  margin: 0 0 12px 0;
  font-size: 12.5px;
  color: var(--muted, #6b655c);
  line-height: 1.5;
}

.btn-practice-bank,
.btn-practice-ai {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 18px;
  border: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.2s;
  color: #fff;
}

.btn-practice-bank {
  background: linear-gradient(135deg, #d97757, #c46a4a);
}

.btn-practice-bank:hover {
  background: linear-gradient(135deg, #c46a4a, #b55e40);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(217, 119, 87, 0.35);
}

.btn-practice-ai {
  background: linear-gradient(135deg, #e8964a, #d97757);
}

.btn-practice-ai:hover {
  background: linear-gradient(135deg, #d98345, #c46a4a);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(232, 150, 74, 0.35);
}

.section-desc {
  margin: 0 0 12px 0;
  color: var(--muted, #6b655c);
  font-size: 14px;
}

/* ===== 最近做题记录 ===== */
.recent-records-section {
  padding: 20px;
}

.recent-records-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.85em;
}

.record-content {
  flex: 1;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-status {
  font-weight: 600;
  white-space: nowrap;
}

.record-status.correct {
  color: #4caf50;
}

.record-status.wrong {
  color: #e74c3c;
}

.record-time {
  color: #999;
  font-size: 0.85em;
  white-space: nowrap;
}

/* ===== 待考试卷 ===== */
.exam-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.exam-card {
  padding: 20px;
}

.exam-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.exam-card-header h4 {
  margin: 0;
  font-size: 1em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.exam-badge {
  padding: 2px 10px;
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.exam-card-body {
  margin-bottom: 16px;
}

.exam-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--muted, #6b655c);
  margin-bottom: 4px;
}

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  padding: 28px 24px;
  background: var(--card-bg,rgb(236, 199, 157));
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--hairline, #e3dbd0);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-dialog h3 {
  margin: 0 0 20px 0;
  font-size: 1.15em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-error {
  color: #c64545;
  font-size: 13px;
  margin-bottom: 12px;
}

.ai-result {
  margin-top: 16px;
  padding: 14px;
  background: rgba(93, 184, 114, 0.08);
  border: 1px solid rgba(93, 184, 114, 0.2);
  border-radius: var(--radius-md, 8px);
}

.ai-result h4 {
  margin: 0 0 8px 0;
  font-size: 0.95em;
  font-weight: 600;
  color: #5db872;
}

.ai-result p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--ink, #2a2a2a);
}

.ai-practice-btn {
  width: 100%;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .student-home {
    padding: 0;
  }

  .welcome-banner {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }

  .welcome-stats {
    width: 100%;
    justify-content: center;
  }

  .welcome-nav {
    justify-content: center;
  }

  .exam-grid {
    grid-template-columns: 1fr;
  }

  .practice-actions {
    flex-direction: column;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}

.join-desc { margin: -12px 0 16px 0; color: var(--muted, #6b655c); font-size: 14px; }
.join-code-input { font-family: 'Courier New', monospace; font-size: 16px; text-align: center; letter-spacing: 2px; }
</style>