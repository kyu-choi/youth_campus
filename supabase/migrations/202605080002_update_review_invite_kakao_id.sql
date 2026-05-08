alter table public.review_submissions
  add column if not exists invite_kakao_id text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'review_submissions'
      and column_name = 'phone_last4'
  ) then
    update public.review_submissions
    set invite_kakao_id = coalesce(nullif(invite_kakao_id, ''), nullif(phone_last4, ''))
    where invite_kakao_id is null
      and phone_last4 is not null;
  end if;
end $$;

alter table public.review_submissions
  drop column if exists phone_last4,
  drop column if exists conversation_time,
  drop column if exists had_discomfort,
  drop column if exists discomfort_detail;
