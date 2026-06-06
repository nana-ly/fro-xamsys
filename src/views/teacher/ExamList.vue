<template>
  <div class="exam-list">
    <div class="page-header">
      <h2>试卷管理</h2>
      <el-button type="primary" icon="Plus" @click="openCreateDialog">
        创建试卷
      </el-button>
    </div>

    <el-card>
      <el-table :data="examList" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="试卷标题" min-width="200" />
        <el-table-column prop="question_count" label="题数" width="80" />
        <el-table-column prop="total_score" label="总分" width="80" />
        <el-table-column prop="duration" label="时长" width="100">
          <template #default="scope">{{ scope.row.duration }} 分钟</template>
        </el-table-column>
        <el-table-column label="开始时间" width="160">
          <template #default="scope">{{ formatDate(scope.row.published_at || scope.row.created_at, 'YYYY-MM-DD HH:mm') || '未发布' }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template #default="scope">{{ calcEndTime(scope.row) || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">{{ getStatusName(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
        :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchExamList" @current-change="fetchExamList" style="margin-top: 20px; justify-content: center" />
    </el-card>

    <!-- ===== 创建/编辑试卷弹窗 ===== -->
    <el-dialog v-model="examDialogVisible" :title="isEdit ? '编辑试卷' : '创建试卷'" width="800px" @close="resetExamDialog">
      <el-form ref="examFormRef" :model="examForm" :rules="examRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="试卷标题" prop="title">
              <el-input v-model="examForm.title" placeholder="请输入试卷标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标班级" prop="classIds">
              <el-select v-model="examForm.classIds" multiple placeholder="选择班级">
                <el-option v-for="cls in classList" :key="cls.id" :label="cls.name" :value="cls.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="考试时长" prop="duration">
              <el-input-number v-model="examForm.duration" :min="10" :max="300" /> <span style="margin-left:8px">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总分" prop="totalScore">
              <el-input-number v-model="examForm.totalScore" :min="10" :max="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="及格分数" prop="passScore">
              <el-input-number v-model="examForm.passScore" :min="0" :max="examForm.totalScore" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试时间" prop="startTime">
              <el-date-picker v-model="examForm.startTime" type="datetime" placeholder="开始时间" :disabled-date="disabledDate"
                format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider />

      <!-- 题目列表 -->
      <div class="section-header">
        <span>题目列表（共{{ selectedQuestions.length }}题，总分{{ totalScore }}分）</span>
        <div>
          <el-button size="small" icon="Plus" @click="showSelectDialog">从题库选题</el-button>
          <el-button size="small" type="success" icon="MagicStick" @click="autoGenerate" :disabled="!examForm.title || !examForm.classIds.length">智能组卷</el-button>
        </div>
      </div>
      <el-table :data="selectedQuestions" border max-height="300" style="margin-top:12px">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="content" label="题目内容" min-width="280">
          <template #default="scope"><div v-html="scope.row.content"></div></template>
        </el-table-column>
        <el-table-column label="题型" width="80">
          <template #default="scope"><el-tag>{{ getTypeName(scope.row.type) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="分值" width="110">
          <template #default="scope">
            <el-input-number 
              v-model="scope.row.score" 
              :min="1" 
              :max="100" 
              size="small" 
              controls-position="right"
              :controls="true"
              style="width: 85px"
              @change="calculateTotalScore" 
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="danger" size="small" @click="removeQuestion(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6"><div class="stat-card">总题数 <strong>{{ selectedQuestions.length }}</strong> 题</div></el-col>
        <el-col :span="6"><div class="stat-card">总分值 <strong>{{ totalScore }}</strong> 分</div></el-col>
        <el-col :span="6"><div class="stat-card">平均分 <strong>{{ selectedQuestions.length ? (totalScore / selectedQuestions.length).toFixed(1) : 0 }}</strong> 分/题</div></el-col>
        <el-col :span="6"><div class="stat-card">及格线 <strong>{{ examForm.passScore }}</strong> 分</div></el-col>
      </el-row>

      <template #footer>
        <el-button @click="handlePreview" :disabled="selectedQuestions.length === 0">预览试卷</el-button>
        <el-button @click="examDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handlePublish">发布试卷</el-button>
      </template>
    </el-dialog>

    <!-- 从题库选题弹窗 -->
    <el-dialog v-model="selectDialogVisible" title="从题库选题" width="70%">
      <el-form :inline="true">
        <el-form-item label="题型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable>
            <el-option label="单选题" value="single" /><el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" /><el-option label="填空题" value="blank" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filterForm.difficulty" placeholder="全部" clearable>
            <el-option label="简单" value="easy" /><el-option label="中等" value="medium" /><el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="fetchBankQuestions">搜索</el-button></el-form-item>
      </el-form>
      <el-table ref="bankTableRef" :data="bankQuestions" @selection-change="handleSelectionChange" max-height="400">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="content" label="题目内容" min-width="300">
          <template #default="scope"><div v-html="scope.row.content"></div></template>
        </el-table-column>
        <el-table-column label="题型" width="100">
          <template #default="scope"><el-tag>{{ getTypeName(scope.row.type) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="scope"><el-tag :type="getDifficultyColor(scope.row.difficulty)">{{ getDifficultyName(scope.row.difficulty) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="score" label="默认分值" width="100" />
      </el-table>
      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确定（已选{{ tempSelection.length }}题）</el-button>
      </template>
    </el-dialog>

    <!-- 智能组卷弹窗 -->
    <el-dialog v-model="autoDialogVisible" title="智能组卷" width="500px">
      <el-form :model="autoForm" label-width="120px">
        <el-form-item label="总题数"><el-input-number v-model="autoForm.totalCount" :min="5" :max="100" /></el-form-item>
        <el-form-item label="单选题数量"><el-input-number v-model="autoForm.singleCount" :min="0" /></el-form-item>
        <el-form-item label="多选题数量"><el-input-number v-model="autoForm.multipleCount" :min="0" /></el-form-item>
        <el-form-item label="判断题数量"><el-input-number v-model="autoForm.judgeCount" :min="0" /></el-form-item>
        <el-form-item label="填空题数量"><el-input-number v-model="autoForm.blankCount" :min="0" /></el-form-item>
        <el-form-item label="难度分布">
          <el-slider v-model="autoForm.difficultyRatio" range :marks="{ 0: '简单', 50: '中等', 100: '困难' }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="autoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAutoGenerate">开始生成</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="试卷预览" width="70%">
      <div class="preview-content">
        <h2 style="text-align:center">{{ examForm.title }}</h2>
        <p style="text-align:center;color:var(--muted-soft, #999)">总分：{{ totalScore }}分 | 时长：{{ examForm.duration }}分钟</p>
        <el-divider />
        <div v-for="(q, idx) in selectedQuestions" :key="idx" class="preview-question">
          <div class="question-title">
            <span>{{ idx + 1 }}. [{{ getTypeName(q.type) }}] ({{ q.score }}分) </span>
            <span v-html="q.content"></span>
          </div>
          <div v-if="['single','multiple','choice','multiple_choice'].includes(q.type)" class="options">
            <div v-for="(text, key) in parsedOptions(q.options)" :key="key" class="option">{{ key }}. {{ text }}</div>
          </div>
          <div v-if="['true_false','judge'].includes(q.type)" class="options">
            <div class="option">A. 正确</div>
            <div class="option">B. 错误</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExamList, deleteExam, getQuestionList, getClassList, createExam, updateExam, getExamDetail, getExamQuestions, autoGenerateExam, publishPaper } from '@/api/teacher'
