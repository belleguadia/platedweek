import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  [
    'label-tag px-2 py-2 transition-colors',
    isActive ? 'text-blue' : 'text-muted hover:text-body',
  ].join(' ')

export default function NavBar() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="border-b border-hairline bg-midnight">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-lg text-heading">
          <span className="text-purple">Plated</span>{' '}
          <span className="text-blue">Week</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/recipes" className={linkClass}>
            Recipes
          </NavLink>
          <button
            type="button"
            onClick={handleSignOut}
            className="label-tag px-2 py-2 text-muted transition-colors hover:text-body"
          >
            Sign out
          </button>
        </div>
      </nav>
      {profile?.username && (
        <p className="mx-auto max-w-4xl px-6 pb-3 text-xs text-disabled">
          Planning as {profile.username}
        </p>
      )}
    </header>
  )
}
