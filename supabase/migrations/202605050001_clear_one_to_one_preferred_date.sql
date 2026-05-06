update public.application_submissions
set
  preferred_date = null,
  payload = payload - 'preferred_date'
where coalesce(program_type, payload->>'program_type') = '1:1 카톡 소개팅';

notify pgrst, 'reload schema';
