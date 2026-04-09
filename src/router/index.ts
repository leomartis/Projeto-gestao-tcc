import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import EstoquesView from '../views/Estoques/Estoques.vue'
import AgendaView from '../views/Agenda/AgendaView.vue'
import PessoasView from '../views/Pessoas/PessoasView.vue'
import FinanceiroView from '../views/Financeiro/FinanceiroView.vue'
import VendasView from '../views/Vendas/VendasView.vue'
import LoginView from '../views/Login/LoginView.vue'
import DashboardView from '../views/Dashboard/DashboardView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/',          name: 'home',       component: LoginView },
  { path: '/login',     name: 'login',      component: LoginView },
  { path: '/dashboard', name: 'dashboard',  component: DashboardView,  meta: { requiresAuth: true } },
  { path: '/agenda',    name: 'agenda',     component: AgendaView,     meta: { requiresAuth: true } },
  { path: '/estoques',  name: 'estoques',   component: EstoquesView,   meta: { requiresAuth: true } },
  { path: '/pessoas',   name: 'pessoas',    component: PessoasView,    meta: { requiresAuth: true } },
  { path: '/financeiro',name: 'financeiro', component: FinanceiroView, meta: { requiresAuth: true } },
  { path: '/vendas',    name: 'vendas',     component: VendasView,     meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
  if (requiresAuth && !authStore.user) return '/login'
  if (to.path === '/login' && authStore.user) return '/dashboard'
  return true
})

export default router
