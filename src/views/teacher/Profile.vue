<template>
  <div class="profile-page">
    <!-- 顶部操作栏 -->
    <div class="actions-bar">
      <el-button icon="Edit" @click="openEditDialog">编辑资料</el-button>
      <el-button icon="Lock" @click="showPasswordDialog = true">修改密码</el-button>
    </div>

    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <div class="profile-hero">
        <div class="avatar-wrapper">
          <div class="avatar-circle">{{ (form.real_name || form.username || '教')[0] }}</div>
        </div>
        <h2 class="profile-name">{{ form.real_name || form.username || '教师' }}</h2>
        <el-tag type="primary" effect="plain" round>教师</el-tag>
        <div class="contact-row">
          <span v-if="form.phone" class="contact-item">
            <el-icon><Phone /></el-icon> {{ form.phone }}
          </span>
          <span v-if="form.email" class="contact-item">
            <el-icon><Message /></el-icon> {{ form.email }}
          </span>
          <span class="contact-item">
            <el-icon><Clock /></el-icon> {{ form.created_at || '-' }}
          </span>
        </div>
      </div>

      <!-- 数据统计条 -->
      <el-divider />
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ stats.classCount }}</span>
          <span class="stat-label">创建班级</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.examCount }}</span>
          <span class="stat-label">创建试卷</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.questionCount }}</span>
          <span class="stat-label">题库题目</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.studentCount }}</span>
          <span class="stat-label">学生总数</span>
        </div>
      </div>
    </el-card>

    <!-- 功能快捷入口 -->
    <el-row :gutter="16" class="quick-links">
      <el-col :xs="12" :sm="6" v-for="link in quickLinks" :key="link.path">
        <el-card class="link-card" shadow="hover" @click="$router.push(link.path)">
          <div class="link-icon" :style="{ background: link.bg }">
            <el-icon :size="24"><component :is="link.icon" /></el-icon>
          </div>
          <span class="link-text">{{ link.label }}</span>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 编辑资料弹窗 ========== -->
    <el-dialog v-model="showEditDialog" title="编辑个人信息" width="440px" destroy-on-close>
      <el-form :model="editForm" label-width="80px" @submit.prevent="handleSaveProfile">
        <el-form-item label="用户名">
          <el-input :model-value="form.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleSaveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- ========== 修改密码弹窗 ========== -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="440px" destroy-on-close>
      <el-form :model="pwdForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="pwdForm.old_password" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdForm.new_password" type="password" show-password placeholder="至少6位新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="pwdForm.confirm_password" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Message, Clock, Collection, Document, Tickets, UserFilled } from '@element-plus/icons-vue'
import { getCurrentUser, getClassList, getExamList, getQuestionList } from '@/api/teacher'
import request from '@/utils/request'

const router = useRouter()

const form = reactive({
  username: '',
  real_name: '',
  phone: '',
  email: '',
  created_at: ''
})

const stats = reactive({
  classCount: 0,
  examCount: 0,
  questionCount: 0,
  studentCount: 0
})

// 快捷入口
const quickLinks = [
  { path: '/teacher/question-bank', label: '题库管理', icon: Collection, bg: 'rgba(64,158,255,0.1)' },
  { path: '/teacher/exam-list', label: '试卷管理', icon: Document, bg: 'rgba(103,194,58,0.1)' },
  { path: '/teacher/class-manage', label: '班级管理', icon: Tickets, bg: 'rgba(230,162,60,0.1)' },
  { path: '/teacher/score-view', label: '成绩查看', icon: UserFilled, bg: 'rgba(217,119,87,0.1)' }
]

// 编辑资料
const showEditDialog = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  real_name: '',
  phone: '',
  email: ''
})

// 修改密码
const showPasswordDialog = ref(false)
const pwdLoading = ref(false)
const pwdForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 获取基础用户信息
async function fetchUserInfo() {
  try {
    const res = await getCurrentUser()
    const user = res.user || res
    form.username = user.username || ''
    form.real_name = user.real_name || ''
    form.phone = user.phone || ''
    form.email = user.email || ''
    form.created_at = formatDate(user.created_at || user.date_joined)
  } catch {
    const info = JSON.parse(localStorage.getItem('teacher_userInfo') || localStorage.getItem('userInfo') || '{}')
    form.username = info.username || ''
    form.real_name = info.real_name || ''
    form.phone = info.phone || ''
    form.email = info.email || ''
  }
}

