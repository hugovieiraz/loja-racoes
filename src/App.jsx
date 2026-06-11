import { useState } from 'react'
import BarraNavegacao from './components/BarraNavegacao.jsx'
import AvisoAtualizacao from './components/AvisoAtualizacao.jsx'
import TelaPin from './components/TelaPin.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Produtos from './pages/Produtos.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteDetalhe from './pages/ClienteDetalhe.jsx'
import Venda from './pages/Venda.jsx'
import Fiados from './pages/Fiados.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Login from './pages/Login.jsx'
import { useAutenticacao } from './context/AutenticacaoContext.jsx'
import { pinAtivo } from './utils/pin.js'
import { ehDono } from './utils/perfil.js'

export default function App() {
  const { sessao, carregando, nuvemAtiva } = useAutenticacao()
  const [aba, setAba] = useState(() => (ehDono() ? 'inicio' : 'venda'))
  const [clienteAbertoId, setClienteAbertoId] = useState(null)
  const [bloqueado, setBloqueado] = useState(() => pinAtivo())

  // Aguardando verificação da sessão (só com nuvem configurada)
  if (carregando) {
    return <div className="fixed inset-0 bg-emerald-700" />
  }

  // Nuvem configurada e sem login -> tela de entrada
  if (nuvemAtiva && !sessao) {
    return <Login />
  }

  // PIN de bloqueio ativado
  if (bloqueado) {
    return <TelaPin aoDesbloquear={() => setBloqueado(false)} />
  }

  function trocarAba(novaAba) {
    setClienteAbertoId(null)
    setAba(novaAba)
    window.scrollTo(0, 0)
  }

  function abrirCliente(id) {
    setClienteAbertoId(id)
    window.scrollTo(0, 0)
  }

  let conteudo
  if (clienteAbertoId) {
    conteudo = <ClienteDetalhe clienteId={clienteAbertoId} aoVoltar={() => setClienteAbertoId(null)} />
  } else if (aba === 'inicio') {
    conteudo = <Dashboard />
  } else if (aba === 'produtos') {
    conteudo = <Produtos />
  } else if (aba === 'clientes') {
    conteudo = <Clientes aoAbrirCliente={abrirCliente} />
  } else if (aba === 'venda') {
    conteudo = <Venda />
  } else if (aba === 'fiados') {
    conteudo = <Fiados aoAbrirCliente={abrirCliente} />
  } else {
    conteudo = <Relatorios />
  }

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto">
      <AvisoAtualizacao />
      {conteudo}
      <BarraNavegacao abaAtiva={aba} aoTrocar={trocarAba} />
    </div>
  )
}
