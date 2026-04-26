create table if not exists public.application_submissions (
  id uuid primary key default gen_random_uuid(),
  applicant_name text,
  applicant_phone text,
  preferred_date text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.application_submissions enable row level security;

create policy "Allow public application inserts"
  on public.application_submissions
  for insert
  to anon
  with check (true);
