<template>
  <div class="role-select-page">
    <header class="top-bar">
      <router-link to="/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回首页
      </router-link>
    </header>

    <main class="main-content">
      <div class="brand">
        <svg width="44" height="44" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="6" fill="#d97757"/>
          <path d="M8 20V8h6c2 0 3.5 1.5 3.5 3.5S16 15 14 15h-2.5v5H8z" fill="#faf8f5"/>
          <circle cx="20" cy="18" r="4" fill="#faf8f5"/>
        </svg>
      </div>
      <h1 class="page-title">请选择您的身份</h1>
      <p class="page-subtitle">选择适合您的角色以继续使用平台</p>

      <div class="role-cards">
        <div class="role-card" @click="selectRole('student')">
          <div class="role-icon student">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <h2 class="role-title">学生</h2>
          <p class="role-desc">在线答题、查看成绩、复习错题</p>
          <span class="role-action">进入学习</span>
        </div>

        <div class="role-card" @click="selectRole('teacher')">
          <div class="role-icon teacher">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              <path d="M8 7h8M8 11h8M8 15h4"/>
            </svg>
          </div>
          <h2 class="role-title">教师</h2>
          <p class="role-desc">AI 出题、管理题库、发布考试</p>
          <span class="role-action">开始教学</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const selectRole = (role) => {
  router.push(`/login?role=${role}`)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.role-select-page {
  min-height: 100vh;
  background: var(--canvas);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  transition: background 300ms ease, color 300ms ease;
}

.top-bar {
  padding: 24px 40px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color 200ms ease;
}

.back-link:hover {
  color: var(--ink);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 80px;
}

.brand {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 15px;
  color: var(--muted);
  margin-bottom: 48px;
  text-align: center;
}

.role-cards {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.role-card {
  width: 280px;
  padding: 40px 32px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--hairline);
  cursor: pointer;
  transition: all 200ms ease;
  text-align: center;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  border-color: #d97757;
}

.role-card:active {
  transform: translateY(-2px);
}

.role-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.role-icon.student {
  background: rgba(134, 179, 163, 0.15);
  color: #86b3a3;
}

.role-icon.teacher {
  background: rgba(217, 119, 87, 0.15);
  color: #d97757;
}

.role-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 8px;
}

.role-desc {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.role-action {
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  color: #d97757;
  padding: 8px 20px;
  background: rgba(217, 119, 87, 0.1);
  border-radius: 20px;
  transition: background 200ms ease;
}

.role-card:hover .role-action {
  background: rgba(217, 119, 87, 0.18);
}

@media (max-width: 680px) {
  .role-cards {
    flex-direction: column;
    align-items: center;
  }

  .role-card {
    width: 100%;
    max-width: 320px;
  }

  .top-bar {
    padding: 20px 24px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
