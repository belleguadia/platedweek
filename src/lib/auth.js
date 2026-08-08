import { supabase } from './supabase'

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/

export function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

export function isValidUsername(username) {
  return USERNAME_PATTERN.test(username.trim())
}

export function usernameToAuthEmail(username) {
  return `${normalizeUsername(username)}@users.platedweek.app`
}

export async function checkUsernameAvailable(username) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const trimmed = username.trim()
  if (!isValidUsername(trimmed)) return false

  const { data, error } = await supabase.rpc('check_username_available', {
    desired_username: trimmed,
  })

  if (error) throw error
  return Boolean(data)
}
