import { useState } from 'react'
import { ChevronRight, CircleCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import PageCard from './PageCard'
import { Lock } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { isApiEnabled } from '@/constants'
import { changePassword } from '@/services/auth/authService'
import { isSamePassword, isValidPassword } from '@/utils/passwordRules'

const MIN_LOADING_MS = 450

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed'

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  showLabel,
  hideLabel,
  disabled,
  showValid = false,
  validLabel,
  compact = false,
}) => (
  <div>
    <label
      htmlFor={id}
      className={clsx(
        'block font-medium text-slate-600',
        compact ? 'text-[11px] mb-1' : 'text-sm mb-1.5'
      )}
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          inputClass,
          compact && 'rounded-lg py-2 text-xs',
          showValid && 'pr-[4.25rem]'
        )}
        disabled={disabled}
        autoComplete={id === 'current-password' ? 'current-password' : 'new-password'}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {showValid && (
          <CircleCheck
            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
            strokeWidth={2}
            role="status"
            aria-label={validLabel}
          />
        )}
        <button
          type="button"
          onClick={onToggleShow}
          disabled={disabled}
          className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  </div>
)

const ChangePasswordCard = ({ embedded = false, compact = false }) => {
  const { t, isKhmer } = useTranslation()
  const apiOn = isApiEnabled()
  const [formOpen, setFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  /** i18n key — rendered with t() so language switch updates the message */
  const [errorKey, setErrorKey] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const showLabel = t('mentorProfile.showPassword')
  const hideLabel = t('mentorProfile.hidePassword')
  const newPasswordValid = isValidPassword(newPassword)

  const resetFields = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowOld(false)
    setShowNew(false)
    setShowConfirm(false)
    setErrorKey('')
  }

  const handleOpen = () => {
    setShowSuccess(false)
    setErrorKey('')
    setFormOpen(true)
  }

  const handleCancel = () => {
    if (loading) return
    resetFields()
    setFormOpen(false)
  }

  const finishLoading = async (startedAt) => {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
    }
    setLoading(false)
  }

  const mapErrorKey = (err) => {
    switch (err?.message) {
      case 'CHANGE_PASSWORD_OLD_INCORRECT':
        return 'mentorProfile.oldPasswordIncorrect'
      case 'CHANGE_PASSWORD_UNAUTHORIZED':
        return 'mentorProfile.changePasswordUnauthorized'
      case 'CHANGE_PASSWORD_API_DISABLED':
        return 'mentorProfile.changePasswordApiDisabled'
      default:
        return 'mentorProfile.changePasswordFailed'
    }
  }

  const runPasswordUpdate = async () => {
    setErrorKey('')
    setShowSuccess(false)

    if (!apiOn) {
      setErrorKey('mentorProfile.changePasswordApiDisabled')
      return
    }

    if (!oldPassword.trim()) {
      setErrorKey('mentorProfile.currentPasswordRequired')
      return
    }
    if (!isValidPassword(newPassword)) {
      setErrorKey('auth.passwordRequirements')
      return
    }
    if (isSamePassword(oldPassword, newPassword)) {
      setErrorKey('auth.newPasswordSameAsOld')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorKey('auth.passwordMismatch')
      return
    }

    const startedAt = Date.now()
    setLoading(true)
    try {
      await changePassword({
        oldPassword: oldPassword.trim(),
        newPassword,
      })
      resetFields()
      setShowSuccess(true)
      setFormOpen(false)
    } catch (err) {
      setErrorKey(mapErrorKey(err))
    } finally {
      await finishLoading(startedAt)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    void runPasswordUpdate()
  }

  const body = (
    <>
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-md">
            <Loader2 className="w-5 h-5 text-teal-600 animate-spin shrink-0" aria-hidden />
            <span className="text-sm font-semibold text-slate-700">
              {t('mentorProfile.updatingPassword')}
            </span>
          </div>
        </div>
      )}

      {embedded && compact ? (
        !formOpen ? (
          <button
            type="button"
            onClick={handleOpen}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-teal-200 hover:bg-teal-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <Lock className="h-5 w-5 text-teal-600" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-800">
                {t('mentorProfile.changePassword')}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 line-clamp-1">
                {t('mentorProfile.changePasswordHint')}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 px-3.5 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Lock className="h-5 w-5 text-teal-600" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-800">
                {t('mentorProfile.changePassword')}
              </span>
              <span className="mt-0.5 block text-xs text-teal-700">
                {t('mentorProfile.changePasswordFormOpen')}
              </span>
            </span>
          </div>
        )
      ) : embedded ? (
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
            <Lock className="h-4 w-4 text-teal-600" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800 leading-snug">
              {t('mentorProfile.changePassword')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 leading-snug line-clamp-2">
              {t('mentorProfile.changePasswordHint')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-bold text-slate-800 mb-1">{t('mentorProfile.changePassword')}</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            {t('mentorProfile.changePasswordHint')}
          </p>
        </>
      )}

      {!apiOn && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
          {t('mentorProfile.changePasswordApiDisabled')}
        </p>
      )}

      {showSuccess && !formOpen && (
        <p
          className={clsx(
            'text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2',
            embedded && compact ? 'mt-3' : 'mb-3'
          )}
          role="status"
        >
          {t('mentorProfile.changePasswordSuccess')}
        </p>
      )}

      {!formOpen && !(embedded && compact) ? (
        <div className={clsx(embedded && !compact && 'mt-auto pt-3')}>
          <button
            type="button"
            onClick={handleOpen}
            className={clsx(
              'rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors',
              embedded ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm rounded-xl'
            )}
          >
            {t('mentorProfile.changePassword')}
          </button>
        </div>
      ) : !formOpen ? null : (
        <form
          onSubmit={handleFormSubmit}
          className={clsx(
            'space-y-3',
            compact ? 'mt-2 max-w-none' : 'max-w-md',
            embedded &&
              (compact
                ? 'mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5'
                : 'mt-4 pt-4 border-t border-slate-100')
          )}
          noValidate
        >
          <PasswordField
            id="current-password"
            label={t('mentorProfile.currentPassword')}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder={t('mentorProfile.currentPasswordPlaceholder')}
            show={showOld}
            onToggleShow={() => setShowOld((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
            compact={compact}
          />
          <PasswordField
            id="new-password"
            label={t('mentorProfile.newPasswordLabel')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('mentorProfile.newPasswordPlaceholder')}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
            showValid={newPasswordValid}
            validLabel={t('auth.passwordValid')}
            compact={compact}
          />
          <PasswordField
            id="confirm-new-password"
            label={t('mentorProfile.confirmNewPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('mentorProfile.confirmNewPasswordPlaceholder')}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            showLabel={showLabel}
            hideLabel={hideLabel}
            disabled={loading}
            compact={compact}
          />

          {loading && (
            <p className="text-xs font-medium text-primary-600 flex items-center gap-1.5" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
              {t('mentorProfile.updatingPassword')}
            </p>
          )}

          {errorKey && (
            <p className="text-xs text-red-600" role="alert">
              {t(errorKey)}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className={clsx(
                'font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60',
                compact ? 'px-3 py-1.5 text-xs rounded-lg' : 'px-4 py-2 text-sm rounded-xl'
              )}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              disabled={loading || !apiOn}
              onClick={() => void runPasswordUpdate()}
              className={clsx(
                'inline-flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-sm disabled:opacity-70',
                compact
                  ? 'rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-2 text-xs hover:from-teal-700 hover:to-teal-600'
                  : 'min-w-[9.5rem] rounded-xl bg-primary-500 px-5 py-2 text-sm hover:bg-primary-600'
              )}
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
              )}
              {loading ? t('mentorProfile.updatingPassword') : t('mentorProfile.updatePasswordButton')}
            </button>
          </div>
        </form>
      )}
    </>
  )

  if (embedded) {
    return (
      <div
        className={clsx(
          'relative',
          !compact && 'flex flex-col h-full min-h-0',
          isKhmer && 'font-khmer'
        )}
      >
        {body}
      </div>
    )
  }

  return (
    <PageCard className={clsx('relative', isKhmer && 'font-khmer')}>{body}</PageCard>
  )
}

export default ChangePasswordCard
