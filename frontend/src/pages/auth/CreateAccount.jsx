import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Check, CircleCheck } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { AuthRoleTabs } from '@/components'
import AuthLayout from '@/components/layout/AuthLayout'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import { isValidPassword } from '@/utils/passwordRules'
import RequiredFieldsHint, { FORM_FINE_PRINT_CLASS } from '@/components/common/RequiredFieldsHint'

const CreateAccount = () => {
  const { t, isKhmer } = useTranslation()
  const { register } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'mentor' ? 'mentor' : 'student'
  const [role, setRole] = useState(initialRole)

  const selectRole = (r) => {
    setRole(r)
    setSearchParams(r === 'mentor' ? { role: 'mentor' } : {}, { replace: true })
  }
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const heroTitle =
    role === 'mentor' ? t('auth.signupHeroMentorTitle') : t('auth.signupHeroStudentTitle')
  const heroSubtitle =
    role === 'mentor' ? t('auth.signupHeroMentorSubtitle') : t('auth.signupHeroStudentSubtitle')

  const passwordValid = isValidPassword(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) return
    if (!passwordValid) {
      setError(t('auth.passwordRequirements'))
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await register({ email, password, role })
      if (user.role === 'student') {
        navigate('/home')
      } else {
        navigate('/mentor/home')
      }
    } catch (err) {
      setError(err.message || t('auth.signupFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      panelRole={role}
      title={heroTitle}
      subtitle={heroSubtitle}
      roleTabs={<AuthRoleTabs role={role} selectRole={selectRole} />}
      footer={
        <p className="text-center text-sm text-on-glass-muted mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            {t('auth.signInLink')}
          </Link>
        </p>
      }
    >
      <div className="text-center mb-6 lg:text-left">
        <h1 className="text-2xl font-bold text-on-glass">{t('auth.signupTitle')}</h1>
        <p className={clsx('text-on-glass-muted text-base mt-1.5', isKhmer ? 'leading-normal' : 'leading-relaxed')}>
          {role === 'mentor' ? t('auth.signupSubtitleMentor') : t('auth.signupSubtitleStudent')}
        </p>
      </div>

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
          placeholder={t('auth.passwordMinPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={passwordValid ? 'pr-[4.25rem]' : undefined}
          rightIcon={
            <div className="flex items-center gap-1.5">
              {passwordValid && (
                <CircleCheck
                  className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                  strokeWidth={2}
                  role="status"
                  aria-label={t('auth.passwordValid')}
                />
              )}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-slate-400 hover:text-slate-600"
                aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          }
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={clsx(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
              agreed ? 'bg-primary-500 border-primary-400' : 'border-slate-300'
            )}
          >
            {agreed && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className={clsx(FORM_FINE_PRINT_CLASS, 'text-slate-600', isKhmer && 'font-khmer')}>
            <span className="text-red-500 font-bold mr-0.5" aria-hidden="true">*</span>
            {t('auth.agreeRokkruPrefix')}{' '}
            <Link to="/terms" className="text-primary-600 hover:underline font-medium">
              {t('auth.terms')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline font-medium">
              {t('auth.privacy')}
            </Link>
          </span>
        </label>

        <Button type="submit" variant="primary" size="md" className="w-full" disabled={!agreed || loading}>
          {role === 'mentor' ? t('auth.createMentorAccount') : t('auth.createAccount')}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 border-t border-slate-200/80" aria-hidden />
        <p
          className={clsx(
            'shrink-0 text-xs text-slate-500 px-1',
            isKhmer ? 'normal-case tracking-normal' : 'uppercase tracking-wide'
          )}
        >
          {t('auth.orSignUpWith')}
        </p>
        <div className="flex-1 border-t border-slate-200/80" aria-hidden />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="py-2.5 glass-subtle rounded-xl text-sm font-medium text-slate-700 hover:bg-white/80 border border-white/60"
        >
          Google
        </button>
        <button
          type="button"
          className="py-2.5 glass-subtle rounded-xl text-sm font-medium text-slate-700 hover:bg-white/80 border border-white/60"
        >
          Facebook
        </button>
      </div>

      <p className={clsx(FORM_FINE_PRINT_CLASS, 'text-center mt-8', isKhmer && 'font-khmer')}>
        {t('auth.agreeTerms')}{' '}
        <Link to="/terms" className="text-primary-600 hover:underline">
          {t('auth.terms')}
        </Link>{' '}
        {t('auth.and')}{' '}
        <Link to="/privacy" className="text-primary-600 hover:underline">
          {t('auth.privacy')}
        </Link>
        .
      </p>
    </AuthLayout>
  )
}

export default CreateAccount
