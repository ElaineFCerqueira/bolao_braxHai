import { useCountdown } from '../hooks/useCountdown'
import { Clock, AlertTriangle } from 'lucide-react'

const MATCH_START = import.meta.env.VITE_MATCH_START || '2025-09-10T00:00:00Z'

export default function Countdown() {
  const { expired, days, hours, minutes, seconds } = useCountdown(MATCH_START)

  if (expired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="font-semibold text-red-700 text-sm">Palpites encerrados!</p>
          <p className="text-red-500 text-xs">O jogo já começou. Boa sorte a todos! ⚽</p>
        </div>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  const units = [
    { label: 'dias',     value: days },
    { label: 'horas',    value: hours },
    { label: 'minutos',  value: minutes },
    { label: 'segundos', value: seconds },
  ].filter((u, i) => i > 0 || u.value > 0) // hide days if 0

  return (
    <div className="bg-brasil-blue/5 border border-brasil-blue/20 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-brasil-blue" />
        <span className="text-xs font-semibold text-brasil-blue uppercase tracking-wider">
          Palpites encerram em
        </span>
      </div>
      <div className="flex gap-2 justify-center">
        {units.map(({ label, value }) => (
          <div key={label} className="flex-1 text-center">
            <div className="bg-brasil-blue text-brasil-yellow font-display text-3xl leading-none rounded-xl py-3 tabular-nums">
              {pad(value)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
