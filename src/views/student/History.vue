<template>
  <div class="history-page">
    <div class="container">


      <!-- 顶部切换标签 -->
      <div class="tabs card">
        <button 
          :class="['tab-btn', { active: currentTab === 'exam' }]" 
          @click="switchTab('exam')"
        >
          📝 考试历史
        </button>
        <button 
          :class="['tab-btn', { active: currentTab === 'practice' }]" 
          @click="switchTab('practice')"
        >
          🎯 练习历史
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 答题回顾视图 -->
      <div v-if="reviewMode && currentRecord" class="review-view">
        <button class="btn btn-back" @click="closeReview">
          ← 返回列表
        </button>

        <div class="practice-header card">
          <div class="practice-header-left">
            <h2>{{ currentRecord.paper_name }}</h2>
            <div class="practice-meta">
              <span>{{ currentRecord.datetime }}</span>
              <span>得分：{{ currentRecord.score }}分</span>
            </div>
          </div>
        </div>

        <!-- 题目导航 -->
        <div class="question-nav card">
          <span class="nav-label">答题卡：</span>
          <button
            v-for="(item, index) in reviewQuestions"
            :key="item.question_id || index"
            :class="['nav-dot', {
              correct: item.is_correct,
              wrong: !item.is_correct
            }]"
            @click="currentReviewIndex = index"
          >
            {{ index + 1 }}
          </button>
        </div>

        <!-- 当前题目 -->
        <div class="question-card card" v-if="currentReviewQuestion">
          <div class="question-header">
            <span class="question-type-badge">{{ typeLabel(currentReviewQuestion.question_type) }}</span>
          </div>

          <div class="question-body">
            <h3 class="question-content">
              {{ currentReviewIndex + 1 }}. {{ currentReviewQuestion.question_content }}
            </h3>

            <!-- 单选题 -->
            <div v-if="currentReviewQuestion.question_type === 'choice'" class="options-list">
              <label
                v-for="(opt, key) in parsedOptions"
                :key="key"
                :class="[
                  'option-item',
                  {
                    'correct-answer': key === currentReviewQuestion.correct_answer,
                    'wrong-answer': key === currentReviewQuestion.student_answer && key !== currentReviewQuestion.correct_answer
                  }
                ]"
              >
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="key === currentReviewQuestion.correct_answer" class="check-mark">✓ 正确答案</span>
                <span v-if="key === currentReviewQuestion.student_answer && key !== currentReviewQuestion.correct_answer" class="x-mark">✗ 你的答案</span>
              </label>
            </div>

            <!-- 多选题 -->
            <div v-if="currentReviewQuestion.question_type === 'multiple_choice'" class="options-list">
              <label
                v-for="(opt, key) in parsedOptions"
                :key="key"
                :class="[
                  'option-item',
                  {
                    'correct-answer': isInMultiAnswer(key, currentReviewQuestion.correct_answer),
                    'wrong-answer': isInMultiAnswer(key, currentReviewQuestion.student_answer) && !isInMultiAnswer(key, currentReviewQuestion.correct_answer)
                  }
                ]"
              >
                <span class="option-key">{{ key }}</span>
                <span class="option-text">{{ opt }}</span>
                <span v-if="isInMultiAnswer(key, currentReviewQuestion.correct_answer)" class="check-mark">✓ 正确答案</span>
                <span v-if="isInMultiAnswer(key, currentReviewQuestion.student_answer) && !isInMultiAnswer(key, currentReviewQuestion.correct_answer)" class="x-mark">✗ 你的答案</span>
              </label>
            </div>

            <!-- 判断题 -->
            <div v-if="currentReviewQuestion.question_type === 'true_false' || currentReviewQuestion.question_type === 'judge'" class="options-list">
              <label
                :class="[
                  'option-item',
                  {
                    'correct-answer': normalizeTrueFalse(currentReviewQuestion.correct_answer) === 'true',
                    'wrong-answer': normalizeTrueFalse(currentReviewQuestion.student_answer) === 'true' && normalizeTrueFalse(currentReviewQuestion.correct_answer) !== 'true'
                  }
                ]"
              >
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
                <span v-if="normalizeTrueFalse(currentReviewQuestion.correct_answer) === 'true'" class="check-mark">✓ 正确答案</span>
                <span v-if="normalizeTrueFalse(currentReviewQuestion.student_answer) === 'true' && normalizeTrueFalse(currentReviewQuestion.correct_answer) !== 'true'" class="x-mark">✗ 你的答案</span>
              </label>
              <label
                :class="[
                  'option-item',
                  {
                    'correct-answer': normalizeTrueFalse(currentReviewQuestion.correct_answer) === 'false',
                    'wrong-answer': normalizeTrueFalse(currentReviewQuestion.student_answer) === 'false' && normalizeTrueFalse(currentReviewQuestion.correct_answer) !== 'false'
                  }
                ]"
              >
                <span class="option-key">✗</span>
                <span class="option-text">错误</span>
                <span v-if="normalizeTrueFalse(currentReviewQuestion.correct_answer) === 'false'" class="check-mark">✓ 正确答案</span>
                <span v-if="normalizeTrueFalse(currentReviewQuestion.student_answer) === 'false' && normalizeTrueFalse(currentReviewQuestion.correct_answer) !== 'false'" class="x-mark">✗ 你的答案</span>
              </label>
            </div>

            <!-- 填空题/简答题 -->
            <div v-if="isTextType(currentReviewQuestion.question_type)" class="text-input-area">
              <div class="answer-box" :class="{ correct: currentReviewQuestion.is_correct, wrong: !currentReviewQuestion.is_correct }">
                <div class="answer-label">你的答案：</div>
                <div class="answer-content">{{ currentReviewQuestion.student_answer || '（未作答）' }}</div>
              </div>
              <div class="answer-box correct">
                <div class="answer-label">正确答案：</div>
                <div class="answer-content">{{ currentReviewQuestion.correct_answer }}</div>
              </div>
            </div>

            <!-- 结果标记 -->
            <div class="result-mark" :class="{ correct: currentReviewQuestion.is_correct, wrong: !currentReviewQuestion.is_correct }">
              {{ currentReviewQuestion.is_correct ? '🎉 回答正确' : '❌ 回答错误' }}
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="question-footer card">
          <button class="btn btn-outline" :disabled="currentReviewIndex === 0" @click="prevReviewQuestion">
            ← 上一题
          </button>
          <span class="progress-text">{{ currentReviewIndex + 1 }} / {{ reviewQuestions.length }}</span>
          <button class="btn btn-outline" :disabled="currentReviewIndex === reviewQuestions.length - 1" @click="nextReviewQuestion">
            下一题 →
          </button>
        </div>
      </div>

      <!-- 记录列表视图 -->
      <div v-else-if="!loading">
        <!-- 空状态 -->
        <div v-if="records.length === 0" class="empty-state card">
          <div class="empty-icon">{{ currentTab === 'exam' ? '📋' : '📝' }}</div>
          <p>暂无{{ currentTab === 'exam' ? '考试' : '练习' }}记录</p>
          <button class="btn btn-primary" @click="$router.push('/student/practice')">
            去练习
          </button>
        </div>

        <!-- 列表 -->
        <div v-else class="record-list">
          <div v-for="record in records" :key="`${record.type}-${record.id}`" class="record-card card" @click="openReview(record)">
            <div class="record-header">
              <span class="record-type" :class="record.type">
                {{ record.record_type }}
              </span>
              <span class="record-date">{{ record.datetime }}</span>
            </div>
            <div class="record-body">
              <div class="record-info">
                <span class="record-name">{{ record.paper_name }}</span>
              </div>
              <div class="record-stats">
                <div class="stat-item">
                  <span class="stat-label">题数</span>
                  <span class="stat-value">{{ record.question_count }}题</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">得分</span>
                  <span class="stat-value score" :class="getScoreClass(record.score)">
                    {{ record.score }}分
                  </span>
                </div>
              </div>
            </div>
            <div class="record-arrow">›</div>
          </div>

          <!-- 分页 -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              class="btn btn-outline btn-sm" 
              :disabled="currentPage <= 1"
              @click="loadRecords(currentPage - 1)"
            >
              上一页
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button 
              class="btn btn-outline btn-sm" 
              :disabled="currentPage >= totalPages"
              @click="loadRecords(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getHistoryRecords, getRecordDetail } from '@/api/student'

