import { Link } from 'react-router-dom'
import { BookOpen, Trash2 } from 'lucide-react'

export default function MealRow({ meal, dateParam, onDelete }) {
  const recipeCount = meal?.recipes?.length ?? 0
  const groceryItems = meal?.grocery_items ?? []
  const uncheckedCount = groceryItems.filter((item) => !item.is_checked).length
  const hasPhoto = Boolean(meal?.photo_url)

  return (
    <article className="border-b border-separator py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/day/${dateParam}/meal/${meal.id}`}
            className="font-heading text-xl text-heading transition-colors hover:text-purple"
          >
            {meal.title}
          </Link>
          <div className="mt-2 flex items-center gap-3">
            {recipeCount > 0 && (
              <span className="inline-flex items-center gap-1 text-disabled" title="Recipe added">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            )}
            {groceryItems.length > 0 && (
              <span className="label-tag text-disabled">{uncheckedCount} grocery</span>
            )}
            {hasPhoto && <span className="label-tag text-disabled">Photo</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(meal)}
            aria-label={`Delete ${meal.title}`}
            className="rounded-[2px] p-2 text-muted transition-colors hover:text-danger"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Link to={`/day/${dateParam}/meal/${meal.id}`} className="btn-outline">
            Edit
          </Link>
        </div>
      </div>
    </article>
  )
}
