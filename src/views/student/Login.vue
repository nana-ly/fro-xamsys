<template>
  <div class="login-page" :class="role === 'student' ? 'theme-student' : 'theme-teacher'">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="login-header">
        <div class="login-logo">{{ role === 'student' ? '📚' : '🏫' }}</div>
        <h1>智能考试平台</h1>
        <p class="login-subtitle">{{ role === 'student' ? '学生端 · 知识学习与考试' : '教师端 · 题库管理与教学' }}</p>
      </div>

      <div class="login-card card">
        <!-- ===== 一级：角色选择 ===== -->
        <div class="role-selector">
          <div
            :class="['role-card', { active: role === 'student' }]"
            @click="switchRole('student')">
            <div class="role-icon">👨‍🎓</div>
            <div class="role-label">学生端</div>
            <div class="role-desc">参加考试 · 错题复习</div>
          </div>
          <div
            :class="['role-card', { active: role === 'teacher' }]"
            @click="switchRole('teacher')">
            <div class="role-icon">👨‍🏫</div>
            <div class="role-label">教师端</div>
            <div class="role-desc">题库管理 · 班级管理</div>
          </div>
        </div>

        <!-- ===== 二级：登录/注册切换 ===== -->
        <div class="login-tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'login' }]"
            @click="activeTab = 'login'">
            登录
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'register' }]"
            @click="activeTab = 'register'">
            注册{{ role === 'student' ? '学生' : '教师' }}账号
          </button>
        </div>

        <!-- ===== 登录表单 ===== -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
          <div class="role-badge">
            {{ role === 'student' ? '👨‍🎓 学生登录' : '👨‍🏫 教师登录' }}
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          <div class="form-error" v-if="loginError">{{ loginError }}</div>
          <button type="submit" class="btn btn-block submit-btn" :disabled="loginLoading">
            {{ loginLoading ? '登录中...' : `${role === 'student' ? '学生' : '教师'}登录` }}
          </button>
          <div class="form-tip">
            <span>测试账号：student / student123</span>
          </div>
        </form>

        <!-- ===== 注册表单 ===== -->
        <form v-else @submit.prevent="handleRegister" class="login-form">
          <div class="role-badge">
            {{ role === 'student' ? '👨‍🎓 注册学生账号' : '👨‍🏫 注册教师账号' }}
          </div>
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <input
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-group">
            <label>真实姓名</label>
            <input
              v-model="registerForm.real_name"
              type="text"
              placeholder="请输入真实姓名"
            />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input
              v-model="registerForm.phone"
              type="text"
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="请输入邮箱"
            />
          </div>
          <div class="form-group">
            <label>密码 <span class="required">*</span></label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="至少6位密码"
              required
            />
          </div>
          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input
              v-model="registerForm.password_confirm"
              type="password"
              placeholder="再次输入密码"
              required
            />
          </div>
          <div class="form-error" v-if="registerError">{{ registerError }}</div>
          <div class="form-success" v-if="registerSuccess">{{ registerSuccess }}</div>
          <button type="submit" class="btn btn-block submit-btn" :disabled="registerLoading">
            {{ registerLoading ? '注册中...' : `注册${role === 'student' ? '学生' : '教师'}账号` }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/student'

const router = useRouter()
const role = ref('student')
const activeTab = ref('login')

const loginLoading = ref(false)
const loginError = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerLoading = ref(false)
const registerError = ref('')
const registerSuccess = ref('')

const registerForm = reactive({
  username: '',
  real_name: '',
  phone: '',
  email: '',
  password: '',
  password_confirm: ''
})

function switchRole(r) {
  role.value = r
  loginError.value = ''
  registerError.value = ''
  registerSuccess.value = ''
}

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true

  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 兼容两种响应结构：{ user: {...} } 或直接返回 user 对象
    const data = res.data || res
    const user = data.user || data

    console.log('登录响应:', { res, data, user })

    if (user && user.username) {
      localStorage.setItem('token', data.token || data.csrfToken || 'true')
      localStorage.setItem('csrfToken', data.csrfToken || '')
      localStorage.setItem('userRole', user.role || 'student')
      localStorage.setItem('userName', user.real_name || user.username)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userInfo', JSON.stringify(user))

      const target = user.role === 'teacher' ? '/teacher/question-bank' : '/student/home'
      console.log('登录成功，跳转至:', target, 'role:', user.role)
      router.push(target)
    } else {
      console.error('响应中未找到用户信息:', res)
      loginError.value = '登录失败：服务器返回数据异常'
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    const data = error.response?.data
    if (data) {
      if (typeof data === 'string') {
        loginError.value = data
      } else if (data.error) {
        loginError.value = data.error
      } else if (data.non_field_errors) {
        loginError.value = data.non_field_errors[0]
      } else if (data.detail) {
        loginError.value = data.detail
      } else {
        loginError.value = '登录失败，请检查用户名和密码'
      }
    } else {
      loginError.value = error.message || '网络错误，请稍后重试'
    }
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''

  if (registerForm.password !== registerForm.password_confirm) {
    registerError.value = '两次密码不一致'
    return
  }

  registerLoading.value = true

  try {
    const data = {
      username: registerForm.username,
      password: registerForm.password,
      password_confirm: registerForm.password_confirm,
      role: role.value,
      real_name: registerForm.real_name,
      phone: registerForm.phone,
      email: registerForm.email
    }
    await register(data)
    registerSuccess.value = '注册成功！请切换到登录页面进行登录'
    Object.keys(registerForm).forEach(key => { registerForm[key] = '' })
    setTimeout(() => {
      activeTab.value = 'login'
      registerSuccess.value = ''
    }, 2000)
  } catch (error) {
    const data = error.response?.data
    if (data) {
      if (typeof data === 'string') {
        registerError.value = data
      } else if (data.error) {
        registerError.value = data.error
      } else {
        const errors = []
        Object.keys(data).forEach(key => {
          const msgs = Array.isArray(data[key]) ? data[key] : [data[key]]
          msgs.forEach(msg => errors.push(`${key}: ${msg}`))
        })
        registerError.value = errors.join('; ') || '注册失败'
      }
    } else {
      registerError.value = '网络错误，请稍后重试'
    }
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background 0.5s ease;
}

.theme-student,
.theme-teacher {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.login-container {
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

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.login-subtitle {
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

/* Role selector */
.role-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid #e2e8f0;
}

.role-card {
  flex: 1;
  text-align: center;
  padding: 14px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: transparent;
}

.role-card:hover {
  background: rgba(255, 255, 255, 0.7);
}

.role-card.active {
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.09);
  transform: none;
}

.role-icon {
  font-size: 1.5em;
  margin-bottom: 5px;
  line-height: 1;
}

.role-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 3px;
}

.role-card.active .role-label {
  color: #3b82f6;
}

.role-card:nth-child(1).active .role-label,
.role-card:nth-child(2).active .role-label {
  color: #3b82f6;
}

.role-desc {
  font-size: 11px;
  color: #94a3b8;
}

/* Tabs */
.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: #64748b;
}

.tab-btn.active,
.theme-student .tab-btn.active,
.theme-teacher .tab-btn.active {
  font-weight: 600;
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-badge {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.14);
}

.theme-student .role-badge,
.theme-teacher .role-badge {
  background: rgba(59, 130, 246, 0.06);
  color: #3b82f6;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.required {
  color: #ef4444;
}

.form-group input {
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  color: #1e293b;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group input:focus,
.theme-student .form-group input:focus,
.theme-teacher .form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* Feedback */
.form-error {
  color: #dc2626;
  font-size: 13px;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.form-success {
  color: #16a34a;
  font-size: 13px;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.form-tip {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

/* Submit button */
.submit-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-family: inherit;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-student .submit-btn,
.theme-teacher .submit-btn {
  background: #3b82f6;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.38);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

@media (max-width: 768px) {
  .login-container { max-width: 100%; }
  .login-card { padding: 24px 20px; }
  .login-header h1 { font-size: 20px; }
  .role-selector { gap: 6px; }
  .role-card { padding: 12px 6px; }
  .role-icon { font-size: 1.3em; }
}
</style>
