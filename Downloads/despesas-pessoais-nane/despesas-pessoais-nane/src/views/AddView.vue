<template>
  <div class="pb-24 lg:pb-8 px-4 pt-6 max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-5">
      <button @click="router.back()" class="text-blue-600 hover:text-blue-800 text-xl">←</button>
      <h2 class="text-lg font-bold text-primary-dark">{{ isEdit ? 'Editar' : 'Nova' }} Transação</h2>
    </div>

    <!-- Tipo -->
    <div class="card mb-4">
      <div class="flex rounded-xl overflow-hidden border border-gray-200">
        <button @click="form.type = 'expense'"
          :class="['flex-1 py-2.5 text-sm font-semibold transition-colors', form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-600']">
          💸 Despesa
        </button>
        <button @click="form.type = 'income'"
          :class="['flex-1 py-2.5 text-sm font-semibold transition-colors', form.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-600']">
          💰 Receita
        </button>
      </div>
    </div>

    <div class="card space-y-4">
      <!-- Descrição -->
      <div>
        <label class="label">Descrição *</label>
        <input v-model="form.description" type="text" placeholder="Ex: Supermercado, Conta de luz..."
          :class="['input-field', errors.description ? 'input-error' : '']" />
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
      </div>

      <!-- Categoria -->
      <div>
        <label class="label">Categoria *</label>
        <div class="grid grid-cols-4 gap-2">
          <button v-for="cat in filteredCategories" :key="cat.id"
            @click="form.categoryId = cat.id"
            :class="['flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all',
              form.categoryId === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300']">
            <span class="text-xl">{{ cat.icon }}</span>
            <span class="truncate w-full text-center">{{ cat.name }}</span>
          </button>
        </div>
        <p v-if="errors.categoryId" class="text-xs text-red-500 mt-1">{{ errors.categoryId }}</p>
      </div>

      <!-- Valor -->
      <div>
        <label class="label">Valor *</label>
        <input v-model="form.amountRaw" type="text" inputmode="numeric" placeholder="R$ 0,00"
          :class="['input-field text-lg font-bold', errors.amount ? 'input-error' : '']"
          @input="e => form.amountRaw = maskCurrency(e.target.value)" />
        <p v-if="errors.amount" class="text-xs text-red-500 mt-1">{{ errors.amount }}</p>
      </div>

      <!-- Data -->
      <div>
        <label class="label">Data *</label>
        <input v-model="form.date" type="date" :class="['input-field', errors.date ? 'input-error' : '']" />
        <p v-if="errors.date" class="text-xs text-red-500 mt-1">{{ errors.date }}</p>
      </div>

      <!-- Cartão -->
      <div>
        <label class="label">Cartão utilizado</label>
        <select v-model="form.cardId" class="input-field">
          <option value="">Dinheiro / Pix</option>
          <option v-for="c in cards" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="label">Status</label>
        <div class="flex rounded-xl overflow-hidden border border-gray-200">
          <button @click="form.status = 'pendente'"
            :class="['flex-1 py-2 text-sm font-semibold transition-colors', form.status === 'pendente' ? 'bg-yellow-400 text-white' : 'bg-gray-50 text-gray-600']">
            ⏳ Pendente
          </button>
          <button @click="form.status = 'pago'"
            :class="['flex-1 py-2 text-sm font-semibold transition-colors', form.status === 'pago' ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-600']">
            ✅ Pago
          </button>
        </div>
      </div>

      <!-- Recorrente / Parcelado (apenas despesa e novo) -->
      <div v-if="form.type === 'expense' && !isEdit">
        <label class="label">Tipo de lançamento</label>
        <div class="flex rounded-xl overflow-hidden border border-gray-200">
          <button @click="setMode('avista')"
            :class="['flex-1 py-2 text-xs font-semibold transition-colors', mode === 'avista' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600']">
            À Vista
          </button>
          <button @click="setMode('parcelado')"
            :class="['flex-1 py-2 text-xs font-semibold transition-colors', mode === 'parcelado' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600']">
            Parcelado
          </button>
          <button @click="setMode('recorrente')"
            :class="['flex-1 py-2 text-xs font-semibold transition-colors', mode === 'recorrente' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600']">
            Recorrente
          </button>
        </div>

        <div v-if="mode === 'parcelado'" class="mt-3">
          <label class="label">Número de parcelas *</label>
          <input v-model.number="form.installmentTotal" type="number" min="2" max="60" placeholder="Ex: 3"
            :class="['input-field', errors.installmentTotal ? 'input-error' : '']" />
          <p v-if="errors.installmentTotal" class="text-xs text-red-500 mt-1">{{ errors.installmentTotal }}</p>
          <p v-if="form.installmentTotal >= 2 && parsedAmount > 0" class="text-xs text-gray-500 mt-1">
            {{ form.installmentTotal }}x de {{ fmt(parsedAmount / form.installmentTotal) }}
          </p>
        </div>

        <div v-if="mode === 'recorrente'" class="mt-3 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
          📅 Serão criadas <strong>12 ocorrências</strong> mensais automaticamente, iniciando em {{ form.date ? formatDate(new Date(form.date + 'T12:00:00')) : '...' }}
        </div>
      </div>

      <button @click="submit" :disabled="saving"
        class="btn-primary w-full flex items-center justify-center gap-2">
        <span v-if="saving" class="animate-spin">⏳</span>
        {{ isEdit ? 'Salvar alterações' : 'Adicionar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { useCards } from '@/composables/useCards'
import { maskCurrency, parseCurrency, formatCurrency } from '@/utils/currency'
import { formatDate, today } from '@/utils/date'
import { validateTransaction } from '@/utils/validators'
import { db } from '@/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const uid = computed(() => store.user?.uid)
const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())

const { addTransaction, updateTransaction } = useTransactions(uid.value, month, year)
const { categories } = useCategories(uid.value)
const { cards } = useCards(uid.value)

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const errors = ref({})
const mode = ref('avista')
const fmt = formatCurrency

const form = ref({
  description: '', categoryId: '', amountRaw: '', date: today(),
  paymentMethod: 'avista', installmentTotal: null, cardId: '',
  status: 'pendente', type: 'expense', isRecurring: false
})

const filteredCategories = computed(() =>
  categories.value.filter(c => c.type === form.value.type || c.type === 'expense')
)
const parsedAmount = computed(() => parseCurrency(form.value.amountRaw))

function setMode(m) {
  mode.value = m
  form.value.paymentMethod = m === 'recorrente' ? 'avista' : m
  form.value.isRecurring = m === 'recorrente'
  if (m !== 'parcelado') form.value.installmentTotal = null
}

onMounted(async () => {
  if (isEdit.value) {
    const snap = await getDoc(doc(db, 'users', uid.value, 'transactions', route.params.id))
    if (snap.exists()) {
      const d = snap.data()
      const date_ = d.date?.toDate ? d.date.toDate() : new Date(d.date)
      form.value = {
        ...d,
        amountRaw: maskCurrency(String(Math.round(d.amount * 100))),
        date: date_.toISOString().split('T')[0],
        cardId: d.cardId || ''
      }
    }
  }
})

async function submit() {
  errors.value = validateTransaction(form.value)
  if (Object.keys(errors.value).length > 0) return
  saving.value = true
  try {
    if (isEdit.value) {
      await updateTransaction(route.params.id, { ...form.value })
      store.showToast('Transação atualizada!')
    } else {
      await addTransaction({ ...form.value })
      store.showToast('Transação adicionada!')
    }
    router.push('/')
  } catch (e) {
    store.showToast('Erro ao salvar. Tente novamente.', 'error')
  } finally {
    saving.value = false
  }
}
</script>
