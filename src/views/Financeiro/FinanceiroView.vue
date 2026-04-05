<script setup lang="ts">
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  authStore.setUser(null)
  await router.push('/login')
}
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <h1>Financeiro</h1>
      <p>Esta é a página de financeiro.</p>
      <p>Usuário: <strong>{{ authStore.user?.email || 'Usuário' }}</strong></p>
      <button @click="logout">Sair</button>
    </div>
  </div>
</template>

<style scoped src="./FinanceiroView.css"></style>
