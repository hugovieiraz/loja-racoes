import { chaveDia } from './formato.js'

const CHAVE_ULTIMO_BACKUP = 'lojaRacoes:ultimoBackup'
const DIAS_LEMBRETE = 7

// Baixa um arquivo JSON com todos os dados e registra a data do backup.
export function exportarBackup({ produtos, clientes, vendas, pagamentos }) {
  const backup = {
    produtos,
    clientes,
    vendas,
    pagamentos,
    exportadoEm: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `backup-loja-${chaveDia()}.json`
  link.click()
  URL.revokeObjectURL(url)
  try {
    localStorage.setItem(CHAVE_ULTIMO_BACKUP, new Date().toISOString())
  } catch {
    /* não crítico */
  }
}

// Mostra lembrete se nunca exportou (ou há mais de 7 dias) e já existem dados.
export function precisaLembrarBackup(temDados) {
  if (!temDados) return false
  try {
    const ultimo = localStorage.getItem(CHAVE_ULTIMO_BACKUP)
    if (!ultimo) return true
    const dias = (Date.now() - new Date(ultimo).getTime()) / (1000 * 60 * 60 * 24)
    return dias >= DIAS_LEMBRETE
  } catch {
    return false
  }
}
