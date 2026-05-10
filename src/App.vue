<template>
  <div id="app">
    <!-- 顶部导航栏（学生端） -->
    <nav class="navbar" v-if="showNavbar && userRole === 'student'">
      <div class="navbar-brand">📚 知识聚合考试平台</div>
      <div class="navbar-user">
        <span>👨‍🎓 {{ userName }}</span>
        <button class="btn btn-sm btn-outline" @click="logout" style="color: white; border-color: white;">
          退出登录
        </button>
      </div>
    </nav>

    <!-- 底部导航栏（移动端） -->
    <div class="mobile-nav" v-if="showMobileNav && userRole === 'student'">
      <router-link to="/student/home" class="mobile-nav-item" :class="{ active: isActive('/student/home') }">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>
      <router-link to="/student/wrong-book" class="mobile-nav-item" :class="{ active: isActive('/student/wrong-book') }">
        <span class="nav-icon">📝</span>
        <span class="nav-text">错题本</span>
      </router-link>
      <router-link to="/student/profile" class="mobile-nav-item" :class="{ active: isActive('/student/profile') }">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我的</span>
      </router-link>
    </div>

    <!-- 主内容区域 -->
    <main :class="{ 'has-mobile-nav': showMobileNav && userRole === 'student' }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const userName = ref('')
const userRole = ref('')

// 是否显示顶部导航栏
const showNavbar = computed(() => {
  const noNavbarRoutes = ['/login']
  return !noNavbarRoutes.includes(route.path)
})

// 是否显示移动端底部导航
const showMobileNav = computed(() => {
  const studentRoutes = ['/student/home', '/student/wrong-book', '/student/profile']
  return studentRoutes.includes(route.path) && window.innerWidth <= 768
})

// 判断当前路由是否激活
function isActive(path) {
  return route.path === path
}

// 退出登录
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  router.push('/login')
}

onMounted(() => {
  userName.value = localStorage.getItem('userName') || '学生'
  userRole.value = localStorage.getItem('userRole') || 'student'
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    // 触发响应式更新
  })
})
</script>

<style>
/* 移动端底部导航 */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e8e8e8;
  z-index: 999;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #999;
  font-size: 0.75em;
  padding: 4px 12px;
  transition: color 0.3s;
}

.mobile-nav-item.active {
  color: #667eea;
}

.mobile-nav-item .nav-icon {
  font-size: 1.4em;
  margin-bottom: 2px;
}

.has-mobile-nav {
  padding-bottom: 60px;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
  }
  
  .navbar {
    padding: 10px 15px;
  }
  
  .navbar-brand {
    font-size: 1.1em;
  }
}
</style>