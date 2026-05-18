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
          <h2>{{ examInfo.name || '练习模式' }}</h2>
          <div class="exam-meta">
            <span>共 {{ questions.length }} 题</span>
            <span v-if="isExamMode">总分: {{ examInfo.total_score || 100 }}</span>
          </div>
        </div>
        <div class="exam-header-right">
          <div class="timer" :class="{ 'timer--warning': remainingSeconds <= 300 }">
            ⏱ {{ formatTime(remainingSeconds) }}
          </div>
          <button class="btn btn-primary" @click="submitExam">
            {{ isExamMode ? '交卷' : '完成练习' }}
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
        <!-- 题目导航 -->
        <div class="question-nav card">
          <span class="nav-label">答题卡：</span>
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
              <span v-if="currentQuestion.question_type === 'multiple_choice'" class="multi-hint">（多选题）</span>
            </h3>

            <!-- 单选题（点击即判断） -->
            <div v-if="currentQuestion.question_type === 'choice'" class="options-list">
              <label
                v-for="(opt, key) in parsedOptions"
                :key="key"
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === key,
                    'correct-answer': isRevealed(currentQuestion.id) && key === currentQuestion.answer,
                    'wrong-answer': isRevealed(currentQuestion.id) && selectedAnswer === key && key !== currentQuestion.answer
                  }
                ]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" :value="key" v-model="selectedAnswer" @change="handleSelect(key)" :disabled="isRevealed(currentQuestion.id)" />
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="isRevealed(currentQuestion.id) && key === currentQuestion.answer" class="check-mark">✓</span>
                <span v-if="isRevealed(currentQuestion.id) && selectedAnswer === key && key !== currentQuestion.answer" class="x-mark">✗</span>
              </label>
            </div>

            <!-- 多选题（checkbox + 提交本题按钮） -->
            <div v-if="currentQuestion.question_type === 'multiple_choice'" class="options-list">
              <label
                v-for="(opt, key) in parsedOptions"
                :key="key"
                :class="[
                  'option-item',
                  { 
                    'option-checked': selectedAnswers.includes(key),
                    'correct-answer': isRevealed(currentQuestion.id) && key === currentQuestion.answer,
                    'wrong-answer': isRevealed(currentQuestion.id) && selectedAnswers.includes(key) && key !== currentQuestion.answer
                  }
                ]"
              >
                <input type="checkbox" :value="key" :checked="selectedAnswers.includes(key)" @change="toggleMultiple(key)" :disabled="isRevealed(currentQuestion.id)" />
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="isRevealed(currentQuestion.id) && key === currentQuestion.answer" class="check-mark">✓</span>
                <span v-if="isRevealed(currentQuestion.id) && selectedAnswers.includes(key) && key !== currentQuestion.answer" class="x-mark">✗</span>
              </label>
              <button v-if="!isRevealed(currentQuestion.id)" class="btn btn-primary btn-sm" @click="submitMultiSelect" :disabled="selectedAnswers.length === 0">
                提交本题
              </button>
            </div>

            <!-- 判断题 -->
            <div v-if="currentQuestion.question_type === 'true_false'" class="options-list">
              <label
                :class="['option-item', { selected: selectedAnswer === '正确', 'correct-answer': isRevealed(currentQuestion.id) && isAnswerCorrect('正确', currentQuestion.answer, 'true_false'), 'wrong-answer': isRevealed(currentQuestion.id) && selectedAnswer === '正确' && !isAnswerCorrect('正确', currentQuestion.answer, 'true_false') }]"
              >
                <input type="radio" :name="'judge_' + currentQuestion.id" value="正确" v-model="selectedAnswer" @change="handleSelect('正确')" :disabled="isRevealed(currentQuestion.id)" />
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
              </label>
              <label
                :class="['option-item', { selected: selectedAnswer === '错误', 'correct-answer': isRevealed(currentQuestion.id) && isAnswerCorrect('错误', currentQuestion.answer, 'true_false'), 'wrong-answer': isRevealed(currentQuestion.id) && selectedAnswer === '错误' && !isAnswerCorrect('错误', currentQuestion.answer, 'true_false') }]"
              >
                <input type="radio" :name="'judge_' + currentQuestion.id" value="错误" v-model="selectedAnswer" @change="handleSelect('错误')" :disabled="isRevealed(currentQuestion.id)" />
                <span class="option-key">✗</span>
                <span class="option-text">错误</span>
              </label>
            </div>

            <!-- 填空题 -->
            <div v-if="currentQuestion.question_type === 'fill_blank'" class="text-input-area">
              <textarea v-model="textAnswer" placeholder="请输入答案，多空用分号隔开..." rows="3" :disabled="isRevealed(currentQuestion.id)"></textarea>
              <button v-if="!isRevealed(currentQuestion.id)" class="btn btn-primary btn-sm" style="margin-top: 8px;" @click="submitFillBlank" :disabled="!textAnswer.trim()">
                提交本题
              </button>
            </div>

            <!-- 简答题 -->
            <div v-if="currentQuestion.question_type === 'essay'" class="text-input-area">
              <textarea v-model="textAnswer" placeholder="请输入你的回答..." rows="4" :disabled="isRevealed(currentQuestion.id)"></textarea>
              <button v-if="!isRevealed(currentQuestion.id)" class="btn btn-primary btn-sm" style="margin-top: 8px;" @click="submitFillBlank" :disabled="!textAnswer.trim()">
                提交本题
              </button>
            </div>
          </div>

          <!-- 答案与解析 -->
          <div v-if="isRevealed(currentQuestion.id)" class="answer-section">
            <div :class="['answer-badge', selectedIsCorrect ? 'correct' : 'wrong']">
              {{ selectedIsCorrect ? '✅ 回答正确' : '❌ 回答错误' }}
            </div>
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

      <!-- 交卷确认弹窗 -->
      <div v-if="showSubmitModal" class="modal-overlay" @click.self="showSubmitModal = false">
        <div class="confirm-modal card">
          <h3>确认交卷？</h3>
          <p>已答 {{ answeredCount }} / {{ questions.length }} 题</p>
          <p class="unanswered-warning" v-if="unansweredCount > 0">
            ⚠️ 还有 {{ unansweredCount }} 题未作答
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
          <div class="result-icon">{{ score >= 60 ? '🎉' : '💪' }}</div>
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
      :source-type="route.query.source === 'ai' ? 'ai' : 'main'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getExamDetail, startExam, submitExam as submitExamApi, getPracticeQuestions, submitPracticeAnswers, savePracticeRecord, addWrongQuestion } from '@/api/student'
