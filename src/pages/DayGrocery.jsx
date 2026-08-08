import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import { getGroceryItemsForDate, updateGroceryItem } from '../lib/api'
import { formatIngredientDisplay } from '../utils/ingredients'
import { formatDayHeader } from '../utils/date'
import { formatMealType } from '../utils/meals'

export default function DayGrocery() {
  const { date } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadItems = useCallback(() => {
    setLoading(true)
    getGroceryItemsForDate(date)
      .then(({ items: groceryItems }) => setItems(groceryItems))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [date])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleToggle = async (item) => {
    try {
      await updateGroceryItem(item.id, { is_checked: !item.is_checked })
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, is_checked: !row.is_checked } : row,
        ),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.meal?.meal_type ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const mealOrder = ['breakfast', 'lunch', 'dinner']
  const uncheckedCount = items.filter((item) => !item.is_checked).length

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <BackLink to={`/day/${date}`}>Back to day</BackLink>

      <h1 className="mb-2 font-heading text-3xl text-heading">Grocery list</h1>
      <p className="label-tag mb-2">{formatDayHeader(date)}</p>
      <p className="mb-8 text-sm text-muted">
        {uncheckedCount} item{uncheckedCount === 1 ? '' : 's'} left to buy
      </p>

      {loading ? (
        <p className="text-sm text-disabled">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-disabled">No grocery items for this day yet.</p>
      ) : (
        <div className="space-y-8">
          {mealOrder.map((mealType) => {
            const sectionItems = grouped[mealType] ?? []
            if (sectionItems.length === 0) return null

            return (
              <section key={mealType}>
                <h2 className="label-tag mb-4 border-b border-separator pb-2">
                  {formatMealType(mealType)}
                </h2>
                <ul className="space-y-3">
                  {sectionItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 border-b border-separator pb-3"
                    >
                      <input
                        type="checkbox"
                        checked={item.is_checked}
                        onChange={() => handleToggle(item)}
                        className="mt-1 accent-blue"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            item.is_checked ? 'text-disabled line-through' : 'text-body'
                          }`}
                        >
                          {formatIngredientDisplay(item)}
                        </p>
                        <p className="label-tag mt-1 text-muted">
                          {item.meal?.title}
                        </p>
                        {item.note && (
                          <p className="mt-0.5 text-xs text-muted">{item.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
