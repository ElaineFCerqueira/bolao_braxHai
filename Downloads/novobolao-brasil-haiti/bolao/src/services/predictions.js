import { db } from './firebase'
import {
  collection,
  doc,
  runTransaction,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore'

// Chave usada para o documento contador de cada placar
// Ex: "2x1" → doc em /scoreCounters/2x1
const scoreKey = (brasil, haiti) => `${brasil}x${haiti}`

/**
 * Submete um palpite usando transação atômica.
 * Garante que nunca mais de 2 pessoas escolham o mesmo placar.
 * Lança erro com mensagem amigável se o limite for atingido.
 */
export async function submitPrediction({ name, scoreBrasil, scoreHaiti }) {
  const key = scoreKey(scoreBrasil, scoreHaiti)
  const counterRef = doc(db, 'scoreCounters', key)
  const predictionsRef = collection(db, 'predictions')
  const newPredRef = doc(predictionsRef)

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef)
    const current = counterSnap.exists() ? counterSnap.data().count : 0

    if (current >= 2) {
      throw new Error(
        `O placar ${scoreBrasil} x ${scoreHaiti} já foi escolhido por 2 pessoas. Escolha outro placar!`
      )
    }

    // Atualiza ou cria o contador
    tx.set(counterRef, { count: current + 1 }, { merge: true })

    // Salva o palpite
    tx.set(newPredRef, {
      name: name.trim(),
      scoreBrasil: Number(scoreBrasil),
      scoreHaiti:  Number(scoreHaiti),
      scoreKey:    key,
      createdAt:   serverTimestamp(),
      paid:        false, // será confirmado manualmente pelo organizador
    })
  })

  return newPredRef.id
}

/**
 * Subscribe em tempo real aos palpites (ordenados por data).
 */
export function subscribePredictions(onData, onError) {
  const q = query(collection(db, 'predictions'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    onData(data)
  }, onError)
}

/**
 * Busca quantas pessoas já escolheram um determinado placar.
 */
export async function getScoreCount(scoreBrasil, scoreHaiti) {
  const key = scoreKey(scoreBrasil, scoreHaiti)
  const snap = await getDoc(doc(db, 'scoreCounters', key))
  return snap.exists() ? snap.data().count : 0
}
