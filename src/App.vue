<template>
  <router-view />
</template>

<script>

export default {
  name: 'App',

}
</script>

<style>
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

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  color: #333;
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
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
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
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

/* 统计卡片通用样式 */
.stat-card {
  text-align: center;
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-card .stat-label {
  font-size: 14px;
  color: #909399;
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
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}
</style>