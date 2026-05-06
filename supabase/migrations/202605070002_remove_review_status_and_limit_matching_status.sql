alter table public.application_submissions
  drop column if exists status;

alter table public.application_submissions
  alter column matching_status drop default,
  alter column matching_status drop not null;

update public.application_submissions
set matching_status = case
  when program_type = '1:1 카톡 소개팅'
    then coalesce(matching_status, 'unmatched')
  else null
end;

alter table public.application_submissions
  drop constraint if exists application_submissions_matching_status_program_check;

alter table public.application_submissions
  add constraint application_submissions_matching_status_program_check
  check (
    (
      program_type = '1:1 카톡 소개팅'
      and matching_status in ('unmatched', 'candidate', 'matched', 'notified', 'cancelled')
    )
    or
    (
      (program_type is null or program_type <> '1:1 카톡 소개팅')
      and matching_status is null
    )
  );

notify pgrst, 'reload schema';
