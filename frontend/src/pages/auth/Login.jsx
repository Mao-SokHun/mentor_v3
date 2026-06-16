import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import AuthLayout from '@/components/layout/AuthLayout'
import { useAuth } from '@/hooks'
import { useTranslation } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { requestLoginOtp } from '@/services'
import RequiredFieldsHint, { FORM_FINE_PRINT_CLASS } from '@/components/common/RequiredFieldsHint'

const RESEND_SECONDS = 60

const Login = () => {
  const { t, isKhmer } = useTranslation()
  const [searchParams] = useSearchParams()
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState('credentials')
  const navigate = useNavigate()
  const { verifyLoginOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendIn])

  const heroTitle = t('auth.loginHeroTitle')
  const heroSubtitle = t('auth.loginHeroSubtitle')

  const finishLogin = (user) => {
    if (user.role === 'admin') navigate('/admin', { replace: true })
    else if (user.role === 'mentor') navigate('/mentor/home', { replace: true })
    else navigate('/home', { replace: true })
  }

  if (searchParams.get('role')) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestLoginOtp({ email, password })
      setStep('otp')
      setResendIn(RESEND_SECONDS)
    } catch (err) {
      setError(err.message || t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendIn > 0 || resendLoading || loading) return
    setError('')
    setResendLoading(true)
    try {
      await requestLoginOtp({ email: email.trim(), password })
      setOtp('')
      setResendIn(RESEND_SECONDS)
    } catch (err) {
      setError(err.message || t('auth.otpSendFailed'))
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await verifyLoginOtp({ email: email.trim(), otp: otp.trim() })
      finishLogin(user)
    } catch (err) {
      setError(err.message || t('auth.invalidOtp'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={heroTitle}
      subtitle={heroSubtitle}
      footer={
        <p className="text-center text-sm text-on-glass-muted mt-6">
          {t('auth.noAccount')}{' '}
          <Link
            to="/create-account"
            className="text-primary-600 font-semibold hover:underline"
          >
            {t('auth.signUpLink')}
          </Link>
        </p>
      }
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-glass">{t('auth.login')}</h1>
        <p className={clsx('text-on-glass-muted text-base mt-1.5', isKhmer ? 'leading-normal' : 'leading-relaxed')}>
          {step === 'otp' ? t('auth.otpSubtitle', { email }) : t('auth.loginSubtitle')}
        </p>
      </div>

      {step === 'credentials' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <RequiredFieldsHint>{t('auth.requiredFieldsHint')}</RequiredFieldsHint>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}
          <Input
            variant="glass"
            label={t('auth.emailAddress')}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            variant="glass"
            label={t('auth.password')}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex items-center justify-between text-base">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-primary-500" />
              {t('auth.rememberMe')}
            </label>
            <Link
              to="/forgot-password"
              state={password ? { previousPassword: password } : undefined}
              className="text-primary-600 font-medium hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" size="md" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.loginButton')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <RequiredFieldsHint>{t('auth.requiredFieldsHint')}</RequiredFieldsHint>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}
          <Input
            variant="glass"
            label={t('auth.verificationCode')}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t('auth.otpPlaceholder')}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          {isApiEnabled() && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOtp}
              disabled={resendIn > 0 || resendLoading || loading}
              loading={resendLoading}
            >
              {resendIn > 0 ? t('auth.resendIn', { seconds: resendIn }) : t('auth.resendOtp')}
            </Button>
          )}
          <Button type="submit" variant="primary" className="w-full" size="md" disabled={loading || otp.length < 6}>
            {loading ? t('auth.verifyingOtp') : t('auth.verifyOtp')}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-slate-500 hover:text-primary-600"
            onClick={() => {
              setStep('credentials')
              setOtp('')
              setError('')
            }}
          >
            {t('auth.back')}
          </button>
        </form>
      )}

      <p className={clsx(FORM_FINE_PRINT_CLASS, 'text-center mt-8', isKhmer && 'font-khmer')}>
        {t('auth.agreeTerms')}{' '}
        <Link to="/terms" className="text-primary-600 hover:underline">{t('auth.terms')}</Link>
        {' '}{t('auth.and')}{' '}
        <Link to="/privacy" className="text-primary-600 hover:underline">{t('auth.privacy')}</Link>.
      </p>
    </AuthLayout>
  )
}

export default Login
