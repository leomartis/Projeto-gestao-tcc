import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useAuthStore } from './stores/authStore'
import './style.css'
import App from './App.vue'
import router from './router/index'

const app = createApp(App)

// Registrar Pinia store
const pinia = createPinia()
app.use(pinia)

// Registrar Vue Router
app.use(router)

// Montar aplicação
app.mount('#app')

// Configurar listener do Firebase para autenticação
onAuthStateChanged(auth, (user) => {
  const authStore = useAuthStore()
  
  if (user) {
    authStore.setUser(user)
  } else {
    authStore.setUser(null)
  }
  
  // Marcar que Firebase terminou de inicializar
  authStore.setAuthIsReady(true)
})
