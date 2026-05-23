<template>
  <div class="exam-page">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="btn btn-back" @click="$router.push('/student/home')">
        ← 返回主页
      </button>

      <!-- 考试头部信息 -->
      <div class="exam-header card" v-if="examInfo">
        <div class="exam-header-left">
          <h2>{{ examInfo.name || '考试' }}</h2>
          <div class="exam-meta">
            <span>共 {{ questions.length }} 题</span>
            <span>总分: {{ examInfo.total_score || 100 }}</span>
          </div>
        </div>
        <div class="exam-header-right">
          <div class="timer" :class="{ 'timer--warning': remainingSeconds <= 300 }">
            {{ formatTime(remainingSeconds) }}
          </div>
          <button class="btn btn-primary" @click="submitExam">
            交卷
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载试卷中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state card">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="$router.back()">返回</button>
      </div>

      <!-- 题目列表 -->
      <div v-if="!loading && questions.length > 0" class="questions-area">
        <!-- 题目导航（答题卡） -->
        <div class="question-nav card">
          <span class="nav-label">答题卡：</span>
          <div class="nav-grid">
            <button
              v-for="(q, index) in questions"
              :key="q.id"
              :class="['nav-dot', { 
                answered: answers[q.id] !== undefined && answers[q.id] !== '', 
                current: currentIndex === index,
                correct: showResult && answers[q.id] === q.answer,
                wrong: showResult && answers[q.id] !== q.answer
              }]"
              @click="currentIndex = index"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>

        <!-- 当前题目 -->
        <div class="question-card card" v-if="currentQuestion">
          <div class="question-header">
            <span class="question-type-badge">{{ typeLabel(currentQuestion.question_type) }}</span>
            <span class="question-difficulty" v-if="currentQuestion.difficulty">
              {{ '★'.repeat(currentQuestion.difficulty) }}
            </span>
          </div>

          <div class="question-body">
            <h3 class="question-content">
              {{ currentIndex + 1 }}. {{ currentQuestion.content }}
            </h3>

            <!-- 选择题 -->
            <div v-if="isChoiceType(currentQuestion.question_type)" class="options-list">
              <label
                v-for="(opt, key) in parsedOptions"
                :key="key"
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === key,
                    'correct-answer': showResult && key === currentQuestion.answer,
                    'wrong-answer': showResult && selectedAnswer === key && key !== currentQuestion.answer
                  }
                ]"
              >
                <input
                  v-if="currentQuestion.question_type === 'choice'"
                  type="radio"
                  :name="'q_' + currentQuestion.id"
                  :value="key"
                  v-model="selectedAnswer"
                  @change="saveAnswer(key)"
                  :disabled="showResult"
                />
                <input
                  v-else
                  type="checkbox"
                  :value="key"
                  :checked="selectedAnswers.includes(key)"
                  @change="toggleMultiple(key)"
                  :disabled="showResult"
                />
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="showResult && key === currentQuestion.answer" class="check-mark">✓</span>
                <span v-if="showResult && selectedAnswer === key && key !== currentQuestion.answer" class="x-mark">✗</span>
              </label>
            </div>

            <!-- 判断题 -->
            <div v-if="currentQuestion.question_type === 'true_false'" class="options-list">
              <label
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === 'true',
                    'correct-answer': showResult && 'true' === currentQuestion.answer,
                    'wrong-answer': showResult && selectedAnswer === 'true' && 'true' !== currentQuestion.answer
                  }
                ]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="true" v-model="selectedAnswer" @change="saveAnswer('true')" :disabled="showResult" />
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
              </label>
              <label
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === 'false',
                    'correct-answer': showResult && 'false' === currentQuestion.answer,
                    'wrong-answer': showResult && selectedAnswer === 'false' && 'false' !== currentQuestion.answer
                  }
                ]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="false" v-model="selectedAnswer" @change="saveAnswer('false')" :disabled="showResult" />
                <span class="option-key">✗</span>
                <span class="option-text">错误</span>
              </label>
            </div>

            <!-- 填空题/简答题 -->
            <div v-if="isTextType(currentQuestion.question_type)" class="text-input-area">
              <textarea
                v-model="textAnswer"
                :placeholder="currentQuestion.question_type === 'fill_blank' ? '请输入答案...' : '请输入你的回答...'"
                rows="4"
                @input="saveAnswer(textAnswer)"
                :disabled="showResult"
              ></textarea>
            </div>
          </div>

          <!-- 答案与解析（交卷后显示） -->
          <div v-if="showResult" class="answer-section">
            <div class="answer-correct">
              <strong>正确答案：</strong>
              <span>{{ currentQuestion.answer }}</span>
            </div>
            <div class="answer-analysis" v-if="currentQuestion.analysis">
              <strong>解析：</strong>
              <p>{{ currentQuestion.analysis }}</p>
            </div>
            <button class="btn btn-sm btn-outline ai-btn" @click="openAIQuestion(currentQuestion)">
              AI 讲解
            </button>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="question-footer card">
          <button class="btn btn-outline" :disabled="currentIndex === 0" @click="prevQuestion">
            ← 上一题
          </button>
          <span class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</span>
          <button class="btn btn-primary" :disabled="currentIndex === questions.length - 1" @click="nextQuestion">
            下一题 →
          </button>
        </div>
      </div>

      <!-- 交卷确认弹窗 -->
      <div v-if="showSubmitModal" class="modal-overlay" @click.self="showSubmitModal = false">
        <div class="confirm-modal card">
          <h3>确认交卷？</h3>
          <p>已答 {{ answeredCount }} / {{ questions.length }} 题</p>
          <p class="unanswered-warning" v-if="unansweredCount > 0">
            还有 {{ unansweredCount }} 题未作答
          </p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showSubmitModal = false">继续答题</button>
            <button class="btn btn-primary" @click="confirmSubmit" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认交卷' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 成绩弹窗 -->
      <div v-if="showResultModal" class="modal-overlay">
        <div class="result-modal card">
          <div class="result-icon">{{ score >= 60 ? '\u2713' : '\u2726' }}</div>
          <h2>{{ score >= 60 ? '恭喜完成！' : '继续加油！' }}</h2>
          <div class="result-score">{{ score }} 分</div>
          <p>正确 {{ correctCount }} / {{ questions.length }} 题</p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="reviewAnswers">查看解析</button>
            <button class="btn btn-primary" @click="$router.push('/student/home')">返回首页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI问答弹窗 -->
    <AIAnswerModal
      v-model:visible="showAIModal"
      :question-id="aiQuestion?.id"
      :question-content="aiQuestion?.content"
      :question-options="aiQuestion?.options"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getExamDetail, startExam, submitExam as submitExamApi } from '@/api/student'
