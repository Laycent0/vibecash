-- 1. Таблица зашифрованных состояний
create table if not exists public.vibecash_states (
  user_id text primary key,
  state_json jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Включаем жесткий Row Level Security (RLS)
alter table public.vibecash_states enable row level security;
drop policy if exists "Allow public sync by user_id" on public.vibecash_states;
drop policy if exists "Vault header lock" on public.vibecash_states;

-- 3. Запрещаем чтение/запись без точного крипто-токена в заголовке x-vault-key
create policy "Vault header lock"
  on public.vibecash_states
  for all
  using (
    user_id = coalesce(
      current_setting('request.headers', true)::json->>'x-vault-key',
      ''
    )
  )
  with check (
    user_id = coalesce(
      current_setting('request.headers', true)::json->>'x-vault-key',
      ''
    )
  );
