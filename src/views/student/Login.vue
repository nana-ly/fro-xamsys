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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: background 0.5s ease;
}

.theme-student {
  background: #545c64;
}

.theme-teacher {
  background: #545c64;
}

.login-container {
  width: 100%;
  max-width: 460px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
  color: white;
}

.login-logo {
  font-size: 2.8em;
  margin-bottom: 8px;
}

.login-header h1 {
  margin: 0 0 6px 0;
  font-size: 1.6em;
  font-weight: 700;
}

.login-subtitle {
  margin: 0;
  font-size: 0.85em;
  opacity: 0.9;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 28px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

/* ===== 一级：角色选择 ===== */
.role-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.role-card {
  flex: 1;
  text-align: center;
  padding: 16px 10px;
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.role-card:hover {
  border-color: #ccc;
  transform: translateY(-2px);
}

.role-card.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.role-card:nth-child(1).active {
  border-color: #337ecc;
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.06), rgba(56, 239, 125, 0.06));
}

.role-card:nth-child(2).active {
  border-color: #409eff;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.06));
}

.role-icon {
  font-size: 2em;
  margin-bottom: 6px;
}

.role-label {
  font-size: 1em;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.role-card:nth-child(1).active .role-label { color: #337ecc; }
.role-card:nth-child(2).active .role-label { color: #409eff; }

.role-desc {
  font-size: 0.75em;
  color: #999;
}

/* ===== 二级：登录/注册选项卡 ===== */
.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  font-size: 0.95em;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-btn.active {
  font-weight: 600;
  border-bottom-color: #409eff;
  color: #409eff;
}

.theme-student .tab-btn.active {
  border-bottom-color: #337ecc;
  color: #337ecc;
}

/* ===== 表单 ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.role-badge {
  text-align: center;
  font-size: 0.85em;
  font-weight: 600;
  color: #fff;
  padding: 8px;
  border-radius: 8px;
}

.theme-student .role-badge {
  background: linear-gradient(135deg, #337ecc, #79bbff);
}

.theme-teacher .role-badge {
  background: linear-gradient(135deg, #409eff, #337ecc);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85em;
  color: #555;
  font-weight: 500;
}

.required { color: #e74c3c; }

.form-group input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #409eff;
}

.theme-student .form-group input:focus {
  border-color: #337ecc;
}

.form-error {
  color: #e74c3c;
  font-size: 0.85em;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 6px;
}

.form-success {
  color: #27ae60;
  font-size: 0.85em;
  padding: 8px 12px;
  background: #f0fef0;
  border-radius: 6px;
}

.form-tip {
  text-align: center;
  font-size: 0.8em;
  color: #999;
}

.submit-btn {
  padding: 12px;
  font-size: 1em;
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.theme-student .submit-btn {
  background: linear-gradient(135deg, #337ecc, #79bbff);
}

.theme-teacher .submit-btn {
  background: linear-gradient(135deg, #409eff, #337ecc);
}

.submit-btn:hover { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-block { width: 100%; }

@media (max-width: 768px) {
  .login-container { max-width: 100%; }
  .login-card { padding: 20px 16px; }
  .login-header h1 { font-size: 1.3em; }
  .role-selector { gap: 8px; }
  .role-card { padding: 12px 6px; }
  .role-icon { font-size: 1.5em; }
}
</style>
