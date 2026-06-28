<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
      :style="{ backgroundColor: category?.color + '22' }">
      {{ category?.icon || '📦' }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-sm text-gray-800 truncate">{{ t.description }}</p>
      <p class="text-xs text-gray-500">{{ category?.name }} · {{ formatDate(t.date) }}</p>
      <p class="text-xs text-gray-400">{{ cardName }}</p>
    </div>
    <div class="flex flex-col items-end gap-1">
      <p :class="['font-bold text-sm', t.type === 'income' ? 'text-green-600' : 'text-red-500']">
        {{ t.type === 'income' ? '+' : '-' }} {{ fmt(t.amount) }}
      </p>
      <button @click="$emit('toggle', t.id)"
        :class="['text-xs px-2 py-0.5 rounded-full font-medium border transition-colors',
          t.status === 'pago'
            ? 'bg-green-100 text-green-700 border-green-300'
            : 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-green-100 hover:text-green-700 hover:border-green-300']">
        {{ t.status === 'pago' ? '✅ Pago' : '⏳ Pendente' }}
      </button>
    </div>
    <div class="flex flex-col gap-1 ml-1">
      <button @click="$emit('edit', t)" class="text-blue-500 hover:text-blue-700 text-xs">✏️</button>
      <button @click="$emit('delete', t.id)" class="text-red-400 hover:text-red-600 text-xs">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const props = defineProps(['t','categories','cards'])
defineEmits(['toggle','edit','delete'])

const fmt = formatCurrency
const category = computed(() => props.categories?.find(c => c.id === props.t.categoryId))
const cardName = computed(() => props.cards?.find(c => c.id === props.t.cardId)?.name || 'Dinheiro/Pix')
</script>
