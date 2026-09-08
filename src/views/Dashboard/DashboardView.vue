<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../../api/client'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  LineElement, PointElement, Title, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Filler)

type Lancamento = { id: number; descricao: string; tipo: 'Receita' | 'Despesa' | 'Investimento'; categoria: string; vencimento: string; valor: number; status: 'Pago' | 'Pendente' | 'Vencido' }
type Item       = { id: number; referencia: string; cor: string; quantidade: number }
type Faccao     = { id: number; data: string; firma: string; discriminacao: string; nCorte: string; qtdEnviada: number; qtdRecebida: number; precoPeca: number }

const lancamentos = ref<Lancamento[]>([])
const estoque     = ref<Item[]>([])
const producao    = ref<Faccao[]>([])
const loading     = ref(false)

const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const firstDayOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)
const lastDayOfMonth  = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0)

const inicio = ref(toISODate(firstDayOfMonth()))
const fim    = ref(toISODate(lastDayOfMonth()))
const busca  = ref('')

const load = async () => {
  loading.value = true
  const [f, e, p] = await Promise.all([
    api.get<Lancamento[]>('/financeiro'),
    api.get<Item[]>('/estoque'),
    api.get<Faccao[]>('/producao'),
  ])
  lancamentos.value = f
  estoque.value = e
  producao.value = p
  loading.value = false
}

onMounted(load)

function parseDate(s: string): Date {
  if (!s) return new Date(NaN)
  if (s.includes('/')) {
    const [d, m, y] = s.split('/').map(Number)
    return new Date(y, m - 1, d)
  }
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0)

const hoje       = computed(() => startOfDay(new Date()))
const inicioDate = computed(() => parseDate(inicio.value))
const fimDate    = computed(() => parseDate(fim.value))

const buscaMatch = (textos: (string | undefined)[]) => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return true
  return textos.some(t => (t || '').toLowerCase().includes(q))
}

const lancamentosNoPeriodo = computed(() => lancamentos.value.filter(l => {
  const d = parseDate(l.vencimento)
  return d >= inicioDate.value && d <= fimDate.value && buscaMatch([l.descricao, l.categoria, l.tipo])
}))

const producaoNoPeriodo = computed(() => producao.value.filter(p => {
  const d = parseDate(p.data)
  return d >= inicioDate.value && d <= fimDate.value && buscaMatch([p.firma, p.discriminacao, p.nCorte])
}))

const recebidoClientes = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Receita' && l.status === 'Pago').map(l => l.valor)))
const pagoFornecedores = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Despesa' && l.status === 'Pago').map(l => l.valor)))
const saldoRealizado   = computed(() => recebidoClientes.value - pagoFornecedores.value)

const aReceberPeriodo = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Receita' && l.status !== 'Pago').map(l => l.valor)))
const aReceberVencido = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Receita' && l.status === 'Vencido').map(l => l.valor)))
const aPagarPeriodo   = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Despesa' && l.status !== 'Pago').map(l => l.valor)))
const aPagarVencido   = computed(() => sum(lancamentosNoPeriodo.value.filter(l => l.tipo === 'Despesa' && l.status === 'Vencido').map(l => l.valor)))

const saldoProjetado = computed(() => saldoRealizado.value + aReceberPeriodo.value - aPagarPeriodo.value)

const fmt     = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

type Bucket = { label: string; key: string; count: number; total: number }

function buildBuckets(tipo: 'Receita' | 'Despesa'): Bucket[] {
  const items = lancamentos.value.filter(l => l.tipo === tipo && l.status !== 'Pago')
  const h = hoje.value
  const amanha = addDays(h, 1)
  const semana = addDays(h, 7)

  const isAtraso = (l: Lancamento) => l.status === 'Vencido' || parseDate(l.vencimento) < h
  const isHoje   = (l: Lancamento) => !isAtraso(l) && +parseDate(l.vencimento) === +h
  const isAmanha = (l: Lancamento) => !isAtraso(l) && +parseDate(l.vencimento) === +amanha
  const isSemana = (l: Lancamento) => { const d = parseDate(l.vencimento); return !isAtraso(l) && d >= h && d <= semana }
  const isMes    = (l: Lancamento) => { const d = parseDate(l.vencimento); return !isAtraso(l) && d.getFullYear() === h.getFullYear() && d.getMonth() === h.getMonth() }

  const make = (label: string, key: string, filterFn: (l: Lancamento) => boolean): Bucket => {
    const f = items.filter(filterFn)
    return { label, key, count: f.length, total: sum(f.map(l => l.valor)) }
  }

  return [
    make('Hoje', 'hoje', isHoje),
    make('Amanhã', 'amanha', isAmanha),
    make('Esta semana', 'semana', isSemana),
    make('Este mês', 'mes', isMes),
    make('Em atraso', 'atraso', isAtraso),
  ]
}

