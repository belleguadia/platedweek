import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Utensils } from 'lucide-react'
import PhotoGallery from '../components/PhotoGallery'
import { cookingQuotes } from '../data/quotes'
import { getStats } from '../lib/api'
import { MEALS_CHANGED_EVENT } from '../lib/events'

export default function Home() {
  const location = useLocation()
  const quote = useMemo(
    () => cookingQuotes[Math.floor(Math.random() * cookingQuotes.length)],
    [],
  )

  const [stats, setStats] = useState({ mealsCount: 0, recipesCount: 0 })
  const [loading, setLoading] = useState(true)

  const refreshStats = useCallback(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshStats()
    window.addEventListener(MEALS_CHANGED_EVENT, refreshStats)
    return () => window.removeEventListener(MEALS_CHANGED_EVENT, refreshStats)
  }, [refreshStats, location.pathname])

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-badge-outline">
          <Utensils className="h-4 w-4 text-purple-fill" strokeWidth={1.75} />
        </div>
        <h1 className="font-heading text-[32px] leading-none">
          <span className="text-purple">PLATED</span>{' '}
          <span className="text-blue">WEEK</span>
        </h1>
      </div>

      <blockquote className="mb-10 font-heading text-2xl font-light leading-relaxed text-heading sm:text-3xl">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <Link to="/calendar" className="btn-outline w-fit">
        Plan a day
      </Link>

      <div className="mt-14 flex items-start border-t border-hairline pt-10">
        <div className="flex flex-1 flex-col items-center text-center">
          <Utensils className="mb-3 h-4 w-4 text-purple" strokeWidth={1.75} />
          <p className="font-heading text-3xl text-heading">
            {loading ? '—' : stats.mealsCount}
          </p>
          <p className="label-tag mt-2">Meals planned</p>
        </div>

        <div className="mx-8 w-px self-stretch bg-hairline" />

        <div className="flex flex-1 flex-col items-center text-center">
          <BookOpen className="mb-3 h-4 w-4 text-purple" strokeWidth={1.75} />
          <p className="font-heading text-3xl text-heading">
            {loading ? '—' : stats.recipesCount}
          </p>
          <p className="label-tag mt-2">Recipes saved</p>
        </div>
      </div>

      <section className="mt-16 border-t border-hairline pt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="label-tag mb-1 text-purple">Gallery</p>
            <h2 className="font-heading text-2xl text-heading">Foods you&apos;ve made</h2>
          </div>
        </div>
        <PhotoGallery />
      </section>
    </main>
  )
}
