<template>
  <div class="score-view">
    <div class="page-header">
      <h2>成绩管理</h2>
    </div>

    <!-- 筛选区 -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item label="选择班级">
          <el-select
              v-model="filterForm.classId"
              placeholder="全部班级"
              style="width: 160px"
              @change="handleClassChange">
            <el-option label="全部班级" value="" />
            <el-option
                v-for="cls in classList"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择试卷">
          <el-select
              v-model="filterForm.examId"
              placeholder="全部试卷"
              style="width: 200px"
              @change="fetchScoreData">
            <el-option label="全部试卷" :value="null" />
            <el-option
                v-for="exam in examList"
                :key="exam.id"
                :label="exam.name"
                :value="exam.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="fetchScoreData">
            查询
          </el-button>
          <el-button icon="Download" @click="exportScores">
            导出成绩
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 当前筛选上下文 -->
    <div v-if="selectedClassName || selectedExamName" class="filter-context">
      <el-tag v-if="selectedClassName" type="primary" size="large">
        <el-icon><School /></el-icon> {{ selectedClassName }}
      </el-tag>
      <el-tag v-if="selectedExamName" type="success" size="large">
        <el-icon><Document /></el-icon> {{ selectedExamName }}
      </el-tag>
    </div>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalStudents }}</div>
              <div class="stat-label">参考人数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><TrophyBase /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon><SortUp /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.maxScore }}</div>
              <div class="stat-label">最高分</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.passRate }}%</div>
              <div class="stat-label">及格率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>成绩分布</span>
          </template>
          <ScoreDistChart :data="chartData.distribution" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>各题正确率</span>
          </template>
          <AccuracyChart :data="chartData.accuracy" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>成绩趋势</span>
          </template>
          <TrendChart :data="chartData.trend" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 成绩列表 -->
    <el-card class="table-card">
      <template #header>
        <span>成绩明细</span>
      </template>

      <el-table
          :data="scoreList"
          v-loading="loading"
          stripe>

        <el-table-column type="index" label="排名" width="60" />

        <el-table-column prop="student_name" label="姓名" width="120" />

        <el-table-column prop="student_id" label="学号" width="150" />

        <el-table-column prop="class_name" label="班级" width="150" />

        <el-table-column prop="exam_title" label="试卷" min-width="200" />

        <el-table-column prop="score" label="得分" width="100" sortable>
          <template #default="scope">
            <el-tag
                :type="getScoreType(scope.row.score, scope.row.pass_score)">
              {{ scope.row.score }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="submit_time" label="提交时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.submit_time) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
                :type="scope.row.score >= scope.row.pass_score ? 'success' : 'danger'">
              {{ scope.row.score >= scope.row.pass_score ? '及格' : '不及格' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewDetail(scope.row)">
              查看详情
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

    <!-- 成绩详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="答卷详情"
        width="70%">

      <div v-if="scoreDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">
            {{ scoreDetail.student_name }}
          </el-descriptions-item>
          <el-descriptions-item label="学号">
            {{ scoreDetail.student_id }}
          </el-descriptions-item>
          <el-descriptions-item label="试卷名称">
            {{ scoreDetail.exam_title }}
          </el-descriptions-item>
          <el-descriptions-item label="班级">
            {{ scoreDetail.paper?.target_class_name || scoreDetail.class_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="得分">
            <el-tag :type="getScoreType(scoreDetail.score, scoreDetail.pass_score)" size="large">
              {{ scoreDetail.score }} / {{ scoreDetail.total_score }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(scoreDetail.submit_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="用时">
            {{ scoreDetail.duration }} 分钟
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h3>答题详情</h3>
        <div
            v-for="(answer, index) in scoreDetail.answers"
            :key="index"
            class="answer-item">

          <div class="question-header">
            <span class="question-num">{{ index + 1 }}.</span>
            <el-tag :type="answer.is_correct ? 'success' : 'danger'" size="small">
              {{ answer.is_correct ? '正确' : '错误' }}
            </el-tag>
            <span class="question-score">{{ answer.score }} / {{ answer.total_score }}分</span>
          </div>

          <div class="question-content" v-html="answer.question_content"></div>

          <div class="answer-section">
            <div class="answer-line">
              <span class="label">学生答案：</span>
              <span :class="{'wrong-answer': !answer.is_correct}">
                {{ answer.student_answer || '未作答' }}
              </span>
            </div>
            <div class="answer-line">
              <span class="label">正确答案：</span>
              <span class="correct-answer">{{ answer.correct_answer }}</span>
            </div>
            <div v-if="answer.explanation" class="answer-line">
              <span class="label">答案解析：</span>
              <span>{{ answer.explanation }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  TrophyBase,
  SortUp,
  CircleCheck,
  School,
  Document
} from '@element-plus/icons-vue'
import {
  getClassList,
  getExamList,
  getScoreList,
  getScoreStatistics,
  getScoreDetail,
  exportScores as exportScoresAPI
} from '@/api/teacher'
import ScoreDistChart from '@/components/charts/ScoreDistChart.vue'
import AccuracyChart from '@/components/charts/AccuracyChart.vue'
import TrendChart from '@/components/charts/TrendChart.vue'

// 数据定义
const loading = ref(false)
const classList = ref([])
const examList = ref([])
const scoreList = ref([])
const scoreDetail = ref(null)
const detailDialogVisible = ref(false)

// 当前选中的班级/试卷名称
const selectedClassName = computed(() => {
  if (!filterForm.classId) return ''
  const cls = classList.value.find(c => c.id === filterForm.classId)
  return cls ? cls.name : ''
})
const selectedExamName = computed(() => {
  if (!filterForm.examId) return ''
  const exam = examList.value.find(e => e.id === filterForm.examId)
  return exam ? exam.name || exam.title : ''
})

// 筛选表单
const filterForm = reactive({
  classId: null,
  examId: null
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalStudents: 0,
  avgScore: 0,
  maxScore: 0,
  passRate: 0
})

// 图表数据
const chartData = reactive({
  distribution: [],
  accuracy: [],
  trend: []
})

// 获取班级列表
const fetchClassList = async () => {
  try {
    const userInfo = JSON.parse(
      localStorage.getItem('teacher_userInfo') ||
      localStorage.getItem('userInfo') ||
      '{}'
    )
    const res = await getClassList()
    let classes = res.results || res

    // 只显示当前教师创建的班级（宽松比较）
    if (userInfo.id) {
      classes = classes.filter(cls => String(cls.teacher) === String(userInfo.id))
    }

    classList.value = classes
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  }
}

// 班级改变时获取该班级的试卷
const handleClassChange = async () => {
  if (filterForm.classId) {
    try {
      const res = await getExamList({ class_id: filterForm.classId })
      examList.value = res.results || res
    } catch (error) {
      ElMessage.error('获取试卷列表失败')
    }
  } else {
    examList.value = []
  }
  filterForm.examId = null
  fetchScoreData()
}

// 获取成绩数据
const fetchScoreData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterForm.classId) params.class_id = filterForm.classId
    if (filterForm.examId) params.exam_id = filterForm.examId
    params.page = pagination.current
    params.page_size = pagination.size

    // 获取成绩列表
    const scoreRes = await getScoreList(params)
    // 映射后端字段到前端表格期望的字段名
    scoreList.value = (scoreRes.results || []).map(r => ({
      ...r,
      exam_title: r.paper_name,
      submit_time: r.submitted_at,
      student_id: r.student,
      class_name: r.class_name || '',
      pass_score: 60
    }))
    pagination.total = scoreRes.count || 0

    // 获取统计数据
    const statsParams = {}
    if (filterForm.classId) statsParams.class_id = filterForm.classId
    if (filterForm.examId) statsParams.exam_id = filterForm.examId

    const statsRes = await getScoreStatistics(statsParams)

    const stats = statsRes.statistics || statsRes
    statistics.totalStudents = stats.total || 0
    statistics.avgScore = stats.average_score || 0
    statistics.maxScore = stats.highest_score || 0
    statistics.passRate = stats.total > 0 ? Math.round((stats.pass_count || 0) / stats.total * 100) : 0
    chartData.distribution = statsRes.distribution || []
    chartData.accuracy = statsRes.accuracy || []
    chartData.trend = statsRes.trend || []

  } catch (error) {
    ElMessage.error('获取成绩数据失败')
  } finally {
    loading.value = false
  }
}

// 分页改变
const handleSizeChange = (size) => {
  pagination.size = size
  fetchScoreData()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  fetchScoreData()
}

// 查看详情
const viewDetail = async (row) => {
  try {
    const res = await getScoreDetail(row.id)
    // 后端返回 { record: {...}, answers: [...] }
    const record = res.record || res
    const rawAnswers = res.answers || []
    const answers = rawAnswers.map(a => ({
      ...a,
      question_content: a.question_detail?.content || '',
      correct_answer: a.question_detail?.answer || '',
      explanation: a.question_detail?.analysis || '',
      total_score: a.score || 0
    }))
    scoreDetail.value = {
      ...record,
      exam_title: record.paper_name,
      submit_time: record.submitted_at,
      student_id: record.student,
      pass_score: 60,
      total_score: record.paper?.total_score || 100,
      duration: record.started_at && record.submitted_at
        ? Math.round((new Date(record.submitted_at) - new Date(record.started_at)) / 60000)
        : 0,
      answers
    }
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 导出成绩
const exportScores = async () => {
  try {
    const res = await exportScoresAPI({
      class_id: filterForm.classId,
      exam_id: filterForm.examId
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `成绩表_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 辅助函数
const getScoreType = (score, passScore) => {
  if (score >= 90) return 'success'
  if (score >= passScore) return 'info'
  return 'danger'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 页面加载
onMounted(() => {
  fetchClassList()
  fetchScoreData()
})
</script>

<style scoped>
.score-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: var(--ink, #333);
}

.filter-card {
  margin-bottom: 16px;
}

.filter-context {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-context .el-tag {
  font-size: 14px;
  padding: 8px 16px;
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--ink, #333);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--muted-soft, #999);
}

/* 图表区域 */
.chart-row {
  margin-bottom: 20px;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
}

/* 答题详情样式 */
.answer-item {
  margin-bottom: 30px;
  padding: 15px;
  background: var(--canvas, #f5f5f5);
  border-radius: 5px;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.question-num {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}

.question-score {
  margin-left: auto;
  color: #409eff;
  font-weight: bold;
}

.question-content {
  margin: 15px 0;
  font-size: 16px;
  line-height: 1.8;
}

.answer-section {
  margin-top: 15px;
}

.answer-line {
  margin-bottom: 10px;
  line-height: 1.8;
}

.answer-line .label {
  font-weight: bold;
  color: var(--muted, #666);
  margin-right: 10px;
}

.wrong-answer {
  color: #f56c6c;
  text-decoration: line-through;
}

.correct-answer {
  color: #67c23a;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-row .el-col {
    margin-bottom: 10px;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>