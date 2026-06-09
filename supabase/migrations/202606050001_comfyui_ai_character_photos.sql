alter table public.application_submissions
  add column if not exists ai_character_photos jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow admins to upload application files'
  ) then
    create policy "Allow admins to upload application files"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'application-files'
        and public.is_application_admin()
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow admins to update application files'
  ) then
    create policy "Allow admins to update application files"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'application-files'
        and public.is_application_admin()
      )
      with check (
        bucket_id = 'application-files'
        and public.is_application_admin()
      );
  end if;
end $$;
