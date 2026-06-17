import { useState, useEffect } from 'react'
import { subscribePredictions } from '../services/predictions'

export function usePredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribePredictions(
      (data) => { setPredictions(data); setLoading(false) },
      (err)  => { console.error(err);   setLoading(false) }
    )
    return unsub
  }, [])

  return { predictions, loading }
}
