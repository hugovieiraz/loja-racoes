import { useState } from 'react'
import { Delete } from 'lucide-react'
import { conferirPin } from '../utils/pin.js'
import { vibrarErro, vibrar } from '../utils/efeitos.js'

// Tela de bloqueio: pede o PIN de 4 dígitos ao abrir o app.
export default function TelaPin({ aoDesbloquear }) {
  const [digitado, setDigitado] = useState('')
  const [erro, setErro] = useState(false)

  async function adicionar(numero) {
    if (digitado.length >= 4) return
    vibrar(15)
    const novo = digitado + numero
    setDigitado(novo)
    if (novo.length === 4) {
      if (await conferirPin(novo)) {
        aoDesbloquear()
      } else {
        vibrarErro()
        setErro(true)
        setTimeout(() => {
          setDigitado('')
          setErro(false)
        }, 450)
      }
    }
  }

  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'apagar']

  return (
    <div className="fixed inset-0 z-50 bg-emerald-700 flex flex-col items-center justify-center gap-8 p-6">
      <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="w-24 h-24 drop-shadow-lg" />
      <div>
        <div className="text-white font-bold text-center text-lg mb-4">Digite o PIN</div>
        <div className={`flex gap-4 justify-center ${erro ? 'animar-tremer' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-white ${
                digitado.length > i ? 'bg-white' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {teclas.map((tecla, i) =>
          tecla === '' ? (
            <div key={i} />
          ) : tecla === 'apagar' ? (
            <button
              key={i}
              onClick={() => setDigitado((d) => d.slice(0, -1))}
              className="h-16 rounded-2xl text-white flex items-center justify-center active:bg-white/10"
              aria-label="Apagar"
            >
              <Delete size={26} />
            </button>
          ) : (
            <button
              key={i}
              onClick={() => adicionar(tecla)}
              className="h-16 rounded-2xl bg-white/10 text-white text-2xl font-bold active:bg-white/25"
            >
              {tecla}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
