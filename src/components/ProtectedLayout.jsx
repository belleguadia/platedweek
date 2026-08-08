import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from './NavBar'

export default function ProtectedLayout() {
  const { loading, isOnboarded } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    )
  }

  if (!isOnboarded) {
    return <Navigate to="/welcome" replace />
  }

  return (
    <div className="min-h-screen bg-midnight">
      <NavBar />
      <Outlet />
    </div>
  )
}
