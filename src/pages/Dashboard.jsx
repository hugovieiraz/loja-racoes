import { useState } from 'react'
import { TrendingUp, Wallet, HandCoins, AlertTriangle, CalendarDays, Banknote, ShieldCheck } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, CardResumo, Vazio } from '../components/Ui.jsx'
import { formatarMoeda } from '../utils/formato.js'
import { exportarBackup, precisaLembrarBackup } from '../utils/backup.js'
import {
  vendasDoDia,
  vendasDoMes,
  somaTotal,
  somaLucro,
  totalDebitos,
  produtosEstoqueBaixo,
} from '../utils/calculos.js'

export default function Dashboard() {
  const { produtos, clientes, vendas, pagamentos } = useDados()

  const hoje = vendasDoDia(vendas)
  const mes = vendasDoMes(vendas)
  const mesAVista = mes.filter((v) => v.formaPagamento !== 'fiado')
  const mesFiado = mes.filter((v) => v.formaPagamento === 'fiado')
  const debitos = totalDebitos(clientes, vendas, pagamentos)
  const estoqueBaixo = produtosEstoqueBaixo(produtos)

  const temDados = vendas.length > 0 || produtos.length > 0 || clientes.length > 0
  const [mostrarLembrete, setMostrarLembrete] = useState(() => precisaLembrarBackup(temDados))

  return (
    <div>
      <Cabecalho titulo="Lamartine Rações" />
      <div className="p-4 space-y-3">
        {mostrarLembrete && (
          <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-200 p-4 flex items-start gap-3">
            <ShieldCheck size={22} className="text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-sky-900">
              <div className="font-semibold">Proteja seus dados</div>
              <div className="text-sky-700">Faça um backup — leva 2 segundos e evita perder tudo.</div>
              <button
                onClick={() => {
                  exportarBackup({ produtos, clientes, vendas, pagamentos })
                  setMostrarLembrete(false)
                }}
                className="mt-2 font-bold text-sky-700 underline"
              >
                Fazer backup agora
              </button>
            </div>
          </div>
        )}

        {/* Destaque do dia */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 shadow-md">
          <div className="flex items-center gap-2 text-emerald-100 text-sm">
            <CalendarDays size={16} />
            <span>
              Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div className="text-3xl font-bold mt-1">{formatarMoeda(somaTotal(hoje))}</div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-emerald-100">
              {hoje.length} venda{hoje.length === 1 ? '' : 's'}
            </span>
            <span className="font-semibold bg-white/15 rounded-full px-2.5 py-0.5">
              lucro {formatarMoeda(somaLucro(hoje))}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CardResumo
            titulo="Vendido no mês"
            valor={formatarMoeda(somaTotal(mes))}
            icone={<TrendingUp size={16} />}
          />
          <CardResumo
            titulo="Lucro no mês"
            valor={formatarMoeda(somaLucro(mes))}
            destaque="text-emerald-600"
            icone={<Wallet size={16} />}
          />
          <CardResumo
            titulo="À vista (mês)"
            valor={formatarMoeda(somaTotal(mesAVista))}
            icone={<Banknote size={16} />}
          />
          <CardResumo
            titulo="Fiado (mês)"
            valor={formatarMoeda(somaTotal(mesFiado))}
            destaque="text-amber-600"
            icone={<HandCoins size={16} />}
          />
        </div>

        <Card className={debitos > 0 ? 'border-2 border-red-200' : ''}>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <HandCoins size={16} />
            <span>Débitos pendentes</span>
          </div>
          <div className={`text-2xl font-bold ${debitos > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatarMoeda(debitos)}
          </div>
        </Card>

        <h2 className="font-bold text-slate-700 pt-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          Estoque baixo ({estoqueBaixo.length})
        </h2>
        {estoqueBaixo.length === 0 ? (
          <Vazio mensagem="Nenhum produto com estoque baixo." />
        ) : (
          estoqueBaixo.map((p) => (
            <Card key={p.id} className="!p-3 flex justify-between items-center">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">{p.nome}</div>
                <div className="text-xs text-slate-400">mínimo: {p.estoqueMinimo}</div>
              </div>
              <div className="font-bold text-red-600 shrink-0">{p.estoque} un.</div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
