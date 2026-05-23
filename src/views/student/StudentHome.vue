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
          <button class="btn btn-welcome" @click="$router.push('/student/profile')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            个人中心
          </button>
        </div>
      </div>


      <!-- 学习活跃度热力图 -->
      <StudyHeatmap :studyData="studyData" class="study-heatmap" />

      <!-- 练习模式入口 -->
      <div class="practice-section card">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          练习模式
        </h3>
        <p class="section-desc">随时随地刷题练习，即时查看答案和解析</p>
        <div class="practice-actions">
          <button class="btn btn-primary" @click="openPracticeDialog">
            从题库选题
          </button>
          <button class="btn btn-secondary" @click="openAIQuestion">
            AI 智能出题
          </button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getExamList, getWrongBook, aiGenerateQuestion, getStudyActivity } from '@/api/student'
import StudyHeatmap from '@/components/StudyHeatmap.vue'

const router = useRouter()
const userName = ref(localStorage.getItem('student_userName') || '同学')
const examList = ref([])
const examLoading = ref(true)
const wrongCount = ref(0)
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

const studyData = ref([])

// 从题库选题弹窗
const showPracticeDialog = ref(false)
const practiceError = ref('')
const practiceParams = reactive({
  knowledgePoint: '',
  questionType: '',
  count: 10
})

// 获取学习活跃度数据
async function fetchStudyData() {
  try {
    const res = await getStudyActivity()
    studyData.value = res.data || []
  } catch (error) {
    console.error('获取学习活跃度数据失败:', error)
    studyData.value = []
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
    const res = await getWrongBook()
    const data = res.data || []
    wrongCount.value = data.length
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

function startPracticeFromBank() {
  const params = new URLSearchParams()
  params.set('mode', 'practice')
  if (practiceParams.knowledgePoint.trim()) params.set('knowledge_point', practiceParams.knowledgePoint.trim())
  if (practiceParams.questionType) params.set('question_type', practiceParams.questionType)
  params.set('count', String(practiceParams.count))
  showPracticeDialog.value = false
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
    sessionStorage.setItem('aiQuestions', JSON.stringify(questions))
    console.log('stored questions:', JSON.stringify(questions))
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
    console.log('aiResult after generate:', JSON.stringify(aiResult.value))
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
  fetchStudyData()
}

onMounted(() => {
  loadAllData()
})

onActivated(() => {
  loadAllData()
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
  background: #d97757;
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

/* ===== 卡片区域 ===== */
.practice-section {
  padding: 24px;
}

.practice-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-desc {
  margin: 0 0 16px 0;
  color: var(--muted, #6b655c);
  font-size: 14px;
}

.practice-actions {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
}

.history-card .card-content {
  flex: 1;
}

.history-card h3 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.history-card .section-desc {
  margin: 0;
  font-size: 14px;
  color: var(--muted,rgb(236, 203, 157));
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

/* ===== 热力图纵向加长 ===== */
.study-heatmap {
  margin-bottom: 20px;
}

.study-heatmap :deep(.heatmap-chart) {
  height: 280px;
}

@media (max-width: 768px) {
  .study-heatmap :deep(.heatmap-chart) {
    height: 220px;
  }
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

  .history-card {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
