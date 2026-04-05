// ============================================================================
// ARQUIVO: router/index.ts
// ============================================================================

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Importa os componentes das telas
// @ts-ignore
import EstoquesView from '../views/Estoques/Estoques.vue'
// @ts-ignore
import AgendaView from '../views/Agenda/AgendaView.vue'
// @ts-ignore
import PessoasView from '../views/Pessoas/PessoasView.vue'
// @ts-ignore
import FinanceiroView from '../views/Financeiro/FinanceiroView.vue'
// @ts-ignore
import VendasView from '../views/Vendas/VendasView.vue'
// @ts-ignore
import RastreioView from '../views/Rastreio/RastreioView.vue'
import LoginView from '../views/Login/LoginView.vue'
import DashboardView from '../views/Dashboard/DashboardView.vue'

// ---------------------------------------------------------------------------
// DEFINIÇÃO DAS ROTAS
// ---------------------------------------------------------------------------
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: LoginView
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
    meta: { requiresAuth: true }
  },
  {
    path: '/agenda',
    name: 'agenda',
    component: AgendaView,
    meta: { requiresAuth: true }
  },
  {
    path: '/estoques',
    name: 'estoques',
    component: EstoquesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/pessoas',
    name: 'pessoas',
    component: PessoasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/financeiro',
    name: 'financeiro',
    component: FinanceiroView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vendas',
    name: 'vendas',
    component: VendasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/rastreio',
    name: 'rastreio',
    component: RastreioView,
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
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)

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
