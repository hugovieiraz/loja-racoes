// Cobrança pelo WhatsApp: monta o link wa.me com a mensagem pronta

export function linkWhatsApp(telefone, mensagem) {
  const digitos = String(telefone || '').replace(/\D/g, '')
  if (digitos.length < 10) return null
  // Acrescenta o código do Brasil se não tiver
  const completo = digitos.length <= 11 ? `55${digitos}` : digitos
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`
}

export function mensagemCobranca(nome, valorFormatado) {
  const primeiroNome = String(nome || '').split(' ')[0]
  return (
    `Olá, ${primeiroNome}! Tudo bem? 🙂\n\n` +
    `Passando para lembrar que consta um saldo pendente de *${valorFormatado}* aqui na Lamartine Rações.\n\n` +
    `Quando puder passar para acertar, agradecemos! Qualquer dúvida é só responder por aqui.`
  )
}
