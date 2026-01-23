import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant UI
import Vant from 'vant'
import 'vant/lib/index.css'

// VConsole (开发环境)
if (import.meta.env.DEV) {
  import('vconsole').then((VConsole) => {
    new VConsole.default()
  })
}

// Touch Emulator (桌面端模拟移动端触摸)
import '@vant/touch-emulator'

// 全局样式
import './styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')
