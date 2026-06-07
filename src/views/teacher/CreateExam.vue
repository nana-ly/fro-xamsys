<template>
  <div class="create-exam">
    <el-row :gutter="20">
      <!-- 左侧：试卷信息 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>试卷信息</span>
          </template>

          <el-form
              ref="examFormRef"
              :model="examForm"
              :rules="examRules"
              label-width="120px">

            <el-form-item label="试卷标题" prop="title">
              <el-input v-model="examForm.title" placeholder="请输入试卷标题" />
            </el-form-item>

            <el-form-item label="试卷描述" prop="description">
              <el-input
                  v-model="examForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入试卷描述" />
            </el-form-item>

            <el-form-item label="考试时长" prop="duration">
              <el-input-number
                  v-model="examForm.duration"
                  :min="10"
                  :max="300" />
              <span style="margin-left: 10px">分钟</span>
            </el-form-item>

            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                  v-model="examForm.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  :disabled-date="disabledDate"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>

            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                  v-model="examForm.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  :disabled-date="disabledDate"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>

            <el-form-item label="目标班级" prop="classIds">
              <el-select
                  v-model="examForm.classIds"
                  multiple
                  placeholder="选择班级">
                <el-option
                    v-for="cls in classList"
                    :key="cls.id"
                    :label="cls.name"
                    :value="cls.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="及格分数" prop="passScore">
              <el-input-number
                  v-model="examForm.passScore"
                  :min="0"
                  :max="examForm.totalScore" />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 选题区域 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <div style="display: flex; justify-content: space-between">
              <span>题目列表（共{{ selectedQuestions.length }}题，总分{{ totalScore }}分）</span>
              <div>
                <el-button type="primary" icon="Plus" @click="showSelectDialog">
                  从题库选题
                </el-button>
                <el-button type="success" icon="MagicStick" @click="autoGenerate">
                  智能组卷
                </el-button>
              </div>
            </div>
          </template>

          <!-- 已选题目列表 -->
          <el-table :data="selectedQuestions" border max-height="400">
            <el-table-column type="index" label="序号" width="60" />

            <el-table-column prop="content" label="题目内容" min-width="300">
              <template #default="scope">
                <div v-html="scope.row.content"></div>
              </template>
            </el-table-column>

            <el-table-column prop="type" label="题型" width="100">
              <template #default="scope">
                <el-tag>{{ getTypeName(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="分值" width="150">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.score"
                    :min="1"
                    :max="100"
                    size="small"
                    @change="calculateTotalScore" />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                    type="danger"
                    size="small"
                    icon="Delete"
                    @click="removeQuestion(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 操作按钮 -->
          <div style="margin-top: 20px; text-align: center">
            <el-button @click="handlePreview">预览试卷</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handlePublish">
              发布试卷
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：统计信息 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>试卷统计</span>
          </template>

          <div class="stat-item">
            <span class="label">总题数：</span>
            <span class="value">{{ selectedQuestions.length }} 题</span>
          </div>

          <div class="stat-item">
            <span class="label">总分值：</span>
            <span class="value">{{ totalScore }} 分</span>
          </div>

          <el-divider />

          <div class="stat-title">题型分布</div>
          <div v-for="(count, type) in typeDistribution" :key="type" class="stat-item">
            <span class="label">{{ getTypeName(type) }}：</span>
            <span class="value">{{ count }} 题</span>
          </div>

          <el-divider />

          <div class="stat-title">难度分布</div>
          <div v-for="(count, difficulty) in difficultyDistribution" :key="difficulty" class="stat-item">
            <span class="label">{{ getDifficultyName(difficulty) }}：</span>
            <span class="value">{{ count }} 题</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 选题对话框 -->
    <el-dialog
        v-model="selectDialogVisible"
        title="从题库选题"
        width="70%">

      <!-- 筛选 -->
      <el-form :inline="true">
        <el-form-item label="题型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 130px">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="blank" />
          </el-select>
        </el-form-item>

        <el-form-item label="难度">
          <el-select v-model="filterForm.difficulty" placeholder="全部" clearable style="width: 130px">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchBankQuestions">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 题库列表 -->
      <el-table
          ref="bankTableRef"
          :data="bankQuestions"
          @selection-change="handleSelectionChange"
          max-height="400">

        <el-table-column type="selection" width="55" />

        <el-table-column prop="content" label="题目内容" min-width="300">
          <template #default="scope">
            <div v-html="scope.row.content"></div>
          </template>
        </el-table-column>

        <el-table-column prop="question_type" label="题型" width="100">
          <template #default="scope">
            <el-tag>{{ getTypeName(scope.row.question_type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag :type="getDifficultyColor(scope.row.difficulty)">
              {{ getDifficultyName(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="score" label="默认分值" width="100" />
      </el-table>
      <el-pagination
        v-model:current-page="bankPage.current"
        :page-size="10"
        :total="bankPage.total"
        layout="total, prev, pager, next"
        small
        @current-change="fetchBankQuestions"
        style="margin-top:12px;justify-content:center" />

      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">
          确定（已选{{ tempSelection.length }}题）
        </el-button>
      </template>
    </el-dialog>

    <!-- 智能组卷对话框 -->
    <el-dialog
        v-model="autoDialogVisible"
        title="智能组卷"
        width="500px">


      <el-form :model="autoForm" label-width="120px">


        <el-form-item label="单选题数量">
          <el-input-number v-model="autoForm.singleCount" :min="0" />
        </el-form-item>

        <el-form-item label="多选题数量">
          <el-input-number v-model="autoForm.multipleCount" :min="0" />
        </el-form-item>

        <el-form-item label="判断题数量">
          <el-input-number v-model="autoForm.judgeCount" :min="0" />
        </el-form-item>

        <el-form-item label="填空题数量">
          <el-input-number v-model="autoForm.blankCount" :min="0" />
        </el-form-item>

        <el-form-item label="难度分布">
          <el-slider
              v-model="autoForm.difficultyRatio"
              range
              :marks="{ 0: '简单', 50: '中等', 100: '困难' }" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="autoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAutoGenerate">开始生成</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
        v-model="previewDialogVisible"
        title="试卷预览"
        width="70%">

      <div class="preview-content">
        <h2 style="text-align: center">{{ examForm.title }}</h2>
        <p style="text-align: center; color: #999">
          总分：{{ totalScore }}分 | 时长：{{ examForm.duration }}分钟 | 及格分：{{ examForm.passScore }}分
        </p>
        <el-divider />

        <div v-for="(question, index) in selectedQuestions" :key="index" class="preview-question">
          <div class="question-title">
            <span>{{ index + 1 }}. </span>
            <span>[{{ getTypeName(question.type) }}] </span>
            <span>({{ question.score }}分) </span>
            <span v-html="question.content"></span>
          </div>

          <!-- 选择题选项 -->
          <div v-if="question.type === 'single' || question.type === 'multiple'" class="options">
            <div v-for="option in question.options" :key="option.key" class="option">
              {{ option.key }}. {{ option.value }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getQuestionList,
  getClassList,
  createExam,
  updateExam,
  getExamDetail,
  getExamQuestions,
  autoGenerateExam,
  publishPaper
} from '@/api/teacher'

const router = useRouter()
const route = useRoute()

// 数据定义
const examFormRef = ref(null)
const bankTableRef = ref(null)
const submitLoading = ref(false)
const selectDialogVisible = ref(false)
const autoDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

// 试卷表单
const examForm = reactive({
  title: '',
  description: '',
  duration: 60,
  startTime: '',
  endTime: '',
  classIds: [],
  passScore: 60,
  totalScore: 100
})

// 表单验证规则
const examRules = {
  title: [{ required: true, message: '请输入试卷标题', trigger: 'blur' }],
  duration: [{ required: true, message: '请设置考试时长', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  classIds: [{ required: true, message: '请选择目标班级', trigger: 'change' }]
}

// 已选题目
const selectedQuestions = ref([])

// 班级列表
const classList = ref([])

// 题库题目
const bankQuestions = ref([])

// 临时选中的题目
const tempSelection = ref([])

// 筛选表单
const filterForm = reactive({
  type: '',
  difficulty: ''
})

// 智能组卷表单
const autoForm = reactive({
  singleCount: 10,
  multipleCount: 5,
  judgeCount: 3,
  blankCount: 2,
  difficultyRatio: [30, 70]
})

// 计算总分（确保数值相加，非字符串拼接）
const totalScore = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => sum + Number(q.score || 0), 0)
})

// 计算题型分布
const typeDistribution = computed(() => {
  const dist = {}
  selectedQuestions.value.forEach(q => {
    dist[q.type] = (dist[q.type] || 0) + 1
  })
  return dist
})

// 计算难度分布
const difficultyDistribution = computed(() => {
  const dist = {}
  selectedQuestions.value.forEach(q => {
    dist[q.difficulty] = (dist[q.difficulty] || 0) + 1
  })
  return dist
})

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 获取班级列表
const fetchClassList = async () => {
  try {
    // 兼容多种 localStorage key：auth/Login 使用 teacher_userInfo，teacher/Login 使用 userInfo
    const userInfo = JSON.parse(
      localStorage.getItem('teacher_userInfo') ||
      localStorage.getItem('userInfo') ||
      '{}'
    )
    const res = await getClassList()
    const allClasses = res.results || res
    if (userInfo.id) {
      classList.value = allClasses.filter(cls => cls.teacher === userInfo.id)
    } else {
      // 无法获取用户ID时显示所有班级
      classList.value = allClasses
    }
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  }
}

// 获取题库题目
const TYPE_MAP_BANK = { single: 'choice', multiple: 'multiple_choice', judge: 'true_false', blank: 'fill_blank', essay: 'essay' }
const DIFF_MAP_BANK = { easy: 1, medium: 3, hard: 5 }
const bankPage = reactive({ current: 1, size: 10, total: 0 })

const fetchBankQuestions = async () => {
  try {
    const params = { page: bankPage.current, page_size: 10 }
    if (filterForm.type) params.question_type = TYPE_MAP_BANK[filterForm.type] || filterForm.type
    if (filterForm.difficulty) params.difficulty = DIFF_MAP_BANK[filterForm.difficulty] || filterForm.difficulty
    const res = await getQuestionList(params)
    bankQuestions.value = res.results || []
    bankPage.total = res.count || 0
  } catch (error) {
    ElMessage.error('获取题库失败')
  }
}

// 显示选题对话框
const showSelectDialog = () => {
  selectDialogVisible.value = true
  fetchBankQuestions()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  tempSelection.value = selection
}

// 确认选题
const confirmSelection = () => {
  tempSelection.value.forEach(question => {
    // 避免重复添加
    if (!selectedQuestions.value.find(q => q.id === question.id)) {
      selectedQuestions.value.push({
        ...question,
        score: Number(question.score) || 5
      })
    }
  })
  selectDialogVisible.value = false
  calculateTotalScore()
}

// 移除题目
const removeQuestion = (index) => {
  selectedQuestions.value.splice(index, 1)
  calculateTotalScore()
}

// 计算总分
const calculateTotalScore = () => {
  examForm.totalScore = totalScore.value
}

// 显示智能组卷对话框
const autoGenerate = () => {
  if (!examForm.title) {
    ElMessage.warning('请先填写试卷标题')
    return
  }
  if (!examForm.classIds.length) {
    ElMessage.warning('请先选择目标班级')
    return
  }
  autoDialogVisible.value = true
}

// 确认智能组卷
const confirmAutoGenerate = async () => {
  try {
    // 前端题型名 → 后端数据库值
    const typeMap = {
      single: 'choice',
      multiple: 'multiple_choice',
      judge: 'true_false',
      blank: 'fill_blank'
    }
    const typeDistribution = {}
    if (autoForm.singleCount > 0) typeDistribution[typeMap.single] = autoForm.singleCount
    if (autoForm.multipleCount > 0) typeDistribution[typeMap.multiple] = autoForm.multipleCount
    if (autoForm.judgeCount > 0) typeDistribution[typeMap.judge] = autoForm.judgeCount
    if (autoForm.blankCount > 0) typeDistribution[typeMap.blank] = autoForm.blankCount

    if (Object.keys(typeDistribution).length === 0) {
      ElMessage.warning('请至少设置一种题型数量')
      return
    }

    const res = await autoGenerateExam({
      name: examForm.title,
      target_class: examForm.classIds[0],
      total_score: examForm.totalScore || 100,
      duration: examForm.duration || 60,
      type_distribution: typeDistribution
    })

    // 后端已创建试卷和题目，获取题目列表展示
    const paperId = res.paper?.id
    if (paperId) {
      const questionsData = await getExamQuestions(paperId)
      selectedQuestions.value = (Array.isArray(questionsData) ? questionsData : []).map(pq => ({
        id: pq.question_detail?.id ?? pq.question,
        content: pq.question_detail?.content ?? '',
        type: pq.question_detail?.question_type ?? '',
        options: pq.question_detail?.options ?? '',
        answer: pq.question_detail?.answer ?? '',
        difficulty: pq.question_detail?.difficulty ?? 1,
        score: Number(pq.score) || 5
      }))
      // 切换到编辑模式，后续点击"发布试卷"会更新而非重复创建
      isEdit.value = true
      editId.value = paperId
    }

    autoDialogVisible.value = false
    calculateTotalScore()
    ElMessage.success(`智能组卷成功，已生成${res.question_count}道题目，每题${res.score_per_question}分`)

  } catch (error) {
    ElMessage.error('智能组卷失败')
  }
}

// 预览试卷
const handlePreview = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择题目')
    return
  }
  previewDialogVisible.value = true
}

// 发布试卷
const handlePublish = async () => {
  // 编辑模式下允许已选题目为空（已在后端关联）
  if (!isEdit.value && selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择题目')
    return
  }

  await examFormRef.value.validate()

  submitLoading.value = true
  try {
    if (isEdit.value) {
      // 编辑模式：仅更新元数据，不重复发送题目
      const patchData = {
        name: examForm.title,
        duration: Number(examForm.duration) || 60,
        target_class: examForm.classIds[0],
        total_score: Number(examForm.totalScore) || 100
      }

      await updateExam(editId.value, patchData)
      await publishPaper(editId.value)
      ElMessage.success('发布成功')
    } else {
      // 新建模式：创建试卷 + 题目
      await createExam({
        name: examForm.title,
        description: examForm.description,
        duration: Number(examForm.duration) || 60,
        start_time: examForm.startTime,
        end_time: examForm.endTime,
        target_class: examForm.classIds[0],
        pass_score: Number(examForm.passScore) || 60,
        total_score: Number(examForm.totalScore) || 100,
        questions: selectedQuestions.value.map(q => ({
          question_id: q.id,
          score: Number(q.score) || 5
        }))
      })
      ElMessage.success('发布成功')
    }

    router.push('/teacher/exam-list')

  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 辅助函数
const getTypeName = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    blank: '填空题',
    essay: '简答题'
  }
  return typeMap[type] || type
}

const getDifficultyName = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return colorMap[difficulty] || 'info'
}

// 页面加载
onMounted(async () => {
  await fetchClassList()

  // 如果是编辑模式
  if (route.query.id) {
    isEdit.value = true
    editId.value = route.query.id

    try {
      const [paper, questionsData] = await Promise.all([
        getExamDetail(editId.value),
        getExamQuestions(editId.value)
      ])
      examForm.title = paper.name || ''
      examForm.description = paper.description || ''
      examForm.duration = paper.duration || 60
      examForm.startTime = paper.published_at || ''
      examForm.endTime = paper.end_time || ''
      examForm.classIds = paper.target_class ? [paper.target_class] : []
      examForm.passScore = paper.pass_score || 60
      examForm.totalScore = paper.total_score || 100
      selectedQuestions.value = (Array.isArray(questionsData) ? questionsData : []).map(pq => ({
        id: pq.question_detail?.id ?? pq.question,
        content: pq.question_detail?.content ?? '',
        type: pq.question_detail?.question_type ?? '',
        options: pq.question_detail?.options ?? '',
        answer: pq.question_detail?.answer ?? '',
        difficulty: pq.question_detail?.difficulty ?? 1,
        score: Number(pq.score) || 5
      }))
    } catch (error) {
      ElMessage.error('获取试卷详情失败')
    }
  }
})
</script>

<style scoped>
.create-exam {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.stat-item .label {
  color: #666;
}

.stat-item .value {
  font-weight: bold;
  color: #409eff;
}

.stat-title {
  font-weight: bold;
  margin: 10px 0;
  color: #333;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.preview-question {
  margin-bottom: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
}

.question-title {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 10px;
}

.options {
  margin-left: 30px;
}

.option {
  padding: 5px 0;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>