import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[150px] font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">Page not found</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/home">
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="ghost" size="lg">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3">Or jump to</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Home', href: '/home' },
              { label: 'Schedule', href: '/schedule' },
              { label: 'Community', href: '/community' },
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'Profile', href: '/profile' },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-primary-200 hover:text-primary-600 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
