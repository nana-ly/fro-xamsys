<template>
  <div id="app" class="student-layout">
    <!-- 顶部导航栏（学生端） -->
    <nav class="navbar" v-if="showNavbar">
      <!-- 左侧：Logo + 系统名称 -->
      <div class="nav-left">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="8" y1="7" x2="16" y2="7"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <span class="brand-text">智学平台</span>
      </div>

      <!-- 中间：导航链接 -->
      <div class="nav-center">
        <router-link to="/student/home" class="nav-link" :class="{ active: isActive('/student/home') }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          首页
        </router-link>
        <router-link to="/student/wrongbook" class="nav-link" :class="{ active: isActive('/student/wrongbook') }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          错题本
        </router-link>
        <router-link to="/student/history" class="nav-link" :class="{ active: isActive('/student/history') }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          学习历史
        </router-link>
      </div>

      <!-- 右侧：用户信息 -->
      <div class="nav-right">
        <div class="user-avatar clickable" @click="goProfile" :title="userName">
          {{ userName.charAt(0) }}
        </div>
        <span class="user-name">{{ userName }}</span>
        <button class="btn-logout" @click="logout">退出</button>
      </div>
    </nav>

    <!-- 底部导航（移动端） -->
    <div class="mobile-nav" v-if="showMobileNav">
      <router-link to="/student/home" class="mobile-nav-item" :class="{ active: isActive('/student/home') }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="nav-text">首页</span>
      </router-link>
      <router-link to="/student/wrongbook" class="mobile-nav-item" :class="{ active: isActive('/student/wrongbook') }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="nav-text">错题本</span>
      </router-link>
      <router-link to="/student/history" class="mobile-nav-item" :class="{ active: isActive('/student/history') }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-text">历史</span>
      </router-link>
    </div>

    <!-- 主内容区域 -->
    <main :class="{ 'has-mobile-nav': showMobileNav }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const userName = ref('')
const windowWidth = ref(window.innerWidth)

const showNavbar = computed(() => {
  return route.path !== '/login'
})

const showMobileNav = computed(() => {
  const studentRoutes = ['/student/home', '/student/wrongbook', '/student/history']
  return studentRoutes.includes(route.path) && windowWidth.value <= 768
})

function isActive(path) {
  return route.path === path
}

function goProfile() {
  router.push('/student/profile')
}

function logout() {
  const prefix = 'student'
  ;['token', 'csrfToken', 'userRole', 'userName', 'userId', 'userInfo'].forEach(k => {
    localStorage.removeItem(`${prefix}_${k}`)
    sessionStorage.removeItem(`${prefix}_${k}`)
  })
  router.push('/login?role=student')
}

let resizeHandler = null

onMounted(() => {
  userName.value = localStorage.getItem('student_userName') || '学生'
  resizeHandler = () => { windowWidth.value = window.innerWidth }
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
.student-layout {
  background: var(--canvas,rgb(219, 176, 133));
  min-height: 100vh;
}

/* ===== 顶部导航 ===== */
.navbar {
  background: var(--surface,rgb(230, 171, 116));
  border-bottom: 1px solid var(--hairline, #e8e0d5);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand-text {
  font-size: 1.15em;
  font-weight: 600;
  color: var(--ink, #2c2c2c);
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* ===== 中间导航链接 ===== */
.nav-center {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--muted, #6b6b6b);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--primary-light, #fef3ef);
  color: var(--primary, #d97757);
}

.nav-link.active {
  background: var(--primary-light, #fef3ef);
  color: var(--primary, #d97757);
}

/* ===== 右侧用户区域 ===== */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary, #d97757);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-avatar.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.user-avatar.clickable:hover {
  box-shadow: 0 0 0 3px var(--primary-light, #fef3ef);
}

.user-name {
  font-size: 14px;
  color: var(--ink, #2c2c2c);
  font-weight: 500;
  white-space: nowrap;
}

.btn-logout {
  background: transparent;
  border: 1px solid var(--hairline-strong, #d5cdc0);
  color: var(--muted, #6b6b6b);
  padding: 5px 14px;
  font-size: 13px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-weight: 500;
  white-space: nowrap;
}

.btn-logout:hover {
  border-color: var(--primary, #d97757);
  color: var(--primary, #d97757);
  background: var(--primary-light, #fef3ef);
}

/* ===== 底部导航（移动端） ===== */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface, #ffffff);
  border-top: 1px solid var(--hairline, #e8e0d5);
  z-index: 999;
  justify-content: space-around;
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--muted-soft, #9f9f9f);
  font-size: 11px;
  padding: 4px 16px;
  transition: color 0.2s;
  gap: 2px;
}

.mobile-nav-item.active {
  color: var(--primary, #d97757);
}

.nav-text {
  font-weight: 500;
}

/* ===== 主内容区域 ===== */
main {
  min-height: calc(100vh - 72px);
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

main.has-mobile-nav {
  padding-bottom: 70px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .navbar {
    height: 56px;
    padding: 0 16px;
  }

  .nav-center {
    display: none;
  }

  .brand-text {
    font-size: 1em;
  }

  .mobile-nav {
    display: flex;
  }

  main {
    padding: 16px;
  }

  .user-name {
    display: none;
  }
}
</style>
