import { useRef, useState } from 'react'
import { Download, Upload, Moon, Sun, Volume2, VolumeX, Lock, Cloud, CloudOff, LogOut, UserCog } from 'lucide-react'
import { useDados } from '../context/DadosContext.jsx'
import { useAutenticacao } from '../context/AutenticacaoContext.jsx'
import { Cabecalho, Card, Campo, Vazio, Botao } from '../components/Ui.jsx'
import GraficoBarras from '../components/GraficoBarras.jsx'
import { formatarMoeda, chaveDia, chaveMes } from '../utils/formato.js'
import { exportarBackup } from '../utils/backup.js'
import { alternarTema, temaEscuroAtivo, alternarSons, sonsAtivos, vibrar } from '../utils/efeitos.js'
import { pinAtivo, definirPin, removerPin, conferirPin } from '../utils/pin.js'
import { ehDono, ativarModoFuncionario, ativarModoDono } from '../utils/perfil.js'
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

function LinhaAjuste({ icone, rotulo, descricao, children }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="text-slate-400 shrink-0">{icone}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-700 text-sm">{rotulo}</div>
        {descricao && <div className="text-xs text-slate-400">{descricao}</div>}
      </div>
      {children}
    </div>
  )
}

function Ajustes() {
  const dados = useDados()
  const { produtos, clientes, vendas, pagamentos, importarDados, estadoNuvem } = dados
  const { sessao, sair, nuvemAtiva } = useAutenticacao()
  const inputImportar = useRef(null)
  const [, forcar] = useState(0)
  const atualizar = () => forcar((n) => n + 1)
  const dono = ehDono()

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
        if (!novos.produtos || !novos.clientes || !novos.vendas) throw new Error('inválido')
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

  async function configurarPin() {
    const novo = prompt('Digite o novo PIN (4 números):')
    if (!novo) return
    if (!/^\d{4}$/.test(novo)) return alert('O PIN deve ter exatamente 4 números.')
    const confirmacao = prompt('Digite o PIN de novo para confirmar:')
    if (confirmacao !== novo) return alert('Os PINs não conferem.')
    await definirPin(novo)
    vibrar(30)
    alert('PIN ativado! Será pedido sempre que o app abrir.')
    atualizar()
  }

  async function desativarPin() {
    const pin = prompt('Digite o PIN atual para desativar:')
    if (!pin) return
    if (!(await conferirPin(pin))) return alert('PIN incorreto.')
    removerPin()
    atualizar()
  }

  async function entrarModoFuncionario() {
    if (!pinAtivo()) {
      alert('Antes de ativar o modo funcionário, configure um PIN — ele será a chave para voltar ao modo dono.')
      await configurarPin()
      if (!pinAtivo()) return
    }
    if (confirm('Ativar o modo funcionário neste aparelho? Vendas totais, lucro e relatórios ficarão ocultos. Para voltar, será preciso o PIN.')) {
      ativarModoFuncionario()
      location.reload()
    }
  }

  async function voltarModoDono() {
    const pin = prompt('Digite o PIN do dono:')
    if (!pin) return
    if (!(await conferirPin(pin))) {
      vibrar([80, 40, 80])
      return alert('PIN incorreto.')
    }
    ativarModoDono()
    location.reload()
  }

  const rotulosNuvem = {
    desativada: 'Não configurada',
    sincronizando: 'Sincronizando...',
    sincronizada: 'Tudo sincronizado',
    offline: 'Sem internet (dados locais)',
    erro: 'Erro — tentará de novo',
  }

  return (
    <>
      <Card>
        <h2 className="font-bold text-slate-700 mb-1">Ajustes</h2>
        <LinhaAjuste
          icone={temaEscuroAtivo() ? <Moon size={20} /> : <Sun size={20} />}
          rotulo="Modo escuro"
        >
          <button
            onClick={() => { alternarTema(); atualizar() }}
            className={`w-12 h-7 rounded-full transition-colors relative ${temaEscuroAtivo() ? 'bg-emerald-600' : 'bg-slate-300'}`}
            aria-label="Alternar modo escuro"
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${temaEscuroAtivo() ? 'left-6' : 'left-1'}`} />
          </button>
        </LinhaAjuste>
        <LinhaAjuste
          icone={sonsAtivos() ? <Volume2 size={20} /> : <VolumeX size={20} />}
          rotulo="Sons de dinheiro"
          descricao="Toca ao registrar venda ou pagamento"
        >
          <button
            onClick={() => { alternarSons(); atualizar() }}
            className={`w-12 h-7 rounded-full transition-colors relative ${sonsAtivos() ? 'bg-emerald-600' : 'bg-slate-300'}`}
            aria-label="Alternar sons"
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${sonsAtivos() ? 'left-6' : 'left-1'}`} />
          </button>
        </LinhaAjuste>
        <LinhaAjuste
          icone={<Lock size={20} />}
          rotulo="PIN de bloqueio"
          descricao={pinAtivo() ? 'Ativado — pedido ao abrir o app' : 'Desativado'}
        >
          {pinAtivo() ? (
            <button onClick={desativarPin} className="text-sm font-bold text-red-600">Desativar</button>
          ) : (
            <button onClick={configurarPin} className="text-sm font-bold text-emerald-700">Ativar</button>
          )}
        </LinhaAjuste>
        <LinhaAjuste
          icone={<UserCog size={20} />}
          rotulo={dono ? 'Modo funcionário' : 'Modo dono'}
          descricao={dono ? 'Oculta totais, lucro e relatórios neste aparelho' : 'Este aparelho está em modo funcionário'}
        >
          {dono ? (
            <button onClick={entrarModoFuncionario} className="text-sm font-bold text-emerald-700">Ativar</button>
          ) : (
            <button onClick={voltarModoDono} className="text-sm font-bold text-emerald-700">Voltar ao dono</button>
          )}
        </LinhaAjuste>
        <LinhaAjuste
          icone={estadoNuvem === 'sincronizada' ? <Cloud size={20} /> : <CloudOff size={20} />}
          rotulo="Nuvem"
          descricao={rotulosNuvem[estadoNuvem] || estadoNuvem}
        >
          {nuvemAtiva && sessao && dono && (
            <button
              onClick={() => { if (confirm('Sair da conta? Os dados continuam salvos na nuvem e neste aparelho.')) sair() }}
              className="text-sm font-bold text-red-600 flex items-center gap-1"
            >
              <LogOut size={14} /> Sair
            </button>
          )}
        </LinhaAjuste>
        {nuvemAtiva && sessao && (
          <div className="text-xs text-slate-400 mt-1">Conta: {sessao.user.email}</div>
        )}
      </Card>

      {dono && (
        <Card>
          <h2 className="font-bold text-slate-700 mb-2">Backup dos dados</h2>
          <p className="text-sm text-slate-500 mb-3">
            Exporte um backup com frequência para garantia extra. O arquivo pode ser importado de volta a qualquer momento.
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
      )}
    </>
  )
}

