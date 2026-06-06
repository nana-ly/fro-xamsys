<template>
  <div class="register-page">
    <header class="top-bar">
      <router-link :to="`/login?role=${role}`" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回登录
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
        <h1 class="card-title">{{ role === 'teacher' ? '教师注册' : '学生注册' }}</h1>
        <p class="card-subtitle">创建您的账号，快速开始使用</p>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">用户名 <span class="required">*</span></label>
            <input
              id="username"
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">密码 <span class="required">*</span></label>
            <input
              id="password"
              v-model="registerForm.password"
              type="password"
              placeholder="请设置密码（至少6位）"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码 <span class="required">*</span></label>
            <input
              id="confirmPassword"
              v-model="registerForm.password_confirm"
              type="password"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div class="form-error" v-if="registerError">{{ registerError }}</div>
          <div class="form-success" v-if="registerSuccess">{{ registerSuccess }}</div>

          <button type="submit" class="auth-btn" :disabled="loading">
            <span v-if="!loading">注册</span>
            <span v-else>注册中...</span>
          </button>
        </form>

        <div class="card-footer">
          <span>已有账号？</span>
          <router-link :to="`/login?role=${role}`" class="footer-link">立即登录</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { register } from '@/api/student'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const role = ref('student')
const loading = ref(false)
const registerError = ref('')
const registerSuccess = ref('')

const registerForm = reactive({
  username: '',
  password: '',
  password_confirm: ''
})

onMounted(() => {
  role.value = route.query.role || 'student'
})

const handleRegister = async () => {
  registerError.value = ''
  registerSuccess.value = ''

  if (registerForm.password !== registerForm.password_confirm) {
    registerError.value = '两次密码不一致'
    return
  }

  loading.value = true

  try {
    const data = {
      username: registerForm.username,
      password: registerForm.password,
      password_confirm: registerForm.password_confirm,
      role: role.value
    }
    await register(data)
    registerSuccess.value = '注册成功！即将跳转登录页面'
    Object.keys(registerForm).forEach(key => { registerForm[key] = '' })
    setTimeout(() => {
      router.push(`/login?role=${role.value}`)
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

.register-page {
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

.required {
  color: #c64545;
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

.form-success {
  color: #5db872;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  line-height: 1.5;
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
