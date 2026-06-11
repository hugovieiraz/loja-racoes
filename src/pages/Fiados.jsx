import { useState } from 'react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Botao, Campo, Modal, Vazio, Avatar } from '../components/Ui.jsx'
import { formatarMoeda, formatarDataHora, lerMoeda, moedaParaCampo } from '../utils/formato.js'
import { debitoDoCliente } from '../utils/calculos.js'

export default function Fiados({ aoAbrirCliente }) {
  const { clientes, vendas, pagamentos, registrarPagamento } = useDados()
  const [clientePagando, setClientePagando] = useState(null)
  const [valorPagamento, setValorPagamento] = useState('')

  const devedores = clientes
    .map((c) => ({ ...c, debito: debitoDoCliente(c.id, vendas, pagamentos) }))
    .filter((c) => c.debito > 0)
    .sort((a, b) => b.debito - a.debito)

  const totalAberto = devedores.reduce((s, c) => s + c.debito, 0)

  const historicoPagamentos = [...pagamentos]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 20)

  function abrirPagamento(cliente) {
    setClientePagando(cliente)
    setValorPagamento('')
  }

  function aoConfirmarPagamento(e) {
    e.preventDefault()
    const valor = lerMoeda(valorPagamento)
    if (valor <= 0) return alert('Informe um valor válido.')
    if (valor > clientePagando.debito) {
      return alert(`O valor é maior que o débito (${formatarMoeda(clientePagando.debito)}).`)
    }
    registrarPagamento({ clienteId: clientePagando.id, valor })
    setClientePagando(null)
  }

  return (
    <div>
      <Cabecalho titulo="Fiados" />
      <div className="p-4 space-y-3">
        <Card className="bg-red-600 !text-white">
          <div className="text-sm text-red-100">Total em aberto</div>
          <div className="text-3xl font-bold text-white">{formatarMoeda(totalAberto)}</div>
          <div className="text-sm text-red-100 mt-1">{devedores.length} cliente(s) devendo</div>
        </Card>

        {devedores.length === 0 && <Vazio mensagem="Nenhum débito em aberto. 🎉" />}

        {devedores.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center gap-3" onClick={() => aoAbrirCliente(c.id)}>
              <Avatar foto={c.foto} nome={c.nome} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 truncate">{c.nome}</div>
                <div className="text-sm text-slate-500">{c.telefone || 'Sem telefone'}</div>
              </div>
              <div className="font-bold text-red-600 shrink-0">{formatarMoeda(c.debito)}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Botao variante="contorno" className="!py-2.5" onClick={() => abrirPagamento(c)}>
                Pagar parte
              </Botao>
              <Botao
                className="!py-2.5"
                onClick={() => {
                  if (confirm(`Quitar a dívida de ${c.nome} (${formatarMoeda(c.debito)})?`)) {
                    registrarPagamento({ clienteId: c.id, valor: c.debito })
                  }
                }}
              >
                Quitar dívida
              </Botao>
            </div>
          </Card>
        ))}

        {historicoPagamentos.length > 0 && (
          <>
            <h2 className="font-bold text-slate-700 pt-2">Últimos pagamentos</h2>
            {historicoPagamentos.map((p) => {
              const cliente = clientes.find((c) => c.id === p.clienteId)
              return (
                <Card key={p.id} className="!p-3 flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700 truncate">
                      {cliente?.nome || 'Cliente excluído'}
                    </div>
                    <div className="text-xs text-slate-400">{formatarDataHora(p.data)}</div>
                  </div>
                  <div className="font-bold text-emerald-600 shrink-0">
                    {formatarMoeda(p.valor)}
                  </div>
                </Card>
              )
            })}
          </>
        )}
      </div>

      <Modal
        titulo={`Pagamento de ${clientePagando?.nome || ''}`}
        aberto={!!clientePagando}
        aoFechar={() => setClientePagando(null)}
      >
        {clientePagando && (
          <form onSubmit={aoConfirmarPagamento} className="space-y-3">
            <div className="text-sm text-slate-600">
              Débito atual: <strong className="text-red-600">{formatarMoeda(clientePagando.debito)}</strong>
            </div>
            <Campo
              rotulo="Valor pago (R$)"
              inputMode="decimal"
              value={valorPagamento}
              onChange={(e) => setValorPagamento(e.target.value)}
              placeholder="0,00"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Botao type="button" variante="contorno" onClick={() => setValorPagamento(moedaParaCampo(clientePagando.debito))}>
                Quitar tudo
              </Botao>
              <Botao type="submit">Confirmar</Botao>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
