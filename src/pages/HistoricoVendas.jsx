import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Card, Busca, Campo, CampoSelecao, Vazio, Selo } from '../components/Ui.jsx'
import { formatarMoeda, formatarDataHora, rotuloPagamento, chaveDia, FORMAS_PAGAMENTO } from '../utils/formato.js'

export default function HistoricoVendas() {
  const { vendas, excluirVenda } = useDados()
  const [busca, setBusca] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroPagamento, setFiltroPagamento] = useState('todos')

  const filtradas = vendas
    .filter((v) => {
      if (filtroData && chaveDia(v.data) !== filtroData) return false
      if (filtroPagamento === 'avista' && v.formaPagamento === 'fiado') return false
      if (
        filtroPagamento !== 'todos' &&
        filtroPagamento !== 'avista' &&
        v.formaPagamento !== filtroPagamento
      )
        return false
      if (busca) {
        const texto = `${v.clienteNome} ${v.itens.map((i) => i.nome).join(' ')}`.toLowerCase()
        if (!texto.includes(busca.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => b.data.localeCompare(a.data))

  const totalFiltrado = filtradas.reduce((s, v) => s + v.total, 0)

  function aoExcluir(venda) {
    if (
      confirm(
        `Excluir esta venda de ${formatarMoeda(venda.total)}? Os produtos voltam ao estoque e, se for fiada, o débito do cliente diminui.`,
      )
    ) {
      excluirVenda(venda.id)
    }
  }

  return (
    <div className="p-4 space-y-3">
      <Busca valor={busca} aoMudar={setBusca} placeholder="Cliente ou produto..." />
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data" type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        <CampoSelecao
          rotulo="Pagamento"
          value={filtroPagamento}
          onChange={(e) => setFiltroPagamento(e.target.value)}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: 'avista', rotulo: 'À vista' },
            ...FORMAS_PAGAMENTO,
          ]}
        />
      </div>

      <div className="text-sm text-slate-500">
        {filtradas.length} venda(s) · total {formatarMoeda(totalFiltrado)}
      </div>

      {filtradas.length === 0 && <Vazio mensagem="Nenhuma venda encontrada." />}

      {filtradas.map((v) => (
        <Card key={v.id}>
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="font-bold text-slate-800 truncate">{v.clienteNome}</div>
              <div className="text-sm text-slate-500">{formatarDataHora(v.data)}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Selo cor={v.formaPagamento === 'fiado' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
                {v.formaPagamento === 'fiado' ? 'Fiado' : `Pago · ${rotuloPagamento(v.formaPagamento)}`}
              </Selo>
              <button onClick={() => aoExcluir(v)} className="p-2 rounded-lg active:bg-red-50" aria-label="Excluir venda">
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {v.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="font-bold text-slate-800 text-base">{formatarMoeda(v.total)}</span>
            <span className="text-emerald-600 font-semibold">lucro {formatarMoeda(v.lucro)}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
