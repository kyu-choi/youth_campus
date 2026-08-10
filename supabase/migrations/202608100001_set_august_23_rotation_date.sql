create table if not exists public.dates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date text not null,
  program_type text not null default '다대다 로테이션 소개팅',
  location text,
  max_male integer,
  max_female integer,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists dates_program_event_date_idx
  on public.dates (program_type, event_date);

create index if not exists dates_active_order_idx
  on public.dates (is_active, display_order, created_at);

update public.dates
set is_active = false
where program_type = '다대다 로테이션 소개팅'
  and event_date <> '2026-08-23';

insert into public.dates (
  title,
  event_date,
  program_type,
  is_active,
  display_order
)
values (
  '8월 23일 (일)',
  '2026-08-23',
  '다대다 로테이션 소개팅',
  true,
  1
)
on conflict (program_type, event_date) do update
set title = excluded.title,
    is_active = excluded.is_active,
    display_order = excluded.display_order;

alter table public.dates enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dates'
      and policyname = 'Allow public active date reads'
  ) then
    create policy "Allow public active date reads"
      on public.dates
      for select
      to anon
      using (is_active = true);
  end if;
end $$;

grant select on public.dates to anon;

notify pgrst, 'reload schema';
