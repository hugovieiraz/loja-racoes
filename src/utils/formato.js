// Utilitários de formatação. Valores monetários são guardados em CENTAVOS (inteiro).

export function formatarMoeda(centavos) {
  return ((centavos || 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// Converte texto digitado ("25,50" ou "25.50") para centavos.
export function lerMoeda(texto) {
  let t = String(texto ?? '').trim()
  if (!t) return 0
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(t)
  return Number.isNaN(n) ? 0 : Math.round(n * 100)
}

// Centavos -> texto para preencher campos de edição ("25,50")
export function moedaParaCampo(centavos) {
  if (!centavos && centavos !== 0) return ''
  return ((centavos || 0) / 100).toFixed(2).replace('.', ',')
}

export function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatarDataHora(iso) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

// "2026-06-11" no fuso local (para comparar com <input type="date">)
export function chaveDia(iso) {
  const d = iso ? new Date(iso) : new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

// "2026-06" no fuso local (para comparar com <input type="month">)
export function chaveMes(iso) {
  return chaveDia(iso).slice(0, 7)
}

export const FORMAS_PAGAMENTO = [
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'cartao', rotulo: 'Cartão' },
  { valor: 'fiado', rotulo: 'Fiado' },
]

export function rotuloPagamento(valor) {
  return FORMAS_PAGAMENTO.find((f) => f.valor === valor)?.rotulo || valor
}
