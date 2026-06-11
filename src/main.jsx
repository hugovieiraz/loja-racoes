import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { DadosProvider } from './context/DadosContext.jsx'
import { AutenticacaoProvider } from './context/AutenticacaoContext.jsx'

// Service worker: app funciona offline e atualiza sozinho
registerSW({ immediate: true })

// Pede ao navegador para NÃO apagar os dados do app em limpezas automáticas de espaço.
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}

// Aplica o tema escuro salvo antes de renderizar (evita "piscada")
if (localStorage.getItem('lojaRacoes:tema') === 'escuro') {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AutenticacaoProvider>
      <DadosProvider>
        <App />
      </DadosProvider>
    </AutenticacaoProvider>
  </StrictMode>,
)
