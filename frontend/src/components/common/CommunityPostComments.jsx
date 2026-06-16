import { useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useTranslation } from '@/i18n'

const CommunityPostComments = ({
  comments = [],
  draft = '',
  onDraftChange,
  onSubmit,
  autoFocus = false,
}) => {
  const { t } = useTranslation()
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    onSubmit?.(draft.trim())
  }

  return (
    <div className="border-t border-white/50 bg-white/20">
      <div className="px-4 sm:px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">{t('communityFeed.noComments')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <Avatar name={comment.author} size="xs" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 rounded-xl bg-white/50 px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-800">{comment.author}</span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{comment.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border-t border-white/40 bg-white/10"
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => onDraftChange?.(e.target.value)}
          placeholder={t('communityFeed.writeComment')}
          className="flex-1 min-w-0 rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200/80"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 transition-colors flex-shrink-0"
          aria-label={t('communityFeed.postComment')}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}

export default CommunityPostComments
