create table if not exists public.admin_users (
  email text primary key,
  name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_application_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where email = auth.email()
      and is_active = true
  );
$$;

revoke all on function public.is_application_admin() from public;
revoke all on function public.is_application_admin() from anon;
grant execute on function public.is_application_admin() to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
      and policyname = 'Allow admins to read admin users'
  ) then
    create policy "Allow admins to read admin users"
      on public.admin_users
      for select
      to authenticated
      using (public.is_application_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'application_submissions'
      and policyname = 'Allow admins to read submissions'
  ) then
    create policy "Allow admins to read submissions"
      on public.application_submissions
      for select
      to authenticated
      using (public.is_application_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'application_submissions'
      and policyname = 'Allow admins to update submissions'
  ) then
    create policy "Allow admins to update submissions"
      on public.application_submissions
      for update
      to authenticated
      using (public.is_application_admin())
      with check (public.is_application_admin());
  end if;
end $$;

grant select, update on public.application_submissions to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow admins to read application files'
  ) then
    create policy "Allow admins to read application files"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'application-files'
        and public.is_application_admin()
      );
  end if;
end $$;
