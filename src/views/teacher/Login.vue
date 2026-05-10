<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>智能考试平台</h2>
          <p>教师登录</p>
        </div>
      </template>

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

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
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

// 登录处理
const handleLogin = async () => {
  // 表单验证
  await loginFormRef.value.validate()

  loading.value = true
  try {
    // 调用登录API（与成员一的接口对接）
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 保存用户信息
    localStorage.setItem('userInfo', JSON.stringify(res.user))
    if (res.csrfToken) {
      localStorage.setItem('csrfToken', res.csrfToken)
    }

    // 记住密码
    if (loginForm.remember) {
      localStorage.setItem('savedUsername', loginForm.username)
      localStorage.setItem('savedPassword', loginForm.password)
    }

    ElMessage.success('登录成功')

    // 跳转到题库管理页
    router.push('/teacher/question-bank')

  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 跳转注册
const goRegister = () => {
  router.push('/register')
}

// 自动填充保存的密码
const loadSavedPassword = () => {
  const savedUsername = localStorage.getItem('savedUsername')
  const savedPassword = localStorage.getItem('savedPassword')
  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername
    loginForm.password = savedPassword
    loginForm.remember = true
  }
}

// 页面加载时自动填充
loadSavedPassword()
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.login-footer {
  width: 100%;
  text-align: center;
}

.login-footer span {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    margin: 20px;
  }
}
</style>