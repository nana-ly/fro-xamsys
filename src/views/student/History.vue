<template>
  <div class="history-page">
    <div class="container">
      <!-- 返回主页按钮 -->
      <button class="btn btn-back" @click="$router.push('/student/home')">
        ← 返回主页
      </button>

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

            <!-- 选择题 -->
            <div v-if="isChoiceType(currentReviewQuestion.question_type)" class="options-list">
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

            <!-- 判断题 -->
            <div v-if="currentReviewQuestion.question_type === 'true_false'" class="options-list">
              <label
                :class="[
                  'option-item',
                  {
                    'correct-answer': 'true' === currentReviewQuestion.correct_answer,
                    'wrong-answer': 'true' === currentReviewQuestion.student_answer && 'true' !== currentReviewQuestion.correct_answer
                  }
                ]"
              >
                <span class="option-key">✓</span>
                <span class="option-text">正确</span>
                <span v-if="'true' === currentReviewQuestion.correct_answer" class="check-mark">✓ 正确答案</span>
                <span v-if="'true' === currentReviewQuestion.student_answer && 'true' !== currentReviewQuestion.correct_answer" class="x-mark">✗ 你的答案</span>
              </label>
              <label
                :class="[
                  'option-item',
                  {
                    'correct-answer': 'false' === currentReviewQuestion.correct_answer,
                    'wrong-answer': 'false' === currentReviewQuestion.student_answer && 'false' !== currentReviewQuestion.correct_answer
                  }
                ]"
              >
                <span class="option-key">✗</span>
                <span class="option-text">错误</span>
                <span v-if="'false' === currentReviewQuestion.correct_answer" class="check-mark">✓ 正确答案</span>
                <span v-if="'false' === currentReviewQuestion.student_answer && 'false' !== currentReviewQuestion.correct_answer" class="x-mark">✗ 你的答案</span>
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
        <div v-if="filteredRecords.length === 0" class="empty-state card">
          <div class="empty-icon">{{ currentTab === 'exam' ? '📋' : '📝' }}</div>
          <p>暂无{{ currentTab === 'exam' ? '考试' : '练习' }}记录</p>
          <button class="btn btn-primary" @click="$router.push('/student/practice')">
            去练习
          </button>
        </div>

        <!-- 列表 -->
        <div v-else class="record-list">
          <div v-for="record in filteredRecords" :key="`${record.type}-${record.id}`" class="record-card card" @click="openReview(record)">
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
import { getHistoryRecords } from '@/api/student'

const currentTab = ref('exam')
const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 答题回顾相关
const reviewMode = ref(false)
const currentRecord = ref(null)
const reviewQuestions = ref([])
const currentReviewIndex = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const filteredRecords = computed(() => {
  return records.value.filter(r => r.type === currentTab.value)
})

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
  loadRecords(1)
}

async function loadRecords(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getHistoryRecords({
      page: page,
      page_size: pageSize.value
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

function openReview(record) {
  currentRecord.value = record
  reviewQuestions.value = []
  
  if (record.type === 'exam') {
    // 考试记录 - 需要获取题目详情
    loadExamQuestions(record.id)
  } else {
    // 练习记录 - 直接使用记录数据
    reviewQuestions.value = [{
      question_id: record.id,
      question_content: record.paper_name,
      question_type: 'choice',
      student_answer: record.score === 100 ? 'A' : '',
      correct_answer: record.score === 100 ? 'A' : '',
      is_correct: record.score === 100,
      options: {}
    }]
  }
  
  reviewMode.value = true
  currentReviewIndex.value = 0
}

async function loadExamQuestions(recordId) {
  // 模拟加载考试题目详情
  // 实际项目中应该调用后端API获取该考试的题目和答案
  reviewQuestions.value = [
    {
      question_id: 1,
      question_content: 'Python中列表推导式的基本语法是什么？',
      question_type: 'choice',
      student_answer: 'A',
      correct_answer: 'A',
      is_correct: true,
      options: '{"A": "[x for x in iterable]", "B": "for x in iterable: [x]", "C": "list(for x in iterable)", "D": "{x for x in iterable}"}'
    },
    {
      question_id: 2,
      question_content: '以下哪个是Python的不可变类型？',
      question_type: 'multiple_choice',
      student_answer: 'A,C',
      correct_answer: 'A,C,D',
      is_correct: false,
      options: '{"A": "int", "B": "list", "C": "tuple", "D": "str"}'
    }
  ]
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

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.history-page {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 切换标签 */
.tabs {
  display: flex;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #409eff;
  color: white;
}

.tab-btn:not(.active):hover {
  background: #f0f0f0;
}

/* 返回按钮 */
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

/* 练习头部 */
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

/* 加载状态 */
.loading-state {
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0 0 16px 0;
  color: #666;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  padding: 16px;
  padding-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 12px;
}

.record-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-type {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.record-type.exam {
  background: #fff3e0;
  color: #e65100;
}

.record-type.practice {
  background: #e3f2fd;
  color: #1565c0;
}

.record-date {
  font-size: 0.8em;
  color: #999;
}

.record-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-name {
  font-weight: 500;
  color: #333;
}

.record-stats {
  display: flex;
  gap: 20px;
  margin-top: 0;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value.score {
  padding-left: 8px;
}

.stat-label {
  font-size: 0.75em;
  color: #999;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 0.95em;
  font-weight: 600;
  color: #333;
}

.stat-value.score.high { color: #27ae60; }
.stat-value.score.medium { color: #f39c12; }
.stat-value.score.low { color: #e74c3c; }

.record-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5em;
  color: #ccc;
}

/* 题目导航 */
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

.nav-dot.correct { background: #e8f5e9; border-color: #4caf50; color: #4caf50; }
.nav-dot.wrong { background: #fef0f0; border-color: #e74c3c; color: #e74c3c; }

/* 题目卡片 */
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
  position: relative;
}

.option-item.correct-answer {
  border-color: #4caf50;
  background: #e8f5e9;
}

.option-item.wrong-answer {
  border-color: #e74c3c;
  background: #fef0f0;
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

.check-mark {
  color: #4caf50;
  font-weight: 600;
  font-size: 0.85em;
}

.x-mark {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.85em;
}

.result-mark {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 1em;
  font-weight: 600;
}

.result-mark.correct {
  background: #e8f5e9;
  color: #4caf50;
}

.result-mark.wrong {
  background: #fef0f0;
  color: #e74c3c;
}

/* 文字题答案 */
.text-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.answer-box.correct {
  border: 1px solid #4caf50;
  background: #e8f5e9;
}

.answer-box.wrong {
  border: 1px solid #e74c3c;
  background: #fef0f0;
}

.answer-label {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 4px;
}

.answer-content {
  font-size: 0.95em;
  color: #333;
}

/* 导航按钮 */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}

.progress-text { font-size: 0.9em; color: #888; }

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.page-info {
  font-size: 0.9em;
  color: #666;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.85em;
}

@media (max-width: 600px) {
  .history-page {
    padding: 12px;
  }
  
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
