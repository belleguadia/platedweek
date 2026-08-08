import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkUsernameAvailable, isValidUsername } from '../lib/auth'

export default function Welcome() {
  const { isOnboarded, signUpWithUsername, signInWithUsername } = useAuth()
  const [mode, setMode] = useState('signup')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState('idle')

  useEffect(() => {
    if (mode !== 'signup') {
      setAvailability('idle')
      return
    }

    const trimmed = username.trim()
    if (!trimmed) {
      setAvailability('idle')
      return
    }

    if (!isValidUsername(trimmed)) {
      setAvailability('invalid')
      return
    }

    setAvailability('checking')
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(trimmed)
        setAvailability(available ? 'available' : 'taken')
      } catch {
        setAvailability('idle')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, mode])

  if (isOnboarded) {
    return <Navigate to="/" replace />
  }

  const canSignUp =
    mode === 'signup' &&
    isValidUsername(username) &&
    availability === 'available' &&
    password.length >= 6 &&
    password === confirmPassword

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        if (!canSignUp) return
        await signUpWithUsername(username, password)
      } else {
        await signInWithUsername(username, password)
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availabilityMessage = {
    idle: null,
    invalid: 'Use 3–20 letters, numbers, underscores, or hyphens.',
    checking: 'Checking availability…',
    available: 'Username available',
    taken: 'Username not available',
  }[availability]

  const availabilityClass = {
    idle: 'text-muted',
    invalid: 'text-danger',
    checking: 'text-muted',
    available: 'text-blue',
    taken: 'text-danger',
  }[availability]

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-[32px] leading-none">
          <span className="text-purple">PLATED</span>{' '}
          <span className="text-blue">WEEK</span>
        </h1>
        <p className="mt-6 font-heading text-2xl text-heading">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {mode === 'signup'
            ? 'Pick a unique username and password. Use the same login on any device.'
            : 'Sign in with your username to pick up where you left off.'}
        </p>
      </div>

      <div className="mb-6 flex border-b border-hairline">
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`label-tag flex-1 pb-3 transition-colors ${
            mode === 'signup' ? 'border-b border-blue text-blue' : 'text-muted'
          }`}
        >
          New account
        </button>
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`label-tag flex-1 pb-3 transition-colors ${
            mode === 'signin' ? 'border-b border-blue text-blue' : 'text-muted'
          }`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-tag mb-2 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. alex_cooks"
            className="input-field font-heading text-lg text-heading"
            required
            maxLength={20}
            autoFocus
            autoComplete="username"
          />
          {mode === 'signup' && availabilityMessage && (
            <p className={`mt-2 text-xs ${availabilityClass}`}>{availabilityMessage}</p>
          )}
        </div>

        <div>
          <label className="label-tag mb-2 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="input-field"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="label-tag mb-2 block">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              className="input-field"
              required
              minLength={6}
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 text-xs text-danger">Passwords do not match</p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading || (mode === 'signup' && !canSignUp)}
          className="btn-outline w-full"
        >
          {loading
            ? 'Please wait…'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
