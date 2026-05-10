// src/api/teacher.js
import request from '@/utils/request'

// ========== 试卷管理 (对应文档 一) ==========
export const getExamPapers = (params) => {
    return request({
        url: '/api/exam/papers/',
        method: 'get',
        params
    })
}

export const createExamPaper = (data) => {
    return request({
        url: '/api/exam/papers/',
        method: 'post',
        data
    })
}

export const autoGeneratePaper = (data) => {
    return request({
        url: '/api/exam/papers/auto_generate/',
        method: 'post',
        data
    })
}

export const addQuestionToPaper = (paperId, data) => {
    return request({
        url: `/api/exam/papers/${paperId}/add_question/`,
        method: 'post',
        data
    })
}

export const publishPaper = (paperId) => {
    return request({
        url: `/api/exam/papers/${paperId}/publish/`,
        method: 'post'
    })
}

// ========== 班级管理 (对应文档 三) ==========
export const getClasses = () => {
    return request({
        url: '/api/users/classes/',
        method: 'get'
    })
}

export const getClassStudents = (classId) => {
    return request({
        url: `/api/users/classes/${classId}/students/`,
        method: 'get'
    })
}

export const addStudentToClass = (classId, data) => {
    return request({
        url: `/api/users/classes/${classId}/add_student/`,
        method: 'post',
        data
    })
}

// ========== 成绩统计 (对应文档 四) ==========
export const getPaperStatistics = (paperId) => {
    return request({
        url: `/api/exam/papers/${paperId}/statistics/`,
        method: 'get'
    })
}

export const getClassStatistics = (params) => {
    return request({
        url: '/api/exam/papers/class_statistics/',
        method: 'get',
        params
    })
}