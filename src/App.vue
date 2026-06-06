<template>
  <ParticlesBackground />
  <router-view />
</template>

<script>
import ParticlesBackground from '@/components/ParticlesBackground.vue'

export default {
  name: 'App',
  components: { ParticlesBackground },
  mounted() {
    const theme = localStorage.getItem('theme')
    document.documentElement.setAttribute('data-theme', theme || 'light')
  }
}
</script>

<style>
/* ===== 设计系统 CSS 变量（DESIGN_STYLE.md） ===== */
:root {
  --primary: #d97757;
  --primary-active: #c46a4a;
  --primary-light: #fef3ef;
  --primary-bg: rgba(217,119,87,0.12);
  --accent-teal: #86b3a3;
  --accent-yellow: #f5d76e;

  --canvas: #f8f4ee;
  --surface: #ffffff;
  --card-bg: #ffffff;
  --footer-bg: #2c2c2c;

  --hairline: #e8e0d5;
  --hairline-strong: #d5cdc0;

  --ink: #2c2c2c;
  --muted: #6b6b6b;
  --muted-soft: #9f9f9f;

  --shadow: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.08);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  --font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== 深色模式变量覆盖 ===== */
:root[data-theme="dark"] {
  --canvas: #101010;
  --surface: #181818;
  --card-bg: #222222;
  --hairline: #3a3a3a;
  --hairline-strong: #555555;
  --ink: #e8e4e0;
  --muted: #aaa6a0;
  --muted-soft: #888480;
  --primary: #e0805f;
  --primary-active: #d97757;
  --primary-light: rgba(224,128,95,0.12);
  --primary-bg: rgba(217,119,87,0.2);
  --footer-bg: #080808;
  --shadow: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-hover: 0 12px 32px rgba(0,0,0,0.6);
}

/* ===== 全局基础重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
}

body {
  background: var(--canvas);
  color: var(--ink);
}

#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  color: var(--ink);
  background: var(--canvas);
}

/* ===== 滚动条美化 ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--hairline-strong);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--muted);
}

/* ===== 路由过渡动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* ===== 全局通用样式 ===== */
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 3px solid var(--primary);
}

/* 统计卡片通用样式 */
.stat-card {
  text-align: center;
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary);
}

.stat-card .stat-label {
  font-size: 14px;
  color: var(--muted);
  margin-top: 8px;
}

/* 表格操作按钮间距 */
.table-actions .el-button {
  margin-bottom: 4px;
}

/* 搜索区域底部间距 */
.search-section {
  margin-bottom: 20px;
}

/* 空状态提示 */
.empty-tip {
  text-align: center;
  color: var(--muted-soft);
  padding: 40px 0;
  font-size: 14px;
}
</style>
