<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../api/client'
import { UserRound, Building2, HardHat, CheckCircle2, Pencil, Trash2 } from 'lucide-vue-next'

const authStore = useAuthStore()

type Pessoa = {
  id: number
  nome: string
  tipo: 'Cliente' | 'Fornecedor' | 'Colaborador'
  email: string
  telefone: string
  cidade: string
  ativo: boolean
}

const pessoas = ref<Pessoa[]>([])

const load = async () => {
  pessoas.value = await api.get<Pessoa[]>('/pessoas')
}

onMounted(load)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterTipo = ref('Todos')

const emptyForm = (): Omit<Pessoa, 'id'> => ({
  nome: '', tipo: 'Cliente', email: '', telefone: '', cidade: '', ativo: true
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return pessoas.value.filter(p => {
    const matchTipo = filterTipo.value === 'Todos' || p.tipo === filterTipo.value
    const matchSearch = !searchText.value || p.nome.toLowerCase().includes(searchText.value.toLowerCase()) || p.email.toLowerCase().includes(searchText.value.toLowerCase())
    return matchTipo && matchSearch
  })
})

const totalClientes     = computed(() => pessoas.value.filter(p => p.tipo === 'Cliente').length)
const totalFornecedores = computed(() => pessoas.value.filter(p => p.tipo === 'Fornecedor').length)
const totalColaboradores = computed(() => pessoas.value.filter(p => p.tipo === 'Colaborador').length)
const totalAtivos       = computed(() => pessoas.value.filter(p => p.ativo).length)

const tipoBadge = (t: string) => t === 'Cliente' ? 'blue' : t === 'Fornecedor' ? 'purple' : 'green'

const openNew = () => { editingId.value = null; form.value = emptyForm(); showForm.value = true }
const openEdit = (p: Pessoa) => {
  editingId.value = p.id
  form.value = { nome: p.nome, tipo: p.tipo, email: p.email, telefone: p.telefone, cidade: p.cidade, ativo: p.ativo }
  showForm.value = true
}

const saveError = ref('')
const saveForm = async () => {
  saveError.value = ''
  try {
    if (editingId.value) {
      await api.put(`/pessoas/${editingId.value}`, form.value)
    } else {
      await api.post('/pessoas', form.value)
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    saveError.value = 'Erro ao salvar: ' + (e?.message ?? String(e))
  }
}

const deleteRow = async (id: number) => {
  if (confirm('Excluir este cadastro?')) {
    await api.delete(`/pessoas/${id}`)
    await load()
  }
}
</script>

<template>
  <div class="subpage-layout">
    <main class="subpage-main">
      <div class="subpage-header">
        <div class="subpage-title-group">
          <h1>Pessoas</h1>
          <span class="subpage-breadcrumb">Sistema / Pessoas</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon"><UserRound :size="18"/></span><span class="mod-stat-label">Clientes</span></div>
          <strong>{{ totalClientes }}</strong>
          <span>Clientes</span>
        </div>
        <div class="mod-stat purple">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Building2 :size="18"/></span><span class="mod-stat-label">Fornecedores</span></div>
          <strong>{{ totalFornecedores }}</strong>
          <span>Fornecedores</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon"><HardHat :size="18"/></span><span class="mod-stat-label">Equipe</span></div>
          <strong>{{ totalColaboradores }}</strong>
          <span>Colaboradores</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon"><CheckCircle2 :size="18"/></span><span class="mod-stat-label">Ativos</span></div>
          <strong>{{ totalAtivos }}</strong>
          <span>Cadastros Ativos</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Nova Pessoa</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar por nome ou e-mail..." />
            <select v-model="filterTipo">
              <option>Todos</option><option>Cliente</option><option>Fornecedor</option><option>Colaborador</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Cadastro' : 'Nova Pessoa' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field"><label>Nome</label><input v-model="form.nome" type="text" placeholder="Nome completo ou razão social" /></div>
            <div class="mod-field">
              <label>Tipo</label>
              <select v-model="form.tipo"><option>Cliente</option><option>Fornecedor</option><option>Colaborador</option></select>
            </div>
            <div class="mod-field"><label>E-mail</label><input v-model="form.email" type="email" placeholder="email@exemplo.com" /></div>
            <div class="mod-field"><label>Telefone</label><input v-model="form.telefone" type="text" placeholder="(00) 00000-0000" /></div>
            <div class="mod-field"><label>Cidade</label><input v-model="form.cidade" type="text" placeholder="Cidade" /></div>
            <div class="mod-field" style="justify-content:flex-end;padding-bottom:4px;">
              <label>Ativo</label>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.9rem;color:#334155;">
                <input type="checkbox" v-model="form.ativo" /> Cadastro ativo
              </label>
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
              <th>Nome</th><th>Tipo</th><th>E-mail</th><th>Telefone</th><th>Cidade</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td>{{ p.nome }}</td>
              <td><span class="mod-badge" :class="tipoBadge(p.tipo)">{{ p.tipo }}</span></td>
              <td>{{ p.email }}</td>
              <td>{{ p.telefone }}</td>
              <td>{{ p.cidade }}</td>
              <td><span class="mod-badge" :class="p.ativo ? 'green' : 'gray'">{{ p.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(p)"><Pencil :size="13"/> Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(p.id)"><Trash2 :size="13"/> Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" style="text-align:center;color:#94a3b8;padding:32px;">Nenhuma pessoa encontrada.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} cadastro(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./PessoasView.css"></style>
