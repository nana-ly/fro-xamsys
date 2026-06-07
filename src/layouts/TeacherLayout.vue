<template>
  <el-container class="layout-container teacher-layout-global">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="6" fill="#d97757"/>
          <path d="M8 20V8h6c2 0 3.5 1.5 3.5 3.5S16 15 14 15h-2.5v5H8z" fill="#faf8f5"/>
          <circle cx="20" cy="18" r="4" fill="#faf8f5"/>
        </svg>
        <span class="brand-text">智学平台</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/teacher/question-bank" class="nav-item" :class="{ active: activeMenu.startsWith('/teacher/question-bank') }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>题库管理</span>
        </router-link>

        <router-link to="/teacher/exam-list" class="nav-item" :class="{ active: activeMenu.startsWith('/teacher/exam-list') }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>
          </svg>
          <span>试卷管理</span>
        </router-link>


        <router-link to="/teacher/class-manage" class="nav-item" :class="{ active: activeMenu.startsWith('/teacher/class-manage') }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>班级管理</span>
        </router-link>

        <router-link to="/teacher/score-view" class="nav-item" :class="{ active: activeMenu.startsWith('/teacher/score-view') }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>成绩管理</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/teacher/profile" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>个人信息</span>
        </router-link>
        <button class="logout-btn" @click="handleLogout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2 class="page-title">{{ $route.meta.title }}</h2>
          <span class="page-subtitle" v-if="route.meta.subtitle">{{ route.meta.subtitle }}</span>
        </div>
        <div class="header-right">
          <ThemeToggle />
          <div class="user-dropdown">
            <span class="user-avatar">{{ (userInfo.real_name || userInfo.username || '教')[0] }}</span>
            <span class="user-name">{{ userInfo.real_name || userInfo.username || '教师' }}</span>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <div class="page-container">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const userInfo = ref(JSON.parse(localStorage.getItem('teacher_userInfo') || '{}'))

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const prefix = 'teacher'
    ;['token', 'csrfToken', 'userRole', 'userName', 'userId', 'userInfo'].forEach(k => {
      localStorage.removeItem(`${prefix}_${k}`)
      sessionStorage.removeItem(`${prefix}_${k}`)
    })
    ElMessage.success('已退出登录')
    router.push('/login?role=teacher')
  } catch {
    // 取消
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: var(--canvas, #f8f4ee);
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 220px;
  background: var(--card-bg, #ffffff);
  border-right: 1px solid var(--hairline, #e3dbd0);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--hairline, #e3dbd0);
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
  letter-spacing: -0.3px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--muted, #6b655c);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 200ms ease;
}

.nav-item:hover {
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
}

.nav-item.active {
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  font-weight: 600;
}

.nav-item svg {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--hairline, #e3dbd0);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--muted, #6b655c);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  transition: all 200ms ease;
  width: 100%;
  text-align: left;
}

.logout-btn:hover {
  background: rgba(198, 69, 69, 0.1);
  color: #c64545;
}

/* ===== 顶部栏 ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg, #ffffff);
  border-bottom: 1px solid var(--hairline, #e3dbd0);
  padding: 0 28px;
  height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--muted, #6b655c);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: default;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-bg, rgba(217,119,87,0.12));
  color: var(--primary, #d97757);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink, #2a2a2a);
}

/* ===== 主内容区 ===== */
.main-content {
  background: var(--canvas, #f8f4ee);
  overflow-y: auto;
}

.page-container {
  padding: 24px 28px;
  max-width: 1200px;
}
</style>

<!-- Element Plus 主题覆盖（全局生效） -->
<style>
.teacher-layout-global {
  --el-color-primary: #d97757;
  --el-color-primary-light-3: #e0805f;
  --el-color-primary-light-5: #e8a080;
  --el-color-primary-light-7: #f0c0a8;
  --el-color-primary-light-8: #f5d5c0;
  --el-color-primary-light-9: #fae8d8;
  --el-color-primary-dark-2: #c46a4a;
  --el-border-radius-base: 8px;
  --el-font-size-base: 14px;
  --el-font-size-small: 13px;
  --el-font-size-large: 16px;
}
.teacher-layout-global .el-card {
  border-radius: 12px;
  border: 1px solid var(--hairline, #e3dbd0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.teacher-layout-global .el-button--primary {
  --el-button-bg-color: #d97757;
  --el-button-border-color: #d97757;
  --el-button-hover-bg-color: #c46a4a;
  --el-button-hover-border-color: #c46a4a;
  --el-button-active-bg-color: #a9583e;
  --el-button-active-border-color: #a9583e;
}
.teacher-layout-global .el-button--primary.is-plain {
  --el-button-bg-color: rgba(217,119,87,0.1);
  --el-button-border-color: #d97757;
  --el-button-text-color: #d97757;
}
.teacher-layout-global .el-table {
  --el-table-border-color: var(--hairline, #e3dbd0);
  --el-table-header-bg-color: var(--card-bg, #ffffff);
  font-size: 14px;
}
.teacher-layout-global .el-table th.el-table__cell {
  font-weight: 600;
  color: var(--muted, #6b655c);
  background: var(--card-bg, #ffffff);
}
.teacher-layout-global .el-pagination {
  --el-pagination-button-color: var(--muted, #6b655c);
  --el-pagination-hover-color: #d97757;
}
.teacher-layout-global .el-tag {
  --el-tag-border-radius: 6px;
}
.teacher-layout-global .el-dialog {
  border-radius: 12px;
}
.teacher-layout-global .el-dialog__header {
  padding: 24px 24px 0;
  font-weight: 600;
}
.teacher-layout-global .el-dialog__body {
  padding: 20px 24px;
}
.teacher-layout-global .el-dialog__footer {
  padding: 0 24px 24px;
}
.teacher-layout-global .el-input__wrapper {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--hairline-strong, #ccc2b4) inset;
}
.teacher-layout-global .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #d97757 inset, 0 0 0 3px rgba(217,119,87,0.12) inset;
}
.teacher-layout-global .el-select .el-input__wrapper {
  border-radius: 8px;
}
.teacher-layout-global .el-message-box {
  border-radius: 12px;
}

/* ===== Element Plus 深色模式覆盖 ===== */
html[data-theme="dark"] .teacher-layout-global {
  /* 主色在暗色下稍亮 */
  --el-color-primary: #e0805f;
  --el-color-primary-light-3: #e8a080;
  --el-color-primary-light-5: #f0c0a8;
  --el-color-primary-light-7: #f5d5c0;
  --el-color-primary-light-8: #f8e5d8;
  --el-color-primary-light-9: #fcf0e8;
  --el-color-primary-dark-2: #d97757;

  /* 核心背景/文字/边框变量 — 这是表格在暗色模式下不再白色的关键 */
  --el-bg-color: #181818;
  --el-bg-color-overlay: #222222;
  --el-bg-color-page: #101010;
  --el-text-color-primary: #e8e4e0;
  --el-text-color-regular: #d0ccc6;
  --el-text-color-secondary: #aaa6a0;
  --el-text-color-placeholder: #888480;
  --el-border-color: #3a3a3a;
  --el-border-color-light: #2e2e2e;
  --el-border-color-lighter: #333333;
  --el-border-color-extra-light: #2a2a2a;
  --el-fill-color: #2a2a2a;
  --el-fill-color-light: #222222;
  --el-fill-color-blank: #181818;
  --el-fill-color-lighter: #242424;
  --el-color-white: #1a1a1a;
  --el-color-black: #e8e4e0;
  --el-color-info: #888480;
  --el-color-info-light-3: #aaa6a0;
  --el-color-info-light-5: #6b6b6b;
  --el-color-info-light-7: #555555;
  --el-color-info-light-8: #3a3a3a;
  --el-color-info-light-9: #2a2a2a;
  --el-color-info-dark-2: #d0ccc6;
  --el-mask-color: rgba(0,0,0,0.7);
  --el-mask-color-extra-light: rgba(0,0,0,0.4);
}

html[data-theme="dark"] .teacher-layout-global .el-card {
  background: var(--card-bg, #222222);
  border-color: var(--hairline, #3a3a3a);
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-button--primary {
  --el-button-bg-color: #e0805f;
  --el-button-border-color: #e0805f;
  --el-button-hover-bg-color: #d97757;
  --el-button-hover-border-color: #d97757;
  --el-button-active-bg-color: #c46a4a;
  --el-button-active-border-color: #c46a4a;
}

html[data-theme="dark"] .teacher-layout-global .el-button--primary.is-plain {
  --el-button-bg-color: rgba(224,128,95,0.15);
  --el-button-border-color: #e0805f;
  --el-button-text-color: #e0805f;
}

html[data-theme="dark"] .teacher-layout-global .el-table {
  --el-table-border-color: var(--hairline, #3a3a3a);
  --el-table-header-bg-color: var(--card-bg, #222222);
  --el-table-row-hover-bg-color: rgba(255,255,255,0.04);
  --el-table-current-row-bg-color: rgba(224,128,95,0.08);
  --el-table-tr-bg-color: var(--card-bg, #222222);
}

html[data-theme="dark"] .teacher-layout-global .el-table th.el-table__cell {
  background: #1e1e1e;
  color: var(--muted, #aaa6a0);
}

html[data-theme="dark"] .teacher-layout-global .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--hairline-strong, #555555) inset;
  background: var(--card-bg, #222222);
}

html[data-theme="dark"] .teacher-layout-global .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #e0805f inset, 0 0 0 3px rgba(224,128,95,0.2) inset;
}

html[data-theme="dark"] .teacher-layout-global .el-input__inner {
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-select .el-input__wrapper {
  background: var(--card-bg, #222222);
}

html[data-theme="dark"] .teacher-layout-global .el-pagination {
  --el-pagination-button-color: var(--muted, #aaa6a0);
  --el-pagination-hover-color: #e0805f;
}

html[data-theme="dark"] .teacher-layout-global .el-dialog {
  background: var(--card-bg, #222222);
}

html[data-theme="dark"] .teacher-layout-global .el-dialog__header {
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-dialog__title {
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-message-box {
  background: var(--card-bg, #222222);
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-message-box__title {
  color: var(--ink, #e8e4e0);
}

html[data-theme="dark"] .teacher-layout-global .el-message-box__message {
  color: var(--muted, #aaa6a0);
}
</style>