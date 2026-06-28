import { ref, computed } from 'vue'
import { db } from '@/firebase/config'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch
} from 'firebase/firestore'
import { addMonths } from '@/utils/date'
import { parseCurrency } from '@/utils/currency'

export function useTransactions(uid, month, year) {
  const transactions = ref([])
  const loading = ref(false)

  async function fetchTransactions() {
    loading.value = true
    const q = query(
      collection(db, 'users', uid, 'transactions'),
      where('month', '==', month.value),
      where('year', '==', year.value)
    )
    const snap = await getDocs(q)
    transactions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loading.value = false
  }

  async function addTransaction(form) {
    const amount = parseCurrency(form.amountRaw)
    const baseDate = new Date(form.date + 'T12:00:00')

    if (form.isRecurring) {
      await _createRecurring(form, amount, baseDate)
    } else if (form.paymentMethod === 'parcelado') {
      await _createInstallments(form, amount, baseDate)
    } else {
      await _saveSingle(form, amount, baseDate)
    }
    await fetchTransactions()
  }

  async function _saveSingle(form, amount, date) {
    await addDoc(collection(db, 'users', uid, 'transactions'), {
      description: form.description,
      categoryId: form.categoryId,
      amount,
      totalAmount: amount,
      date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      paymentMethod: form.paymentMethod || 'avista',
      cardId: form.cardId || null,
      status: form.status || 'pendente',
      type: form.type || 'expense',
      isInstallment: false,
      installmentGroupId: null,
      installmentIndex: null,
      installmentTotal: null,
      isRecurring: false,
      recurrenceGroupId: null,
      recurrenceIndex: null,
      isRecurringActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async function _createInstallments(form, totalAmount, baseDate) {
    const qty = parseInt(form.installmentTotal)
    const installmentValue = parseFloat((totalAmount / qty).toFixed(2))
    const groupId = `inst_${Date.now()}_${Math.random().toString(36).substr(2,6)}`
    const batch = writeBatch(db)
    for (let i = 0; i < qty; i++) {
      const d = addMonths(baseDate, i)
      const ref_ = doc(collection(db, 'users', uid, 'transactions'))
      batch.set(ref_, {
        description: `${form.description} (${i+1}/${qty})`,
        categoryId: form.categoryId,
        amount: installmentValue,
        totalAmount,
        date: d,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        paymentMethod: 'parcelado',
        cardId: form.cardId || null,
        status: 'pendente',
        type: form.type || 'expense',
        isInstallment: true,
        installmentGroupId: groupId,
        installmentIndex: i + 1,
        installmentTotal: qty,
        isRecurring: false,
        recurrenceGroupId: null,
        recurrenceIndex: null,
        isRecurringActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    await batch.commit()
  }

  async function _createRecurring(form, amount, baseDate) {
    const groupId = `rec_${Date.now()}_${Math.random().toString(36).substr(2,6)}`
    const batch = writeBatch(db)
    for (let i = 0; i < 12; i++) {
      const d = addMonths(baseDate, i)
      const ref_ = doc(collection(db, 'users', uid, 'transactions'))
      batch.set(ref_, {
        description: form.description,
        categoryId: form.categoryId,
        amount,
        totalAmount: amount,
        date: d,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        paymentMethod: form.paymentMethod || 'avista',
        cardId: form.cardId || null,
        status: 'pendente',
        type: form.type || 'expense',
        isInstallment: false,
        installmentGroupId: null,
        installmentIndex: null,
        installmentTotal: null,
        isRecurring: true,
        recurrenceGroupId: groupId,
        recurrenceIndex: i + 1,
        isRecurringActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    await batch.commit()
  }

  async function updateTransaction(id, data) {
    const amount = data.amountRaw ? parseCurrency(data.amountRaw) : undefined
    const payload = { ...data, updatedAt: new Date() }
    if (amount !== undefined) { payload.amount = amount; delete payload.amountRaw }
    await updateDoc(doc(db, 'users', uid, 'transactions', id), payload)
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = { ...transactions.value[idx], ...payload }
  }

  async function deleteTransaction(id) {
    await deleteDoc(doc(db, 'users', uid, 'transactions', id))
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  async function toggleStatus(id) {
    const t = transactions.value.find(t => t.id === id)
    if (!t) return
    const newStatus = t.status === 'pendente' ? 'pago' : 'pendente'
    await updateDoc(doc(db, 'users', uid, 'transactions', id), { status: newStatus, updatedAt: new Date() })
    t.status = newStatus
  }

  async function cancelRecurring(recurrenceGroupId, fromMonth, fromYear) {
    const q = query(
      collection(db, 'users', uid, 'transactions'),
      where('recurrenceGroupId', '==', recurrenceGroupId),
      where('isRecurringActive', '==', true)
    )
    const snap = await getDocs(q)
    const batch = writeBatch(db)
    snap.docs.forEach(d => {
      const data = d.data()
      const isAfter = data.year > fromYear || (data.year === fromYear && data.month >= fromMonth)
      if (isAfter) batch.update(d.ref, { isRecurringActive: false })
    })
    await batch.commit()
    await fetchTransactions()
  }

  const expenseTransactions = computed(() => transactions.value.filter(t => t.type === 'expense'))
  const totalIncome    = computed(() => transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
  const totalExpenses  = computed(() => expenseTransactions.value.reduce((s, t) => s + t.amount, 0))
  const totalPaid      = computed(() => expenseTransactions.value.filter(t => t.status === 'pago').reduce((s, t) => s + t.amount, 0))
  const totalPending   = computed(() => expenseTransactions.value.filter(t => t.status === 'pendente').reduce((s, t) => s + t.amount, 0))
  const balance        = computed(() => totalIncome.value - totalExpenses.value)

  return {
    transactions, loading, fetchTransactions,
    addTransaction, updateTransaction, deleteTransaction, toggleStatus, cancelRecurring,
    totalIncome, totalExpenses, totalPaid, totalPending, balance
  }
}
