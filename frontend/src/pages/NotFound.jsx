import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🌿</div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-6">This page has gone green — it doesn't exist!</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
