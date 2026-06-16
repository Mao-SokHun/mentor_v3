import { useState, useEffect } from 'react'
import { X, MapPin, Image, Smile, Link2, ChevronRight, Pencil } from 'lucide-react'
import clsx from 'clsx'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import CommunityPicker from './CommunityPicker'
import { findCommunityById } from '@/constants'
import { useAuth } from '@/hooks'
import { useTranslation } from '@/i18n'

const StepPill = ({ n, label, active, done }) => (
  <div
    className={clsx(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-colors',
      active && 'bg-primary-500 text-white shadow-sm',
      done && !active && 'bg-primary-100 text-primary-700',
      !active && !done && 'bg-slate-100 text-slate-500'
    )}
  >
    <span
      className={clsx(
        'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
        active && 'bg-white/25 text-white',
        done && !active && 'bg-primary-500 text-white',
        !active && !done && 'bg-white text-slate-500'
      )}
    >
      {done && !active ? '✓' : n}
    </span>
    <span>{label}</span>
  </div>
)

const CreatePostModal = ({ open, onClose }) => {
  const { t, labelFor } = useTranslation()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [browseCommunities, setBrowseCommunities] = useState(true)

  const selectedCommunity = findCommunityById(selected)
  const displayName = user?.name || t('auth.student')

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelected(null)
      setDescription('')
      setLocation('')
      setHashtag('')
      setBrowseCommunities(true)
      return undefined
    }

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const handleContinue = () => {
    if (selected) setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setDescription('')
    setLocation('')
    setHashtag('')
  }

  const handleShare = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <div
        className="create-post-overlay absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="create-post-sheet relative z-10 w-full max-w-xl flex flex-col overflow-hidden rounded-2xl border border-primary-100/70 bg-white shadow-[0_24px_64px_rgba(143,85,98,0.18)] max-h-[min(85vh,560px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
      >
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 pt-4 pb-2.5 border-b border-primary-100/50 bg-gradient-to-r from-primary-50/50 via-white to-white rounded-t-2xl">
          <div className="inline-flex items-center gap-1.5 p-0.5 rounded-lg bg-primary-50/80 border border-primary-100/60">
            <StepPill
              n={1}
              label={t('communityPost.community')}
              active={step === 1}
              done={step > 1}
            />
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <StepPill n={2} label={t('communityPost.post')} active={step === 2} done={false} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
            aria-label={t('communityPost.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0 bg-white">
            <div className="flex-shrink-0 px-4 pt-3 pb-2">
              <h2 id="create-post-title" className="text-sm font-bold text-slate-800">
                {t('communityPost.chooseCommunity')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{t('communityPost.selectCommunityShort')}</p>
            </div>

            <div className="flex-1 min-h-0 px-4 pb-2 overflow-hidden flex flex-col">
              <CommunityPicker
                fill
                variant="sheet"
                mode="select"
                value={selected}
                onChange={setSelected}
                browseOpen={browseCommunities}
                onBrowseOpenChange={setBrowseCommunities}
              />
            </div>

            <div className="flex-shrink-0 px-4 py-3.5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              {selectedCommunity && !browseCommunities && (
                <p className="text-[11px] text-slate-500 truncate">
                  {t('communityPost.readyToPost', { name: selectedCommunity.name })}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                {selectedCommunity && !browseCommunities ? (
                  <Button
                    variant="ghost"
                    size="md"
                    type="button"
                    className="text-primary-600 hover:text-primary-800"
                    onClick={() => setBrowseCommunities(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1.5" />
                    {t('communityPost.changeCommunity')}
                  </Button>
                ) : (
                  <span className="flex-shrink-0" />
                )}
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto sm:min-w-[9rem] ml-auto"
                  onClick={handleContinue}
                  disabled={!selected}
                >
                  {t('communityPost.continue')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && selectedCommunity && (
          <div className="flex flex-col flex-1 min-h-0 create-post-step-panel-in bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <div
                  className={clsx(
                    'w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br flex-shrink-0 shadow-sm',
                    selectedCommunity.badgeGradient
                  )}
                >
                  {selectedCommunity.short}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-primary-600">{t('communityPost.postingTo')}</p>
                  <p className="font-bold text-sm text-slate-800 truncate">{selectedCommunity.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{labelFor(selectedCommunity.label)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 whitespace-nowrap"
                >
                  {t('communityPost.changeCommunity')}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name={displayName} size="sm" />
                <div>
                  <p className="font-semibold text-sm text-slate-800">{displayName}</p>
                  <p className="text-xs text-slate-500">
                    {user?.role === 'mentor' ? t('auth.mentor') : t('auth.student')}
                  </p>
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={t('communityPost.placeholder')}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none"
                autoFocus
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-slate-200/90 bg-slate-50/60">
                  <span className="text-primary-600 text-sm font-bold">#</span>
                  <input
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                    placeholder={t('communityPost.hashtag')}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-slate-200/90 bg-slate-50/60">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('communityPost.location')}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500 mr-1">{t('communityPost.addToPost')}</span>
                {[Image, Link2, Smile, MapPin].map((Icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="p-2 rounded-lg hover:bg-primary-50 text-slate-500 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-white/90 flex items-center justify-between gap-3">
              <Button variant="ghost" size="md" type="button" onClick={handleBack}>
                {t('communityPost.back')}
              </Button>
              <Button variant="primary" size="md" onClick={handleShare} disabled={!description.trim()}>
                {t('communityPost.sharePost')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePostModal
