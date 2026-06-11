import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Busca, Botao, Campo, CampoArea, Modal, Vazio, Selo } from '../components/Ui.jsx'
import { formatarMoeda, lerMoeda, moedaParaCampo } from '../utils/formato.js'
import { ehDono } from '../utils/perfil.js'

const FORM_VAZIO = {
  nome: '',
  marca: '',
  categoria: '',
  peso: '',
  precoCompra: '',
  precoVenda: '',
  estoque: '',
  estoqueMinimo: '',
  observacoes: '',
}

export default function Produtos() {
  const { produtos, salvarProduto, excluirProduto } = useDados()
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState(null)

  const filtrados = produtos.filter((p) =>
    `${p.nome} ${p.marca} ${p.categoria}`.toLowerCase().includes(busca.toLowerCase()),
  )

  function abrirNovo() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setModalAberto(true)
  }

  function abrirEdicao(produto) {
    setEditandoId(produto.id)
    setForm({
      nome: produto.nome,
      marca: produto.marca,
      categoria: produto.categoria,
      peso: produto.peso,
      precoCompra: moedaParaCampo(produto.precoCompra),
      precoVenda: moedaParaCampo(produto.precoVenda),
      estoque: String(produto.estoque),
      estoqueMinimo: String(produto.estoqueMinimo),
      observacoes: produto.observacoes,
    })
    setModalAberto(true)
  }

  function aoSalvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) return alert('Informe o nome do produto.')
    const dadosProduto = {
      id: editandoId || undefined,
      nome: form.nome.trim(),
      marca: form.marca.trim(),
      categoria: form.categoria.trim(),
      peso: form.peso.trim(),
      precoCompra: ehDono() ? lerMoeda(form.precoCompra) : 0,
      precoVenda: lerMoeda(form.precoVenda),
      estoque: parseInt(form.estoque, 10) || 0,
      estoqueMinimo: parseInt(form.estoqueMinimo, 10) || 0,
      observacoes: form.observacoes.trim(),
    }
    // Funcionário editando: mantém o preço de compra que o dono cadastrou
    if (!ehDono() && editandoId) delete dadosProduto.precoCompra
    salvarProduto(dadosProduto)
    setModalAberto(false)
  }

  function aoExcluir(produto) {
    if (confirm(`Excluir o produto "${produto.nome}"?`)) excluirProduto(produto.id)
  }

  const lucroPrevisto = lerMoeda(form.precoVenda) - lerMoeda(form.precoCompra)

  function mudar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  }

  return (
    <div>
      <Cabecalho titulo="Produtos" />
      <div className="p-4 space-y-3">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Pesquisar produto..." />
        <Botao onClick={abrirNovo}>
          <span className="flex items-center justify-center gap-2">
            <Plus size={20} /> Novo produto
          </span>
        </Botao>

        {filtrados.length === 0 && (
          <Vazio mensagem={produtos.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado.'} />
        )}

        {filtrados.map((p) => {
          const lucro = p.precoVenda - p.precoCompra
          const estoqueBaixo = p.estoque <= p.estoqueMinimo
          return (
            <Card key={p.id}>
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-slate-800">{p.nome}</div>
                  <div className="text-sm text-slate-500">
                    {[p.marca, p.categoria, p.peso].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => abrirEdicao(p)} className="p-2 rounded-lg active:bg-slate-100" aria-label="Editar">
                    <Pencil size={18} className="text-slate-500" />
                  </button>
                  <button onClick={() => aoExcluir(p)} className="p-2 rounded-lg active:bg-red-50" aria-label="Excluir">
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-slate-400 text-xs">Venda</div>
                  <div className="font-semibold">{formatarMoeda(p.precoVenda)}</div>
                </div>
                {ehDono() && (
                  <div>
                    <div className="text-slate-400 text-xs">Lucro/saco</div>
                    <div className={`font-semibold ${lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatarMoeda(lucro)}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-slate-400 text-xs">Estoque</div>
                  <div className={`font-semibold ${estoqueBaixo ? 'text-red-600' : ''}`}>
                    {p.estoque}
                    {estoqueBaixo && <AlertTriangle size={14} className="inline ml-1 mb-0.5" />}
                  </div>
                </div>
              </div>
              {estoqueBaixo && (
                <div className="mt-2">
                  <Selo cor="bg-red-100 text-red-700">Estoque baixo</Selo>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Modal titulo={editandoId ? 'Editar produto' : 'Novo produto'} aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={aoSalvar} className="space-y-3">
          <Campo rotulo="Nome do produto *" value={form.nome} onChange={mudar('nome')} placeholder="Ex.: Ração Premium Cães" />
          <Campo rotulo="Marca" value={form.marca} onChange={mudar('marca')} />
          <Campo rotulo="Tipo / categoria" value={form.categoria} onChange={mudar('categoria')} placeholder="Ex.: Cachorro, Gato, Aves" />
          <Campo rotulo="Peso do saco" value={form.peso} onChange={mudar('peso')} placeholder="Ex.: 15 kg" />
          <div className="grid grid-cols-2 gap-3">
            {ehDono() && (
              <Campo rotulo="Preço de compra (R$)" inputMode="decimal" value={form.precoCompra} onChange={mudar('precoCompra')} placeholder="0,00" />
            )}
            <Campo rotulo="Preço de venda (R$)" inputMode="decimal" value={form.precoVenda} onChange={mudar('precoVenda')} placeholder="0,00" />
          </div>
          {ehDono() && (
            <div className={`text-sm font-semibold ${lucroPrevisto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Lucro por saco: {formatarMoeda(lucroPrevisto)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Estoque atual" type="number" min="0" value={form.estoque} onChange={mudar('estoque')} placeholder="0" />
            <Campo rotulo="Estoque mínimo" type="number" min="0" value={form.estoqueMinimo} onChange={mudar('estoqueMinimo')} placeholder="0" />
          </div>
          <CampoArea rotulo="Observações" value={form.observacoes} onChange={mudar('observacoes')} />
          <Botao type="submit">Salvar produto</Botao>
        </form>
      </Modal>
    </div>
  )
}
