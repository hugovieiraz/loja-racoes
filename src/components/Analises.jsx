import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Card, Campo, CampoSelecao } from './Ui.jsx'
import GraficoPizza from './GraficoPizza.jsx'
import GraficoBarras from './GraficoBarras.jsx'
import { formatarMoeda, chaveDia, chaveMes, rotuloPagamento } from '../utils/formato.js'
import {
  vendasNoPeriodo,
  referenciaAnterior,
  rotuloPeriodo,
  pesoEmKg,
} from '../utils/periodos.js'

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function Variacao({ atual, anterior, formatar = (v) => v }) {
  if (anterior === 0 && atual === 0) {
    return <span className="text-slate-400 text-xs">—</span>
  }
  if (anterior === 0) {
    return <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5"><TrendingUp size={13} /> novo</span>
  }
  const percentual = Math.round(((atual - anterior) / anterior) * 100)
  if (percentual === 0) {
    return <span className="text-slate-400 text-xs font-semibold flex items-center gap-0.5"><Minus size={13} /> igual</span>
  }
  const subiu = percentual > 0
  return (
    <span className={`text-xs font-bold flex items-center gap-0.5 ${subiu ? 'text-emerald-600' : 'text-red-600'}`}>
      {subiu ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {subiu ? '+' : ''}{percentual}% <span className="text-slate-400 font-normal">(antes: {formatar(anterior)})</span>
    </span>
  )
}

export default function Analises() {
  const { vendas, produtos } = useDados()
  const [tipo, setTipo] = useState('mes')
  const [refSemana, setRefSemana] = useState(chaveDia())
  const [refMes, setRefMes] = useState(chaveMes())
  const [refAno, setRefAno] = useState(String(new Date().getFullYear()))

  const referencia = tipo === 'semana' ? refSemana : tipo === 'mes' ? refMes : refAno
  const noPeriodo = vendasNoPeriodo(vendas, tipo, referencia)
  const periodoAnterior = vendasNoPeriodo(vendas, tipo, referenciaAnterior(tipo, referencia))

  // Anos com vendas (para o seletor de ano)
  const anos = [...new Set([...vendas.map((v) => v.data.slice(0, 4)), String(new Date().getFullYear())])].sort().reverse()

  // ---------- Pizza: sacos mais vendidos ----------
  const porProduto = {}
  for (const v of noPeriodo) {
    for (const item of v.itens) {
      porProduto[item.nome] = (porProduto[item.nome] || 0) + item.quantidade
    }
  }
  const ordenados = Object.entries(porProduto).sort((a, b) => b[1] - a[1])
  const principais = ordenados.slice(0, 6).map(([rotulo, valor]) => ({ rotulo, valor }))
  const restoQtd = ordenados.slice(6).reduce((s, [, q]) => s + q, 0)
  const fatias = restoQtd > 0 ? [...principais, { rotulo: 'Outros', valor: restoQtd }] : principais

  // ---------- Kg vendidos (volume) ----------
  const pesoPorProdutoId = new Map(produtos.map((p) => [p.id, pesoEmKg(p.peso)]))
  function kgDasVendas(lista) {
    let kg = 0
    for (const v of lista) {
      for (const item of v.itens) {
        kg += (pesoPorProdutoId.get(item.produtoId) || 0) * item.quantidade
      }
    }
    return Math.round(kg)
  }
  const kgPeriodo = kgDasVendas(noPeriodo)
  const kgAnterior = kgDasVendas(periodoAnterior)
  const temProdutoSemPeso = produtos.some((p) => pesoEmKg(p.peso) === 0)

  // Sazonalidade: kg por mês do ano (verão x inverno)
  const anoSazonal = tipo === 'ano' ? referencia : referencia.slice(0, 4)
  const kgPorMes = MESES_CURTOS.map((rotulo, i) => {
    const chave = `${anoSazonal}-${String(i + 1).padStart(2, '0')}`
    const doMes = vendas.filter((v) => v.data.slice(0, 7) === chave)
    return { rotulo, valor: kgDasVendas(doMes) }
  })

  // ---------- Formas de pagamento ----------
  const porPagamento = {}
  for (const v of noPeriodo) {
    porPagamento[v.formaPagamento] = (porPagamento[v.formaPagamento] || 0) + v.total
  }
  const totalPeriodo = noPeriodo.reduce((s, v) => s + v.total, 0)
  const lucroPeriodo = noPeriodo.reduce((s, v) => s + v.lucro, 0)
  const totalAnterior = periodoAnterior.reduce((s, v) => s + v.total, 0)
  const lucroAnterior = periodoAnterior.reduce((s, v) => s + v.lucro, 0)

  // ---------- Ticket médio e margem ----------
  const ticketMedio = noPeriodo.length ? Math.round(totalPeriodo / noPeriodo.length) : 0
  const ticketAnterior = periodoAnterior.length ? Math.round(totalAnterior / periodoAnterior.length) : 0
  const margem = totalPeriodo ? Math.round((lucroPeriodo / totalPeriodo) * 100) : 0

  return (
    <>
      <h2 className="font-bold text-slate-700 pt-2 text-lg">Análises</h2>

      {/* Seletor de período */}
      <Card className="space-y-3">
        <div className="grid grid-cols-3 bg-slate-200 rounded-xl p-1">
          {[
            { id: 'semana', rotulo: 'Semana' },
            { id: 'mes', rotulo: 'Mês' },
            { id: 'ano', rotulo: 'Ano' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={`py-2 rounded-lg font-semibold text-sm ${
                tipo === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
        {tipo === 'semana' && (
          <Campo rotulo="Qualquer dia da semana desejada" type="date" value={refSemana} onChange={(e) => setRefSemana(e.target.value)} />
        )}
        {tipo === 'mes' && (
          <Campo rotulo="Mês" type="month" value={refMes} onChange={(e) => setRefMes(e.target.value)} />
        )}
        {tipo === 'ano' && (
          <CampoSelecao
            rotulo="Ano"
            value={refAno}
            onChange={(e) => setRefAno(e.target.value)}
            opcoes={anos.map((a) => ({ valor: a, rotulo: a }))}
          />
        )}
        <div className="text-xs text-slate-400">
          Período: {rotuloPeriodo(tipo, referencia)} · {noPeriodo.length} venda(s)
        </div>
      </Card>

      {/* Pizza: mais vendidos */}
      <Card>
        <h3 className="font-bold text-slate-700 mb-3">Sacos mais vendidos</h3>
        <GraficoPizza itens={fatias} unidade="un." />
      </Card>

      {/* Volume em kg + sazonalidade */}
      <Card>
        <h3 className="font-bold text-slate-700">Ração vendida (volume)</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-emerald-600">{kgPeriodo.toLocaleString('pt-BR')} kg</span>
          <Variacao atual={kgPeriodo} anterior={kgAnterior} formatar={(v) => `${v.toLocaleString('pt-BR')} kg`} />
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-600 mb-1">Kg por mês em {anoSazonal} (sazonalidade)</div>
          <GraficoBarras
            itens={kgPorMes}
            formatarValor={(v) => `${v.toLocaleString('pt-BR')} kg`}
            rotuloMelhor="Melhor mês"
          />
          <p className="text-xs text-slate-400 mt-2">
            Compare verão (dez–mar) com inverno (jun–set) para planejar o estoque.
            {temProdutoSemPeso && ' Atenção: produtos sem o campo "peso do saco" preenchido não entram nesta conta.'}
          </p>
        </div>
      </Card>

      {/* Formas de pagamento */}
      <Card>
        <h3 className="font-bold text-slate-700 mb-3">Como os clientes pagaram</h3>
        {totalPeriodo === 0 && <div className="text-center text-slate-400 py-4">Sem vendas no período.</div>}
        <div className="space-y-2">
          {Object.entries(porPagamento)
            .sort((a, b) => b[1] - a[1])
            .map(([forma, valor]) => {
              const fracao = valor / totalPeriodo
              return (
                <div key={forma}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-slate-600">{rotuloPagamento(forma)}</span>
                    <span className="font-semibold text-slate-800">
                      {formatarMoeda(valor)} <span className="text-slate-400">({Math.round(fracao * 100)}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${forma === 'fiado' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.max(fracao * 100, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </Card>

      {/* Comparativo com o período anterior */}
      <Card>
        <h3 className="font-bold text-slate-700 mb-2">Comparado com o período anterior</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total vendido</span>
            <div className="text-right">
              <div className="font-bold text-slate-800">{formatarMoeda(totalPeriodo)}</div>
              <Variacao atual={totalPeriodo} anterior={totalAnterior} formatar={formatarMoeda} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Lucro</span>
            <div className="text-right">
              <div className="font-bold text-emerald-600">{formatarMoeda(lucroPeriodo)}</div>
              <Variacao atual={lucroPeriodo} anterior={lucroAnterior} formatar={formatarMoeda} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Valor médio por venda</span>
            <div className="text-right">
              <div className="font-bold text-slate-800">{formatarMoeda(ticketMedio)}</div>
              <Variacao atual={ticketMedio} anterior={ticketAnterior} formatar={formatarMoeda} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Lucro a cada R$ 100 vendidos</span>
            <div className="font-bold text-slate-800">{formatarMoeda(margem * 100)}</div>
          </div>
        </div>
      </Card>
    </>
  )
}
