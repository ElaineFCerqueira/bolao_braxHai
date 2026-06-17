import { Trophy, DollarSign, Clock, Calendar } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'

const MATCH_START = import.meta.env.VITE_MATCH_START || '2026-06-19T22:30:00Z'

export default function Header() {
  const { expired, days, hours, minutes, seconds } = useCountdown(MATCH_START)
  const pad = (n) => String(n).padStart(2, '0')

  return (
    <header className="bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 text-white shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 text-center">

        <div className="inline-flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 text-yellow-300">
          <Trophy className="w-4 h-4" />
          <span>BOLÃO ONLINE BRASIL × HAITI</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
          Brasil <span className="text-yellow-300">×</span> Haiti
        </h1>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold bg-white/15 w-fit mx-auto px-3 py-1 rounded-full">
          <Calendar className="w-4 h-4 text-yellow-300" />
          <span>Data do Jogo: <strong className="text-yellow-300">19/06/2026 às 19:30</strong></span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

          {/* Valor */}
          <div className="bg-white text-slate-900 p-4 rounded-xl shadow-lg border border-yellow-400 flex items-center gap-3">
            <span className="p-2 bg-green-100 text-green-700 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </span>
            <div className="text-left">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Valor de Entrada</p>
              <p className="text-lg font-black text-green-600">
                R$ 10,00 <span className="text-xs font-normal text-slate-500">por palpite</span>
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 flex items-center gap-3">
            <span className={`p-2 rounded-lg ${expired ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <Clock className="w-6 h-6" />
            </span>
            <div className="text-left flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {expired ? 'Cadastro Encerrado' : 'Palpites se Encerram em'}
              </p>
              {expired ? (
                <p className="text-sm font-bold text-red-400">O jogo começou!</p>
              ) : (
                <p className="text-base font-black font-mono">
                  {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}
