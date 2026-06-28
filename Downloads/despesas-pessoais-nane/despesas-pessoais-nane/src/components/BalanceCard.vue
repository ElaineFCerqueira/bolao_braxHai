<template>
  <div class="bg-primary-dark rounded-2xl p-5 text-white shadow-lg">
    <p class="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Saldo do Mês</p>
    <p :class="['text-3xl font-bold mb-4', balance >= 0 ? 'text-green-400' : 'text-red-400']">
      {{ fmt(balance) }}
    </p>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-blue-900 bg-opacity-50 rounded-xl p-3">
        <p class="text-blue-300 text-xs mb-1">💰 Receitas</p>
        <p class="text-green-400 font-bold text-sm">{{ fmt(totalIncome) }}</p>
      </div>
      <div class="bg-blue-900 bg-opacity-50 rounded-xl p-3">
        <p class="text-blue-300 text-xs mb-1">💸 Despesas</p>
        <p class="text-red-400 font-bold text-sm">{{ fmt(totalExpenses) }}</p>
      </div>
      <div class="bg-blue-900 bg-opacity-50 rounded-xl p-3">
        <p class="text-blue-300 text-xs mb-1">✅ Pagas</p>
        <p class="text-green-300 font-bold text-sm">{{ fmt(totalPaid) }}</p>
      </div>
      <div class="bg-blue-900 bg-opacity-50 rounded-xl p-3">
        <p class="text-blue-300 text-xs mb-1">⏳ Pendentes</p>
        <p class="text-yellow-400 font-bold text-sm">{{ fmt(totalPending) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'
defineProps(['balance','totalIncome','totalExpenses','totalPaid','totalPending'])
const fmt = formatCurrency
</script>
