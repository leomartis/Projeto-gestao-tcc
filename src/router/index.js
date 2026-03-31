// ============================================================================
// ARQUIVO: router/index.js
// ============================================================================

import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Importa os componentes das telas
import EstoquesView from '../views/Estoques.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

// ---------------------------------------------------------------------------
// DEFINIÇÃO DAS ROTAS
// ---------------------------------------------------------------------------
const routes = [
  {
    path: '/',
    name: 'home',
    component: EstoquesView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    // Exige que o usuário esteja logado (Aula 3)
    meta: { requiresAuth: true }
  }
]

// ---------------------------------------------------------------------------
// CRIAÇÃO DO GERENCIADOR DE ROTAS (APENAS UMA VEZ)
// ---------------------------------------------------------------------------
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ---------------------------------------------------------------------------
// CONTROLE DE ACESSO (Navigation Guard)
// ---------------------------------------------------------------------------
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  // Verifica se a rota destino possui a marcação de 'requiresAuth'
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Lógica de redirecionamento moderno (sem usar next)
  if (requiresAuth && !authStore.user) {
    return '/login'
  }

  // Se já estiver logado e tentar ir para o login, manda para o dashboard
  if (to.path === '/login' && authStore.user) {
    return '/dashboard'
  }

  return true
})

export default router