<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'

const authStore = useAuthStore()

type Compromisso = {
  id: string
  titulo: string
  data: string
  hora: string
  local: string
  responsavel: string
  tipo: 'Reunião' | 'Entrega' | 'Ligação' | 'Tarefa' | 'Outro'
  status: 'Agendado' | 'Concluído' | 'Cancelado' | 'Atrasado'
}

const compromissos = ref<Compromisso[]>([])
let unsub: (() => void) | null = null

onMounted(() => {
  unsub = onSnapshot(collection(db, 'agenda'), snap => {
    compromissos.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Compromisso))
  })
})

onUnmounted(() => unsub?.())

const showForm = ref(false)
const editingId = ref<string | null>(null)
const searchText = ref('')
const filterStatus = ref('Todos')
const filterTipo = ref('Todos')

const emptyForm = (): Omit<Compromisso, 'id'> => ({
  titulo: '', data: new Date().toISOString().split('T')[0], hora: '09:00',
  local: '', responsavel: '', tipo: 'Reunião', status: 'Agendado'
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

const hoje      = computed(() => compromissos.value.filter(c => c.data === new Date().toISOString().split('T')[0]).length)
const agendados = computed(() => compromissos.value.filter(c => c.status === 'Agendado').length)
const atrasados = computed(() => compromissos.value.filter(c => c.status === 'Atrasado').length)
const concluidos = computed(() => compromissos.value.filter(c => c.status === 'Concluído').length)

const statusBadge = (s: string) => s === 'Concluído' ? 'green' : s === 'Agendado' ? 'blue' : s === 'Atrasado' ? 'red' : 'gray'
const tipoBadge = (t: string): string => ({ 'Reunião': 'blue', 'Entrega': 'green', 'Ligação': 'purple', 'Tarefa': 'yellow', 'Outro': 'gray' }[t] ?? 'gray')

const openNew = () => { editingId.value = null; form.value = emptyForm(); showForm.value = true }
const openEdit = (c: Compromisso) => {
  editingId.value = c.id
  form.value = { titulo: c.titulo, data: c.data, hora: c.hora, local: c.local, responsavel: c.responsavel, tipo: c.tipo, status: c.status }
  showForm.value = true
}

const saveForm = async () => {
  if (editingId.value) {
    await updateDoc(doc(db, 'agenda', editingId.value), { ...form.value })
  } else {
    await addDoc(collection(db, 'agenda'), { ...form.value })
  }
  showForm.value = false
}

const deleteRow = async (id: string) => {
  if (confirm('Excluir este compromisso?')) {
    await deleteDoc(doc(db, 'agenda', id))
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
        <router-link to="/vendas"><span class="subpage-nav-icon">✂️</span>Produção</router-link>
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
              <option>Todos</option><option>Reunião</option><option>Entrega</option>
              <option>Ligação</option><option>Tarefa</option><option>Outro</option>
            </select>
            <select v-model="filterStatus">
              <option>Todos</option><option>Agendado</option><option>Concluído</option>
              <option>Atrasado</option><option>Cancelado</option>
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
            <div class="mod-field"><label>Data</label><input v-model="form.data" type="date" /></div>
            <div class="mod-field"><label>Hora</label><input v-model="form.hora" type="time" /></div>
            <div class="mod-field"><label>Local</label><input v-model="form.local" type="text" placeholder="Local do compromisso" /></div>
            <div class="mod-field"><label>Responsável</label><input v-model="form.responsavel" type="text" placeholder="Nome do responsável" /></div>
            <div class="mod-field">
              <label>Tipo</label>
              <select v-model="form.tipo">
                <option>Reunião</option><option>Entrega</option><option>Ligação</option><option>Tarefa</option><option>Outro</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Agendado</option><option>Concluído</option><option>Atrasado</option><option>Cancelado</option>
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
              <th>Título</th><th>Tipo</th><th>Data</th><th>Hora</th>
              <th>Local</th><th>Responsável</th><th>Status</th><th>Ações</th>
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
