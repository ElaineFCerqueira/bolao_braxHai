<template>
  <router-link :to="to" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
    :class="isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-900 hover:text-white'">
    <span>{{ icon }}</span>
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const props = defineProps(['to','icon','label'])
const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
