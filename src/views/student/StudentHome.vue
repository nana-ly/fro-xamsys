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
          <button class="btn btn-primary" @click="startPractice">
            🎯 开始练习
          </button>
          <button class="btn btn-outline" @click="openAIQuestion">
            🤖 AI 智能出题
          </button>
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
              <label>题目数量</label>
              <input
                v-model.number="aiParams.count"
                type="number"
                min="1"
                max="30"
                placeholder="1-30"
              />
            </div>
            <div class="form-error" v-if="aiError">{{ aiError }}</div>
            <div class="ai-question-actions">
              <button class="btn btn-outline" @click="showAIQuestion = false">取消</button>
              <button class="btn btn-primary" @click="generateAIQuestion" :disabled="aiLoading">
                {{ aiLoading ? '生成中...' : '生成题目' }}
              </button>
            </div>
            <div v-if="aiResult" class="ai-result">
              <h4>✅ 生成成功！</h4>
              <p>{{ aiResult.content }}</p>
              <button class="btn btn-primary ai-practice-btn" @click="goAIPractice">
                🎯 去练习这个题目
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
import { getExamList, getWrongBook, aiGenerateQuestion, getStudyActivity } from '@/api/student'
import StudyHeatmap from '@/components/StudyHeatmap.vue'

const router = useRouter()
const userName = ref(localStorage.getItem('userName') || '同学')
const examList = ref([])
const examLoading = ref(false)
const wrongCount = ref(0)
const showAIQuestion = ref(false)
const aiLoading = ref(false)
const aiError = ref('')
const aiResult = ref(null)

const aiParams = reactive({
  knowledgePoint: '',
  questionType: 'choice',
  difficulty: 'medium',
  count: 5
})

const studyData = ref([])

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

function startPractice() {
  router.push('/student/practice')
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
    router.push({
      path: '/student/practice',
      query: {
        source: 'ai',
        aiQuestions: JSON.stringify(questions)
      }
    })
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
  try {
    const count = aiParams.count || 1
    let allQuestions = []

    // 循环调用，每次生成1道题，防止API限流
    for (let i = 0; i < count; i++) {
      const res = await aiGenerateQuestion(
        aiParams.knowledgePoint,
        aiParams.questionType,
        aiParams.difficulty,
        1
      )
      const questions = res.data?.questions || res.data?.question ? [res.data?.question] : []
      allQuestions = allQuestions.concat(questions)

      // 每次请求之间加500ms延迟，防止API限流
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    aiResult.value = allQuestions
  } catch (error) {
    const errMsg = error.response?.data?.error || 'AI生成失败，请稍后重试'
    aiError.value = errMsg
    aiResult.value = null
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => {
  loadExamList()
  loadWrongCount()
  fetchStudyData()
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
</style>