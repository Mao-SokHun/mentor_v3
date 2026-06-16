import { useState } from 'react'
import clsx from 'clsx'
import { PageCard } from '@/components'
import { useTranslation } from '@/i18n'

const LegalContentPreview = ({ sections }) => {
  const { isKhmer } = useTranslation()
  const [active, setActive] = useState(0)

  return (
    <div className="grid lg:grid-cols-4 gap-5">
      <PageCard className="lg:col-span-1 h-fit lg:sticky lg:top-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Contents</p>
        <ul className="space-y-0.5">
          {sections.map((s, i) => (
            <li key={`${s.title}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setActive(i)
                  document.getElementById(`legal-preview-${i}`)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-xl text-sm transition-all truncate',
                  active === i
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {isKhmer ? s.titleKm : s.title}
              </button>
            </li>
          ))}
        </ul>
      </PageCard>

      <PageCard className="lg:col-span-3">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={`${s.title}-${i}`} id={`legal-preview-${i}`} className="scroll-mt-6">
              <h2 className="text-base font-bold text-slate-800 mb-3">
                {isKhmer ? s.titleKm : s.title}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {isKhmer ? s.contentKm : s.content}
              </p>
            </section>
          ))}
        </div>
      </PageCard>
    </div>
  )
}

export default LegalContentPreview
