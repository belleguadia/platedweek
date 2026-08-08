export const MEAL_TYPES = {
  breakfast: { label: 'Breakfast' },
  lunch: { label: 'Lunch' },
  dinner: { label: 'Dinner' },
}

export function formatMealType(mealType) {
  return MEAL_TYPES[mealType]?.label ?? mealType
}

export function getDeleteMealMessage(meal) {
  const title = meal?.title?.trim() || 'this meal'
  return `Delete "${title}" and its recipe, grocery list, and photo? This can't be undone.`
}

export function groupMealsByType(meals) {
  const grouped = { breakfast: [], lunch: [], dinner: [] }
  for (const meal of meals) {
    if (grouped[meal.meal_type]) grouped[meal.meal_type].push(meal)
  }
  return grouped
}
