<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

type Produto = {
  id: number
  codigo: string
  nome: string
  categoria: string
  quantidade: number
  minimo: number
  valorUnit: number
  status: 'Normal' | 'Baixo' | 'Zerado'
}

const produtos = ref<Produto[]>([
  { id: 1, codigo: 'CJ-001', nome: 'Calça Jeans Slim', categoria: 'Calças', quantidade: 45, minimo: 10, valorUnit: 89.90, status: 'Normal' },
  { id: 2, codigo: 'BJ-002', nome: 'Bermuda Jeans Masculina', categoria: 'Bermudas', quantidade: 8, minimo: 10, valorUnit: 59.90, status: 'Baixo' },
  { id: 3, codigo: 'JJ-003', nome: 'Jaqueta Jeans Feminina', categoria: 'Jaquetas', quantidade: 22, minimo: 5, valorUnit: 149.90, status: 'Normal' },
  { id: 4, codigo: 'SJ-004', nome: 'Short Jeans Feminino', categoria: 'Shorts', quantidade: 0, minimo: 8, valorUnit: 49.90, status: 'Zerado' },
  { id: 5, codigo: 'CW-005', nome: 'Calça Wide Leg', categoria: 'Calças', quantidade: 15, minimo: 5, valorUnit: 119.90, status: 'Normal' },
  { id: 6, codigo: 'SM-006', nome: 'Saia Jeans Midi', categoria: 'Saias', quantidade: 6, minimo: 8, valorUnit: 99.90, status: 'Baixo' },
  { id: 7, codigo: 'CS-007', nome: 'Calça Jeans Skinny', categoria: 'Calças', quantidade: 31, minimo: 10, valorUnit: 109.90, status: 'Normal' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')
const filterStatus = ref('Todos')

const emptyForm = (): Omit<Produto, 'id'> => ({
  codigo: '', nome: '', categoria: 'Calças', quantidade: 0, minimo: 5, valorUnit: 0, status: 'Normal'
})

const form = ref(emptyForm())

const filtered = computed(() => {
  return produtos.value.filter(p => {
    const matchStatus = filterStatus.value === 'Todos' || p.status === filterStatus.value
    const matchSearch = !searchText.value || p.nome.toLowerCase().includes(searchText.value.toLowerCase()) || p.codigo.toLowerCase().includes(searchText.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

const totalProdutos = computed(() => produtos.value.length)
const estoqueBaixo = computed(() => produtos.value.filter(p => p.status === 'Baixo' || p.status === 'Zerado').length)
const valorTotal = computed(() => produtos.value.reduce((s, p) => s + p.quantidade * p.valorUnit, 0))
const zerados = computed(() => produtos.value.filter(p => p.status === 'Zerado').length)

const statusBadge = (s: string) => s === 'Normal' ? 'green' : s === 'Baixo' ? 'yellow' : 'red'

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (p: Produto) => {
  editingId.value = p.id
  form.value = { codigo: p.codigo, nome: p.nome, categoria: p.categoria, quantidade: p.quantidade, minimo: p.minimo, valorUnit: p.valorUnit, status: p.status }
  showForm.value = true
}

const saveForm = () => {
  const computedStatus = (): Produto['status'] => {
    if (form.value.quantidade === 0) return 'Zerado'
    if (form.value.quantidade < form.value.minimo) return 'Baixo'
    return 'Normal'
  }
  form.value.status = computedStatus()

  if (editingId.value !== null) {
    const idx = produtos.value.findIndex(p => p.id === editingId.value)
    if (idx !== -1) produtos.value[idx] = { id: editingId.value, ...form.value }
  } else {
    const newId = Math.max(0, ...produtos.value.map(p => p.id)) + 1
    produtos.value.unshift({ id: newId, ...form.value })
  }
  showForm.value = false
}

const deleteRow = (id: number) => {
  if (confirm('Excluir este produto?')) {
    produtos.value = produtos.value.filter(p => p.id !== id)
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
          <h1>📦 Estoque</h1>
          <span class="subpage-breadcrumb">Sistema / Estoque</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon">📦</span><span class="mod-stat-label">Total</span></div>
          <strong>{{ totalProdutos }}</strong>
          <span>Produtos Cadastrados</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon">⚠️</span><span class="mod-stat-label">Atenção</span></div>
          <strong>{{ estoqueBaixo }}</strong>
          <span>Estoque Baixo / Zerado</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon">💵</span><span class="mod-stat-label">Valor</span></div>
          <strong>{{ fmt(valorTotal) }}</strong>
          <span>Valor em Estoque</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon">❌</span><span class="mod-stat-label">Zerado</span></div>
          <strong>{{ zerados }}</strong>
          <span>Produtos Zerados</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Produto</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar produto ou código..." />
            <select v-model="filterStatus">
              <option>Todos</option>
              <option>Normal</option>
              <option>Baixo</option>
              <option>Zerado</option>
            </select>
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Produto' : 'Novo Produto' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field">
              <label>Código</label>
              <input v-model="form.codigo" type="text" placeholder="Ex: CJ-001" />
            </div>
            <div class="mod-field">
              <label>Nome do Produto</label>
              <input v-model="form.nome" type="text" placeholder="Nome do produto" />
            </div>
            <div class="mod-field">
              <label>Categoria</label>
              <select v-model="form.categoria">
                <option>Calças</option>
                <option>Bermudas</option>
                <option>Jaquetas</option>
                <option>Shorts</option>
                <option>Saias</option>
                <option>Outros</option>
              </select>
            </div>
            <div class="mod-field">
              <label>Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="0" />
            </div>
            <div class="mod-field">
              <label>Estoque Mínimo</label>
              <input v-model.number="form.minimo" type="number" min="0" />
            </div>
            <div class="mod-field">
              <label>Valor Unitário (R$)</label>
              <input v-model.number="form.valorUnit" type="number" step="0.01" min="0" />
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
              <th>Código</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Qtd</th>
              <th>Mínimo</th>
              <th>Valor Unit.</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td><code style="font-size:0.8rem;background:#f1f5f9;padding:2px 6px;border-radius:4px;">{{ p.codigo }}</code></td>
              <td>{{ p.nome }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ p.quantidade }}</td>
              <td>{{ p.minimo }}</td>
              <td>{{ fmt(p.valorUnit) }}</td>
              <td>{{ fmt(p.quantidade * p.valorUnit) }}</td>
              <td><span class="mod-badge" :class="statusBadge(p.status)">{{ p.status }}</span></td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(p)">✏️ Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(p.id)">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="9" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum produto encontrado.</td>
            </tr>
          </tbody>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} produto(s) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./Estoques.css"></style>