import { formatDate } from '@/utils/common'

const loading = ref(false)
const examList = ref([])
const pagination = reactive({ current: 1, size: 10, total: 0 })
// 考试弹窗
const examDialogVisible = ref(false)
const selectDialogVisible = ref(false)
const autoDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const examFormRef = ref(null)
const bankTableRef = ref(null)
// 班级
const classList = ref([])
// 题目
const selectedQuestions = ref([])
const bankQuestions = ref([])
const tempSelection = ref([])
const filterForm = reactive({ type: '', difficulty: '' })
const autoForm = reactive({ totalCount: 20, singleCount: 10, multipleCount: 5, judgeCount: 3, blankCount: 2, difficultyRatio: [30, 70] })

const examForm = reactive({ title: '', description: '', duration: 60, startTime: '', classIds: [], passScore: 60, totalScore: 100 })
const examRules = { title: [{ required: true, message: '请输入试卷标题', trigger: 'blur' }], duration: [{ required: true, message: '请设置考试时长', trigger: 'blur' }], classIds: [{ required: true, message: '请选择目标班级', trigger: 'change' }] }

const totalScore = computed(() => selectedQuestions.value.reduce((sum, q) => sum + Number(q.score || 0), 0))

function calcEndTime(exam) {
  const start = exam.published_at || exam.created_at
  if (!start) return null
  const d = new Date(start)
  d.setMinutes(d.getMinutes() + (exam.duration || 0))
  return formatDate(d.toISOString(), 'YYYY-MM-DD HH:mm')
}
function getStatusType(exam) {
  if (!exam.published_at) return 'info'
  return Date.now() > new Date(exam.published_at).getTime() + (exam.duration || 0) * 60000 ? 'danger' : 'success'
}
function getStatusName(exam) {
  if (!exam.published_at) return '未发布'
  return Date.now() > new Date(exam.published_at).getTime() + (exam.duration || 0) * 60000 ? '已结束' : '进行中'
}

