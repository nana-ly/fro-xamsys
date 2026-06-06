<template>
  <div class="profile-page">
    <div class="container">

      <!-- 操作按钮 -->
      <div class="actions-bar">
        <button class="btn btn-outline" @click="showEditDialog = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          编辑资料
        </button>
        <button class="btn btn-outline" @click="showPasswordDialog = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          修改密码
        </button>
      </div>

      <!-- 个人信息卡片 -->
      <div class="profile-card card">
        <div class="profile-avatar">
          <div class="avatar-circle">{{ userName.charAt(0) }}</div>
          <h2>{{ displayName }}</h2>
          <p class="user-role">学生</p>
          <div class="contact-info">
            <span v-if="profile.phone" class="contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {{ profile.phone }}
            </span>
            <span v-if="profile.email" class="contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {{ profile.email }}
            </span>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalExams }}</span>
            <span class="stat-label">参加考试</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.avgScore }}</span>
            <span class="stat-label">平均分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.wrongCount }}</span>
            <span class="stat-label">错题数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.studyDays }}</span>
            <span class="stat-label">学习天数</span>
          </div>
        </div>
      </div>

      <!-- 学习统计 -->
      <div class="stats-section">
        <h3>学习统计</h3>
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.completedExams }}</span>
              <span class="stat-text">已完成考试</span>
            </div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressExam + '%' }"></div>
              </div>
              <span class="progress-text">{{ progressExam }}%</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5db872" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.masteredQuestions }}</span>
              <span class="stat-text">已掌握错题</span>
            </div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill green" :style="{ width: progressMastered + '%' }"></div>
              </div>
              <span class="progress-text">{{ progressMastered }}%</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.correctRate }}%</span>
              <span class="stat-text">正确率</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.totalDuration || '0小时0分钟' }}</span>
              <span class="stat-text">学习时长</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习活跃度日历热力图 -->
      <StudyHeatmap
        :year="heatmapYear"
        :month="heatmapMonth"
        @prev="prevHeatmapMonth"
        @next="nextHeatmapMonth"
      />

    </div>

    <!-- ========== 编辑资料弹窗 ========== -->
    <Teleport to="body">
      <div v-if="showEditDialog" class="dialog-overlay" @click.self="showEditDialog = false">
        <div class="dialog-card">
          <div class="dialog-header">
            <h3>编辑个人信息</h3>
            <button class="dialog-close" @click="showEditDialog = false">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" :value="profile.username" disabled class="input-disabled" />
            </div>
            <div class="form-group">
              <label>真实姓名 <span class="required">*</span></label>
              <input v-model="editForm.real_name" type="text" placeholder="请输入真实姓名" />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input v-model="editForm.phone" type="text" placeholder="请输入手机号（如 13800138000）" />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="editForm.email" type="email" placeholder="请输入邮箱" />
            </div>
            <div v-if="editError" class="form-error">{{ editError }}</div>
            <div v-if="editSuccess" class="form-success">{{ editSuccess }}</div>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-cancel" @click="showEditDialog = false">取消</button>
            <button class="btn btn-primary" @click="handleSaveProfile" :disabled="editLoading">
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========== 修改密码弹窗 ========== -->
    <Teleport to="body">
      <div v-if="showPasswordDialog" class="dialog-overlay" @click.self="showPasswordDialog = false">
        <div class="dialog-card">
          <div class="dialog-header">
            <h3>修改密码</h3>
            <button class="dialog-close" @click="showPasswordDialog = false">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>旧密码 <span class="required">*</span></label>
              <input v-model="passwordForm.old_password" type="password" placeholder="请输入旧密码" />
            </div>
            <div class="form-group">
              <label>新密码 <span class="required">*</span></label>
              <input v-model="passwordForm.new_password" type="password" placeholder="至少6位新密码" />
            </div>
            <div class="form-group">
              <label>确认新密码 <span class="required">*</span></label>
              <input v-model="passwordForm.confirm_password" type="password" placeholder="再次输入新密码" />
            </div>
            <div v-if="passwordError" class="form-error">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="form-success">{{ passwordSuccess }}</div>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-cancel" @click="showPasswordDialog = false">取消</button>
            <button class="btn btn-primary" @click="handleChangePassword" :disabled="passwordLoading">
              {{ passwordLoading ? '提交中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudyHeatmap from '@/components/StudyHeatmap.vue'
import { updateProfile, changePassword, getProfile } from '@/api/student'
import request from '@/utils/request'

const router = useRouter()
const userName = ref(localStorage.getItem('student_userName') || localStorage.getItem('userName') || '同学')
const loading = ref(true)

const profile = ref({
  id: null,
  username: '',
  real_name: '',
  phone: '',
  email: ''
})

const stats = ref({
  totalExams: 0,
  avgScore: 0,
  wrongCount: 0,
  studyDays: 0,
  completedExams: 0,
  masteredQuestions: 0,
  correctRate: 0,
  totalDuration: '',
})

// 热力图月份切换
const now = new Date()
const heatmapYear = ref(now.getFullYear())
const heatmapMonth = ref(now.getMonth() + 1)

function prevHeatmapMonth() {
  if (heatmapMonth.value === 1) {
    heatmapYear.value--
    heatmapMonth.value = 12
  } else {
    heatmapMonth.value--
  }
}

function nextHeatmapMonth() {
  const n = new Date()
  if (heatmapYear.value === n.getFullYear() && heatmapMonth.value === n.getMonth() + 1) return
  if (heatmapMonth.value === 12) {
    heatmapYear.value++
    heatmapMonth.value = 1
  } else {
    heatmapMonth.value++
  }
}

const displayName = computed(() => profile.value.real_name || profile.value.username || '同学')

// ---- 编辑资料 ----
const showEditDialog = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editSuccess = ref('')

const editForm = ref({
  real_name: '',
  phone: '',
  email: ''
})

// ---- 修改密码 ----
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const progressExam = computed(() => {
  if (stats.value.totalExams === 0) return 0
  return Math.round((stats.value.completedExams / stats.value.totalExams) * 100)
})

const progressMastered = computed(() => {
  if (stats.value.wrongCount === 0) return 100
  return Math.round((stats.value.masteredQuestions / stats.value.wrongCount) * 100)
})

function fmtDurationFromHours(hours) {
  const totalSeconds = Math.round(hours * 3600)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}小时${m}分钟`
  if (h > 0) return `${h}小时`
  if (m > 0) return `${m}分钟`
  return '0小时0分钟'
}

async function fetchProfileData() {
  try {
    const res = await getProfile()
    const data = res.data || res
    profile.value = {
      id: data.id,
      username: data.username || '',
      real_name: data.real_name || '',
      phone: data.phone || '',
      email: data.email || ''
    }
    stats.value = {
      totalExams: data.total_exams || 0,
      avgScore: data.avg_score || 0,
      wrongCount: data.total_wrong || 0,
      studyDays: data.study_days || 0,
      completedExams: data.total_exams || 0,
      masteredQuestions: data.mastered_wrong || 0,
      correctRate: data.correct_rate || 0,
      totalDuration: fmtDurationFromHours(data.study_hours || 0),
    }
  } catch {
    // keep default zeros on error
  } finally {
    loading.value = false
  }
}

function openEditDialog() {
  editForm.value = {
    real_name: profile.value.real_name || '',
    phone: profile.value.phone || '',
    email: profile.value.email || ''
  }
  editError.value = ''
  editSuccess.value = ''
  showEditDialog.value = true
}

async function handleSaveProfile() {
  editError.value = ''
  editSuccess.value = ''
  editLoading.value = true

  try {
    const res = await updateProfile({
      real_name: editForm.value.real_name,
      phone: editForm.value.phone,
      email: editForm.value.email
    })
    const data = res.data || res
    profile.value.real_name = data.real_name || editForm.value.real_name
    profile.value.phone = data.phone || editForm.value.phone
    profile.value.email = data.email || editForm.value.email
    localStorage.setItem('student_userName', profile.value.real_name || profile.value.username)
    localStorage.setItem('userName', profile.value.real_name || profile.value.username)
    editSuccess.value = '保存成功！'
    setTimeout(() => {
      showEditDialog.value = false
      editSuccess.value = ''
    }, 1500)
  } catch (error) {
    const data = error.response?.data
    if (data) {
      editError.value = typeof data === 'string' ? data : (data.error || '保存失败')
    } else {
      editError.value = '网络错误，请稍后重试'
    }
  } finally {
    editLoading.value = false
  }
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  passwordLoading.value = true

  try {
    await changePassword({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password,
      confirm_password: passwordForm.value.confirm_password
    })
    passwordSuccess.value = '密码修改成功，即将跳转到登录页...'
    passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
    setTimeout(() => {
      showPasswordDialog.value = false
      passwordSuccess.value = ''
      localStorage.clear()
      sessionStorage.clear()
      router.push('/login?role=student')
    }, 2000)
  } catch (error) {
    const data = error.response?.data
    if (data) {
      passwordError.value = typeof data === 'string' ? data : (data.error || '修改失败')
    } else {
      passwordError.value = '网络错误，请稍后重试'
    }
  } finally {
    passwordLoading.value = false
  }
}

// 监听编辑弹窗打开，同步表单数据
watch(showEditDialog, (val) => {
  if (val) {
    editForm.value = {
      real_name: profile.value.real_name || '',
      phone: profile.value.phone || '',
      email: profile.value.email || ''
    }
    editError.value = ''
    editSuccess.value = ''
  }
})

onMounted(() => {
  fetchProfileData()
})
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.container { display: flex; flex-direction: column; gap: 20px; }

/* ===== 操作按钮栏 ===== */
.actions-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.btn-outline {
  background: #fff;
  color: var(--primary, #d97757);
  border: 1px solid var(--primary, #d97757);
}

.btn-outline:hover {
  background: var(--primary, #d97757);
  color: #fff;
}

/* ===== 个人信息卡片 ===== */
.profile-card {
  padding: 30px;
  text-align: center;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #d97757) 0%, var(--primary-active, #c46a4a) 100%);
  color: white;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.2);
}

.profile-avatar h2 { margin: 0 0 4px; font-size: 1.3em; color: var(--ink, #2a2a2a); }
.user-role { margin: 0 0 8px; color: var(--muted, #6b655c); font-size: 13px; }

.contact-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.contact-item {
  font-size: 13px;
  color: var(--muted, #6b655c);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--hairline, #e3dbd0);
}

.profile-stats .stat-item { display: flex; flex-direction: column; align-items: center; }
.profile-stats .stat-value { font-size: 1.4em; font-weight: 700; color: var(--primary, #d97757); }
.profile-stats .stat-label { font-size: 12px; color: var(--muted, #6b655c); margin-top: 4px; }

/* ===== 学习统计 ===== */
.stats-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.05em;
  color: var(--ink, #2a2a2a);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-num {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--ink, #2a2a2a);
}

.stat-text {
  font-size: 12px;
  color: var(--muted, #6b655c);
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--hairline, #e3dbd0);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary, #d97757);
  border-radius: 3px;
  transition: width 0.6s;
}

.progress-fill.green { background: #5db872; }

.progress-fill + .progress-text {
  font-size: 11px;
  color: var(--muted-soft, #9f988e);
  min-width: 32px;
  text-align: right;
}

/* ===== 弹窗 ===== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-card {
  background: #fff;
  border-radius: 14px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px 0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.05em;
  color: var(--ink, #2a2a2a);
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--muted, #6b655c);
  cursor: pointer;
  line-height: 1;
}

.dialog-body {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dialog-footer {
  padding: 0 24px 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.required { color: #ef4444; }

.form-group input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  color: #1e293b;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: var(--primary, #d97757);
  box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.12);
}

.input-disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.form-error {
  color: #dc2626;
  font-size: 13px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.form-success {
  color: #16a34a;
  font-size: 13px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: var(--primary, #d97757);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-active, #c46a4a);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-stats { gap: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .dialog-card { width: 95%; }
}
</style>