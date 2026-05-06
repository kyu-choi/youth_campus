alter table public.application_submissions
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists privacy_confirmed boolean,
  add column if not exists companion_name text,
  add column if not exists major text,
  add column if not exists residence text,
  add column if not exists job text,
  add column if not exists height integer,
  add column if not exists weight integer,
  add column if not exists smoking text,
  add column if not exists religion text,
  add column if not exists preferred_age text,
  add column if not exists avoided_age text,
  add column if not exists avoided_person text,
  add column if not exists ideal_type text,
  add column if not exists self_intro text,
  add column if not exists drink text,
  add column if not exists drink_temperature text,
  add column if not exists employment_files jsonb not null default '[]'::jsonb,
  add column if not exists profile_photos jsonb not null default '[]'::jsonb,
  add column if not exists student_status_confirmed boolean,
  add column if not exists after_meeting_confirmed boolean,
  add column if not exists refund_confirmed boolean,
  add column if not exists kakao_required_confirmed boolean,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists matching_status text,
  add column if not exists match_group text,
  add column if not exists matched_with uuid references public.application_submissions(id),
  add column if not exists admin_note text,
  add column if not exists score integer,
  add column if not exists reviewed_at timestamptz;

update public.application_submissions
set
  name = coalesce(name, applicant_name, payload->>'name'),
  phone = coalesce(phone, applicant_phone, payload->>'phone'),
  privacy_confirmed = coalesce(privacy_confirmed, (payload->>'privacy_confirmed')::boolean),
  companion_name = coalesce(companion_name, payload->>'companion_name'),
  major = coalesce(major, payload->>'major'),
  residence = coalesce(residence, payload->>'residence'),
  job = coalesce(job, payload->>'job'),
  height = coalesce(
    height,
    case when payload->>'height' ~ '^[0-9]+$' then (payload->>'height')::integer else null end
  ),
  weight = coalesce(
    weight,
    case when payload->>'weight' ~ '^[0-9]+$' then (payload->>'weight')::integer else null end
  ),
  smoking = coalesce(smoking, payload->>'smoking'),
  religion = coalesce(religion, payload->>'religion'),
  preferred_age = coalesce(preferred_age, payload->>'preferred_age'),
  avoided_age = coalesce(avoided_age, payload->>'avoided_age'),
  avoided_person = coalesce(avoided_person, payload->>'avoided_person'),
  ideal_type = coalesce(ideal_type, payload->>'ideal_type'),
  self_intro = coalesce(self_intro, payload->>'self_intro'),
  drink = coalesce(drink, payload->>'drink'),
  drink_temperature = coalesce(drink_temperature, payload->>'drink_temperature'),
  employment_files = case
    when employment_files = '[]'::jsonb
      then coalesce(payload->'uploaded_files'->'employment_file_names', '[]'::jsonb)
    else employment_files
  end,
  profile_photos = case
    when profile_photos = '[]'::jsonb
      then coalesce(payload->'uploaded_files'->'profile_photo_names', '[]'::jsonb)
    else profile_photos
  end,
  student_status_confirmed = coalesce(student_status_confirmed, (payload->>'student_status_confirmed')::boolean),
  after_meeting_confirmed = coalesce(after_meeting_confirmed, (payload->>'after_meeting_confirmed')::boolean),
  refund_confirmed = coalesce(refund_confirmed, (payload->>'refund_confirmed')::boolean),
  kakao_required_confirmed = coalesce(kakao_required_confirmed, (payload->>'kakao_required_confirmed')::boolean)
where payload is not null;

update public.application_submissions
set
  applicant_name = coalesce(applicant_name, name),
  applicant_phone = coalesce(applicant_phone, phone);

create index if not exists application_submissions_payment_status_idx
  on public.application_submissions (payment_status);

create index if not exists application_submissions_matching_status_idx
  on public.application_submissions (matching_status);

create index if not exists application_submissions_name_idx
  on public.application_submissions (name);

create index if not exists application_submissions_phone_idx
  on public.application_submissions (phone);

grant insert on public.application_submissions to anon;
grant select on public.application_submissions to authenticated;
grant update (
  payment_status,
  matching_status,
  match_group,
  matched_with,
  admin_note,
  score,
  reviewed_at
) on public.application_submissions to authenticated;

notify pgrst, 'reload schema';