const contasAPagar   = computed(() => buildBuckets('Despesa'))
const contasAReceber = computed(() => buildBuckets('Receita'))

const pecasEnviadas  = computed(() => sum(producaoNoPeriodo.value.map(p => p.qtdEnviada)))
const pecasRecebidas = computed(() => sum(producaoNoPeriodo.value.map(p => p.qtdRecebida)))
const pecasPendentes = computed(() => Math.max(0, pecasEnviadas.value - pecasRecebidas.value))
const custoFaccao    = computed(() => sum(producaoNoPeriodo.value.map(p => p.qtdRecebida * p.precoPeca)))
const totalEstoque   = computed(() => sum(estoque.value.map(i => i.quantidade)))

const planoDeContas = computed(() => {
  const despesas = lancamentosNoPeriodo.value.filter(l => l.tipo === 'Despesa')
  const map = new Map<string, number>()
  despesas.forEach(l => map.set(l.categoria, (map.get(l.categoria) || 0) + l.valor))
  return [...map.entries()].map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total)
})

const centroCustoFaccao = computed(() => {
  const map = new Map<string, number>()
  producaoNoPeriodo.value.forEach(p => map.set(p.firma, (map.get(p.firma) || 0) + p.qtdRecebida * p.precoPeca))
  return [...map.entries()].map(([firma, total]) => ({ firma, total })).sort((a, b) => b.total - a.total)
})

