import { createRouter, createWebHistory } from 'vue-router'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import QuestionBank from '@/views/teacher/QuestionBank.vue'

import ClassManage from '@/views/teacher/ClassManage.vue'
import ScoreView from '@/views/teacher/ScoreView.vue'
import ExamList from '@/views/teacher/ExamList.vue'
import TeacherProfile from '@/views/teacher/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  // ===== 首页 =====
  {
    path: '/home',
    name: 'LandingPage',
    component: () => import('@/views/auth/LandingPage.vue'),
    meta: { title: '首页' }
  },
  // ===== 身份选择页 =====
  {
    path: '/role-select',
    name: 'RoleSelect',
    component: () => import('@/views/auth/RoleSelect.vue'),
    meta: { title: '选择身份' }
  },
  // ===== 登录页 =====
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录' }
  },
  // ===== 注册页 =====
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册' }
  },
  // ===== 教师端路由 =====
  {
    path: '/teacher',
    component: TeacherLayout,
    redirect: '/teacher/question-bank',
    meta: { role: 'teacher' },
    children: [
      {
        path: 'question-bank',
        name: 'QuestionBank',
        component: QuestionBank,
        meta: { title: '题库管理' }
      },
      {
        path: 'class-manage',
        name: 'ClassManage',
        component: ClassManage,
        meta: { title: '班级管理' }
      },
      {
        path: 'score-view',
        name: 'ScoreView',
        component: ScoreView,
        meta: { title: '成绩查看' }
      },
      {
        path: 'exam-list',
        name: 'ExamList',
        component: ExamList,
        meta: { title: '试卷管理' }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: TeacherProfile,
        meta: { title: '个人信息' }
      }
    ]
  },
  // ===== 学生端路由 =====
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    redirect: '/student/home',
    meta: { role: 'student' },
    children: [
      {
        path: 'home',
        name: 'StudentHome',
        component: () => import('@/views/student/StudentHome.vue'),
        meta: { title: '学生首页' }
      },
      {
        path: 'exam/:id?',
        name: 'ExamPage',
        component: () => import('@/views/student/ExamPage.vue'),
        meta: { title: '考试答题' }
      },
      {
        path: 'practice',
        name: 'PracticePage',
        component: () => import('@/views/student/PracticePage.vue'),
        meta: { title: '练习模式' }
      },
      {
        path: 'wrongbook',
        name: 'WrongBook',
        component: () => import('@/views/student/WrongBook.vue'),
        meta: { title: '错题本' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/student/History.vue'),
        meta: { title: '学习记录' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/student/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/student/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 知识聚合智学平台` : '知识聚合智学平台'

  // 公开路由
  const publicPaths = ['/login', '/register', '/role-select', '/home']
  if (publicPaths.includes(to.path)) {
    next()
    return
  }

  // 根据目标路由确定角色前缀
  const targetRole = to.path.startsWith('/teacher') ? 'teacher' : 'student'
  const prefix = targetRole
  // 优先读 sessionStorage（当前标签页），其次读 localStorage（跨标签页）
  const token = sessionStorage.getItem(`${prefix}_token`) || localStorage.getItem(`${prefix}_token`)
  if (!token) {
    next(`/login?role=${targetRole}`)
    return
  }

  // 角色权限检查
  const userRole = sessionStorage.getItem(`${prefix}_userRole`) || localStorage.getItem(`${prefix}_userRole`)
  if (to.meta.role && userRole && to.meta.role !== userRole) {
    next(`/login?role=${to.meta.role}`)
    return
  }

  next()
})

export default router
