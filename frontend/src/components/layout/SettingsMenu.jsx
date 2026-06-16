import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/hooks'
import { useTranslation } from '@/i18n'
import Avatar from '../ui/Avatar'
import { SETTINGS_MENUS } from './settingsMenuConfig'

/**
 * Header settings dropdown — gear trigger (student/teacher) or profile trigger (admin).
 */
const SettingsMenu = ({
  role = 'student',
  tone = 'app',
  className,
  onNavigate,
  onLogout,
  trigger = 'icon',
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const config =
    SETTINGS_MENUS[role] ?? SETTINGS_MENUS.mentor ?? SETTINGS_MENUS.student
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
      width: trigger === 'profile' ? '15.5rem' : '14rem',
      zIndex: 10000,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      const t = e.target
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const handleToggle = () => {
    if (!open) updatePosition()
    setOpen((v) => !v)
  }

  const handleLogout = () => {
    close()
    if (onLogout) {
      onLogout()
      return
    }
    logout()
    navigate('/')
    onNavigate?.()
  }

  const panel =
    open &&
    panelStyle &&
    createPortal(
      <div
        ref={panelRef}
        role="menu"
        style={panelStyle}
        className={clsx(
          'glass-settings-popover rounded-2xl py-1 overflow-hidden',
          `glass-settings-popover--${tone}`,
          trigger === 'profile' && tone === 'admin' && 'glass-ios-popover'
        )}
        onMouseLeave={close}
      >
        {trigger === 'profile' ? (
          <div className="px-4 py-3 border-b border-slate-100/80 flex items-center gap-3">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || t('admin.superAdmin')}</p>
            </div>
          </div>
        ) : (
          <div className="glass-settings-popover-header px-4 py-3">
            <p className="text-xs font-bold text-slate-900 leading-snug">{t(config.titleKey)}</p>
            <p className="text-[11px] font-medium text-slate-600 mt-0.5">{t(config.subtitleKey)}</p>
          </div>
        )}
        <div className="py-1.5">
          {config.items.map((item) => (
            <Link
              key={item.href + item.labelKey}
              to={item.href}
              role="menuitem"
              onClick={() => {
                close()
                onNavigate?.()
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 mx-1.5 text-xs font-semibold text-slate-800 glass-settings-menu-item rounded-lg"
            >
              <item.icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
        <div className="glass-settings-popover-footer px-1.5 pb-2 pt-1">
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-semibold glass-settings-logout rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {t('auth.logout')}
          </button>
        </div>
      </div>,
      document.body
    )

  return (
    <div className={clsx('relative overflow-visible', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={clsx(
          trigger === 'profile'
            ? clsx(
                'admin-profile-trigger flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl',
                open && 'admin-profile-trigger--open'
              )
            : 'p-2.5 rounded-xl transition-all duration-200',
          trigger !== 'profile' && (
            open
              ? 'glass-settings-trigger glass-settings-trigger--active text-primary-600'
              : 'glass-settings-trigger text-slate-500'
          ),
        )}
        aria-label={trigger === 'profile' ? 'Profile menu' : 'Settings menu'}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger === 'profile' ? (
          <>
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || t('admin.superAdmin')}</p>
            </div>
            <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform', open && 'rotate-180')} />
          </>
        ) : (
          <Settings className="w-5 h-5" />
        )}
      </button>
      {panel}
    </div>
  )
}

export default SettingsMenu
