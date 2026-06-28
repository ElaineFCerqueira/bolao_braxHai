<template>
  <router-link :to="to" class="flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors"
    :class="isActive ? 'text-blue-400' : 'text-blue-200 hover:text-white'">
    <span class="text-lg leading-tight">{{ icon }}</span>
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
