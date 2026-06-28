<template>
  <div class="pb-24 lg:pb-8 px-4 pt-6 max-w-5xl mx-auto">
    <h2 class="text-lg font-bold text-primary-dark mb-4">Histórico</h2>

    <MonthSelector :month="month" :year="year" @update:month="m => { month = m; fetchTransactions() }" @update:year="y => { year = y; fetchTransactions() }" class="mb-4" />

    <!-- Filtros -->
    <div class="card mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div>
        <label class="label">Tipo</label>
        <select v-model="filterType" class="input-field">
          <option value="">Todos</option>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>
      <div>
        <label class="label">Categoria</label>
        <select v-model="filterCat" class="input-field">
          <option value="">Todas</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Cartão</label>
        <select v-model="filterCard" class="input-field">
          <option value="">Todos</option>
          <option v-for="c in cards" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Status</label>
        <select v-model="filterStatus" class="input-field">
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </select>
      </div>
      <div class="col-span-2 lg:col-span-4">
        <label class="label">Buscar</label>
        <input v-model="search" type="text" placeholder="Buscar por descrição..." class="input-field" />
      </div>
    </div>

    <!-- Export buttons -->
    <div class="flex gap-2 mb-4 justify-end">
      <button @click="doExport('xlsx')" class="btn-primary text-xs py-1.5 px-3">⬇️ XLSX</button>
      <button @click="doExport('csv')" class="btn-ghost text-xs py-1.5 px-3">⬇️ CSV</button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-400">Carregando...</div>

    <!-- Desktop table -->
    <div v-else class="hidden lg:block card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th v-for="col in cols" :key="col.key" @click="sortBy(col.key)"
              class="text-left text-xs font-semibold text-gray-500 py-3 px-3 cursor-pointer hover:text-blue-600 select-none">
              {{ col.label }} {{ sortKey === col.key ? (sortAsc ? '↑' : '↓') : '' }}
            </th>
            <th class="py-3 px-3 text-xs font-semibold text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0"><td colspan="7" class="text-center py-8 text-gray-400">Nenhuma transação encontrada.</td></tr>
          <tr v-for="t in sorted" :key="t.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-3 font-medium text-gray-800 max-w-[180px] truncate">{{ t.description }}</td>
            <td class="py-3 px-3 text-gray-600">
              <span class="flex items-center gap-1">
                <span>{{ catIcon(t) }}</span>{{ catName(t) }}
              </span>
            </td>
            <td class="py-3 px-3 font-bold" :class="t.type === 'income' ? 'text-green-600' : 'text-red-500'">
              {{ t.type === 'income' ? '+' : '-' }}{{ fmt(t.amount) }}
            </td>
            <td class="py-3 px-3 text-gray-500">{{ formatDate(t.date) }}</td>
            <td class="py-3 px-3 text-gray-500">{{ cardName(t) }}</td>
            <td class="py-3 px-3">
              <button @click="toggleStatus(t.id)"
                :class="['text-xs px-2 py-1 rounded-full font-medium border transition-colors whitespace-nowrap',
                  t.status === 'pago' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-green-100 hover:text-green-700 hover:border-green-300']">
                {{ t.status === 'pago' ? '✅ Pago' : '⏳ Pendente' }}
              </button>
            </td>
            <td class="py-3 px-3">
              <div class="flex gap-2">
                <button @click="router.push(`/add/${t.id}`)" class="text-blue-500 hover:text-blue-700">✏️</button>
                <button @click="del(t.id)" class="text-red-400 hover:text-red-600">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="filtered.length > 0">
          <tr class="bg-gray-50 font-bold">
            <td colspan="2" class="px-3 py-2 text-xs text-gray-600">Total ({{ filtered.length }} itens)</td>
            <td class="px-3 py-2 text-red-500">{{ fmt(totalFiltered) }}</td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="lg:hidden space-y-3">
      <div v-if="filtered.length === 0" class="card text-center py-8 text-gray-400 text-sm">Nenhuma transação encontrada.</div>
      <TransactionItem v-for="t in sorted" :key="t.id" :t="t" :categories="categories" :cards="cards"
        @toggle="toggleStatus" @edit="t => router.push(`/add/${t.id}`)" @delete="del" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useCards } from '@/composables/useCards'
import { useExport } from '@/composables/useExport'
import MonthSelector from '@/components/MonthSelector.vue'
import TransactionItem from '@/components/TransactionItem.vue'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const store = useUserStore()
const router = useRouter()
const uid = computed(() => store.user?.uid)
const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())

const { transactions, loading, fetchTransactions, toggleStatus, deleteTransaction } = useTransactions(uid.value, month, year)
const { categories } = useCategories(uid.value)
const { cards } = useCards(uid.value)
const { exportXLSX, exportCSV } = useExport()

const fmt = formatCurrency
const filterType = ref(''), filterCat = ref(''), filterCard = ref(''), filterStatus = ref(''), search = ref('')
const sortKey = ref('date'), sortAsc = ref(false)

const cols = [
  { key: 'description', label: 'Descrição' },
  { key: 'categoryId', label: 'Categoria' },
  { key: 'amount', label: 'Valor' },
  { key: 'date', label: 'Data' },
  { key: 'cardId', label: 'Cartão' },
  { key: 'status', label: 'Status' }
]

const filtered = computed(() => transactions.value.filter(t => {
  if (filterType.value && t.type !== filterType.value) return false
  if (filterCat.value && t.categoryId !== filterCat.value) return false
  if (filterCard.value && t.cardId !== filterCard.value) return false
  if (filterStatus.value && t.status !== filterStatus.value) return false
  if (search.value && !t.description.toLowerCase().includes(search.value.toLowerCase())) return false
  return true
}))

const sorted = computed(() => [...filtered.value].sort((a, b) => {
  let av = a[sortKey.value], bv = b[sortKey.value]
  if (sortKey.value === 'date') {
    av = av?.toDate ? av.toDate() : new Date(av)
    bv = bv?.toDate ? bv.toDate() : new Date(bv)
  }
  if (av < bv) return sortAsc.value ? -1 : 1
  if (av > bv) return sortAsc.value ? 1 : -1
  return 0
}))

const totalFiltered = computed(() => filtered.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))

function sortBy(key) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

function catName(t) { return categories.value.find(c => c.id === t.categoryId)?.name || '-' }
function catIcon(t) { return categories.value.find(c => c.id === t.categoryId)?.icon || '📦' }
function cardName(t) { return cards.value.find(c => c.id === t.cardId)?.name || 'Dinheiro/Pix' }

async function del(id) {
  if (!confirm('Excluir esta transação?')) return
  await deleteTransaction(id)
  store.showToast('Transação excluída')
}

function doExport(type) {
  if (type === 'xlsx') exportXLSX(transactions.value, categories.value, cards.value, month.value, year.value)
  else exportCSV(transactions.value, categories.value, cards.value, month.value, year.value)
}

onMounted(fetchTransactions)
</script>
