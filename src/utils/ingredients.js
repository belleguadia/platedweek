export const INGREDIENT_UNITS = ['cup', 'tbsp', 'tsp', 'g', 'ml', 'oz', 'lb', 'whole']

export function emptyIngredientForm() {
  return { amount: '', unit: 'whole', name: '' }
}

export function parseStoredIngredient({ name, quantity }) {
  const qty = quantity?.trim() ?? ''
  if (!qty) {
    return { amount: '', unit: 'whole', name: name ?? '' }
  }

  const spaceIndex = qty.indexOf(' ')
  if (spaceIndex === -1) {
    return { amount: qty, unit: 'whole', name: name ?? '' }
  }

  const amount = qty.slice(0, spaceIndex)
  const possibleUnit = qty.slice(spaceIndex + 1).trim()

  if (INGREDIENT_UNITS.includes(possibleUnit)) {
    return { amount, unit: possibleUnit, name: name ?? '' }
  }

  return { amount: qty, unit: 'whole', name: name ?? '' }
}

export function serializeIngredientForm({ amount, unit, name }) {
  const trimmedAmount = amount?.trim() ?? ''
  const trimmedName = name?.trim() ?? ''

  let quantity = null
  if (trimmedAmount) {
    quantity = unit === 'whole' ? trimmedAmount : `${trimmedAmount} ${unit}`
  }

  return {
    name: trimmedName,
    quantity,
  }
}

export function formatIngredientDisplay({ name, quantity }) {
  const trimmedName = name?.trim()
  if (!trimmedName) return ''

  const trimmedQty = quantity?.trim()
  if (!trimmedQty) return trimmedName.toLowerCase()

  return `${trimmedQty} ${trimmedName}`.trim().toLowerCase()
}
