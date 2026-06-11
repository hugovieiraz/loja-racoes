import { supabase } from '../config/supabase.js'

// Sincronização com a nuvem (Supabase).
// Os dados continuam no celular (funciona offline); quando há internet,
// o app envia/baixa o conjunto completo e mescla registro por registro,
// vencendo sempre a versão mais recente (campo atualizadoEm).

const COLECOES = ['produtos', 'clientes', 'vendas', 'pagamentos']

function instante(registro) {
  return registro?.atualizadoEm || registro?.data || '1970-01-01'
}

// Mescla dois conjuntos de dados, registro por registro.
export function mesclarDados(local, remoto) {
  const resultado = {}

  // Exclusões: união das duas listas (limitada aos 500 itens mais recentes)
  const excluidos = [...(local.excluidos || []), ...(remoto.excluidos || [])]
  const vistos = new Set()
  resultado.excluidos = excluidos
    .filter((e) => {
      const chave = `${e.colecao}:${e.id}`
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })
    .sort((a, b) => (b.em || '').localeCompare(a.em || ''))
    .slice(0, 500)

  for (const colecao of COLECOES) {
    const mapa = new Map()
    for (const registro of remoto[colecao] || []) mapa.set(registro.id, registro)
    for (const registro of local[colecao] || []) {
      const existente = mapa.get(registro.id)
      if (!existente || instante(registro) >= instante(existente)) {
        mapa.set(registro.id, registro)
      }
    }
    // Aplica exclusões: remove registros apagados depois da última alteração
    resultado[colecao] = [...mapa.values()].filter((registro) => {
      const exclusao = resultado.excluidos.find(
        (e) => e.colecao === colecao && e.id === registro.id,
      )
      return !exclusao || (exclusao.em || '') < instante(registro)
    })
  }

  return resultado
}

// Baixa os dados da nuvem (null se ainda não existem)
export async function baixarDaNuvem(usuarioId) {
  const { data, error } = await supabase
    .from('dados_loja')
    .select('conteudo')
    .eq('user_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data?.conteudo || null
}

// Envia os dados para a nuvem (substitui o conjunto do usuário)
export async function enviarParaNuvem(usuarioId, dados) {
  const { error } = await supabase.from('dados_loja').upsert(
    {
      user_id: usuarioId,
      conteudo: dados,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) throw error
}
