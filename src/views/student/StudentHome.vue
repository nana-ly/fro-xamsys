<template>
  <div class="student-home">
    <div class="container">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner card">
        <div class="welcome-content">
          <h2>👋 欢迎回来，{{ userName }}！</h2>
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
          <button class="btn btn-outline" @click="$router.push('/student/wrong-book')">
            📝 错题本
          </button>
          <button class="btn btn-outline" @click="$router.push('/student/profile')">
            👤 个人中心
          </button>
        </div>
      </div>

      <!-- 学习活跃度热力图 -->
      <StudyHeatmap :studyData="studyData" />

      <!-- 练习模式入口 -->
      <div class="practice-section card">
        <h3>📝 练习模式</h3>
        <p class="section-desc">随时随地刷题练习，即时查看答案和解析</p>
        <div class="practice-actions">
          <button class="btn btn-primary" @click="openPracticeDialog">
            📚 从题库选题
          </button>
          <button class="btn btn-outline" @click="openAIQuestion">
            🤖 AI 智能出题
          </button>
        </div>
      </div>

      <!-- 最近做题记录 -->
      <div class="recent-records-section card" v-if="recentRecords.length > 0">
        <h3>📊 最近做题记录</h3>
        <div class="records-list">
          <div v-for="rec in recentRecords" :key="rec.id" class="record-item">
            <span class="record-content">{{ rec.question_content.substring(0, 40) }}{{ rec.question_content.length > 40 ? '...' : '' }}</span>
            <span :class="['record-status', rec.is_correct ? 'correct' : 'wrong']">
              {{ rec.is_correct ? '✓ 正确' : '✗ 错误' }}
            </span>
            <span class="record-time">{{ rec.created_at?.substring(0, 10) }}</span>
          </div>
        </div>
      </div>

      <!-- 待考试卷列表 -->
      <div class="exam-section">
        <h3>📋 待考试卷</h3>
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
                <span>⏱ {{ exam.duration || 60 }}分钟</span>
                <span>📊 {{ exam.total_score || 100 }}分</span>
              </div>
              <div class="exam-info">
                <span>👨‍🏫 {{ exam.creator_name || '未知教师' }}</span>
                <span>📅 {{ formatDate(exam.published_at) }}</span>
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
        <div v-if="showPracticeDialog" class="ai-question-modal-overlay" @click.self="showPracticeDialog = false">
          <div class="ai-question-modal card">
            <h3>📚 从题库选题练习</h3>
            <div class="form-group">
              <label>知识点（可选）</label>
              <input v-model="practiceParams.knowledgePoint" type="text" placeholder="留空则随机出题" />
            </div>
            <div class="form-group">
              <label>题型（可选）</label>
              <select v-model="practiceParams.questionType">
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
              <input v-model.number="practiceParams.count" type="number" min="1" max="50" />
            </div>
            <div class="form-error" v-if="practiceError">{{ practiceError }}</div>
            <div class="ai-question-actions">
              <button class="btn btn-outline" @click="showPracticeDialog = false">取消</button>
              <button class="btn btn-primary" @click="startPracticeFromBank" :disabled="practiceLoading">
                {{ practiceLoading ? '加载中...' : '开始练习' }}
              </button>
            </div>
          </div>
        </div>

        <!-- AI出题弹窗 -->
        <div v-if="showAIQuestion" class="ai-question-modal-overlay" @click.self="showAIQuestion = false">
          <div class="ai-question-modal card">
            <h3>🤖 AI 智能出题</h3>
            <div class="form-group">
              <label>知识点</label>
              <input v-model="aiParams.knowledgePoint" type="text" placeholder="如：Python列表推导式" />
            </div>
            <div class="form-group">
              <label>题型</label>
              <select v-model="aiParams.questionType">
                <option value="choice">单选题</option>
                <option value="judge">判断题</option>
                <option value="multiple">多选题</option>
              </select>
            </div>
            <div class="form-group">
              <label>难度</label>
              <select v-model="aiParams.difficulty">
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div class="form-group">
              <label>出题数量</label>
              <input v-model.number="aiParams.count" type="number" min="1" max="10" />
            </div>
            <div class="form-error" v-if="aiError && !aiLoading">{{ aiError }}</div>
            <div class="form-info" v-if="aiLoading" style="color:#409eff;font-size:0.85em;margin-bottom:12px;text-align:center;">
              {{ aiError || '准备中...' }}
            </div>
            <div class="ai-question-actions">
              <button class="btn btn-outline" @click="showAIQuestion = false">取消</button>
              <button class="btn btn-primary" @click="generateAIQuestion" :disabled="aiLoading">
                {{ aiLoading ? '生成中...' : '生成并练习' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getExamList, getWrongBook, aiGenerateQuestion, getPracticeRecords, getStudyActivity } from '@/api/student'
import StudyHeatmap from '@/components/StudyHeatmap.vue'

const router = useRouter()
const userName = ref(localStorage.getItem('userName') || '同学')
const examList = ref([])
const examLoading = ref(false)
const wrongCount = ref(0)
const studyData = ref([])
const recentRecords = ref([])

// AI 出题
const showAIQuestion = ref(false)
const aiLoading = ref(false)
const aiError = ref('')
const aiParams = reactive({
  knowledgePoint: '',
  questionType: 'choice',
  difficulty: 'medium',
  count: 5
})

// 从题库选题
const showPracticeDialog = ref(false)
const practiceLoading = ref(false)
const practiceError = ref('')
const practiceParams = reactive({
  knowledgePoint: '',
  questionType: '',
  count: 10
})

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
    wrongCount.value = Array.isArray(data) ? data.length : (data.results || []).length
  } catch (error) {
    console.error('获取错题数量失败:', error)
    wrongCount.value = 0
  }
}

