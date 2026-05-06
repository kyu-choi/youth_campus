alter table public.application_submissions
  drop column if exists participation_type,
  drop column if exists phone_confirm;

notify pgrst, 'reload schema';
