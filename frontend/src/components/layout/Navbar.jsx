import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useAuth, getStoredUser } from '@/hooks'
import { useTranslation } from '@/i18n'
import RokkruLogo from './Logo'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const guestNavTabs = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.schedule', href: '/login' },
  { labelKey: 'nav.community', href: '/login' },
]

/** Guest navbar — or compact bar when logged in on public support/legal pages */
const PublicNavbar = () => {
  const { t, isKhmer } = useTranslation()
  const { user } = useAuth()
  const activeUser = user ?? getStoredUser()
  const isAppUser = activeUser?.role === 'student' || activeUser?.role === 'mentor'

  if (isAppUser) {
    const homeHref = activeUser.role === 'mentor' ? '/mentor/home' : '/home'
    return (
      <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-4">
          <RokkruLogo to={homeHref} size="sm" />
          <div className="flex items-center gap-2 ml-auto">
            <LanguageSwitcher size="nav" />
            <Avatar name={activeUser.name || 'User'} size="sm" />
            <span className="text-xs font-medium text-slate-600 capitalize hidden sm:inline">
              {t(`auth.${activeUser.role}`)}
            </span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={clsx('glass-public-nav', isKhmer && 'font-khmer')}>
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-3 sm:gap-4">
        <RokkruLogo to="/" size="sm" />

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {guestNavTabs.map((tab) => (
            <Link
              key={tab.href + tab.labelKey}
              to={tab.href}
              className="px-3 py-2 text-xs font-bold tracking-wide text-slate-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50"
            >
              {t(tab.labelKey)}
            </Link>
          ))}
        </nav>

        <div
          className={clsx(
            'nav-bar-search hidden sm:flex ml-auto',
            'w-52 sm:w-60 md:w-72 lg:w-80 max-w-[min(100vw-12rem,26rem)]'
          )}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
          <input type="search" placeholder={t('search.tutors')} />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto md:ml-0">
          <LanguageSwitcher size="nav" />
          <Link to="/login">
            <Button variant="ghost" size="sm">{t('auth.login')}</Button>
          </Link>
          <Link to="/create-account">
            <Button variant="primary" size="sm">{t('auth.signup')}</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default PublicNavbar
