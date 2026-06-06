<template>
  <div class="login-page">
    <header class="top-bar">
      <router-link to="/role-select" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        选择身份
      </router-link>
      <ThemeToggle />
    </header>

    <main class="main-content">
      <div class="auth-card">
        <div class="card-brand">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#d97757"/>
            <path d="M8 20V8h6c2 0 3.5 1.5 3.5 3.5S16 15 14 15h-2.5v5H8z" fill="#faf8f5"/>
            <circle cx="20" cy="18" r="4" fill="#faf8f5"/>
          </svg>
        </div>
        <h1 class="card-title">{{ role === 'teacher' ? '教师登录' : '学生登录' }}</h1>
        <p class="card-subtitle">欢迎回来，请登录您的账号</p>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-error" v-if="loginError">{{ loginError }}</div>

          <div class="form-actions">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.remember" />
              <span>记住我</span>
            </label>
          </div>

          <button type="submit" class="auth-btn" :disabled="loading">
            <span v-if="!loading">登录</span>
            <span v-else>登录中...</span>
          </button>
        </form>

        <div class="card-footer">
          <span>还没有账号？</span>
          <router-link v-if="role !== 'teacher'" :to="`/register?role=${role}`" class="footer-link">立即注册</router-link>
          <span v-else class="footer-link" style="cursor:pointer" @click="onTeacherRegisterHint">立即注册</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { login } from '@/api/student'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const role = ref('student')
const loading = ref(false)
const loginError = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

onMounted(() => {
  role.value = route.query.role || 'student'
  const prefix = role.value === 'teacher' ? 'teacher' : 'student'
  const savedUsername = localStorage.getItem(`${prefix}_savedUsername`)
  const savedPassword = localStorage.getItem(`${prefix}_savedPassword`)
  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername
    loginForm.password = savedPassword
    loginForm.remember = true
  }
})