import AIAnswerModal from '@/components/AIAnswerModal.vue'

const route = useRoute()
const examId = route.params.id || '0'

const loading = ref(false)
const error = ref('')
const examInfo = ref(null)
const questions = ref([])
const answers = ref({})
const currentIndex = ref(0)
const remainingSeconds = ref(3600)
const showSubmitModal = ref(false)
const showResultModal = ref(false)
const submitting = ref(false)
const showResult = ref(false)
const score = ref(0)
const correctCount = ref(0)
const showAIModal = ref(false)
const aiQuestion = ref(null)

let timerInterval = null
const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

const selectedAnswer = computed({
  get: () => {
    if (!currentQuestion.value) return ''
    return answers.value[currentQuestion.value.id] || ''
  },
  set: (val) => {
    if (currentQuestion.value) {
      answers.value[currentQuestion.value.id] = val
    }
  }
})

const selectedAnswers = computed(() => {
  if (!currentQuestion.value) return []
  const ans = answers.value[currentQuestion.value.id]
  return ans ? ans.split(',') : []
})

const textAnswer = computed({
  get: () => {
    if (!currentQuestion.value) return ''
    return answers.value[currentQuestion.value.id] || ''
  },
  set: (val) => {
    if (currentQuestion.value) {
      answers.value[currentQuestion.value.id] = val
    }
  }
})

const answeredCount = computed(() => {
  return Object.values(answers.value).filter(v => v !== undefined && v !== '').length
})

const unansweredCount = computed(() => questions.value.length - answeredCount.value)

const parsedOptions = computed(() => {
  if (!currentQuestion.value?.options) return {}
  if (typeof currentQuestion.value.options === 'object') return currentQuestion.value.options
  try {
    return JSON.parse(currentQuestion.value.options)
  } catch {
    return {}
  }
})

function isChoiceType(type) {
  return type === 'choice' || type === 'multiple_choice'
}

function isTextType(type) {
  return type === 'fill_blank' || type === 'essay'
}

function typeLabel(type) {
  const map = {
    choice: '单选题',
    multiple_choice: '多选题',
    true_false: '判断题',
    fill_blank: '填空题',
    essay: '简答题'
  }
  return map[type] || type
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TIMER_KEY = 'exam_timer_' + examId
const ANSWERS_KEY = 'exam_answers_' + examId
const RESULT_KEY = 'exam_result_' + examId

function saveTimerToStorage() {
  // 存的是考试开始的绝对时间戳
  localStorage.setItem(TIMER_KEY, Date.now().toString())
}

function saveAnswersToStorage() {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers.value))
}

