# VibeCash v3.0 — Telegram Mini App (TMA) & PWA Финансовый Трекер

Светлый минималистичный финансовый трекер для Telegram Mini Apps и браузера с поддержкой офлайн-режима (PWA), сквозного шифрования `AES-GCM 256` и единого облачного бэкенда Supabase.

## Что нового в v3.0
1. **Повторяющиеся платежи и подписки** — учёт аренды, связи, интернета и VPN с автоматической проводкой по расписанию (ежемесячно / еженедельно) и ручным списанием в 1 тап.
2. **Переводы между счетами (`⇄ Перевод`)** — перевод средств с карты на наличные или накопительный счёт без искажения статистики доходов/расходов.
3. **Редактирование любой транзакции** — клик по любой операции (или иконке `✎`) открывает форму редактирования суммы, типа, счета, категории, комментария и даты.
4. **Расширенный поиск и фильтрация** — фильтр по тексту, категории, типу операции, диапазону дат (`Дата от` / `Дата до`) и диапазону сумм (`Сумма мин.` / `Сумма макс.`).
5. **Бюджеты по категориям с уведомлениями** — автоматические предупреждения на дашборде и в отчётах при достижении `80%` и превышении `100%` месячного лимита категории.
6. **Импорт банковских выписок (CSV)** — загрузка файлов выписок Т-Банка (Тинькофф), Сбера и универсальных CSV с автоопределением дат, сумм и категорий по ключевым словам.
7. **Бот-уведомления и еженедельная сводка** — генерация и отправка отчёта за 7 дней напрямую в Telegram-чат через Bot API или `Telegram.WebApp.sendData`.
8. **Офлайн-режим и PWA** — `sw.js` и `manifest.json` кэшируют приложение для работы без интернета.
9. **Автотесты (`tests.js`)** — unit-тесты для `parseSmartPhrase`, `evaluateMathInput`, `calculateAccountBalance` (включая переводы) и `parseBankCsvLines`.

---

## Настройка таблицы в Supabase (SQL)

Выполните этот скрипт один раз в **SQL Editor** вашего проекта Supabase:

```sql
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
```

## Запуск unit-тестов

```bash
node tests.js
```

## Деплой на GitHub + Vercel
1. Загрузите файлы `index.html`, `sw.js`, `manifest.json`, `vercel.json`, `README.md`, `tests.js` в репозиторий `Laycent0/vibecash`.
2. Импортируйте репозиторий в Vercel — деплой произойдет автоматически.
