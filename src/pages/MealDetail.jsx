import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import GrocerySection from '../components/meal/GrocerySection'
import PhotoSection from '../components/meal/PhotoSection'
import RecipeSection from '../components/meal/RecipeSection'
import {
  createMeal,
  deleteMeal,
  getGroceryItems,
  getMealById,
  getRecipeForMeal,
} from '../lib/api'
import { notifyMealsChanged } from '../lib/events'
import { formatDayHeader } from '../utils/date'
import { formatMealType, getDeleteMealMessage } from '../utils/meals'

export default function MealDetail() {
  const { date, mealId, mealType } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = location.pathname.endsWith('/new')

  const [meal, setMeal] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const [groceryItems, setGroceryItems] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')

  const loadMealData = async () => {
    if (isNew) return

    setLoading(true)
    try {
      const mealData = await getMealById(mealId)
      setMeal(mealData)

      if (mealData) {
        const [recipeData, groceryData] = await Promise.all([
          getRecipeForMeal(mealData.id),
          getGroceryItems(mealData.id),
        ])
        setRecipe(recipeData)
        setGroceryItems(groceryData)
      } else {
        setRecipe(null)
        setGroceryItems([])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMealData()
  }, [mealId, isNew])

  const handleCreateMeal = async (event) => {
    event.preventDefault()
    if (!title.trim()) return

    setCreating(true)
    try {
      const newMeal = await createMeal({
        mealDate: date,
        mealType,
        title: title.trim(),
      })
      notifyMealsChanged()
      navigate(`/day/${date}/meal/${newMeal.id}`, { replace: true })
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMeal = async () => {
    if (!meal) return
    if (!window.confirm(getDeleteMealMessage(meal))) return

    setDeleting(true)
    try {
      await deleteMeal(meal)
      notifyMealsChanged()
      navigate(`/day/${date}`)
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const resolvedMealType = meal?.meal_type ?? mealType

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <p className="text-sm text-disabled">Loading…</p>
      </main>
    )
  }

  if (isNew) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <BackLink to={`/day/${date}`}>Back to day</BackLink>

        <p className="label-tag mb-2">{formatMealType(mealType)}</p>
        <h1 className="mb-8 font-heading text-3xl text-heading">
          Add {formatMealType(mealType).toLowerCase()} — {formatDayHeader(date)}
        </h1>

        <form onSubmit={handleCreateMeal} className="border-t border-hairline pt-6">
          <label className="label-tag mb-2 block">Meal title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Roast turkey, Ndivuyu cocktail"
            className="input-field mb-4"
            required
          />
          <button type="submit" disabled={creating} className="btn-outline">
            {creating ? 'Saving…' : 'Save'}
          </button>
        </form>
      </main>
    )
  }

  if (!meal) {
    return (
      <main className="mx-auto max-w-lg px-6 py-10">
        <BackLink to={`/day/${date}`}>Back to day</BackLink>
        <p className="text-sm text-disabled">Meal not found.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <BackLink to={`/day/${date}`}>Back to day</BackLink>

      <p className="label-tag mb-2">{formatMealType(resolvedMealType)}</p>
      <div className="mb-2 flex items-start justify-between gap-4">
        <h1 className="font-heading text-3xl text-heading">{meal.title}</h1>
        <Link
          to={`/day/${date}/meal/${meal.id}/cook`}
          className="shrink-0 text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-body"
        >
          Cook mode
        </Link>
      </div>
      <p className="label-tag mb-8">{formatDayHeader(date)}</p>

      <div className="space-y-0">
        <RecipeSection
          meal={meal}
          recipe={recipe}
          onSaved={(savedRecipe) => {
            setRecipe(savedRecipe)
            notifyMealsChanged()
          }}
        />
        <GrocerySection
          meal={meal}
          groceryItems={groceryItems}
          recipeIngredients={recipe?.ingredients ?? []}
          onChange={setGroceryItems}
        />
        <PhotoSection
          meal={meal}
          onPhotoUpdated={(updated) => {
            setMeal(updated)
            notifyMealsChanged()
          }}
        />

        <section className="mt-10 border-t border-hairline pt-8">
          <p className="label-tag mb-3 text-danger">Danger zone</p>
          <button
            type="button"
            onClick={handleDeleteMeal}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? 'Deleting…' : 'Delete meal'}
          </button>
        </section>
      </div>
    </main>
  )
}
