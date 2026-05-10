import { createRouter, createWebHistory } from 'vue-router'

// 学生端页面
import StudentHome from '../views/student/StudentHome.vue'
import ExamPage from '../views/student/ExamPage.vue'
import WrongBook from '../views/student/WrongBook.vue'
import Profile from '../views/student/Profile.vue'

// 登录页（公共）
const Login = () => import('../views/student/Login.vue')

const routes = [
  {
    path: '/',
    redirect: '/student/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  // 学生端路由
  {
    path: '/student',
    redirect: '/student/home'
  },
  {
    path: '/student/home',
    name: 'StudentHome',
    component: StudentHome,
    meta: { 
      title: '学生首页',
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/student/exam/:id?',
    name: 'ExamPage',
    component: ExamPage,
    meta: { 
      title: '考试答题',
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/student/wrong-book',
    name: 'WrongBook',
    component: WrongBook,
    meta: { 
      title: '错题本',
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/student/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      title: '个人中心',
      requiresAuth: true,
      role: 'student'
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/student/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
/*router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 知识聚合考试平台` : '知识聚合考试平台'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      // 未登录，跳转登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    // 检查角色权限
    if (to.meta.role && userRole !== to.meta.role) {
      next({ path: '/login' })
      return
    }
  }
  
  next()
})*/

export default router