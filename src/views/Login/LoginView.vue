<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

const validEmail = 'admin@jeans.com'
const validPassword = '123456'

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }

  loading.value = true
  error.value = ''

  if (email.value === validEmail && password.value === validPassword) {
    authStore.setUser({ email: validEmail })
    await router.push('/dashboard')
  } else {
    error.value = 'Email ou senha inválidos. Use admin@jeans.com / 123456'
  }

  loading.value = false
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login - Gestão Jeans</h2>

      <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" placeholder="admin@jeans.com" required />

        <label for="password">Senha:</label>
        <input id="password" v-model="password" type="password" placeholder="123456" required />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped src="./LoginView.css"></style>
