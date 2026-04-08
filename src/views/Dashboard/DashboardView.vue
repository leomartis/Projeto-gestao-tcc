<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarCollapsed = ref(false)
const showColumnPanel = ref(false)
const currentPage = ref(4)
const totalPages = 7
const filters = ref({ column: 'Data Vencimento', range: 'Este mês' })
type FilterState = {
  column: string
  range: string
  text: string
}

const filterText = ref('')
const activeFilters = ref<FilterState>({ column: filters.value.column, range: filters.value.range, text: '' })

const tableColumns = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'pessoa', label: 'Pessoa' },
  { key: 'valor', label: 'Valor' },
  { key: 'valorDevido', label: 'Valor Devido' },
  { key: 'baixado', label: 'Baixado' }
]

const selectedColumnKeys = ref(tableColumns.map((column) => column.key))

type TableRow = Record<string, string | number | boolean>
const tableRows = ref<TableRow[]>([
  {
    sinal: '✔',
    categoria: 'Vendas',
    vencimento: '2018-04-14',
    descricao: 'VENDA Nº 35',
    pessoa: 'João Marcio Rodrigues',
    valor: 20,
    valorDevido: 20,
    baixado: false
  },
  {
    sinal: '✔',
    categoria: 'Vendas',
    vencimento: '17/04/2018',
    descricao: 'NOTA DE SERVIÇO Nº 1',
    pessoa: 'João Marcio Rodrigues',
    valor: '50,00',
    valorDevido: '50,00',
    baixado: '☐'
  },
  {
    sinal: '●',
    categoria: 'Aluguel',
    vencimento: '18/04/2018',
    descricao: 'JAILSON',
    pessoa: 'LUIZA',
    valor: '5,00',
    valorDevido: '0,00',
    baixado: '☑'
  },
  {
    sinal: '✔',
    categoria: 'Vendas',
    vencimento: '18/04/2018',
    descricao: 'VENDA Nº 110',
    pessoa: 'Matheus Silva',
    valor: '15,00',
    valorDevido: '0,00',
    baixado: '☐'
  }
])

const filteredColumns = computed(() => tableColumns.filter((column) => selectedColumnKeys.value.includes(column.key)))

