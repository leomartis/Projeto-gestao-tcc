import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'

const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const authIsReady = ref(false)

  const setUser = (payload: User | null) => {
    user.value = payload
  }

  const setAuthIsReady = (status: boolean) => {
    authIsReady.value = status
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
  }

  return {
    user,
    authIsReady,
    setUser,
    setAuthIsReady,
    logout
  }
})

export { useAuthStore }
