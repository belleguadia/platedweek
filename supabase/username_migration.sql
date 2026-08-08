-- Unique usernames + availability check for cross-device sign-in
-- Run in Supabase SQL editor

create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

create or replace function check_username_available(desired_username text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(desired_username)) < 3 then
    return false;
  end if;

  return not exists (
    select 1
    from profiles
    where lower(username) = lower(trim(desired_username))
  );
end;
$$;

grant execute on function check_username_available(text) to anon, authenticated;
