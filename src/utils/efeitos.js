// Efeitos de som e vibração — feedback ao registrar dinheiro entrando.

const CHAVE_SONS = 'lojaRacoes:sons'
const CHAVE_TEMA = 'lojaRacoes:tema'

export function sonsAtivos() {
  return localStorage.getItem(CHAVE_SONS) !== 'nao'
}

export function alternarSons() {
  localStorage.setItem(CHAVE_SONS, sonsAtivos() ? 'nao' : 'sim')
  return sonsAtivos()
}

let contextoAudio = null

// Som de "caixa registradora": duas notas curtas e brilhantes
export function tocarSomDinheiro() {
  if (!sonsAtivos()) return
  try {
    contextoAudio = contextoAudio || new (window.AudioContext || window.webkitAudioContext)()
    const ctx = contextoAudio
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    const notas = [
      [1318.5, 0],     // Mi 6
      [1760.0, 0.09],  // Lá 6
    ]
    for (const [frequencia, atraso] of notas) {
      const osc = ctx.createOscillator()
      const ganho = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = frequencia
      ganho.gain.setValueAtTime(0.0001, t + atraso)
      ganho.gain.exponentialRampToValueAtTime(0.22, t + atraso + 0.015)
      ganho.gain.exponentialRampToValueAtTime(0.0001, t + atraso + 0.5)
      osc.connect(ganho)
      ganho.connect(ctx.destination)
      osc.start(t + atraso)
      osc.stop(t + atraso + 0.55)
    }
  } catch {
    /* sem áudio disponível */
  }
}

export function vibrar(padrao = [40, 50, 40]) {
  try {
    navigator.vibrate?.(padrao)
  } catch {
    /* sem vibração disponível */
  }
}

// Som + vibração juntos (venda confirmada, pagamento recebido)
export function efeitoDinheiro() {
  tocarSomDinheiro()
  vibrar()
}

export function vibrarErro() {
  vibrar([80, 40, 80])
}

// ---------- Tema ----------
export function temaEscuroAtivo() {
  return document.documentElement.classList.contains('dark')
}

export function alternarTema() {
  const escuro = document.documentElement.classList.toggle('dark')
  localStorage.setItem(CHAVE_TEMA, escuro ? 'escuro' : 'claro')
  return escuro
}
