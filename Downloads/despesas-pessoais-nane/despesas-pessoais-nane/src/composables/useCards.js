import { ref } from 'vue'
import { db } from '@/firebase/config'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export function useCards(uid) {
  const cards = ref([])
  const loading = ref(false)

  async function fetchCards() {
    loading.value = true
    const snap = await getDocs(collection(db, 'users', uid, 'cards'))
    cards.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loading.value = false
  }

  async function addCard(name) {
    const ref_ = await addDoc(collection(db, 'users', uid, 'cards'), { name, createdAt: new Date() })
    cards.value.push({ id: ref_.id, name })
  }

  async function updateCard(id, name) {
    await updateDoc(doc(db, 'users', uid, 'cards', id), { name })
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx !== -1) cards.value[idx].name = name
  }

  async function deleteCard(id) {
    await deleteDoc(doc(db, 'users', uid, 'cards', id))
    cards.value = cards.value.filter(c => c.id !== id)
  }

  fetchCards()
  return { cards, loading, fetchCards, addCard, updateCard, deleteCard }
}
