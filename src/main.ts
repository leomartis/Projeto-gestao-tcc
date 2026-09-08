import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'
import './style.css'
import App from './App.vue'
import router from './router/index'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const authStore = useAuthStore()
await authStore.init()

app.use(router)
app.mount('#app')
