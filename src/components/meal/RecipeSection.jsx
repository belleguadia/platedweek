import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { formatSaveRecipeError, saveRecipe } from '../../lib/api'
import {
  emptyIngredientForm,
  INGREDIENT_UNITS,
  parseStoredIngredient,
  serializeIngredientForm,
} from '../../utils/ingredients'
import { RECIPE_CATEGORIES } from '../../utils/recipes'

export default function RecipeSection({ meal, recipe, onSaved }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('food')
  const [instructions, setInstructions] = useState('')
  const [ingredients, setIngredients] = useState([emptyIngredientForm()])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title ?? '')
      setCategory(recipe.category ?? 'food')
      setInstructions(recipe.instructions ?? '')
      setIngredients(
        recipe.ingredients?.length
          ? recipe.ingredients.map((item) => parseStoredIngredient(item))
          : [emptyIngredientForm()],
      )
    } else {
      setTitle('')
      setCategory('food')
      setInstructions('')
      setIngredients([emptyIngredientForm()])
    }
  }, [recipe])

  const updateIngredient = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const addIngredient = () => {
    setIngredients((prev) => [...prev, emptyIngredientForm()])
  }

  const removeIngredient = (index) => {
    setIngredients((prev) => {
      if (prev.length === 1) return [emptyIngredientForm()]
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const missingNames = ingredients.some(
      (item) => (item.amount.trim() || item.unit !== 'whole') && !item.name.trim(),
    )

    if (missingNames) {
      setMessage('Each ingredient needs a name in the right-hand field.')
      setSaving(false)
      return
    }

    try {
      const serializedIngredients = ingredients
        .filter((item) => item.name.trim())
        .map((item) => serializeIngredientForm(item))

      const saved = await saveRecipe(meal.id, {
        title,
        instructions,
        ingredients: serializedIngredients,
        category,
      })
      onSaved(saved)
      const count = saved?.ingredients?.length ?? 0
      setMessage(
        count > 0
          ? `Recipe saved with ${count} ingredient${count === 1 ? '' : 's'}`
          : 'Recipe saved (add ingredient names to include them)',
      )
    } catch (error) {
      console.error('Recipe save failed:', error)
      setMessage(formatSaveRecipeError(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section-divider py-8">
      <h2 className="label-tag mb-4">Recipe</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label-tag mb-2 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Recipe title"
            className="input-field font-heading text-lg text-heading"
          />
        </div>

        <div>
          <label className="label-tag mb-2 block">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="ingredient-select w-full max-w-xs"
          >
            {RECIPE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-tag mb-2 block">Ingredients</label>

          <div className="space-y-2">
            {ingredients.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.amount}
                  onChange={(event) => updateIngredient(index, 'amount', event.target.value)}
                  placeholder="Amt"
                  className="ingredient-input w-14 shrink-0"
                />
                <select
                  value={item.unit}
                  onChange={(event) => updateIngredient(index, 'unit', event.target.value)}
                  className="ingredient-select w-20 shrink-0"
                >
                  {INGREDIENT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.name}
                  onChange={(event) => updateIngredient(index, 'name', event.target.value)}
                  placeholder="Name"
                  className="ingredient-input min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  aria-label="Remove ingredient"
                  className="shrink-0 rounded-[4px] p-2 text-muted transition-colors hover:text-body"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="label-tag mt-3 text-blue hover:text-blue/70"
          >
            Add ingredient
          </button>
        </div>

        <div>
          <label className="label-tag mb-2 block">Instructions</label>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="How to make it…"
            className="textarea-field"
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-outline">
            {saving ? 'Saving…' : 'Save recipe'}
          </button>
          {message && (
            <span
              className={`text-xs ${
                message.startsWith('Recipe saved') ? 'text-muted' : 'text-danger'
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </section>
  )
}
