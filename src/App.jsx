import { useState } from 'react'
import BarraNavegacao from './components/BarraNavegacao.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Produtos from './pages/Produtos.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteDetalhe from './pages/ClienteDetalhe.jsx'
import Venda from './pages/Venda.jsx'
import Fiados from './pages/Fiados.jsx'
import Relatorios from './pages/Relatorios.jsx'

export default function App() {
  const [aba, setAba] = useState('inicio')
  const [clienteAbertoId, setClienteAbertoId] = useState(null)

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
      {conteudo}
      <BarraNavegacao abaAtiva={aba} aoTrocar={trocarAba} />
    </div>
  )
}
