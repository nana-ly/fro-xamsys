<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>教师注册</h2>
        </div>
      </template>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="100px">

        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="3-20位字母、数字或下划线">
          </el-input>
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="用于找回密码">
          </el-input>
        </el-form-item>

        <!-- 真实姓名 -->
        <el-form-item label="真实姓名" prop="realName">
          <el-input
              v-model="registerForm.realName"
              placeholder="请输入真实姓名">
          </el-input>
        </el-form-item>

        <!-- 学校 -->
        <el-form-item label="学校" prop="school">
          <el-input
              v-model="registerForm.school"
              placeholder="请输入学校名称">
          </el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="至少6位"
              show-password>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              show-password>
          </el-input>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              :loading="loading"
              @click="handleRegister"
              style="width: 100%">
            注 册
          </el-button>
        </el-form-item>

        <!-- 返回登录 -->
        <el-form-item>
          <div class="register-footer">
            <span>已有账号？</span>
            <el-link type="primary" @click="goLogin">立即登录</el-link>
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
import { register } from '@/api/teacher'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  realName: '',
  school: '',
  password: '',
  confirmPassword: ''
})

// 自定义验证：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  school: [
    { required: true, message: '请输入学校名称', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 注册处理
const handleRegister = async () => {
  await registerFormRef.value.validate()

  loading.value = true
  try {
    // 调用注册API（与成员一的接口对接）
    await register({
      username: registerForm.username,
      email: registerForm.email,
      real_name: registerForm.realName,
      school: registerForm.school,
      password: registerForm.password,
      password_confirm: registerForm.confirmPassword,
      role: 'teacher' // 教师角色
    })

    ElMessage.success('注册成功，请登录')
    router.push('/login')

  } catch (error) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 返回登录
const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  padding: 20px 0;
}

.register-card {
  width: 500px;
  border-radius: 10px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.register-footer {
  width: 100%;
  text-align: center;
}

.register-footer span {
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .register-card {
    width: 90%;
  }
}
</style>