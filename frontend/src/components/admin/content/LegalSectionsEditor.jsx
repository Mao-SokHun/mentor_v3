import { Plus, Trash2, GripVertical } from 'lucide-react'
import Button from '../../ui/Button'

const fieldClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary-300 bg-white'

const LegalSectionsEditor = ({ sections, onChange }) => {
  const update = (index, key, value) => {
    onChange(sections.map((s, i) => (i === index ? { ...s, [key]: value } : s)))
  }

  const addSection = () => {
    onChange([
      ...sections,
      { title: '', titleKm: '', content: '', contentKm: '' },
    ])
  }

  const removeSection = (index) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <GripVertical className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-500">Section {index + 1}</span>
            </div>
            {sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                aria-label="Remove section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Title (EN)</label>
              <input
                value={section.title}
                onChange={(e) => update(index, 'title', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Title (KM)</label>
              <input
                value={section.titleKm}
                onChange={(e) => update(index, 'titleKm', e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Content (EN)</label>
            <textarea
              value={section.content}
              onChange={(e) => update(index, 'content', e.target.value)}
              rows={3}
              className={`${fieldClass} resize-y min-h-[4.5rem]`}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Content (KM)</label>
            <textarea
              value={section.contentKm}
              onChange={(e) => update(index, 'contentKm', e.target.value)}
              rows={3}
              className={`${fieldClass} resize-y min-h-[4.5rem]`}
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addSection}>
        <Plus className="w-4 h-4" />
        Add section
      </Button>
    </div>
  )
}

export default LegalSectionsEditor
