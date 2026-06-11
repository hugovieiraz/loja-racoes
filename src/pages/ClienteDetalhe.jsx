import { useState } from 'react'
import { ArrowLeft, Camera, Pencil, Trash2 } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Card, Botao, Campo, CampoArea, Modal, Vazio, Avatar, Selo } from '../components/Ui.jsx'
import { formatarMoeda, formatarDataHora, rotuloPagamento, lerMoeda } from '../utils/formato.js'
import { debitoDoCliente } from '../utils/calculos.js'
import { comprimirImagem } from '../utils/imagem.js'
import { efeitoDinheiro } from '../utils/efeitos.js'
import { linkWhatsApp, mensagemCobranca } from '../utils/whatsapp.js'
import { MessageCircle } from 'lucide-react'

export default function ClienteDetalhe({ clienteId, aoVoltar }) {
  const { clientes, vendas, pagamentos, salvarCliente, excluirCliente, registrarPagamento } = useDados()
  const cliente = clientes.find((c) => c.id === clienteId)
  const [modalEdicao, setModalEdicao] = useState(false)
  const [modalPagamento, setModalPagamento] = useState(false)
  const [form, setForm] = useState(null)
  const [valorPagamento, setValorPagamento] = useState('')

  if (!cliente) {
    return (
      <div className="p-4">
        <Vazio mensagem="Cliente não encontrado." />
        <Botao variante="secundario" onClick={aoVoltar}>Voltar</Botao>
      </div>
    )
  }

  const debito = debitoDoCliente(cliente.id, vendas, pagamentos)
  const comprasCliente = vendas
    .filter((v) => v.clienteId === cliente.id)
    .sort((a, b) => b.data.localeCompare(a.data))
  const comprasAVista = comprasCliente.filter((v) => v.formaPagamento !== 'fiado')
  const comprasFiadas = comprasCliente.filter((v) => v.formaPagamento === 'fiado')
  const pagamentosCliente = pagamentos
    .filter((p) => p.clienteId === cliente.id)
    .sort((a, b) => b.data.localeCompare(a.data))

  function abrirEdicao() {
    setForm({
      foto: cliente.foto,
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      observacoes: cliente.observacoes,
    })
    setModalEdicao(true)
  }

  function mudar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  }

  async function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    try {
      const foto = await comprimirImagem(arquivo)
      setForm((f) => ({ ...f, foto }))
    } catch {
      alert('Não foi possível carregar a foto.')
    }
  }

  function aoSalvarEdicao(e) {
    e.preventDefault()
    if (!form.nome.trim()) return alert('Informe o nome do cliente.')
    salvarCliente({ id: cliente.id, ...form, nome: form.nome.trim() })
    setModalEdicao(false)
  }

  function aoExcluir() {
    if (debito > 0 && !confirm(`${cliente.nome} ainda deve ${formatarMoeda(debito)}. Excluir mesmo assim?`)) return
    if (confirm(`Excluir o cliente "${cliente.nome}"? O histórico de vendas será mantido.`)) {
      excluirCliente(cliente.id)
      aoVoltar()
    }
  }

  function aoRegistrarPagamento(e) {
    e.preventDefault()
    const valor = lerMoeda(valorPagamento)
    if (valor <= 0) return alert('Informe um valor válido.')
    if (valor > debito) return alert(`O valor é maior que o débito (${formatarMoeda(debito)}).`)
    registrarPagamento({ clienteId: cliente.id, valor })
    efeitoDinheiro()
    setValorPagamento('')
    setModalPagamento(false)
  }

  function ListaCompras({ lista, vazia }) {
    if (lista.length === 0) return <Vazio mensagem={vazia} />
    return lista.map((v) => (
      <Card key={v.id} className="!p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="text-sm text-slate-500">{formatarDataHora(v.data)}</div>
          <Selo cor={v.formaPagamento === 'fiado' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
            {rotuloPagamento(v.formaPagamento)}
          </Selo>
        </div>
        <div className="mt-1 text-sm text-slate-700">
          {v.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}
        </div>
        <div className="mt-1 font-bold text-slate-800">{formatarMoeda(v.total)}</div>
      </Card>
    ))
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-2 py-3 flex items-center gap-1 shadow-md">
        <button onClick={aoVoltar} className="p-2 rounded-full active:bg-emerald-700" aria-label="Voltar">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{cliente.nome}</h1>
        <button onClick={abrirEdicao} className="p-2 rounded-full active:bg-emerald-700" aria-label="Editar">
          <Pencil size={20} />
        </button>
        <button onClick={aoExcluir} className="p-2 rounded-full active:bg-emerald-700" aria-label="Excluir">
          <Trash2 size={20} />
        </button>
      </header>

      <div className="p-4 space-y-3">
        <Card className="flex items-center gap-4">
          <Avatar foto={cliente.foto} nome={cliente.nome} tamanho="w-16 h-16" />
          <div className="min-w-0 text-sm text-slate-600 space-y-0.5">
            {cliente.telefone && <div>📞 {cliente.telefone}</div>}
            {cliente.cpf && <div>CPF: {cliente.cpf}</div>}
            {cliente.endereco && <div>{cliente.endereco}</div>}
            {cliente.observacoes && <div className="text-slate-400">{cliente.observacoes}</div>}
          </div>
        </Card>

        <Card className={debito > 0 ? 'border-2 border-red-200' : ''}>
          <div className="text-sm text-slate-500">Débito atual</div>
          <div className={`text-2xl font-bold ${debito > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatarMoeda(debito)}
          </div>
          {debito > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const link = linkWhatsApp(cliente.telefone, mensagemCobranca(cliente.nome, formatarMoeda(debito)))
                  if (!link) return alert('Cliente sem telefone cadastrado.')
                  salvarCliente({ id: cliente.id, ultimaCobranca: new Date().toISOString() })
                  window.open(link, '_blank')
                }}
                className="py-3 rounded-xl font-semibold text-sm bg-[#25D366] text-white active:opacity-80 flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={17} /> Cobrar
              </button>
              <Botao className="!py-3 !text-sm" onClick={() => setModalPagamento(true)}>
                Registrar pagamento
              </Botao>
            </div>
          )}
        </Card>

        <h2 className="font-bold text-slate-700 pt-2">Compras fiadas ({comprasFiadas.length})</h2>
        <ListaCompras lista={comprasFiadas} vazia="Nenhuma compra fiada." />

        <h2 className="font-bold text-slate-700 pt-2">Compras à vista ({comprasAVista.length})</h2>
        <ListaCompras lista={comprasAVista} vazia="Nenhuma compra à vista." />

        <h2 className="font-bold text-slate-700 pt-2">Pagamentos ({pagamentosCliente.length})</h2>
        {pagamentosCliente.length === 0 && <Vazio mensagem="Nenhum pagamento registrado." />}
        {pagamentosCliente.map((p) => (
          <Card key={p.id} className="!p-3 flex justify-between items-center">
            <div className="text-sm text-slate-500">{formatarDataHora(p.data)}</div>
            <div className="font-bold text-emerald-600">{formatarMoeda(p.valor)}</div>
          </Card>
        ))}
      </div>

      <Modal titulo="Registrar pagamento" aberto={modalPagamento} aoFechar={() => setModalPagamento(false)}>
        <form onSubmit={aoRegistrarPagamento} className="space-y-3">
          <div className="text-sm text-slate-600">
            Débito atual: <strong className="text-red-600">{formatarMoeda(debito)}</strong>
          </div>
          <Campo rotulo="Valor pago (R$)" inputMode="decimal" value={valorPagamento} onChange={(e) => setValorPagamento(e.target.value)} placeholder="0,00" autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Botao type="button" variante="contorno" onClick={() => setValorPagamento((debito / 100).toFixed(2).replace('.', ','))}>
              Quitar tudo
            </Botao>
            <Botao type="submit">Confirmar</Botao>
          </div>
        </form>
      </Modal>

      <Modal titulo="Editar cliente" aberto={modalEdicao} aoFechar={() => setModalEdicao(false)}>
        {form && (
          <form onSubmit={aoSalvarEdicao} className="space-y-3">
            <div className="flex flex-col items-center gap-2">
              <Avatar foto={form.foto} nome={form.nome || '?'} tamanho="w-24 h-24" />
              <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm cursor-pointer">
                <Camera size={18} />
                {form.foto ? 'Trocar foto' : 'Adicionar foto'}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={aoEscolherFoto} />
              </label>
            </div>
            <Campo rotulo="Nome completo *" value={form.nome} onChange={mudar('nome')} />
            <Campo rotulo="CPF" inputMode="numeric" value={form.cpf} onChange={mudar('cpf')} />
            <Campo rotulo="Telefone" inputMode="tel" value={form.telefone} onChange={mudar('telefone')} />
            <Campo rotulo="Endereço" value={form.endereco} onChange={mudar('endereco')} />
            <CampoArea rotulo="Observações" value={form.observacoes} onChange={mudar('observacoes')} />
            <Botao type="submit">Salvar alterações</Botao>
          </form>
        )}
      </Modal>
    </div>
  )
}
