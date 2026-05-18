<template>
  <div class="login-container" :class="roleTab === 'student' ? 'bg-student' : 'bg-teacher'">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="login-logo">{{ roleTab === 'student' ? '📚' : '🏫' }}</div>
        <h2>智能考试平台</h2>
        <p>{{ roleTab === 'student' ? '学生登录' : '教师登录' }}</p>
      </div>

      <div class="login-card">
        <!-- 角色选择标签 -->
        <div class="role-tabs">
          <div
            :class="['role-tab', { active: roleTab === 'student' }]"
            @click="roleTab = 'student'">
            👨‍🎓 学生登录
          </div>
          <div
            :class="['role-tab', { active: roleTab === 'teacher' }]"
            @click="roleTab = 'teacher'">
            👨‍🏫 教师登录
          </div>
        </div>

        <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="80px">

          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User">
            </el-input>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password>
            </el-input>
          </el-form-item>

          <!-- 记住密码 -->
          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
                type="primary"
                :loading="loading"
                @click="handleLogin"
                style="width: 100%">
              登 录
            </el-button>
          </el-form-item>

          <!-- 注册链接 -->
          <el-form-item>
            <div class="login-footer">
              <span>还没有账号？</span>
              <el-link type="primary" @click="goRegister">立即注册</el-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/teacher'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const roleTab = ref('teacher')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await loginFormRef.value.validate()

  loading.value = true
  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    const user = res.user

    // 保存 token（标记已登录）
    localStorage.setItem('token', res.token || res.csrfToken || 'true')
    localStorage.setItem('csrfToken', res.csrfToken || '')

    // 保存用户信息
    localStorage.setItem('userInfo', JSON.stringify(user))
    localStorage.setItem('userRole', user.role)
    localStorage.setItem('userName', user.real_name || user.username)

    // 记住密码
    if (loginForm.remember) {
      localStorage.setItem('savedUsername', loginForm.username)
      localStorage.setItem('savedPassword', loginForm.password)
    } else {
      localStorage.removeItem('savedUsername')
      localStorage.removeItem('savedPassword')
    }

    ElMessage.success(`登录成功，欢迎${user.real_name || user.username}`)

    // 根据角色跳转
    if (user.role === 'teacher') {
      router.push('/teacher/question-bank')
    } else {
      router.push('/student/home')
    }

  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}

const loadSavedPassword = () => {
  const savedUsername = localStorage.getItem('savedUsername')
  const savedPassword = localStorage.getItem('savedPassword')
  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername
    loginForm.password = savedPassword
    loginForm.remember = true
  }
}

loadSavedPassword()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background 0.5s ease;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.bg-teacher,
.bg-student {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  font-size: 2.4em;
  margin-bottom: 12px;
  line-height: 1;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Card */
.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  animation: cardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Role tabs */
.role-tabs {
  display: flex;
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  gap: 4px;
}

.role-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.role-tab:hover {
  color: #334155;
  background: rgba(255, 255, 255, 0.7);
}

.role-tab.active {
  color: #3b82f6;
  font-weight: 600;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.09);
}

/* Element Plus overrides */
:deep(.el-form-item__label) {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  transition: border-color 0.2s, box-shadow 0.2s;
  padding: 2px 12px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}

:deep(.el-input__inner) {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  font-size: 14px;
  color: #1e293b;
  height: 38px;
}

:deep(.el-input__inner::placeholder) {
  color: #94a3b8;
}

:deep(.el-checkbox__label) {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  font-size: 13px;
  color: #64748b;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.el-button--primary) {
  background: #3b82f6;
  border-color: #3b82f6;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  height: auto;
  letter-spacing: 0.2px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.el-button--primary:hover) {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.38);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
  box-shadow: none;
}

:deep(.el-link--primary) {
  color: #3b82f6;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
}

:deep(.el-link--primary:hover) {
  color: #2563eb;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

/* Footer */
.login-footer {
  width: 100%;
  text-align: center;
}

.login-footer span {
  color: #94a3b8;
  font-size: 13px;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .login-wrapper { max-width: 100%; }
  .login-card { padding: 24px 20px; }
  .login-header h2 { font-size: 20px; }
}
</style>
