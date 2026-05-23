<template>
  <div class="practice-page">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="btn btn-back" @click="$router.push('/student/home')">
        ← 返回主页
      </button>

      <!-- 练习头部信息 -->
      <div class="practice-header card" v-if="practiceInfo">
        <div class="practice-header-left">
          <h2>{{ practiceInfo.name || '练习模式' }}</h2>
          <div class="practice-meta">
            <span>共 {{ questions.length }} 题</span>
          </div>
        </div>
        <div class="practice-header-right">
          <button class="btn btn-primary" @click="submitPractice">
            提交练习
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载题目中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state card">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="$router.back()">返回</button>
      </div>

      <!-- 题目列表 -->
      <div v-if="!loading && questions.length > 0" class="questions-area">
        <!-- 题目导航 -->
        <div class="question-nav card">
          <span class="nav-label">答题卡：</span>
          <button
            v-for="(q, index) in questions.filter(Boolean)"
            :key="q.id || index"
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

        <!-- 当前题目 -->
        <div class="question-card card" v-if="currentQuestion">
          <div class="question-header">
            <span class="question-type-badge">{{ typeLabel(currentQuestion.question_type) }}</span>
            <span class="question-difficulty" v-if="currentQuestion.difficulty">
              {{ '⭐'.repeat(currentQuestion.difficulty) }}
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
                    'correct-answer': showResult && key === currentQuestion?.answer,
                    'wrong-answer': showResult && selectedAnswer === key && key !== currentQuestion?.answer
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
            <div v-if="currentQuestion.question_type === 'true_false' || currentQuestion.question_type === 'judge'" class="options-list">
              <label
                :class="['option-item', {
                  selected: selectedAnswer === '正确',
                  'correct-answer': showResult && isAnswerCorrect('正确', currentQuestion.answer, 'true_false'),
                  'wrong-answer': showResult && selectedAnswer === '正确' && !isAnswerCorrect('正确', currentQuestion.answer, 'true_false')
                }]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="正确" v-model="selectedAnswer" @change="saveAnswer('正确')" :disabled="showResult" />
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
              </label>
              <label
                :class="['option-item', {
                  selected: selectedAnswer === '错误',
                  'correct-answer': showResult && isAnswerCorrect('错误', currentQuestion.answer, 'true_false'),
                  'wrong-answer': showResult && selectedAnswer === '错误' && !isAnswerCorrect('错误', currentQuestion.answer, 'true_false')
                }]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="错误" v-model="selectedAnswer" @change="saveAnswer('错误')" :disabled="showResult" />
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

          <!-- 答案与解析（提交后显示） -->
          <div v-if="showResult" class="answer-section">
            <div class="answer-correct">
              <strong>正确答案：</strong>
              <span>{{ formatAnswer(currentQuestion.answer, currentQuestion.question_type) }}</span>
            </div>
            <div class="answer-analysis" v-if="currentQuestion.analysis">
              <strong>解析：</strong>
              <p>{{ currentQuestion.analysis }}</p>
            </div>
            <button class="btn btn-sm btn-outline ai-btn" @click="openAIQuestion(currentQuestion)">
              🤖 AI 讲解
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

      <!-- 提交确认弹窗 -->
      <div v-if="showSubmitModal" class="modal-overlay" @click.self="showSubmitModal = false">
        <div class="confirm-modal card">
          <h3>确认提交练习？</h3>
          <p>已答 {{ answeredCount }} / {{ questions.length }} 题</p>
          <p class="unanswered-warning" v-if="unansweredCount > 0">
            ⚠️ 还有 {{ unansweredCount }} 题未作答
          </p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showSubmitModal = false">继续练习</button>
            <button class="btn btn-primary" @click="confirmSubmit" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认提交' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 成绩弹窗 -->
      <div v-if="showResultModal" class="modal-overlay">
        <div class="result-modal card">
          <div class="result-icon">{{ score >= 60 ? '🎉' : '💪' }}</div>
          <h2>{{ score >= 60 ? '恭喜完成！' : '继续加油！' }}</h2>
          <div class="result-score">{{ score }} 分</div>
          <p>正确 {{ correctCount }} / {{ questions.length }} 题</p>
          <p v-if="wrongCount > 0" class="wrong-hint">答错的题目已自动加入错题本 📝</p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="reviewAnswers">查看解析</button>
            <button class="btn btn-outline" @click="$router.push('/student/wrongbook')">去错题本</button>
            <button class="btn btn-primary" @click="goBack">返回首页</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPracticeQuestions, addWrongQuestion, savePracticeRecord } from '@/api/student'
