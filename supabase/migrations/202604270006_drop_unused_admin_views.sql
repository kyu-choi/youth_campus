drop view if exists public.application_admin_view;
drop view if exists public.application_form_responses_view;
drop view if exists public.application_response_summary_view;
drop view if exists public.application_drink_summary_view;

drop table if exists public.application_matches;

notify pgrst, 'reload schema';
