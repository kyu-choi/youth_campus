insert into public.dates (
  title,
  event_date,
  program_type,
  is_active,
  display_order
)
values (
  '2026년 8월 9일 (일)',
  '2026-08-09',
  '다대다 로테이션 소개팅',
  true,
  20260809
)
on conflict (program_type, event_date) do update
set title = excluded.title,
    is_active = excluded.is_active,
    display_order = excluded.display_order;

notify pgrst, 'reload schema';
