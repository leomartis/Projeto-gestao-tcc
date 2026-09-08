<script setup lang="ts">
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.authIsReady" class="app-container">
    <router-view />
  </div>
</template>
