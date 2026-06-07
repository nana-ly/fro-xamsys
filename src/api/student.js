import axios from 'axios'
import { ElMessage } from 'element-plus'

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
      const url = error.config?.url || ''
      const method = (error.config?.method || '').toUpperCase()
      // POST /progress/ 不跳登录（自动保存/心跳，已有静默处理）
      const silentUrls = ['/progress/']
      const isSilent = silentUrls.some(u => url.includes(u))
      if (method === 'GET') {
        // GET 401：不跳登录，但给用户轻提示（数据加载失败，刷新可恢复）
        ElMessage.warning('登录信息已过期，请刷新页面后使用')
      } else if (!isSilent) {
        const path = window.location.pathname
        if (path !== '/login') {
          const role = path.startsWith('/teacher') ? 'teacher' : 'student'
          ElMessage.error('请重新登录')
          window.location.href = `/login?role=${role}`
        }
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

// ===================== 班级相关 =====================

// 通过班级码加入班级
export function joinClass(classCode) {
  return api.post('/users/student-classes/join/', { class_code: classCode })
}

// 获取已加入的班级列表
export function getMyClasses() {
  return api.get('/users/student-classes/')
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
export function submitExam(examId, answers, examRecordId = null) {
  const payload = { answers }
  if (examRecordId) payload.exam_record_id = examRecordId
  return api.post(`/student/exams/${examId}/submit/`, payload)
}

// 保存答题进度（自动保存 + 服务端超时验证）
export function saveProgress(examId, answers) {
  return api.post(`/student/exams/${examId}/progress/`, { answers })
}

// ===================== 错题本相关 =====================

// 获取错题本列表
export function getWrongBook(params = {}) {
  return api.get('/student/wrongbook/', { params, timeout: 30000 })
}

// 获取错题统计（只返回数量，用于首页）
export function getWrongCount() {
  return api.get('/student/wrongbook/', { params: { summary: 'true' } })
}

// 手动添加错题
// 手动添加错题（兼容两种调用方式：对象参数 / 三个位置参数）
export function addWrongQuestion(questionIdOrData, sourceType = 'main', wrongAnswer = '') {
  if (typeof questionIdOrData === 'object' && questionIdOrData !== null) {
    return api.post('/student/wrongbook/add/', questionIdOrData)
  }
  return api.post('/student/wrongbook/add/', {
    question_id: questionIdOrData,
    source_type: sourceType,
    wrong_answer: wrongAnswer
  })
}

// 删除错题
export function deleteWrongQuestion(wrongId) {
  return api.delete(`/student/wrongbook/${wrongId}/`)
}

// 标记/取消标记已掌握
export function toggleMaster(wrongId, isMastered) {
  return api.patch(`/student/wrongbook/${wrongId}/master/`, { is_mastered: isMastered })
}

// ===================== AI相关 =====================

// AI出题
export function aiGenerateQuestion(knowledgePoint, questionType = 'choice', difficulty = 'medium', count = 5, targetLibrary = 'main') {
  return api.post('/student/ai/generate_question/', {
    knowledge_point: knowledgePoint,
    question_type: questionType,
    difficulty: difficulty,
    count: count,
    target_library: targetLibrary
  }, { timeout: 60000 })
}

// AI问答（对错题提问）
// AI问答（兼容3参数旧调用）
export function aiAskQuestion(questionId, studentQuestion, sourceType = 'main') {
  return api.post('/student/ai/ask/', {
    question_id: questionId,
    student_question: studentQuestion,
    source_type: sourceType
  }, { timeout: 60000 })
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

// 更新学生个人信息（真实姓名、手机号、邮箱）
export function updateProfile(data) {
  return api.put('/student/profile/', data)
}

// 修改密码（需要旧密码）
export function changePassword(data) {
  return api.post('/student/change_password/', data)
}

// 忘记密码重置
export function forgotPassword(data) {
  return api.post('/student/forgot-password/', data)
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
  return api.get('/student/practice/records/', { params, timeout: 30000 })
}

// ===================== 学习会话相关 =====================

// 开始学习时段
export function startSession() {
  return api.post('/student/start_session/')
}

// 结束学习时段
export function endSession() {
  return api.post('/student/end_session/')
}

// ===================== 学习统计相关 =====================

// 获取今日做题统计（做题数、正确率、已学时长）
export function getDailyStats() {
  return api.get('/student/daily_stats/')
}

// 获取知识点掌握分布
export function getKnowledgeStats() {
  return api.get('/student/knowledge_stats/')
}

// 获取学习时长统计（总量 + 今日/本周/本月 + 每日分布）
export function getStudyDurationStats() {
  return api.get('/student/duration_stats/')
}

// 获取考试记录（用于学习统计）
export function getExamRecords() {
  return api.get('/exam/records/')
}

// 获取学习活跃度数据（可选 year/month 参数获取某月每天数据）
export function getStudyActivity(params = {}) {
  return api.get('/student/activity/', { params })
}

// 获取错题统计数据
export function getWrongStats() {
  return api.get('/student/wrongbook/')
}

// 获取练习和考试记录（历史）
export function getHistoryRecords(params = {}) {
  return api.get('/student/practice/records/', { params })
}

// 获取某次做题记录的题目详情
export function getRecordDetail(recordId) {
  return api.get(`/student/practice/records/${recordId}/detail/`)
}

// ===================== 个人资料相关 =====================

// 获取学生个人资料
export function getProfile() {
  return api.get('/student/profile/')
}

export default api