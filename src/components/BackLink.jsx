import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-body"
    >
      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
      {children}
    </Link>
  )
}
