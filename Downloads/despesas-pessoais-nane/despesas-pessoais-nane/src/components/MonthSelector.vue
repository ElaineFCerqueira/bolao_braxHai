<template>
  <div class="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
    <button @click="prev" class="text-blue-600 hover:text-blue-800 font-bold text-xl px-2">‹</button>
    <span class="font-semibold text-primary-dark text-base">{{ monthName }} {{ year }}</span>
    <button @click="next" class="text-blue-600 hover:text-blue-800 font-bold text-xl px-2">›</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getMonthName } from '@/utils/date'

const props = defineProps(['month','year'])
const emit = defineEmits(['update:month','update:year'])

const monthName = computed(() => getMonthName(props.month))

function prev() {
  if (props.month === 1) { emit('update:month', 12); emit('update:year', props.year - 1) }
  else emit('update:month', props.month - 1)
}
function next() {
  if (props.month === 12) { emit('update:month', 1); emit('update:year', props.year + 1) }
  else emit('update:month', props.month + 1)
}
</script>
