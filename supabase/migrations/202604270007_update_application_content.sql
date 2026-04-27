do $$
begin
  if to_regclass('public.landing_content') is not null then
    update public.landing_content
    set contact_url = 'http://pf.kakao.com/_BxcVTX'
    where is_active = true
       or contact_url is null
       or contact_url = 'http://pf.kakao.com/_DGhCX';
  end if;
end $$;

update public.application_submissions
set preferred_date = '5월 2일 (토) 오후 3시'
where preferred_date = '5월 2일 (토) 오후 1시';

update public.application_submissions
set payload = jsonb_set(
  payload,
  '{preferred_date}',
  to_jsonb('5월 2일 (토) 오후 3시'::text),
  true
)
where payload->>'preferred_date' = '5월 2일 (토) 오후 1시';

notify pgrst, 'reload schema';
