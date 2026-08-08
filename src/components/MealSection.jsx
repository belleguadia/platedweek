import { Link } from 'react-router-dom'
import { Coffee, Soup, Utensils } from 'lucide-react'
import MealRow from './MealRow'

const mealIcons = {
  breakfast: Coffee,
  lunch: Soup,
  dinner: Utensils,
}

export default function MealSection({ mealType, label, meals, dateParam, onDelete }) {
  const Icon = mealIcons[mealType]

  return (
    <section className="section-divider py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-badge-outline">
          <Icon className="h-4 w-4 text-purple" strokeWidth={1.75} />
        </div>
        <p className="label-tag">{label}</p>
      </div>

      {meals.length === 0 ? (
        <p className="mb-4 text-sm text-disabled">Nothing planned yet</p>
      ) : (
        <div className="mb-4">
          {meals.map((meal) => (
            <MealRow key={meal.id} meal={meal} dateParam={dateParam} onDelete={onDelete} />
          ))}
        </div>
      )}

      <Link to={`/day/${dateParam}/${mealType}/new`} className="btn-outline">
        Add {label.toLowerCase()} item
      </Link>
    </section>
  )
}
