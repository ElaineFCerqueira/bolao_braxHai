<template>
  <div class="pb-24 lg:pb-8 px-4 pt-6 max-w-2xl mx-auto">
    <h2 class="text-lg font-bold text-primary-dark mb-4">Dashboard</h2>

    <MonthSelector :month="month" :year="year" @update:month="m => { month = m; refresh() }" @update:year="y => { year = y; refresh() }" class="mb-4" />

    <BalanceCard :balance="balance" :totalIncome="totalIncome" :totalExpenses="totalExpenses" :totalPaid="totalPaid" :totalPending="totalPending" class="mb-5" />

    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-700 text-sm">Últimas transações</h3>
      <router-link to="/history" class="text-xs text-blue-600 hover:underline">Ver todas →</router-link>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-400">Carregando...</div>
    <div v-else-if="recent.length === 0" class="card text-center py-8 text-gray-400 text-sm">
      Nenhuma transação neste mês.<br>
      <router-link to="/add" class="text-blue-600 hover:underline mt-1 block">Adicionar primeira despesa</router-link>
    </div>
    <div v-else class="space-y-3">
      <TransactionItem v-for="t in recent" :key="t.id" :t="t" :categories="categories" :cards="cards"
        @toggle="toggleStatus" @edit="goEdit" @delete="del" />
    </div>

    <!-- FAB -->
    <router-link to="/add"
      class="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center text-2xl transition-transform hover:scale-110 z-10">
      +
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useCards } from '@/composables/useCards'
import MonthSelector from '@/components/MonthSelector.vue'
import BalanceCard from '@/components/BalanceCard.vue'
import TransactionItem from '@/components/TransactionItem.vue'

const store = useUserStore()
const router = useRouter()
const uid = computed(() => store.user?.uid)
const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())

const { transactions, loading, fetchTransactions, toggleStatus, deleteTransaction, balance, totalIncome, totalExpenses, totalPaid, totalPending } = useTransactions(uid.value, month, year)
const { categories } = useCategories(uid.value)
const { cards } = useCards(uid.value)

const recent = computed(() => [...transactions.value].sort((a,b) => {
  const da = a.date?.toDate ? a.date.toDate() : new Date(a.date)
  const db_ = b.date?.toDate ? b.date.toDate() : new Date(b.date)
  return db_ - da
}).slice(0, 5))

function refresh() { fetchTransactions() }

async function del(id) {
  if (!confirm('Excluir esta transação?')) return
  await deleteTransaction(id)
  store.showToast('Transação excluída')
}

function goEdit(t) { router.push(`/add/${t.id}`) }
onMounted(fetchTransactions)
</script>
