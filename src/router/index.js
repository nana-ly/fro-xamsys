import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/teacher/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/teacher/Register.vue')
    },
    {
        path: '/teacher',
        component: () => import('@/layouts/TeacherLayout.vue'),
        redirect: '/teacher/question-bank',
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
            }
        ]
    }
    // 学生端路由暂时注释掉，等成员五添加后再启用
    // {
    //   path: '/student',
    //   component: () => import('@/layouts/StudentLayout.vue'),
    //   redirect: '/student/home',
    //   children: [
    //     {
    //       path: 'home',
    //       name: 'StudentHome',
    //       component: () => import('@/views/student/Home.vue'),
    //       meta: { title: '学生首页' }
    //     }
    //   ]
    // }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// 路由守卫
//router.beforeEach((to, from, next) => {
//    const publicPages = ['/login', '/register']
//    if (publicPages.includes(to.path)) {
//        next()
//        return
//    }
//
//    const token = localStorage.getItem('token')
//    if (!token && to.path.startsWith('/teacher')) {
//        next('/login')
//        return
//    }
//
//    next()
//})

export default router