function saveResultToStorage() {
  localStorage.setItem(RESULT_KEY, JSON.stringify({
    showResult: showResult.value,
    showResultModal: showResultModal.value,
    score: score.value,
    correctCount: correctCount.value
  }))
}

function clearExamStorage() {
  localStorage.removeItem(TIMER_KEY)
  localStorage.removeItem(ANSWERS_KEY)
  localStorage.removeItem(RESULT_KEY)
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  // 从 localStorage 恢复计时，防止刷新归零
  const savedStart = localStorage.getItem(TIMER_KEY)
  if (savedStart) {
    const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000)
    const total = (examInfo.value?.duration || 120) * 60
    remainingSeconds.value = Math.max(0, total - elapsed)
    if (remainingSeconds.value <= 0) {
      confirmSubmit()
      return
    }
  }
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timerInterval)
      confirmSubmit()
    }
  }, 1000)
}

function saveAnswer(value) {
  if (!currentQuestion.value) return
  answers.value[currentQuestion.value.id] = value
  saveAnswersToStorage()
}

function toggleMultiple(key) {
  if (!currentQuestion.value) return
  const current = selectedAnswers.value
  const newAnswers = current.includes(key)
    ? current.filter(k => k !== key)
    : [...current, key]
  answers.value[currentQuestion.value.id] = newAnswers.sort().join(',')
}

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

function submitExam() {
  showSubmitModal.value = true
}

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true

  try {
    const answerList = questions.value.map(q => ({
      question_id: q.id,
      answer: answers.value[q.id] || ''
    }))
    const res = await submitExamApi(examId, answerList)
    const data = res.data || {}
    score.value = data.score || 0
    correctCount.value = data.correct || 0
    // 把后端返回的 details 合并回 questions（含 correct_answer 和 analysis）
    if (data.details) {
      questions.value = questions.value.map(q => {
        const detail = data.details.find(d => d.question_id === q.id)
        if (detail) {
          return { ...q, answer: detail.correct_answer, analysis: detail.explanation || '' }
        }
        return q
      })
    }
    showResult.value = true
    showResultModal.value = true
    clearInterval(timerInterval)
    clearExamStorage()
    saveResultToStorage()
    saveAnswersToStorage()
  } catch (err) {
    error.value = '提交失败：' + (err.response?.data?.error || '网络错误')
  } finally {
    submitting.value = false
  }
}

function reviewAnswers() {
  showResultModal.value = false
  saveResultToStorage()
}

function openAIQuestion(question) {
  aiQuestion.value = question
  showAIModal.value = true
}

async function loadExam() {
  loading.value = true
  error.value = ''

  // 恢复已提交的考试结果
  const savedResult = localStorage.getItem(RESULT_KEY)
  const savedAnswers = localStorage.getItem(ANSWERS_KEY)
  if (savedResult) {
    try {
      const r = JSON.parse(savedResult)
      if (r.showResult) {
        showResult.value = true
        showResultModal.value = r.showResultModal
        score.value = r.score
        correctCount.value = r.correctCount
        if (savedAnswers) answers.value = JSON.parse(savedAnswers)
      }
    } catch { /* 忽略恢复失败 */ }
  }

  try {
    const res = await getExamDetail(examId)
    examInfo.value = res.data?.exam || res.data
    questions.value = res.data?.questions || []
    if (examInfo.value?.duration) {
      remainingSeconds.value = examInfo.value.duration * 60
    }
    // 调用开始考试接口，创建 ongoing 记录
    await startExam(examId)
  } catch (err) {
    error.value = '加载试卷失败：' + (err.response?.data?.error || '网络错误')
  }
  loading.value = false

  startTimer()
}

