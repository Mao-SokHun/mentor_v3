import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Lock, Globe, Hash, Image, ArrowLeft, Check } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { PageScaffold, PageCard } from '@/components'
import clsx from 'clsx'

import { COMMUNITY_CATEGORIES } from '@/constants'

const categories = COMMUNITY_CATEGORIES

const colorOptions = [
  { label: 'Rose', value: 'from-primary-400 to-primary-500' },
  { label: 'Emerald', value: 'from-emerald-500 to-teal-600' },
  { label: 'Sky', value: 'from-sky-500 to-blue-600' },
  { label: 'Amber', value: 'from-amber-500 to-orange-500' },
  { label: 'Violet', value: 'from-violet-500 to-primary-500' },
]

const iconOptions = ['📐', '📊', '🗣️', '⚛️', '💻', '🔬', '📝', '🎨', '📚', '🏆', '🌍', '💡']

const CreateCommunity = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0])
  const [privacy, setPrivacy] = useState('public')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value)
  const [selectedIcon, setSelectedIcon] = useState('📐')
  const [step, setStep] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/community')
  }

  const preview = {
    name: name || 'Community Name',
    description: description || 'Your community description will appear here...',
    color: selectedColor,
    icon: selectedIcon,
    category,
  }

  const stepLabels = ['Basic Info', 'Customize', 'Preview']

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageScaffold
        title="Create a Community"
        subtitle="Build a space for learners who share your passion"
        action={
          <button type="button" onClick={() => navigate('/community')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
        }
    >
        <div className="flex items-center gap-3">
          {stepLabels.map((label, idx) => {
            const s = idx + 1
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <span
                  className={clsx(
                    'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0',
                    step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </span>
                <span className="text-xs font-medium text-slate-500 hidden sm:block">{label}</span>
                {s < 3 && <span className={clsx('flex-1 h-0.5 rounded-full ml-1', step > s ? 'bg-emerald-400' : 'bg-slate-200')} />}
              </div>
            )
          })}
        </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <PageCard className="lg:col-span-3">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Basic Information</h2>
              <Input label="Community Name" placeholder="e.g. Mathematics Hub" value={name} onChange={(e) => setName(e.target.value)} leftIcon={<Hash className="w-4 h-4" />} required />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={4} placeholder="What is this community about?" value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300" />
                <p className="text-xs text-slate-400 mt-1">{description.length}/500 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button key={c} type="button" onClick={() => setCategory(c)}
                      className={clsx('px-4 py-2 rounded-xl text-sm font-medium border transition-all', category === c ? 'bg-primary-500 text-white border-primary-400' : 'border-slate-200 text-slate-600 hover:border-primary-200')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Privacy</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can join and see posts' },
                    { value: 'private', icon: Lock, label: 'Private', desc: 'Only members can see content' },
                  ].map((p) => (
                    <button key={p.value} type="button" onClick={() => setPrivacy(p.value)}
                      className={clsx('flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all', privacy === p.value ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-200')}>
                      <p.icon className={clsx('w-5 h-5 mt-0.5', privacy === p.value ? 'text-primary-600' : 'text-slate-400')} />
                      <div>
                        <p className={clsx('text-sm font-semibold', privacy === p.value ? 'text-primary-700' : 'text-slate-700')}>{p.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-slate-800">Customize your community</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Choose an Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button key={icon} type="button" onClick={() => setSelectedIcon(icon)}
                      className={clsx('w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all', selectedIcon === icon ? 'bg-primary-500 shadow-md scale-110' : 'bg-slate-100 hover:bg-primary-100')}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Color Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((c) => (
                    <button key={c.value} type="button" onClick={() => setSelectedColor(c.value)}
                      className={clsx('relative h-16 rounded-xl bg-gradient-to-br transition-all', c.value, selectedColor === c.value && 'ring-2 ring-offset-2 ring-primary-300')}>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5"><Image className="w-4 h-4 inline mr-1.5 text-slate-400" />Cover Image (optional)</label>
                <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 hover:border-primary-200 cursor-pointer">
                  <Image className="w-5 h-5 text-slate-300" />
                  <p className="text-sm text-slate-400">Click or drag to upload</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Review & Create</h2>
              <p className="text-sm text-slate-500">Here&apos;s how your community will look. You can edit settings later.</p>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className={clsx('w-full h-20 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center text-4xl', preview.color)}>{preview.icon}</div>
                <h3 className="font-bold text-slate-800 text-lg">{preview.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{preview.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1 member</span>
                  <span className="flex items-center gap-1">{privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {privacy}</span>
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{category}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
            {step > 1 ? <Button variant="ghost" size="md" onClick={() => setStep((s) => s - 1)}>Back</Button> : <span />}
            {step < 3 ? (
              <Button variant="primary" size="md" onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !name.trim()}>Continue</Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleSubmit}><Users className="w-4 h-4" />Create Community</Button>
            )}
          </div>
        </PageCard>

        <PageCard className="lg:col-span-2 sticky top-20 h-fit">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Live Preview</p>
          <div className={clsx('rounded-xl p-5 bg-gradient-to-br text-white mb-4', preview.color)}>
            <div className="text-4xl mb-3">{preview.icon}</div>
            <h3 className="font-bold text-lg">{preview.name}</h3>
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{preview.description}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{category}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Privacy</span><span className="text-xs font-medium">{privacy}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Members</span><span className="text-xs font-medium">1 (you)</span></div>
          </div>
        </PageCard>
      </div>
    </PageScaffold>
    </div>
  )
}

export default CreateCommunity
