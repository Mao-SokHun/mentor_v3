import { useState } from 'react'
import { HelpCircle, Mail, MessageSquare, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { PageScaffold, PageCard, PageAmbient } from '@/components'
import { useAuth } from '@/hooks'
import { useTranslation } from '@/i18n'
import { localizeHelpCategory, localizeHelpFaq } from '@/constants'
import { usePlatformContent } from '@/contexts/PlatformContentContext'

const HelpSupport = () => {
  const { user } = useAuth()
  const { t, isKhmer } = useTranslation()
  const { helpFaqs, helpCategories } = usePlatformContent()
  const ambientVariant = user?.role === 'mentor' ? 'mentor' : 'ambient'
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <PageAmbient variant={ambientVariant} className={clsx('space-y-6', isKhmer && 'font-khmer')}>
      <div className="max-w-3xl mx-auto w-full space-y-5">
        <PageScaffold title={t('helpPage.title')} subtitle={t('helpPage.subtitle')}>
          <PageCard className="bg-gradient-to-br from-primary-400/90 to-primary-500 text-white border-0">
            <HelpCircle className="w-10 h-10 mb-3 text-primary-100" />
            <h2 className="text-lg font-bold mb-1">{t('helpPage.howCanWeHelp')}</h2>
            <p className="text-sm text-primary-50/95 leading-relaxed">{t('helpPage.heroLead')}</p>
          </PageCard>

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t('helpPage.browseTopics')}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {helpCategories.map((c) => {
                const cat = localizeHelpCategory(c, isKhmer)
                return (
                  <PageCard key={c.label} className="p-4">
                    <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.description}</p>
                  </PageCard>
                )
              })}
            </div>
          </div>

          <PageCard padding={false} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/80">
              <h3 className="font-bold text-slate-800">{t('helpPage.faqTitle')}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {helpFaqs.map((faq, i) => {
                const item = localizeHelpFaq(faq, isKhmer)
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-primary-600 uppercase tracking-wide mb-0.5">
                          {item.section}
                        </p>
                        <p className="text-sm font-semibold text-slate-800">{item.q}</p>
                      </div>
                      <ChevronDown
                        className={clsx(
                          'w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform',
                          openFaq === i && 'rotate-180'
                        )}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed -mt-1">{item.a}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </PageCard>

          <PageCard>
            <h3 className="font-bold text-slate-800 mb-3">{t('helpPage.stillNeedHelp')}</h3>
            <div className="space-y-3">
              <a
                href="mailto:support@rokkru.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t('helpPage.emailSupport')}</p>
                  <p className="text-xs text-slate-500">support@rokkru.com</p>
                </div>
              </a>
              <Link
                to="/messages"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t('helpPage.messageCenter')}</p>
                  <p className="text-xs text-slate-500">{t('helpPage.messageCenterSub')}</p>
                </div>
              </Link>
            </div>
          </PageCard>
        </PageScaffold>
      </div>
    </PageAmbient>
  )
}

export default HelpSupport
