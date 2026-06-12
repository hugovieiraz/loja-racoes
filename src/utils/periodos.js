// Períodos de análise: semana, mês e ano
import { chaveDia } from './formato.js'

// Limites do período: semana começa na segunda-feira.
// ref: 'AAAA-MM-DD' (semana) | 'AAAA-MM' (mês) | 'AAAA' (ano)
export function limitesPeriodo(tipo, ref) {
  if (tipo === 'semana') {
    const d = new Date(`${ref}T12:00:00`)
    const diaSemana = (d.getDay() + 6) % 7 // segunda = 0
    const inicio = new Date(d)
    inicio.setDate(d.getDate() - diaSemana)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 7)
    return { inicio, fim }
  }
  if (tipo === 'mes') {
    const [ano, mes] = ref.split('-').map(Number)
    return { inicio: new Date(ano, mes - 1, 1), fim: new Date(ano, mes, 1) }
  }
  const ano = Number(ref)
  return { inicio: new Date(ano, 0, 1), fim: new Date(ano + 1, 0, 1) }
}

export function vendasNoPeriodo(vendas, tipo, ref) {
  const { inicio, fim } = limitesPeriodo(tipo, ref)
  return vendas.filter((v) => {
    const d = new Date(v.data)
    return d >= inicio && d < fim
  })
}

// Referência do período imediatamente anterior (para comparações)
export function referenciaAnterior(tipo, ref) {
  if (tipo === 'semana') {
    const d = new Date(`${ref}T12:00:00`)
    d.setDate(d.getDate() - 7)
    return chaveDia(d.toISOString())
  }
  if (tipo === 'mes') {
    const [ano, mes] = ref.split('-').map(Number)
    const d = new Date(ano, mes - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return String(Number(ref) - 1)
}

export function rotuloPeriodo(tipo, ref) {
  if (tipo === 'semana') {
    const { inicio, fim } = limitesPeriodo(tipo, ref)
    const ultimoDia = new Date(fim)
    ultimoDia.setDate(ultimoDia.getDate() - 1)
    return `${inicio.toLocaleDateString('pt-BR')} a ${ultimoDia.toLocaleDateString('pt-BR')}`
  }
  if (tipo === 'mes') {
    const [ano, mes] = ref.split('-').map(Number)
    return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }
  return `ano de ${ref}`
}

// Converte o texto do peso do produto ("15 kg", "900 g", "20,5kg") em quilos
export function pesoEmKg(textoPeso) {
  const m = String(textoPeso || '').replace(',', '.').match(/([\d.]+)\s*(kg|g|quilos?|kilos?)?/i)
  if (!m) return 0
  const numero = parseFloat(m[1])
  if (Number.isNaN(numero)) return 0
  const unidade = (m[2] || 'kg').toLowerCase()
  return unidade === 'g' ? numero / 1000 : numero
}
