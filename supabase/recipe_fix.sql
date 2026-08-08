-- Fix "Could not save recipe" issues
-- Run this in the Supabase SQL editor

-- 1. Add recipe category column if your project was created before categories existed
alter table recipes add column if not exists category text not null default 'food'
  check (category in ('food', 'dessert', 'drinks', 'appetizer', 'side', 'other'));

create index if not exists idx_recipes_category on recipes (category);

-- 2. Remove duplicate recipes for the same meal (keeps the oldest one)
delete from recipes newer
using recipes older
where newer.meal_id = older.meal_id
  and newer.created_at > older.created_at;

-- 3. Ensure one recipe per meal going forward
create unique index if not exists recipes_meal_id_unique on recipes (meal_id);

-- 4. Re-apply ingredient policies if saves fail with permission errors
drop policy if exists "ingredients_all" on ingredients;
drop policy if exists "ingredients_select_own" on ingredients;
drop policy if exists "ingredients_insert_own" on ingredients;
drop policy if exists "ingredients_update_own" on ingredients;
drop policy if exists "ingredients_delete_own" on ingredients;

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
