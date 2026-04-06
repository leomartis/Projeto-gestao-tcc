<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

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

  setTimeout(async () => {
    if (email.value === validEmail && password.value === validPassword) {
      authStore.setUser({ email: validEmail })
      await router.push('/dashboard')
    } else {
      error.value = 'Email ou senha inválidos'
    }
    loading.value = false
  }, 800)
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Gestão Jeans</h2>
      <p class="subtitle">Acesse sua conta</p>

      <form @submit.prevent="login">
        <div class="input-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="admin@jeans.com" />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="••••••" />
        </div>

        <button type="submit" :disabled="loading">
          <span v-if="!loading">Entrar</span>
          <span v-else class="loader"></span>
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* FUNDO */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6, #6366f1);
  font-family: 'Segoe UI', sans-serif;
}

/* CARD */
.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  border-radius: 24px;

  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);

  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);

  color: white;

  animation: fadeIn 0.6s ease;
}

/* TITULO */
h2 {
  margin: 0;
  font-size: 2rem;
}

.subtitle {
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

/* FORM */
form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* INPUT */
.input-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

input {
  padding: 0.9rem;
  border-radius: 12px;
  border: none;

  background: rgba(255, 255, 255, 0.15);
  color: white;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

input:focus {
  outline: none;
  border: 1px solid #60a5fa;
}

/* BOTÃO */
button {
  margin-top: 0.5rem;
  padding: 0.9rem;
  border-radius: 12px;
  border: none;

  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: white;
  font-weight: bold;

  cursor: pointer;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  transform: scale(1.03);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* LOADING */
.loader {
  width: 18px;
  height: 18px;
  border: 3px solid white;
  border-top: 3px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

/* ERRO */
.error-message {
  margin-top: 0.5rem;
  color: #fca5a5;
  font-size: 0.9rem;
}

/* ANIMAÇÕES */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>