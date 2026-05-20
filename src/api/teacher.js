// src/api/teacher.js
import request from '@/utils/request'

// ========== 用户认证 ==========
export const login = (data) => {
    return request({
        url: '/users/auth/login/',
        method: 'post',
        data
    })
}

export const register = (data) => {
    return request({
        url: '/users/auth/register/',
        method: 'post',
        data
    })
}

export const logout = () => {
    return request({
        url: '/users/auth/logout/',
        method: 'post'
    })
}

export const getCurrentUser = () => {
    return request({
        url: '/users/auth/me/',
        method: 'get'
    })
}

// ========== 题库管理 (对应 question_bank) ==========
export const getQuestionList = (params) => {
    return request({
        url: '/question-bank/',
        method: 'get',
        params
    })
}

export const getQuestionDetail = (id) => {
    return request({
        url: `/question-bank/${id}/`,
        method: 'get'
    })
}

export const addQuestion = (data) => {
    return request({
        url: '/question-bank/',
        method: 'post',
        data
    })
}

export const updateQuestion = (id, data) => {
    return request({
        url: `/question-bank/${id}/`,
        method: 'patch',
        data
    })
}

export const deleteQuestion = (id) => {
    return request({
        url: `/question-bank/${id}/`,
        method: 'delete'
    })
}

export const getKnowledgePoints = () => {
    return request({
        url: '/question-bank/knowledge_points/',
        method: 'get'
    })
}

// ========== 试卷管理 (对应文档 一) ==========
export const getExamPapers = (params) => {
    return request({
        url: '/exam/papers/',
        method: 'get',
        params
    })
}

export const createExamPaper = (data) => {
    return request({
        url: '/exam/papers/',
        method: 'post',
        data
    })
}

export const autoGeneratePaper = (data) => {
    return request({
        url: '/exam/papers/auto_generate/',
        method: 'post',
        data
    })
}

export const addQuestionToPaper = (paperId, data) => {
    return request({
        url: `/exam/papers/${paperId}/add_question/`,
        method: 'post',
        data
    })
}

export const publishPaper = (paperId) => {
    return request({
        url: `/exam/papers/${paperId}/publish/`,
        method: 'post'
    })
}

// ========== 班级管理 ==========
export const getClasses = () => {
    return request({
        url: '/users/classes/',
        method: 'get'
    })
}

// ClassManage 组件使用的别名
export const getClassList = getClasses

export const createClass = (data) => {
    return request({
        url: '/users/classes/',
        method: 'post',
        data
    })
}

export const updateClass = (id, data) => {
    return request({
        url: `/users/classes/${id}/`,
        method: 'patch',
        data
    })
}

export const deleteClass = (id) => {
    return request({
        url: `/users/classes/${id}/`,
        method: 'delete'
    })
}

export const getClassStudents = (classId) => {
    return request({
        url: `/users/classes/${classId}/students/`,
        method: 'get'
    })
}

export const addStudentToClass = (classId, data) => {
    return request({
        url: `/users/classes/${classId}/add_student/`,
        method: 'post',
        data
    })
}

// ClassManage 使用的批量添加学生别名
export const addStudentsToClass = addStudentToClass

export const removeStudentFromClass = (classId, studentId) => {
    return request({
        url: `/users/classes/${classId}/remove_student/`,
        method: 'post',
        data: { student_id: studentId }
    })
}

export const searchStudents = (params) => {
    return request({
        url: '/users/users/',
        method: 'get',
        params
    })
}

// ========== 试卷管理-额外接口 ==========
export const getExamList = (params) => {
    return request({
        url: '/exam/papers/',
        method: 'get',
        params
    })
}

export const getExamDetail = (id) => {
    return request({
        url: `/exam/papers/${id}/`,
        method: 'get'
    })
}

export const getExamQuestions = (id) => {
    return request({
        url: `/exam/papers/${id}/questions/`,
        method: 'get'
    })
}

export const createExam = (data) => {
    return request({
        url: '/exam/papers/',
        method: 'post',
        data
    })
}

export const updateExam = (id, data) => {
    return request({
        url: `/exam/papers/${id}/`,
        method: 'patch',
        data
    })
}

export const deleteExam = (id) => {
    return request({
        url: `/exam/papers/${id}/`,
        method: 'delete'
    })
}

export const autoGenerateExam = (data) => {
    return request({
        url: '/exam/papers/auto_generate/',
        method: 'post',
        data
    })
}

// ========== 成绩统计 ==========
export const getPaperStatistics = (paperId) => {
    return request({
        url: `/exam/papers/${paperId}/statistics/`,
        method: 'get'
    })
}

export const getClassStatistics = (params) => {
    return request({
        url: '/exam/papers/class_statistics/',
        method: 'get',
        params
    })
}

export const getScoreList = (params) => {
    return request({
        url: '/exam/records/',
        method: 'get',
        params
    })
}

export const getScoreStatistics = (params) => {
    return request({
        url: '/exam/records/statistics/',
        method: 'get',
        params
    })
}

export const getScoreDetail = (id) => {
    return request({
        url: `/exam/records/${id}/review/`,
        method: 'get'
    })
}

export const exportScores = (params) => {
    return request({
        url: '/exam/records/export/',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

// ========== AI 智能出题 ==========
export const aiGenerateQuestion = (data) => {
    return request({
        url: '/student/ai/generate_question/',
        method: 'post',
        data
    })
}