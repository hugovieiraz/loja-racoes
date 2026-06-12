import { useState } from 'react'
import { Plus, Camera, ChevronRight } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Busca, Botao, Campo, CampoArea, Modal, Vazio, Avatar } from '../components/Ui.jsx'
import { formatarMoeda } from '../utils/formato.js'
import { debitoDoCliente } from '../utils/calculos.js'
import { comprimirImagem } from '../utils/imagem.js'

const FORM_VAZIO = {
  foto: '',
  nome: '',
  cpf: '',
  telefone: '',
  endereco: '',
  observacoes: '',
}

export default function Clientes({ aoAbrirCliente }) {
  const { clientes, vendas, pagamentos, salvarCliente } = useDados()
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)

  const filtrados = clientes
    .filter((c) => `${c.nome} ${c.telefone}`.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

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

  function aoSalvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) return alert('Informe o nome do cliente.')
    salvarCliente({
      foto: form.foto,
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      observacoes: form.observacoes.trim(),
    })
    setForm(FORM_VAZIO)
    setModalAberto(false)
  }

  return (
    <div>
      <Cabecalho titulo="Clientes" />
      <div className="p-4 space-y-3">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Pesquisar cliente..." />
        <Botao onClick={() => { setForm(FORM_VAZIO); setModalAberto(true) }}>
          <span className="flex items-center justify-center gap-2">
            <Plus size={20} /> Novo cliente
          </span>
        </Botao>

        {filtrados.length === 0 && (
          <Vazio mensagem={clientes.length === 0 ? 'Nenhum cliente ainda. Toque no botão verde "Novo cliente" aí em cima para cadastrar o primeiro. 😊' : 'Nenhum cliente encontrado com esse nome.'} />
        )}

        {filtrados.map((c) => {
          const debito = debitoDoCliente(c.id, vendas, pagamentos)
          return (
            <Card key={c.id} onClick={() => aoAbrirCliente(c.id)}>
              <div className="flex items-center gap-3">
                <Avatar foto={c.foto} nome={c.nome} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 truncate">{c.nome}</div>
                  <div className="text-sm text-slate-500">{c.telefone || 'Sem telefone'}</div>
                </div>
                <div className="text-right shrink-0">
                  {debito > 0 ? (
                    <div className="text-sm font-bold text-red-600">{formatarMoeda(debito)}</div>
                  ) : (
                    <div className="text-xs text-emerald-600 font-semibold">Em dia</div>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </div>
            </Card>
          )
        })}
      </div>

      <Modal titulo="Novo cliente" aberto={modalAberto} aoFechar={() => setModalAberto(false)}>
        <form onSubmit={aoSalvar} className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <Avatar foto={form.foto} nome={form.nome || '?'} tamanho="w-24 h-24" />
            <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm cursor-pointer">
              <Camera size={18} />
              {form.foto ? 'Trocar foto' : 'Adicionar foto'}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={aoEscolherFoto} />
            </label>
          </div>
          <Campo rotulo="Nome completo *" value={form.nome} onChange={mudar('nome')} />
          <Campo rotulo="CPF" inputMode="numeric" value={form.cpf} onChange={mudar('cpf')} placeholder="000.000.000-00" />
          <Campo rotulo="Telefone" inputMode="tel" value={form.telefone} onChange={mudar('telefone')} placeholder="(00) 00000-0000" />
          <Campo rotulo="Endereço" value={form.endereco} onChange={mudar('endereco')} />
          <CampoArea rotulo="Observações" value={form.observacoes} onChange={mudar('observacoes')} />
          <Botao type="submit">Salvar cliente</Botao>
        </form>
      </Modal>
    </div>
  )
}
