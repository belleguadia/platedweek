import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { deleteRecipe, getAllRecipes } from '../lib/api'
import { notifyMealsChanged } from '../lib/events'
import { formatDayHeader } from '../utils/date'
import { formatMealType } from '../utils/meals'
import { formatRecipeCategory, RECIPE_CATEGORIES } from '../utils/recipes'

export default function RecipeLibrary() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  const loadRecipes = useCallback(() => {
    setLoading(true)
    getAllRecipes()
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  const handleDelete = async (recipe) => {
    if (!window.confirm(`Delete "${recipe.title}" from your recipe library?`)) return

    try {
      await deleteRecipe(recipe.id)
      notifyMealsChanged()
      loadRecipes()
    } catch (error) {
      console.error(error)
    }
  }

  const filtered =
    activeCategory === 'all'
      ? recipes
      : recipes.filter((recipe) => recipe.category === activeCategory)

  const grouped = RECIPE_CATEGORIES.reduce((acc, category) => {
    const items = filtered.filter((recipe) => recipe.category === category.id)
    if (items.length > 0) acc[category.id] = items
    return acc
  }, {})

  const showGrouped = activeCategory === 'all'

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 font-heading text-3xl text-heading">Recipe Library</h1>
      <p className="label-tag mb-8">All saved recipes from your meals</p>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`label-tag rounded-[2px] border px-3 py-2 transition-colors ${
            activeCategory === 'all'
              ? 'border-blue text-blue'
              : 'border-badge-outline text-muted hover:text-body'
          }`}
        >
          All
        </button>
        {RECIPE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`label-tag rounded-[2px] border px-3 py-2 transition-colors ${
              activeCategory === category.id
                ? 'border-blue text-blue'
                : 'border-badge-outline text-muted hover:text-body'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-disabled">Loading recipes…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-disabled">
          No recipes yet. Save a recipe on any meal and it will appear here.
        </p>
      ) : showGrouped ? (
        <div className="space-y-10">
          {RECIPE_CATEGORIES.map((category) => {
            const items = grouped[category.id]
            if (!items?.length) return null

            return (
              <section key={category.id}>
                <h2 className="label-tag mb-4 border-b border-separator pb-2">
                  {category.label}
                </h2>
                <div className="space-y-3">
                  {items.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}

function RecipeCard({ recipe, onDelete }) {
  const meal = recipe.meals
  const ingredientCount = recipe.ingredients?.length ?? 0

  return (
    <article className="flex items-start justify-between gap-4 border-b border-separator py-4">
      <div className="min-w-0 flex-1">
        <Link
          to={`/recipes/${recipe.id}`}
          className="font-heading text-xl text-heading transition-colors hover:text-purple"
        >
          {recipe.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="label-tag text-muted">{formatRecipeCategory(recipe.category)}</span>
          {ingredientCount > 0 && (
            <span className="label-tag text-disabled">
              {ingredientCount} ingredient{ingredientCount === 1 ? '' : 's'}
            </span>
          )}
          {meal && (
            <span className="text-xs text-muted">
              {formatMealType(meal.meal_type)} · {formatDayHeader(meal.meal_date)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onDelete(recipe)}
          aria-label={`Delete ${recipe.title}`}
          className="rounded-[2px] p-2 text-muted transition-colors hover:text-danger"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <Link to={`/recipes/${recipe.id}`} className="btn-outline">
          View
        </Link>
      </div>
    </article>
  )
}
