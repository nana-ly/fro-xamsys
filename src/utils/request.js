// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: process.env.VUE_APP_API_URL || '/api',
    timeout: 10000,
    withCredentials: true
})

// 请求拦截器：根据 URL 路径自动判断角色，读取对应 token
request.interceptors.request.use(
    config => {
        const prefix = config.url?.startsWith('/teacher') ? 'teacher' : 'student'
        const csrfToken = localStorage.getItem(`${prefix}_csrfToken`) || localStorage.getItem('csrfToken')
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken
        }
        const token = sessionStorage.getItem(`${prefix}_token`) || localStorage.getItem(`${prefix}_token`)
        if (token && token !== 'true') {
            config.headers['Authorization'] = `Token ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 提取 DRF 错误信息
function extractError(data) {
    if (!data) return '请求失败'
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.detail) return data.detail
    for (const key of Object.keys(data)) {
        const val = data[key]
        if (Array.isArray(val) && val.length > 0) {
            const msg = typeof val[0] === 'string' ? val[0] : val[0].message || JSON.stringify(val[0])
            return key === 'non_field_errors' ? msg : `${key}: ${msg}`
        }
        if (typeof val === 'string') return val
    }
    return '请求失败'
}

// 响应拦截器
request.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response) {
            const data = error.response.data
            switch (error.response.status) {
                case 400:
                    ElMessage.error(extractError(data))
                    break
                case 401: {
                    ElMessage.error('请先登录')
                    const role = window.location.pathname.startsWith('/teacher') ? 'teacher' : 'student'
                    router.push(`/login?role=${role}`)
                    break
                }
                case 403:
                    ElMessage.error(extractError(data) || '权限不足')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(extractError(data))
            }
        }
        return Promise.reject(error)
    }
)

export default request

