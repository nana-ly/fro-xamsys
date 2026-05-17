<template>
  <div class="profile-page">
    <div class="page-header">
      <h2>个人信息</h2>
    </div>

    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>基本信息</span>
          </template>
          <el-form :model="form" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="form.real_name" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag type="primary">教师</el-tag>
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ form.created_at || '-' }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 修改密码 -->
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>修改密码</span>
          </template>
          <el-form :model="pwdForm" label-width="80px">
            <el-form-item label="旧密码">
              <el-input v-model="pwdForm.old_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="pwdForm.new_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="pwdForm.confirm_password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api/teacher'
import request from '@/utils/request'

const form = reactive({
  username: '',
  real_name: '',
  created_at: ''
})

const pwdForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

onMounted(async () => {
  try {
    const res = await getCurrentUser()
    const user = res.user || res
    form.username = user.username || ''
    form.real_name = user.real_name || ''
    form.created_at = user.created_at || user.date_joined || ''
  } catch {
    // 从 localStorage 获取
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    form.username = info.username || ''
    form.real_name = info.real_name || ''
  }
})

async function saveProfile() {
  try {
    await request({
      url: '/users/auth/me/',
      method: 'patch',
      data: { real_name: form.real_name }
    })
    // 更新 localStorage
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    info.real_name = form.real_name
    localStorage.setItem('userInfo', JSON.stringify(info))
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  }
}

async function changePassword() {
  if (!pwdForm.old_password || !pwdForm.new_password) {
    ElMessage.warning('请填写密码')
    return
  }
  if (pwdForm.new_password !== pwdForm.confirm_password) {
    ElMessage.warning('两次新密码不一致')
    return
  }
  try {
    await request({
      url: '/users/auth/change_password/',
      method: 'post',
      data: {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password
      }
    })
    ElMessage.success('密码修改成功，请重新登录')
    pwdForm.old_password = ''
    pwdForm.new_password = ''
    pwdForm.confirm_password = ''
  } catch {
    ElMessage.error('密码修改失败')
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}
</style>
