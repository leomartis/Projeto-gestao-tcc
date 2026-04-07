<template>
  <div class="estoque-container">
    <div class="estoque-card">
      <h1>Estoque</h1>
      <p>Bem-vindo à página de estoque. Você já está logado.</p>
      <p>Usuário: <strong>{{ authStore.user?.email || 'Usuário' }}</strong></p>
      <button @click="logout">Sair</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  await router.push('/login')
}
</script>

<style scoped src="./Estoques.css"></style>