const displayRows = computed(() => {
  const rows = tableRows.value
  const columnKey = activeFilters.value.column === 'Data Vencimento'
    ? 'vencimento'
    : activeFilters.value.column === 'Categoria'
      ? 'categoria'
      : 'pessoa'

  if (columnKey === 'vencimento') {
    const now = new Date()
    return rows.filter((row) => {
      const rowDate = new Date(String(row.vencimento))
      if (activeFilters.value.range === 'Este mês') {
        return rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()
      }
      if (activeFilters.value.range === 'Últimos 30 dias') {
        const daysAgo = new Date(now)
        daysAgo.setDate(now.getDate() - 30)
        return rowDate >= daysAgo && rowDate <= now
      }
      if (activeFilters.value.range === 'Este ano') {
        return rowDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }

  if (!activeFilters.value.text.trim()) {
    return rows
  }

  const search = activeFilters.value.text.trim().toLowerCase()
  return rows.filter((row) => {
    const value = String(row[columnKey] ?? '')
    return value.toLowerCase().includes(search)
  })
})

const editingRowIndex = ref<number | null>(null)
const editRowData = ref<TableRow>({} as TableRow)

const startEditRow = (row: TableRow) => {
  const index = tableRows.value.findIndex((item) => item === row)
  if (index === -1) return
  editingRowIndex.value = index
  editRowData.value = { ...tableRows.value[index] }
}

const saveEditRow = () => {
  if (editingRowIndex.value === null) return
  tableRows.value[editingRowIndex.value] = { ...editRowData.value }
  editingRowIndex.value = null
  window.alert('Registro atualizado com sucesso!')
}

const applyFilters = () => {
  activeFilters.value = {
    column: filters.value.column,
    range: filters.value.range,
    text: filterText.value
  }
}

const clearFilters = () => {
  filterText.value = ''
  filters.value.column = 'Data Vencimento'
  filters.value.range = 'Este mês'
  applyFilters()
}

const cancelEdit = () => {
  editingRowIndex.value = null
}

const deleteRow = (row: TableRow) => {
  const index = tableRows.value.findIndex((item) => item === row)
  if (index === -1) return
  const removed = tableRows.value.splice(index, 1)
  if (removed.length) {
    window.alert('Registro excluído com sucesso!')
  }
}

const toggleMenu = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const insertRow = () => {
  tableRows.value.unshift({
    sinal: '★',
    categoria: 'Novo',
    vencimento: '2026-05-01',
    descricao: 'LANÇAMENTO RÁPIDO',
    pessoa: 'Usuário',
    valor: 0,
    valorDevido: 0,
    baixado: false
  })
  window.alert('Linha inserida com sucesso!')
}

const exportExcel = () => {
  downloadCsv('movimento-financeiro.csv')
}

const toggleColumnSelector = () => {
  showColumnPanel.value = !showColumnPanel.value
}

const openReports = () => {
  router.push('/financeiro')
}

const downloadTitles = () => {
  downloadCsv('titulos-baixados.csv')
}

const selectPage = (page: number) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages) {
    currentPage.value += 1
  }
}

const toggleColumn = (key: string) => {
  if (selectedColumnKeys.value.includes(key)) {
    selectedColumnKeys.value = selectedColumnKeys.value.filter((column) => column !== key)
  } else {
    selectedColumnKeys.value.push(key)
  }
}

const downloadCsv = (filename: string) => {
  const headers = ['Sinal', ...filteredColumns.value.map((column) => column.label)]
  const rows = tableRows.value.map((row) => filteredColumns.value.map((column) => row[column.key as keyof typeof row]))
  const csvContent = [headers, ...rows].map((line) => line.join(',')).join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="dashboard-page">
    <aside :class="['dashboard-side', { collapsed: isSidebarCollapsed }]">
      <div class="brand">
        <div class="brand-logo">G</div>
        <div>
          <span class="brand-title">Gestão Jeans</span>
          <span class="brand-subtitle">Sistema</span>
        </div>
      </div>

      <div class="side-divider"></div>

      <div class="search-box">
        <input type="text" placeholder="Buscar no menu..." />
      </div>

      <nav class="side-menu">
        <span class="menu-section-label">Principal</span>
        <router-link to="/dashboard">
          <span class="menu-icon">📊</span><span>Dashboard</span>
        </router-link>
        <span class="menu-section-label">Módulos</span>
        <router-link to="/agenda">
          <span class="menu-icon">📅</span><span>Agenda</span>
        </router-link>
        <router-link to="/estoques">
          <span class="menu-icon">📦</span><span>Estoque</span>
        </router-link>
        <router-link to="/pessoas">
          <span class="menu-icon">👥</span><span>Pessoas</span>
        </router-link>
        <router-link to="/financeiro">
          <span class="menu-icon">💰</span><span>Financeiro</span>
        </router-link>
        <router-link to="/vendas">
          <span class="menu-icon">🛒</span><span>Vendas</span>
        </router-link>
        <router-link to="/rastreio">
          <span class="menu-icon">📍</span><span>Rastreio</span>
        </router-link>
      </nav>
    </aside>

    <main class="dashboard-main">
      <header class="main-header">
        <div class="header-left">
          <button class="menu-btn" @click="toggleMenu">☰</button>
          <div>
            <h2>Movimento Financeiro</h2>
            <div class="header-breadcrumb">Dashboard / Financeiro</div>
          </div>
        </div>

        <div class="header-right">
          <div class="notification-btn">
            🔔
            <span class="notif-badge">99</span>
          </div>
          <div class="user-chip">
            <div class="user-avatar">JM</div>
            <span class="user-name">João Marcio</span>
          </div>
        </div>
      </header>

      <section class="stats-row">
        <article class="stat-card green">
          <div class="stat-top">
            <div class="stat-icon-wrap">💼</div>
            <span class="stat-change">Hoje</span>
          </div>
          <strong>R$ 350,00</strong>
          <span>A Receber Hoje</span>
        </article>
        <article class="stat-card blue">
          <div class="stat-top">
            <div class="stat-icon-wrap">📋</div>
            <span class="stat-change">Vencido</span>
          </div>
          <strong>R$ 1.445,90</strong>
          <span>Receb. em Atraso</span>
        </article>
        <article class="stat-card yellow">
          <div class="stat-top">
            <div class="stat-icon-wrap">📅</div>
            <span class="stat-change">Hoje</span>
          </div>
          <strong>R$ 2.550,00</strong>
          <span>A Pagar Hoje</span>
        </article>
        <article class="stat-card red">
          <div class="stat-top">
            <div class="stat-icon-wrap">⚠️</div>
            <span class="stat-change">Vencido</span>
          </div>
          <strong>R$ 16.922,05</strong>
          <span>Pagos em Atraso</span>
        </article>
      </section>

      <section class="table-panel">
        <div class="table-controls">
          <div class="buttons-group">
            <button @click="insertRow">Inserir</button>
            <button @click="exportExcel">Excel</button>
            <button @click="toggleColumnSelector">Seleciona colunas</button>
            <button @click="openReports">Relatórios</button>
            <button class="primary" @click="downloadTitles">Baixar Títulos</button>
          </div>

          <div class="filter-group">
            <label>Filtrar por</label>
            <select v-model="filters.column">
              <option>Data Vencimento</option>
              <option>Categoria</option>
              <option>Pessoa</option>
            </select>
            <span>valor</span>
            <select v-model="filters.range">
              <option>Este mês</option>
              <option>Últimos 30 dias</option>
              <option>Este ano</option>
            </select>
            <input
              class="filter-input"
              v-model="filterText"
              type="text"
              placeholder="Digite categoria ou pessoa"
            />
            <button class="apply-btn" type="button" @click="applyFilters">Aplicar</button>
            <button class="secondary small" type="button" @click="clearFilters">Limpar</button>
          </div>
        </div>

        <div v-if="showColumnPanel" class="column-selector">
          <strong>Colunas visíveis:</strong>
          <div class="column-options">
            <label v-for="column in tableColumns" :key="column.key">
              <input
                type="checkbox"
                :value="column.key"
                :checked="selectedColumnKeys.includes(column.key)"
                @change="() => toggleColumn(column.key)"
              />
              {{ column.label }}
            </label>
          </div>
        </div>

        <div v-if="editingRowIndex !== null" class="edit-panel">
          <h3>Editar registro</h3>
          <div class="edit-inputs">
            <div v-for="column in tableColumns" :key="column.key" class="edit-field">
              <span>{{ column.label }}</span>
              <template v-if="column.key === 'vencimento'">
                <input v-model="editRowData[column.key]" type="date" />
              </template>
              <template v-else-if="column.key === 'valor' || column.key === 'valorDevido'">
                <input v-model.number="editRowData[column.key]" type="number" step="0.01" min="0" />
              </template>
              <template v-else-if="column.key === 'baixado'">
                <label class="checkbox-field">
                  <input type="checkbox" v-model="editRowData[column.key]" />
                  <span>Baixado</span>
                </label>
              </template>
              <template v-else>
                <input v-model="editRowData[column.key]" type="text" />
              </template>
            </div>
          </div>
          <div class="edit-actions">
            <button @click="saveEditRow">Salvar</button>
            <button class="secondary" @click="cancelEdit">Cancelar</button>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th></th>
              <th v-for="column in filteredColumns" :key="column.key">{{ column.label }}</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in displayRows" :key="index" :class="{ editing: editingRowIndex === index }">
              <td>{{ row.sinal }}</td>
              <td v-for="column in filteredColumns" :key="column.key">
                <span v-if="column.key === 'baixado'">{{ row[column.key] ? '☑' : '☐' }}</span>
                <span v-else>{{ row[column.key] }}</span>
              </td>
              <td class="row-actions">
                <button type="button" class="icon-btn edit" @click="startEditRow(row)">✏️ Editar</button>
                <button type="button" class="icon-btn danger" @click="deleteRow(row)">🗑️ Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer">
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <div class="page-controls">
            <button @click="prevPage">Ant</button>
            <button
              v-for="page in totalPages"
              :key="page"
              :class="{ active: currentPage === page }"
              @click="selectPage(page)"
            >
              {{ page }}
            </button>
            <button @click="nextPage">Seg</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped src="./DashboardView.css"></style>
