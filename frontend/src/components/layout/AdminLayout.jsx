import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HelpCircle, FileText, Lock,
  Bell, Search, Menu, X,
  AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Logo from './Logo'
import { useAuth } from '@/hooks'
import SettingsMenu from './SettingsMenu'
import { useTranslation } from '@/i18n'
import EmptyState from '../ui/EmptyState'
import { getAdminPageTitleKey, ADMIN_NAV_GROUPS, isAdminNavActive } from './adminPageMeta'

const LogoutModal = ({ onClose, onConfirm, t }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
    <div className="glass-ios p-6 w-full max-w-sm rounded-2xl">
      <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 text-center mb-2">{t('admin.signOutConfirm')}</h3>
      <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
        {t('admin.signOutMessage')}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {t('admin.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          {t('admin.signOut')}
        </button>
      </div>
    </div>
  </div>
)

const ADMIN_SIDEBAR_KEY = 'admin-sidebar-expanded'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SIDEBAR_KEY) !== 'false'
    } catch {
      return true
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const { t, isKhmer } = useTranslation()

  const pageTitle = t(getAdminPageTitleKey(location.pathname))

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const next = !open
      try {
        localStorage.setItem(ADMIN_SIDEBAR_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!notifOpen) return
    const onPointer = (e) => {
      if (notifRef.current?.contains(e.target)) return
      setNotifOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [notifOpen])

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div
        className={clsx(
          'admin-sidebar-brand flex items-center gap-3 h-[3.75rem] flex-shrink-0',
          mobile || sidebarOpen ? 'px-4' : 'px-2 justify-center'
        )}
      >
        <Logo to="/admin" size="sm" showText={mobile || sidebarOpen} />
        {(mobile || sidebarOpen) && (
          <span className="text-[11px] font-semibold text-primary-600/90 tracking-wide truncate">
            {t('admin.panel')}
          </span>
        )}
        {mobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-lg glass-ios-nav-item text-slate-400"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav
        className={clsx(
          'flex-1 overflow-y-auto scrollbar-hide py-5 space-y-6',
          mobile || sidebarOpen ? 'px-2.5' : 'px-1.5'
        )}
      >
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.labelKey}>
            {(mobile || sidebarOpen) && (
              <p className="admin-nav-section-label">{t(group.labelKey)}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isAdminNavActive(location.pathname, item.href)
                const label = t(item.labelKey)
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={(!mobile && !sidebarOpen) ? label : undefined}
                      className={clsx(
                        'admin-nav-link flex items-center gap-3 py-2.5 text-sm font-medium group relative glass-ios-nav-item',
                        mobile || sidebarOpen ? 'px-3' : 'px-2 justify-center',
                        active ? 'admin-nav-link--active' : 'text-slate-600'
                      )}
                    >
                      <item.icon
                        className={clsx('flex-shrink-0', active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600')}
                        style={{ width: 18, height: 18 }}
                      />
                      {(mobile || sidebarOpen) && <span className="truncate">{label}</span>}
                      {!mobile && !sidebarOpen && (
                        <span className="absolute left-full ml-3 bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          {label}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <div className="h-screen max-h-screen h-dvh max-h-dvh flex overflow-hidden admin-glass-scope glass-ios-26-shell relative">
      <div className="fixed inset-0 z-0 pointer-events-none admin-panel-root" aria-hidden>
        <div className="absolute inset-0 admin-panel-vignette" aria-hidden />
      </div>

      {showLogout && (
        <LogoutModal
          t={t}
          onClose={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}

      <aside
        className={clsx(
          'admin-sidebar hidden md:flex flex-shrink-0 glass-ios-sidebar z-10 flex-col h-full min-h-0 relative',
          sidebarOpen ? 'admin-sidebar--expanded' : 'admin-sidebar--collapsed',
          isKhmer && 'font-khmer'
        )}
      >
        <SidebarContent />
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-sidebar-rail"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" aria-hidden />
          )}
        </button>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className={clsx(
              'relative z-10 w-[17rem] glass-ios-sidebar h-full overflow-y-auto scrollbar-hide shadow-2xl',
              isKhmer && 'font-khmer'
            )}
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full relative z-10">
        <header
          className={clsx(
            'admin-header-bar glass-ios-nav h-[3.75rem] flex flex-shrink-0 items-center justify-between px-4 sm:px-6 z-20 overflow-visible',
            isKhmer && 'font-khmer'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl glass-ios-nav-item text-slate-500 hover:text-slate-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl glass-ios-nav-item text-slate-500 hover:text-slate-700"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="admin-header-kicker hidden sm:block">{t('admin.panel')}</p>
              <h1 className="admin-header-title truncate">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-visible">
            <div className="admin-search nav-bar-search hidden lg:flex items-center gap-2 px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input placeholder={t('admin.searchPlaceholder')} className="bg-transparent outline-none w-full" />
            </div>

            <LanguageSwitcher size="nav" className="hidden sm:inline-flex" />

            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((open) => !open)}
                className={clsx(
                  'p-2.5 rounded-xl glass-ios-nav-item text-slate-500 hover:text-slate-700',
                  notifOpen && 'bg-slate-100 text-slate-700'
                )}
                aria-label={t('nav.notifications')}
                aria-expanded={notifOpen}
              >
                <Bell className="w-[1.125rem] h-[1.125rem]" />
              </button>
              {notifOpen && (
                <div className="admin-notif-dropdown">
                  <div className="admin-notif-dropdown-panel">
                    <div className="admin-notif-dropdown-header">
                      <h4 className="font-semibold text-slate-800 text-sm">{t('nav.notifications')}</h4>
                    </div>
                    <EmptyState
                      size="sm"
                      icon={<Bell className="w-full h-full" />}
                      title={t('notifications.emptyHint')}
                      description={t('notifications.empty')}
                      className="!py-8"
                    />
                  </div>
                </div>
              )}
            </div>

            <SettingsMenu
              role="admin"
              tone="admin"
              trigger="profile"
              onLogout={() => setShowLogout(true)}
            />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-5 sm:py-6">
          <div className="admin-main-inner">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