async function fetchExamList() {
  loading.value = true
  try {
    const res = await getExamList({ page: pagination.current, page_size: pagination.size })
    examList.value = (res.results || []).map(p => ({ ...p, title: p.name || p.title }))
    pagination.total = res.count
  } catch { ElMessage.error('获取试卷列表失败') }
  finally { loading.value = false }
}

function openCreateDialog() {
  isEdit.value = false; editId.value = null
  examForm.title = ''; examForm.duration = 60; examForm.startTime = ''; examForm.classIds = []; examForm.passScore = 60; examForm.totalScore = 100
  selectedQuestions.value = []
  examDialogVisible.value = true
}
async function openEditDialog(row) {
  isEdit.value = true; editId.value = row.id
  try {
    const [paper, questionsData] = await Promise.all([getExamDetail(row.id), getExamQuestions(row.id)])
    examForm.title = paper.name || ''; examForm.duration = paper.duration || 60
    examForm.startTime = paper.published_at || ''; examForm.classIds = paper.target_class ? [paper.target_class] : []
    examForm.passScore = paper.pass_score || 60; examForm.totalScore = paper.total_score || 100
    selectedQuestions.value = (Array.isArray(questionsData) ? questionsData : []).map(pq => ({
      id: pq.question_detail?.id ?? pq.question, content: pq.question_detail?.content ?? '',
      type: pq.question_detail?.question_type ?? '', question_type: pq.question_detail?.question_type ?? '',
      options: pq.question_detail?.options ?? '',
      answer: pq.question_detail?.answer ?? '', difficulty: pq.question_detail?.difficulty ?? 1,
      score: Number(pq.score) || 5
    }))
    examDialogVisible.value = true
  } catch { ElMessage.error('获取试卷详情失败') }
}

function resetExamDialog() { selectedQuestions.value = []; isEdit.value = false; editId.value = null }

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除试卷「${row.title}」吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await deleteExam(row.id); ElMessage.success('删除成功'); fetchExamList()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

// ===== 选题 =====
async function fetchClassList() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('teacher_userInfo') || '{}')
    const res = await getClassList()
    classList.value = ((res.results || res)).filter(cls => cls.teacher === userInfo.id)
  } catch { ElMessage.error('获取班级列表失败') }
}
async function fetchBankQuestions() {
  try {
    const res = await getQuestionList({ type: filterForm.type, difficulty: filterForm.difficulty, page_size: 100 })
    bankQuestions.value = res.results
  } catch { ElMessage.error('获取题库失败') }
}
function showSelectDialog() { selectDialogVisible.value = true; fetchBankQuestions() }
function handleSelectionChange(selection) { tempSelection.value = selection }
function confirmSelection() {
  tempSelection.value.forEach(q => {
    if (!selectedQuestions.value.find(s => s.id === q.id))
      selectedQuestions.value.push({ ...q, type: q.type || q.question_type, score: Number(q.score) || 5 })
  })
  selectDialogVisible.value = false; calculateTotalScore()
}
function removeQuestion(index) { selectedQuestions.value.splice(index, 1); calculateTotalScore() }
function calculateTotalScore() { examForm.totalScore = totalScore.value }

