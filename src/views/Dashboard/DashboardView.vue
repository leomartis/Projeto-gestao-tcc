<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSidebarCollapsed = ref(false)
const showColumnPanel = ref(false)
const currentPage = ref(4)
const totalPages = 7
const filters = ref({ column: 'Data Vencimento', range: 'Este mês' })

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

type TableRow = Record<string, string>
const tableRows = ref<TableRow[]>([
  {
    sinal: '✔',
    categoria: 'Vendas',
    vencimento: '14/04/2018',
    descricao: 'VENDA Nº 35',
    pessoa: 'João Marcio Rodrigues',
    valor: '20,00',
    valorDevido: '20,00',
    baixado: '☐'
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

const toggleMenu = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const insertRow = () => {
  tableRows.value.unshift({
    sinal: '★',
    categoria: 'Novo',
    vencimento: '01/05/2026',
    descricao: 'LANÇAMENTO RÁPIDO',
    pessoa: 'Usuário',
    valor: '0,00',
    valorDevido: '0,00',
    baixado: '☐'
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
          <span class="brand-title">GESTÃO</span>
          <span class="brand-subtitle">ONLINE</span>
        </div>
      </div>

      <div class="search-box">
        <input type="text" placeholder="Procurar opção do menu..." />
      </div>

      <nav class="side-menu">
        <router-link to="/agenda">Agenda</router-link>
        <router-link to="/estoques">Estoque</router-link>
        <router-link to="/pessoas">Pessoas</router-link>
        <router-link to="/financeiro">Financeiro</router-link>
        <router-link to="/vendas">Vendas</router-link>
        <router-link to="/rastreio">Rastreio</router-link>
      </nav>
    </aside>

    <main class="dashboard-main">
      <header class="main-header">
        <div class="header-left">
          <button class="menu-btn" @click="toggleMenu">☰</button>
          <div>
            <h2>Movimento Financeiro</h2>
          </div>
        </div>

        <div class="header-right">
          <span class="user-name">João Marcio Rodrigues</span>
          <span class="icon">👤</span>
          <span class="notification">🔔<span>136</span></span>
        </div>
      </header>

      <section class="stats-row">
        <article class="stat-card green">
          <span class="stat-icon">💼</span>
          <strong>350,00</strong>
          <span>A Receber Hoje</span>
        </article>
        <article class="stat-card blue">
          <span class="stat-icon">👍</span>
          <strong>1.445,90</strong>
          <span>Receb. em Atraso</span>
        </article>
        <article class="stat-card yellow">
          <span class="stat-icon">📅</span>
          <strong>2.550,00</strong>
          <span>A Pagar Hoje</span>
        </article>
        <article class="stat-card red">
          <span class="stat-icon">👎</span>
          <strong>16.922,05</strong>
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

        <table class="data-table">
          <thead>
            <tr>
              <th></th>
              <th v-for="column in filteredColumns" :key="column.key">{{ column.label }}</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableRows" :key="index">
              <td>{{ row.sinal }}</td>
              <td v-for="column in filteredColumns" :key="column.key">{{ row[column.key] }}</td>
              <td>Selecione uma ação</td>
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
