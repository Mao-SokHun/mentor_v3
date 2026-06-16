import { useState } from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'

import {

  Sparkles, Home, Calendar, Users, Bell, Settings,

  BarChart2, CreditCard, PenSquare, LogOut, Search,

  Menu, X, Grid3x3, User, PanelLeftClose, PanelLeftOpen,

} from 'lucide-react'

import clsx from 'clsx'

import { useAuth } from '@/hooks'

import Avatar from '../ui/Avatar'

import RokkruLogo from './Logo'
import AppFooter from './Footer'
import { SubscriptionAlerts } from '@/components'
import { useMentorSubscription } from '@/hooks'
import SettingsMenu from './SettingsMenu'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useTranslation } from '@/i18n'
import { contentFontClass } from '@/utils/khmerTextUtils'
import ProfileCompletionGate from '../common/ProfileCompletionGate'



/* ─────────────────────────────────────

   Shared top-nav tabs

───────────────────────────────────── */

const isTabActive = (pathname, href) => {

  if (href === '/home' || href === '/mentor/home') {
    return pathname === '/home' || pathname === '/' || pathname === '/mentor/home'
  }

  if (href === '/community') return pathname === '/community' || pathname.startsWith('/community/')

  if (href === '/schedule') {
    return pathname === '/schedule' || pathname.startsWith('/schedule/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)

}

/** Same top tabs for student and teacher (labels: Home, Schedule, Community). */
const topNavTabs = [
  { labelKey: 'nav.home', href: '/home' },
  { labelKey: 'nav.schedule', href: '/schedule' },
  { labelKey: 'nav.community', href: '/community' },
]



const mentorSideNav = [

  { icon: Grid3x3,   labelKey: 'nav.dashboard',    href: '/mentor/home' },

  { icon: BarChart2, labelKey: 'nav.reports',      href: '/mentor/analytics' },

  { icon: CreditCard,labelKey: 'nav.subscription', href: '/mentor/subscription' },

  { icon: PenSquare, labelKey: 'nav.createPost',  href: '/mentor/create-post' },

]



const studentSideNav = [

  { icon: Home,     labelKey: 'nav.home',          href: '/home' },

  { icon: Calendar, labelKey: 'nav.schedule',      href: '/schedule' },

  { icon: Users,    labelKey: 'nav.community',     href: '/community' },

  { icon: Bell,     labelKey: 'nav.notifications', href: '/notifications' },

  { icon: Calendar, labelKey: 'nav.myBookings',    href: '/student/bookings' },

  { icon: Settings, labelKey: 'nav.profile',       href: '/profile' },

]



/* ─────────────────────────────────────

   Page footer (shared)

───────────────────────────────────── */

/* ─────────────────────────────────────

   Sidebar

───────────────────────────────────── */

const SIDEBAR_COLLAPSED_KEY = 'rokkru_mentor_sidebar_collapsed'

const readSidebarCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

const Sidebar = ({ mobile, onClose, onAction, collapsed = false, onToggleCollapse }) => {

  const location = useLocation()

  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const { t } = useTranslation()

  const isMentor = user?.role === 'mentor'

  const navItems  = isMentor ? mentorSideNav : studentSideNav



  const handleLogout = () => {

    logout()

    navigate('/')

    onClose?.()

  }



  const handleClick = (item) => {

    if (item.action) {

      onAction?.(item.action)

      onClose?.()

    } else {

      onClose?.()

    }

  }



  return (

    <div className="relative z-[1] flex flex-col h-full min-h-0 overflow-hidden">

      {/* Role header */}

      <div className={clsx('px-4 py-4 border-b border-white/40 flex-shrink-0', collapsed && 'px-2 py-3')}>

        <div className={clsx('flex items-center gap-2.5 min-w-0', collapsed && 'justify-center')}>

          <Avatar name={user?.name || 'User'} size="md" className="flex-shrink-0" />

          {!collapsed && (
            <p className={clsx('text-sm font-semibold text-slate-800 truncate leading-snug', contentFontClass(user?.name))}>
              {user?.name || 'User'}
            </p>
          )}

        </div>

      </div>



      {/* Nav items */}

      <nav className={clsx('flex-1 px-3 py-4 space-y-0.5 overflow-y-auto', collapsed && 'px-2')}>

        {navItems.map((item) => {

          const active = item.href && location.pathname === item.href

          return item.href ? (

            <Link

              key={item.labelKey}

              to={item.href}

              onClick={() => handleClick(item)}

              title={collapsed ? t(item.labelKey) : undefined}

              className={clsx(

                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium group glass-ios-nav-item',

                collapsed && 'justify-center px-2 gap-0',

                active

                  ? 'glass-ios-nav-item--active text-primary-600'

                  : 'text-slate-600 hover:text-slate-800'

              )}

            >

              <item.icon className={clsx('w-4 h-4 flex-shrink-0', active ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600')} />

              {!collapsed && (
                <>
                  {t(item.labelKey)}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-300" />}
                </>
              )}

            </Link>

          ) : null

        })}

      </nav>



      {/* Collapse + logout */}

      <div className={clsx('border-t border-white/40 p-3 flex-shrink-0 space-y-1', collapsed && 'px-2')}>

        {!mobile && onToggleCollapse && (

          <button

            type="button"

            onClick={onToggleCollapse}

            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}

            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}

            className={clsx(

              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 glass-ios-nav-item hover:text-primary-600',

              collapsed && 'justify-center px-2'

            )}

          >

            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}

            {!collapsed && t('sidebar.collapse')}

          </button>

        )}

        <button

          onClick={handleLogout}

          title={collapsed ? t('auth.logout') : undefined}

          className={clsx(

            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 glass-ios-nav-item hover:text-red-500',

            collapsed && 'justify-center px-2'

          )}

        >

          <LogOut className="w-4 h-4 flex-shrink-0" />

          {!collapsed && t('auth.logout')}

        </button>

      </div>

    </div>

  )

}



/* ─────────────────────────────────────

   Main Layout

───────────────────────────────────── */

const MainLayout = ({ children }) => {

  const location   = useLocation()

  const navigate   = useNavigate()

  const { user }   = useAuth()

  const { t, isKhmer } = useTranslation()

  const isMentor  = user?.role === 'mentor'


  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  const [searchQuery,     setSearchQuery]     = useState('')

  const { subscription } = useMentorSubscription()

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const handleSearch = (e) => {

    if (e.key === 'Enter' && searchQuery.trim()) {

      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)

      setSearchQuery('')

    }

  }



  return (

    <ProfileCompletionGate>

    <div
      className="h-screen max-h-screen h-dvh max-h-dvh flex flex-col overflow-hidden app-glass-scope glass-ios-26-shell relative bg-slate-50"
      data-role={user?.role ?? 'student'}
    >

      {/* ══════════════════ FULL-WIDTH TOP NAVBAR ══════════════════ */}

      <header
        className={clsx(
          'glass-ios-nav z-50 h-16 flex flex-shrink-0 items-center overflow-visible',
          isKhmer && 'font-khmer'
        )}
      >

        {/* Logo — same width as sidebar */}

        <RokkruLogo
          to={user?.role === 'mentor' ? '/mentor/home' : '/home'}
          size="md"
          showText={!isMentor || !sidebarCollapsed}
          className={clsx(
            'flex-shrink-0 transition-[width,padding] duration-200',
            isMentor ? (sidebarCollapsed ? 'w-[4.25rem] justify-center px-2' : 'w-44 px-5 sm:px-6') : 'px-5 sm:px-6'
          )}
        />



        {/* Top nav tabs */}

        <nav className="hidden md:flex items-center gap-0 flex-1">

          {topNavTabs.map((tab) => {

            const active = isTabActive(location.pathname, tab.href)

            return (

              <Link

                key={tab.href}

                to={tab.href}

                className={clsx(

                  'px-6 h-16 flex items-center text-sm font-semibold tracking-widest transition-all border-b-2',

                  active

                    ? 'border-primary-300 text-primary-600'

                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'

                )}

              >

                {t(tab.labelKey)}

              </Link>

            )

          })}

        </nav>



        {/* Right: search + icons + avatar */}

        <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 ml-auto overflow-visible">

          <div
            className={clsx(
              'nav-bar-search hidden sm:flex',
              'w-52 sm:w-60 md:w-72 lg:w-80 max-w-[min(100vw-14rem,26rem)]'
            )}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t('search.mentors')}
            />
          </div>



          {/* Bell */}

          <Link to="/notifications" className="relative p-2.5 rounded-xl glass-ios-nav-item">

            <Bell className="w-5 h-5 text-slate-500" />

            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-400 rounded-full ring-1 ring-white" />

          </Link>



          <LanguageSwitcher size="nav" className="hidden sm:inline-flex" />

          <SettingsMenu role={isMentor ? 'mentor' : 'student'} tone="app" />



          {/* Mobile hamburger */}

          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl glass-ios-nav-item">

            <Menu className="w-5 h-5 text-slate-500" />

          </button>

        </div>

      </header>



      {/* ══════════════════ PAGE BODY ══════════════════ */}

      <div className="flex flex-1 min-h-0">



        {/* Desktop sidebar — teachers only */}

        {isMentor && (

          <aside
            className={clsx(
              'hidden md:flex flex-col z-30 glass-ios-sidebar glass-ios-sidebar--mentor flex-shrink-0 min-h-0 overflow-hidden relative transition-[width] duration-200 ease-out',
              sidebarCollapsed ? 'w-[4.25rem]' : 'w-44',
              isKhmer && 'font-khmer'
            )}
          >

            <div className="relative z-[2] flex flex-col flex-1 min-h-0 min-w-0">
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapsed}
              />
            </div>

          </aside>

        )}



        {/* Mobile sidebar overlay */}

        {mobileMenuOpen && (

          <div className="fixed inset-0 z-40 flex">

            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />

            <aside
              className={clsx(
                'relative w-64 glass-ios-sidebar glass-ios-sidebar--mentor flex flex-col shadow-2xl h-full overflow-hidden z-50',
                isKhmer && 'font-khmer'
              )}
            >

              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-3 right-3 z-[2] p-1.5 rounded-lg glass-ios-nav-item text-slate-400">

                <X className="w-4 h-4" />

              </button>

              <div className="relative z-[1] px-4 pt-16 pb-3 border-b border-white/40">

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Navigate</p>

                {topNavTabs.map((tab) => (

                  <Link

                    key={tab.href}

                    to={tab.href}

                    onClick={() => setMobileMenuOpen(false)}

                    className={clsx(

                      'block px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide mb-0.5 transition-all',

                      isTabActive(location.pathname, tab.href) ? 'glass-ios-nav-item--active text-primary-600' : 'text-slate-600 glass-ios-nav-item'

                    )}

                  >

                    {t(tab.labelKey)}

                  </Link>

                ))}

              </div>

              {isMentor ? (

                <div className="relative z-[2] flex-1 min-h-0 flex flex-col">
                  <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
                </div>

              ) : (

                <div className="relative z-[1] px-4 py-3 space-y-1">

                  <Link

                    to="/notifications"

                    onClick={() => setMobileMenuOpen(false)}

                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 glass-ios-nav-item"

                  >

                    <Bell className="w-4 h-4 text-slate-400" /> {t('nav.notifications')}

                  </Link>

                  <Link

                    to="/student/bookings"

                    onClick={() => setMobileMenuOpen(false)}

                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 glass-ios-nav-item"

                  >

                    <Calendar className="w-4 h-4 text-slate-400" /> {t('nav.myBookings')}

                  </Link>

                  <Link

                    to="/profile"

                    onClick={() => setMobileMenuOpen(false)}

                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 glass-ios-nav-item"

                  >

                    <Settings className="w-4 h-4 text-slate-400" /> {t('nav.profile')}

                  </Link>

                </div>

              )}

            </aside>

          </div>

        )}



        {/* Main content + footer — sidebar offset only for teachers */}

        <main className="relative z-[1] flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden bg-transparent">

          {isMentor && (
            <SubscriptionAlerts
              subscription={subscription}
            />
          )}

          <div className="flex-1 p-5 sm:p-6 max-w-7xl w-full mx-auto">

            {children}

          </div>

          <AppFooter variant="app" />

        </main>

      </div>



      {/* Create Post modal */}

    </div>

    </ProfileCompletionGate>

  )

}

export default MainLayout
