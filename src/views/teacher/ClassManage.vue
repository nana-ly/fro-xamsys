<template>
  <div class="class-manage">
    <div class="page-header">
      <h2>班级管理</h2>
      <el-button type="primary" icon="Plus" @click="showAddClassDialog">
        创建班级
      </el-button>
    </div>

    <!-- 班级列表 -->
    <el-row :gutter="20">
      <el-col
          v-for="classItem in classList"
          :key="classItem.id"
          :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="class-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="class-name">{{ classItem.name }}</span>
              <el-dropdown @command="handleCommand">
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                        :command="{ action: 'edit', id: classItem.id }">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item
                        :command="{ action: 'delete', id: classItem.id }">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <div class="class-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>学生数：{{ classItem.student_count }}</span>
            </div>
            <div class="info-item">
              <el-icon><Document /></el-icon>
              <span>考试数：{{ classItem.exam_count }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>创建时间：{{ formatDate(classItem.created_at) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <el-button
                type="primary"
                size="small"
                @click="viewStudents(classItem.id)">
              查看学生
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="showAddStudentDialog(classItem.id)">
              添加学生
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建/编辑班级对话框 -->
    <el-dialog
        v-model="classDialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="resetClassForm">

      <el-form
          ref="classFormRef"
          :model="classForm"
          :rules="classRules"
          label-width="100px">

        <el-form-item label="班级名称" prop="name">
          <el-input
              v-model="classForm.name"
              placeholder="例如：2023级计算机1班" />
        </el-form-item>

        <el-form-item label="班级描述" prop="description">
          <el-input
              v-model="classForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入班级描述（选填）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleClassSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看学生对话框 -->
    <el-dialog
        v-model="studentListDialogVisible"
        title="学生列表"
        width="70%">

      <el-table :data="studentList" v-loading="studentLoading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="学号" />
        <el-table-column prop="real_name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="join_time" label="加入时间">
          <template #default="scope">
            {{ formatDate(scope.row.join_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
                type="danger"
                size="small"
                @click="removeStudent(scope.row.student)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加学生对话框 -->
    <el-dialog
        v-model="addStudentDialogVisible"
        title="添加学生"
        width="600px">

      <el-form>
        <el-form-item label="添加方式">
          <el-radio-group v-model="addStudentType">
            <el-radio label="search">搜索添加</el-radio>
            <el-radio label="batch">批量导入</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 搜索添加 -->
        <template v-if="addStudentType === 'search'">
          <el-form-item label="学号/姓名">
            <el-input
                v-model="studentSearchKeyword"
                placeholder="输入学号或姓名搜索"
                @keyup.enter="searchStudents">
              <template #append>
                <el-button icon="Search" @click="searchStudents" />
              </template>
            </el-input>
          </el-form-item>

          <el-table
              :data="searchResults"
              @selection-change="handleStudentSelection"
              max-height="300">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="username" label="学号" />
            <el-table-column prop="real_name" label="姓名" />
            <el-table-column prop="email" label="邮箱" />
          </el-table>
        </template>

        <!-- 批量导入 -->
        <template v-else>
          <el-form-item label="学号列表">
            <el-input
                v-model="batchStudentIds"
                type="textarea"
                :rows="8"
                placeholder="每行一个学号，例如：&#10;2021001&#10;2021002&#10;2021003" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="addStudentDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="addStudentLoading"
            @click="handleAddStudents">
          确定添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled, User, Document, Calendar } from '@element-plus/icons-vue'
import {
  getClassList,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentsToClass,
  removeStudentFromClass,
  searchStudents as searchStudentsAPI
} from '@/api/teacher'

// 数据定义
const classList = ref([])
const classDialogVisible = ref(false)
const studentListDialogVisible = ref(false)
const addStudentDialogVisible = ref(false)
const dialogTitle = ref('创建班级')
const submitLoading = ref(false)
const studentLoading = ref(false)
const addStudentLoading = ref(false)
const classFormRef = ref(null)
const editingClassId = ref(null)
const currentClassId = ref(null)
const studentList = ref([])
const searchResults = ref([])
const selectedStudents = ref([])
const addStudentType = ref('search')
const studentSearchKeyword = ref('')
const batchStudentIds = ref('')

// 班级表单
const classForm = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const classRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '班级名称长度2-50位', trigger: 'blur' }
  ]
}

// 获取班级列表
const fetchClassList = async () => {
  try {
    const res = await getClassList()
    classList.value = res.results || res
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  }
}

// 显示创建班级对话框
const showAddClassDialog = () => {
  dialogTitle.value = '创建班级'
  editingClassId.value = null
  resetClassForm()
  classDialogVisible.value = true
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command.action === 'edit') {
    handleEdit(command.id)
  } else if (command.action === 'delete') {
    handleDelete(command.id)
  }
}

// 编辑班级
const handleEdit = async (id) => {
  dialogTitle.value = '编辑班级'
  editingClassId.value = id

  const classItem = classList.value.find(c => c.id === id)
  if (classItem) {
    classForm.name = classItem.name
    classForm.description = classItem.description
  }

  classDialogVisible.value = true
}

// 删除班级
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该班级吗？班级内的学生数据将被保留', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteClass(id)
    ElMessage.success('删除成功')
    fetchClassList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交班级表单
const handleClassSubmit = async () => {
  await classFormRef.value.validate()

  submitLoading.value = true
  try {
    if (editingClassId.value) {
      await updateClass(editingClassId.value, classForm)
      ElMessage.success('更新成功')
    } else {
      await createClass(classForm)
      ElMessage.success('创建成功')
    }

    classDialogVisible.value = false
    fetchClassList()

  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置班级表单
const resetClassForm = () => {
  classForm.name = ''
  classForm.description = ''
  if (classFormRef.value) {
    classFormRef.value.clearValidate()
  }
}

// 查看学生
const viewStudents = async (classId) => {
  currentClassId.value = classId
  studentListDialogVisible.value = true

  studentLoading.value = true
  try {
    const res = await getClassStudents(classId)
    studentList.value = res.results || res
  } catch (error) {
    ElMessage.error('获取学生列表失败')
  } finally {
    studentLoading.value = false
  }
}

// 显示添加学生对话框
const showAddStudentDialog = (classId) => {
  currentClassId.value = classId
  addStudentType.value = 'search'
  studentSearchKeyword.value = ''
  batchStudentIds.value = ''
  searchResults.value = []
  selectedStudents.value = []
  addStudentDialogVisible.value = true
}

// 搜索学生
const searchStudents = async () => {
  if (!studentSearchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    const res = await searchStudentsAPI({
      keyword: studentSearchKeyword.value,
      exclude_class: currentClassId.value
    })
    searchResults.value = res.results || res
  } catch (error) {
    ElMessage.error('搜索失败')
  }
}

// 处理学生选择
const handleStudentSelection = (selection) => {
  selectedStudents.value = selection
}

// 添加学生
const handleAddStudents = async () => {
  let studentIds = []

  if (addStudentType.value === 'search') {
    if (selectedStudents.value.length === 0) {
      ElMessage.warning('请选择要添加的学生')
      return
    }
    studentIds = selectedStudents.value.map(s => s.id)
  } else {
    const ids = batchStudentIds.value.trim().split('\n').filter(id => id.trim())
    if (ids.length === 0) {
      ElMessage.warning('请输入学号')
      return
    }
    studentIds = ids
  }

  addStudentLoading.value = true
  try {
    await addStudentsToClass(currentClassId.value, { student_ids: studentIds })
    ElMessage.success(`成功添加${studentIds.length}名学生`)
    addStudentDialogVisible.value = false
    fetchClassList()
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  } finally {
    addStudentLoading.value = false
  }
}

// 移除学生
const removeStudent = async (studentId) => {
  try {
    await ElMessageBox.confirm('确定将该学生移出班级吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await removeStudentFromClass(currentClassId.value, studentId)
    ElMessage.success('移除成功')
    viewStudents(currentClassId.value)
    fetchClassList()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 页面加载
onMounted(() => {
  fetchClassList()
})
</script>

<style scoped>
.class-manage {
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

.class-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.class-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.more-icon {
  cursor: pointer;
  font-size: 20px;
}

.class-info {
  margin: 15px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
}

.info-item .el-icon {
  margin-right: 8px;
  color: #0ea5e9;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}

.card-actions .el-button {
  flex: 1;
  margin: 0 5px;
}

.card-actions .el-button:first-child {
  margin-left: 0;
}

.card-actions .el-button:last-child {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .class-card {
    margin-bottom: 15px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .el-button {
    margin: 5px 0 !important;
    width: 100%;
  }
}
</style>