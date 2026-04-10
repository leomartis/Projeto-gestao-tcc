import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useAuthStore } from './stores/authStore'
import './style.css'
import App from './App.vue'
import router from './router/index'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(router)

app.mount('#app')

onAuthStateChanged(auth, (user) => {
  const authStore = useAuthStore()

  if (user) {
    authStore.setUser(user)
  } else {
    authStore.setUser(null)
  }

  authStore.setAuthIsReady(true)
})
