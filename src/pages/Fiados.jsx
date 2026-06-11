import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Botao, Campo, Modal, Vazio, Avatar, Selo } from '../components/Ui.jsx'
import { formatarMoeda, formatarDataHora, lerMoeda, moedaParaCampo, chaveMes } from '../utils/formato.js'
import { debitoDoCliente } from '../utils/calculos.js'
import { efeitoDinheiro } from '../utils/efeitos.js'
import { linkWhatsApp, mensagemCobranca } from '../utils/whatsapp.js'

export default function Fiados({ aoAbrirCliente }) {
  const { clientes, vendas, pagamentos, registrarPagamento, salvarCliente } = useDados()
  const [clientePagando, setClientePagando] = useState(null)
  const [valorPagamento, setValorPagamento] = useState('')

  const mesAtual = chaveMes()
  const devedores = clientes
    .map((c) => ({ ...c, debito: debitoDoCliente(c.id, vendas, pagamentos) }))
    .filter((c) => c.debito > 0)
    .sort((a, b) => b.debito - a.debito)

  const totalAberto = devedores.reduce((s, c) => s + c.debito, 0)
  const naoCobrados = devedores.filter(
    (c) => !c.ultimaCobranca || chaveMes(c.ultimaCobranca) !== mesAtual,
  )

  const historicoPagamentos = [...pagamentos]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 20)

  function cobrarPorWhatsApp(cliente) {
    const link = linkWhatsApp(cliente.telefone, mensagemCobranca(cliente.nome, formatarMoeda(cliente.debito)))
    if (!link) {
      alert('Este cliente não tem telefone cadastrado. Edite o cadastro dele primeiro.')
      return
    }
    // Marca como cobrado neste mês
    salvarCliente({ id: cliente.id, ultimaCobranca: new Date().toISOString() })
    window.open(link, '_blank')
  }

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
    efeitoDinheiro()
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

        {naoCobrados.length > 0 && (
          <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 text-sm">
            <div className="font-bold text-amber-900">
              Cobrança do mês: falta cobrar {naoCobrados.length} cliente(s)
            </div>
            <div className="text-amber-700 mt-0.5">
              Toque no botão verde do WhatsApp para enviar a mensagem de cobrança pronta.
            </div>
          </div>
        )}

        {devedores.length === 0 && <Vazio mensagem="Nenhum débito em aberto. 🎉" />}

        {devedores.map((c) => {
          const cobradoEsteMes = c.ultimaCobranca && chaveMes(c.ultimaCobranca) === mesAtual
          return (
            <Card key={c.id}>
              <div className="flex items-center gap-3" onClick={() => aoAbrirCliente(c.id)}>
                <Avatar foto={c.foto} nome={c.nome} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 truncate">{c.nome}</div>
                  <div className="mt-0.5">
                    {cobradoEsteMes ? (
                      <Selo cor="bg-emerald-100 text-emerald-700">Cobrado este mês</Selo>
                    ) : (
                      <Selo cor="bg-amber-100 text-amber-700">Falta cobrar</Selo>
                    )}
                  </div>
                </div>
                <div className="font-bold text-red-600 shrink-0">{formatarMoeda(c.debito)}</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => cobrarPorWhatsApp(c)}
                  className="py-2.5 rounded-xl font-semibold text-sm bg-[#25D366] text-white active:opacity-80 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={17} /> Cobrar
                </button>
                <Botao variante="contorno" className="!py-2.5 !text-sm" onClick={() => abrirPagamento(c)}>
                  Pagar parte
                </Botao>
                <Botao
                  className="!py-2.5 !text-sm"
                  onClick={() => {
                    if (confirm(`Quitar a dívida de ${c.nome} (${formatarMoeda(c.debito)})?`)) {
                      registrarPagamento({ clienteId: c.id, valor: c.debito })
                      efeitoDinheiro()
                    }
                  }}
                >
                  Quitar
                </Botao>
              </div>
            </Card>
          )
        })}

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
