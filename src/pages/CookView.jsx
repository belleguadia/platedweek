import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import { getMealById, getRecipeForMeal } from '../lib/api'
import { formatDayHeader } from '../utils/date'
import { formatIngredientDisplay } from '../utils/ingredients'
import { formatMealType } from '../utils/meals'
import { parseRecipeSteps } from '../utils/recipe'

export default function CookView() {
  const { date, mealId } = useParams()
  const [meal, setMeal] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMealById(mealId)
      .then(async (mealData) => {
        setMeal(mealData)
        if (mealData) {
          setRecipe(await getRecipeForMeal(mealData.id))
        } else {
          setRecipe(null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [mealId])

  const editPath = `/day/${date}/meal/${mealId}`
  const ingredients = recipe?.ingredients ?? []
  const steps = parseRecipeSteps(recipe?.instructions)
  const hasRecipe = Boolean(recipe?.title || ingredients.length > 0 || steps.length > 0)

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-sm text-disabled">Loading…</p>
      </main>
    )
  }

  if (!meal) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <BackLink to={`/day/${date}`}>Back to day</BackLink>
        <p className="text-base text-body">Meal not found.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-16">
      <BackLink to={editPath}>Back to meal</BackLink>

      <p className="label-tag mb-2">{formatMealType(meal.meal_type)}</p>
      <p className="font-heading text-xl text-muted">
        {formatMealType(meal.meal_type)} — {formatDayHeader(date)}
      </p>
      <h1 className="mt-3 font-heading text-4xl leading-tight text-heading sm:text-5xl">
        {meal.title}
      </h1>
      {recipe?.title && recipe.title !== meal.title && (
        <p className="mt-2 font-heading text-2xl text-purple">{recipe.title}</p>
      )}

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="label-tag mb-6">Ingredients</h2>
        {ingredients.length > 0 ? (
          <ul>
            {ingredients.map((item) => (
              <li
                key={item.id}
                className="border-b border-separator py-4 text-lg text-body sm:text-xl"
              >
                {formatIngredientDisplay(item)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-disabled">
            No ingredients added yet.{' '}
            <Link to={editPath} className="text-muted underline-offset-2 hover:text-body hover:underline">
              Add them on the edit page
            </Link>
          </p>
        )}
      </section>

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="label-tag mb-6">Recipe</h2>
        {hasRecipe && steps.length > 0 ? (
          <ol className="space-y-8">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-5">
                <span className="font-heading text-2xl text-blue">{index + 1}</span>
                <p className="text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        ) : hasRecipe && recipe?.instructions?.trim() ? (
          <p className="text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed">
            {recipe.instructions.trim()}
          </p>
        ) : (
          <p className="text-base text-disabled">
            No recipe added yet.{' '}
            <Link to={editPath} className="text-muted underline-offset-2 hover:text-body hover:underline">
              Add one on the edit page
            </Link>
          </p>
        )}
      </section>

      <div className="mt-14 border-t border-hairline pt-8">
        <Link
          to={editPath}
          className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-body"
        >
          Edit this meal
        </Link>
      </div>
    </main>
  )
}
