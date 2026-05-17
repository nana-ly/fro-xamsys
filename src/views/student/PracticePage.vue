<template>
  <div class="practice-page">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="btn btn-back" @click="$router.push('/student/home')">
        ← 返回主页
      </button>

      <!-- 练习头部信息 -->
      <div class="practice-header card">
        <div class="practice-header-left">
          <h2>练习模式</h2>
          <div class="practice-meta">
            <span>共 {{ questions.length }} 题</span>
            <span v-if="sourceLabel">{{ sourceLabel }}</span>
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

      <!-- 空题目状态 -->
      <div v-if="!loading && questions.length === 0 && !error" class="empty-state card">
        <p>暂无练习题目</p>
        <p class="empty-hint">请前往主页使用 AI 智能出题生成练习题目</p>
        <button class="btn btn-primary" @click="$router.push('/student/home')">返回主页</button>
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
              correct: isSubmitted && answers[q.id] === q.answer,
              wrong: isSubmitted && answers[q.id] !== q.answer
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
                    'correct-answer': isSubmitted && key === currentQuestion.answer,
                    'wrong-answer': isSubmitted && selectedAnswer === key && key !== currentQuestion.answer
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
                  :disabled="isSubmitted"
                />
                <input
                  v-else
                  type="checkbox"
                  :value="key"
                  :checked="selectedAnswers.includes(key)"
                  @change="toggleMultiple(key)"
                  :disabled="isSubmitted"
                />
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="isSubmitted && key === currentQuestion.answer" class="check-mark">✓</span>
                <span v-if="isSubmitted && selectedAnswer === key && key !== currentQuestion.answer" class="x-mark">✗</span>
              </label>
            </div>

            <!-- 判断题 -->
            <div v-if="isTrueFalseType(currentQuestion.question_type)" class="options-list">
              <label
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === 'true',
                    'correct-answer': isSubmitted && 'true' === currentQuestion.answer,
                    'wrong-answer': isSubmitted && selectedAnswer === 'true' && 'true' !== currentQuestion.answer
                  }
                ]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="true" v-model="selectedAnswer" @change="saveAnswer('true')" :disabled="isSubmitted" />
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
              </label>
              <label
                :class="[
                  'option-item',
                  { 
                    selected: selectedAnswer === 'false',
                    'correct-answer': isSubmitted && 'false' === currentQuestion.answer,
                    'wrong-answer': isSubmitted && selectedAnswer === 'false' && 'false' !== currentQuestion.answer
                  }
                ]"
              >
                <input type="radio" :name="'q_' + currentQuestion.id" value="false" v-model="selectedAnswer" @change="saveAnswer('false')" :disabled="isSubmitted" />
                <span class="option-key">✗</span>
                <span class="option-text">错误</span>
              </label>
            </div>

            <!-- 填空题 -->
            <div v-if="isFillBlankType(currentQuestion.question_type)" class="text-input-area">
              <label class="input-label">📝 答题区域（请输入填空答案）</label>
              <textarea
                v-model="textAnswer"
                placeholder="请输入填空答案..."
                rows="3"
                @input="saveAnswer(textAnswer)"
                :disabled="isSubmitted"
              ></textarea>
            </div>

            <!-- 简答题 -->
            <div v-if="isEssayType(currentQuestion.question_type)" class="text-input-area">
              <label class="input-label">📝 答题区域（请输入你的回答）</label>
              <textarea
                v-model="textAnswer"
                placeholder="请在此输入你的答案，可以详细阐述..."
                rows="6"
                @input="saveAnswer(textAnswer)"
                :disabled="isSubmitted"
              ></textarea>
            </div>

            <!-- 未识别题型，提供通用文本框 -->
            <div v-if="!isChoiceType(currentQuestion.question_type) && !isTrueFalseType(currentQuestion.question_type) && !isFillBlankType(currentQuestion.question_type) && !isEssayType(currentQuestion.question_type)" class="text-input-area">
              <label class="input-label">📝 答题区域（请输入你的回答）</label>
              <textarea
                v-model="textAnswer"
                placeholder="请在此输入你的答案..."
                rows="4"
                @input="saveAnswer(textAnswer)"
                :disabled="isSubmitted"
              ></textarea>
            </div>
          </div>

          <!-- 答案与解析（提交后显示） -->
          <div v-if="isSubmitted" class="answer-section">
            <div class="answer-correct">
              <strong>正确答案：</strong>
              <span>{{ currentQuestion.answer }}</span>
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
          <p class="wrongbook-hint">答错的题目将自动加入错题本 📝</p>
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
          <h2>{{ score >= 60 ? '练习完成！' : '继续加油！' }}</h2>
          <div class="result-score">{{ score }} 分</div>
          <p>正确 {{ correctCount }} / {{ questions.length }} 题</p>
          <p class="wrongbook-info" v-if="wrongCount > 0">
            {{ wrongCount }} 道错题已加入错题本 📝
          </p>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { aiGenerateQuestion, addWrongQuestion, getQuestionBank } from '@/api/student'
