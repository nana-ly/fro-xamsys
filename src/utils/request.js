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

export default request
