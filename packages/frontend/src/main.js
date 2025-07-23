import './assets/tailwind.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'
import 'element-plus/dist/index.css' // 引入element-plus样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/main.css' // 引入全局样式

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(router)
app.use(ElementPlus)
app.mount('#app')
