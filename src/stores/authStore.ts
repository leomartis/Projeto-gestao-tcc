import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client'

type AuthUser = { email: string }

const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const authIsReady = ref(false)

  const login = async (email: string, senha: string) => {
    const { token, user: loggedUser } = await api.post<{ token: string; user: AuthUser }>('/login', { email, senha })
    localStorage.setItem('token', token)
    user.value = loggedUser
  }

  const logout = () => {
    localStorage.removeItem('token')
    user.value = null
  }

  const init = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const { user: currentUser } = await api.get<{ user: AuthUser }>('/me')
        user.value = currentUser
      } catch {
        localStorage.removeItem('token')
        user.value = null
      }
    }
    authIsReady.value = true
  }

  return {
    user,
    authIsReady,
    login,
    logout,
    init,
  }
})

export { useAuthStore }
