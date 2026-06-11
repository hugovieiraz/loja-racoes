import { createContext, useContext, useEffect, useState } from 'react'

// Todos os dados do app ficam no localStorage do navegador, nesta chave.
const CHAVE_ARMAZENAMENTO = 'lojaRacoes:dados:v1'
// Cópia de segurança automática (atualizada 1x por dia), usada se a principal corromper.
const CHAVE_RESERVA = 'lojaRacoes:reserva:v1'

const DADOS_INICIAIS = {
  produtos: [],
  clientes: [],
  vendas: [],
  pagamentos: [],
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

// Guarda o dia (ex.: "2026-06-11") em que a cópia reserva foi atualizada pela última vez.
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

export function DadosProvider({ children }) {
  const [dados, setDados] = useState(carregarDados)

  useEffect(() => {
    try {
      const texto = JSON.stringify(dados)
      localStorage.setItem(CHAVE_ARMAZENAMENTO, texto)
      // Atualiza a cópia reserva no máximo 1x por dia (proteção extra contra corrupção)
      const hoje = new Date().toISOString().slice(0, 10)
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

  // ---------- Produtos ----------
  function salvarProduto(produto) {
    setDados((d) => {
      if (produto.id) {
        return {
          ...d,
          produtos: d.produtos.map((p) =>
            p.id === produto.id ? { ...p, ...produto } : p,
          ),
        }
      }
      return { ...d, produtos: [...d.produtos, { ...produto, id: novoId() }] }
    })
  }

  function excluirProduto(id) {
    setDados((d) => ({ ...d, produtos: d.produtos.filter((p) => p.id !== id) }))
  }

  // ---------- Clientes ----------
  function salvarCliente(cliente) {
    setDados((d) => {
      if (cliente.id) {
        return {
          ...d,
          clientes: d.clientes.map((c) =>
            c.id === cliente.id ? { ...c, ...cliente } : c,
          ),
        }
      }
      return { ...d, clientes: [...d.clientes, { ...cliente, id: novoId() }] }
    })
  }

  function excluirCliente(id) {
    setDados((d) => ({
      ...d,
      clientes: d.clientes.filter((c) => c.id !== id),
    }))
  }

  // ---------- Vendas ----------
  // venda: { clienteId|null, clienteNome, itens: [{produtoId, nome, quantidade, precoVenda, precoCompra}], formaPagamento }
  function registrarVenda(venda) {
    const total = venda.itens.reduce(
      (s, i) => s + i.precoVenda * i.quantidade,
      0,
    )
    const lucro = venda.itens.reduce(
      (s, i) => s + (i.precoVenda - i.precoCompra) * i.quantidade,
      0,
    )
    const nova = {
      ...venda,
      id: novoId(),
      data: new Date().toISOString(),
      total,
      lucro,
    }
    setDados((d) => ({
      ...d,
      vendas: [...d.vendas, nova],
      // Baixa automática de estoque
      produtos: d.produtos.map((p) => {
        const item = venda.itens.find((i) => i.produtoId === p.id)
        return item ? { ...p, estoque: p.estoque - item.quantidade } : p
      }),
    }))
    return nova
  }

  // Excluir venda devolve os itens ao estoque (e reduz o fiado, pois o débito é calculado pelas vendas)
  function excluirVenda(id) {
    setDados((d) => {
      const venda = d.vendas.find((v) => v.id === id)
      if (!venda) return d
      return {
        ...d,
        vendas: d.vendas.filter((v) => v.id !== id),
        produtos: d.produtos.map((p) => {
          const item = venda.itens.find((i) => i.produtoId === p.id)
          return item ? { ...p, estoque: p.estoque + item.quantidade } : p
        }),
      }
    })
  }

  // ---------- Pagamentos de fiado ----------
  function registrarPagamento({ clienteId, valor, observacao = '' }) {
    setDados((d) => ({
      ...d,
      pagamentos: [
        ...d.pagamentos,
        { id: novoId(), clienteId, valor, observacao, data: new Date().toISOString() },
      ],
    }))
  }

  // ---------- Backup ----------
  function importarDados(novosDados) {
    setDados({ ...DADOS_INICIAIS, ...novosDados })
  }

  const valor = {
    ...dados,
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
