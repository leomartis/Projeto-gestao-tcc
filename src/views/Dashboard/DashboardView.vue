<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { LayoutDashboard, CalendarDays, Package, Users, Wallet, Scissors, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const searchText = ref('')

// ── Firestore listeners ────────────────────────────────────────────────────
type Lancamento = { id: string; descricao: string; tipo: string; categoria: string; vencimento: string; valor: number; status: string }
type Pessoa     = { id: string; tipo: string; ativo: boolean }
type Item       = { id: string; referencia: string; cor: string; quantidade: number }
type Faccao     = { id: string; qtdEnviada: number; qtdRecebida: number; precoPeca: number; data: string }

const lancamentos = ref<Lancamento[]>([])
const pessoas     = ref<Pessoa[]>([])
const estoque     = ref<Item[]>([])
const producao    = ref<Faccao[]>([])

const unsubs: (() => void)[] = []

onMounted(() => {
  unsubs.push(onSnapshot(collection(db, 'financeiro'), s => { lancamentos.value = s.docs.map(d => ({ id: d.id, ...d.data() } as Lancamento)) }))
  unsubs.push(onSnapshot(collection(db, 'pessoas'),    s => { pessoas.value     = s.docs.map(d => ({ id: d.id, ...d.data() } as Pessoa)) }))
  unsubs.push(onSnapshot(collection(db, 'estoque'),    s => { estoque.value     = s.docs.map(d => ({ id: d.id, ...d.data() } as Item)) }))
  unsubs.push(onSnapshot(collection(db, 'producao'),   s => { producao.value    = s.docs.map(d => ({ id: d.id, ...d.data() } as Faccao)) }))
})
onUnmounted(() => unsubs.forEach(u => u()))

// ── Stats ──────────────────────────────────────────────────────────────────
const totalReceitas  = computed(() => lancamentos.value.filter(l => l.tipo === 'Receita' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const totalDespesas  = computed(() => lancamentos.value.filter(l => l.tipo === 'Despesa' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const saldo          = computed(() => totalReceitas.value - totalDespesas.value)
const totalVencido   = computed(() => lancamentos.value.filter(l => l.status === 'Vencido').reduce((s, l) => s + l.valor, 0))

const totalPessoas   = computed(() => pessoas.value.length)
const totalAtivos    = computed(() => pessoas.value.filter(p => p.ativo).length)
const totalClientes  = computed(() => pessoas.value.filter(p => p.tipo === 'Cliente').length)

const totalPecas     = computed(() => producao.value.reduce((s, f) => s + (f.qtdRecebida || 0), 0))
const valorProducao  = computed(() => producao.value.reduce((s, f) => s + (f.qtdRecebida || 0) * (f.precoPeca || 0), 0))

const totalItensEstoque = computed(() => estoque.value.reduce((s, i) => s + (i.quantidade || 0), 0))

// ── Tabela financeiro ──────────────────────────────────────────────────────
const filteredLancamentos = computed(() => {
  const s = searchText.value.toLowerCase()
  return lancamentos.value
    .filter(l => !s || l.descricao.toLowerCase().includes(s) || l.categoria.toLowerCase().includes(s))
    .slice(0, 20)
})

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const statusBadge = (s: string) => s === 'Pago' ? 'green' : s === 'Pendente' ? 'yellow' : 'red'
const tipoBadge   = (t: string) => t === 'Receita' ? 'green' : 'red'

const toggleMenu = () => { isSidebarCollapsed.value = !isSidebarCollapsed.value }
</script>

<template>
  <div class="dashboard-page">

    <!-- SIDEBAR -->
    <aside :class="['dashboard-side', { collapsed: isSidebarCollapsed }]">
      <div class="brand">
        <div class="brand-logo">G</div>
        <div>
          <span class="brand-title">Gestão Jeans</span>
          <span class="brand-subtitle">Sistema</span>
        </div>
      </div>

      <div class="search-box">
        <input type="text" placeholder="Buscar..." />
      </div>

      <nav class="side-menu">
        <span class="menu-section-label">Principal</span>
        <router-link to="/dashboard"><LayoutDashboard :size="16" /><span>Dashboard</span></router-link>
        <span class="menu-section-label">Módulos</span>
        <router-link to="/agenda"><CalendarDays :size="16" /><span>Agenda</span></router-link>
        <router-link to="/estoques"><Package :size="16" /><span>Estoque</span></router-link>
        <router-link to="/pessoas"><Users :size="16" /><span>Pessoas</span></router-link>
        <router-link to="/financeiro"><Wallet :size="16" /><span>Financeiro</span></router-link>
        <router-link to="/vendas"><Scissors :size="16" /><span>Produção</span></router-link>
        <span class="menu-section-label">Outros</span>
        <router-link to="/dashboard"><Settings :size="16" /><span>Configurações</span></router-link>
      </nav>

      <div class="side-user">
        <div class="side-user-avatar">{{ authStore.user?.email?.slice(0,2).toUpperCase() ?? 'GJ' }}</div>
        <div class="side-user-info">
          <div class="side-user-name">{{ authStore.user?.email?.split('@')[0] ?? 'Usuário' }}</div>
          <div class="side-user-email">{{ authStore.user?.email ?? '' }}</div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="dashboard-main">

      <!-- TOP BAR -->
      <div class="top-bar">
        <div class="top-bar-left">
          <button class="menu-btn" @click="toggleMenu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          <div class="welcome-text">
            <h2>Bem-vindo, {{ authStore.user?.email?.split('@')[0] ?? 'Usuário' }}!</h2>
            <p>Aqui está o resumo do seu sistema</p>
          </div>
        </div>
        <div class="top-bar-right">
          <div class="period-badge"><CalendarDays :size="14" /> Este mês</div>
          <div class="user-chip">
            <div class="user-avatar">{{ authStore.user?.email?.slice(0,2).toUpperCase() ?? 'GJ' }}</div>
            <span class="user-name">{{ authStore.user?.email ?? 'Usuário' }}</span>
          </div>
        </div>
      </div>

      <!-- STATS: FINANCEIRO -->
      <div class="dash-section-title">Financeiro</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Receitas</div>
          <div class="stat-value">{{ fmt(totalReceitas) }}</div>
          <div class="stat-footer"><span class="stat-pill up">Pago</span> receitas confirmadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Despesas</div>
          <div class="stat-value">{{ fmt(totalDespesas) }}</div>
          <div class="stat-footer"><span class="stat-pill down">Pago</span> despesas quitadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Saldo Líquido</div>
          <div class="stat-value">{{ fmt(saldo) }}</div>
          <div class="stat-footer"><span :class="['stat-pill', saldo >= 0 ? 'up' : 'down']">{{ saldo >= 0 ? 'Positivo' : 'Negativo' }}</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Em Atraso</div>
          <div class="stat-value">{{ fmt(totalVencido) }}</div>
          <div class="stat-footer"><span class="stat-pill down">Vencido</span> a regularizar</div>
        </div>
      </div>

      <!-- STATS: MÓDULOS -->
      <div class="dash-section-title">Módulos</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Produção Recebida</div>
          <div class="stat-value">{{ totalPecas.toLocaleString('pt-BR') }}</div>
          <div class="stat-footer"><span class="stat-pill neu">peças</span> total acumulado</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Valor Produção</div>
          <div class="stat-value">{{ fmt(valorProducao) }}</div>
          <div class="stat-footer"><span class="stat-pill neu">Total</span> em facção</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pessoas Cadastradas</div>
          <div class="stat-value">{{ totalPessoas }}</div>
          <div class="stat-footer"><span class="stat-pill neu">{{ totalAtivos }} ativos</span> · {{ totalClientes }} clientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Estoque Total</div>
          <div class="stat-value">{{ totalItensEstoque.toLocaleString('pt-BR') }}</div>
          <div class="stat-footer"><span class="stat-pill neu">peças</span> · {{ estoque.length }} referências</div>
        </div>
      </div>

      <!-- TABELA LANÇAMENTOS -->
      <div class="table-panel">
        <div class="panel-header">
          <span class="panel-title">Lançamentos Financeiros</span>
          <div class="panel-actions">
            <input class="search-input" v-model="searchText" type="text" placeholder="Buscar..." />
            <router-link to="/financeiro"><button class="btn-filter">Financeiro →</button></router-link>
            <router-link to="/vendas"><button class="btn-filter">Produção →</button></router-link>
            <router-link to="/estoques"><button class="btn-primary">+ Estoque</button></router-link>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLancamentos.length === 0">
              <td colspan="6" style="text-align:center;color:#9ca3af;padding:32px;font-size:0.85rem">
                Nenhum lançamento encontrado
              </td>
            </tr>
            <tr v-for="l in filteredLancamentos" :key="l.id">
              <td><span :class="['badge', tipoBadge(l.tipo)]">{{ l.tipo }}</span></td>
              <td style="color:#6b7280">{{ l.categoria }}</td>
              <td style="font-weight:500">{{ l.descricao }}</td>
              <td style="color:#6b7280">{{ l.vencimento }}</td>
              <td style="font-weight:600">{{ fmt(l.valor) }}</td>
              <td><span :class="['badge', statusBadge(l.status)]">{{ l.status }}</span></td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer">
          Mostrando {{ filteredLancamentos.length }} de {{ lancamentos.length }} lançamentos
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped src="./DashboardView.css"></style>
