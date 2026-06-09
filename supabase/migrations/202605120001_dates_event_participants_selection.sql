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

alter table public.dates
  add column if not exists title text,
  add column if not exists event_date text,
  add column if not exists program_type text not null default '다대다 로테이션 소개팅',
  add column if not exists location text,
  add column if not exists max_male integer,
  add column if not exists max_female integer,
  add column if not exists is_active boolean not null default true,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists dates_program_event_date_idx
  on public.dates (program_type, event_date);

create index if not exists dates_active_order_idx
  on public.dates (is_active, display_order, created_at);

insert into public.dates (title, event_date, program_type, display_order)
select distinct preferred_date, preferred_date, '다대다 로테이션 소개팅', 0
from public.application_submissions
where preferred_date is not null
  and preferred_date <> ''
on conflict (program_type, event_date) do nothing;

alter table public.application_submissions
  add column if not exists date_id uuid references public.dates(id) on delete set null,
  add column if not exists selection_status text not null default 'pending',
  add column if not exists rejected_at timestamptz,
  add column if not exists selected_at timestamptz;

update public.application_submissions submission
set date_id = dates.id
from public.dates dates
where submission.date_id is null
  and submission.preferred_date = dates.event_date
  and coalesce(submission.program_type, '다대다 로테이션 소개팅') = dates.program_type;

alter table public.application_submissions
  drop constraint if exists application_submissions_selection_status_check;

alter table public.application_submissions
  add constraint application_submissions_selection_status_check
  check (selection_status in ('pending', 'selected', 'rejected'));

create index if not exists application_submissions_date_id_idx
  on public.application_submissions (date_id);

create index if not exists application_submissions_selection_status_idx
  on public.application_submissions (selection_status, rejected_at);

create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references public.dates(id) on delete cascade,
  submission_id uuid not null references public.application_submissions(id) on delete cascade,
  participant_number text,
  nickname text,
  attendance_status text not null default 'pending',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_participants
  add column if not exists date_id uuid references public.dates(id) on delete cascade,
  add column if not exists submission_id uuid references public.application_submissions(id) on delete cascade,
  add column if not exists participant_number text,
  add column if not exists nickname text,
  add column if not exists attendance_status text not null default 'pending',
  add column if not exists checked_in_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.event_participants
  drop constraint if exists event_participants_attendance_status_check;

alter table public.event_participants
  add constraint event_participants_attendance_status_check
  check (attendance_status in ('pending', 'attended', 'absent'));

create unique index if not exists event_participants_date_submission_idx
  on public.event_participants (date_id, submission_id);

create unique index if not exists event_participants_date_number_idx
  on public.event_participants (date_id, participant_number)
  where participant_number is not null and participant_number <> '';

create index if not exists event_participants_date_idx
  on public.event_participants (date_id, created_at);

create or replace view public.event_participant_public as
select
  participant.id,
  participant.date_id,
  participant.submission_id,
  participant.participant_number,
  participant.nickname,
  submission.name,
  submission.kakao_id,
  submission.gender
from public.event_participants participant
join public.application_submissions submission
  on submission.id = participant.submission_id
where submission.selection_status = 'selected';

alter table public.review_submissions
  add column if not exists date_id uuid references public.dates(id) on delete set null,
  add column if not exists reviewer_participant_id uuid references public.event_participants(id) on delete set null,
  add column if not exists reviewer_submission_id uuid references public.application_submissions(id) on delete set null,
  add column if not exists reviewer_nickname text,
  add column if not exists first_choice_participant_id uuid references public.event_participants(id) on delete set null,
  add column if not exists first_choice_name text,
  add column if not exists first_choice_nickname text,
  add column if not exists first_choice_kakao_id text,
  add column if not exists second_choice_participant_id uuid references public.event_participants(id) on delete set null,
  add column if not exists second_choice_name text,
  add column if not exists second_choice_nickname text,
  add column if not exists second_choice_kakao_id text,
  add column if not exists third_choice_participant_id uuid references public.event_participants(id) on delete set null,
  add column if not exists third_choice_name text,
  add column if not exists third_choice_nickname text,
  add column if not exists third_choice_kakao_id text;

create or replace view public.review_event_dates as
select id, event_date, title, program_type, display_order
from public.dates
where is_active = true
order by display_order asc, created_at asc;

grant select on public.review_event_dates to anon;

create or replace function public.delete_expired_rejected_submissions()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.application_submissions
  where selection_status = 'rejected'
    and rejected_at is not null
    and rejected_at < now() - interval '30 days';
$$;

alter table public.dates enable row level security;
alter table public.event_participants enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
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

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dates'
      and policyname = 'Allow admins to manage dates'
  ) then
    create policy "Allow admins to manage dates"
      on public.dates
      for all
      to authenticated
      using (public.is_application_admin())
      with check (public.is_application_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_participants'
      and policyname = 'Allow admins to manage event participants'
  ) then
    create policy "Allow admins to manage event participants"
      on public.event_participants
      for all
      to authenticated
      using (public.is_application_admin())
      with check (public.is_application_admin());
  end if;
end $$;

grant select on public.dates to anon;
grant select on public.event_participant_public to anon;
grant select, insert, update on public.dates to authenticated;
grant select, insert, update on public.event_participants to authenticated;
grant execute on function public.delete_expired_rejected_submissions() to authenticated;

grant update (
  payment_status,
  matching_status,
  match_group,
  matched_with,
  admin_note,
  score,
  reviewed_at,
  date_id,
  preferred_date,
  selection_status,
  rejected_at,
  selected_at
) on public.application_submissions to authenticated;

do $$
begin
  begin
    create extension if not exists pg_cron with schema extensions;
    perform cron.schedule(
      'delete-expired-rejected-application-submissions',
      '20 3 * * *',
      'select public.delete_expired_rejected_submissions();'
    )
    where not exists (
      select 1
      from cron.job
      where jobname = 'delete-expired-rejected-application-submissions'
    );
  exception
    when insufficient_privilege or undefined_file or invalid_schema_name then
      null;
  end;
end $$;

notify pgrst, 'reload schema';
