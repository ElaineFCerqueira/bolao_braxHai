import { auth, googleProvider } from '@/firebase/config'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from '@/stores/userStore'
import { initDefaultCategories } from './useCategories'

export function useAuth() {
  const store = useUserStore()

  async function loginGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    await initDefaultCategories(result.user.uid)
    return result.user
  }

  async function loginEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  async function registerEmail(email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await initDefaultCategories(result.user.uid)
    return result.user
  }

  async function logout() {
    await signOut(auth)
    store.clearUser()
  }

  function onAuth(callback) {
    return onAuthStateChanged(auth, callback)
  }

  return { loginGoogle, loginEmail, registerEmail, logout, onAuth }
}
