export const RECIPE_CATEGORIES = [
  { id: 'food', label: 'Food' },
  { id: 'dessert', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'appetizer', label: 'Appetizers' },
  { id: 'side', label: 'Sides' },
  { id: 'other', label: 'Other' },
]

export function formatRecipeCategory(category) {
  return RECIPE_CATEGORIES.find((item) => item.id === category)?.label ?? category
}
