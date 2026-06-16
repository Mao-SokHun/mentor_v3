import { Plus, Trash2 } from 'lucide-react'
import Button from '../../ui/Button'

const fieldClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300 bg-white'

const HelpFaqsEditor = ({ faqs, onChange }) => {
  const update = (index, key, value) => {
    onChange(faqs.map((f, i) => (i === index ? { ...f, [key]: value } : f)))
  }

  const addFaq = () => {
    onChange([
      ...faqs,
      { q: '', qKm: '', a: '', aKm: '', section: 'General', sectionKm: 'ទូទៅ' },
    ])
  }

  const removeFaq = (index) => {
    onChange(faqs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">FAQ {index + 1}</span>
            <button
              type="button"
              onClick={() => removeFaq(index)}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
              aria-label="Remove FAQ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Section (EN)</label>
              <input
                value={faq.section}
                onChange={(e) => update(index, 'section', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Section (KM)</label>
              <input
                value={faq.sectionKm}
                onChange={(e) => update(index, 'sectionKm', e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Question (EN)</label>
              <input
                value={faq.q}
                onChange={(e) => update(index, 'q', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Question (KM)</label>
              <input
                value={faq.qKm}
                onChange={(e) => update(index, 'qKm', e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Answer (EN)</label>
            <textarea
              value={faq.a}
              onChange={(e) => update(index, 'a', e.target.value)}
              rows={2}
              className={`${fieldClass} resize-y`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Answer (KM)</label>
            <textarea
              value={faq.aKm}
              onChange={(e) => update(index, 'aKm', e.target.value)}
              rows={2}
              className={`${fieldClass} resize-y`}
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addFaq}>
        <Plus className="w-4 h-4" />
        Add FAQ
      </Button>
    </div>
  )
}

export default HelpFaqsEditor
