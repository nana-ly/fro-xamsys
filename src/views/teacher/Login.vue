<template>
  <div class="login-container" :class="roleTab === 'student' ? 'bg-student' : 'bg-teacher'">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>智能考试平台</h2>
          <p>{{ roleTab === 'student' ? '学生登录' : '教师登录' }}</p>
        </div>
      </template>

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
    </el-card>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  transition: background 0.5s ease;
}

.bg-teacher {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
}

.bg-student {
  background: linear-gradient(135deg, #337ecc 0%, #79bbff 100%);
}

.login-card {
  width: 450px;
  border-radius: 10px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.card-header p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.role-tabs {
  display: flex;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.role-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.role-tab.active {
  color: #fff;
  font-weight: 600;
}

.role-tab:nth-child(1).active {
  background: linear-gradient(135deg, #337ecc, #79bbff);
}

.role-tab:nth-child(2).active {
  background: linear-gradient(135deg, #409eff, #337ecc);
}

.login-footer {
  width: 100%;
  text-align: center;
}

.login-footer span {
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    margin: 20px;
  }
}
</style>
