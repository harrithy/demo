import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 启动开发服务器后，自动使用系统默认浏览器打开页面。
  server: {
    open: true,
  },
})