import AIAnswerModal from '@/components/AIAnswerModal.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const practiceInfo = ref(null)
const questions = ref([])
const answers = ref({})
const currentIndex = ref(0)
const showSubmitModal = ref(false)
const showResultModal = ref(false)
const submitting = ref(false)
const showResult = ref(false)
const score = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)
const showAIModal = ref(false)
const aiQuestion = ref(null)
const addingWrongIds = ref(new Set())

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
  return type === 'choice' || type === 'multiple' || type === 'multiple_choice'
}

function isTextType(type) {
  return type === 'fill_blank' || type === 'essay'
}

function typeLabel(type) {
  const map = {
    choice: '单选题',
    multiple_choice: '多选题',
    true_false: '判断题',
    judge: '判断题',
    fill_blank: '填空题',
    essay: '简答题'
  }
  return map[type] || type
}

// ========== 答案比较 ==========
function isAnswerCorrect(studentAnswer, correctAnswer, questionType) {
  const sa = String(studentAnswer || '').trim()
  const ca = String(correctAnswer || '').trim()
  if (!sa || !ca) return false
  if (questionType === 'fill_blank') {
    return sa.toLowerCase() === ca.toLowerCase()
  }
  if (questionType === 'multiple_choice' || questionType === 'multiple') {
    const sort = (s) => s.split(',').map(x => x.trim()).filter(Boolean).sort().join(',')
    return sort(sa) === sort(ca)
  }
  if (questionType === 'true_false' || questionType === 'judge') {
    const norm = (v) => {
      if (v === 'A' || v === '正确' || v === 'true' || v === 'True') return '正确'
      if (v === 'B' || v === '错误' || v === 'false' || v === 'False') return '错误'
      return v
    }
    return norm(sa) === norm(ca)
  }
  return sa === ca
}

function formatAnswer(answer, questionType) {
  if (questionType === 'true_false' || questionType === 'judge') {
    const map = { 'A': '正确', 'B': '错误', 'true': '正确', 'True': '正确', 'false': '错误', 'False': '错误', '正确': '正确', '错误': '错误' }
    return map[answer] || answer
  }
  return answer
}

function saveAnswer(value) {
  if (!currentQuestion.value) return
  answers.value[currentQuestion.value.id] = value
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

function submitPractice() {
  showSubmitModal.value = true
}

const PRACTICE_RESULT_KEY = 'practice_result'

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true

  calculateScore()
  showResultModal.value = true
  showResult.value = true

  // 保存到 sessionStorage 防止刷新丢失
  sessionStorage.setItem(PRACTICE_RESULT_KEY, JSON.stringify({
    score: score.value,
    correctCount: correctCount.value,
    wrongCount: wrongCount.value,
    showResult: true,
    answers: answers.value,
    questions: questions.value
  }))

  // 保存做题记录 + 添加错题
  const sourceType = route.query.source === 'ai' ? 'ai' : 'main'
  for (const q of questions.value) {
    const studentAnswer = String(answers.value[q.id] || '')
    const correctAnswer = String(q.answer || '')
    const isCorrect = isAnswerCorrect(studentAnswer, correctAnswer, q.question_type)
    try {
      await savePracticeRecord({
        source_type: sourceType,
        question_id: q.id,
        question_content: q.content || '',
        question_type: q.question_type || '',
        student_answer: studentAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        knowledge_point: q.knowledge_point || ''
      })
    } catch { /* 静默失败 */ }
    if (!isCorrect && !addingWrongIds.value.has(q.id)) {
      addingWrongIds.value.add(q.id)
      try { await addWrongQuestion(q.id, sourceType, studentAnswer) } catch { /* 静默 */ }
    }
  }

  submitting.value = false
}

function calculateScore() {
  let correct = 0
  let wrong = 0
  questions.value.forEach(q => {
    if (isAnswerCorrect(answers.value[q.id], q.answer, q.question_type)) {
      correct++
    } else {
      wrong++
    }
  })
  correctCount.value = correct
  wrongCount.value = wrong
  score.value = questions.value.length > 0 ? Math.round((correct / questions.value.length) * 100) : 0
}

function reviewAnswers() {
  showResultModal.value = false
}

function openAIQuestion(question) {
  aiQuestion.value = question
  showAIModal.value = true
}

function goBack() {
  router.push('/student/home')
}

