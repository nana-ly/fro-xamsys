// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: 'http://127.0.0.1:8000',  // 根地址
    timeout: 10000,
    withCredentials: true  // ← 关键！携带 Cookie
})

// 请求拦截器：自动带 CSRF Token
request.interceptors.request.use(
    config => {
        const csrfToken = getCookie('csrftoken')
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response) {
            switch (error.response.status) {
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
                    ElMessage.error(error.response.data?.message || '请求失败')
            }
        }
        return Promise.reject(error)
    }
)

// 从 Cookie 中取值
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
}

export default request