const chartData = computed(() => {
  const labels: string[] = []
  const data: number[] = []
  let running = saldoRealizado.value
  let d = new Date(inicioDate.value)
  const end = fimDate.value
  let guard = 0
  while (d <= end && guard < 400) {
    const dayStart = startOfDay(d)
    const recebToday = sum(lancamentos.value.filter(l => l.tipo === 'Receita' && l.status !== 'Pago' && +startOfDay(parseDate(l.vencimento)) === +dayStart).map(l => l.valor))
    const pagToday   = sum(lancamentos.value.filter(l => l.tipo === 'Despesa' && l.status !== 'Pago' && +startOfDay(parseDate(l.vencimento)) === +dayStart).map(l => l.valor))
    running += recebToday - pagToday
    labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    data.push(Number(running.toFixed(2)))
    d = addDays(d, 1)
    guard++
  }
  return {
    labels,
    datasets: [{
      label: 'Saldo projetado',
      data,
      borderColor: '#0c2f25',
      backgroundColor: 'rgba(12,47,37,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => fmt(ctx.parsed.y) } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 8 } },
    y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } },
  },
}

const periodoLabel = computed(() => `${fmtDate(inicioDate.value)} a ${fmtDate(fimDate.value)}`)
</script>

<template>
  <div class="cf-page">

    <div class="cf-header">
      <div class="cf-title-group">
        <span class="cf-eyebrow">Painel gerencial</span>
        <h1 class="cf-title">Fluxo de caixa</h1>
      </div>
      <div class="cf-filters">
        <div class="cf-field">
          <label>Início</label>
          <input type="date" v-model="inicio" />
        </div>
        <div class="cf-field">
          <label>Fim</label>
          <input type="date" v-model="fim" />
        </div>
        <div class="cf-field cf-field--search">
          <label>Busca</label>
          <input type="text" v-model="busca" placeholder="Descrição, categoria, tipo..." />
        </div>
        <button class="cf-btn-primary" type="button" :disabled="loading" @click="load">
          {{ loading ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </div>

    <div class="cf-summary-grid">
      <div class="cf-summary-card">
        <span class="cf-summary-label">Saldo realizado</span>
        <span class="cf-summary-value">{{ fmt(saldoRealizado) }}</span>
      </div>
      <div class="cf-summary-card">
        <span class="cf-summary-label">A receber no período</span>
        <span class="cf-summary-value pos">{{ fmt(aReceberPeriodo) }}</span>
      </div>
      <div class="cf-summary-card">
        <span class="cf-summary-label">A pagar no período</span>
        <span class="cf-summary-value neg">{{ fmt(aPagarPeriodo) }}</span>
      </div>
      <div class="cf-summary-card">
        <span class="cf-summary-label">Saldo projetado</span>
        <span class="cf-summary-value">{{ fmt(saldoProjetado) }}</span>
      </div>
    </div>

    <div class="cf-mid-grid">
      <div class="cf-panel">
        <div class="cf-panel-head"><span>Conciliação do período</span></div>
        <div class="cf-reconcile">
          <div class="cf-rec-row">
            <span>Recebido de clientes</span>
            <span class="pos">{{ fmt(recebidoClientes) }}</span>
          </div>
          <div class="cf-rec-row">
            <span>Pago a fornecedores</span>
            <span class="neg">-{{ fmt(pagoFornecedores) }}</span>
          </div>
          <div class="cf-rec-row">
            <div>
              <div>+ A receber</div>
              <div class="cf-rec-sub">{{ fmt(aReceberVencido) }} vencido</div>
            </div>
            <span class="pos">{{ fmt(aReceberPeriodo) }}</span>
          </div>
          <div class="cf-rec-row">
            <div>
              <div>- A pagar</div>
              <div class="cf-rec-sub">{{ fmt(aPagarVencido) }} vencido</div>
            </div>
            <span class="neg">-{{ fmt(aPagarPeriodo) }}</span>
          </div>
          <div class="cf-rec-row cf-rec-total">
            <span>= Saldo projetado (fim do período)</span>
            <span class="pos">{{ fmt(saldoProjetado) }}</span>
          </div>
        </div>
      </div>

      <div class="cf-panel">
        <div class="cf-panel-head">
          <span>Saldo projetado</span>
          <span class="cf-panel-sub">{{ periodoLabel }}</span>
        </div>
        <div class="cf-chart-wrap">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="cf-section">
      <h2 class="cf-section-title">Contas a pagar</h2>
      <div class="cf-bucket-grid">
        <div v-for="b in contasAPagar" :key="b.key" :class="['cf-bucket', b.key === 'atraso' ? 'danger' : b.key === 'mes' ? 'warn' : '']">
          <span class="cf-bucket-label">{{ b.label }}</span>
          <span class="cf-bucket-value">{{ fmt(b.total) }}</span>
          <span class="cf-bucket-count">{{ b.count }} conta(s)</span>
        </div>
      </div>
    </div>

    <div class="cf-section">
      <h2 class="cf-section-title">Contas a receber</h2>
      <div class="cf-bucket-grid">
        <div v-for="b in contasAReceber" :key="b.key" :class="['cf-bucket', 'receber', b.key === 'atraso' ? 'warn' : '']">
          <span class="cf-bucket-label">{{ b.label }}</span>
          <span class="cf-bucket-value">{{ fmt(b.total) }}</span>
          <span class="cf-bucket-count">{{ b.count }} conta(s)</span>
        </div>
      </div>
    </div>

    <div class="cf-section">
      <h2 class="cf-section-title">Operação no período</h2>
      <div class="cf-op-grid">
        <div class="cf-op-card">
          <span class="cf-op-label">Peças enviadas</span>
          <span class="cf-op-value">{{ pecasEnviadas.toLocaleString() }} pç</span>
          <span class="cf-op-sub">{{ producaoNoPeriodo.length }} ordem(ns)</span>
        </div>
        <div class="cf-op-card">
          <span class="cf-op-label">Peças recebidas</span>
          <span class="cf-op-value">{{ pecasRecebidas.toLocaleString() }} pç</span>
          <span class="cf-op-sub">{{ pecasPendentes.toLocaleString() }} pç pendente(s)</span>
        </div>
        <div class="cf-op-card">
          <span class="cf-op-label">Custo de facção</span>
          <span class="cf-op-value neg">{{ fmt(custoFaccao) }}</span>
        </div>
        <div class="cf-op-card">
          <span class="cf-op-label">Estoque</span>
          <span class="cf-op-value">{{ totalEstoque.toLocaleString() }} pç</span>
          <span class="cf-op-sub">{{ estoque.length }} referência(s)</span>
        </div>
      </div>
    </div>

    <div class="cf-mid-grid">
      <div class="cf-panel">
        <div class="cf-panel-head"><span>Plano de contas</span></div>
        <div class="cf-list">
          <div v-if="planoDeContas.length === 0" class="cf-empty">Nenhuma despesa no período</div>
          <div v-for="c in planoDeContas" :key="c.categoria" class="cf-list-row">
            <span>{{ c.categoria }}</span>
            <span class="neg">{{ fmt(c.total) }}</span>
          </div>
        </div>
      </div>
      <div class="cf-panel">
        <div class="cf-panel-head"><span>Centro de custo · facção</span></div>
        <div class="cf-list">
          <div v-if="centroCustoFaccao.length === 0" class="cf-empty">Nenhuma ordem de produção registrada</div>
          <div v-for="c in centroCustoFaccao" :key="c.firma" class="cf-list-row">
            <span>{{ c.firma }}</span>
            <span>{{ fmt(c.total) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped src="./DashboardView.css"></style>
