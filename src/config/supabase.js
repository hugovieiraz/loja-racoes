import { createClient } from '@supabase/supabase-js'

// Preencha com os dados do seu projeto Supabase (Settings -> API)
const URL_SUPABASE = 'COLE_AQUI_A_URL'
const CHAVE_PUBLICA = 'COLE_AQUI_A_CHAVE_ANON'

export const supabaseConfigurado = !URL_SUPABASE.includes('COLE_AQUI')
export const supabase = supabaseConfigurado ? createClient(URL_SUPABASE, CHAVE_PUBLICA) : null
