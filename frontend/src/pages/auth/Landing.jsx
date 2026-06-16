import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { PublicNavbar, AppFooter, MentorRowCard, AnimatedBackground } from '@/components'
import { LANDING_SECTION_BG_ANIMATION_ENABLED } from '@/constants'
import { useTranslation } from '@/i18n'
import { useMentors } from '@/hooks'

const Landing = () => {
  const { t, isKhmer } = useTranslation()
  const { mentors, loading: mentorsLoading } = useMentors({ page: 1, pageSize: 4 })
  const features = t('landing.features')
  const featureList = Array.isArray(features) ? features : []

  const stats = []

  return (
    <div className="min-h-screen flex flex-col glass-ios-26-shell">
      <PublicNavbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl" />
          <AnimatedBackground variant="landing" intensity="normal" style="both" className="absolute inset-0" />
        </div>

        <div
          className={clsx(
            'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            isKhmer ? 'pt-12 pb-16 sm:pt-14 lg:pt-16 lg:pb-20' : 'py-20 lg:py-28'
          )}
        >
          <div className={clsx(isKhmer ? 'max-w-5xl lg:max-w-6xl' : 'max-w-2xl')}>
            <p
              className={clsx(
                'landing-eyebrow font-semibold text-primary-300',
                isKhmer
                  ? 'text-lg sm:text-xl tracking-normal normal-case max-w-3xl mb-2 leading-snug'
                  : 'text-base uppercase tracking-widest mb-3 leading-normal'
              )}
            >
              {t('landing.eyebrow')}
            </p>
            <h1
              className={clsx(
                'landing-hero-title font-extrabold flex flex-col',
                isKhmer
                  ? 'text-3xl sm:text-4xl lg:text-5xl gap-1 mb-5'
                  : 'text-4xl sm:text-5xl lg:text-6xl gap-2 mb-9'
              )}
            >
              <span className="block landing-hero-line">{t('landing.heroLine1')}</span>
              <span className="block landing-hero-line">
                <span className="text-white">{t('landing.heroLine2')}</span>
                <span className="text-primary-300 ml-1">{t('landing.heroBrand')}</span>
              </span>
            </h1>
            <p
              className={clsx(
                'text-slate-300 mb-8',
                isKhmer ? 'text-xl sm:text-2xl max-w-3xl leading-normal' : 'text-xl max-w-xl leading-relaxed mb-10 sm:mb-12'
              )}
            >
              {t('landing.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link to="/create-account">
                <Button size="lg" className="bg-gradient-to-r from-primary-300 to-primary-400 hover:from-primary-500 hover:to-primary-500 border-0 shadow-xl text-lg px-7">
                  {t('landing.ctaLearn')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/create-account?role=mentor">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-white/5 text-lg px-7">
                  {t('landing.ctaTeach')}
                </Button>
              </Link>
            </div>
            {mentors.length > 0 && (
              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-2">
                  {mentors.slice(0, 4).map((tchr) => (
                    <Avatar key={tchr.id} name={tchr.name} size="sm" className="ring-2 ring-slate-800" />
                  ))}
                </div>
                <p className={clsx('text-slate-300', isKhmer ? 'text-lg sm:text-xl' : 'text-base')}>
                  {t('landing.studentsLearning')}
                </p>
              </div>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
                  <p className={clsx('text-slate-300 mt-1', isKhmer ? 'text-base sm:text-lg' : 'text-sm')}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section
        id="mentors"
        className={clsx(
          'relative py-20 overflow-hidden',
          !LANDING_SECTION_BG_ANIMATION_ENABLED &&
            'bg-gradient-to-br from-primary-50/90 via-white to-primary-100/80'
        )}
      >
        {LANDING_SECTION_BG_ANIMATION_ENABLED && (
          <AnimatedBackground variant="community" intensity="soft" style="both" className="absolute inset-0" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className={clsx('font-bold text-on-glass mb-2', isKhmer ? 'text-3xl sm:text-4xl' : 'text-3xl')}>
                {t('landing.mentorsTitle')}
              </h2>
              <p className={clsx('text-on-glass-muted', isKhmer ? 'text-lg sm:text-xl' : 'text-base')}>
                {t('landing.mentorsSubtitle')}
              </p>
            </div>
            <Link to="/create-account">
              <Button variant="outline" size="md">
                {t('landing.viewAllTeachers')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-5 sm:space-y-6">
            {mentorsLoading && (
              <p className="text-on-glass-muted text-sm">{t('student.loadingMentors')}</p>
            )}
            {!mentorsLoading && mentors.length === 0 && (
              <p className="text-on-glass-muted text-sm">{t('student.noMentors')}</p>
            )}
            {mentors.map((mentor) => (
              <MentorRowCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        {LANDING_SECTION_BG_ANIMATION_ENABLED && (
          <AnimatedBackground variant="cta" intensity="soft" style="both" className="absolute inset-0" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className={clsx('font-extrabold mb-4', isKhmer ? 'text-4xl sm:text-5xl' : 'text-4xl')}>
            {t('landing.ctaTitle')}
          </h2>
          <p className={clsx('text-primary-100 mb-8', isKhmer ? 'text-xl sm:text-2xl' : 'text-lg')}>
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/create-account">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 border-0 shadow-xl font-bold text-lg px-8">
              {t('landing.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className={clsx('mt-8 flex flex-wrap justify-center gap-6 text-primary-100', isKhmer ? 'text-base sm:text-lg' : 'text-sm')}>
            {featureList.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-200 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppFooter variant="full" className="mt-0" />
    </div>
  )
}

export default Landing
