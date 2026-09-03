import { createApp } from 'vue'
// 全局样式只存放设计变量、基础重置和通用无障碍工具类。
import './style.css'
import App from './App.vue'

// 创建 Vue 应用并挂载到 index.html 中的 #app 节点。
createApp(App).mount('#app')
