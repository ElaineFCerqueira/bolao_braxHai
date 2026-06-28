<template>
  <div class="min-h-screen bg-slate-100 font-sans">
    <!-- Sidebar (desktop) -->
    <aside v-if="user" class="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-primary-dark text-white z-20">
      <div class="px-6 py-6 border-b border-blue-900">
        <h1 class="text-xl font-bold tracking-tight">💸 Despesas</h1>
        <p class="text-xs text-blue-300 mt-1 truncate">{{ user.email }}</p>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-1">
        <SidebarLink to="/" icon="🏠" label="Dashboard" />
        <SidebarLink to="/add" icon="➕" label="Nova Despesa" />
        <SidebarLink to="/history" icon="📋" label="Histórico" />
        <SidebarLink to="/reports" icon="📊" label="Relatórios" />
        <SidebarLink to="/settings" icon="⚙️" label="Configurações" />
      </nav>
      <div class="px-4 py-4 border-t border-blue-900">
        <button @click="logout" class="w-full text-left text-sm text-blue-300 hover:text-white transition px-2 py-2 rounded-lg hover:bg-blue-900">
          🚪 Sair
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main :class="user ? 'lg:ml-60' : ''">
      <router-view />
    </main>

    <!-- Bottom Nav (mobile) -->
    <BottomNav v-if="user" />

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" :class="[
        'fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold z-50 flex items-center gap-2',
        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
      ]">
        <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import BottomNav from '@/components/BottomNav.vue'
import SidebarLink from '@/components/SidebarLink.vue'

const store = useUserStore()
const { onAuth, logout: doLogout } = useAuth()
const router = useRouter()
const user = computed(() => store.user)
const toast = computed(() => store.toast)

onMounted(() => {
  onAuth(u => {
    store.setUser(u)
    if (!u) router.push('/login')
  })
})

async function logout() {
  await doLogout()
  router.push('/login')
}
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>