async function loadStudyData() {
  try {
    const res = await getStudyActivity()
    studyData.value = res.data || []
  } catch (error) {
    console.error('获取学习活跃度失败:', error)
    studyData.value = []
  }
}

async function loadRecentRecords() {
  try {
    const res = await getPracticeRecords({ page: 1, page_size: 10 })
    recentRecords.value = res.data?.results || []
  } catch (error) {
    console.error('获取做题记录失败:', error)
    recentRecords.value = []
  }
}

function startExam(examId) {
  router.push(`/student/exam/${examId}`)
}

// ===== 从题库选题 =====
function openPracticeDialog() {
  practiceError.value = ''
  practiceParams.knowledgePoint = ''
  practiceParams.questionType = ''
  practiceParams.count = 10
  showPracticeDialog.value = true
}

async function startPracticeFromBank() {
  practiceLoading.value = true
  practiceError.value = ''
  try {
    // 先跳转再通过 URL 参数传筛选条件
    const params = new URLSearchParams()
    params.set('mode', 'practice')
    if (practiceParams.knowledgePoint.trim()) params.set('knowledge_point', practiceParams.knowledgePoint.trim())
    if (practiceParams.questionType) params.set('question_type', practiceParams.questionType)
    params.set('count', String(practiceParams.count))
    router.push(`/student/exam/0?${params.toString()}`)
  } catch (error) {
    practiceError.value = '加载失败，请重试'
  } finally {
    practiceLoading.value = false
    showPracticeDialog.value = false
  }
}

// ===== AI 智能出题 =====
function openAIQuestion() {
  aiError.value = ''
  aiParams.knowledgePoint = ''
  aiParams.questionType = 'choice'
  aiParams.difficulty = 'medium'
  aiParams.count = 5
  showAIQuestion.value = true
}

async function generateAIQuestion() {
  if (!aiParams.knowledgePoint.trim()) {
    aiError.value = '请输入知识点'
    return
  }
  aiError.value = ''
  aiLoading.value = true

  const total = aiParams.count || 1
  const allQuestions = []

  for (let i = 1; i <= total; i++) {
    aiError.value = `正在生成第 ${i}/${total} 题...`
    try {
      const res = await aiGenerateQuestion(
        aiParams.knowledgePoint,
        aiParams.questionType,
        aiParams.difficulty,
        1,  // 每次只生成 1 题
        'ai_practice'
      )
      const questions = res.data?.questions || []
      allQuestions.push(...questions)
    } catch (error) {
      const errMsg = error.response?.data?.error || 'AI生成失败，请稍后重试'
      aiError.value = `第 ${i} 题生成失败：${errMsg}`
      break
    }
  }

  if (allQuestions.length > 0) {
    localStorage.setItem('aiPracticeQuestions', JSON.stringify(allQuestions))
    showAIQuestion.value = false
    router.push('/student/exam/0?mode=practice&source=ai')
  }

  aiLoading.value = false
}

onMounted(() => {
  loadExamList()
  loadWrongCount()
  loadStudyData()
  loadRecentRecords()
})
</script>

<style scoped>
.student-home {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #545c64;
  color: white;
  border-radius: 16px;
}

.welcome-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.4em;
}

.welcome-content p {
  margin: 0;
  opacity: 0.85;
  font-size: 0.9em;
}

.welcome-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 12px;
}

.stat-number {
  font-size: 1.6em;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8em;
  opacity: 0.85;
}

.welcome-nav {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.welcome-nav .btn-outline {
  border-color: rgba(255, 255, 255, 0.6);
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.welcome-nav .btn-outline:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.practice-section {
  padding: 20px;
}

.practice-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
}

.section-desc {
  margin: 0 0 16px 0;
  color: #999;
  font-size: 0.85em;
}

.practice-actions {
  display: flex;
  gap: 12px;
}

.exam-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  color: #333;
}

.exam-badge {
  padding: 2px 8px;
  background: #d9ecff;
  color: #409eff;
  border-radius: 12px;
  font-size: 0.75em;
  white-space: nowrap;
}

.exam-card-body {
  margin-bottom: 16px;
}

.exam-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #888;
  margin-bottom: 6px;
}

.ai-question-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ai-question-modal {
  width: 100%;
  max-width: 480px;
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.ai-question-modal h3 {
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.85em;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9em;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #409eff;
}

.form-error {
  color: #e74c3c;
  font-size: 0.85em;
  margin-bottom: 12px;
}

.ai-question-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.ai-result {
  margin-top: 16px;
  padding: 12px;
  background: #f0fef0;
  border-radius: 8px;
}

.ai-result h4 {
  margin: 0 0 8px 0;
  font-size: 0.95em;
  color: #27ae60;
}

.ai-result p {
  margin: 0;
  font-size: 0.9em;
  color: #333;
}

@media (max-width: 768px) {
  .student-home {
    padding: 12px;
  }
  
  .welcome-banner {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .welcome-stats {
    width: 100%;
    justify-content: center;
  }
  
  .exam-grid {
    grid-template-columns: 1fr;
  }
  
  .practice-actions {
    flex-direction: column;
  }
}

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
</style>