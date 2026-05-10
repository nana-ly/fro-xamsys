<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="login-header">
        <div class="login-logo">📚</div>
        <h1>知识聚合考试平台</h1>
        <p class="login-subtitle">知识聚合 · 智能考试 · AI辅助学习</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-card card">
        <div class="login-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'login' }]" 
            @click="activeTab = 'login'">
            登录
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'register' }]" 
            @click="activeTab = 'register'">
            注册
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
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
          <button type="submit" class="btn btn-primary btn-block" :disabled="loginLoading">
            {{ loginLoading ? '登录中...' : '登录' }}
          </button>
          <div class="form-tip">
            <span>测试账号：student / student123</span>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="login-form">
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
            <label>角色 <span class="required">*</span></label>
            <select v-model="registerForm.role" required>
              <option value="student">学生</option>
              <option value="teacher">教师</option>
            </select>
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
          <button type="submit" class="btn btn-primary btn-block" :disabled="registerLoading">
            {{ registerLoading ? '注册中...' : '注册' }}
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
  role: 'student',
  phone: '',
  email: '',
  password: '',
  password_confirm: ''
})

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true

  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    const user = res.data?.user
    if (user) {
      // 存储用户信息到localStorage
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('userName', user.real_name || user.username)
      localStorage.setItem('userId', user.id)

      // 根据角色跳转
      if (user.role === 'student') {
        router.push('/student/home')
      } else if (user.role === 'teacher') {
        router.push('/teacher/home')
      } else {
        router.push('/student/home')
      }
    }
  } catch (error) {
    const data = error.response?.data
    if (data) {
      // 处理DRF的各种错误格式
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
      loginError.value = '网络错误，请稍后重试'
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
      role: registerForm.role,
      real_name: registerForm.real_name,
      phone: registerForm.phone,
      email: registerForm.email
    }
    await register(data)
    registerSuccess.value = '注册成功！请切换到登录页面进行登录'
    // 清空表单
    Object.keys(registerForm).forEach(key => {
      registerForm[key] = key === 'role' ? 'student' : ''
    })
    // 自动切换到登录页
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
        // 处理字段级错误
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.login-logo {
  font-size: 3em;
  margin-bottom: 10px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 1.8em;
  font-weight: 700;
}

.login-subtitle {
  margin: 0;
  font-size: 0.9em;
  opacity: 0.85;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  font-size: 1em;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #667eea;
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
  margin-top: 8px;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 1em;
}

@media (max-width: 768px) {
  .login-container {
    max-width: 100%;
  }
  
  .login-card {
    padding: 20px;
  }
  
  .login-header h1 {
    font-size: 1.5em;
  }
}
</style>