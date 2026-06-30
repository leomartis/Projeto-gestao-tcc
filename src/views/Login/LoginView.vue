<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')
const router   = useRouter()

const login = async () => {
  if (!email.value || !password.value) { error.value = 'Preencha todos os campos'; return }
  loading.value = true
  error.value   = ''
  try {
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
      } else { throw e }
    }
    await router.push('/dashboard')
  } catch (e: any) {
    const msgs: Record<string, string> = {
      'auth/wrong-password':    'Senha incorreta.',
      'auth/invalid-email':     'Email inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
    }
    error.value = msgs[(e as any).code] ?? 'Erro ao entrar. Verifique suas credenciais.'
  }
  loading.value = false
}
</script>

<template>
  <div class="lp-page">

    <div class="lp-card">
      <div class="lp-logo">
        <span class="lp-logo-icon">GJ</span>
        <span class="lp-logo-name">Gestão Jeans</span>
      </div>

      <h1 class="lp-title">Bem-vindo </h1>
      <p class="lp-sub">Entre com suas credenciais para continuar.</p>

      <form @submit.prevent="login" class="lp-form">

        <div class="lp-field">
          <label>E-mail</label>
          <input type="email" v-model="email" placeholder="seu@email.com" autocomplete="email" required />
        </div>

        <div class="lp-field">
          <label>Senha</label>
          <input type="password" v-model="password" placeholder="••••••••" autocomplete="current-password" required />
        </div>

        <p v-if="error" class="lp-error">{{ error }}</p>

        <button class="lp-btn" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

      </form>
    </div>

  </div>
</template>

<style scoped src="./LoginView.css"></style>
