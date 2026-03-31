<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // O Firebase listener no main.ts vai atualizar o authStore automaticamente
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dashboard-container">
    <div class="login-form">
      <h2>Login - Gestão Jeans</h2>

      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  width: min(100%, 720px);
  max-width: 720px;
  border: 1px solid #e5e4e7;
  margin: 0 30px;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e4e7;
  border-radius: 6px;
  font-size: 18px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background-color: #aa3bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1.2rem;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #08060d;
  font-size: 24px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #6b6375;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e4e7;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #aa3bff;
  box-shadow: 0 0 0 2px rgba(170, 59, 255, 0.1);
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #aa3bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #9a2be8;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  font-size: 14px;
}
</style>
