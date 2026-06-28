import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const toast = ref(null)

  function setUser(u) { user.value = u }
  function clearUser() { user.value = null }

  function showToast(message, type = 'success') {
    toast.value = { message, type, id: Date.now() }
    setTimeout(() => { toast.value = null }, 3500)
  }

  return { user, toast, setUser, clearUser, showToast }
})
