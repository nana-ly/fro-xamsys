// Login.vue 的 handleLogin 方法改为：
const handleLogin = async () => {
await loginFormRef.value.validate()
loading.value = true
try {
// 1. 先 GET 登录页拿 CSRF Token
await fetch('http://127.0.0.1:8000/api/users/auth/login/', {
credentials: 'include'
})

// 2. 获取 Token
const csrfToken = getCookie('csrftoken')

// 3. 真正登录
const res = await fetch('http://127.0.0.1:8000/api/users/auth/login/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'X-CSRFToken': csrfToken
},
credentials: 'include',
body: JSON.stringify({
username: loginForm.username,
password: loginForm.password
})
})

if (res.ok) {
localStorage.setItem('userInfo', JSON.stringify({ username: loginForm.username }))
ElMessage.success('登录成功')
router.push('/teacher/question-bank')
} else {
ElMessage.error('登录失败')
}
} catch (error) {
ElMessage.error(error.message || '登录失败')
} finally {
loading.value = false
}
}