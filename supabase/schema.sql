-- Plated Week schema (with auth)
-- Run this in the Supabase SQL editor for a new project

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  title text not null default '',
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals (id) on delete cascade,
  title text not null default '',
  instructions text,
  category text not null default 'food'
    check (category in ('food', 'dessert', 'drinks', 'appetizer', 'side', 'other')),
  created_at timestamptz not null default now()
);

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  name text not null,
  quantity text,
  created_at timestamptz not null default now()
);

create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals (id) on delete cascade,
  name text not null,
  quantity text,
  note text,
  is_checked boolean not null default false,
  is_auto_added boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_meals_user_id on meals (user_id);
create index if not exists idx_meals_date on meals (meal_date);
create index if not exists idx_recipes_meal_id on recipes (meal_id);
create index if not exists idx_recipes_category on recipes (category);
create index if not exists idx_ingredients_recipe_id on ingredients (recipe_id);
create index if not exists idx_grocery_items_meal_id on grocery_items (meal_id);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

alter table meals enable row level security;
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table grocery_items enable row level security;
alter table profiles enable row level security;

create policy "meals_select_own" on meals for select using (auth.uid() = user_id);
create policy "meals_insert_own" on meals for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on meals for update using (auth.uid() = user_id);
create policy "meals_delete_own" on meals for delete using (auth.uid() = user_id);

create policy "recipes_select_own" on recipes for select using (
  exists (select 1 from meals where meals.id = recipes.meal_id and meals.user_id = auth.uid())
);
create policy "recipes_insert_own" on recipes for insert with check (
  exists (select 1 from meals where meals.id = recipes.meal_id and meals.user_id = auth.uid())
);
create policy "recipes_update_own" on recipes for update using (
  exists (select 1 from meals where meals.id = recipes.meal_id and meals.user_id = auth.uid())
);
create policy "recipes_delete_own" on recipes for delete using (
  exists (select 1 from meals where meals.id = recipes.meal_id and meals.user_id = auth.uid())
);

create policy "ingredients_select_own" on ingredients for select using (
  exists (
    select 1 from recipes join meals on meals.id = recipes.meal_id
    where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
  )
);
create policy "ingredients_insert_own" on ingredients for insert with check (
  exists (
    select 1 from recipes join meals on meals.id = recipes.meal_id
    where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
  )
);
create policy "ingredients_update_own" on ingredients for update using (
  exists (
    select 1 from recipes join meals on meals.id = recipes.meal_id
    where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
  )
);
create policy "ingredients_delete_own" on ingredients for delete using (
  exists (
    select 1 from recipes join meals on meals.id = recipes.meal_id
    where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
  )
);

create policy "grocery_select_own" on grocery_items for select using (
  exists (select 1 from meals where meals.id = grocery_items.meal_id and meals.user_id = auth.uid())
);
create policy "grocery_insert_own" on grocery_items for insert with check (
  exists (select 1 from meals where meals.id = grocery_items.meal_id and meals.user_id = auth.uid())
);
create policy "grocery_update_own" on grocery_items for update using (
  exists (select 1 from meals where meals.id = grocery_items.meal_id and meals.user_id = auth.uid())
);
create policy "grocery_delete_own" on grocery_items for delete using (
  exists (select 1 from meals where meals.id = grocery_items.meal_id and meals.user_id = auth.uid())
);

create policy "meal_photos_select_own" on storage.objects for select using (
  bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "meal_photos_insert_own" on storage.objects for insert with check (
  bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "meal_photos_update_own" on storage.objects for update using (
  bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "meal_photos_delete_own" on storage.objects for delete using (
  bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

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
    select 1 from profiles where lower(username) = lower(trim(desired_username))
  );
end;
$$;

grant execute on function check_username_available(text) to anon, authenticated;