export default function Relatorios() {
  const dados = useDados()
  const { produtos, clientes, vendas, pagamentos } = dados
  const [dia, setDia] = useState(chaveDia())
  const [mes, setMes] = useState(chaveMes())

  // Funcionário só vê os Ajustes
  if (!ehDono()) {
    return (
      <div>
        <Cabecalho titulo="Ajustes" />
        <div className="p-4 space-y-3">
          <Ajustes />
        </div>
      </div>
    )
  }

  const doDia = vendasDoDia(vendas, dia)
  const doMes = vendasDoMes(vendas, mes)
  const mesAVista = doMes.filter((v) => v.formaPagamento !== 'fiado')
  const mesFiado = doMes.filter((v) => v.formaPagamento === 'fiado')

  // Vendas por dia do mês selecionado (para o gráfico)
  const [ano, numeroMes] = mes.split('-').map(Number)
  const diasNoMes = new Date(ano, numeroMes, 0).getDate()
  const vendasPorDia = Array.from({ length: diasNoMes }, (_, i) => {
    const diaChave = `${mes}-${String(i + 1).padStart(2, '0')}`
    return {
      rotulo: `dia ${i + 1}`,
      valor: somaTotal(doMes.filter((v) => chaveDia(v.data) === diaChave)),
    }
  })

  const maisVendidos = produtosMaisVendidos(doMes)
  const melhoresClientes = clientesQueMaisCompraram(doMes, clientes)
  const maioresDebitos = clientes
    .map((c) => ({ nome: c.nome, debito: debitoDoCliente(c.id, vendas, pagamentos) }))
    .filter((c) => c.debito > 0)
    .sort((a, b) => b.debito - a.debito)
    .slice(0, 5)

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
          <h2 className="font-bold text-slate-700 mb-2">Vendas por dia</h2>
          <GraficoBarras itens={vendasPorDia} formatarValor={formatarMoeda} />
        </Card>
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

        <Ajustes />
      </div>
    </div>
  )
}
