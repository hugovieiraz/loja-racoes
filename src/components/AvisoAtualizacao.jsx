import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

// Mostra um aviso quando há uma versão nova do app publicada.
export default function AvisoAtualizacao() {
  const {
    needRefresh: [precisaAtualizar, setPrecisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  if (!precisaAtualizar) return null

  return (
    <div className="fixed top-3 inset-x-3 z-[60] max-w-lg mx-auto">
      <div className="bg-emerald-700 text-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
        <RefreshCw size={22} className="shrink-0" />
        <div className="flex-1 text-sm">
          <div className="font-bold">Atualização disponível!</div>
          <div className="text-emerald-100">Tem uma versão nova do app.</div>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-white text-emerald-700 font-bold text-sm px-3 py-2 rounded-xl active:bg-emerald-50"
        >
          Atualizar
        </button>
        <button onClick={() => setPrecisaAtualizar(false)} aria-label="Depois" className="p-1">
          <X size={18} className="text-emerald-200" />
        </button>
      </div>
    </div>
  )
}
