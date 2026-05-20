<template>
  <div class="exam-list">
    <div class="page-header">
      <h2>试卷管理</h2>
      <el-button type="primary" icon="Plus" @click="createExam">
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
          <template #default="scope">
            {{ scope.row.duration }} 分钟
          </template>
        </el-table-column>

        <el-table-column label="开始时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.published_at || scope.row.created_at, 'YYYY-MM-DD HH:mm') || '未发布' }}
          </template>
        </el-table-column>

        <el-table-column label="结束时间" width="160">
          <template #default="scope">
            {{ calcEndTime(scope.row) || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">
              {{ getStatusName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                icon="Edit"
                @click="editExam(scope.row)">
              编辑
            </el-button>
            <el-button
                type="danger"
                size="small"
                icon="Delete"
                @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchExamList"
          @current-change="fetchExamList"
          style="margin-top: 20px; justify-content: center" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExamList, deleteExam } from '@/api/teacher'
import { formatDate } from '@/utils/common'

const router = useRouter()
const loading = ref(false)
const examList = ref([])

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 计算结束时间 = 发布 + 时长
function calcEndTime(exam) {
  const start = exam.published_at || exam.created_at
  if (!start) return null
  const d = new Date(start)
  d.setMinutes(d.getMinutes() + (exam.duration || 0))
  return formatDate(d.toISOString(), 'YYYY-MM-DD HH:mm')
}

const fetchExamList = async () => {
  loading.value = true
  try {
    const res = await getExamList({
      page: pagination.current,
      page_size: pagination.size
    })
    examList.value = (res.results || []).map(p => ({
      ...p,
      title: p.name || p.title
    }))
    pagination.total = res.count
  } catch (error) {
    ElMessage.error('获取试卷列表失败')
  } finally {
    loading.value = false
  }
}

const createExam = () => {
  router.push('/teacher/create-exam')
}

const editExam = (row) => {
  router.push(`/teacher/create-exam?id=${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除试卷「${row.title}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteExam(row.id)
    ElMessage.success('删除成功')
    fetchExamList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (exam) => {
  if (!exam.published_at) return 'info'  // 未发布
  const start = new Date(exam.published_at).getTime()
  const end = start + (exam.duration || 0) * 60 * 1000
  if (Date.now() > end) return 'danger'  // 已结束
  return 'success'  // 进行中
}

const getStatusName = (exam) => {
  if (!exam.published_at) return '未发布'
  const start = new Date(exam.published_at).getTime()
  const end = start + (exam.duration || 0) * 60 * 1000
  if (Date.now() > end) return '已结束'
  return '进行中'
}

onMounted(() => {
  fetchExamList()
})
</script>

<style scoped>
.exam-list {
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
</style>