import AIAnswerModal from '@/components/AIAnswerModal.vue'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const questions = ref([])
const answers = ref({})
const currentIndex = ref(0)
const showSubmitModal = ref(false)
const showResultModal = ref(false)
const submitting = ref(false)
const isSubmitted = ref(false)
const score = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)
const showAIModal = ref(false)
const aiQuestion = ref(null)
const sourceLabel = ref('')

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
  return type === 'choice' || type === 'multiple_choice' || type === 'multiple'
}

function isTrueFalseType(type) {
  return type === 'true_false' || type === 'judge' || type === 'judgment'
}

function isFillBlankType(type) {
  return type === 'fill_blank' || type === 'fill' || type === 'blank'
}

function isEssayType(type) {
  return type === 'essay' || type === 'short_answer' || type === 'short'
}

function typeLabel(type) {
  const map = {
    choice: '单选题',
    multiple_choice: '多选题',
    multiple: '多选题',
    true_false: '判断题',
    judge: '判断题',
    judgment: '判断题',
    fill_blank: '填空题',
    fill: '填空题',
    blank: '填空题',
    essay: '简答题',
    short_answer: '简答题',
    short: '简答题'
  }
  return map[type] || type || '未分类题'
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

function calculateScore() {
  let correct = 0
  const wrongQuestionIds = []
  questions.value.forEach(q => {
    if (String(answers.value[q.id] || '').trim() === String(q.answer).trim()) {
      correct++
    } else {
      wrongQuestionIds.push(q.id)
    }
  })
  correctCount.value = correct
  wrongCount.value = wrongQuestionIds.length
  score.value = questions.value.length > 0 ? Math.round((correct / questions.value.length) * 100) : 0
  return wrongQuestionIds
}

async function addWrongQuestionsToBook(wrongQuestionIds) {
  const promises = wrongQuestionIds.map(qId => 
    addWrongQuestion(qId).catch(() => {
      // 静默处理失败，不影响主流程
    })
  )
  await Promise.all(promises)
}

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true

  const wrongQuestionIds = calculateScore()
  
  // 将错题添加到错题本
  if (wrongQuestionIds.length > 0) {
    await addWrongQuestionsToBook(wrongQuestionIds)
  }

  isSubmitted.value = true
  showResultModal.value = true
  submitting.value = false
}

function reviewAnswers() {
  showResultModal.value = false
}

function openAIQuestion(question) {
  aiQuestion.value = question
  showAIModal.value = true
}

