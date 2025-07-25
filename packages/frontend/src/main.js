import './assets/tailwind.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from '@/plugins/vuetify'
import './assets/main.css'

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
