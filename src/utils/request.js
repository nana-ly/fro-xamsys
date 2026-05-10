// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true
})

// 请求拦截器：从 localStorage 读 CSRF Token
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('csrfToken')
        if (token) {
            config.headers['X-CSRFToken'] = token
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
    // 取第一个字段的第一条错误
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
                case 401:
                    ElMessage.error('请先登录')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('权限不足')
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
