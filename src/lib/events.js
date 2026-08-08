export const MEALS_CHANGED_EVENT = 'platedweek:meals-changed'

export function notifyMealsChanged() {
  window.dispatchEvent(new Event(MEALS_CHANGED_EVENT))
}
