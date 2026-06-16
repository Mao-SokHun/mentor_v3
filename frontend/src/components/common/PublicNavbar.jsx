import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useAuth, getStoredUser } from '@/hooks'
import { useTranslation } from '@/i18n'
import { RokkruLogo } from '@/components'
import Avatar from '../ui/Avatar'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const guestNavTabs = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.schedule', href: '/login' },
  { labelKey: 'nav.community', href: '/login' },
]

const navLinkClass =
  'px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50 whitespace-nowrap'

/** Landing / guest navbar — compact bar when logged in on public help/contact pages */
const PublicNavbar = () => {
  const { t, isKhmer } = useTranslation()
  const { user } = useAuth()
  const activeUser = user ?? getStoredUser()
  const isAppUser = activeUser?.role === 'student' || activeUser?.role === 'mentor'

  if (isAppUser) {
    const homeHref = activeUser.role === 'mentor' ? '/mentor/home' : '/home'
    return (
      <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-3">
          <RokkruLogo to={homeHref} size="sm" />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <LanguageSwitcher size="nav" />
            <Avatar name={activeUser.name || 'User'} size="sm" />
            <span className="text-sm font-medium text-slate-600 capitalize hidden sm:inline">
              {t(`auth.${activeUser.role}`)}
            </span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-2 sm:gap-3">
        <RokkruLogo to="/" size="sm" className="shrink-0" />

        <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
          {guestNavTabs.map((tab) => (
            <Link key={tab.href + tab.labelKey} to={tab.href} className={navLinkClass}>
              {t(tab.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
          <div
            className={clsx(
              'nav-bar-search hidden sm:flex',
              'w-52 sm:w-60 md:w-72 lg:w-80 max-w-[min(100vw-12rem,26rem)]'
            )}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
            <input
              type="search"
              placeholder={t('search.navPlaceholder')}
            />
          </div>
          <LanguageSwitcher size="nav" />
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-white/60 whitespace-nowrap no-underline"
          >
            {t('nav.loginNav')}
          </Link>
          <Link
            to="/create-account"
            className="inline-flex items-center justify-center text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors px-3.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap no-underline"
          >
            {t('nav.signupNav')}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default PublicNavbar
