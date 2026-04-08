<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

type Compromisso = {
  id: number
  titulo: string
  data: string
  hora: string
  local: string
  responsavel: string
  tipo: 'Reunião' | 'Entrega' | 'Ligação' | 'Tarefa' | 'Outro'
  status: 'Agendado' | 'Concluído' | 'Cancelado' | 'Atrasado'
}

const compromissos = ref<Compromisso[]>([
  { id: 1, titulo: 'Reunião com fornecedor JK Jeans', data: '2026-04-08', hora: '09:00', local: 'Escritório', responsavel: 'Carlos Rocha', tipo: 'Reunião', status: 'Agendado' },
  { id: 2, titulo: 'Entrega pedido Maria Souza', data: '2026-04-07', hora: '14:00', local: 'Rua das Flores, 123', responsavel: 'Roberto Alves', tipo: 'Entrega', status: 'Concluído' },
  { id: 3, titulo: 'Ligação cliente Ana Lima', data: '2026-04-09', hora: '10:30', local: 'Telefone', responsavel: 'Carlos Rocha', tipo: 'Ligação', status: 'Agendado' },
  { id: 4, titulo: 'Inventário de estoque', data: '2026-03-31', hora: '08:00', local: 'Loja', responsavel: 'Roberto Alves', tipo: 'Tarefa', status: 'Atrasado' },
  { id: 5, titulo: 'Apresentação nova coleção', data: '2026-04-15', hora: '15:00', local: 'Showroom', responsavel: 'Carlos Rocha', tipo: 'Reunião', status: 'Agendado' },
  { id: 6, titulo: 'Pagamento fornecedor Tecidos Brasil', data: '2026-04-10', hora: '12:00', local: 'Banco', responsavel: 'Roberto Alves', tipo: 'Tarefa', status: 'Agendado' },
  { id: 7, titulo: 'Contato pós-venda Fernanda Melo', data: '2026-04-06', hora: '11:00', local: 'Telefone', responsavel: 'Carlos Rocha', tipo: 'Ligação', status: 'Concluído' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterStatus = ref('Todos')
const filterTipo = ref('Todos')

const emptyForm = (): Omit<Compromisso, 'id'> => ({
  titulo: '', data: new Date().toISOString().split('T')[0], hora: '09:00', local: '', responsavel: '', tipo: 'Reunião', status: 'Agendado'
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return compromissos.value.filter(c => {
    const matchStatus = filterStatus.value === 'Todos' || c.status === filterStatus.value
    const matchTipo = filterTipo.value === 'Todos' || c.tipo === filterTipo.value
    const matchSearch = !searchText.value || c.titulo.toLowerCase().includes(searchText.value.toLowerCase()) || c.responsavel.toLowerCase().includes(searchText.value.toLowerCase())
    return matchStatus && matchTipo && matchSearch
  })
})

const hoje = computed(() => compromissos.value.filter(c => c.data === new Date().toISOString().split('T')[0]).length)
const agendados = computed(() => compromissos.value.filter(c => c.status === 'Agendado').length)
const atrasados = computed(() => compromissos.value.filter(c => c.status === 'Atrasado').length)
const concluidos = computed(() => compromissos.value.filter(c => c.status === 'Concluído').length)

const statusBadge = (s: string) => s === 'Concluído' ? 'green' : s === 'Agendado' ? 'blue' : s === 'Atrasado' ? 'red' : 'gray'
const tipoBadge = (t: string): string => {
  const map: Record<string, string> = { 'Reunião': 'blue', 'Entrega': 'green', 'Ligação': 'purple', 'Tarefa': 'yellow', 'Outro': 'gray' }
  return map[t] ?? 'gray'
}

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (c: Compromisso) => {
  editingId.value = c.id
  form.value = { titulo: c.titulo, data: c.data, hora: c.hora, local: c.local, responsavel: c.responsavel, tipo: c.tipo, status: c.status }
  showForm.value = true
}

const saveForm = () => {
  if (editingId.value !== null) {
    const idx = compromissos.value.findIndex(c => c.id === editingId.value)
    if (idx !== -1) compromissos.value[idx] = { id: editingId.value, ...form.value }
  } else {
    const newId = Math.max(0, ...compromissos.value.map(c => c.id)) + 1
    compromissos.value.unshift({ id: newId, ...form.value })
  }
  showForm.value = false
}

const deleteRow = (id: number) => {
  if (confirm('Excluir este compromisso?')) {
    compromissos.value = compromissos.value.filter(c => c.id !== id)
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
          <h1>📅 Agenda</h1>
          <span class="subpage-breadcrumb">Sistema / Agenda</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon">📅</span><span class="mod-stat-label">Hoje</span></div>
          <strong>{{ hoje }}</strong>
          <span>Compromissos Hoje</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon">⏳</span><span class="mod-stat-label">Abertos</span></div>
          <strong>{{ agendados }}</strong>
          <span>Agendados</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon">⚠️</span><span class="mod-stat-label">Atrasado</span></div>
          <strong>{{ atrasados }}</strong>
          <span>Atrasados</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon">✅</span><span class="mod-stat-label">Feitos</span></div>
          <strong>{{ concluidos }}</strong>
          <span>Concluídos</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Compromisso</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar título ou responsável..." />
            <select v-model="filterTipo">
              <option>Todos</option>
              <option>Reunião</option>
              <option>Entrega</option>
              <option>Ligação</option>
              <option>Tarefa</option>
              <option>Outro</option>
            </select>
            <select v-model="filterStatus">
              <option>Todos</option>
              <option>Agendado</option>
              <option>Concluído</option>
              <option>Atrasado</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Compromisso' : 'Novo Compromisso' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field" style="grid-column:span 2">
              <label>Título</label>
              <input v-model="form.titulo" type="text" placeholder="Título do compromisso" />
            </div>
            <div class="mod-field">
              <label>Data</label>
              <input v-model="form.data" type="date" />
            </div>
            <div class="mod-field">
              <label>Hora</label>
              <input v-model="form.hora" type="time" />
            </div>
            <div class="mod-field">
              <label>Local</label>
              <input v-model="form.local" type="text" placeholder="Local do compromisso" />
            </div>
            <div class="mod-field">
              <label>Responsável</label>
              <input v-model="form.responsavel" type="text" placeholder="Nome do responsável" />
            </div>
            <div class="mod-field">
              <label>Tipo</label>
              <select v-model="form.tipo">
                <option>Reunião</option>
                <option>Entrega</option>
                <option>Ligação</option>
                <option>Tarefa</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Agendado</option>
                <option>Concluído</option>
                <option>Atrasado</option>
                <option>Cancelado</option>
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
              <th>Título</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Local</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.id">
              <td>{{ c.titulo }}</td>
              <td><span class="mod-badge" :class="tipoBadge(c.tipo)">{{ c.tipo }}</span></td>
              <td>{{ c.data }}</td>
              <td>{{ c.hora }}</td>
              <td>{{ c.local }}</td>
              <td>{{ c.responsavel }}</td>
              <td><span class="mod-badge" :class="statusBadge(c.status)">{{ c.status }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(c)">✏️ Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(c.id)">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="8" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum compromisso encontrado.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} compromisso(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./AgendaView.css"></style>
