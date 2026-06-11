import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAutenticacao } from './AutenticacaoContext.jsx'
import { mesclarDados, baixarDaNuvem, enviarParaNuvem } from '../nuvem/sincronizacao.js'

// Todos os dados do app ficam no localStorage do navegador, nesta chave.
const CHAVE_ARMAZENAMENTO = 'lojaRacoes:dados:v1'
// Cópia de segurança automática (atualizada 1x por dia), usada se a principal corromper.
const CHAVE_RESERVA = 'lojaRacoes:reserva:v1'

const DADOS_INICIAIS = {
  produtos: [],
  clientes: [],
  vendas: [],
  pagamentos: [],
  excluidos: [], // registro de exclusões, usado pela sincronização
}

const DadosContext = createContext(null)

function lerChave(chave) {
  const salvo = localStorage.getItem(chave)
  if (!salvo) return null
  const dados = JSON.parse(salvo)
  if (!dados || typeof dados !== 'object') throw new Error('Dados inválidos')
  return { ...DADOS_INICIAIS, ...dados }
}

function carregarDados() {
  // Tenta a chave principal; se estiver corrompida, recupera da cópia reserva.
  try {
    const principal = lerChave(CHAVE_ARMAZENAMENTO)
    if (principal) return principal
  } catch (erro) {
    console.error('Dados principais corrompidos, tentando a cópia reserva:', erro)
  }
  try {
    const reserva = lerChave(CHAVE_RESERVA)
    if (reserva) {
      alert('Os dados principais estavam corrompidos. Uma cópia de segurança foi recuperada.')
      return reserva
    }
  } catch {
    /* reserva também indisponível */
  }
  return DADOS_INICIAIS
}

function diaDaReserva() {
  try {
    return localStorage.getItem(`${CHAVE_RESERVA}:dia`)
  } catch {
    return null
  }
}

function novoId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function agora() {
  return new Date().toISOString()
}

