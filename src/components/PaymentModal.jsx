import { Copy, CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'

const PIX_KEY = '71992790879'

export default function PaymentModal({ prediction, onClose }) {
  const [copied, setCopied] = useState(false)

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).catch(() => {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = PIX_KEY
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Green header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 pt-6 pb-8 text-center relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-xl font-extrabold text-white">PALPITE REGISTRADO!</h2>
          <p className="text-green-100 text-sm mt-1">
            {prediction.name} — Brasil {prediction.scoreBrasil} × {prediction.scoreHaiti} Haiti
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="text-center">
            <p className="text-slate-600 text-sm">Para validar seu palpite, faça o Pix de</p>
            <p className="text-4xl font-extrabold text-green-600 mt-1">R$ 10,00</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1 text-center font-semibold uppercase tracking-wide">Chave Pix (telefone)</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-blue-700 text-lg tracking-widest">{PIX_KEY}</span>
              <button
                onClick={copyPix}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl
                           bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Após pagar, envie o comprovante pelo WhatsApp para o organizador. Seu palpite só é válido com o pagamento confirmado.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 transition-colors"
          >
            Ver todos os palpites
          </button>
        </div>
      </div>
    </div>
  )
}
