export function formatDateParam(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateParam(dateParam) {
  const [year, month, day] = dateParam.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDayHeader(dateParam) {
  const date = parseDateParam(dateParam)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