export function DadosProvider({ children }) {
  const [dados, setDados] = useState(carregarDados)
  const { sessao, nuvemAtiva } = useAutenticacao()
  // 'desativada' | 'sincronizando' | 'sincronizada' | 'offline' | 'erro'
  const [estadoNuvem, setEstadoNuvem] = useState(nuvemAtiva ? 'offline' : 'desativada')
  const dadosRef = useRef(dados)
  dadosRef.current = dados
  const timerEnvio = useRef(null)

  // ---------- Persistência local ----------
  useEffect(() => {
    try {
      const texto = JSON.stringify(dados)
      localStorage.setItem(CHAVE_ARMAZENAMENTO, texto)
      const hoje = agora().slice(0, 10)
      if (diaDaReserva() !== hoje) {
        localStorage.setItem(CHAVE_RESERVA, texto)
        localStorage.setItem(`${CHAVE_RESERVA}:dia`, hoje)
      }
    } catch (erro) {
      console.error('Falha ao salvar dados:', erro)
      alert(
        'ATENÇÃO: não foi possível salvar os dados (armazenamento cheio). ' +
          'Exporte um backup em Relatórios e libere espaço no navegador.',
      )
    }
  }, [dados])

  // ---------- Sincronização com a nuvem ----------
  async function sincronizarAgora() {
    if (!nuvemAtiva || !sessao) return
    if (!navigator.onLine) {
      setEstadoNuvem('offline')
      return
    }
    setEstadoNuvem('sincronizando')
    try {
      const remoto = await baixarDaNuvem(sessao.user.id)
      const mesclado = remoto ? mesclarDados(dadosRef.current, remoto) : dadosRef.current
      await enviarParaNuvem(sessao.user.id, mesclado)
      if (remoto) setDados(mesclado)
      setEstadoNuvem('sincronizada')
    } catch (erro) {
      console.error('Falha na sincronização:', erro)
      setEstadoNuvem('erro')
    }
  }

  // Sincroniza ao entrar e quando a internet volta
  useEffect(() => {
    if (!nuvemAtiva || !sessao) return
    sincronizarAgora()
    const aoVoltarInternet = () => sincronizarAgora()
    window.addEventListener('online', aoVoltarInternet)
    return () => window.removeEventListener('online', aoVoltarInternet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao?.user?.id, nuvemAtiva])

  // Envia alterações para a nuvem alguns segundos depois de cada mudança
  useEffect(() => {
    if (!nuvemAtiva || !sessao || !navigator.onLine) return
    clearTimeout(timerEnvio.current)
    timerEnvio.current = setTimeout(async () => {
      try {
        setEstadoNuvem('sincronizando')
        await enviarParaNuvem(sessao.user.id, dadosRef.current)
        setEstadoNuvem('sincronizada')
      } catch (erro) {
        console.error('Falha ao enviar para a nuvem:', erro)
        setEstadoNuvem('erro')
      }
    }, 3000)
    return () => clearTimeout(timerEnvio.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados])

  // ---------- Produtos ----------
  function salvarProduto(produto) {
    const carimbo = agora()
    setDados((d) => {
      if (produto.id) {
        return {
          ...d,
          produtos: d.produtos.map((p) =>
            p.id === produto.id ? { ...p, ...produto, atualizadoEm: carimbo } : p,
          ),
        }
      }
      return {
        ...d,
        produtos: [...d.produtos, { ...produto, id: novoId(), atualizadoEm: carimbo }],
      }
    })
  }

  function excluirProduto(id) {
    setDados((d) => ({
      ...d,
      produtos: d.produtos.filter((p) => p.id !== id),
      excluidos: [...d.excluidos, { id, colecao: 'produtos', em: agora() }],
    }))
  }

  // ---------- Clientes ----------
  function salvarCliente(cliente) {
    const carimbo = agora()
    setDados((d) => {
      if (cliente.id) {
        return {
          ...d,
          clientes: d.clientes.map((c) =>
            c.id === cliente.id ? { ...c, ...cliente, atualizadoEm: carimbo } : c,
          ),
        }
      }
      return {
        ...d,
        clientes: [...d.clientes, { ...cliente, id: novoId(), atualizadoEm: carimbo }],
      }
    })
  }

  function excluirCliente(id) {
    setDados((d) => ({
      ...d,
      clientes: d.clientes.filter((c) => c.id !== id),
      excluidos: [...d.excluidos, { id, colecao: 'clientes', em: agora() }],
    }))
  }

  // ---------- Vendas ----------
  function registrarVenda(venda) {
    const total = venda.itens.reduce((s, i) => s + i.precoVenda * i.quantidade, 0)
    const lucro = venda.itens.reduce(
      (s, i) => s + (i.precoVenda - i.precoCompra) * i.quantidade,
      0,
    )
    const carimbo = agora()
    const nova = { ...venda, id: novoId(), data: carimbo, atualizadoEm: carimbo, total, lucro }
    setDados((d) => ({
      ...d,
      vendas: [...d.vendas, nova],
      // Baixa automática de estoque
      produtos: d.produtos.map((p) => {
        const item = venda.itens.find((i) => i.produtoId === p.id)
        return item
          ? { ...p, estoque: p.estoque - item.quantidade, atualizadoEm: carimbo }
          : p
      }),
    }))
    return nova
  }

  // Excluir venda devolve os itens ao estoque (e reduz o fiado, pois o débito é calculado pelas vendas)
  function excluirVenda(id) {
    const carimbo = agora()
    setDados((d) => {
      const venda = d.vendas.find((v) => v.id === id)
      if (!venda) return d
      return {
        ...d,
        vendas: d.vendas.filter((v) => v.id !== id),
        excluidos: [...d.excluidos, { id, colecao: 'vendas', em: carimbo }],
        produtos: d.produtos.map((p) => {
          const item = venda.itens.find((i) => i.produtoId === p.id)
          return item
            ? { ...p, estoque: p.estoque + item.quantidade, atualizadoEm: carimbo }
            : p
        }),
      }
    })
  }

  // ---------- Pagamentos de fiado ----------
  function registrarPagamento({ clienteId, valor, observacao = '' }) {
    const carimbo = agora()
    setDados((d) => ({
      ...d,
      pagamentos: [
        ...d.pagamentos,
        { id: novoId(), clienteId, valor, observacao, data: carimbo, atualizadoEm: carimbo },
      ],
    }))
  }

  // ---------- Backup ----------
  function importarDados(novosDados) {
    setDados({ ...DADOS_INICIAIS, ...novosDados })
  }

  const valor = {
    ...dados,
    estadoNuvem,
    sincronizarAgora,
    salvarProduto,
    excluirProduto,
    salvarCliente,
    excluirCliente,
    registrarVenda,
    excluirVenda,
    registrarPagamento,
    importarDados,
  }

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>
}

export function useDados() {
  const contexto = useContext(DadosContext)
  if (!contexto) throw new Error('useDados deve ser usado dentro de DadosProvider')
  return contexto
}
