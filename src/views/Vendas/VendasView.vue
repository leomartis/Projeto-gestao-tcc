<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../api/client'
import { Send, Download, Clock, DollarSign, Settings, Pencil, Trash2 } from 'lucide-vue-next'

const authStore = useAuthStore()

const metaDiaria = ref(1850)
const showConfig = ref(false)

type Faccao = {
  id: number
  data: string
  firma: string
  discriminacao: string
  nCorte: string
  qtdEnviada: number
  qtdRecebida: number
  precoPeca: number
}

const registros = ref<Faccao[]>([])

const load = async () => {
  registros.value = await api.get<Faccao[]>('/producao')
}

onMounted(load)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const searchText = ref('')

const emptyForm = (): Omit<Faccao, 'id'> => ({
  data: new Date().toISOString().split('T')[0],
  firma: '',
  discriminacao: '',
  nCorte: '',
  qtdEnviada: 1400,
  qtdRecebida: 0,
  precoPeca: 0,
})

const form = ref(emptyForm())

const filtered = computed(() => {
  if (!searchText.value) return registros.value
  const s = searchText.value.toLowerCase()
  return registros.value.filter(r =>
    r.firma.toLowerCase().includes(s) ||
    r.discriminacao.toLowerCase().includes(s) ||
    r.nCorte.toLowerCase().includes(s)
  )
})

