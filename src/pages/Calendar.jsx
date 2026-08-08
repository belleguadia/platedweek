import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BackLink from '../components/BackLink'
import { formatDateParam, formatMonthYear } from '../utils/date'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const navigate = useNavigate()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const handleSelectDay = (day) => {
    navigate(`/day/${formatDateParam(new Date(year, month, day))}`)
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <BackLink to="/">Back to home</BackLink>

      <h1 className="mb-8 font-heading text-3xl text-heading">Pick a day</h1>

      <div className="border-t border-hairline pt-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="rounded-[2px] p-2 text-muted transition-colors hover:text-body"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <h2 className="font-heading text-xl text-heading">{formatMonthYear(viewDate)}</h2>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="rounded-[2px] p-2 text-muted transition-colors hover:text-body"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="label-tag py-2 text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 border-t border-separator pt-2">
          {cells.map((day, index) =>
            day === null ? (
              <div key={`empty-${index}`} />
            ) : (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className="aspect-square rounded-[2px] font-heading text-lg text-body transition-colors hover:bg-separator hover:text-heading"
              >
                {day}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  )
}
