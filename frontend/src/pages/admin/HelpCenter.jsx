import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, HelpCircle, Mail } from 'lucide-react'
import { PageCard } from '@/components'
import EmptyState from '../../components/ui/EmptyState'
import clsx from 'clsx'
import { usePlatformContent } from '@/contexts/PlatformContentContext'
import { localizeHelpCategory, localizeHelpFaq } from '@/constants'
import { useTranslation } from '@/i18n'
import AdminContentShell from '../../components/admin/content/AdminContentShell'
import HelpFaqsEditor from '../../components/admin/content/HelpFaqsEditor'

const HelpContentPreview = ({ faqs, categories, search, onSearchChange, openFaq, onToggleFaq }) => {
  const { t, isKhmer } = useTranslation()
  const filtered = faqs.filter((f) => {
    const item = localizeHelpFaq(f, isKhmer)
    const q = search.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <PageCard variant="brand" className="text-white text-center">
        <HelpCircle className="w-12 h-12 mx-auto mb-3 text-primary-100" />
        <h2 className="text-xl font-bold mb-2">{t('helpPage.howCanWeHelp')}</h2>
        <p className="text-primary-100 text-sm mb-5">{t('helpPage.heroLead')}</p>
        <div className="max-w-md mx-auto flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('adminContent.searchHelp')}
            className="flex-1 outline-none text-slate-700 text-sm placeholder-slate-400 bg-transparent"
          />
        </div>
      </PageCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => {
          const cat = localizeHelpCategory(c, isKhmer)
          return (
            <PageCard key={c.label} className="p-4">
              <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.description}</p>
            </PageCard>
          )
        })}
      </div>

      <PageCard padding={false} className="overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{t('helpPage.faqTitle')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} items</p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title={t('adminContent.noFaqs')} className="py-12" />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((faq, i) => {
              const item = localizeHelpFaq(faq, isKhmer)
              return (
                <div key={`${faq.q}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onToggleFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-primary-500 mb-0.5">{item.section}</p>
                      <p className="text-sm font-semibold text-slate-800">{item.q}</p>
                    </div>
                    <ChevronRight
                      className={clsx(
                        'w-4 h-4 text-slate-400 flex-shrink-0 ml-3 transition-transform',
                        openFaq === i && 'rotate-90'
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <div className="bg-primary-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </PageCard>

      <PageCard>
        <Link
          to="/admin/contact"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
        >
          <Mail className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-slate-800">{t('helpPage.stillNeedHelp')}</span>
        </Link>
      </PageCard>
    </div>
  )
}

const HelpCenter = () => {
  const { t } = useTranslation()
  const { helpFaqs, helpCategories, saveHelp, saving, savedAt } = usePlatformContent()
  const [draftFaqs, setDraftFaqs] = useState(helpFaqs)
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    setDraftFaqs(helpFaqs)
  }, [helpFaqs])

  const handleSave = async () => {
    await saveHelp({ faqs: draftFaqs })
  }

  return (
    <AdminContentShell
      title={t('admin.helpCenter')}
      subtitle={t('adminContent.helpSubtitle')}
      previewHref="/help"
      saving={saving === 'help'}
      savedAt={savedAt}
      onSave={handleSave}
      preview={
        <HelpContentPreview
          faqs={helpFaqs}
          categories={helpCategories}
          search={search}
          onSearchChange={setSearch}
          openFaq={openFaq}
          onToggleFaq={setOpenFaq}
        />
      }
      editor={<HelpFaqsEditor faqs={draftFaqs} onChange={setDraftFaqs} />}
    />
  )
}

export default HelpCenter
