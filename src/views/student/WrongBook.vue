<template>
  <div class="wrong-book-page">
    <div class="container">


      <!-- 页面头部 -->
      <div class="page-header card">
        <h2>我的错题本</h2>
        <div class="header-stats">
          <span class="stat-item">
            总错题：<strong>{{ wrongList.length }}</strong>
          </span>
          <span class="stat-item mastered">
            已掌握：<strong>{{ masteredCount }}</strong>
          </span>
          <span class="stat-item unmastered">
            未掌握：<strong>{{ wrongList.length - masteredCount }}</strong>
          </span>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar card">
        <div class="filter-group">
          <label>题型：</label>
          <select v-model="filterType" @change="applyFilter">
            <option value="">全部</option>
            <option value="choice">单选题</option>
            <option value="multiple_choice">多选题</option>
            <option value="true_false">判断题</option>
            <option value="fill_blank">填空题</option>
            <option value="essay">简答题</option>
          </select>
        </div>
        <div class="filter-group">
          <label>掌握状态：</label>
          <select v-model="filterMastered" @change="applyFilter">
            <option value="">全部</option>
            <option value="unmastered">未掌握</option>
            <option value="mastered">已掌握</option>
          </select>
        </div>
        <div class="filter-group">
          <label>关键词：</label>
          <input 
            v-model="filterKeyword" 
            type="text" 
            placeholder="搜索题目或知识点..."
            @input="applyFilter"
          />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="displayList.length === 0" class="empty-state card">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--hairline-strong)" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <h3>暂无错题</h3>
        <p>{{ wrongList.length === 0 ? '快去刷题吧，加油！' : '没有符合条件的错题' }}</p>
      </div>

      <!-- 错题列表 -->
      <div v-else class="wrong-list">
        <div 
          v-for="item in displayList" 
          :key="item.id" 
          :class="['wrong-card', 'card', { mastered: item.is_mastered }]"
        >
          <div class="wrong-card-header">
            <span class="type-badge">{{ typeLabel(item.question_type) }}</span>
            <span class="difficulty" v-if="item.difficulty">
              {{ '★'.repeat(item.difficulty) }}
            </span>
            <span class="knowledge-tag" v-if="item.knowledge_point">
              {{ item.knowledge_point }}
            </span>
            <span v-if="item.is_mastered" class="mastered-badge">已掌握</span>
          </div>

          <div class="wrong-card-body">
            <h4 class="question-content">{{ item.content }}</h4>
            
            <!-- 选项 -->
            <div v-if="item.options && parsedOptions(item.options)" class="options-display">
              <span 
                v-for="(opt, key) in parsedOptions(item.options)" 
                :key="key"
                :class="['option-tag', {
                  'correct-option': key === item.answer,
                  'wrong-option': key === item.wrong_answer && key !== item.answer
                }]"
              >
                {{ key }}. {{ opt }}
              </span>
            </div>

            <!-- 答案对比 -->
            <div class="answer-compare">
              <div class="your-answer">
                <span class="label">你的答案：</span>
                <span class="value wrong-value">{{ item.wrong_answer || '未作答' }}</span>
              </div>
              <div class="correct-answer">
                <span class="label">正确答案：</span>
                <span class="value correct-value">{{ item.answer }}</span>
              </div>
            </div>

            <!-- 解析 -->
            <div v-if="item.analysis" class="analysis-box">
              <strong>解析：</strong>
              <p>{{ item.analysis }}</p>
            </div>
          </div>

          <div class="wrong-card-footer">
            <button class="btn btn-sm btn-outline" @click="openAIQuestion(item)">
              问AI
            </button>
            <button 
              :class="['btn btn-sm', item.is_mastered ? 'btn-outline' : 'btn-primary']"
              @click="toggleMastered(item)"
              :disabled="togglingId === item.id"
            >
              {{ togglingId === item.id ? '...' : (item.is_mastered ? '标记未掌握' : '标记已掌握') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 手动添加错题弹窗 -->
      <div class="float-add-btn">
        <button class="btn btn-primary btn-circle" @click="showAddModal = true" title="手动添加错题">
          +
        </button>
      </div>

      <!-- 添加错题弹窗 -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="add-modal card">
          <h3>手动添加错题</h3>
          <div class="form-group">
            <label>题目内容 *</label>
            <textarea v-model="addForm.content" rows="3" placeholder="请输入题目内容" required></textarea>
          </div>
          <div class="form-group">
            <label>正确答案 *</label>
            <input v-model="addForm.answer" type="text" placeholder="请输入正确答案" required />
          </div>
          <div class="form-group">
            <label>你的错误答案</label>
            <input v-model="addForm.wrong_answer" type="text" placeholder="请输入你做错的答案" />
          </div>
          <div class="form-group">
            <label>知识点</label>
            <input v-model="addForm.knowledge_point" type="text" placeholder="请输入知识点" />
          </div>
          <div class="form-error" v-if="addError">{{ addError }}</div>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showAddModal = false">取消</button>
            <button class="btn btn-primary" @click="handleAdd" :disabled="addLoading">
              {{ addLoading ? '添加中...' : '确认添加' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI问答弹窗 -->
    <AIAnswerModal
      v-model:visible="showAIModal"
      :question-id="aiQuestion?.question_id || aiQuestion?.id"
      :question-content="aiQuestion?.content"
      :question-options="aiQuestion?.options"
      :source-type="aiQuestion?.source_type || 'main'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWrongBook, toggleMaster, addWrongQuestion } from '@/api/student'
import AIAnswerModal from '@/components/AIAnswerModal.vue'

const wrongList = ref([])
const loading = ref(false)
const filterType = ref('')
const filterMastered = ref('')
const filterKeyword = ref('')
const showAIModal = ref(false)
const aiQuestion = ref(null)
const togglingId = ref(null)
const showAddModal = ref(false)
const addLoading = ref(false)
const addError = ref('')

const addForm = ref({
  content: '',
  answer: '',
  wrong_answer: '',
  knowledge_point: ''
})

const masteredCount = computed(() => {
  return wrongList.value.filter(item => item.is_mastered).length
})

const displayList = computed(() => {
  return wrongList.value
})

function typeLabel(type) {
  const map = {
    choice: '单选',
    multiple_choice: '多选',
    true_false: '判断',
    fill_blank: '填空',
    essay: '简答'
  }
  return map[type] || type
}

function parsedOptions(options) {
  if (!options) return null
  if (typeof options === 'object') return options
  try {
    return JSON.parse(options)
  } catch {
    return null
  }
}

async function loadWrongBook() {
  loading.value = true
  try {
    const params = {}
    if (filterType.value) params.question_type = filterType.value
    if (filterMastered.value === 'mastered') params.mastered = 'true'
    if (filterMastered.value === 'unmastered') params.mastered = 'false'
    if (filterKeyword.value.trim()) params.keyword = filterKeyword.value.trim()

    const res = await getWrongBook(params)
    wrongList.value = Array.isArray(res.data) ? res.data : (res.data?.results || [])
  } catch (error) {
    console.error('加载错题本失败:', error)
    wrongList.value = getMockWrongData()
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  loadWrongBook()
}

async function toggleMastered(item) {
  togglingId.value = item.id
  try {
    const newStatus = !item.is_mastered
    await toggleMaster(item.id, newStatus)
    item.is_mastered = newStatus
  } catch (error) {
    console.error('更新错题状态失败:', error)
  } finally {
    togglingId.value = null
  }
}

function openAIQuestion(item) {
  aiQuestion.value = item
  showAIModal.value = true
}

async function handleAdd() {
  if (!addForm.value.content.trim() || !addForm.value.answer.trim()) {
    addError.value = '题目内容和正确答案为必填项'
    return
  }
  addError.value = ''
  addLoading.value = true
  try {
    await addWrongQuestion(addForm.value)
    showAddModal.value = false
    addForm.value = { content: '', answer: '', wrong_answer: '', knowledge_point: '' }
    loadWrongBook()
  } catch (error) {
    addError.value = error.response?.data?.error || '添加失败，请稍后重试'
  } finally {
    addLoading.value = false
  }
}

function getMockWrongData() {
  return [
    {
      id: 1,
      question_type: 'choice',
      content: 'Python中列表推导式的基本语法是什么？',
      options: '{"A": "[x for x in iterable]", "B": "for x in iterable: [x]", "C": "list(for x in iterable)", "D": "{x for x in iterable}"}',
      answer: 'A',
      wrong_answer: 'B',
      analysis: '列表推导式语法为 [expression for item in iterable]',
      knowledge_point: 'Python列表',
      difficulty: 2,
      is_mastered: false
    },
    {
      id: 2,
      question_type: 'true_false',
      content: 'Python中的集合(set)是有序的。',
      answer: 'false',
      wrong_answer: 'true',
      analysis: 'Python中的set是无序集合，不支持索引访问。',
      knowledge_point: 'Python集合',
      difficulty: 1,
      is_mastered: true
    },
    {
      id: 3,
      question_type: 'multiple_choice',
      content: '以下哪些是Python的不可变类型？',
      options: '{"A": "int", "B": "list", "C": "tuple", "D": "str"}',
      answer: 'A,C,D',
      wrong_answer: 'A,C',
      analysis: 'int, tuple, str 是不可变类型，list是可变类型。',
      knowledge_point: 'Python数据类型',
      difficulty: 2,
      is_mastered: false
    }
  ]
}

onMounted(() => {
  loadWrongBook()
})
</script>

<style scoped>
.wrong-book-page {
  max-width: 900px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 页面头部 ===== */
.page-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 1.2em;
  color: var(--ink, #2a2a2a);
}

.header-stats {
  display: flex;
  gap: 16px;
}

.header-stats .stat-item {
  font-size: 13px;
  color: var(--muted, #6b655c);
}

.header-stats .stat-item strong { font-weight: 600; }

.stat-item.mastered { color: #5db872; }
.stat-item.unmastered { color: #d4a017; }

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: var(--muted, #6b655c);
  white-space: nowrap;
}

.filter-group select,
.filter-group input {
  padding: 6px 10px;
  border: 1.5px solid var(--hairline-strong, #ccc2b4);
  border-radius: var(--radius-sm, 6px);
  font-size: 13px;
  font-family: inherit;
  color: var(--ink, #2a2a2a);
  outline: none;
  background: var(--card-bg, #ffffff);
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: var(--primary, #d97757);
  box-shadow: 0 0 0 3px var(--primary-bg, rgba(217,119,87,0.12));
}

/* ===== 加载/空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 { margin: 0 0 8px 0; color: var(--ink, #2a2a2a); }
.empty-state p { margin: 0; color: var(--muted-soft, #9f988e); }

/* ===== 错题列表 ===== */
.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wrong-card {
  padding: 20px;
}

.wrong-card.mastered {
  opacity: 0.7;
  border-left: 3px solid #5db872;
}

.wrong-card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.type-badge {
  padding: 2px 8px;
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
}

.difficulty {
  font-size: 12px;
  color: var(--muted-soft, #9f988e);
}

.knowledge-tag {
  padding: 2px 8px;
  background: rgba(212,160,23,0.1);
  color: #d4a017;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
}

.mastered-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(93,184,114,0.1);
  color: #5db872;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
}

.question-content {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink, #2a2a2a);
}

.options-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.option-tag {
  padding: 2px 8px;
  border: 1px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-sm, 6px);
  font-size: 13px;
  color: var(--muted, #6b655c);
}

.option-tag.correct-option {
  border-color: #5db872;
  background: rgba(93,184,114,0.08);
  color: #3a9d5e;
}

.option-tag.wrong-option {
  border-color: #c64545;
  background: rgba(198,69,69,0.06);
  color: #b33a3a;
}

.answer-compare {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: var(--primary-bg, rgba(217,119,87,0.04));
  border: 1px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-md, 8px);
}

.your-answer, .correct-answer {
  font-size: 14px;
}

.label { color: var(--muted, #6b655c); margin-right: 4px; }
.wrong-value { color: #c64545; font-weight: 600; text-decoration: line-through; }
.correct-value { color: #5db872; font-weight: 600; }

.analysis-box {
  padding: 12px 14px;
  background: var(--primary-bg, rgba(217,119,87,0.06));
  border: 1px solid var(--hairline, #e3dbd0);
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  color: var(--muted, #6b655c);
}

.analysis-box strong { color: var(--ink, #2a2a2a); }
.analysis-box p { margin: 4px 0 0; line-height: 1.6; }

.wrong-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--hairline, #e3dbd0);
}

/* ===== 浮动添加按钮 ===== */
.float-add-btn {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 100;
}

.btn-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(217, 119, 87, 0.35);
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

.add-modal {
  max-width: 480px;
  width: 100%;
  padding: 28px 24px;
  background: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--hairline, #e3dbd0);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.add-modal h3 {
  margin: 0 0 20px;
  font-size: 1.15em;
  color: var(--ink, #2a2a2a);
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--ink, #2a2a2a);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--hairline-strong, #ccc2b4);
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-family: inherit;
  color: var(--ink, #2a2a2a);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary, #d97757);
  box-shadow: 0 0 0 3px var(--primary-bg, rgba(217,119,87,0.12));
}

.form-error {
  color: #c64545;
  font-size: 13px;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 10px; align-items: flex-start; }
  .filter-bar { flex-direction: column; gap: 10px; }
  .answer-compare { flex-direction: column; gap: 8px; }
  .float-add-btn { bottom: 70px; right: 16px; }
}
</style>