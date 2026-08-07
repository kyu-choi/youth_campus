update public.dates
set is_active = false
where program_type = '다대다 로테이션 소개팅'
  and event_date <> '2026-08-16';

insert into public.dates (
  title,
  event_date,
  program_type,
  is_active,
  display_order
)
values (
  '8월 16일 (일)',
  '2026-08-16',
  '다대다 로테이션 소개팅',
  true,
  1
)
on conflict (program_type, event_date) do update
set title = excluded.title,
    is_active = excluded.is_active,
    display_order = excluded.display_order;

notify pgrst, 'reload schema';
