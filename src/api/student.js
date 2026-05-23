import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器 - 添加CSRF token 和 认证Token
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('student_csrfToken') || localStorage.getItem('csrfToken')
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  // 添加 Authorization token（优先当前标签页 session，再读 localStorage）
  const token = sessionStorage.getItem('student_token') || localStorage.getItem('student_token')
  if (token && token !== 'true') {
    config.headers['Authorization'] = `Token ${token}`
  }
  return config
})

// 响应拦截器 - 处理401跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname
      if (path !== '/login') {
        const role = path.startsWith('/teacher') ? 'teacher' : 'student'
        window.location.href = `/login?role=${role}`
      }
    }
    return Promise.reject(error)
  }
)

// 获取Cookie
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// ===================== 考试相关 =====================

// 获取学生可参加的试卷列表
export function getExamList() {
  return api.get('/student/exams/')
}

// 获取试卷详情（含题目，不含答案）
export function getExamDetail(examId) {
  return api.get(`/student/exams/${examId}/`)
}

// 开始考试
export function startExam(examId) {
  return api.post(`/student/exams/${examId}/start/`)
}

// 提交答案
export function submitExam(examId, answers) {
  return api.post(`/student/exams/${examId}/submit/`, { answers })
}

// ===================== 错题本相关 =====================

// 获取错题本列表
export function getWrongBook(params = {}) {
  return api.get('/student/wrongbook/', { params })
}

// 手动添加错题
export function addWrongQuestion(questionId) {
  return api.post('/student/wrongbook/add/', { question_id: questionId })
}

// 标记/取消标记已掌握
export function toggleMaster(wrongId, isMastered) {
  return api.patch(`/student/wrongbook/${wrongId}/master/`, { is_mastered: isMastered })
}

// ===================== AI相关 =====================

// AI出题
export function aiGenerateQuestion(knowledgePoint, questionType = 'choice', difficulty = 'medium', count = 5) {
  return api.post('/student/ai/generate_question/', {
    knowledge_point: knowledgePoint,
    question_type: questionType,
    difficulty: difficulty,
    count: count
  }, { timeout: 60000 })
}

// AI问答（对错题提问）
export function aiAskQuestion(questionId, studentQuestion) {
  return api.post('/student/ai/ask/', {
    question_id: questionId,
    student_question: studentQuestion
  })
}

// ===================== 用户认证相关 =====================

// 用户注册
export function register(data) {
  return api.post('/users/auth/register/', data)
}

// 用户登录
export function login(data) {
  return api.post('/users/auth/login/', data)
}

// 用户登出
export function logout() {
  return api.post('/users/auth/logout/')
}

// 获取当前用户信息
export function getCurrentUser() {
  return api.get('/users/auth/me/')
}

// ===================== 练习/题库相关 =====================

// 获取题库列表（用于练习模式）
export function getQuestionBank(params = {}) {
  return api.get('/question-bank/', { params })
}

// 练习模式 - 从题库随机抽题（返回含答案和解析）
export function getPracticeQuestions(params = {}) {
  return api.get('/student/practice/', { params })
}

// 练习模式 - 提交练习答案
export function submitPracticeAnswers(answers) {
  return api.post('/student/practice/', { answers })
}

// 保存单题做题记录
export function savePracticeRecord(data) {
  return api.post('/student/practice/records/', data)
}

// 获取做题记录
export function getPracticeRecords(params = {}) {
  return api.get('/student/practice/records/', { params })
}

// ===================== 学习统计相关 =====================

// 获取考试记录（用于学习统计）
export function getExamRecords() {
  return api.get('/exam/records/')
}

// 获取学习活跃度数据
export function getStudyActivity() {
  return api.get('/student/activity/')
}

// 获取错题统计数据
export function getWrongStats() {
  return api.get('/student/wrongbook/')
}

// 获取练习和考试记录（历史）
export function getHistoryRecords(params = {}) {
  return api.get('/student/practice/records/', { params })
}

export default api