const groupedByDate = computed(() => {
  const groups: Record<string, Faccao[]> = {}
  for (const r of filtered.value) {
    if (!groups[r.data]) groups[r.data] = []
    groups[r.data].push(r)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

const subtotalDia  = (linhas: Faccao[]) => linhas.reduce((s, r) => s + r.qtdRecebida, 0)
const valorDia     = (linhas: Faccao[]) => linhas.reduce((s, r) => s + r.qtdRecebida * r.precoPeca, 0)
const progressoDia = (linhas: Faccao[]) => Math.min(100, Math.round((subtotalDia(linhas) / metaDiaria.value) * 100))
const batiuMeta    = (linhas: Faccao[]) => subtotalDia(linhas) >= metaDiaria.value
const temPreco     = (linhas: Faccao[]) => linhas.some(r => r.precoPeca > 0)

const totalEnviado  = computed(() => registros.value.reduce((s, r) => s + r.qtdEnviada, 0))
const totalRecebido = computed(() => registros.value.reduce((s, r) => s + r.qtdRecebida, 0))
const totalPendente = computed(() => totalEnviado.value - totalRecebido.value)
const totalValor    = computed(() => registros.value.reduce((s, r) => s + r.qtdRecebida * r.precoPeca, 0))
const temAlgumPreco = computed(() => registros.value.some(r => r.precoPeca > 0))

const openNew = () => {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}

const openEdit = (r: Faccao) => {
  editingId.value = r.id
  form.value = { data: r.data, firma: r.firma, discriminacao: r.discriminacao, nCorte: r.nCorte, qtdEnviada: r.qtdEnviada, qtdRecebida: r.qtdRecebida, precoPeca: r.precoPeca }
  showForm.value = true
}

const saveError = ref('')
const saveForm = async () => {
  saveError.value = ''
  try {
    if (editingId.value) {
      await api.put(`/producao/${editingId.value}`, form.value)
    } else {
      await api.post('/producao', form.value)
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    saveError.value = 'Erro ao salvar: ' + (e?.message ?? String(e))
  }
}

const deleteRow = async (id: number) => {
  if (confirm('Excluir este registro?')) {
    await api.delete(`/producao/${id}`)
    await load()
  }
}

const fmtData = (d: string) => {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>

<template>
  <div class="subpage-layout">
    <main class="subpage-main">
      <div class="subpage-header">
        <div class="subpage-title-group">
          <h1>Produção</h1>
          <span class="subpage-breadcrumb">Sistema / Produção</span>
        </div>
        <div class="header-right">
          <button class="btn-config" @click="showConfig = !showConfig"><Settings :size="14"/> Configurar</button>
          <div class="subpage-user-chip">
            <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
            <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
          </div>
        </div>
      </div>

      <div v-if="showConfig" class="config-panel">
        <h3>Configurações</h3>
        <div class="config-grid">
          <div class="mod-field">
            <label>Meta diária (peças)</label>
            <input v-model.number="metaDiaria" type="number" min="1" />
          </div>
        </div>
        <button class="save" @click="showConfig = false">Fechar</button>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Send :size="18"/></span><span class="mod-stat-label">Enviadas</span></div>
          <strong>{{ totalEnviado.toLocaleString('pt-BR') }}</strong>
          <span>Peças Enviadas</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Download :size="18"/></span><span class="mod-stat-label">Recebidas</span></div>
          <strong>{{ totalRecebido.toLocaleString('pt-BR') }}</strong>
          <span>Peças Recebidas</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Clock :size="18"/></span><span class="mod-stat-label">Pendente</span></div>
          <strong>{{ totalPendente.toLocaleString('pt-BR') }}</strong>
          <span>Peças Pendentes</span>
        </div>
        <div class="mod-stat purple">
          <div class="mod-stat-top"><span class="mod-stat-icon"><DollarSign :size="18"/></span><span class="mod-stat-label">Valor Total</span></div>
          <strong>{{ temAlgumPreco ? fmtBRL(totalValor) : '—' }}</strong>
          <span>Total em R$</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Novo Registro</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar firma, discriminação ou corte..." />
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Registro' : 'Novo Registro' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field">
              <label>Data</label>
              <input v-model="form.data" type="date" />
            </div>
            <div class="mod-field">
              <label>Firma</label>
              <input v-model="form.firma" type="text" placeholder="Nome da firma" />
            </div>
            <div class="mod-field">
              <label>Discriminação</label>
              <input v-model="form.discriminacao" type="text" placeholder="Ex: Calça, CPLCP..." />
            </div>
            <div class="mod-field">
              <label>Nº Corte</label>
              <input v-model="form.nCorte" type="text" placeholder="Número do corte" />
            </div>
            <div class="mod-field">
              <label>Qtd. Enviada</label>
              <input v-model.number="form.qtdEnviada" type="number" min="0" />
            </div>
            <div class="mod-field">
              <label>Qtd. Recebida</label>
              <input v-model.number="form.qtdRecebida" type="number" min="0" />
            </div>
            <div class="mod-field">
              <label>Valor por Peça (R$)</label>
              <input v-model.number="form.precoPeca" type="number" step="0.01" min="0" placeholder="Ex: 12.50" />
            </div>
            <div class="mod-field valor-preview" v-if="form.precoPeca > 0 && form.qtdRecebida > 0">
              <label>Total deste registro</label>
              <span class="valor-calc">{{ fmtBRL(form.precoPeca * form.qtdRecebida) }}</span>
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
              <th>Data</th>
              <th>Firma</th>
              <th>Discriminação</th>
              <th>Nº Corte</th>
              <th>Qtd. Enviada</th>
              <th>Qtd. Recebida</th>
              <th>R$/Peça</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="([data, linhas]) in groupedByDate" :key="data">
              <tr v-for="r in linhas" :key="r.id">
                <td>{{ fmtData(r.data) }}</td>
                <td>{{ r.firma }}</td>
                <td>{{ r.discriminacao }}</td>
                <td>{{ r.nCorte }}</td>
                <td class="num">{{ r.qtdEnviada.toLocaleString('pt-BR') }}</td>
                <td class="num">{{ r.qtdRecebida.toLocaleString('pt-BR') }}</td>
                <td class="num">{{ r.precoPeca > 0 ? fmtBRL(r.precoPeca) : '—' }}</td>
                <td class="num txt-green">{{ r.precoPeca > 0 ? fmtBRL(r.qtdRecebida * r.precoPeca) : '—' }}</td>
                <td>
                  <div class="mod-actions">
                    <button class="mod-btn-icon edit" @click="openEdit(r)"><Pencil :size="13"/> Editar</button>
                    <button class="mod-btn-icon danger" @click="deleteRow(r.id)"><Trash2 :size="13"/> Excluir</button>
                  </div>
                </td>
              </tr>
              <tr class="subtotal-row">
                <td colspan="2" class="subtotal-label">
                  <span :class="batiuMeta(linhas) ? 'meta-ok' : 'meta-nao'">
                    {{ batiuMeta(linhas) ? '✔' : '✗' }} {{ fmtData(data) }}
                  </span>
                </td>
                <td colspan="2">
                  <div class="progress-wrap">
                    <div class="progress-bar">
                      <div class="progress-fill" :class="batiuMeta(linhas) ? 'fill-green' : 'fill-yellow'" :style="{ width: progressoDia(linhas) + '%' }"></div>
                    </div>
                    <span class="progress-pct">{{ progressoDia(linhas) }}% da meta ({{ metaDiaria.toLocaleString('pt-BR') }})</span>
                  </div>
                </td>
                <td class="num subtotal-val">{{ subtotalDia(linhas).toLocaleString('pt-BR') }}</td>
                <td class="num subtotal-val">{{ subtotalDia(linhas).toLocaleString('pt-BR') }}</td>
                <td></td>
                <td class="num valor-dia" colspan="2">{{ temPreco(linhas) ? fmtBRL(valorDia(linhas)) : '—' }}</td>
              </tr>
            </template>
            <tr v-if="filtered.length === 0">
              <td colspan="9" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum registro encontrado.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4" class="total-label">TOTAL GERAL</td>
              <td class="num total-val">{{ totalEnviado.toLocaleString('pt-BR') }}</td>
              <td class="num total-val">{{ totalRecebido.toLocaleString('pt-BR') }}</td>
              <td></td>
              <td class="num total-val-brl" colspan="2">{{ temAlgumPreco ? fmtBRL(totalValor) : '—' }}</td>
            </tr>
          </tfoot>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} registro(s) — Meta diária: {{ metaDiaria.toLocaleString('pt-BR') }} peças</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./VendasView.css"></style>

<style scoped>
.header-right { display: flex; align-items: center; gap: 12px; }
.btn-config { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 14px; font-size: 0.83rem; cursor: pointer; color: #6b7280; transition: background 0.15s; }
.btn-config:hover { background: #e5e7eb; color: #374151; }
.config-panel { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; margin: 0 20px 16px; }
.config-panel h3 { margin: 0 0 12px; font-size: 0.95rem; color: #111827; font-weight: 700; }
.config-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 12px; max-width: 280px; }
.valor-preview { display: flex; flex-direction: column; justify-content: center; }
.valor-calc { font-size: 1.1rem; font-weight: 700; color: #15803d; margin-top: 4px; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.txt-green { color: #15803d; font-weight: 600; }
.subtotal-row td { background: #f9fafb; border-top: 1px solid #e5e7eb; font-weight: 600; padding: 8px 16px; vertical-align: middle; }
.subtotal-label { color: #6b7280; font-size: 0.83rem; }
.subtotal-val { color: #1d4ed8; }
.valor-dia { color: #15803d; font-weight: 700; text-align: right; }
.meta-ok { color: #15803d; }
.meta-nao { color: #dc2626; }
.progress-wrap { display: flex; align-items: center; gap: 8px; }
.progress-bar { flex: 1; height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; min-width: 80px; }
.progress-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
.fill-green { background: #22c55e; }
.fill-yellow { background: #f59e0b; }
.progress-pct { font-size: 0.76rem; color: #9ca3af; white-space: nowrap; }
.total-row td { background: #111827; color: #fff; font-weight: 700; padding: 10px 16px; border-top: 2px solid #1f2937; }
.total-label { color: #9ca3af; font-size: 0.83rem; }
.total-val { color: #fff; }
.total-val-brl { color: #4ade80; text-align: right; font-size: 1rem; }
</style>
