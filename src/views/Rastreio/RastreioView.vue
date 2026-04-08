<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

type Pedido = {
  id: number
  numeroPedido: string
  cliente: string
  destino: string
  transportadora: string
  previsao: string
  status: 'Em Trânsito' | 'Entregue' | 'Aguardando' | 'Atrasado' | 'Cancelado'
  rastreamento: string
}

const pedidos = ref<Pedido[]>([
  { id: 1, numeroPedido: 'PED-0035', cliente: 'Maria Souza', destino: 'São Paulo, SP', transportadora: 'Correios', previsao: '2026-04-10', status: 'Em Trânsito', rastreamento: 'BR123456789SP' },
  { id: 2, numeroPedido: 'PED-0036', cliente: 'Carlos Rocha', destino: 'Rio de Janeiro, RJ', transportadora: 'Jadlog', previsao: '2026-04-07', status: 'Entregue', rastreamento: 'JD987654321RJ' },
  { id: 3, numeroPedido: 'PED-0037', cliente: 'Ana Lima', destino: 'Campinas, SP', transportadora: 'Correios', previsao: '2026-04-12', status: 'Aguardando', rastreamento: '' },
  { id: 4, numeroPedido: 'PED-0038', cliente: 'Fernanda Melo', destino: 'Fortaleza, CE', transportadora: 'Total Express', previsao: '2026-04-05', status: 'Atrasado', rastreamento: 'TE456789123CE' },
  { id: 5, numeroPedido: 'PED-0039', cliente: 'João Pereira', destino: 'Curitiba, PR', transportadora: 'Jadlog', previsao: '2026-04-14', status: 'Em Trânsito', rastreamento: 'JD111222333PR' },
  { id: 6, numeroPedido: 'PED-0040', cliente: 'Patrícia Costa', destino: 'Belo Horizonte, MG', transportadora: 'Correios', previsao: '2026-04-15', status: 'Aguardando', rastreamento: '' },
  { id: 7, numeroPedido: 'PED-0041', cliente: 'Roberto Alves', destino: 'Porto Alegre, RS', transportadora: 'Total Express', previsao: '2026-04-08', status: 'Em Trânsito', rastreamento: 'TE999888777RS' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterStatus = ref('Todos')

const emptyForm = (): Omit<Pedido, 'id'> => ({
  numeroPedido: '', cliente: '', destino: '', transportadora: 'Correios', previsao: new Date().toISOString().split('T')[0], status: 'Aguardando', rastreamento: ''
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return pedidos.value.filter(p => {
    const matchStatus = filterStatus.value === 'Todos' || p.status === filterStatus.value
    const matchSearch = !searchText.value || p.cliente.toLowerCase().includes(searchText.value.toLowerCase()) || p.numeroPedido.toLowerCase().includes(searchText.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

const emTransito = computed(() => pedidos.value.filter(p => p.status === 'Em Trânsito').length)
const entregues = computed(() => pedidos.value.filter(p => p.status === 'Entregue').length)
const aguardando = computed(() => pedidos.value.filter(p => p.status === 'Aguardando').length)
const atrasados = computed(() => pedidos.value.filter(p => p.status === 'Atrasado').length)

const statusBadge = (s: string): string => {
  const map: Record<string, string> = { 'Em Trânsito': 'blue', 'Entregue': 'green', 'Aguardando': 'yellow', 'Atrasado': 'red', 'Cancelado': 'gray' }
  return map[s] ?? 'gray'
}

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (p: Pedido) => {
  editingId.value = p.id
  form.value = { numeroPedido: p.numeroPedido, cliente: p.cliente, destino: p.destino, transportadora: p.transportadora, previsao: p.previsao, status: p.status, rastreamento: p.rastreamento }
  showForm.value = true
}

const saveForm = () => {
  if (editingId.value !== null) {
    const idx = pedidos.value.findIndex(p => p.id === editingId.value)
    if (idx !== -1) pedidos.value[idx] = { id: editingId.value, ...form.value }
  } else {
    const newId = Math.max(0, ...pedidos.value.map(p => p.id)) + 1
    pedidos.value.unshift({ id: newId, ...form.value })
  }
  showForm.value = false
}

const deleteRow = (id: number) => {
  if (confirm('Excluir este pedido?')) {
    pedidos.value = pedidos.value.filter(p => p.id !== id)
  }
}
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
          <h1>📍 Rastreio</h1>
          <span class="subpage-breadcrumb">Sistema / Rastreio</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon">🚚</span><span class="mod-stat-label">Em Rota</span></div>
          <strong>{{ emTransito }}</strong>
          <span>Em Trânsito</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon">✅</span><span class="mod-stat-label">Entregue</span></div>
          <strong>{{ entregues }}</strong>
          <span>Entregues</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon">📦</span><span class="mod-stat-label">Aguard.</span></div>
          <strong>{{ aguardando }}</strong>
          <span>Aguardando Envio</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon">⚠️</span><span class="mod-stat-label">Atrasado</span></div>
          <strong>{{ atrasados }}</strong>
          <span>Atrasados</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Pedido</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar pedido ou cliente..." />
            <select v-model="filterStatus">
              <option>Todos</option>
              <option>Em Trânsito</option>
              <option>Entregue</option>
              <option>Aguardando</option>
              <option>Atrasado</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Pedido' : 'Novo Pedido' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field">
              <label>Número do Pedido</label>
              <input v-model="form.numeroPedido" type="text" placeholder="Ex: PED-0042" />
            </div>
            <div class="mod-field">
              <label>Cliente</label>
              <input v-model="form.cliente" type="text" placeholder="Nome do cliente" />
            </div>
            <div class="mod-field">
              <label>Destino</label>
              <input v-model="form.destino" type="text" placeholder="Cidade, UF" />
            </div>
            <div class="mod-field">
              <label>Transportadora</label>
              <select v-model="form.transportadora">
                <option>Correios</option>
                <option>Jadlog</option>
                <option>Total Express</option>
                <option>Azul Cargo</option>
                <option>Latam Cargo</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Previsão de Entrega</label>
              <input v-model="form.previsao" type="date" />
            </div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Aguardando</option>
                <option>Em Trânsito</option>
                <option>Entregue</option>
                <option>Atrasado</option>
                <option>Cancelado</option>
              </select>
            </div>
            <div class="mod-field" style="grid-column:span 2">
              <label>Código de Rastreamento</label>
              <input v-model="form.rastreamento" type="text" placeholder="Código de rastreamento (opcional)" />
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
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Destino</th>
              <th>Transportadora</th>
              <th>Código Rastreio</th>
              <th>Previsão</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td><strong>{{ p.numeroPedido }}</strong></td>
              <td>{{ p.cliente }}</td>
              <td>{{ p.destino }}</td>
              <td>{{ p.transportadora }}</td>
              <td>
                <code v-if="p.rastreamento" style="font-size:0.78rem;background:#f1f5f9;padding:2px 6px;border-radius:4px;">{{ p.rastreamento }}</code>
                <span v-else style="color:#cbd5e1;font-size:0.8rem;">—</span>
              </td>
              <td>{{ p.previsao }}</td>
              <td><span class="mod-badge" :class="statusBadge(p.status)">{{ p.status }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(p)">✏️ Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(p.id)">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="8" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum pedido encontrado.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} pedido(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./RastreioView.css"></style>
