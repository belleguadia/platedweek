import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMealsWithPhotos } from '../lib/api'
import { MEALS_CHANGED_EVENT } from '../lib/events'
import { formatDayHeader } from '../utils/date'
import { formatMealType } from '../utils/meals'

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPhotos = useCallback(() => {
    getMealsWithPhotos()
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadPhotos()
    window.addEventListener(MEALS_CHANGED_EVENT, loadPhotos)
    return () => window.removeEventListener(MEALS_CHANGED_EVENT, loadPhotos)
  }, [loadPhotos])

  if (loading) {
    return <p className="text-sm text-disabled">Loading gallery…</p>
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-disabled">
        No food photos yet — upload one from any meal to start your gallery.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((meal) => (
        <Link
          key={meal.id}
          to={`/day/${meal.meal_date}/meal/${meal.id}`}
          className="group relative overflow-hidden rounded-[4px] border border-separator bg-input-bg"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={meal.photo_url}
              alt={meal.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/90 to-transparent p-3 pt-8">
            <p className="font-heading text-sm text-heading">{meal.title}</p>
            <p className="label-tag mt-1 text-muted">
              {formatMealType(meal.meal_type)} · {formatDayHeader(meal.meal_date)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
