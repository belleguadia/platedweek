-- Auth migration: per-user data isolation
-- Run in Supabase SQL editor BEFORE going live

-- 1. Add user_id to meals
alter table meals add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Remove pre-auth test data (no user_id assigned)
delete from meals where user_id is null;

alter table meals alter column user_id set not null;

create index if not exists idx_meals_user_id on meals (user_id);

-- 2. Drop old and new policies (safe to re-run)
drop policy if exists "meals_all" on meals;
drop policy if exists "meals_select_own" on meals;
drop policy if exists "meals_insert_own" on meals;
drop policy if exists "meals_update_own" on meals;
drop policy if exists "meals_delete_own" on meals;
drop policy if exists "recipes_all" on recipes;
drop policy if exists "recipes_select_own" on recipes;
drop policy if exists "recipes_insert_own" on recipes;
drop policy if exists "recipes_update_own" on recipes;
drop policy if exists "recipes_delete_own" on recipes;
drop policy if exists "ingredients_all" on ingredients;
drop policy if exists "ingredients_select_own" on ingredients;
drop policy if exists "ingredients_insert_own" on ingredients;
drop policy if exists "ingredients_update_own" on ingredients;
drop policy if exists "ingredients_delete_own" on ingredients;
drop policy if exists "grocery_items_all" on grocery_items;
drop policy if exists "grocery_select_own" on grocery_items;
drop policy if exists "grocery_insert_own" on grocery_items;
drop policy if exists "grocery_update_own" on grocery_items;
drop policy if exists "grocery_delete_own" on grocery_items;
drop policy if exists "meal_photos_select" on storage.objects;
drop policy if exists "meal_photos_insert" on storage.objects;
drop policy if exists "meal_photos_update" on storage.objects;
drop policy if exists "meal_photos_delete" on storage.objects;
drop policy if exists "meal_photos_select_own" on storage.objects;
drop policy if exists "meal_photos_insert_own" on storage.objects;
drop policy if exists "meal_photos_update_own" on storage.objects;
drop policy if exists "meal_photos_delete_own" on storage.objects;

-- 3. Meals: users can only access their own rows
create policy "meals_select_own" on meals
  for select using (auth.uid() = user_id);

create policy "meals_insert_own" on meals
  for insert with check (auth.uid() = user_id);

create policy "meals_update_own" on meals
  for update using (auth.uid() = user_id);

create policy "meals_delete_own" on meals
  for delete using (auth.uid() = user_id);

-- 4. Recipes: access via meal ownership
create policy "recipes_select_own" on recipes
  for select using (
    exists (
      select 1 from meals
      where meals.id = recipes.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "recipes_insert_own" on recipes
  for insert with check (
    exists (
      select 1 from meals
      where meals.id = recipes.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "recipes_update_own" on recipes
  for update using (
    exists (
      select 1 from meals
      where meals.id = recipes.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "recipes_delete_own" on recipes
  for delete using (
    exists (
      select 1 from meals
      where meals.id = recipes.meal_id and meals.user_id = auth.uid()
    )
  );

-- 5. Ingredients: access via recipe → meal ownership
create policy "ingredients_select_own" on ingredients
  for select using (
    exists (
      select 1 from recipes
      join meals on meals.id = recipes.meal_id
      where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
    )
  );

create policy "ingredients_insert_own" on ingredients
  for insert with check (
    exists (
      select 1 from recipes
      join meals on meals.id = recipes.meal_id
      where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
    )
  );

create policy "ingredients_update_own" on ingredients
  for update using (
    exists (
      select 1 from recipes
      join meals on meals.id = recipes.meal_id
      where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
    )
  );

create policy "ingredients_delete_own" on ingredients
  for delete using (
    exists (
      select 1 from recipes
      join meals on meals.id = recipes.meal_id
      where recipes.id = ingredients.recipe_id and meals.user_id = auth.uid()
    )
  );

-- 6. Grocery items: access via meal ownership
create policy "grocery_select_own" on grocery_items
  for select using (
    exists (
      select 1 from meals
      where meals.id = grocery_items.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "grocery_insert_own" on grocery_items
  for insert with check (
    exists (
      select 1 from meals
      where meals.id = grocery_items.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "grocery_update_own" on grocery_items
  for update using (
    exists (
      select 1 from meals
      where meals.id = grocery_items.meal_id and meals.user_id = auth.uid()
    )
  );

create policy "grocery_delete_own" on grocery_items
  for delete using (
    exists (
      select 1 from meals
      where meals.id = grocery_items.meal_id and meals.user_id = auth.uid()
    )
  );

-- 7. Storage: photos stored at {user_id}/{meal_id}/filename
create policy "meal_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "meal_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "meal_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "meal_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
