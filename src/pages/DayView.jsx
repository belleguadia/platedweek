import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import MealSection from '../components/MealSection'
import { deleteMeal, getMealsForDate } from '../lib/api'
import { notifyMealsChanged } from '../lib/events'
import { formatDayHeader } from '../utils/date'
import { formatMealType, getDeleteMealMessage, groupMealsByType } from '../utils/meals'

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner']

export default function DayView() {
  const { date } = useParams()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMeals = useCallback(() => {
    setLoading(true)
    getMealsForDate(date)
      .then(setMeals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [date])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  const handleDeleteMeal = async (meal) => {
    if (!window.confirm(getDeleteMealMessage(meal))) return

    try {
      await deleteMeal(meal)
      notifyMealsChanged()
      loadMeals()
    } catch (error) {
      console.error(error)
    }
  }

  const mealsByType = groupMealsByType(meals)
  const totalGrocery = meals.reduce(
    (sum, meal) => sum + (meal.grocery_items?.filter((item) => !item.is_checked).length ?? 0),
    0,
  )

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <BackLink to="/calendar">Back to calendar</BackLink>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-heading">{formatDayHeader(date)}</h1>
          <p className="label-tag mt-2">{date}</p>
        </div>
        {totalGrocery > 0 && (
          <Link to={`/day/${date}/grocery`} className="btn-outline shrink-0">
            Grocery ({totalGrocery})
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-disabled">Loading meals…</p>
      ) : (
        <div>
          {MEAL_ORDER.map((mealType) => (
            <MealSection
              key={mealType}
              mealType={mealType}
              label={formatMealType(mealType)}
              meals={mealsByType[mealType]}
              dateParam={date}
              onDelete={handleDeleteMeal}
            />
          ))}

          <div className="mt-6 border-t border-hairline pt-6">
            <Link
              to={`/day/${date}/grocery`}
              className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-body"
            >
              View full grocery list for this day →
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
