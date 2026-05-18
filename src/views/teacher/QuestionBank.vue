<template>
  <div class="question-bank">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>题库管理</h2>
      <div class="header-actions">
        <el-button type="success" icon="MagicStick" @click="showAIDialog">
          AI 出题
        </el-button>
        <el-button type="primary" icon="Plus" @click="showAddDialog">
          新增题目
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="题目内容">
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索题目"
              clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="题型">
          <el-select v-model="searchForm.type" placeholder="全部题型" clearable>
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="blank" />
            <el-option label="简答题" value="essay" />
          </el-select>
        </el-form-item>

        <el-form-item label="难度">
          <el-select v-model="searchForm.difficulty" placeholder="全部难度" clearable>
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 题目列表 -->
    <el-card class="table-card">
      <el-table
          :data="questionList"
          style="width: 100%"
          v-loading="loading">

        <el-table-column type="index" label="序号" width="60" />

        <el-table-column prop="content" label="题目内容" min-width="300">
          <template #default="scope">
            <div v-html="scope.row.content" class="question-content"></div>
          </template>
        </el-table-column>

        <el-table-column prop="question_type_display" label="题型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeColor(scope.row.question_type)">
              {{ scope.row.question_type_display || getTypeName(scope.row.question_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="difficulty_display" label="难度" width="100">
          <template #default="scope">
            <el-tag :type="getDifficultyColor(scope.row.difficulty)">
              {{ scope.row.difficulty_display || getDifficultyName(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="score" label="分值" width="80" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                icon="Edit"
                @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
                type="danger"
                size="small"
                icon="Delete"
                @click="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; justify-content: center">
      </el-pagination>
    </el-card>

    <!-- 新增/编辑题目对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="60%"
        @close="resetForm">

      <el-form
          ref="questionFormRef"
          :model="questionForm"
          :rules="questionRules"
          label-width="100px">

        <el-form-item label="题型" prop="type">
          <el-radio-group v-model="questionForm.type">
            <el-radio label="single">单选题</el-radio>
            <el-radio label="multiple">多选题</el-radio>
            <el-radio label="judge">判断题</el-radio>
            <el-radio label="blank">填空题</el-radio>
            <el-radio label="essay">简答题</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
              v-model="questionForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入题目内容">
          </el-input>
        </el-form-item>

        <!-- 选择题选项 -->
        <el-form-item
            label="选项"
            v-if="questionForm.type === 'single' || questionForm.type === 'multiple'">
          <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
            <el-input
                v-model="option.value"
                :placeholder="`选项${option.key}`">
              <template #prepend>{{ option.key }}</template>
            </el-input>
            <el-button
                v-if="questionForm.options.length > 2"
                type="danger"
                icon="Delete"
                circle
                @click="removeOption(index)">
            </el-button>
          </div>
          <el-button
              type="primary"
              icon="Plus"
              @click="addOption">
            添加选项
          </el-button>
        </el-form-item>

        <el-form-item label="正确答案" prop="answer">
          <!-- 单选题 -->
          <el-radio-group
              v-if="questionForm.type === 'single'"
              v-model="questionForm.answer">
            <el-radio
                v-for="option in questionForm.options"
                :key="option.key"
                :label="option.key">
              {{ option.key }}
            </el-radio>
          </el-radio-group>

          <!-- 多选题 -->
          <el-checkbox-group
              v-if="questionForm.type === 'multiple'"
              v-model="questionForm.answer">
            <el-checkbox
                v-for="option in questionForm.options"
                :key="option.key"
                :label="option.key">
              {{ option.key }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 判断题 -->
          <el-radio-group
              v-if="questionForm.type === 'judge'"
              v-model="questionForm.answer">
            <el-radio label="正确">正确</el-radio>
            <el-radio label="错误">错误</el-radio>
          </el-radio-group>

          <!-- 填空题和简答题 -->
          <el-input
              v-if="questionForm.type === 'blank' || questionForm.type === 'essay'"
              v-model="questionForm.answer"
              type="textarea"
              :rows="3"
              placeholder="请输入参考答案">
          </el-input>
        </el-form-item>

        <el-form-item label="答案解析" prop="explanation">
          <el-input
              v-model="questionForm.explanation"
              type="textarea"
              :rows="3"
              placeholder="请输入答案解析（选填）">
          </el-input>
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="questionForm.difficulty">
            <el-radio label="easy">简单</el-radio>
            <el-radio label="medium">中等</el-radio>
            <el-radio label="hard">困难</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分值" prop="score">
          <el-input-number
              v-model="questionForm.score"
              :min="1"
              :max="100">
          </el-input-number>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- AI 出题对话框 -->
    <el-dialog v-model="aiDialogVisible" title="AI 智能出题" width="50%" @close="resetAIDialog">
      <el-form :model="aiForm" label-width="100px">
        <el-form-item label="知识点" required>
          <el-input v-model="aiForm.knowledgePoint" placeholder="如：Python列表推导式、SQL注入" />
        </el-form-item>
        <el-form-item label="题型" required>
          <el-select v-model="aiForm.questionType" style="width: 100%">
            <el-option label="单选题" value="choice" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" required>
          <el-radio-group v-model="aiForm.difficulty">
            <el-radio label="easy">简单</el-radio>
            <el-radio label="medium">中等</el-radio>
            <el-radio label="hard">困难</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出题数量" required>
          <el-input-number v-model="aiForm.count" :min="1" :max="30" />
        </el-form-item>
      </el-form>
      <div v-if="aiResult" class="ai-result-box">
        <el-alert :title="aiResult" type="success" show-icon :closable="false" />
      </div>
      <div v-if="aiError" class="ai-result-box">
        <el-alert :title="aiError" type="error" show-icon :closable="false" />
      </div>
      <template #footer>
        <el-button @click="aiDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="aiLoading" @click="handleAIGenerate">
          {{ aiLoading ? '生成中...' : '开始生成' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getQuestionList,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  aiGenerateQuestion,
  getQuestionDetail
} from '@/api/teacher'

// 数据定义
const loading = ref(false)
const submitLoading = ref(false)
const questionList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增题目')
const questionFormRef = ref(null)
const editingId = ref(null)

// AI 出题
const aiDialogVisible = ref(false)
const aiLoading = ref(false)
const aiResult = ref('')
const aiError = ref('')
const aiForm = reactive({
  knowledgePoint: '',
  questionType: 'choice',
  difficulty: 'medium',
  count: 5
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  difficulty: ''
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 题目表单
const questionForm = reactive({
  type: 'single',
  content: '',
  options: [
    { key: 'A', value: '' },
    { key: 'B', value: '' },
    { key: 'C', value: '' },
    { key: 'D', value: '' }
  ],
  answer: '',
  explanation: '',
  difficulty: 'medium',
  score: 5
})

// 表单验证规则
const questionRules = {
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请设置正确答案', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  score: [{ required: true, message: '请设置分值', trigger: 'blur' }]
}

// 获取题目列表
const fetchQuestionList = async () => {
  loading.value = true
  try {
    const res = await getQuestionList({
      page: pagination.current,
      page_size: pagination.size,
      keyword: searchForm.keyword,
      type: searchForm.type,
      difficulty: searchForm.difficulty
    })

    questionList.value = res.results
    pagination.total = res.count

  } catch (error) {
    ElMessage.error('获取题目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchQuestionList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.difficulty = ''
  pagination.current = 1
  fetchQuestionList()
}

// 分页改变
const handleSizeChange = (size) => {
  pagination.size = size
  fetchQuestionList()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  fetchQuestionList()
}

// 显示新增对话框
const showAddDialog = () => {
  dialogTitle.value = '新增题目'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

// 后端字段名 -> 前端字段名映射
const TYPE_BACKEND_TO_FRONT = {
  'choice': 'single',
  'multiple_choice': 'multiple',
  'true_false': 'judge',
  'fill_blank': 'blank',
  'essay': 'essay'
}
const DIFFICULTY_BACKEND_TO_FRONT = {
  1: 'easy',
  2: 'easy',
  3: 'medium',
  4: 'hard',
  5: 'hard'
}

// 编辑题目（先请求详情，因为列表接口不返回答案和解析）
const handleEdit = async (row) => {
  dialogTitle.value = '编辑题目'
  editingId.value = row.id

  try {
    // 请求单题详情，拿到完整数据（含 answer、analysis）
    const detail = await getQuestionDetail(row.id)

    // 填充表单数据，映射字段名
    questionForm.type = TYPE_BACKEND_TO_FRONT[detail.question_type] || detail.question_type
    questionForm.content = detail.content || ''
    questionForm.answer = detail.answer || ''
    questionForm.explanation = detail.analysis || ''
    questionForm.difficulty = DIFFICULTY_BACKEND_TO_FRONT[detail.difficulty] || 'medium'
    questionForm.score = 5  // 后端没有 score 字段，设置默认值

    // 如果是选择题，填充选项（API返回{key:value}对象，转换为[{key,value}]数组）
    if (detail.question_type === 'choice' || detail.question_type === 'multiple_choice') {
      const opts = detail.options || {}
      if (Array.isArray(opts)) {
        questionForm.options = opts
      } else if (typeof opts === 'object') {
        questionForm.options = Object.keys(opts).map(key => ({ key, value: opts[key] }))
      }
    }

    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取题目详情失败')
  }
}

// 删除题目
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteQuestion(id)
    ElMessage.success('删除成功')
    fetchQuestionList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 添加选项
const addOption = () => {
  const nextKey = String.fromCharCode(65 + questionForm.options.length) // A,B,C,D...
  questionForm.options.push({
    key: nextKey,
    value: ''
  })
}

// 删除选项
const removeOption = (index) => {
  questionForm.options.splice(index, 1)
  // 重新分配选项key
  questionForm.options.forEach((option, i) => {
    option.key = String.fromCharCode(65 + i)
  })
}

// 提交表单
const handleSubmit = async () => {
  await questionFormRef.value.validate()

  submitLoading.value = true
  try {
    const data = {
      type: questionForm.type,
      content: questionForm.content,
      answer: questionForm.answer,
      explanation: questionForm.explanation,
      difficulty: questionForm.difficulty,
      score: questionForm.score
    }

    // 如果是选择题，添加选项
    if (questionForm.type === 'single' || questionForm.type === 'multiple') {
      data.options = questionForm.options
    }

    if (editingId.value) {
      // 编辑
      await updateQuestion(editingId.value, data)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await addQuestion(data)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchQuestionList()

  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  questionForm.type = 'single'
  questionForm.content = ''
  questionForm.options = [
    { key: 'A', value: '' },
    { key: 'B', value: '' },
    { key: 'C', value: '' },
    { key: 'D', value: '' }
  ]
  questionForm.answer = ''
  questionForm.explanation = ''
  questionForm.difficulty = 'medium'
  questionForm.score = 5

  if (questionFormRef.value) {
    questionFormRef.value.clearValidate()
  }
}

// ========== AI 出题 ==========
const showAIDialog = () => {
  aiDialogVisible.value = true
  aiResult.value = ''
  aiError.value = ''
  aiForm.knowledgePoint = ''
  aiForm.questionType = 'choice'
  aiForm.difficulty = 'medium'
  aiForm.count = 5
}

const handleAIGenerate = async () => {
  if (!aiForm.knowledgePoint.trim()) {
    aiError.value = '请输入知识点'
    return
  }
  aiLoading.value = true
  aiResult.value = ''
  aiError.value = ''
  try {
    const res = await aiGenerateQuestion({
      knowledge_point: aiForm.knowledgePoint,
      question_type: aiForm.questionType,
      difficulty: aiForm.difficulty,
      count: aiForm.count,
      target_library: 'main'
    })
    const msg = res.message || `成功生成 ${(res.questions || []).length} 道题目`
    aiResult.value = msg
    ElMessage.success(msg)
    fetchQuestionList()
  } catch (error) {
    const errMsg = error.response?.data?.error || error.message || 'AI 出题失败'
    aiError.value = errMsg
    ElMessage.error(errMsg)
  } finally {
    aiLoading.value = false
  }
}

const resetAIDialog = () => {
  aiResult.value = ''
  aiError.value = ''
}

// 辅助函数
const getTypeName = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    blank: '填空题',
    essay: '简答题',
    // 后端值兼容
    choice: '单选题',
    multiple_choice: '多选题',
    true_false: '判断题',
    fill_blank: '填空题',
  }
  return typeMap[type] || type
}

const getTypeColor = (type) => {
  const colorMap = {
    single: '',
    multiple: 'success',
    judge: 'warning',
    blank: 'info',
    essay: 'danger',
    // 后端值兼容
    choice: '',
    multiple_choice: 'success',
    true_false: 'warning',
    fill_blank: 'info',
  }
  return colorMap[type] || ''
}

const getDifficultyName = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    // 后端值兼容（1-5）
    1: '简单',
    2: '较简单',
    3: '中等',
    4: '较难',
    5: '困难',
  }
  return difficultyMap[difficulty] || difficulty
}

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
    // 后端值兼容（1-5）
    1: 'success',
    2: '',
    3: 'warning',
    4: 'danger',
    5: 'danger',
  }
  return colorMap[difficulty] || ''
}

// 页面加载时获取数据
onMounted(() => {
  fetchQuestionList()
})
</script>

<style scoped>
.question-bank {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.ai-result-box {
  margin-top: 16px;
  padding: 0 10px;
}

.search-card, .table-card {
  margin-bottom: 20px;
}

.question-content {
  line-height: 1.6;
  word-break: break-all;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-item .el-input {
  flex: 1;
  margin-right: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h2 {
    margin-bottom: 10px;
  }
}
</style>