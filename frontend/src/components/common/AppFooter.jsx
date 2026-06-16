import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'

const footerLinkKeys = [
  { labelKey: 'footer.privacy', to: '/privacy' },
  { labelKey: 'footer.terms', to: '/terms' },
  { labelKey: 'footer.help', to: '/help' },
  { labelKey: 'footer.contact', to: '/contact' },
]

/**
 * @param {'app'|'full'|'contained'} variant
 */
const AppFooter = ({ variant = 'full', className = '' }) => {
  const { t } = useTranslation()
  const isApp = variant === 'app'
  const isContained = variant === 'contained'

  return (
    <footer
      className={clsx(
        isApp && 'glass-footer w-full shrink-0 mt-10',
        !isApp && !isContained && 'glass-footer glass-footer--public w-full',
        isContained && 'glass-panel mt-10 rounded-xl',
        className
      )}
    >
      <div
        className={clsx(
          'flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4',
          'max-w-7xl mx-auto w-full px-5 sm:px-6 py-4 sm:py-5',
          isContained && 'px-5 sm:px-6'
        )}
      >
        <p className="text-sm sm:text-base text-slate-600 text-center sm:text-left leading-relaxed">
          <span className="font-semibold text-slate-700">{t('footer.copyright')}</span>
          <span className="text-slate-500"> · {t('footer.tagline')}</span>
        </p>
        <nav
          className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2"
          aria-label="Footer"
        >
          {footerLinkKeys.map(({ labelKey, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm sm:text-base text-slate-600 hover:text-primary-600 transition-colors font-medium whitespace-nowrap"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default AppFooter
