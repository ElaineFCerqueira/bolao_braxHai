import { ref } from 'vue'
import { db } from '@/firebase/config'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', icon: '🍽️', color: '#F59E0B', type: 'expense', isDefault: true },
  { name: 'Transporte',  icon: '🚗', color: '#3B82F6', type: 'expense', isDefault: true },
  { name: 'Lazer',       icon: '🎉', color: '#8B5CF6', type: 'expense', isDefault: true },
  { name: 'Saúde',       icon: '❤️', color: '#EF4444', type: 'expense', isDefault: true },
  { name: 'Educação',    icon: '📚', color: '#10B981', type: 'expense', isDefault: true },
  { name: 'Outros',      icon: '📦', color: '#6B7280', type: 'expense', isDefault: true },
  { name: 'Receita',     icon: '💰', color: '#22C55E', type: 'income',  isDefault: true }
]

export async function initDefaultCategories(uid) {
  const ref_ = doc(db, 'users', uid, 'meta', 'initialized')
  const snap = await getDoc(ref_)
  if (snap.exists()) return
  const catRef = collection(db, 'users', uid, 'categories')
  for (const cat of DEFAULT_CATEGORIES) {
    await addDoc(catRef, { ...cat, createdAt: new Date() })
  }
  await setDoc(ref_, { done: true })
}

export function useCategories(uid) {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    const snap = await getDocs(collection(db, 'users', uid, 'categories'))
    categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loading.value = false
  }

  async function addCategory(data) {
    const ref_ = await addDoc(collection(db, 'users', uid, 'categories'), { ...data, isDefault: false, createdAt: new Date() })
    categories.value.push({ id: ref_.id, ...data, isDefault: false })
  }

  async function updateCategory(id, data) {
    await updateDoc(doc(db, 'users', uid, 'categories', id), data)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...data }
  }

  async function deleteCategory(id) {
    await deleteDoc(doc(db, 'users', uid, 'categories', id))
    categories.value = categories.value.filter(c => c.id !== id)
  }

  fetchCategories()
  return { categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory }
}
