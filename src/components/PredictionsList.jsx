import { Search, CheckCircle2, Clock, Users, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function PredictionsList({ predictions, loading }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return predictions
    const q = search.toLowerCase()
    return predictions.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        `brasil ${p.scoreBrasil} x ${p.scoreHaiti} haiti`.includes(q)
    )
  }, [predictions, search])

  // Count per scoreKey to show CHEIO badge
  const countsByKey = useMemo(() =>
    predictions.reduce((acc, p) => {
      acc[p.scoreKey] = (acc[p.scoreKey] || 0) + 1
      return acc
    }, {}),
    [predictions]
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-5 bg-blue-500 rounded-full inline-block"></span>
          Palpites Registrados
        </h2>
        {!loading && (
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {predictions.length}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou placar..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p className="text-3xl mb-2">⚽</p>
          <p className="text-sm font-medium">
            {predictions.length === 0 ? 'Nenhum palpite ainda. Seja o primeiro!' : 'Nenhum resultado para a busca.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((p, i) => {
            const count = countsByKey[p.scoreKey] || 0
            return (
              <li
                key={p.id}
                className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 py-2.5 border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-slate-400 font-mono w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="font-semibold text-slate-800 text-sm truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-black text-blue-700 text-sm">
                    {p.scoreBrasil} × {p.scoreHaiti}
                  </span>
                  {count >= 2 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">CHEIO</span>
                  )}
                  {count === 1 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">1/2</span>
                  )}
                  {p.paid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" title="Pago" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" title="Aguardando pagamento" />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {predictions.length > 0 && (
        <p className="text-[10px] text-slate-400 text-center">
          🟡 Aguardando pagamento &nbsp;|&nbsp; ✅ Pago confirmado
        </p>
      )}
    </div>
  )
}
