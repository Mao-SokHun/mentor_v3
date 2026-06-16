import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle, Lock } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import { useAuth } from '@/hooks'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password, role: 'admin' })
      if (user.role !== 'admin') {
        throw new Error('Invalid credentials. Please check your email and password.')
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      variant="admin"
      title="Admin Portal"
      subtitle="Authorised personnel only. Sign in to manage users, content, and platform settings."
      footer={
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            ← Back to student / teacher login
          </Link>
        </p>
      }
    >
      <div className="text-center mb-6 lg:text-left">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Sign in</h1>
        <p className="text-slate-500 text-sm mt-1">Use your admin credentials</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Admin Email" type="email" placeholder="admin@rokkru.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          <Lock className="w-4 h-4" />
          {loading ? 'Verifying…' : 'Sign In to Admin Panel'}
        </Button>
      </form>

      <div className="mt-6 bg-slate-50 rounded-xl px-4 py-3 text-center">
        <p className="text-xs text-slate-400">Demo credentials</p>
        <p className="text-xs font-mono text-slate-600 mt-0.5">admin@rokkru.com / admin123</p>
      </div>
    </AuthLayout>
  )
}

export default AdminLogin
