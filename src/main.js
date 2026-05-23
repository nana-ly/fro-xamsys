import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入ECharts
import VueECharts from 'vue-echarts'

// 学生端全局样式
import './assets/main.css'

// 忽略 ResizeObserver loop 警告
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) e.stopImmediatePropagation()
})
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver loop')) e.preventDefault()
})

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 注册ECharts组件
app.component('v-chart', VueECharts)

app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
