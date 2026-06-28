import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/config'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import AddView from '@/views/AddView.vue'
import HistoryView from '@/views/HistoryView.vue'
import ReportsView from '@/views/ReportsView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { public: true } },
  { path: '/', component: HomeView },
  { path: '/add', component: AddView },
  { path: '/add/:id', component: AddView },
  { path: '/history', component: HistoryView },
  { path: '/reports', component: ReportsView },
  { path: '/settings', component: SettingsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = auth.currentUser
  if (!to.meta.public && !user) next('/login')
  else if (to.path === '/login' && user) next('/')
  else next()
})

export default router
