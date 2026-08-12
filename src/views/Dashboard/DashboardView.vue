<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../api/client'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const authStore = useAuthStore()

type Lancamento = { id: number; descricao: string; tipo: string; categoria: string; vencimento: string; valor: number; status: string }
type Pessoa     = { id: number; nome?: string; tipo: string; ativo: boolean }
type Item       = { id: number; referencia: string; cor: string; quantidade: number }
type Faccao     = { id: number; qtdEnviada: number; qtdRecebida: number; precoPeca: number; data: string; firma?: string }

const lancamentos = ref<Lancamento[]>([])
const pessoas     = ref<Pessoa[]>([])
const estoque     = ref<Item[]>([])
const producao    = ref<Faccao[]>([])

onMounted(async () => {
  const [f, p, e, pr] = await Promise.all([
    api.get<Lancamento[]>('/financeiro'),
    api.get<Pessoa[]>('/pessoas'),
    api.get<Item[]>('/estoque'),
    api.get<Faccao[]>('/producao'),
  ])
  lancamentos.value = f
  pessoas.value     = p
  estoque.value     = e
  producao.value    = pr
})

const totalReceitas     = computed(() => lancamentos.value.filter(l => l.tipo === 'Receita' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const totalDespesas     = computed(() => lancamentos.value.filter(l => l.tipo === 'Despesa' && l.status === 'Pago').reduce((s, l) => s + l.valor, 0))
const saldo             = computed(() => totalReceitas.value - totalDespesas.value)
const totalRecebida     = computed(() => producao.value.reduce((s, f) => s + (f.qtdRecebida || 0), 0))
const valorProducao     = computed(() => producao.value.reduce((s, f) => s + (f.qtdRecebida || 0) * (f.precoPeca || 0), 0))
const totalItensEstoque = computed(() => estoque.value.reduce((s, i) => s + (i.quantidade || 0), 0))

const spendingPct = computed(() => {
  if (totalReceitas.value === 0) return 0
  return Math.min(100, Math.round(totalDespesas.value / totalReceitas.value * 100))
})

const userName = computed(() => {
  const email = authStore.user?.email ?? ''
  const name = email.split('@')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const _months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const chartData = computed(() => {
  const receitas = new Array(12).fill(0)
  const despesas = new Array(12).fill(0)
  lancamentos.value.forEach(l => {
    if (!l.vencimento) return
    const parts = l.vencimento.includes('/') ? l.vencimento.split('/') : l.vencimento.split('-')
    const m = parts.length === 3 ? parseInt(parts[1]) - 1 : -1
    if (m >= 0 && m < 12) {
      if (l.tipo === 'Receita') receitas[m] += l.valor
      else despesas[m] += l.valor
    }
  })
  return {
    labels: _months,
    datasets: [
      { label: 'Receitas', data: receitas, backgroundColor: '#1c5a47', borderRadius: 4, borderSkipped: false },
      { label: 'Despesas', data: despesas, backgroundColor: '#0c2f25', borderRadius: 4, borderSkipped: false },
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } },
    y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } }
  }
}

const recentActivities = computed(() => lancamentos.value.slice(0, 8))
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const statusColor = (s: string) => s === 'Pago' ? 'green' : s === 'Pendente' ? 'orange' : 'red'
const statusIcon  = (s: string) => s === 'Pago' ? '●' : s === 'Pendente' ? '◉' : '○'
const padId = (id: number) => 'INV_' + String(id).padStart(6, '0')
</script>

<template>
  <div class="db-page">

    <!-- GREETING -->
    <div class="db-greeting">
      <div>
        <h1 class="db-greeting-title">{{ greeting }}, {{ userName }}</h1>
        <p class="db-greeting-sub">Acompanhe seus lançamentos, produção e status do estoque.</p>
      </div>
      <div class="db-greeting-meta">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Última atualização: hoje</span>
      </div>
    </div>

    <!-- TOP 3-COLUMN GRID -->
    <div class="db-top-grid">

      <!-- Balance card -->
      <div class="balance-card">
        <div class="bc-head">
          <span class="bc-label">Saldo Total</span>
          <span class="bc-currency">BRL</span>
        </div>
        <div class="bc-amount">{{ fmt(saldo) }}</div>
        <div :class="['bc-change', saldo >= 0 ? 'pos' : 'neg']">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline :points="saldo >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
          </svg>
          {{ saldo >= 0 ? 'Positivo' : 'Negativo' }} este mês
        </div>
        <div class="bc-actions">
          <router-link to="/financeiro" class="bc-btn-primary">↕ Financeiro</router-link>
          <router-link to="/financeiro" class="bc-btn-outline">+ Lançamento</router-link>
        </div>
        <div class="bc-divider"></div>
        <div class="bc-wallets-title">Resumo | {{ lancamentos.length }} lançamentos</div>
        <div class="bc-wallet-item">
          <div class="bwi-left">
            <span class="bwi-flag green"></span>
            <div>
              <div class="bwi-name">Receitas</div>
              <div class="bwi-status active">Pago</div>
            </div>
          </div>
          <div class="bwi-amount">{{ fmt(totalReceitas) }}</div>
        </div>
        <div class="bc-wallet-item">
          <div class="bwi-left">
            <span class="bwi-flag orange"></span>
            <div>
              <div class="bwi-name">Despesas</div>
              <div class="bwi-status">Pago</div>
            </div>
          </div>
          <div class="bwi-amount">{{ fmt(totalDespesas) }}</div>
        </div>
        <div class="bc-wallet-item">
          <div class="bwi-left">
            <span class="bwi-flag gray"></span>
            <div>
              <div class="bwi-name">Produção</div>
              <div class="bwi-status inactive">{{ producao.length }} ordens</div>
            </div>
          </div>
          <div class="bwi-amount">{{ fmt(valorProducao) }}</div>
        </div>
      </div>

      <!-- 2x2 Stats grid -->
      <div class="stats-2x2">
        <div class="stat-sm orange-card">
          <div class="ss-top">
            <span class="ss-label">Total Receitas</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          </div>
          <div class="ss-value">{{ fmt(totalReceitas) }}</div>
          <div class="ss-change pos-w">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            {{ lancamentos.filter(l => l.tipo === 'Receita').length }} lançamentos
          </div>
        </div>

        <div class="stat-sm">
          <div class="ss-top">
            <span class="ss-label">Total Despesas</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
          </div>
          <div class="ss-value dark">{{ fmt(totalDespesas) }}</div>
          <div class="ss-change neg">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            {{ lancamentos.filter(l => l.tipo === 'Despesa').length }} lançamentos
          </div>
        </div>

        <div class="stat-sm">
          <div class="ss-top">
            <span class="ss-label">Total Produção</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div class="ss-value dark">{{ fmt(valorProducao) }}</div>
          <div class="ss-change pos">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            {{ totalRecebida }} peças
          </div>
        </div>

        <div class="stat-sm">
          <div class="ss-top">
            <span class="ss-label">Total Estoque</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="ss-value dark">{{ totalItensEstoque.toLocaleString() }} pç</div>
          <div class="ss-change pos">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            {{ estoque.length }} referências
          </div>
        </div>
      </div>

      <!-- Profit & Loss chart -->
      <div class="pl-card">
        <div class="pl-head">
          <div>
            <div class="pl-title">Receitas vs Despesas</div>
            <div class="pl-sub">Visão do período por mês</div>
          </div>
          <div class="pl-legend">
            <span class="pl-dot orange"></span><span>Receitas</span>
            <span class="pl-dot dark"></span><span>Despesas</span>
          </div>
        </div>
        <div class="pl-chart-wrap">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

    </div>

    <!-- BOTTOM 2-COLUMN -->
    <div class="db-bottom-grid">

      <!-- Left column: Spending Limit + Produção -->
      <div class="db-left-col">

        <div class="spending-card">
          <div class="spending-head">
            <div>
              <div class="sc-title">Limite de Despesas</div>
              <div class="sc-sub">
                <span class="sc-spent">{{ fmt(totalDespesas) }}</span>
                <span class="sc-total"> gasto de {{ fmt(totalReceitas) }}</span>
              </div>
            </div>
            <span class="sc-pct">{{ spendingPct }}%</span>
          </div>
          <div class="spending-bar-wrap">
            <div class="spending-bar" :style="{ width: spendingPct + '%', background: spendingPct > 80 ? 'var(--neg)' : 'var(--warn)' }"></div>
          </div>
          <div class="spending-footer">
            <span>{{ fmt(0) }}</span>
            <span>{{ fmt(totalReceitas) }}</span>
          </div>
        </div>

        <div class="prod-section">
          <div class="prod-sec-head">
            <span class="prod-sec-title">Produção</span>
            <router-link to="/vendas" class="prod-add">+ Nova Ordem</router-link>
          </div>
          <div class="prod-cards">
            <div v-for="(f, i) in producao.slice(0, 2)" :key="f.id" :class="['prod-card', i === 0 ? 'dark-card' : 'orange-card-light']">
              <div class="pcard-status">
                <span class="pcard-badge">{{ i === 0 ? 'Ativo' : 'Ativo' }}</span>
              </div>
              <div class="pcard-firma">{{ f.firma || 'Facção' }}</div>
              <div class="pcard-nums">
                <div>
                  <div class="pcard-lbl">Enviado</div>
                  <div class="pcard-val">{{ (f.qtdEnviada || 0).toLocaleString() }} pç</div>
                </div>
                <div>
                  <div class="pcard-lbl">Recebido</div>
                  <div class="pcard-val">{{ (f.qtdRecebida || 0).toLocaleString() }} pç</div>
                </div>
              </div>
            </div>
            <div v-if="producao.length === 0" class="prod-empty">
              Nenhuma ordem cadastrada
            </div>
          </div>
        </div>

      </div>

      <!-- Right: Recent Activities table -->
      <div class="activities-card">
        <div class="act-head">
          <span class="act-title">Atividades Recentes</span>
          <div class="act-filters">
            <div class="act-search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Buscar" />
            </div>
            <button class="act-filter-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtrar
            </button>
          </div>
        </div>

        <table class="act-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Nº Lançamento</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Vencimento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentActivities.length === 0">
              <td colspan="7" class="act-empty">Nenhum lançamento encontrado</td>
            </tr>
            <tr v-for="l in recentActivities" :key="l.id">
              <td><input type="checkbox" /></td>
              <td class="act-id">{{ padId(l.id) }}</td>
              <td>
                <div class="act-desc-wrap">
                  <div class="act-icon-dot" :class="l.tipo === 'Receita' ? 'green' : 'orange'">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline v-if="l.tipo === 'Receita'" points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline v-else points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                    </svg>
                  </div>
                  <div>
                    <div class="act-desc">{{ l.descricao }}</div>
                    <div class="act-cat">{{ l.categoria }}</div>
                  </div>
                </div>
              </td>
              <td class="act-val">{{ fmt(l.valor) }}</td>
              <td>
                <span :class="['act-badge', statusColor(l.status)]">
                  {{ statusIcon(l.status) }} {{ l.status }}
                </span>
              </td>
              <td class="act-date">{{ l.vencimento }}</td>
              <td class="act-more">···</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped src="./DashboardView.css"></style>
