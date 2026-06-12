import { useState } from 'react'
import { Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Busca, Botao, Vazio, Avatar } from '../components/Ui.jsx'
import { formatarMoeda, FORMAS_PAGAMENTO } from '../utils/formato.js'
import { efeitoDinheiro } from '../utils/efeitos.js'
import { ehDono } from '../utils/perfil.js'
import HistoricoVendas from './HistoricoVendas.jsx'

export default function Venda() {
  const [subTela, setSubTela] = useState('nova') // 'nova' | 'historico'

  return (
    <div>
      <Cabecalho titulo="Venda" />
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 bg-slate-200 rounded-xl p-1">
          {[
            { id: 'nova', rotulo: 'Nova venda' },
            { id: 'historico', rotulo: 'Histórico' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTela(t.id)}
              className={`py-2 rounded-lg font-semibold text-sm ${
                subTela === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </div>
      {subTela === 'nova' ? <NovaVenda /> : <HistoricoVendas />}
    </div>
  )
}

function NovaVenda() {
  const { produtos, clientes, registrarVenda } = useDados()
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteId, setClienteId] = useState(null)
  const [buscaProduto, setBuscaProduto] = useState('')
  const [carrinho, setCarrinho] = useState({}) // { produtoId: quantidade }
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [vendaFeita, setVendaFeita] = useState(null)
  const mostrarLucro = ehDono()

  const cliente = clientes.find((c) => c.id === clienteId)

  const clientesFiltrados = clientes
    .filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const produtosFiltrados = produtos.filter((p) =>
    `${p.nome} ${p.marca}`.toLowerCase().includes(buscaProduto.toLowerCase()),
  )

  const itens = Object.entries(carrinho)
    .map(([produtoId, quantidade]) => {
      const p = produtos.find((x) => x.id === produtoId)
      if (!p) return null
      return {
        produtoId,
        nome: p.nome,
        quantidade,
        precoVenda: p.precoVenda,
        precoCompra: p.precoCompra,
      }
    })
    .filter(Boolean)

  const total = itens.reduce((s, i) => s + i.precoVenda * i.quantidade, 0)
  const lucro = itens.reduce((s, i) => s + (i.precoVenda - i.precoCompra) * i.quantidade, 0)

  function alterarQuantidade(produtoId, delta) {
    setCarrinho((c) => {
      const atual = (c[produtoId] || 0) + delta
      if (atual <= 0) {
        const { [produtoId]: _removido, ...resto } = c
        return resto
      }
      return { ...c, [produtoId]: atual }
    })
  }

  function aoConfirmar() {
    if (itens.length === 0) return alert('Adicione pelo menos um produto.')
    if (formaPagamento === 'fiado' && !cliente) {
      return alert('Venda fiada precisa de um cliente. Selecione o cliente.')
    }
    registrarVenda({
      clienteId: cliente?.id || null,
      clienteNome: cliente?.nome || 'Venda avulsa',
      itens,
      formaPagamento,
    })
    efeitoDinheiro()
    setVendaFeita(formatarMoeda(total))
    setTimeout(() => setVendaFeita(null), 2600)
    setCarrinho({})
    setClienteId(null)
    setBuscaCliente('')
    setBuscaProduto('')
    setFormaPagamento('dinheiro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Aviso de venda registrada */}
      {vendaFeita && (
        <div className="fixed bottom-24 inset-x-4 z-40 max-w-md mx-auto">
          <div className="bg-emerald-600 text-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <CheckCircle2 size={24} className="shrink-0" />
            <div className="font-bold">Venda de {vendaFeita} registrada!</div>
          </div>
        </div>
      )}

      {/* 1. Cliente */}
      <section className="space-y-2">
        <h2 className="font-bold text-slate-700">1. Cliente</h2>
        {cliente ? (
          <Card className="flex items-center gap-3">
            <Avatar foto={cliente.foto} nome={cliente.nome} />
            <div className="flex-1 font-semibold text-slate-800 truncate">{cliente.nome}</div>
            <button onClick={() => setClienteId(null)} className="p-2 rounded-lg active:bg-red-50" aria-label="Remover cliente">
              <Trash2 size={18} className="text-red-500" />
            </button>
          </Card>
        ) : (
          <>
            <Busca valor={buscaCliente} aoMudar={setBuscaCliente} placeholder="Pesquisar cliente (opcional p/ à vista)..." />
            {buscaCliente && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientesFiltrados.length === 0 && <Vazio mensagem="Nenhum cliente encontrado." />}
                {clientesFiltrados.map((c) => (
                  <Card key={c.id} className="!p-3 flex items-center gap-3" onClick={() => { setClienteId(c.id); setBuscaCliente('') }}>
                    <Avatar foto={c.foto} nome={c.nome} tamanho="w-9 h-9" />
                    <span className="font-medium text-slate-700 truncate">{c.nome}</span>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 2. Produtos */}
      <section className="space-y-2">
        <h2 className="font-bold text-slate-700">2. Produtos</h2>
        <Busca valor={buscaProduto} aoMudar={setBuscaProduto} placeholder="Pesquisar produto..." />
        {produtos.length === 0 && <Vazio mensagem="Cadastre produtos na aba Produtos." />}
        <div className="space-y-2">
          {produtosFiltrados.map((p) => {
            const qtd = carrinho[p.id] || 0
            return (
              <Card key={p.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 truncate">{p.nome}</div>
                    <div className="text-sm text-slate-500">
                      {formatarMoeda(p.precoVenda)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qtd > 0 && (
                      <>
                        <button onClick={() => alterarQuantidade(p.id, -1)} className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center active:bg-slate-300" aria-label="Diminuir">
                          <Minus size={18} />
                        </button>
                        <span className="w-6 text-center font-bold text-lg">{qtd}</span>
                      </>
                    )}
                    <button
                      onClick={() => alterarQuantidade(p.id, 1)}
                      className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center active:bg-emerald-700 disabled:bg-slate-300"
                      aria-label="Adicionar"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 3. Pagamento e resumo */}
      <section className="space-y-2">
        <h2 className="font-bold text-slate-700">3. Pagamento</h2>
        <div className="grid grid-cols-4 gap-2">
          {FORMAS_PAGAMENTO.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFormaPagamento(f.valor)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 ${
                formaPagamento === f.valor
                  ? f.valor === 'fiado'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        {formaPagamento === 'fiado' && (
          <div className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
            Venda fiada: o valor será somado ao débito do cliente.
          </div>
        )}
      </section>

      <Card className="space-y-1">
        {itens.map((i) => (
          <div key={i.produtoId} className="flex justify-between text-sm text-slate-600">
            <span>{i.quantidade}x {i.nome}</span>
            <span>{formatarMoeda(i.precoVenda * i.quantidade)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-800">Total</span>
          <span className="text-2xl font-bold text-slate-800">{formatarMoeda(total)}</span>
        </div>
        {mostrarLucro && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Lucro estimado</span>
            <span className="font-semibold text-emerald-600">{formatarMoeda(lucro)}</span>
          </div>
        )}
      </Card>

      <Botao onClick={aoConfirmar} disabled={itens.length === 0}>
        Confirmar venda · {formatarMoeda(total)}
      </Botao>
      {formaPagamento === 'fiado' && !cliente && itens.length > 0 && (
        <div className="text-center text-sm text-red-600">Selecione o cliente para venda fiada.</div>
      )}
    </div>
  )
}