async function loadPracticeQuestions() {
  loading.value = true
  error.value = ''

  // 优先从路由参数获取 AI 生成的题目
  const aiQuestionsParam = route.query.aiQuestions
  const knowledgePoint = route.query.knowledgePoint
  const questionType = route.query.questionType || 'choice'
  const difficulty = route.query.difficulty || 'medium'

  if (aiQuestionsParam) {
    // 题目通过 query 参数传入（JSON 字符串）
    try {
      questions.value = JSON.parse(decodeURIComponent(aiQuestionsParam))
      sourceLabel.value = 'AI 智能出题'
    } catch {
      error.value = '题目数据解析失败，请重新生成'
    }
  } else if (knowledgePoint) {
    // 根据知识点，调用 AI 生成题目
    sourceLabel.value = `AI 智能出题 · ${knowledgePoint}`
    try {
      const res = await aiGenerateQuestion(knowledgePoint, questionType, difficulty)
      const generatedQuestion = res.data?.question
      if (generatedQuestion) {
        questions.value = Array.isArray(generatedQuestion) ? generatedQuestion : [generatedQuestion]
        sourceLabel.value = 'AI 智能出题'
      } else {
        error.value = 'AI 生成题目失败，请稍后重试'
      }
    } catch (err) {
      error.value = 'AI 生成题目失败：' + (err.response?.data?.error || '网络错误')
    }
  } else {
    // 默认从题库加载题目
    sourceLabel.value = '题库练习'
    try {
      const res = await getQuestionBank()
      questions.value = res.data?.results || res.data || []
      if (questions.value.length === 0) {
        // 题库为空时显示模拟题
        questions.value = getMockQuestions()
        sourceLabel.value = '示例题目'
      }
    } catch {
      questions.value = getMockQuestions()
      sourceLabel.value = '示例题目'
    }
  }

  loading.value = false
}

function getMockQuestions() {
  return [
    {
      id: 1001,
      question_type: 'choice',
      content: 'Python中列表推导式的基本语法是什么？',
      options: '{"A": "[x for x in iterable]", "B": "for x in iterable: [x]", "C": "list(for x in iterable)", "D": "{x for x in iterable}"}',
      answer: 'A',
      analysis: '列表推导式语法为 [expression for item in iterable]',
      difficulty: 2
    },
    {
      id: 1002,
      question_type: 'fill_blank',
      content: 'Python中用于定义函数的关键字是 ____。',
      options: '',
      answer: 'def',
      analysis: 'def 是 Python 中定义函数的关键字，后跟函数名和参数列表。',
      difficulty: 1
    },
    {
      id: 1003,
      question_type: 'true_false',
      content: 'Python中的字典是有序集合。',
      options: '',
      answer: 'true',
      analysis: 'Python 3.7+ 中字典保持插入顺序',
      difficulty: 1
    },
    {
      id: 1004,
      question_type: 'multiple_choice',
      content: '以下哪些是Python的不可变类型？',
      options: '{"A": "int", "B": "list", "C": "tuple", "D": "str"}',
      answer: 'A,C,D',
      analysis: 'int, tuple, str 是不可变类型，list是可变类型',
      difficulty: 2
    },
    {
      id: 1005,
      question_type: 'essay',
      content: '请简述Python中列表和元组的区别。',
      options: '',
      answer: '列表可变，元组不可变；列表用方括号，元组用圆括号；列表性能略低于元组。',
      analysis: '核心区别：1）列表是可变的，可以增删改元素；元组是不可变的。2）语法上列表使用[]，元组使用()。3）由于不可变性，元组可作为字典的键，列表不可以。',
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

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.practice-header h2 {
  margin: 0;
  font-size: 1.2em;
}

.practice-meta {
  font-size: 0.85em;
  color: #888;
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.practice-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-hint {
  font-size: 0.9em;
  color: #aaa;
  margin-top: 8px;
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

.option-item.selected {
  border-color: #409eff;
  background: #d9ecff;
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

.input-label {
  display: block;
  font-size: 0.85em;
  color: #555;
  font-weight: 500;
  margin-bottom: 8px;
}

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
.wrongbook-hint {
  color: #409eff;
  font-size: 0.85em;
  margin-top: 8px;
}

.result-icon { font-size: 3em; margin-bottom: 10px; }

.result-score {
  font-size: 2.5em;
  font-weight: 700;
  color: #409eff;
  margin: 10px 0;
}

.wrongbook-info {
  color: #409eff;
  font-size: 0.9em;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .practice-page { padding: 12px; }
  .practice-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .practice-header-right { width: 100%; justify-content: space-between; }
  .option-item { padding: 10px 12px; }
}
</style>