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
const origError = window.onerror
window.onerror = function(msg) {
  if (typeof msg === 'string' && msg.includes('ResizeObserver')) return true
  if (origError) return origError.apply(this, arguments)
}
window.addEventListener('error', e => {
  if (e.message?.includes('ResizeObserver')) e.stopImmediatePropagation()
}, true)

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
