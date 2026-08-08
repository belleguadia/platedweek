import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usernameToAuthEmail } from '../lib/auth'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function clearStaleSession(setSession, setProfile) {
  if (!supabase) return
  await supabase.auth.signOut()
  setSession(null)
  setProfile(null)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    const data = await fetchProfile(userId)
    setProfile(data)
    return data
  }, [])

  const hydrateSession = useCallback(
    async (currentSession) => {
      setSession(currentSession)

      if (!currentSession?.user) {
        setProfile(null)
        return
      }

      try {
        const loadedProfile = await loadProfile(currentSession.user.id)
        if (!loadedProfile) {
          await clearStaleSession(setSession, setProfile)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        await clearStaleSession(setSession, setProfile)
      }
    },
    [loadProfile],
  )

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => hydrateSession(currentSession))
      .catch((error) => {
        console.error('Failed to restore session:', error)
        setSession(null)
        setProfile(null)
      })
      .finally(() => setLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrateSession(nextSession).finally(() => setLoading(false))
    })

    return () => subscription.unsubscribe()
  }, [hydrateSession])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isOnboarded: Boolean(session && profile),
      signUpWithUsername: async (username, password) => {
        if (!supabase) throw new Error('Supabase is not configured.')

        if (session) {
          await supabase.auth.signOut()
          setSession(null)
          setProfile(null)
        }

        const trimmedUsername = username.trim()
        const { data, error } = await supabase.auth.signUp({
          email: usernameToAuthEmail(trimmedUsername),
          password,
        })

        if (error) throw error
        if (!data.user) throw new Error('Could not create account.')

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: trimmedUsername,
        })

        if (profileError) {
          if (profileError.code === '23505') {
            throw new Error('Username is not available.')
          }
          throw profileError
        }

        if (data.session) {
          setSession(data.session)
          await loadProfile(data.user.id)
        }

        return data
      },
      signInWithUsername: async (username, password) => {
        if (!supabase) throw new Error('Supabase is not configured.')

        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameToAuthEmail(username),
          password,
        })

        if (error) {
          if (error.message?.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Username or password is incorrect.')
          }
          throw error
        }

        if (data.session?.user) {
          await loadProfile(data.session.user.id)
        }

        return data
      },
      signOut: async () => {
        if (!supabase) throw new Error('Supabase is not configured.')
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setSession(null)
        setProfile(null)
      },
    }),
    [session, profile, loading, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
