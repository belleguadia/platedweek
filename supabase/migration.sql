-- Migration: multiple meals per slot, recipe categories
-- Run in Supabase SQL editor if you already created the original schema

alter table meals drop constraint if exists meals_meal_date_meal_type_key;

alter table recipes add column if not exists category text not null default 'food'
  check (category in ('food', 'dessert', 'drinks', 'appetizer', 'side', 'other'));

create index if not exists idx_recipes_category on recipes (category);
