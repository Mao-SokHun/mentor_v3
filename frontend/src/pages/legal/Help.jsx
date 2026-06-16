import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Mail, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { PublicNavbar, AppFooter, PageScaffold, PageCard } from '@/components'
import { helpCategories, localizeHelpCategory, localizeHelpFaq } from '@/constants'
import { usePlatformContent } from '@/contexts/PlatformContentContext'
import { useTranslation } from '@/i18n'

const Help = () => {
  const { t, isKhmer } = useTranslation()
  const { helpFaqs, helpCategories: categories } = usePlatformContent()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className={clsx('min-h-screen bg-slate-50 flex flex-col', isKhmer && 'font-khmer')}>
      <PublicNavbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t('helpPage.back')}
        </Link>
        <PageScaffold title={t('helpPage.title')} subtitle={t('helpPage.subtitle')}>
          <div className="mt-6 space-y-5">
            <PageCard className="bg-gradient-to-br from-primary-400 to-primary-500 text-white border-0">
              <HelpCircle className="w-10 h-10 mb-2 text-primary-100" />
              <p className="text-sm text-primary-50">{t('helpPage.heroText')}</p>
            </PageCard>

            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((c) => {
                const cat = localizeHelpCategory(c, isKhmer)
                return (
                  <PageCard key={c.label} className="p-4">
                    <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{cat.description}</p>
                  </PageCard>
                )
              })}
            </div>

            <PageCard padding={false} className="overflow-hidden">
              <div className="divide-y divide-slate-100">
                {helpFaqs.map((faq, i) => {
                  const item = localizeHelpFaq(faq, isKhmer)
                  return (
                    <div key={faq.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.q}</p>
                        </div>
                        <ChevronDown
                          className={clsx(
                            'w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-1',
                            openFaq === i && 'rotate-180'
                          )}
                        />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-slate-700 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </PageCard>

            <PageCard>
              <a
                href="mailto:support@rokkru.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Mail className="w-4 h-4" />
                support@rokkru.com
              </a>
            </PageCard>
          </div>
        </PageScaffold>
      </main>
      <AppFooter variant="full" />
    </div>
  )
}

export default Help