const currentTab = ref('exam')
const records = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 答题回顾相关
const reviewMode = ref(false)
const currentRecord = ref(null)
const reviewQuestions = ref([])
const currentReviewIndex = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const currentReviewQuestion = computed(() => {
  return reviewQuestions.value[currentReviewIndex.value] || null
})

const parsedOptions = computed(() => {
  if (!currentReviewQuestion.value?.options) return {}
  if (typeof currentReviewQuestion.value.options === 'object') return currentReviewQuestion.value.options
  try {
    return JSON.parse(currentReviewQuestion.value.options)
  } catch {
    return {}
  }
})

function switchTab(tab) {
  currentTab.value = tab
  currentPage.value = 1
  // 重置答题回顾状态，回到列表
  reviewMode.value = false
  currentRecord.value = null
  reviewQuestions.value = []
  currentReviewIndex.value = 0
  loadRecords(1)
}

async function loadRecords(page = 1) {
  loading.value = true
  currentPage.value = page
  records.value = []
  try {
    const res = await getHistoryRecords({
      page: page,
      page_size: pageSize.value,
      record_type: currentTab.value
    })
    records.value = res.data.results || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取学习记录失败:', error)
    records.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function openReview(record) {
  currentRecord.value = record
  reviewQuestions.value = []
  reviewMode.value = true
  currentReviewIndex.value = 0
  loading.value = true

  try {
    const res = await getRecordDetail(record.id)
    reviewQuestions.value = res.data.questions || []
    // 更新当前记录信息（可能包含更准确的字段）
    if (res.data.paper_name) currentRecord.value.paper_name = res.data.paper_name
    if (res.data.score != null) currentRecord.value.score = res.data.score
    if (res.data.question_count != null) currentRecord.value.question_count = res.data.question_count
  } catch (error) {
    console.error('获取题目详情失败:', error)
    reviewQuestions.value = []
  } finally {
    loading.value = false
  }
}

function closeReview() {
  reviewMode.value = false
  currentRecord.value = null
  reviewQuestions.value = []
  currentReviewIndex.value = 0
}

function prevReviewQuestion() {
  if (currentReviewIndex.value > 0) currentReviewIndex.value--
}

function nextReviewQuestion() {
  if (currentReviewIndex.value < reviewQuestions.value.length - 1) currentReviewIndex.value++
}

function getScoreClass(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

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
    fill_blank: '填空题',
    essay: '简答题'
  }
  return map[type] || type
}

// 判断题答案归一化（与 PracticePage.isAnswerCorrect 保持一致）
function normalizeTrueFalse(value) {
  const v = String(value || '').trim()
  if (v === 'A' || v === '正确' || v === 'true' || v === 'True') return 'true'
  if (v === 'B' || v === '错误' || v === 'false' || v === 'False') return 'false'
  return v
}

// 多选题：判断选项key是否在答案中（答案格式如 "A,C,D"）
function isInMultiAnswer(key, answerStr) {
  if (!answerStr) return false
  return String(answerStr).split(',').map(s => s.trim()).includes(key)
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 切换标签 ===== */
.tabs {
  display: flex;
  padding: 4px;
  gap: 4px;
  background: var(--surface, #ffffff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--hairline, #e3dbd0);
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted, #6b655c);
  font-family: inherit;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--primary, #d97757);
  color: #fff;
}

.tab-btn:not(.active):hover {
  background: var(--primary-bg, rgba(217,119,87,0.08));
  color: var(--primary, #d97757);
}

/* ===== 练习头部 ===== */
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

/* ===== 加载状态 ===== */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted, #6b655c);
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--hairline, #e3dbd0);
}

.empty-state p {
  margin: 0 0 16px 0;
  color: var(--muted-soft, #9f988e);
}

/* ===== 记录列表 ===== */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 1px solid var(--hairline, #e3dbd0);
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.06));
}

.record-card:hover {
  box-shadow: var(--shadow-hover, 0 12px 32px rgba(0,0,0,0.1));
  border-color: var(--primary, #d97757);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-type {
  padding: 2px 10px;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
}

.record-type.exam {
  background: rgba(212,160,23,0.1);
  color: #d4a017;
}

.record-type.practice {
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
}

.record-date {
  font-size: 12px;
  color: var(--muted-soft, #9f988e);
}

.record-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-name {
  font-weight: 500;
  color: var(--ink, #2a2a2a);
  font-size: 14px;
}

.record-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.record-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.record-stats .stat-label {
  font-size: 11px;
  color: var(--muted-soft, #9f988e);
  margin-bottom: 2px;
}

.record-stats .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.record-stats .stat-value.score.high { color: #5db872; }
.record-stats .stat-value.score.medium { color: #d4a017; }
.record-stats .stat-value.score.low { color: #c64545; }

.record-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5em;
  color: var(--hairline-strong, #ccc2b4);
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

.nav-dot.correct { background: rgba(93,184,114,0.12); border-color: #5db872; color: #5db872; }
.nav-dot.wrong { background: rgba(198,69,69,0.1); border-color: #c64545; color: #c64545; }

/* ===== 题目卡片 ===== */
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
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
}

.question-content {
  margin: 0 0 20px 0;
  font-size: 1.05em;
  line-height: 1.7;
  color: var(--ink, #2a2a2a);
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
  border: 1.5px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-md, 8px);
  position: relative;
  background: var(--card-bg, #ffffff);
}

.option-item.correct-answer {
  border-color: #5db872;
  background: rgba(93,184,114,0.08);
}

.option-item.wrong-answer {
  border-color: #c64545;
  background: rgba(198,69,69,0.06);
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

.check-mark {
  color: #5db872;
  font-weight: 600;
  font-size: 13px;
  margin-left: 8px;
}

.x-mark {
  color: #c64545;
  font-weight: 600;
  font-size: 13px;
  margin-left: 8px;
}

.result-mark {
  margin-top: 16px;
  padding: 12px;
  border-radius: var(--radius-md, 8px);
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.result-mark.correct {
  background: rgba(93,184,114,0.1);
  color: #5db872;
}

.result-mark.wrong {
  background: rgba(198,69,69,0.06);
  color: #c64545;
}

/* ===== 文字题答案 ===== */
.text-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-box {
  padding: 12px;
  border-radius: var(--radius-md, 8px);
  background: var(--primary-bg, rgba(217,119,87,0.04));
  border: 1px solid var(--hairline, #e3dbd0);
}

.answer-box.correct {
  border: 1px solid #5db872;
  background: rgba(93,184,114,0.08);
}

.answer-box.wrong {
  border: 1px solid #c64545;
  background: rgba(198,69,69,0.06);
}

.answer-label {
  font-size: 13px;
  color: var(--muted, #6b655c);
  margin-bottom: 4px;
}

.answer-content {
  font-size: 14px;
  color: var(--ink, #2a2a2a);
}

/* ===== 导航按钮 ===== */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}

.question-footer .progress-text {
  font-size: 14px;
  color: var(--muted, #6b655c);
  font-weight: 500;
}

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.page-info {
  font-size: 14px;
  color: var(--muted, #6b655c);
}

@media (max-width: 600px) {
  .record-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .record-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .practice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