import AIAnswerModal from '@/components/AIAnswerModal.vue'

const route = useRoute()
const examId = route.params.id || '0'

const loading = ref(false)
const error = ref('')
const examInfo = ref(null)
const questions = ref([])
const answers = ref({})
const revealedQuestions = ref(new Set())  // 已答题并显示反馈的题目ID集合
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

const isExamMode = computed(() => route.query.mode !== 'practice')
const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

// 统一答案比较函数（兼容各题型）
function isAnswerCorrect(studentAnswer, correctAnswer, questionType) {
  const sa = String(studentAnswer || '').trim()
  const ca = String(correctAnswer || '').trim()
  if (!sa || !ca) return false

  if (questionType === 'fill_blank') {
    // 支持多空：用分号分隔，逐个比较
    const splitMulti = (s) => s.split(/[;；]/).map(x => x.trim().toLowerCase())
    const sParts = splitMulti(sa)
    const cParts = splitMulti(ca)
    if (sParts.length !== cParts.length) return sa.toLowerCase() === ca.toLowerCase()
    return sParts.every((p, i) => p === cParts[i] || p === `(${i + 1})${cParts[i]}`)
  }
  if (questionType === 'multiple_choice') {
    const sort = (s) => s.split(',').map(x => x.trim()).filter(Boolean).sort().join(',')
    return sort(sa) === sort(ca)
  }
  if (questionType === 'true_false') {
    // 兼容：DB可能存"A"/"B"（键值）或"正确"/"错误"或"true"/"false"
    const normJudge = (v) => {
      if (v === 'A' || v === '正确' || v === 'true' || v === 'True') return '正确'
      if (v === 'B' || v === '错误' || v === 'false' || v === 'False') return '错误'
      return v
    }
    return normJudge(sa) === normJudge(ca)
  }
  // choice、essay 等：直接比较
  return sa === ca
}

// 友好显示正确答案（判断题映射 A→正确、B→错误）
function formatAnswer(answer, questionType) {
  if (questionType === 'true_false') {
    if (answer === 'A') return '正确'
    if (answer === 'B') return '错误'
    // 已经是中文格式或英文格式
    const map = { 'true': '正确', 'True': '正确', 'false': '错误', 'False': '错误', '正确': '正确', '错误': '错误' }
    return map[answer] || answer
  }
  return answer
}

// 当前题目是否已显示反馈
const currentRevealed = computed(() => revealedQuestions.value.has(currentQuestion.value?.id))
// 当前题目选择的答案是否正确
const selectedIsCorrect = computed(() => {
  if (!currentQuestion.value || !currentRevealed.value) return false
  return isAnswerCorrect(answers.value[currentQuestion.value.id], currentQuestion.value.answer, currentQuestion.value.question_type)
})

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

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timerInterval)
      if (isExamMode.value) {
        confirmSubmit()
      }
    }
  }, 1000)
}

function isRevealed(qId) {
  return isExamMode.value ? showResult.value : revealedQuestions.value.has(qId)
}

