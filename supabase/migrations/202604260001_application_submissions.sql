create table if not exists public.application_submissions (
  id uuid primary key default gen_random_uuid(),
  applicant_name text,
  applicant_phone text,
  kakao_id text,
  gender text,
  birth_year integer,
  region text,
  school text,
  program_type text,
  preferred_date text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.application_submissions
  add column if not exists kakao_id text,
  add column if not exists gender text,
  add column if not exists birth_year integer,
  add column if not exists region text,
  add column if not exists school text,
  add column if not exists program_type text;

create index if not exists application_submissions_created_at_idx
  on public.application_submissions (created_at desc);

create index if not exists application_submissions_preferred_date_idx
  on public.application_submissions (preferred_date);

create index if not exists application_submissions_program_type_idx
  on public.application_submissions (program_type);

alter table public.application_submissions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'application_submissions'
      and policyname = 'Allow public application inserts'
  ) then
    create policy "Allow public application inserts"
      on public.application_submissions
      for insert
      to anon
      with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('application-files', 'application-files', false, 10485760)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow public application file uploads'
  ) then
    create policy "Allow public application file uploads"
      on storage.objects
      for insert
      to anon
      with check (bucket_id = 'application-files');
  end if;
end $$;
