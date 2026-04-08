<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

type Venda = {
  id: number
  cliente: string
  produto: string
  quantidade: number
  valor: number
  data: string
  status: 'Concluída' | 'Pendente' | 'Cancelada'
}

const vendas = ref<Venda[]>([
  { id: 1, cliente: 'Maria Souza', produto: 'Calça Jeans Slim', quantidade: 2, valor: 199.90, data: '2026-04-01', status: 'Concluída' },
  { id: 2, cliente: 'João Pereira', produto: 'Bermuda Jeans', quantidade: 1, valor: 89.90, data: '2026-04-02', status: 'Concluída' },
  { id: 3, cliente: 'Ana Lima', produto: 'Jaqueta Jeans', quantidade: 1, valor: 259.90, data: '2026-04-03', status: 'Pendente' },
  { id: 4, cliente: 'Carlos Rocha', produto: 'Calça Jeans Wide Leg', quantidade: 3, valor: 179.90, data: '2026-04-04', status: 'Concluída' },
  { id: 5, cliente: 'Fernanda Melo', produto: 'Short Jeans', quantidade: 2, valor: 79.90, data: '2026-04-05', status: 'Cancelada' },
  { id: 6, cliente: 'Roberto Alves', produto: 'Calça Jeans Skinny', quantidade: 1, valor: 189.90, data: '2026-04-06', status: 'Pendente' },
  { id: 7, cliente: 'Patrícia Costa', produto: 'Saia Jeans Midi', quantidade: 2, valor: 149.90, data: '2026-04-07', status: 'Concluída' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterStatus = ref('Todos')

const emptyForm = (): Omit<Venda, 'id'> => ({
  cliente: '', produto: '', quantidade: 1, valor: 0, data: new Date().toISOString().split('T')[0], status: 'Pendente'
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return vendas.value.filter(v => {
    const matchStatus = filterStatus.value === 'Todos' || v.status === filterStatus.value
    const matchSearch = !searchText.value || v.cliente.toLowerCase().includes(searchText.value.toLowerCase()) || v.produto.toLowerCase().includes(searchText.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

const totalHoje = computed(() => vendas.value.filter(v => v.data === new Date().toISOString().split('T')[0] && v.status === 'Concluída').reduce((s, v) => s + v.valor * v.quantidade, 0))
const totalMes = computed(() => vendas.value.filter(v => v.status === 'Concluída').reduce((s, v) => s + v.valor * v.quantidade, 0))
const pendentes = computed(() => vendas.value.filter(v => v.status === 'Pendente').length)
const canceladas = computed(() => vendas.value.filter(v => v.status === 'Cancelada').length)

const statusBadge = (s: string) => s === 'Concluída' ? 'green' : s === 'Pendente' ? 'yellow' : 'red'

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (v: Venda) => {
  editingId.value = v.id
  form.value = { cliente: v.cliente, produto: v.produto, quantidade: v.quantidade, valor: v.valor, data: v.data, status: v.status }
  showForm.value = true
}

const saveForm = () => {
  if (editingId.value !== null) {
    const idx = vendas.value.findIndex(v => v.id === editingId.value)
    if (idx !== -1) vendas.value[idx] = { id: editingId.value, ...form.value }
  } else {
    const newId = Math.max(0, ...vendas.value.map(v => v.id)) + 1
    vendas.value.unshift({ id: newId, ...form.value })
  }
  showForm.value = false
}

const deleteRow = (id: number) => {
  if (confirm('Excluir esta venda?')) {
    vendas.value = vendas.value.filter(v => v.id !== id)
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
          <h1>🛒 Vendas</h1>
          <span class="subpage-breadcrumb">Sistema / Vendas</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon">💰</span><span class="mod-stat-label">Hoje</span></div>
          <strong>{{ fmt(totalHoje) }}</strong>
          <span>Vendas Hoje</span>
        </div>
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon">📈</span><span class="mod-stat-label">Mês</span></div>
          <strong>{{ fmt(totalMes) }}</strong>
          <span>Total do Mês</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon">⏳</span><span class="mod-stat-label">Pendente</span></div>
          <strong>{{ pendentes }}</strong>
          <span>Vendas Pendentes</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon">❌</span><span class="mod-stat-label">Cancelado</span></div>
          <strong>{{ canceladas }}</strong>
          <span>Canceladas</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Nova Venda</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar cliente ou produto..." />
            <select v-model="filterStatus">
              <option>Todos</option>
              <option>Concluída</option>
              <option>Pendente</option>
              <option>Cancelada</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Venda' : 'Nova Venda' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field">
              <label>Cliente</label>
              <input v-model="form.cliente" type="text" placeholder="Nome do cliente" />
            </div>
            <div class="mod-field">
              <label>Produto</label>
              <input v-model="form.produto" type="text" placeholder="Nome do produto" />
            </div>
            <div class="mod-field">
              <label>Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="1" />
            </div>
            <div class="mod-field">
              <label>Valor Unitário (R$)</label>
              <input v-model.number="form.valor" type="number" step="0.01" min="0" />
            </div>
            <div class="mod-field">
              <label>Data</label>
              <input v-model="form.data" type="date" />
            </div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Concluída</option>
                <option>Pendente</option>
                <option>Cancelada</option>
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
              <th>#</th>
              <th>Cliente</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Total</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in filtered" :key="v.id">
              <td>{{ v.id }}</td>
              <td>{{ v.cliente }}</td>
              <td>{{ v.produto }}</td>
              <td>{{ v.quantidade }}</td>
              <td>{{ fmt(v.valor) }}</td>
              <td>{{ fmt(v.valor * v.quantidade) }}</td>
              <td>{{ v.data }}</td>
              <td><span class="mod-badge" :class="statusBadge(v.status)">{{ v.status }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(v)">✏️ Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(v.id)">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="9" style="text-align:center;color:#94a3b8;padding:32px;">Nenhuma venda encontrada.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} registro(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./VendasView.css"></style>