async function loadPracticeQuestions() {
  loading.value = true
  error.value = ''
  practiceInfo.value = { name: '练习模式' }

  // 恢复已提交的结果（防止刷新丢失）
  const saved = sessionStorage.getItem(PRACTICE_RESULT_KEY)
  if (saved) {
    try {
      const r = JSON.parse(saved)
      if (r.showResult) {
        questions.value = r.questions || []
        answers.value = r.answers || {}
        score.value = r.score
        correctCount.value = r.correctCount
        wrongCount.value = r.wrongCount
        showResult.value = true
        showResultModal.value = false  // 不显示弹窗，直接看逐题解析
        loading.value = false
        return
      }
    } catch { sessionStorage.removeItem(PRACTICE_RESULT_KEY) }
  }

  const sourceQuery = route.query.source

  if (sourceQuery === 'ai') {
    try {
      const data = sessionStorage.getItem('aiQuestions')
      if (!data) { error.value = '未找到AI题目数据'; loading.value = false; return }
      questions.value = JSON.parse(data)
      sessionStorage.removeItem('aiQuestions')
      currentIndex.value = 0
      practiceInfo.value.name = 'AI 智能出题练习'
    } catch {
      error.value = '解析AI题目数据失败'
      loading.value = false
      return
    }
  } else {
    // 从题库抽题（带筛选）
    try {
      const params = { count: 10 }
      if (route.query.knowledge_point) params.knowledge_point = route.query.knowledge_point
      if (route.query.question_type) params.question_type = route.query.question_type
      if (route.query.count) params.count = parseInt(route.query.count)
      const res = await getPracticeQuestions(params)
      questions.value = res.data?.questions || []
    } catch {
      questions.value = getMockQuestions()
    }
  }

  // 答案显示友好化
  if (questions.value.length > 0 && !sourceQuery) {
    practiceInfo.value.name = '随堂练习'
  }

  loading.value = false
}

function getMockQuestions() {
  return [
    {
      id: 1,
      question_type: 'choice',
      content: 'Python中列表推导式的基本语法是什么？',
      options: '{"A": "[x for x in iterable]", "B": "for x in iterable: [x]", "C": "list(for x in iterable)", "D": "{x for x in iterable}"}',
      answer: 'A',
      analysis: '列表推导式语法为 [expression for item in iterable]',
      difficulty: 2
    },
    {
      id: 2,
      question_type: 'true_false',
      content: 'Python中的字典是有序集合。',
      options: '',
      answer: 'true',
      analysis: 'Python 3.7+ 中字典保持插入顺序',
      difficulty: 1
    },
    {
      id: 3,
      question_type: 'multiple_choice',
      content: '以下哪些是Python的不可变类型？',
      options: '{"A": "int", "B": "list", "C": "tuple", "D": "str"}',
      answer: 'A,C,D',
      analysis: 'int, tuple, str 是不可变类型，list是可变类型',
      difficulty: 2
    },
    {
      id: 4,
      question_type: 'fill_blank',
      content: 'Python中用于定义函数的关键字是 ____。',
      options: '',
      answer: 'def',
      analysis: '使用 def 关键字定义函数',
      difficulty: 1
    },
    {
      id: 5,
      question_type: 'choice',
      content: '以下哪个不是Python的内置数据类型？',
      options: '{"A": "list", "B": "array", "C": "tuple", "D": "dict"}',
      answer: 'B',
      analysis: 'array 不是Python内置类型，需要从 array 模块导入',
      difficulty: 2
    }
  ]
}

onMounted(() => {
  loadPracticeQuestions()
})
</script>

<style scoped>
.practice-page {
  max-width: 800px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.practice-header h2 {
  margin: 0;
  font-size: 1.2em;
  color: var(--ink, #2a2a2a);
}

.practice-meta {
  font-size: 13px;
  color: var(--muted, #6b655c);
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.practice-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== 题目导航 ===== */
.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
  align-items: center;
}

.nav-label {
  font-size: 13px;
  color: var(--muted, #6b655c);
  margin-right: 4px;
}

.nav-dot {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md, 8px);
  border: 1.5px solid var(--hairline, #e3dbd0);
  background: var(--card-bg, #ffffff);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted, #6b655c);
  transition: all 0.2s;
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
  border: 1px solid var(--hairline, #e3dbd0);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.confirm-modal h3 {
  margin: 0 0 12px;
  font-size: 1.15em;
  color: var(--ink, #2a2a2a);
}

.unanswered-warning {
  color: #d4a017;
  font-size: 14px;
  margin-top: 8px;
}

.result-score {
  font-size: 2.5em;
  font-weight: 700;
  color: var(--primary, #d97757);
  margin: 10px 0;
}

.wrong-hint {
  color: var(--muted, #6b655c);
  font-size: 13px;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .practice-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .practice-header-right { width: 100%; justify-content: flex-end; }
  .option-item { padding: 10px 12px; }
}
</style>