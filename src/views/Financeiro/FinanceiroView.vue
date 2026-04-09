<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale, ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const authStore = useAuthStore()

type Lancamento = {
  id: string
  descricao: string
  tipo: 'Receita' | 'Despesa'
  categoria: string
  vencimento: string
  valor: number
  status: 'Pago' | 'Pendente' | 'Vencido'
}

const lancamentos = ref<Lancamento[]>([])
let unsub: (() => void) | null = null

onMounted(() => {
  unsub = onSnapshot(collection(db, 'financeiro'), snap => {
    lancamentos.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lancamento))
  })
})

onUnmounted(() => unsub?.())

const showForm = ref(false)
const editingId = ref<string | null>(null)
const searchText = ref('')
const filterTipo = ref('Todos')
const filterStatus = ref('Todos')

const emptyForm = (): Omit<Lancamento, 'id'> => ({
  descricao: '', tipo: 'Receita', categoria: 'Vendas',
  vencimento: new Date().toISOString().split('T')[0], valor: 0, status: 'Pendente'
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
const saldo         = computed(() => totalReceitas.value - totalDespesas.value)
const totalVencido  = computed(() => lancamentos.value.filter(l => l.status === 'Vencido').reduce((s, l) => s + l.valor, 0))

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

const despesasPorCategoria = computed(() => {
  const cats: Record<string, number> = {}
  lancamentos.value.filter(l => l.tipo === 'Despesa').forEach(l => { cats[l.categoria] = (cats[l.categoria] || 0) + l.valor })
  return {
    labels: Object.keys(cats),
    datasets: [{ data: Object.values(cats), backgroundColor: ['#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#34d399', '#fb923c'], borderWidth: 2, borderColor: '#fff' }]
  }
})

const barOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const }, title: { display: false } },
  scales: {
    y: { ticks: { callback: (v: number | string) => 'R$ ' + Number(v).toLocaleString('pt-BR') }, grid: { color: '#f1f5f9' } },
    x: { grid: { display: false } }
  }
}

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: { callbacks: { label: (ctx: { label: string; raw: unknown }) => ` ${ctx.label}: R$ ${Number(ctx.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
  }
}

const statusBadge = (s: string) => s === 'Pago' ? 'green' : s === 'Pendente' ? 'yellow' : 'red'
const tipoBadge = (t: string) => t === 'Receita' ? 'green' : 'red'

const openNew = () => { editingId.value = null; form.value = emptyForm(); showForm.value = true }
const openEdit = (l: Lancamento) => {
  editingId.value = l.id
  form.value = { descricao: l.descricao, tipo: l.tipo, categoria: l.categoria, vencimento: l.vencimento, valor: l.valor, status: l.status }
  showForm.value = true
}

const saveForm = async () => {
  if (editingId.value) {
    await updateDoc(doc(db, 'financeiro', editingId.value), { ...form.value })
  } else {
    await addDoc(collection(db, 'financeiro'), { ...form.value })
  }
  showForm.value = false
}

const deleteRow = async (id: string) => {
  if (confirm('Excluir este lançamento?')) {
    await deleteDoc(doc(db, 'financeiro', id))
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
        <router-link to="/vendas"><span class="subpage-nav-icon">✂️</span>Produção</router-link>
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

      <div class="fin-charts">
        <div class="fin-chart-card">
          <div class="fin-chart-title">Receitas × Despesas por Status</div>
          <div class="fin-chart-wrap"><Bar :data="barChartData" :options="barOptions" /></div>
        </div>
        <div class="fin-chart-card">
          <div class="fin-chart-title">Despesas por Categoria</div>
          <div class="fin-chart-wrap fin-chart-wrap--donut"><Doughnut :data="despesasPorCategoria" :options="doughnutOptions" /></div>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Lançamento</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar descrição..." />
            <select v-model="filterTipo"><option>Todos</option><option>Receita</option><option>Despesa</option></select>
            <select v-model="filterStatus"><option>Todos</option><option>Pago</option><option>Pendente</option><option>Vencido</option></select>
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
              <select v-model="form.tipo"><option>Receita</option><option>Despesa</option></select>
            </div>
            <div class="mod-field">
              <label>Categoria</label>
              <select v-model="form.categoria">
                <option>Vendas</option><option>Aluguel</option><option>Compras</option>
                <option>Utilidades</option><option>Salários</option><option>Outros</option>
              </select>
            </div>
            <div class="mod-field"><label>Vencimento</label><input v-model="form.vencimento" type="date" /></div>
            <div class="mod-field"><label>Valor (R$)</label><input v-model.number="form.valor" type="number" step="0.01" min="0" /></div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status"><option>Pago</option><option>Pendente</option><option>Vencido</option></select>
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
              <th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ações</th>
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
