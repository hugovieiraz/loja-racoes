import { useState } from 'react'
import { useAutenticacao } from '../context/AutenticacaoContext.jsx'
import { Botao, Campo } from '../components/Ui.jsx'

// Tela de entrada (só aparece quando a nuvem/Supabase está configurada).
// Os dois irmãos usam a MESMA conta para ver os mesmos dados.
export default function Login() {
  const { entrar, criarConta } = useAutenticacao()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'criar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function aoEnviar(e) {
    e.preventDefault()
    setErro('')
    setOcupado(true)
    try {
      if (modo === 'entrar') {
        await entrar(email.trim(), senha)
      } else {
        await criarConta(email.trim(), senha)
      }
    } catch (excecao) {
      const mensagens = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'User already registered': 'Este e-mail já tem conta. Use "Entrar".',
      }
      setErro(mensagens[excecao.message] || `Não foi possível ${modo === 'entrar' ? 'entrar' : 'criar a conta'}. Verifique a internet e tente de novo.`)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-700 flex flex-col items-center justify-center p-6 gap-6">
      <div className="flex flex-col items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="w-28 h-28 drop-shadow-lg" />
        <div className="text-white font-bold text-xl tracking-wide">LAMARTINE RAÇÕES</div>
      </div>
      <form onSubmit={aoEnviar} className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-3 shadow-lg">
        <h1 className="font-bold text-lg text-slate-800">
          {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </h1>
        <Campo rotulo="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Campo rotulo="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
        {erro && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{erro}</div>}
        <Botao type="submit" disabled={ocupado}>
          {ocupado ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </Botao>
        <button
          type="button"
          onClick={() => { setModo(modo === 'entrar' ? 'criar' : 'entrar'); setErro('') }}
          className="w-full text-sm text-emerald-700 font-semibold py-1"
        >
          {modo === 'entrar' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </form>
      <p className="text-emerald-100 text-xs text-center max-w-sm">
        Use a mesma conta nos dois celulares para ver os mesmos dados.
      </p>
    </div>
  )
}
