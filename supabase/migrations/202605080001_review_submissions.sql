create table if not exists public.review_submissions (
  id uuid primary key default gen_random_uuid(),
  event_date text,
  reviewer_name text,
  phone_last4 text,
  participant_gender text,
  participant_number text,
  overall_satisfaction text,
  conversation_time text,
  traffic_source text,
  has_after_interest text,
  first_choice text,
  second_choice text,
  third_choice text,
  choice_reason text,
  good_points text,
  improvement_points text,
  next_participation text,
  had_discomfort text,
  discomfort_detail text,
  operation_consent boolean not null default false,
  contact_share_consent boolean not null default false,
  one_way_private_confirmed boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.review_submissions
  add column if not exists event_date text,
  add column if not exists reviewer_name text,
  add column if not exists phone_last4 text,
  add column if not exists participant_gender text,
  add column if not exists participant_number text,
  add column if not exists overall_satisfaction text,
  add column if not exists conversation_time text,
  add column if not exists traffic_source text,
  add column if not exists has_after_interest text,
  add column if not exists first_choice text,
  add column if not exists second_choice text,
  add column if not exists third_choice text,
  add column if not exists choice_reason text,
  add column if not exists good_points text,
  add column if not exists improvement_points text,
  add column if not exists next_participation text,
  add column if not exists had_discomfort text,
  add column if not exists discomfort_detail text,
  add column if not exists operation_consent boolean not null default false,
  add column if not exists contact_share_consent boolean not null default false,
  add column if not exists one_way_private_confirmed boolean not null default false,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists review_submissions_created_at_idx
  on public.review_submissions (created_at desc);

create index if not exists review_submissions_event_date_idx
  on public.review_submissions (event_date);

create index if not exists review_submissions_participant_number_idx
  on public.review_submissions (participant_number);

create index if not exists review_submissions_first_choice_idx
  on public.review_submissions (first_choice);

alter table public.review_submissions enable row level security;

create or replace view public.review_event_dates as
select distinct event_date
from (
  select nullif(coalesce(preferred_date, payload->>'preferred_date'), '') as event_date
  from public.application_submissions
) dates
where event_date is not null;

grant select on public.review_event_dates to anon;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'review_submissions'
      and policyname = 'Allow public review inserts'
  ) then
    create policy "Allow public review inserts"
      on public.review_submissions
      for insert
      to anon
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'review_submissions'
      and policyname = 'Allow admins to read review submissions'
  ) then
    create policy "Allow admins to read review submissions"
      on public.review_submissions
      for select
      to authenticated
      using (public.is_application_admin());
  end if;
end $$;

grant insert on public.review_submissions to anon;
grant select on public.review_submissions to authenticated;
