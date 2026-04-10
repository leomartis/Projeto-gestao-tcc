<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
      } else {
        throw e
      }
    }
    await router.push('/dashboard')
  } catch (e: any) {
    const msgs: Record<string, string> = {
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-email': 'Email inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    }
    error.value = msgs[e.code] ?? 'Erro ao entrar. Verifique suas credenciais.'
  }

  loading.value = false
}
</script>

<template>
  <div class="login-container">
    <div class="login-branding">
      <div class="branding-logo">G</div>
      <div class="branding-title">Gestão Jeans</div>
      <div class="branding-subtitle">Gerencie seu negócio com eficiência e praticidade</div>
      <ul class="branding-features">
        <li><span class="feature-dot"></span>Controle financeiro completo</li>
        <li><span class="feature-dot"></span>Gestão de estoque em tempo real</li>
        <li><span class="feature-dot"></span>Cadastro de clientes e vendas</li>
        <li><span class="feature-dot"></span>Relatórios e rastreamento</li>
      </ul>
    </div>

    <div class="login-form-side">
      <div class="login-box">
        <div class="login-box-header">
          <div class="login-box-logo">G</div>
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para acessar o sistema</p>
        </div>

        <form @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <span class="input-icon">✉</span>
              <input id="email" v-model="email" type="email" placeholder="admin@jeans.com" required />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input id="password" v-model="password" type="password" placeholder="••••••" required />
            </div>
          </div>

          <button class="login-btn" type="submit" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar no sistema' }}
          </button>

        

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped src="./LoginView.css"></style>
