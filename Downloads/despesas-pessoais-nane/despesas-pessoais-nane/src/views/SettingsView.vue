<template>
  <div class="pb-24 lg:pb-8 px-4 pt-6 max-w-lg mx-auto">
    <h2 class="text-lg font-bold text-primary-dark mb-5">Configurações</h2>

    <!-- Cards section -->
    <div class="card mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 text-sm">💳 Meus Cartões</h3>
        <button @click="showCardForm = true" class="text-xs btn-primary py-1 px-3">+ Novo</button>
      </div>

      <div v-if="cards.length === 0" class="text-center py-4 text-gray-400 text-sm">Nenhum cartão cadastrado.</div>
      <div v-else class="divide-y divide-gray-100">
        <div v-for="c in cards" :key="c.id" class="flex items-center justify-between py-2.5">
          <span class="text-sm text-gray-700">💳 {{ c.name }}</span>
          <div class="flex gap-2">
            <button @click="startEditCard(c)" class="text-blue-500 hover:text-blue-700 text-xs">✏️ Editar</button>
            <button @click="removeCard(c.id)" class="text-red-400 hover:text-red-600 text-xs">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Card form -->
      <div v-if="showCardForm" class="mt-3 border-t pt-3 flex gap-2">
        <input v-model="cardName" type="text" placeholder="Nome do cartão (ex: Nubank)" class="input-field flex-1" @keyup.enter="saveCard" />
        <button @click="saveCard" class="btn-primary py-1.5 px-3 text-xs">Salvar</button>
        <button @click="cancelCard" class="btn-ghost py-1.5 px-3 text-xs">✕</button>
      </div>
    </div>

    <!-- Categories section -->
    <div class="card mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 text-sm">🏷️ Categorias</h3>
        <button @click="showCatForm = true" class="text-xs btn-primary py-1 px-3">+ Nova</button>
      </div>

      <div class="divide-y divide-gray-100">
        <div v-for="c in categories" :key="c.id" class="flex items-center justify-between py-2.5">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ c.icon }}</span>
            <div>
              <p class="text-sm font-medium text-gray-700">{{ c.name }}</p>
              <p class="text-xs text-gray-400">{{ c.type === 'income' ? 'Receita' : 'Despesa' }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button v-if="!c.isDefault" @click="removeCat(c.id)" class="text-red-400 hover:text-red-600 text-xs">🗑️</button>
            <span v-else class="text-xs text-gray-300">padrão</span>
          </div>
        </div>
      </div>

      <!-- Category form -->
      <div v-if="showCatForm" class="mt-3 border-t pt-3 space-y-2">
        <input v-model="catForm.name" type="text" placeholder="Nome da categoria" class="input-field" />
        <input v-model="catForm.icon" type="text" placeholder="Emoji (ex: 🏠)" class="input-field" maxlength="2" />
        <select v-model="catForm.type" class="input-field">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        <div class="flex gap-2">
          <button @click="saveCat" class="btn-primary flex-1 text-xs py-1.5">Salvar</button>
          <button @click="showCatForm = false" class="btn-ghost flex-1 text-xs py-1.5">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Account -->
    <div class="card">
      <h3 class="font-semibold text-gray-800 text-sm mb-3">👤 Conta</h3>
      <p class="text-sm text-gray-600 mb-4">{{ store.user?.email }}</p>
      <button @click="doLogout" class="btn-danger w-full text-sm">🚪 Sair da conta</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useCards } from '@/composables/useCards'
import { useCategories } from '@/composables/useCategories'
import { useAuth } from '@/composables/useAuth'

const store = useUserStore()
const router = useRouter()
const uid = computed(() => store.user?.uid)
const { logout } = useAuth()

const { cards, addCard, updateCard, deleteCard } = useCards(uid.value)
const { categories, addCategory, deleteCategory } = useCategories(uid.value)

// Cards
const showCardForm = ref(false)
const cardName = ref('')
const editingCard = ref(null)

function startEditCard(c) { editingCard.value = c; cardName.value = c.name; showCardForm.value = true }
function cancelCard() { showCardForm.value = false; cardName.value = ''; editingCard.value = null }

async function saveCard() {
  if (!cardName.value.trim()) return
  if (editingCard.value) {
    await updateCard(editingCard.value.id, cardName.value.trim())
    store.showToast('Cartão atualizado!')
  } else {
    await addCard(cardName.value.trim())
    store.showToast('Cartão adicionado!')
  }
  cancelCard()
}

async function removeCard(id) {
  if (!confirm('Excluir este cartão?')) return
  await deleteCard(id)
  store.showToast('Cartão removido')
}

// Categories
const showCatForm = ref(false)
const catForm = ref({ name: '', icon: '📦', type: 'expense' })

async function saveCat() {
  if (!catForm.value.name.trim()) return
  await addCategory({ ...catForm.value, color: '#6B7280' })
  store.showToast('Categoria criada!')
  showCatForm.value = false
  catForm.value = { name: '', icon: '📦', type: 'expense' }
}

async function removeCat(id) {
  if (!confirm('Excluir esta categoria?')) return
  await deleteCategory(id)
  store.showToast('Categoria removida')
}

async function doLogout() {
  await logout()
  router.push('/login')
}
</script>
