<template>
  <div class="pb-24 lg:pb-8 px-4 pt-6 max-w-5xl mx-auto">
    <h2 class="text-lg font-bold text-primary-dark mb-4">Relatórios</h2>

    <MonthSelector :month="month" :year="year" @update:month="m => { month = m; fetchTransactions() }" @update:year="y => { year = y; fetchTransactions() }" class="mb-4" />

    <div v-if="loading" class="text-center py-8 text-gray-400">Carregando...</div>

    <div v-else>
      <!-- Charts tabs -->
      <div class="flex gap-2 mb-4">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
          :class="['text-xs font-semibold px-4 py-2 rounded-xl transition-colors border',
            activeTab === tab.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300']">
          {{ tab.label }}
        </button>
      </div>

      <!-- Chart by Category -->
      <div v-if="activeTab === 'category'" class="card mb-4">
        <h3 class="font-semibold text-gray-700 text-sm mb-3">Distribuição por Categoria</h3>
        <div v-if="categoryData.labels.length === 0" class="text-center py-8 text-gray-400 text-sm">Sem despesas neste mês.</div>
        <div v-else class="max-w-xs mx-auto">
          <Pie :data="categoryData" :options="chartOptions" />
        </div>
        <!-- Totals table -->
        <div class="mt-4 divide-y divide-gray-100">
          <div v-for="(item, i) in categoryTotals" :key="i" class="flex items-center justify-between py-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-sm text-gray-700">{{ item.name }}</span>
            </div>
            <div class="text-right">
              <span class="font-semibold text-sm text-gray-800">{{ fmt(item.total) }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ item.pct }}%</span>
            </div>
          </div>
          <div class="flex justify-between py-2 font-bold text-sm">
            <span>Total</span>
            <span class="text-red-500">{{ fmt(totalExpenses) }}</span>
          </div>
        </div>
      </div>

      <!-- Chart by Card -->
      <div v-if="activeTab === 'card'" class="card mb-4">
        <h3 class="font-semibold text-gray-700 text-sm mb-3">Distribuição por Cartão</h3>
        <div v-if="cardData.labels.length === 0" class="text-center py-8 text-gray-400 text-sm">Sem despesas neste mês.</div>
        <div v-else class="max-w-xs mx-auto">
          <Pie :data="cardData" :options="chartOptions" />
        </div>
        <div class="mt-4 divide-y divide-gray-100">
          <div v-for="(item, i) in cardTotals" :key="i" class="flex items-center justify-between py-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-sm text-gray-700">{{ item.name }}</span>
            </div>
            <div class="text-right">
              <span class="font-semibold text-sm text-gray-800">{{ fmt(item.total) }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ item.pct }}%</span>
            </div>
          </div>
          <div class="flex justify-between py-2 font-bold text-sm">
            <span>Total</span>
            <span class="text-red-500">{{ fmt(totalExpenses) }}</span>
          </div>
        </div>
      </div>

      <!-- Bar chart 6 months -->
      <div v-if="activeTab === 'evolution'" class="card mb-4">
        <h3 class="font-semibold text-gray-700 text-sm mb-3">Evolução dos últimos 6 meses</h3>
        <Bar :data="barData" :options="barOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useCards } from '@/composables/useCards'
import MonthSelector from '@/components/MonthSelector.vue'
import { Pie, Bar } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { formatCurrency } from '@/utils/currency'
import { getMonthName, addMonths } from '@/utils/date'
import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useUserStore()
const uid = computed(() => store.user?.uid)
const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())
const activeTab = ref('category')
const tabs = [
  { key: 'category', label: '🍕 Por Categoria' },
  { key: 'card', label: '💳 Por Cartão' },
  { key: 'evolution', label: '📈 Evolução' }
]

const { transactions, loading, fetchTransactions, totalExpenses } = useTransactions(uid.value, month, year)
const { categories } = useCategories(uid.value)
const { cards } = useCards(uid.value)
const fmt = formatCurrency

const COLORS = ['#2563EB','#EF4444','#F59E0B','#22C55E','#8B5CF6','#EC4899','#06B6D4','#84CC16']

const expenses = computed(() => transactions.value.filter(t => t.type === 'expense'))

const categoryTotals = computed(() => {
  const map = {}
  expenses.value.forEach(t => {
    const cat = categories.value.find(c => c.id === t.categoryId)
    const name = cat?.name || 'Outros'
    map[name] = (map[name] || 0) + t.amount
  })
  const total = totalExpenses.value || 1
  return Object.entries(map).map(([name, v], i) => ({
    name, total: v, color: COLORS[i % COLORS.length],
    pct: Math.round(v / total * 100)
  })).sort((a,b) => b.total - a.total)
})

const cardTotals = computed(() => {
  const map = {}
  expenses.value.forEach(t => {
    const name = cards.value.find(c => c.id === t.cardId)?.name || 'Dinheiro/Pix'
    map[name] = (map[name] || 0) + t.amount
  })
  const total = totalExpenses.value || 1
  return Object.entries(map).map(([name, v], i) => ({
    name, total: v, color: COLORS[i % COLORS.length],
    pct: Math.round(v / total * 100)
  })).sort((a,b) => b.total - a.total)
})

const categoryData = computed(() => ({
  labels: categoryTotals.value.map(i => i.name),
  datasets: [{ data: categoryTotals.value.map(i => i.total), backgroundColor: categoryTotals.value.map(i => i.color), borderWidth: 2, borderColor: '#fff' }]
}))

const cardData = computed(() => ({
  labels: cardTotals.value.map(i => i.name),
  datasets: [{ data: cardTotals.value.map(i => i.total), backgroundColor: cardTotals.value.map(i => i.color), borderWidth: 2, borderColor: '#fff' }]
}))

const chartOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } }

// Bar chart: last 6 months
const barData = ref({ labels: [], datasets: [] })
const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => 'R$ ' + v } } } }

async function loadBarData() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(new Date(year.value, month.value - 1, 1), -i)
    months.push({ m: d.getMonth() + 1, y: d.getFullYear(), label: getMonthName(d.getMonth() + 1).slice(0,3) })
  }
  const totals = []
  for (const { m, y } of months) {
    const q = query(collection(db, 'users', uid.value, 'transactions'), where('month','==',m), where('year','==',y), where('type','==','expense'))
    const snap = await getDocs(q)
    totals.push(snap.docs.reduce((s, d) => s + d.data().amount, 0))
  }
  barData.value = {
    labels: months.map(m => m.label),
    datasets: [{ data: totals, backgroundColor: '#2563EB', borderRadius: 8, label: 'Despesas' }]
  }
}

onMounted(() => { fetchTransactions(); loadBarData() })
watch([month, year], () => { fetchTransactions(); loadBarData() })
</script>
