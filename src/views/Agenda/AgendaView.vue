<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../../api/client'
import { Clock, AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-vue-next'

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

const compromissos = ref<Compromisso[]>([])

const load = async () => {
  const data = await api.get<Compromisso[]>('/agenda')
  compromissos.value = data.map(c => ({ ...c, hora: c.hora.slice(0, 5) }))
}

onMounted(load)

const showForm = ref(false)
const editingId = ref<number | null>(null)
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

const saveError = ref('')
const saveForm = async () => {
  saveError.value = ''
  try {
    if (editingId.value) {
      await api.put(`/agenda/${editingId.value}`, form.value)
    } else {
      await api.post('/agenda', form.value)
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    saveError.value = 'Erro ao salvar: ' + (e?.message ?? String(e))
  }
}

const deleteRow = async (id: number) => {
  if (confirm('Excluir este compromisso?')) {
    await api.delete(`/agenda/${id}`)
    await load()
  }
}
</script>

<template>
  <div class="subpage-layout">
    <main class="subpage-main">
      <div class="subpage-header">
        <div class="subpage-title-group">
          <h1>Agenda</h1>
          <span class="subpage-breadcrumb">Sistema / Agenda</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon"><CalendarDays :size="18"/></span><span class="mod-stat-label">Hoje</span></div>
          <strong>{{ hoje }}</strong>
          <span>Compromissos Hoje</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Clock :size="18"/></span><span class="mod-stat-label">Abertos</span></div>
          <strong>{{ agendados }}</strong>
          <span>Agendados</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon"><AlertTriangle :size="18"/></span><span class="mod-stat-label">Atrasado</span></div>
          <strong>{{ atrasados }}</strong>
          <span>Atrasados</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon"><CheckCircle2 :size="18"/></span><span class="mod-stat-label">Feitos</span></div>
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
          <p v-if="saveError" class="save-error">⚠️ {{ saveError }}</p>
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
                  <button class="mod-btn-icon edit" @click="openEdit(c)"><Pencil :size="13"/> Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(c.id)"><Trash2 :size="13"/> Excluir</button>
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
