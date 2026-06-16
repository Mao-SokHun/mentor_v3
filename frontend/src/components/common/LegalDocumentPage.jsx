import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import { useAuth } from '@/hooks'
import PublicNavbar from './PublicNavbar'
import AppFooter from './AppFooter'
import PageAmbient from './PageAmbient'
import PageCard from './PageCard'

const CONFIG = {
  terms: {
    relatedKey: 'legal.viewPrivacy',
    relatedTo: '/privacy',
  },
  privacy: {
    relatedKey: 'legal.viewTerms',
    relatedTo: '/terms',
  },
}

const LegalSection = ({ section, index, idPrefix, isKhmer, isLast }) => (
  <section
    id={`${idPrefix}-${index}`}
    className={clsx('scroll-mt-24', !isLast && 'pb-8 mb-8 border-b border-slate-200/70')}
  >
    <div className="flex gap-4">
      <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
          {isKhmer ? section.titleKm : section.title}
        </h2>
        <p className="text-base text-slate-700 leading-relaxed mt-4">
          {isKhmer ? section.contentKm : section.content}
        </p>
      </div>
    </div>
  </section>
)

const LegalDocumentBody = ({ kind, sections }) => {
  const { t, isKhmer } = useTranslation()
  const cfg = CONFIG[kind]
  const idPrefix = kind === 'terms' ? 'legal-ts' : 'legal-ps'

  return (
    <div className="space-y-6">
      <PageCard className="flex items-start gap-3 bg-primary-50/80 border-primary-100/80">
        <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-sm text-primary-800 leading-relaxed">{t('legal.trustNote')}</p>
      </PageCard>

      <PageCard className="p-5 sm:p-7 lg:p-8">
        <div>
          {sections.map((s, i) => (
            <LegalSection
              key={s.title}
              section={s}
              index={i}
              idPrefix={idPrefix}
              isKhmer={isKhmer}
              isLast={i === sections.length - 1}
            />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/80">
          <Link
            to={cfg.relatedTo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
          >
            {t(cfg.relatedKey)}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </PageCard>
    </div>
  )
}

/** Public terms / privacy — navbar + footer, single scroll page */
export const LegalDocumentPublicPage = ({ kind, sections }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <PublicNavbar />
    <main className="flex-1">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        <LegalDocumentBody kind={kind} sections={sections} />
      </div>
    </main>
    <AppFooter variant="full" />
  </div>
)

/** In-app terms / privacy inside PageAmbient */
export const LegalDocumentInAppPage = ({ kind, sections }) => {
  const { user } = useAuth()
  const ambientVariant = user?.role === 'mentor' ? 'mentor' : 'ambient'

  return (
    <PageAmbient variant={ambientVariant} className="space-y-6">
      <div className="max-w-3xl mx-auto w-full">
        <LegalDocumentBody kind={kind} sections={sections} />
      </div>
    </PageAmbient>
  )
}

export default LegalDocumentBody
