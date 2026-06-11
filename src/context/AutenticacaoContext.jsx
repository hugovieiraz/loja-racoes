import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../config/supabase.js'

// Controla o login (Supabase). Se o Supabase não estiver configurado,
// o app funciona em modo local, sem login.
const AutenticacaoContext = createContext(null)

export function AutenticacaoProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(supabaseConfigurado)

  useEffect(() => {
    if (!supabaseConfigurado) return
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data: ouvinte } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })
    return () => ouvinte.subscription.unsubscribe()
  }, [])

  async function entrar(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
  }

  async function criarConta(email, senha) {
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) throw error
  }

  async function sair() {
    await supabase.auth.signOut()
  }

  return (
    <AutenticacaoContext.Provider value={{ sessao, carregando, entrar, criarConta, sair, nuvemAtiva: supabaseConfigurado }}>
      {children}
    </AutenticacaoContext.Provider>
  )
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext)
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider')
  return contexto
}
