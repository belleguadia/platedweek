export function parseRecipeSteps(instructions) {
  if (!instructions?.trim()) return []
  return instructions
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean)
}
