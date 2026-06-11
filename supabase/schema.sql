-- Execute este script no Supabase: SQL Editor -> New query -> colar -> Run
-- Cria a tabela que guarda os dados da loja (um conjunto por conta)

create table if not exists public.dados_loja (
  user_id uuid primary key references auth.users (id) on delete cascade,
  conteudo jsonb not null,
  atualizado_em timestamptz not null default now()
);

alter table public.dados_loja enable row level security;

-- Cada usuário só enxerga e altera os próprios dados
create policy "dono_le" on public.dados_loja for select using (auth.uid() = user_id);
create policy "dono_insere" on public.dados_loja for insert with check (auth.uid() = user_id);
create policy "dono_atualiza" on public.dados_loja for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono_apaga" on public.dados_loja for delete using (auth.uid() = user_id);
