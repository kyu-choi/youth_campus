update public.dates
set is_active = false
where program_type = '다대다 로테이션 소개팅'
  and event_date not in ('2026-08-09', '2026-08-23');

insert into public.dates (
  title,
  event_date,
  program_type,
  is_active,
  display_order
)
values
  (
    '8월 9일 (일)',
    '2026-08-09',
    '다대다 로테이션 소개팅',
    true,
    1
  ),
  (
    '8월 23일 (일)',
    '2026-08-23',
    '다대다 로테이션 소개팅',
    true,
    2
  )
on conflict (program_type, event_date) do update
set title = excluded.title,
    is_active = excluded.is_active,
    display_order = excluded.display_order;

notify pgrst, 'reload schema';