function handleSelect(value) {
  if (!currentQuestion.value || isRevealed(currentQuestion.value.id)) return
  answers.value[currentQuestion.value.id] = value
  // 选择后立即显示反馈（练习模式即时反馈，考试模式不显示）
  if (!isExamMode.value) {
    const newSet = new Set(revealedQuestions.value)
    newSet.add(currentQuestion.value.id)
    revealedQuestions.value = newSet
  }
}

function toggleMultiple(key) {
  if (!currentQuestion.value || isRevealed(currentQuestion.value.id)) return
  const current = selectedAnswers.value
  const newAnswers = current.includes(key)
    ? current.filter(k => k !== key)
    : [...current, key]
  answers.value[currentQuestion.value.id] = newAnswers.sort().join(',')
}

function submitMultiSelect() {
  if (!currentQuestion.value || isRevealed(currentQuestion.value.id)) return
  // 多选题：提交时才揭示答案
  if (!isExamMode.value) {
    const newSet = new Set(revealedQuestions.value)
    newSet.add(currentQuestion.value.id)
    revealedQuestions.value = newSet
  }
}

function submitFillBlank() {
  if (!currentQuestion.value || isRevealed(currentQuestion.value.id)) return
  answers.value[currentQuestion.value.id] = textAnswer.value
  if (!isExamMode.value) {
    const newSet = new Set(revealedQuestions.value)
    newSet.add(currentQuestion.value.id)
    revealedQuestions.value = newSet
  }
}

function handleTextInput() {
  if (!currentQuestion.value || isRevealed(currentQuestion.value.id)) return
  answers.value[currentQuestion.value.id] = textAnswer.value
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

  if (!isExamMode.value) {
    // 练习模式：本地计算 + 保存做题记录 + 添加错题
    const details = []
    questions.value.forEach(q => {
      const studentAnswer = String(answers.value[q.id] || '')
      const correctAnswer = String(q.answer || '')
      const isCorrect = isAnswerCorrect(studentAnswer, correctAnswer, q.question_type)
      details.push({ q, studentAnswer, correctAnswer, isCorrect })
    })

    calculateScore()

    const sourceType = route.query.source === 'ai' ? 'ai' : 'main'

    // 保存做题记录 和 错题
    for (const d of details) {
      try {
        await savePracticeRecord({
          source_type: sourceType,
          question_id: d.q.id,
          question_content: d.q.content || '',
          question_type: d.q.question_type || '',
          student_answer: d.studentAnswer,
          correct_answer: d.correctAnswer,
          is_correct: d.isCorrect,
          knowledge_point: d.q.knowledge_point || ''
        })
      } catch { /* 静默失败 */ }

      // 答错的题加入错题本
      if (!d.isCorrect) {
        try {
          await addWrongQuestion(d.q.id, sourceType, d.studentAnswer)
        } catch { /* 静默失败 */ }
      }
    }

    showResultModal.value = true
    showResult.value = true
    submitting.value = false
    clearInterval(timerInterval)
    return
  }

  try {
    // 构建提交答案格式
    const answerList = questions.value.map(q => ({
      question_id: q.id,
      answer: answers.value[q.id] || ''
    }))
    const res = await submitExamApi(examId, answerList)
    score.value = res.data?.score || 0
    correctCount.value = res.data?.correct || 0
    showResultModal.value = true
    showResult.value = true
    clearInterval(timerInterval)
  } catch (err) {
    error.value = '提交失败：' + (err.response?.data?.error || '网络错误')
  } finally {
    submitting.value = false
  }
}

function calculateScore() {
  let correct = 0
  questions.value.forEach(q => {
    if (isAnswerCorrect(answers.value[q.id], q.answer, q.question_type)) {
      correct++
    }
  })
  correctCount.value = correct
  score.value = questions.value.length > 0 ? Math.round((correct / questions.value.length) * 100) : 0
}

function reviewAnswers() {
  showResultModal.value = false
}

function openAIQuestion(question) {
  aiQuestion.value = question
  showAIModal.value = true
}

