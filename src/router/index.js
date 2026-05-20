import { createRouter, createWebHistory } from 'vue-router'

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
    component: () => import('@/layouts/TeacherLayout.vue'),
    redirect: '/teacher/question-bank',
    meta: { role: 'teacher' },
    children: [
      {
        path: 'question-bank',
        name: 'QuestionBank',
        component: () => import('@/views/teacher/QuestionBank.vue'),
        meta: { title: '题库管理' }
      },
      {
        path: 'create-exam',
        name: 'CreateExam',
        component: () => import('@/views/teacher/CreateExam.vue'),
        meta: { title: '创建试卷' }
      },
      {
        path: 'class-manage',
        name: 'ClassManage',
        component: () => import('@/views/teacher/ClassManage.vue'),
        meta: { title: '班级管理' }
      },
      {
        path: 'score-view',
        name: 'ScoreView',
        component: () => import('@/views/teacher/ScoreView.vue'),
        meta: { title: '成绩查看' }
      },
      {
        path: 'exam-list',
        name: 'ExamList',
        component: () => import('@/views/teacher/ExamList.vue'),
        meta: { title: '试卷管理' }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/views/teacher/Profile.vue'),
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
        path: 'wrong-book',
        name: 'WrongBook',
        component: () => import('@/views/student/WrongBook.vue'),
        meta: { title: '错题本' }
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
  document.title = to.meta.title ? `${to.meta.title} - 知识聚合与智能考试平台` : '知识聚合与智能考试平台'

  // 公开路由
  const publicPaths = ['/login', '/register', '/role-select', '/home']
  if (publicPaths.includes(to.path)) {
    next()
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }

  // 角色权限检查
  const userRole = localStorage.getItem('userRole')
  if (to.meta.role && userRole && to.meta.role !== userRole) {
    next(userRole === 'teacher' ? '/teacher' : '/student/home')
    return
  }

  next()
})

export default router
