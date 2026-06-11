import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { Cabecalho, Card, Campo, Vazio, Botao } from '../components/Ui.jsx'
import { formatarMoeda, chaveDia, chaveMes } from '../utils/formato.js'
import { exportarBackup } from '../utils/backup.js'
import {
  vendasDoDia,
  vendasDoMes,
  somaTotal,
  somaLucro,
  totalDebitos,
  produtosMaisVendidos,
  clientesQueMaisCompraram,
  debitoDoCliente,
} from '../utils/calculos.js'

function LinhaResumo({ rotulo, valor, cor = 'text-slate-800' }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-500 text-sm">{rotulo}</span>
      <span className={`font-bold ${cor}`}>{valor}</span>
    </div>
  )
}

export default function Relatorios() {
  const dados = useDados()
  const { produtos, clientes, vendas, pagamentos, importarDados } = dados
  const [dia, setDia] = useState(chaveDia())
  const [mes, setMes] = useState(chaveMes())
  const inputImportar = useRef(null)

  const doDia = vendasDoDia(vendas, dia)
  const doMes = vendasDoMes(vendas, mes)
  const mesAVista = doMes.filter((v) => v.formaPagamento !== 'fiado')
  const mesFiado = doMes.filter((v) => v.formaPagamento === 'fiado')

  const maisVendidos = produtosMaisVendidos(doMes)
  const melhoresClientes = clientesQueMaisCompraram(doMes, clientes)
  const maioresDebitos = clientes
    .map((c) => ({ nome: c.nome, debito: debitoDoCliente(c.id, vendas, pagamentos) }))
    .filter((c) => c.debito > 0)
    .sort((a, b) => b.debito - a.debito)
    .slice(0, 5)

  function aoExportarBackup() {
    exportarBackup({ produtos, clientes, vendas, pagamentos })
  }

  function aoImportar(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = () => {
      try {
        const novos = JSON.parse(leitor.result)
        if (!novos.produtos || !novos.clientes || !novos.vendas) {
          throw new Error('Arquivo inválido')
        }
        if (confirm('Importar este backup? Os dados atuais serão SUBSTITUÍDOS.')) {
          importarDados(novos)
          alert('Backup importado com sucesso!')
        }
      } catch {
        alert('Arquivo de backup inválido.')
      }
      e.target.value = ''
    }
    leitor.readAsText(arquivo)
  }

  return (
    <div>
      <Cabecalho titulo="Relatórios" />
      <div className="p-4 space-y-3">
        <Campo rotulo="Dia" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Resumo do dia</h2>
          <LinhaResumo rotulo="Vendas" valor={`${doDia.length}`} />
          <LinhaResumo rotulo="Total vendido" valor={formatarMoeda(somaTotal(doDia))} />
          <LinhaResumo rotulo="Lucro" valor={formatarMoeda(somaLucro(doDia))} cor="text-emerald-600" />
        </Card>

        <Campo rotulo="Mês" type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Resumo do mês</h2>
          <LinhaResumo rotulo="Vendas" valor={`${doMes.length}`} />
          <LinhaResumo rotulo="Total vendido" valor={formatarMoeda(somaTotal(doMes))} />
          <LinhaResumo rotulo="Lucro" valor={formatarMoeda(somaLucro(doMes))} cor="text-emerald-600" />
          <LinhaResumo rotulo="À vista" valor={formatarMoeda(somaTotal(mesAVista))} />
          <LinhaResumo rotulo="Fiado" valor={formatarMoeda(somaTotal(mesFiado))} cor="text-amber-600" />
          <LinhaResumo
            rotulo="Débitos pendentes (geral)"
            valor={formatarMoeda(totalDebitos(clientes, vendas, pagamentos))}
            cor="text-red-600"
          />
        </Card>

        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Produtos mais vendidos (mês)</h2>
          {maisVendidos.length === 0 && <Vazio mensagem="Sem vendas no período." />}
          {maisVendidos.map((p) => (
            <LinhaResumo key={p.nome} rotulo={p.nome} valor={`${p.quantidade} un. · ${formatarMoeda(p.total)}`} />
          ))}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Clientes que mais compraram (mês)</h2>
          {melhoresClientes.length === 0 && <Vazio mensagem="Sem vendas no período." />}
          {melhoresClientes.map((c) => (
            <LinhaResumo key={c.nome} rotulo={c.nome} valor={formatarMoeda(c.total)} />
          ))}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Maiores débitos</h2>
          {maioresDebitos.length === 0 && <Vazio mensagem="Nenhum débito em aberto." />}
          {maioresDebitos.map((c) => (
            <LinhaResumo key={c.nome} rotulo={c.nome} valor={formatarMoeda(c.debito)} cor="text-red-600" />
          ))}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Backup dos dados</h2>
          <p className="text-sm text-slate-500 mb-3">
            Os dados ficam salvos somente neste celular. Exporte um backup com frequência para não perder nada.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Botao variante="contorno" onClick={aoExportarBackup}>
              <span className="flex items-center justify-center gap-2">
                <Download size={18} /> Exportar
              </span>
            </Botao>
            <Botao variante="secundario" onClick={() => inputImportar.current?.click()}>
              <span className="flex items-center justify-center gap-2">
                <Upload size={18} /> Importar
              </span>
            </Botao>
          </div>
          <input ref={inputImportar} type="file" accept="application/json" className="hidden" onChange={aoImportar} />
        </Card>
      </div>
    </div>
  )
}