// ===== 智能组卷 =====
function autoGenerate() {
  if (!examForm.title) { ElMessage.warning('请先填写试卷标题'); return }
  if (!examForm.classIds.length) { ElMessage.warning('请先选择目标班级'); return }
  autoDialogVisible.value = true
}
async function confirmAutoGenerate() {
  try {
    const typeMap = { single: 'choice', multiple: 'multiple_choice', judge: 'true_false', blank: 'fill_blank' }
    const td = {}
    if (autoForm.singleCount > 0) td[typeMap.single] = autoForm.singleCount
    if (autoForm.multipleCount > 0) td[typeMap.multiple] = autoForm.multipleCount
    if (autoForm.judgeCount > 0) td[typeMap.judge] = autoForm.judgeCount
    if (autoForm.blankCount > 0) td[typeMap.blank] = autoForm.blankCount
    if (!Object.keys(td).length) { ElMessage.warning('请至少设置一种题型数量'); return }
    const res = await autoGenerateExam({ name: examForm.title, target_class: examForm.classIds[0], total_score: examForm.totalScore || 100, duration: examForm.duration || 60, type_distribution: td })
    const paperId = res.paper?.id
    if (paperId) {
      const qd = await getExamQuestions(paperId)
      selectedQuestions.value = (Array.isArray(qd) ? qd : []).map(pq => ({
        id: pq.question_detail?.id ?? pq.question, content: pq.question_detail?.content ?? '',
        type: pq.question_detail?.question_type ?? '', question_type: pq.question_detail?.question_type ?? '',
        options: pq.question_detail?.options ?? '',
        answer: pq.question_detail?.answer ?? '', difficulty: pq.question_detail?.difficulty ?? 1,
        score: Number(pq.score) || 5
      }))
      isEdit.value = true; editId.value = paperId
    }
    autoDialogVisible.value = false; calculateTotalScore()
    ElMessage.success(`智能组卷成功，已生成${res.question_count}道题目`)
  } catch { ElMessage.error('智能组卷失败') }
}

// ===== 预览 =====
function handlePreview() {
  if (!selectedQuestions.value.length) { ElMessage.warning('请先选择题目'); return }
  previewDialogVisible.value = true
}

// ===== 发布 =====
async function handlePublish() {
  if (!isEdit.value && !selectedQuestions.value.length) { ElMessage.warning('请先选择题目'); return }
  await examFormRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateExam(editId.value, { name: examForm.title, duration: Number(examForm.duration) || 60, target_class: examForm.classIds[0], total_score: Number(examForm.totalScore) || 100 })
      await publishPaper(editId.value)
    } else {
      await createExam({ name: examForm.title, description: examForm.description, duration: Number(examForm.duration) || 60, start_time: examForm.startTime, target_class: examForm.classIds[0], pass_score: Number(examForm.passScore) || 60, total_score: Number(examForm.totalScore) || 100, questions: selectedQuestions.value.map(q => ({ question_id: q.id, score: Number(q.score) || 5 })) })
    }
    ElMessage.success('发布成功'); examDialogVisible.value = false; fetchExamList()
  } catch (e) { ElMessage.error(e.message || '操作失败') }
  finally { submitLoading.value = false }
}

// ===== 辅助 =====
function parsedOptions(opts) {
  if (!opts) return {}
  if (typeof opts === 'object') return opts
  try { return JSON.parse(opts) } catch { return {} }
}
function getTypeName(type) {
  const m = { single: '单选题', multiple: '多选题', judge: '判断题', blank: '填空题', essay: '简答题',
    choice: '单选题', multiple_choice: '多选题', true_false: '判断题', fill_blank: '填空题' }
  return m[type] || type || ''
}
function getDifficultyName(d) { return ({ easy: '简单', medium: '中等', hard: '困难' })[d] || d }
function getDifficultyColor(d) { return ({ easy: 'success', medium: 'warning', hard: 'danger' })[d] || 'info' }
const disabledDate = (time) => time.getTime() < Date.now() - 8.64e7

onMounted(() => { fetchExamList(); fetchClassList() })
</script>

<style scoped>
.exam-list { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; color: var(--ink, #2a2a2a); }
.section-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 15px; color: var(--ink, #2a2a2a); }
.stats-row { margin-top: 16px; }
.stat-card { background: var(--canvas, #f8f4ee); border-radius: 8px; padding: 12px 16px; text-align: center; font-size: 13px; color: var(--muted, #6b655c); }
.stat-card strong { display: block; font-size: 20px; color: var(--primary, #d97757); margin-bottom: 2px; }
.preview-content { max-height: 600px; overflow-y: auto; }
.preview-question { margin-bottom: 24px; padding: 16px; background: var(--canvas, #f8f4ee); border-radius: 8px; }
.question-title { font-size: 15px; line-height: 1.7; }
.options { margin-left: 24px; margin-top: 8px; }
.option { padding: 4px 0; font-size: 14px; color: var(--muted, #6b655c); }
</style>
