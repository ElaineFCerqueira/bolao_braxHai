<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%);">

    <!-- Decorative circles -->
    <div class="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10" style="background: #93C5FD; transform: translate(-30%, -30%);"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10" style="background: #BFDBFE; transform: translate(30%, 30%);"></div>

    <div class="w-full max-w-sm relative">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg backdrop-blur">
          💸
        </div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Despesas Pessoais</h1>
        <p class="text-blue-100 mt-2 text-sm">Controle financeiro simples e eficiente</p>
      </div>

      <!-- Card -->
      <div class="bg-white bg-opacity-95 backdrop-blur rounded-3xl p-8 shadow-2xl">

        <div v-if="error" class="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
          {{ error }}
        </div>

        <p class="text-center text-gray-500 text-sm mb-6">
          Acesse sua conta para continuar
        </p>

        <button @click="handleGoogle" :disabled="loading"
          class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-md rounded-2xl py-3.5 text-sm font-semibold text-gray-700 transition-all duration-200 group">
          <span v-if="loading" class="animate-spin text-base">⏳</span>
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{{ loading ? 'Entrando...' : 'Entrar com Google' }}</span>
        </button>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Ao entrar, você concorda com os<br>termos de uso e política de privacidade.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-blue-200 text-xs mt-6">
        Desenvolvido com ❤️ — Zuvinha
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { loginGoogle } = useAuth()
const router = useRouter()
const loading = ref(false)
const error = ref('')

async function handleGoogle() {
  loading.value = true
  error.value = ''
  try {
    await loginGoogle()
    router.push('/')
  } catch (e) {
    error.value = 'Erro ao entrar com Google. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>