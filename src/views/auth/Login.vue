<template>
  <div class="login-page">
    <header class="top-bar">
      <router-link to="/role-select" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        选择身份
      </router-link>
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
          <router-link :to="`/register?role=${role}`" class="footer-link">立即注册</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/api/student'

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
  const savedUsername = localStorage.getItem('savedUsername')
  const savedPassword = localStorage.getItem('savedPassword')
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
      localStorage.setItem('token', data.token || data.key || data.csrfToken || 'true')
      localStorage.setItem('csrfToken', data.csrfToken || '')
      localStorage.setItem('userRole', user.role || 'student')
      localStorage.setItem('userName', user.real_name || user.username)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userInfo', JSON.stringify(user))

      if (loginForm.remember) {
        localStorage.setItem('savedUsername', loginForm.username)
        localStorage.setItem('savedPassword', loginForm.password)
      } else {
        localStorage.removeItem('savedUsername')
        localStorage.removeItem('savedPassword')
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
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-page {
  min-height: 100vh;
  background: var(--canvas);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  transition: background 300ms ease, color 300ms ease;
}

.top-bar {
  padding: 24px 40px;
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
  background: var(--card-bg);
  border-radius: 12px;
  padding: 36px 32px;
  border: 1px solid var(--hairline);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: background 300ms ease, border-color 300ms ease;
}

.card-brand {
  text-align: center;
  margin-bottom: 20px;
}

.card-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
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
