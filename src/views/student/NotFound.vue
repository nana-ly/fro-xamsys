<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="status-code">404</div>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <button class="btn btn-primary" @click="$router.push('/student/home')">
          返回首页
        </button>
        <button class="btn btn-outline" @click="$router.back()">
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.not-found-content {
  text-align: center;
}

.status-code {
  font-size: 6em;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 10px;
}

.not-found-content h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.3em;
}

.not-found-content p {
  margin: 0 0 24px 0;
  color: #999;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>