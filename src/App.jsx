import { useState } from 'react'
import { usePredictions } from './hooks/usePredictions'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import PaymentModal from './components/PaymentModal'
import PredictionsList from './components/PredictionsList'
import { CheckCircle2, HelpCircle } from 'lucide-react'

export default function App() {
  const { predictions, loading } = usePredictions()
  const [successData, setSuccessData] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSuccess = (data) => {
    setSuccessData(data)
    setSuccessMsg(`Palpite Brasil ${data.scoreBrasil} × ${data.scoreHaiti} Haiti registrado!`)
    setTimeout(() => setSuccessMsg(''), 10000)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Header />

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT — Form */}
        <section className="md:col-span-5 space-y-5">

          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 text-xs">Vaga Reservada!</p>
                  <p className="text-green-700 text-xs mt-0.5">{successMsg}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-2.5 h-5 bg-green-500 rounded-full inline-block"></span>
              Enviar Meu Palpite
            </h2>
            <PredictionForm
              predictions={predictions}
              onSuccess={handleSuccess}
            />
          </div>

          <div className="bg-blue-50 text-blue-950 p-4 rounded-2xl border border-blue-100 space-y-1.5">
            <h4 className="font-bold text-xs flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Como funciona?
            </h4>
            <ul className="text-xs space-y-1 text-blue-900">
              <li>• Escolha um placar e confirme seu palpite</li>
              <li>• Faça o Pix de <strong>R$ 10,00</strong> para a chave indicada</li>
              <li>• Envie o comprovante para o organizador</li>
              <li>• Cada placar aceita no máximo <strong>2 pessoas</strong></li>
              <li>• Palpites encerram ao início do jogo</li>
            </ul>
          </div>
        </section>

        {/* RIGHT — Dashboard */}
        <section className="md:col-span-7">
          <PredictionsList predictions={predictions} loading={loading} />
        </section>

      </main>

      {successData && (
        <PaymentModal
          prediction={successData}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  )
}