onMounted(() => {
  loadExam()
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.exam-page {
  max-width: 800px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.exam-header h2 {
  margin: 0;
  font-size: 1.2em;
  color: var(--ink, #2a2a2a);
}

.exam-meta {
  font-size: 13px;
  color: var(--muted, #6b655c);
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.exam-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--primary, #d97757);
  font-family: 'Courier New', monospace;
}

.timer--warning {
  color: #c64545;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.5; }
}

/* ===== 题目导航（答题卡） ===== */
.question-nav {
  padding: 14px 20px;
}

.nav-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #2c2c2c);
  margin-bottom: 12px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.nav-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md, 8px);
  border: 1.5px solid var(--hairline, #e8e0d5);
  background: var(--card-bg, #ffffff);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted, #6b6b6b);
  transition: all 0.2s;
  font-family: inherit;
  padding: 0;
}

.nav-dot:hover {
  border-color: var(--primary, #d97757);
  color: var(--primary, #d97757);
}

.nav-dot.answered {
  border-color: var(--primary, #d97757);
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
}

.nav-dot.current {
  border-color: var(--primary, #d97757);
  background: var(--primary, #d97757);
  color: #fff;
  font-weight: 700;
}

.nav-dot.correct { background: rgba(93,184,114,0.12); border-color: #5db872; color: #5db872; }
.nav-dot.wrong { background: rgba(198,69,69,0.1); border-color: #c64545; color: #c64545; }

@media (max-width: 900px) {
  .nav-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 600px) {
  .nav-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .nav-dot {
    font-size: 13px;
  }
}

/* ===== 题目卡片 ===== */
.question-card {
  padding: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-type-badge {
  padding: 3px 10px;
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
}

.question-difficulty {
  font-size: 13px;
  color: var(--muted-soft, #9f988e);
}

.question-content {
  margin: 0 0 20px 0;
  font-size: 1.05em;
  line-height: 1.7;
  color: var(--ink, #2a2a2a);
}

/* ===== 选项列表 ===== */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1.5px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card-bg, #ffffff);
}

.option-item:hover:not(.correct-answer):not(.wrong-answer) {
  border-color: var(--primary, #d97757);
  background: var(--primary-bg, rgba(217,119,87,0.06));
}

.option-item.selected {
  border-color: var(--primary, #d97757);
  background: var(--primary-bg, rgba(217,119,87,0.12));
}

.option-item.correct-answer {
  border-color: #5db872;
  background: rgba(93,184,114,0.08);
}

.option-item.wrong-answer {
  border-color: #c64545;
  background: rgba(198,69,69,0.06);
}

.option-item input {
  margin-right: 10px;
  accent-color: var(--primary, #d97757);
}

.option-key {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  background: var(--hairline, #e3dbd0);
  border-radius: 50%;
  margin-right: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted, #6b655c);
  flex-shrink: 0;
}

.option-item.selected .option-key {
  background: var(--primary, #d97757);
  color: #fff;
}

.option-item.correct-answer .option-key {
  background: #5db872;
  color: #fff;
}

.option-item.wrong-answer .option-key {
  background: #c64545;
  color: #fff;
}

.option-text { flex: 1; font-size: 14px; color: var(--ink, #2a2a2a); }
.check-mark { color: #5db872; font-weight: 700; margin-left: 8px; }
.x-mark { color: #c64545; font-weight: 700; margin-left: 8px; }

/* ===== 文本输入 ===== */
.text-input-area textarea {
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--hairline-strong, #ccc2b4);
  border-radius: var(--radius-md, 8px);
  font-size: 15px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  color: var(--ink, #2a2a2a);
  transition: border-color 0.2s;
}

.text-input-area textarea:focus {
  border-color: var(--primary, #d97757);
  box-shadow: 0 0 0 3px var(--primary-bg, rgba(217,119,87,0.12));
}

/* ===== 答案与解析 ===== */
.answer-section {
  margin-top: 20px;
  padding: 16px;
  background: var(--primary-bg, rgba(217,119,87,0.06));
  border: 1px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-md, 8px);
}

.answer-correct {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--ink, #2a2a2a);
}

.answer-correct strong { color: var(--muted, #6b655c); }
.answer-correct span { color: #5db872; font-weight: 600; }

.answer-analysis {
  font-size: 14px;
  color: var(--muted, #6b655c);
}

.answer-analysis p { margin: 4px 0 0; line-height: 1.6; }

.ai-btn { margin-top: 10px; }

/* ===== 题目底部导航 ===== */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}

.progress-text {
  font-size: 14px;
  color: var(--muted, #6b655c);
  font-weight: 500;
}

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal, .result-modal {
  max-width: 420px;
  width: 100%;
  padding: 32px 28px;
  text-align: center;
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--hairline, #e8e0d5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.confirm-modal h3 {
  margin: 0 0 12px;
  font-size: 1.15em;
  color: var(--ink, #2c2c2c);
}

.unanswered-warning {
  color: #d4a017;
  font-size: 14px;
  margin-top: 8px;
}

.result-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
  font-weight: 700;
  background: rgba(93,184,114,0.1);
  color: #5db872;
}

.result-score {
  font-size: 2.5em;
  font-weight: 700;
  color: var(--primary, #d97757);
  margin: 10px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .exam-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .exam-header-right { width: 100%; justify-content: space-between; }
  .option-item { padding: 10px 12px; }
}
</style>