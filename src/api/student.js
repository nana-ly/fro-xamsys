import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器 - 添加CSRF token 和 Authorization
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken')
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  const token = localStorage.getItem('token')
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
        window.location.href = '/login'
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

// 手动添加错题（支持 source_type 和 wrong_answer）
export function addWrongQuestion(questionId, sourceType = 'main', wrongAnswer = '') {
  return api.post('/student/wrongbook/add/', {
    question_id: questionId,
    source_type: sourceType,
    wrong_answer: wrongAnswer
  })
}

// 标记/取消标记已掌握
export function toggleMaster(wrongId, isMastered) {
  return api.patch(`/student/wrongbook/${wrongId}/master/`, { is_mastered: isMastered })
}

// ===================== AI相关 =====================

// AI出题（支持target_library和count）
export function aiGenerateQuestion(knowledgePoint, questionType = 'choice', difficulty = 'medium', count = 1, targetLibrary = 'main') {
  return api.post('/student/ai/generate_question/', {
    knowledge_point: knowledgePoint,
    question_type: questionType,
    difficulty: difficulty,
    count: count,
    target_library: targetLibrary
  })
}

// AI问答（对错题提问，支持source_type）
export function aiAskQuestion(questionId, studentQuestion, sourceType = 'main') {
  return api.post('/student/ai/ask/', {
    question_id: questionId,
    student_question: studentQuestion,
    source_type: sourceType
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

// ===================== 学习统计相关 =====================

// 获取考试记录（用于学习统计）
export function getExamRecords() {
  return api.get('/exam/records/')
}

// 获取错题统计数据
export function getWrongStats() {
  return api.get('/student/wrongbook/')
}

// ===================== 练习模式相关 =====================

// 从题库抽题练习
export function getPracticeQuestions(params = {}) {
  return api.get('/student/practice/', { params })
}

// 提交练习答案
export function submitPracticeAnswers(answers) {
  return api.post('/student/practice/', { answers })
}

// ===================== 做题记录相关 =====================

// 获取做题记录
export function getPracticeRecords(params = {}) {
  return api.get('/student/practice/records/', { params })
}

// 保存一条做题记录
export function savePracticeRecord(data) {
  return api.post('/student/practice/records/', data)
}

// ===================== 学习活跃度 =====================

// 获取学习活跃度（用于热力图）
export function getStudyActivity() {
  return api.get('/student/activity/')
}

export default api