async function loadExam() {
  loading.value = true
  error.value = ''

  if (isExamMode.value) {
    try {
      const res = await getExamDetail(examId)
      examInfo.value = res.data?.exam || res.data
      questions.value = res.data?.questions || []
      if (examInfo.value?.duration) {
        remainingSeconds.value = examInfo.value.duration * 60
      }
      await startExam(examId)
    } catch (err) {
      error.value = '加载试卷失败：' + (err.response?.data?.error || '网络错误')
    }
  } else {
    // 练习模式
    examInfo.value = { name: '练习模式', total_score: 100 }
    const source = route.query.source
    const knowledgePoint = route.query.knowledge_point
    const questionType = route.query.question_type
    const count = parseInt(route.query.count || '10')

    // 优先加载 AI 出题结果
    if (source === 'ai') {
      const stored = localStorage.getItem('aiPracticeQuestions')
      if (stored) {
        try {
          questions.value = JSON.parse(stored)
          localStorage.removeItem('aiPracticeQuestions')
        } catch {
          questions.value = []
        }
      }
    }

    if (questions.value.length === 0) {
      try {
        // 从题库随机抽题
        const params = { count }
        if (knowledgePoint) params.knowledge_point = knowledgePoint
        if (questionType) params.question_type = questionType
        const res = await getPracticeQuestions(params)
        questions.value = res.data?.questions || []
      } catch {
        questions.value = getMockQuestions()
      }
    }
    // 归一化：如果 multiple_choice 的答案只有单字符，降级为单选题
    questions.value = questions.value.map(q => {
      if (q.question_type === 'multiple_choice' && q.answer && q.answer.length <= 1 && !q.answer.includes(',')) {
        return { ...q, question_type: 'choice' }
      }
      return q
    })
    // 练习模式设置计时器（不限时，仅显示经过时间）
    remainingSeconds.value = 9999  // 实际上不会用到倒计时结束
  }
  loading.value = false

  // 两种模式都启动计时器
  startTimer()
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
      answer: '正确',
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
    }
  ]
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-back {
  align-self: flex-start;
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  color: #666;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
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
}

.exam-meta {
  font-size: 0.85em;
  color: #888;
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
  color: #333;
}

.timer--warning {
  color: #e74c3c;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.5; }
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
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

@keyframes spin { to { transform: rotate(360deg); } }

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
  align-items: center;
}

.nav-label {
  font-size: 0.85em;
  color: #666;
  margin-right: 4px;
}

.nav-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.2s;
}

.nav-dot.answered {
  border-color: #409eff;
  background: #d9ecff;
  color: #409eff;
}

.nav-dot.current {
  border-color: #409eff;
  background: #409eff;
  color: white;
  font-weight: 700;
}

.nav-dot.correct { background: #e8f5e9; border-color: #4caf50; color: #4caf50; }
.nav-dot.wrong { background: #fef0f0; border-color: #e74c3c; color: #e74c3c; }

.question-card {
  padding: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.question-type-badge {
  padding: 3px 10px;
  background: #d9ecff;
  color: #409eff;
  border-radius: 12px;
  font-size: 0.8em;
}

.question-difficulty {
  font-size: 0.85em;
}

.question-content {
  margin: 0 0 20px 0;
  font-size: 1.05em;
  line-height: 1.7;
  color: #333;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover:not(.correct-answer):not(.wrong-answer) {
  border-color: #409eff;
  background: #ecf5ff;
}

.multi-hint {
  font-size: 0.7em;
  color: #e67e22;
  font-weight: 400;
}

.option-item.selected {
  border-color: #409eff;
  background: #d9ecff;
}

.option-item.option-checked {
  border-color: #409eff;
  background: #e3f0ff;
}

.option-item.correct-answer {
  border-color: #4caf50;
  background: #e8f5e9;
}

.option-item.wrong-answer {
  border-color: #e74c3c;
  background: #fef0f0;
}

.option-item input {
  margin-right: 10px;
}

.option-key {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  margin-right: 10px;
  font-size: 0.8em;
  font-weight: 600;
}

.option-text { flex: 1; font-size: 0.9em; }
.check-mark { color: #4caf50; font-weight: 700; }
.x-mark { color: #e74c3c; font-weight: 700; }

.text-input-area textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95em;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.text-input-area textarea:focus { border-color: #409eff; }

.answer-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.answer-correct {
  margin-bottom: 8px;
  font-size: 0.9em;
}

.answer-correct span { color: #4caf50; font-weight: 600; }

.answer-analysis {
  font-size: 0.9em;
  color: #555;
}

.answer-analysis p { margin: 4px 0 0; }

.ai-btn { margin-top: 10px; }

.answer-badge {
  font-size: 0.95em;
  font-weight: 600;
  margin-bottom: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  text-align: center;
}
.answer-badge.correct {
  background: #e8f5e9;
  color: #2e7d32;
}
.answer-badge.wrong {
  background: #fef0f0;
  color: #c62828;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}

.progress-text { font-size: 0.9em; color: #888; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal, .result-modal {
  max-width: 400px;
  width: 100%;
  padding: 30px;
  text-align: center;
}

.confirm-modal h3 { margin: 0 0 12px; }
.unanswered-warning { color: #e67e22; font-size: 0.9em; }

.result-icon { font-size: 3em; margin-bottom: 10px; }

.result-score {
  font-size: 2.5em;
  font-weight: 700;
  color: #409eff;
  margin: 10px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .exam-page { padding: 12px; }
  .exam-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .exam-header-right { width: 100%; justify-content: space-between; }
  .option-item { padding: 10px 12px; }
}
</style>