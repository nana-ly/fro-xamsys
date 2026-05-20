<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>教师端</h3>
      </div>
      <el-menu
          :default-active="activeMenu"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">

        <el-menu-item index="/teacher/question-bank">
          <el-icon><Document /></el-icon>
          <span>题库管理</span>
        </el-menu-item>

        <el-menu-item index="/teacher/exam-list">
          <el-icon><EditPen /></el-icon>
          <span>试卷管理</span>
        </el-menu-item>

        <el-menu-item index="/teacher/create-exam">
          <el-icon><DocumentAdd /></el-icon>
          <span>创建试卷</span>
        </el-menu-item>

        <el-menu-item index="/teacher/class-manage">
          <el-icon><User /></el-icon>
          <span>班级管理</span>
        </el-menu-item>

        <el-menu-item index="/teacher/score-view">
          <el-icon><DataAnalysis /></el-icon>
          <span>成绩查看</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>{{ $route.meta.title }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userInfo.real_name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, EditPen, User, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      localStorage.clear()
      ElMessage.success('已退出登录')
      router.push('/login?role=teacher')

    } catch (error) {
      // 取消操作
    }
  } else if (command === 'profile') {
    router.push('/teacher/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #545c64;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #434a50;
}

.logo h3 {
  margin: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info .el-icon {
  margin-right: 8px;
}

.main-content {
  background: #f0f2f5;
  overflow-y: auto;
}
</style>