// 获取统计数据
async function fetchStats() {
  try {
    const [classRes, examRes, questionRes] = await Promise.allSettled([
      getClassList(),
      getExamList({ page_size: 1 }),
      getQuestionList({ page_size: 1 })
    ])

    if (classRes.status === 'fulfilled') {
      const classes = classRes.value.results || classRes.value
      stats.classCount = Array.isArray(classes) ? classes.length : 0
    }

    if (examRes.status === 'fulfilled') {
      const exams = examRes.value.results || examRes.value
      stats.examCount = examRes.value.count ?? (Array.isArray(exams) ? exams.length : 0)
    }

    if (questionRes.status === 'fulfilled') {
      const questions = questionRes.value.results || questionRes.value
      stats.questionCount = questionRes.value.count ?? (Array.isArray(questions) ? questions.length : 0)
    }

    // 学生总数 = 所有班级学生数之和（并发请求）
    if (classRes.status === 'fulfilled') {
      const classes = classRes.value.results || classRes.value
      if (Array.isArray(classes) && classes.length > 0) {
        const stuResults = await Promise.allSettled(
          classes.map(cls => request({ url: `/users/classes/${cls.id}/students/`, method: 'get' }))
        )
        stats.studentCount = stuResults.reduce((sum, r) => {
          if (r.status === 'fulfilled') {
            const students = r.value.results || r.value
            return sum + (Array.isArray(students) ? students.length : 0)
          }
          return sum
        }, 0)
      }
    }
  } catch {
    // 统计失败不影响主界面
  }
}

// 保存资料
async function handleSaveProfile() {
  editLoading.value = true
  try {
    await request({
      url: '/users/auth/me_update/',
      method: 'patch',
      data: {
        real_name: editForm.real_name,
        phone: editForm.phone || null,
        email: editForm.email || null
      }
    })
    form.real_name = editForm.real_name
    form.phone = editForm.phone
    form.email = editForm.email
    // 更新 localStorage
    const key = localStorage.getItem('teacher_userInfo') ? 'teacher_userInfo' : 'userInfo'
    const info = JSON.parse(localStorage.getItem(key) || '{}')
    info.real_name = editForm.real_name
    info.phone = editForm.phone
    info.email = editForm.email
    localStorage.setItem(key, JSON.stringify(info))
    localStorage.setItem('teacher_userName', editForm.real_name || form.username)
    ElMessage.success('保存成功')
    showEditDialog.value = false
  } catch (err) {
    const msg = err.response?.data?.error || '保存失败'
    ElMessage.error(msg)
  } finally {
    editLoading.value = false
  }
}

// 修改密码
async function handleChangePassword() {
  if (!pwdForm.old_password || !pwdForm.new_password) {
    ElMessage.warning('请填写完整密码信息')
    return
  }
  if (pwdForm.new_password !== pwdForm.confirm_password) {
    ElMessage.warning('两次新密码不一致')
    return
  }
  if (pwdForm.new_password.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  pwdLoading.value = true
  try {
    await request({
      url: '/student/change_password/',
      method: 'post',
      data: {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
        confirm_password: pwdForm.confirm_password
      }
    })
    ElMessage.success('密码修改成功，即将跳转到登录页...')
    pwdForm.old_password = ''
    pwdForm.new_password = ''
    pwdForm.confirm_password = ''
    showPasswordDialog.value = false
    setTimeout(() => {
      localStorage.clear()
      sessionStorage.clear()
      router.push('/login?role=teacher')
    }, 1500)
  } catch (err) {
    const msg = err.response?.data?.error || '修改失败'
    ElMessage.error(msg)
  } finally {
    pwdLoading.value = false
  }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN')
}

// 打开编辑弹窗时同步数据
function openEditDialog() {
  editForm.real_name = form.real_name
  editForm.phone = form.phone
  editForm.email = form.email
  showEditDialog.value = true
}

onMounted(async () => {
  await fetchUserInfo()
  fetchStats() // 异步加载，不阻塞
})
</script>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
}

.actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

/* ===== 个人信息卡片 ===== */
.profile-card {
  margin-bottom: 20px;
  text-align: center;
}

.profile-hero {
  padding: 10px 0;
}

.avatar-wrapper {
  margin-bottom: 12px;
}

.avatar-circle {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d97757, #c46a4a);
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(217,119,87,0.25);
}

.profile-name {
  margin: 0 0 6px;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.contact-row {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.contact-item {
  font-size: 13px;
  color: #888;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ===== 统计条 ===== */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 36px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #d97757;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* ===== 快捷入口 ===== */
.quick-links {
  margin-bottom: 20px;
}

.link-card {
  cursor: pointer;
  text-align: center;
  padding: 8px 0;
  transition: transform 0.2s;
}

.link-card:hover {
  transform: translateY(-3px);
}

.link-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.link-text {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}
</style>
