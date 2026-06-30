<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { ClipboardList, CheckSquare, XCircle, Pencil, Trash2 } from 'lucide-vue-next'

const authStore = useAuthStore()

type Item = {
  id: string
  referencia: string
  cor: string
  quantidade: number
}

const itens = ref<Item[]>([])
let unsub: (() => void) | null = null

onMounted(() => {
  unsub = onSnapshot(collection(db, 'estoque'), s => {
    itens.value = s.docs.map(d => ({ id: d.id, ...d.data() } as Item))
  })
})

onUnmounted(() => unsub?.())

const showForm = ref(false)
const editingId = ref<string | null>(null)
const searchText = ref('')

const emptyForm = (): Omit<Item, 'id'> => ({ referencia: '', cor: '', quantidade: 0 })
const form = ref(emptyForm())

const filtered = computed(() => {
  if (!searchText.value) return itens.value
  const s = searchText.value.toLowerCase()
  return itens.value.filter(i =>
    i.referencia.toLowerCase().includes(s) || i.cor.toLowerCase().includes(s)
  )
})

const totalItens  = computed(() => itens.value.length)
const totalPecas  = computed(() => itens.value.reduce((s, i) => s + i.quantidade, 0))
const semEstoque  = computed(() => itens.value.filter(i => i.quantidade === 0).length)
const comEstoque  = computed(() => itens.value.filter(i => i.quantidade > 0).length)

const openNew = () => { editingId.value = null; form.value = emptyForm(); showForm.value = true }
const openEdit = (i: Item) => {
  editingId.value = i.id
  form.value = { referencia: i.referencia, cor: i.cor, quantidade: i.quantidade }
  showForm.value = true
}

const saveError = ref('')
const saveForm = async () => {
  saveError.value = ''
  try {
    if (editingId.value) {
      await updateDoc(doc(db, 'estoque', editingId.value), { ...form.value })
    } else {
      await addDoc(collection(db, 'estoque'), { ...form.value })
    }
    showForm.value = false
  } catch (e: any) {
    saveError.value = e?.code === 'permission-denied'
      ? 'Sem permissão. Verifique as regras do Firestore ou faça login novamente.'
      : 'Erro ao salvar: ' + (e?.message ?? String(e))
  }
}

const deleteRow = async (id: string) => {
  if (confirm('Excluir este item?')) {
    await deleteDoc(doc(db, 'estoque', id))
  }
}

const corDot: Record<string, string> = {
  azul: '#3b82f6', preta: '#1e293b', branca: '#e2e8f0',
  palha: '#d4a017', ocre: '#c2773a', marrom: '#7c3f1a', chumbo: '#64748b',
}
const dotColor = (cor: string) => corDot[cor.toLowerCase()] ?? '#94a3b8'
</script>

<template>
  <div class="subpage-layout">
    <main class="subpage-main">
      <div class="subpage-header">
        <div class="subpage-title-group">
          <h1>Estoque</h1>
          <span class="subpage-breadcrumb">Sistema / Estoque</span>
        </div>
        <div class="subpage-user-chip">
          <div class="subpage-avatar">{{ (authStore.user?.email || 'U')[0].toUpperCase() }}</div>
          <span class="subpage-user-name">{{ authStore.user?.email || 'Usuário' }}</span>
        </div>
      </div>

      <div class="mod-stats">
        <div class="mod-stat blue">
          <div class="mod-stat-top"><span class="mod-stat-icon"><ClipboardList :size="18"/></span><span class="mod-stat-label">Referências</span></div>
          <strong>{{ totalItens }}</strong>
          <span>Itens Cadastrados</span>
        </div>
        <div class="mod-stat green">
          <div class="mod-stat-top"><span class="mod-stat-icon"><Package :size="18"/></span><span class="mod-stat-label">Peças</span></div>
          <strong>{{ totalPecas.toLocaleString('pt-BR') }}</strong>
          <span>Total em Estoque</span>
        </div>
        <div class="mod-stat yellow">
          <div class="mod-stat-top"><span class="mod-stat-icon"><CheckSquare :size="18"/></span><span class="mod-stat-label">Com Estoque</span></div>
          <strong>{{ comEstoque }}</strong>
          <span>Com Quantidade</span>
        </div>
        <div class="mod-stat red">
          <div class="mod-stat-top"><span class="mod-stat-icon"><XCircle :size="18"/></span><span class="mod-stat-label">Zerado</span></div>
          <strong>{{ semEstoque }}</strong>
          <span>Sem Quantidade</span>
        </div>
      </div>

      <div class="mod-panel">
        <div class="mod-toolbar">
          <div class="mod-btns">
            <button class="primary" @click="openNew">+ Adicionar Linha</button>
          </div>
          <div class="mod-search">
            <input v-model="searchText" type="text" placeholder="Buscar referência ou cor..." />
          </div>
        </div>

        <div v-if="showForm" class="mod-form">
          <h3>{{ editingId ? 'Editar Item' : 'Novo Item' }}</h3>
          <div class="mod-form-grid">
            <div class="mod-field">
              <label>Referência</label>
              <input v-model="form.referencia" type="text" placeholder="Ex: 102, K48..." />
            </div>
            <div class="mod-field">
              <label>Cor</label>
              <input v-model="form.cor" type="text" placeholder="Ex: Azul, Preta, Palha..." />
            </div>
            <div class="mod-field">
              <label>Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="0" />
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
              <th>Referência</th>
              <th>Cor</th>
              <th style="text-align:right">Quantidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in filtered" :key="i.id">
              <td><code class="ref-code">{{ i.referencia }}</code></td>
              <td>
                <div class="cor-cell">
                  <span class="cor-dot" :style="{ background: dotColor(i.cor) }"></span>
                  {{ i.cor }}
                </div>
              </td>
              <td style="text-align:right;font-variant-numeric:tabular-nums;font-weight:600;">
                {{ i.quantidade.toLocaleString('pt-BR') }}
              </td>
              <td>
                <span class="mod-badge" :class="i.quantidade > 0 ? 'green' : 'red'">
                  {{ i.quantidade > 0 ? 'Em estoque' : 'Zerado' }}
                </span>
              </td>
              <td>
                <div class="mod-actions">
                  <button class="mod-btn-icon edit" @click="openEdit(i)"><Pencil :size="13"/> Editar</button>
                  <button class="mod-btn-icon danger" @click="deleteRow(i.id)"><Trash2 :size="13"/> Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" style="text-align:center;color:#94a3b8;padding:32px;">Nenhum item encontrado.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2" class="total-label">TOTAL</td>
              <td style="text-align:right;font-weight:700;color:#fff;">{{ totalPecas.toLocaleString('pt-BR') }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div class="mod-footer">
          <span>{{ filtered.length }} item(ns) encontrado(s)</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="./Estoques.css"></style>

<style scoped>
.ref-code { font-size: 0.83rem; background: #f3f4f6; padding: 2px 8px; border-radius: 5px; font-weight: 600; color: #374151; }
.cor-cell { display: flex; align-items: center; gap: 8px; }
.cor-dot { width: 13px; height: 13px; border-radius: 50%; border: 1px solid #e5e7eb; flex-shrink: 0; }
.total-row td { background: #111827; color: #fff; font-weight: 700; padding: 10px 16px; border-top: 2px solid #1f2937; }
.total-label { color: #9ca3af; font-size: 0.83rem; }
</style>
