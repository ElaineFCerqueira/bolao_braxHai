import { useState, useEffect, useMemo } from 'react'
import { submitPrediction, getScoreCount } from '../services/predictions'
import { CheckCircle2, AlertTriangle, ShieldAlert, XCircle } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'

const MATCH_START = import.meta.env.VITE_MATCH_START || '2026-06-19T22:30:00Z'

export default function PredictionForm({ onSuccess, predictions }) {
  const { expired } = useCountdown(MATCH_START)
  const [name, setName] = useState('')
  const [scoreBrasil, setScoreBrasil] = useState('')
  const [scoreHaiti, setScoreHaiti] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check availability from live predictions list (client-side, instant feedback)
  const availability = useMemo(() => {
    if (scoreBrasil === '' || scoreHaiti === '') return null
    const count = (predictions || []).filter(
      (p) => p.scoreBrasil === parseInt(scoreBrasil) && p.scoreHaiti === parseInt(scoreHaiti)
    ).length
    if (count >= 2) return { status: 'esgotado', msg: `Placar ${scoreBrasil}×${scoreHaiti} esgotado! Já tem 2 cadastros. Escolha outro.` }
    if (count === 1) return { status: 'limitado', msg: 'Última vaga disponível para este placar!' }
    return { status: 'disponivel', msg: 'Disponível! Pode cadastrar.' }
  }, [scoreBrasil, scoreHaiti, predictions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Preencha seu nome completo.'); return }
    if (scoreBrasil === '' || scoreHaiti === '') { setError('Informe o placar para os dois times.'); return }
    if (availability?.status === 'esgotado') { setError('Este placar está esgotado. Escolha outro!'); return }
    setError('')
    setLoading(true)
    try {
      await submitPrediction({ name, scoreBrasil, scoreHaiti })
      onSuccess({ name, scoreBrasil: parseInt(scoreBrasil), scoreHaiti: parseInt(scoreHaiti) })
      setName(''); setScoreBrasil(''); setScoreHaiti('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (expired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-2">
        <XCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="font-bold text-sm text-red-800">Apostas Fechadas!</p>
        <p className="text-xs text-red-600">O jogo já começou. Boa sorte a todos! ⚽</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rule warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          REGRA LIMITE DE REPETIÇÃO
        </div>
        <p>Cada placar exato só pode ser registrado por <strong>até 2 pessoas</strong>.</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Seu Nome Completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João Silva"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          required
        />
      </div>

      {/* Score */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Palpite do Placar</label>
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <span className="w-3.5 h-2.5 bg-yellow-400 border border-yellow-500 rounded-sm inline-block"></span>
              BRASIL
            </span>
            <input
              type="number" min="0" max="15"
              value={scoreBrasil}
              onChange={(e) => setScoreBrasil(e.target.value)}
              placeholder="0"
              className="w-16 h-12 text-center text-xl font-black rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <span className="text-xl font-bold text-slate-400">×</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <span className="w-3.5 h-2.5 bg-blue-600 border border-blue-700 rounded-sm inline-block"></span>
              HAITI
            </span>
            <input
              type="number" min="0" max="15"
              value={scoreHaiti}
              onChange={(e) => setScoreHaiti(e.target.value)}
              placeholder="0"
              className="w-16 h-12 text-center text-xl font-black rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Availability indicator */}
      {availability && (
        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 font-medium border ${
          availability.status === 'esgotado' ? 'bg-red-50 text-red-700 border-red-100' :
          availability.status === 'limitado'  ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-green-50 text-green-700 border-green-100'
        }`}>
          {availability.status === 'disponivel'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {availability.msg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || availability?.status === 'esgotado'}
        className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all text-sm ${
          availability?.status === 'esgotado'
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95'
        }`}
      >
        {loading ? 'Enviando...' : availability?.status === 'esgotado' ? 'Placar Sem Vagas' : 'Confirmar Palpite →'}
      </button>
    </form>
  )
}
