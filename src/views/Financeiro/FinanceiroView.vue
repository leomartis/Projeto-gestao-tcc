<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const authStore = useAuthStore()

type Lancamento = {
  id: number
  descricao: string
  tipo: 'Receita' | 'Despesa'
  categoria: string
  vencimento: string
  valor: number
  status: 'Pago' | 'Pendente' | 'Vencido'
}

const lancamentos = ref<Lancamento[]>([
  { id: 1, descricao: 'VENDA Nº 35 - Maria Souza', tipo: 'Receita', categoria: 'Vendas', vencimento: '2026-04-10', valor: 399.80, status: 'Pendente' },
  { id: 2, descricao: 'Aluguel da loja - Abril', tipo: 'Despesa', categoria: 'Aluguel', vencimento: '2026-04-05', valor: 2500.00, status: 'Pago' },
  { id: 3, descricao: 'VENDA Nº 36 - Carlos Rocha', tipo: 'Receita', categoria: 'Vendas', vencimento: '2026-04-07', valor: 539.70, status: 'Pago' },
  { id: 4, descricao: 'Fornecedor JK Jeans', tipo: 'Despesa', categoria: 'Compras', vencimento: '2026-03-30', valor: 4800.00, status: 'Vencido' },
  { id: 5, descricao: 'VENDA Nº 37 - Ana Lima', tipo: 'Receita', categoria: 'Vendas', vencimento: '2026-04-15', valor: 259.90, status: 'Pendente' },
  { id: 6, descricao: 'Energia elétrica - Abril', tipo: 'Despesa', categoria: 'Utilidades', vencimento: '2026-04-12', valor: 380.00, status: 'Pendente' },
  { id: 7, descricao: 'VENDA Nº 38 - Fernanda Melo', tipo: 'Receita', categoria: 'Vendas', vencimento: '2026-04-08', valor: 159.80, status: 'Pago' },
  { id: 8, descricao: 'Salário - Carlos Rocha', tipo: 'Despesa', categoria: 'Salários', vencimento: '2026-04-05', valor: 1800.00, status: 'Pago' },
  { id: 9, descricao: 'VENDA Nº 39 - João Pereira', tipo: 'Receita', categoria: 'Vendas', vencimento: '2026-04-03', valor: 89.90, status: 'Pago' },
  { id: 10, descricao: 'Salário - Roberto Alves', tipo: 'Despesa', categoria: 'Salários', vencimento: '2026-04-05', valor: 1600.00, status: 'Pago' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterTipo = ref('Todos')
const filterStatus = ref('Todos')

const emptyForm = (): Omit<Lancamento, 'id'> => ({
  descricao: '', tipo: 'Receita', categoria: 'Vendas', vencimento: new Date().toISOString().split('T')[0], valor: 0, status: 'Pendente'
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return lancamentos.value.filter(l => {
    const matchTipo = filterTipo.value === 'Todos' || l.tipo === filterTipo.value
    const matchStatus = filterStatus.value === 'Todos' || l.status === filterStatus.value
    const matchSearch = !searchText.value || l.descricao.toLowerCase().includes(searchText.value.toLowerCase())
    return matchTipo && matchStatus && matchSearch
  })
})

const totalReceitas = computed(() => lancamentos.value.filter(l => l.tipo === 'Receita' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const totalDespesas = computed(() => lancamentos.value.filter(l => l.tipo === 'Despesa' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const saldo = computed(() => totalReceitas.value - totalDespesas.value)
const totalVencido = computed(() => lancamentos.value.filter(l => l.status === 'Vencido').reduce((s, l) => s + l.valor, 0))

// --- Gráfico de barras: Receitas vs Despesas por status ---
const barChartData = computed(() => {
  const categorias = ['Pago', 'Pendente', 'Vencido']
  const receitas = categorias.map(s => lancamentos.value.filter(l => l.tipo === 'Receita' && l.status === s).reduce((acc, l) => acc + l.valor, 0))
  const despesas = categorias.map(s => lancamentos.value.filter(l => l.tipo === 'Despesa' && l.status === s).reduce((acc, l) => acc + l.valor, 0))
  return {
    labels: categorias,
    datasets: [
      { label: 'Receitas', data: receitas, backgroundColor: '#4ade80', borderRadius: 6 },
      { label: 'Despesas', data: despesas, backgroundColor: '#f87171', borderRadius: 6 },
    ]
  }
})

// --- Gráfico de rosca: Despesas por categoria ---
const despesasPorCategoria = computed(() => {
  const cats: Record<string, number> = {}
  lancamentos.value.filter(l => l.tipo === 'Despesa').forEach(l => {
    cats[l.categoria] = (cats[l.categoria] || 0) + l.valor
  })
  return {
    labels: Object.keys(cats),
    datasets: [{
      data: Object.values(cats),
      backgroundColor: ['#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#34d399', '#fb923c'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: false }
  },
  scales: {
    y: {
      ticks: { callback: (v: number | string) => 'R$ ' + Number(v).toLocaleString('pt-BR') },
      grid: { color: '#f1f5f9' }
    },
    x: { grid: { display: false } }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; raw: unknown }) => ` ${ctx.label}: R$ ${Number(ctx.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
    }
  }
}

const statusBadge = (s: string) => s === 'Pago' ? 'green' : s === 'Pendente' ? 'yellow' : 'red'
const tipoBadge = (t: string) => t === 'Receita' ? 'green' : 'red'

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (l: Lancamento) => {
  editingId.value = l.id
  form.value = { descricao: l.descricao, tipo: l.tipo, categoria: l.categoria, vencimento: l.vencimento, valor: l.valor, status: l.status }
  showForm.value = true
}

const saveForm = () => {
  if (editingId.value !== null) {
    const idx = lancamentos.value.findIndex(l => l.id === editingId.value)
    if (idx !== -1) lancamentos.value[idx] = { id: editingId.value, ...form.value }
  } else {
    const newId = Math.max(0, ...lancamentos.value.map(l => l.id)) + 1
    lancamentos.value.unshift({ id: newId, ...form.value })
  }
  showForm.value = false
}

const deleteRow = (id: number) => {
  if (confirm('Excluir este lançamento?')) {
    lancamentos.value = lancamentos.value.filter(l => l.id !== id)
  }
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>

<template>
  <div class="subpage-layout">
    <aside class="subpage-sidebar">
      <div class="subpage-brand">
        <div class="subpage-brand-logo">G</div>
        <div>
          <span class="subpage-brand-title">Gestão Jeans</span>
          <span class="subpage-brand-sub">Sistema</span>
        </div>
      </div>
      <div class="subpage-divider"></div>
      <nav class="subpage-nav">
        <span class="subpage-nav-label">Principal</span>
        <router-link to="/dashboard"><span class="subpage-nav-icon">📊</span>Dashboard</router-link>
        <span class="subpage-nav-label">Módulos</span>
        <router-link to="/agenda"><span class="subpage-nav-icon">📅</span>Agenda</router-link>
        <router-link to="/estoques"><span class="subpage-nav-icon">📦</span>Estoque</router-link>
        <router-link to="/pessoas"><span class="subpage-nav-icon">👥</span>Pessoas</router-link>
        <router-link to="/financeiro"><span class="subpage-nav-icon">💰</span>Financeiro</router-link>
        <router-link to="/vendas"><span class="subpage-nav-icon">🛒</span>Vendas</router-link>
        <router-link to="/rastreio"><span class="subpage-nav-icon">📍</span>Rastreio</router-link>
      </nav>
    </aside>

    <main class="subpage-main">
      <div class="subpage-header">
        <div class="subpage-title-group">
          <h1>💰 Financeiro</h1>
          <span class="subpage-breadcrumb">Sistema / Financeiro</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <!-- Cards de resumo -->
      <div class="mod-stats">
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon">📥</span><span class="mod-stat-label">Receitas</span></div>
          <strong>{{ fmt(totalReceitas) }}</strong>
          <span>Total Recebido</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon">📤</span><span class="mod-stat-label">Despesas</span></div>
          <strong>{{ fmt(totalDespesas) }}</strong>
          <span>Total Pago</span>
        </div>
        <div class="mod-stat" :class="saldo >= 0 ? 'blue' : 'red'">
          <div class="mod-stat-top"><span class="mod-stat-icon">💹</span><span class="mod-stat-label">Saldo</span></div>
          <strong>{{ fmt(saldo) }}</strong>
          <span>Saldo do Período</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon">⚠️</span><span class="mod-stat-label">Vencido</span></div>
          <strong>{{ fmt(totalVencido) }}</strong>
          <span>Em Atraso</span>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="fin-charts">
        <div class="fin-chart-card">
          <div class="fin-chart-title">Receitas × Despesas por Status</div>
          <div class="fin-chart-wrap">
            <Bar :data="barChartData" :options="barOptions" />
          </div>
        </div>
        <div class="fin-chart-card">
          <div class="fin-chart-title">Despesas por Categoria</div>
          <div class="fin-chart-wrap fin-chart-wrap--donut">
            <Doughnut :data="despesasPorCategoria" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- Tabela de lançamentos -->
      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Lançamento</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar descrição..." />
            <select v-model="filterTipo">
              <option>Todos</option>
              <option>Receita</option>
              <option>Despesa</option>
            </select>
            <select v-model="filterStatus">
              <option>Todos</option>
              <option>Pago</option>
              <option>Pendente</option>
              <option>Vencido</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Lançamento' : 'Novo Lançamento' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field" style="grid-column:span 2">
              <label>Descrição</label>
              <input v-model="form.descricao" type="text" placeholder="Descrição do lançamento" />
            </div>
            <div class="mod-field">
              <label>Tipo</label>
              <select v-model="form.tipo">
                <option>Receita</option>
                <option>Despesa</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Categoria</label>
              <select v-model="form.categoria">
                <option>Vendas</option>
                <option>Aluguel</option>
                <option>Compras</option>
                <option>Utilidades</option>
                <option>Salários</option>
                <option>Outros</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Vencimento</label>
              <input v-model="form.vencimento" type="date" />
            </div>
            <div class="mod-field">
              <label>Valor (R$)</label>
              <input v-model.number="form.valor" type="number" step="0.01" min="0" />
            </div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Pago</option>
                <option>Pendente</option>
                <option>Vencido</option>
              </select>
            </div>
          </div>
          <div class="mod-form-actions">
            <button class="save" @click="saveForm">Salvar</button>
            <button class="cancel" @click="showForm = false">Cancelar</button>
          </div>
        </div>

        <table class="mod-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in filtered" :key="l.id">
              <td>{{ l.descricao }}</td>
              <td><span class="mod-badge" :class="tipoBadge(l.tipo)">{{ l.tipo }}</span></td>
              <td>{{ l.categoria }}</td>
              <td>{{ l.vencimento }}</td>
              <td>{{ fmt(l.valor) }}</td>
              <td><span class="mod-badge" :class="statusBadge(l.status)">{{ l.status }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(l)">✏️ Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(l.id)">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum lançamento encontrado.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} lançamento(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./FinanceiroView.css"></style>
