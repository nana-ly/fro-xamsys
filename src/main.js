import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// 引入ECharts
import * as echarts from 'echarts'

const app = createApp(App)

// 全局挂载echarts
app.config.globalProperties.$echarts = echarts

app.use(router)
app.mount('#app')