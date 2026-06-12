import { chaveDia, chaveMes } from './formato.js'

// Débito atual de um cliente: total comprado fiado - total pago
export function debitoDoCliente(clienteId, vendas, pagamentos) {
  const fiado = vendas
    .filter((v) => v.clienteId === clienteId && v.formaPagamento === 'fiado')
    .reduce((s, v) => s + v.total, 0)
  const pago = pagamentos
    .filter((p) => p.clienteId === clienteId)
    .reduce((s, p) => s + p.valor, 0)
  return Math.max(0, fiado - pago)
}

export function vendasDoDia(vendas, dia = chaveDia()) {
  return vendas.filter((v) => chaveDia(v.data) === dia)
}

export function vendasDoMes(vendas, mes = chaveMes()) {
  return vendas.filter((v) => chaveMes(v.data) === mes)
}

export function somaTotal(lista) {
  return lista.reduce((s, v) => s + v.total, 0)
}

export function somaLucro(lista) {
  return lista.reduce((s, v) => s + v.lucro, 0)
}

export function totalDebitos(clientes, vendas, pagamentos) {
  return clientes.reduce(
    (s, c) => s + debitoDoCliente(c.id, vendas, pagamentos),
    0,
  )
}

// Ranking de produtos mais vendidos (por quantidade) dentro de uma lista de vendas
export function produtosMaisVendidos(vendasFiltradas, limite = 5) {
  const mapa = {}
  for (const v of vendasFiltradas) {
    for (const item of v.itens) {
      if (!mapa[item.produtoId]) {
        mapa[item.produtoId] = { nome: item.nome, quantidade: 0, total: 0 }
      }
      mapa[item.produtoId].quantidade += item.quantidade
      mapa[item.produtoId].total += item.precoVenda * item.quantidade
    }
  }
  return Object.values(mapa)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limite)
}

// Ranking de clientes que mais compraram (por valor) dentro de uma lista de vendas
export function clientesQueMaisCompraram(vendasFiltradas, clientes, limite = 5) {
  const mapa = {}
  for (const v of vendasFiltradas) {
    const id = v.clienteId || 'avulso'
    const nome = v.clienteId
      ? clientes.find((c) => c.id === v.clienteId)?.nome || v.clienteNome
      : 'Venda avulsa'
    if (!mapa[id]) mapa[id] = { nome, total: 0, compras: 0 }
    mapa[id].total += v.total
    mapa[id].compras += 1
  }
  return Object.values(mapa)
    .sort((a, b) => b.total - a.total)
    .slice(0, limite)
}
