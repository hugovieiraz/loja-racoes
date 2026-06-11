// Perfil de uso do app no aparelho:
// - dono: vê tudo (vendas, lucro, relatórios)
// - funcionario: registra vendas/pagamentos, mas NÃO vê totais nem lucro
// A troca para "dono" exige o PIN.

const CHAVE_PERFIL = 'lojaRacoes:perfil'

export function ehDono() {
  return localStorage.getItem(CHAVE_PERFIL) !== 'funcionario'
}

export function ativarModoFuncionario() {
  localStorage.setItem(CHAVE_PERFIL, 'funcionario')
}

export function ativarModoDono() {
  localStorage.setItem(CHAVE_PERFIL, 'dono')
}
