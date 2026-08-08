import { supabase } from './supabase'

function db() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    )
  }
  return supabase
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await db().auth.getUser()

  if (error) throw error
  if (!user) throw new Error('You must be signed in.')
  return user
}

export async function getStats() {
  const [mealsResult, recipesResult] = await Promise.all([
    db().from('meals').select('*', { count: 'exact', head: true }),
    db().from('recipes').select('*', { count: 'exact', head: true }),
  ])

  if (mealsResult.error) throw mealsResult.error
  if (recipesResult.error) throw recipesResult.error

  return {
    mealsCount: mealsResult.count ?? 0,
    recipesCount: recipesResult.count ?? 0,
  }
}

export async function getMealsForDate(mealDate) {
  const { data, error } = await db()
    .from('meals')
    .select(`
      id,
      meal_type,
      title,
      photo_url,
      created_at,
      recipes ( id ),
      grocery_items ( id, is_checked )
    `)
    .eq('meal_date', mealDate)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getMealById(mealId) {
  const { data, error } = await db()
    .from('meals')
    .select('*')
    .eq('id', mealId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createMeal({ mealDate, mealType, title }) {
  const user = await requireUser()

  const { data, error } = await db()
    .from('meals')
    .insert({
      meal_date: mealDate,
      meal_type: mealType,
      title,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecipeForMeal(mealId) {
  const { data, error } = await db()
    .from('recipes')
    .select('*, ingredients (*)')
    .eq('meal_id', mealId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getRecipeById(recipeId) {
  const { data, error } = await db()
    .from('recipes')
    .select(`
      *,
      ingredients (*),
      meals ( id, title, meal_date, meal_type )
    `)
    .eq('id', recipeId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAllRecipes() {
  const { data, error } = await db()
    .from('recipes')
    .select(`
      id,
      title,
      instructions,
      category,
      created_at,
      meal_id,
      meals ( id, title, meal_date, meal_type ),
      ingredients ( id, name, quantity )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function saveRecipe(mealId, { title, instructions, ingredients, category }) {
  const existing = await getRecipeForMeal(mealId)
  let recipeId = existing?.id

  if (recipeId) {
    const { error } = await db()
      .from('recipes')
      .update({ title, instructions, category: category || 'food' })
      .eq('id', recipeId)

    if (error) throw error
  } else {
    const { data, error } = await db()
      .from('recipes')
      .insert({
        meal_id: mealId,
        title,
        instructions,
        category: category || 'food',
      })
      .select()
      .single()

    if (error) throw error
    recipeId = data.id
  }

  const { error: deleteError } = await db()
    .from('ingredients')
    .delete()
    .eq('recipe_id', recipeId)

  if (deleteError) throw deleteError

  const rows = ingredients
    .filter((item) => item.name.trim())
    .map((item) => ({
      recipe_id: recipeId,
      name: item.name.trim(),
      quantity: item.quantity?.trim() || null,
    }))

  if (rows.length > 0) {
    const { error: insertError } = await db().from('ingredients').insert(rows)
    if (insertError) throw insertError
  }

  return getRecipeForMeal(mealId)
}

export async function deleteRecipe(recipeId) {
  const { error } = await db().from('recipes').delete().eq('id', recipeId)
  if (error) throw error
}

export async function getGroceryItems(mealId) {
  const { data, error } = await db()
    .from('grocery_items')
    .select('*')
    .eq('meal_id', mealId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getGroceryItemsForDate(mealDate) {
  const meals = await getMealsForDate(mealDate)
  if (meals.length === 0) return { meals: [], items: [] }

  const mealIds = meals.map((meal) => meal.id)
  const { data, error } = await db()
    .from('grocery_items')
    .select('*')
    .in('meal_id', mealIds)
    .order('created_at', { ascending: true })

  if (error) throw error

  const mealsById = Object.fromEntries(meals.map((meal) => [meal.id, meal]))
  const items = (data ?? []).map((item) => ({
    ...item,
    meal: mealsById[item.meal_id],
  }))

  return { meals, items }
}

export async function addGroceryItem(mealId, { name, quantity, note }) {
  const { data, error } = await db()
    .from('grocery_items')
    .insert({
      meal_id: mealId,
      name: name.trim(),
      quantity: quantity?.trim() || null,
      note: note?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGroceryItem(id, updates) {
  const { data, error } = await db()
    .from('grocery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGroceryItem(id) {
  const { error } = await db().from('grocery_items').delete().eq('id', id)
  if (error) throw error
}

export async function pullIngredientsToGrocery(mealId, ingredients) {
  const existing = await getGroceryItems(mealId)
  const existingNames = new Set(existing.map((item) => item.name.toLowerCase()))

  const toInsert = ingredients
    .filter((item) => item.name.trim() && !existingNames.has(item.name.trim().toLowerCase()))
    .map((item) => ({
      meal_id: mealId,
      name: item.name.trim(),
      quantity: item.quantity?.trim() || null,
      is_auto_added: true,
    }))

  if (toInsert.length === 0) return existing

  const { error } = await db().from('grocery_items').insert(toInsert).select()
  if (error) throw error

  return getGroceryItems(mealId)
}

export async function getMealsWithPhotos(limit = 24) {
  const { data, error } = await db()
    .from('meals')
    .select('id, title, photo_url, meal_date, meal_type')
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function uploadMealPhoto(mealId, file) {
  const user = await requireUser()
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${mealId}/${Date.now()}.${ext}`

  const { error: uploadError } = await db().storage
    .from('meal-photos')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: urlData } = db().storage.from('meal-photos').getPublicUrl(path)

  const { data, error } = await db()
    .from('meals')
    .update({ photo_url: urlData.publicUrl })
    .eq('id', mealId)
    .select()
    .single()

  if (error) throw error
  return data
}

function getStoragePathFromPhotoUrl(photoUrl) {
  if (!photoUrl) return null
  const marker = '/meal-photos/'
  const index = photoUrl.indexOf(marker)
  if (index === -1) return null
  return photoUrl.slice(index + marker.length)
}

export async function deleteMeal(meal) {
  if (meal.photo_url) {
    const path = getStoragePathFromPhotoUrl(meal.photo_url)
    if (path) {
      const { error: storageError } = await db().storage.from('meal-photos').remove([path])
      if (storageError) console.warn('Could not delete meal photo from storage:', storageError)
    }
  }

  const { error } = await db().from('meals').delete().eq('id', meal.id)
  if (error) throw error
}
