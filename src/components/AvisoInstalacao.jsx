import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

const CHAVE_DISPENSADO = 'lojaRacoes:avisoInstalarDispensado'
const DIAS_PARA_REPETIR = 7

function appJaInstalado() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function dispensadoRecentemente() {
  try {
    const quando = localStorage.getItem(CHAVE_DISPENSADO)
    if (!quando) return false
    const dias = (Date.now() - new Date(quando).getTime()) / (1000 * 60 * 60 * 24)
    return dias < DIAS_PARA_REPETIR
  } catch {
    return false
  }
}

// Convida quem abriu pelo link do navegador a instalar o app na tela inicial.
export default function AvisoInstalacao() {
  const [eventoInstalar, setEventoInstalar] = useState(null) // Android/Chrome
  const [mostrarIos, setMostrarIos] = useState(false) // iPhone/iPad
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (appJaInstalado() || dispensadoRecentemente()) return

    // Android/Chrome dispara este evento quando o app pode ser instalado
    function aoPoderInstalar(evento) {
      evento.preventDefault()
      setEventoInstalar(evento)
      setVisivel(true)
    }
    window.addEventListener('beforeinstallprompt', aoPoderInstalar)

    // iPhone/iPad não tem o evento: mostra instrução do Safari
    const ehIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    let timer
    if (ehIos) {
      timer = setTimeout(() => {
        setMostrarIos(true)
        setVisivel(true)
      }, 2500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoderInstalar)
      clearTimeout(timer)
    }
  }, [])

  function dispensar() {
    try {
      localStorage.setItem(CHAVE_DISPENSADO, new Date().toISOString())
    } catch {
      /* sem armazenamento */
    }
    setVisivel(false)
  }

  async function instalar() {
    if (!eventoInstalar) return
    eventoInstalar.prompt()
    const { outcome } = await eventoInstalar.userChoice
    if (outcome === 'accepted') setVisivel(false)
    setEventoInstalar(null)
  }

  if (!visivel) return null

  return (
    <div className="fixed bottom-20 inset-x-3 z-50 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/10 p-4 flex items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="w-12 h-12 shrink-0" />
        <div className="flex-1 min-w-0 text-sm">
          <div className="font-bold text-slate-800">Instale o app no celular</div>
          {mostrarIos ? (
            <div className="text-slate-500 flex items-center gap-1 flex-wrap">
              Toque em <Share size={14} className="inline text-sky-600" /> e depois em
              <strong>"Adicionar à Tela de Início"</strong>
            </div>
          ) : (
            <div className="text-slate-500">Abre mais rápido e funciona sem internet.</div>
          )}
        </div>
        {!mostrarIos && (
          <button
            onClick={instalar}
            className="bg-emerald-600 text-white font-bold text-sm px-3 py-2.5 rounded-xl active:bg-emerald-700 flex items-center gap-1.5 shrink-0"
          >
            <Download size={16} /> Instalar
          </button>
        )}
        <button onClick={dispensar} aria-label="Fechar" className="p-1 shrink-0">
          <X size={18} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}
