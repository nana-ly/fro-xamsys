import request from '@/utils/request'

// ========== 用户认证 ==========
export const login = (data) => {
    return request({
        url: '/auth/login/',
        method: 'post',
        data
    })
}

export const register = (data) => {
    return request({
        url: '/auth/register/',
        method: 'post',
        data
    })
}

// ========== 题库管理 ==========
export const getQuestionList = (params) => {
    return request({
        url: '/teacher/questions/',
        method: 'get',
        params
    })
}

export const addQuestion = (data) => {
    return request({
        url: '/teacher/questions/',
        method: 'post',
        data
    })
}

export const updateQuestion = (id, data) => {
    return request({
        url: `/teacher/questions/${id}/`,
        method: 'put',
        data
    })
}

export const deleteQuestion = (id) => {
    return request({
        url: `/teacher/questions/${id}/`,
        method: 'delete'
    })
}

// ========== 试卷管理 ==========
export const getExamList = (params) => {
    return request({
        url: '/teacher/exams/',
        method: 'get',
        params
    })
}

export const createExam = (data) => {
    return request({
        url: '/teacher/exams/',
        method: 'post',
        data
    })
}

export const getExamDetail = (id) => {
    return request({
        url: `/teacher/exams/${id}/`,
        method: 'get'
    })
}

export const updateExam = (id, data) => {
    return request({
        url: `/teacher/exams/${id}/`,
        method: 'put',
        data
    })
}

export const deleteExam = (id) => {
    return request({
        url: `/teacher/exams/${id}/`,
        method: 'delete'
    })
}

export const autoGenerateExam = (data) => {
    return request({
        url: '/teacher/exams/auto-generate/',
        method: 'post',
        data
    })
}

// ========== 班级管理 ==========
export const getClassList = (params) => {
    return request({
        url: '/teacher/classes/',
        method: 'get',
        params
    })
}

export const createClass = (data) => {
    return request({
        url: '/teacher/classes/',
        method: 'post',
        data
    })
}

export const updateClass = (id, data) => {
    return request({
        url: `/teacher/classes/${id}/`,
        method: 'put',
        data
    })
}

export const deleteClass = (id) => {
    return request({
        url: `/teacher/classes/${id}/`,
        method: 'delete'
    })
}

export const getClassStudents = (classId) => {
    return request({
        url: `/teacher/classes/${classId}/students/`,
        method: 'get'
    })
}

export const addStudentsToClass = (classId, data) => {
    return request({
        url: `/teacher/classes/${classId}/add-students/`,
        method: 'post',
        data
    })
}

export const removeStudentFromClass = (classId, studentId) => {
    return request({
        url: `/teacher/classes/${classId}/students/${studentId}/`,
        method: 'delete'
    })
}

export const searchStudents = (params) => {
    return request({
        url: '/teacher/students/search/',
        method: 'get',
        params
    })
}

// ========== 成绩管理 ==========
export const getScoreList = (params) => {
    return request({
        url: '/teacher/scores/',
        method: 'get',
        params
    })
}

export const getScoreStatistics = (params) => {
    return request({
        url: '/teacher/scores/statistics/',
        method: 'get',
        params
    })
}

export const getScoreDetail = (id) => {
    return request({
        url: `/teacher/scores/${id}/`,
        method: 'get'
    })
}

export const exportScores = (params) => {
    return request({
        url: '/teacher/scores/export/',
        method: 'get',
        params,
        responseType: 'blob'
    })
}