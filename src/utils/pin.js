// PIN de bloqueio do app (guardado como hash, nunca em texto puro)

const CHAVE_PIN = 'lojaRacoes:pin'

async function calcularHash(texto) {
  const dados = new TextEncoder().encode(`lamartine:${texto}`)
  const resumo = await crypto.subtle.digest('SHA-256', dados)
  return [...new Uint8Array(resumo)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function pinAtivo() {
  return !!localStorage.getItem(CHAVE_PIN)
}

export async function definirPin(pin) {
  localStorage.setItem(CHAVE_PIN, await calcularHash(pin))
}

export function removerPin() {
  localStorage.removeItem(CHAVE_PIN)
}

export async function conferirPin(pin) {
  return localStorage.getItem(CHAVE_PIN) === (await calcularHash(pin))
}
