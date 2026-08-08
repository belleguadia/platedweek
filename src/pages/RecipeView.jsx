import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import { deleteRecipe, getRecipeById } from '../lib/api'
import { notifyMealsChanged } from '../lib/events'
import { formatDayHeader } from '../utils/date'
import { formatIngredientDisplay } from '../utils/ingredients'
import { formatMealType } from '../utils/meals'
import { parseRecipeSteps } from '../utils/recipe'
import { formatRecipeCategory } from '../utils/recipes'

export default function RecipeView() {
  const { recipeId } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getRecipeById(recipeId)
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [recipeId])

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe from your library? The meal will remain.')) return

    setDeleting(true)
    try {
      await deleteRecipe(recipeId)
      notifyMealsChanged()
      window.history.back()
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-sm text-disabled">Loading…</p>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <BackLink to="/recipes">Back to recipes</BackLink>
        <p className="text-sm text-disabled">Recipe not found.</p>
      </main>
    )
  }

  const meal = recipe.meals
  const steps = parseRecipeSteps(recipe.instructions)
  const editPath = meal ? `/day/${meal.meal_date}/meal/${meal.id}` : '/recipes'

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-16">
      <BackLink to="/recipes">Back to recipes</BackLink>

      <p className="label-tag mb-2">{formatRecipeCategory(recipe.category)}</p>
      <h1 className="font-heading text-4xl text-heading">{recipe.title}</h1>

      {meal && (
        <p className="mt-3 text-sm text-muted">
          From {formatMealType(meal.meal_type).toLowerCase()} on{' '}
          {formatDayHeader(meal.meal_date)}
          {meal.title !== recipe.title ? ` · ${meal.title}` : ''}
        </p>
      )}

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="label-tag mb-6">Ingredients</h2>
        {recipe.ingredients?.length > 0 ? (
          <ul>
            {recipe.ingredients.map((item) => (
              <li
                key={item.id}
                className="border-b border-separator py-3 text-base text-body"
              >
                {formatIngredientDisplay(item)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-disabled">No ingredients listed.</p>
        )}
      </section>

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="label-tag mb-6">Instructions</h2>
        {steps.length > 0 ? (
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="font-heading text-xl text-blue">{index + 1}</span>
                <p className="leading-relaxed text-body">{step}</p>
              </li>
            ))}
          </ol>
        ) : recipe.instructions?.trim() ? (
          <p className="leading-relaxed text-body">{recipe.instructions.trim()}</p>
        ) : (
          <p className="text-sm text-disabled">No instructions yet.</p>
        )}
      </section>

      <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-hairline pt-8">
        {meal && (
          <Link
            to={editPath}
            className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-body"
          >
            Edit meal
          </Link>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? 'Deleting…' : 'Delete recipe'}
        </button>
      </div>
    </main>
  )
}