const handleLogin = async () => {
  loginError.value = ''
  loading.value = true

  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    console.log('Login API response:', res.data || res)
    const data = res.data || res
    const user = data.user || data

    if (user && user.username) {
      // 校验角色是否匹配：从 /role-select?role=xxx 过来的用户应该登录对应角色
      const expectedRole = route.query.role || 'student'
      if (user.role !== expectedRole) {
        const roleName = expectedRole === 'teacher' ? '教师' : '学生'
        loginError.value = `该账号不是${roleName}账号，请使用正确的${roleName}账号登录`
        loading.value = false
        return
      }

      const token = data.token || data.key || data.csrfToken || 'true'
      const csrfToken = data.csrfToken || ''
      const role = user.role || 'student'
      const prefix = role === 'teacher' ? 'teacher' : 'student'
      // 先清除另一种角色的所有数据，防止跨角色污染
      const oppositePrefix = role === 'teacher' ? 'student' : 'teacher'
      const keysToRemove = ['token', 'csrfToken', 'userRole', 'userName', 'userId', 'userInfo']
      keysToRemove.forEach(k => {
        localStorage.removeItem(`${oppositePrefix}_${k}`)
        sessionStorage.removeItem(`${oppositePrefix}_${k}`)
      })
      // 用角色前缀存储，不同角色 key 不冲突
      localStorage.setItem(`${prefix}_token`, token)
      localStorage.setItem(`${prefix}_csrfToken`, csrfToken)
      localStorage.setItem(`${prefix}_userRole`, role)
      localStorage.setItem(`${prefix}_userName`, user.real_name || user.username)
      localStorage.setItem(`${prefix}_userId`, user.id)
      localStorage.setItem(`${prefix}_userInfo`, JSON.stringify(user))
      sessionStorage.setItem(`${prefix}_token`, token)
      sessionStorage.setItem(`${prefix}_userRole`, role)

      const savePrefix = role === 'teacher' ? 'teacher' : 'student'
      if (loginForm.remember) {
        localStorage.setItem(`${savePrefix}_savedUsername`, loginForm.username)
        localStorage.setItem(`${savePrefix}_savedPassword`, loginForm.password)
      } else {
        localStorage.removeItem(`${savePrefix}_savedUsername`)
        localStorage.removeItem(`${savePrefix}_savedPassword`)
      }

      const target = user.role === 'teacher' ? '/teacher/question-bank' : '/student/home'
      router.push(target)
    } else {
      loginError.value = '登录失败：服务器返回数据异常'
    }
  } catch (error) {
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
        const errors = []
        Object.keys(data).forEach(key => {
          const msgs = Array.isArray(data[key]) ? data[key] : [data[key]]
          msgs.forEach(msg => errors.push(`${key}: ${msg}`))
        })
        loginError.value = errors.join('; ') || '登录失败，请检查用户名和密码'
      }
    } else {
      loginError.value = error.message || '网络错误，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

function onTeacherRegisterHint() {
  ElMessageBox.alert(
    '教师账号由管理员统一创建和管理，不开放自主注册。<br/>如需开通教师账号，请联系系统管理员。',
    '提示',
    { confirmButtonText: '知道了', dangerouslyUseHTMLString: true, type: 'info' }
  ).catch(() => {})
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-page {
  min-height: 100vh;
  background: var(--canvas, #faf8f5);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  color: var(--ink, #1a1a2e);
  transition: background 300ms ease, color 300ms ease;
}

.top-bar {
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color 200ms ease;
}

.back-link:hover {
  color: var(--ink);
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px 60px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  padding: 36px 32px;
  border: 1px solid var(--hairline, #f0f0f0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: background 300ms ease, border-color 300ms ease;
}

.card-brand {
  text-align: center;
  margin-bottom: 20px;
}

.card-title {
  display: block;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
  border-left: none;
  padding-left: 0;
}

.card-subtitle {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 28px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}

.form-group input {
  width: 100%;
  height: 44px;
  padding: 10px 14px;
  font-size: 15px;
  font-family: inherit;
  color: var(--ink);
  background: var(--card-bg);
  border: 1px solid var(--hairline-strong);
  border-radius: 8px;
  outline: none;
  transition: border-color 200ms ease, box-shadow 200ms ease, background 300ms ease;
}

.form-group input::placeholder {
  color: var(--muted-soft);
}

.form-group input:focus {
  border-color: #d97757;
  box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.12);
}

.form-error {
  color: #c64545;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 12px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #d97757;
}

.auth-btn {
  width: 100%;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  color: #ffffff;
  background: #d97757;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
  margin-top: 4px;
}

.auth-btn:hover:not(:disabled) {
  background: #c46a4a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.3);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-btn:disabled {
  background: var(--hairline);
  color: var(--muted-soft);
  cursor: not-allowed;
}

.card-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--hairline);
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.footer-link {
  margin-left: 4px;
  color: #d97757;
  text-decoration: none;
  font-weight: 500;
  transition: color 200ms ease;
}

.footer-link:hover {
  color: #c46a4a;
}

@media (max-width: 480px) {
  .top-bar {
    padding: 20px 24px;
  }

  .auth-card {
    padding: 28px 20px;
  }
}
</style>

<!-- MessageBox 风格覆盖（非 scoped，因为组件渲染在 body 下） -->
<style>
.el-message-box {
  --el-bg-color: var(--card-bg, #ffffff);
  --el-text-color-primary: var(--ink, #2c2c2c);
  --el-text-color-regular: var(--muted, #6b6b6b);
  border-radius: 12px;
  border: 1px solid var(--hairline, #e8e0d5);
  overflow: hidden;
}

html[data-theme="dark"] .el-message-box {
  --el-bg-color: var(--card-bg, #222222);
  --el-text-color-primary: var(--ink, #e8e4e0);
  --el-text-color-regular: var(--muted, #aaa6a0);
  border-color: var(--hairline, #3a3a3a);
}

.el-message-box__title {
  color: var(--ink, #2c2c2c) !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}

.el-message-box__message {
  color: var(--muted, #6b6b6b) !important;
  font-size: 14px !important;
  line-height: 1.8 !important;
}

.el-message-box__headerbtn {
  color: var(--muted, #9f9f9f);
}

.el-message-box .el-button--primary {
  --el-button-bg-color: var(--primary, #d97757);
  --el-button-border-color: var(--primary, #d97757);
  --el-button-hover-bg-color: var(--primary-active, #c46a4a);
  --el-button-hover-border-color: var(--primary-active, #c46a4a);
}
</style>
